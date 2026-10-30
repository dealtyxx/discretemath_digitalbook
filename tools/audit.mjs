#!/usr/bin/env node
/**
 * 全书版面、MathJax、资源回归。先在仓库根目录启动静态服务器。
 * node tools/audit.mjs [章号|all] [--resume]
 * BASE 指定服务器；AUDIT_PROTOCOL=file 直接检查本地文件（默认 HTTP）。
 * AUDIT_OUTPUT 指定报告根目录，HTTP 写入 book/，file 写入 book-file/。
 * 每 50 页及每章结束保存 checkpoint.json；--resume 仅复用源码 hash 一致的成功项。
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOCOL = (process.env.AUDIT_PROTOCOL || 'http').toLowerCase();
if (!['http', 'file'].includes(PROTOCOL)) throw new Error('AUDIT_PROTOCOL 仅支持 http 或 file');
const BASE = PROTOCOL === 'file' ? pathToFileURL(ROOT + path.sep).href : (process.env.BASE || 'http://127.0.0.1:8080/').replace(/\/?$/, '/');
const output = path.join(process.env.AUDIT_OUTPUT ? path.resolve(process.env.AUDIT_OUTPUT) : path.join(ROOT, 'artifacts'), PROTOCOL === 'file' ? 'book-file' : 'book');
const CHECKPOINT_VERSION = 1;
const BATCH_SIZE = 50;
const MATH_TIMEOUT = Number(process.env.MATH_TIMEOUT_MS) > 0 ? Number(process.env.MATH_TIMEOUT_MS) : 60000;
const args = process.argv.slice(2);
const resume = args.includes('--resume');
const which = args.find(arg => !arg.startsWith('--')) || 'all';
const files = fs.readdirSync(ROOT).filter(file => /第\d+章.*\.body\.html$/.test(file))
  .sort((a, b) => +a.match(/第(\d+)章/)[1] - +b.match(/第(\d+)章/)[1]);
const list = which === 'all' ? files : files.filter(file => file.includes(`第${which}章`));
if (!list.length) throw new Error(`未找到要审查的章节：${which}`);
fs.mkdirSync(output, { recursive: true });
const checkpointPath = path.join(output, 'checkpoint.json');

function hashPaths(hash, relative) {
  const absolute = path.join(ROOT, relative);
  hash.update(relative.replaceAll('\\', '/'));
  if (!fs.existsSync(absolute)) { hash.update(':missing'); return; }
  if (fs.statSync(absolute).isDirectory()) {
    for (const name of fs.readdirSync(absolute).sort()) hashPaths(hash, path.join(relative, name));
  } else hash.update(fs.readFileSync(absolute));
}

function sharedHash() {
  const hash = createHash('sha256').update(PROTOCOL).update(BASE).update(String(MATH_TIMEOUT));
  for (const relative of ['tools/audit.mjs', 'assets/css', 'assets/js', 'assets/fonts', 'assets/mathjax', 'assets/@mathjax']) hashPaths(hash, relative);
  return hash.digest('hex');
}

const shared = sharedHash();
const chapterHash = file => createHash('sha256').update(shared).update(fs.readFileSync(path.join(ROOT, file))).digest('hex');
let checkpoint = { version: CHECKPOINT_VERSION, protocol: PROTOCOL, base: BASE, batchSize: BATCH_SIZE, chapters: {} };
if (resume && fs.existsSync(checkpointPath)) {
  try {
    const saved = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
    if (saved.version === CHECKPOINT_VERSION && saved.protocol === PROTOCOL && saved.base === BASE && saved.chapters && typeof saved.chapters === 'object') checkpoint = saved;
    else console.log('检查点格式或服务器不同，本轮重新检查。');
  } catch { console.log('检查点无法读取，本轮重新检查。'); }
}

function writeJson(file, value) {
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2));
  fs.renameSync(temporary, file);
}

function saveCheckpoint() {
  checkpoint.updatedAt = new Date().toISOString();
  writeJson(checkpointPath, checkpoint);
}

function chapterReport(file, item, cachedPages = 0) {
  const pages = item.pages.filter(Boolean);
  return {
    file, sourceHash: item.sourceHash, pageCount: item.pageCount, checkedPages: pages.length, cachedPages,
    issuePages: pages.filter(page => page.issues.length).length,
    errors: item.errors, pages, complete: item.complete,
    pass: item.complete && pages.length === item.pageCount && !item.errors.length && pages.every(page => !page.issues.length),
  };
}

const reports = [];
function saveReport() {
  writeJson(path.join(output, 'report.json'), {
    generatedAt: new Date().toISOString(), protocol: PROTOCOL, base: BASE, viewport: { width: 1920, height: 1080 },
    summary: {
      chapters: reports.length, pageCount: reports.reduce((sum, item) => sum + item.pageCount, 0),
      issuePages: reports.reduce((sum, item) => sum + item.issuePages, 0),
      errorCount: reports.reduce((sum, item) => sum + item.errors.length, 0),
      pass: reports.length === list.length && reports.every(item => item.pass),
    },
    chapters: reports,
  });
}

const browser = await chromium.launch({ headless: true });
try {
  for (const file of list) {
    const sourceHash = chapterHash(file);
    const saved = checkpoint.chapters[file];
    const matching = resume && saved?.sourceHash === sourceHash && Array.isArray(saved.pages) && Array.isArray(saved.errors) && !saved.errors.length;
    if (matching && saved.complete && saved.errors?.length === 0 && saved.pages.length === saved.pageCount && saved.pages.every(item => item && Array.isArray(item.issues) && !item.issues.length)) {
      reports.push(chapterReport(file, saved, saved.pageCount));
      console.log(`✓ ${file}  ${saved.pageCount} 页复用相同源码的成功检查点`);
      saveReport();
      continue;
    }
    const item = {
      sourceHash, pageCount: 0, pages: matching ? saved.pages : [], errors: [], complete: false,
    };
    checkpoint.chapters[file] = item;
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce', offline: PROTOCOL === 'file' });
    const page = await context.newPage();
    let cachedPages = 0;
    let processed = 0;
    let stalled = false;
    page.on('pageerror', error => item.errors.push(`pageerror: ${String(error).slice(0, 240)}`));
    page.on('console', message => { if (message.type() === 'error') item.errors.push(`console: ${message.text().slice(0, 240)}`); });
    page.on('response', response => {
      if (response.status() >= 400 && !/favicon/.test(response.url())) item.errors.push(`${response.status()} ${response.url().slice(-180)}`);
    });
    page.on('requestfailed', request => {
      const reason = request.failure()?.errorText || '未知错误';
      if (reason !== 'net::ERR_ABORTED') item.errors.push(`resource: ${reason} ${request.url().slice(-180)}`);
    });
    if (PROTOCOL === 'file') page.on('request', request => {
      if (/^https?:/.test(request.url())) item.errors.push(`离线页面请求外网：${request.url().slice(-180)}`);
    });
    await page.addInitScript(() => { try { localStorage.setItem('tb-hint-seen', '1'); } catch { /* 存储不影响本轮版面检查。 */ } });
    try {
      await page.goto(PROTOCOL === 'file' ? pathToFileURL(path.join(ROOT, file)).href : BASE + encodeURI(file), { waitUntil: 'load', timeout: 60000 });
      item.pageCount = await page.locator('.slide').count();
      if (!item.pageCount) throw new Error('未找到教材页面');
      item.pages.length = item.pageCount;
      try {
        await page.waitForFunction(() => document.documentElement.classList.contains('mathjax-ready') || document.documentElement.classList.contains('mj-fail'), null, { timeout: MATH_TIMEOUT });
      } catch { item.errors.push('等待 MathJax 引擎就绪超时'); }
      const mathReady = await page.evaluate(() => document.documentElement.classList.contains('mathjax-ready') && typeof window.MathJax?.typesetPromise === 'function');
      if (!mathReady) item.errors.push('MathJax 未就绪，含公式页面不能判为通过');
      await page.addStyleTag({ content: '.slide,.anim-item{transition:none!important;animation:none!important}' });
      for (let index = 0; index < item.pageCount; index++) {
        const previous = item.pages[index];
        if (matching && previous && Array.isArray(previous.issues) && !previous.issues.length) { cachedPages++; continue; }
        await page.evaluate(index => window.__deckGoTo(index), index);
        let timedOut = false;
        const hasMath = await page.locator('.slide').nth(index).locator('.math-inline-source,.mathjax-display-source').count() > 0;
        if (hasMath && mathReady && !stalled) {
          try {
            await page.waitForFunction(index => {
              const slide = document.querySelectorAll('.slide')[index];
              return slide && slide.getAttribute('data-mj') !== 'pending' && !slide.hasAttribute('data-mj-run');
            }, index, { timeout: MATH_TIMEOUT });
          } catch { timedOut = true; stalled = true; }
        }
        const result = await page.evaluate(async ({ index, mathReady, timedOut, stalled }) => {
          // 当前页启用后才可能请求新的字体分片，必须等替换完成再测量。
          await document.fonts.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const slide = document.querySelectorAll('.slide')[index];
          const issues = [];
          const mathState = slide.getAttribute('data-mj');
          const formulas = slide.querySelectorAll('.math-inline-source,.mathjax-display-source');
          if (!slide.classList.contains('active')) issues.push('目标页未成为当前页');
          if (formulas.length && (!mathReady || mathState !== 'ok' || slide.hasAttribute('data-mj-run'))) {
            issues.push(`公式未完成排版（状态 ${mathState || '未标记'}${timedOut || (stalled && mathState === 'pending') ? '，等待超时' : ''}）`);
          }
          const contentRoots = [...slide.children].filter(element => !element.matches('.chrome,.foot,script,style'));
          const foot = slide.querySelector('.foot'), chrome = slide.querySelector('.chrome');
          for (const root of contentRoots) {
            if (!root.matches('pre') && root.scrollHeight - root.clientHeight > 3) {
              issues.push(`内容溢出 ${root.className || root.tagName} +${root.scrollHeight - root.clientHeight}`);
            }
          }
          function hiddenReason(element) {
            let opacity = 1;
            for (let parent = element; parent && parent !== slide.parentElement; parent = parent.parentElement) {
              const style = getComputedStyle(parent);
              if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.contentVisibility === 'hidden') return `${parent.tagName}: ${style.display}/${style.visibility}/${style.contentVisibility}`;
              opacity *= Number(style.opacity);
              if (opacity <= 0.01) return `${parent.tagName}: opacity=${opacity}`;
            }
            return null;
          }
          const hiddenContent = [];
          const requiredContent = new Set([...contentRoots, ...slide.querySelectorAll('.anim-item')]);
          for (const element of requiredContent) {
            if (!element.textContent.trim() || element.closest('mjx-assistive-mml,.chrome,.foot,pre')) continue;
            const reason = hiddenReason(element);
            if (reason) hiddenContent.push(`${element.tagName}.${element.className}: ${reason}`);
          }
          if (hiddenContent.length) issues.push(`正文不可见 ${hiddenContent.slice(0, 3).join('; ')}`);
          let hiddenFormulas = 0;
          formulas.forEach(formula => { if (hiddenReason(formula)) hiddenFormulas++; });
          if (hiddenFormulas) issues.push(`公式实际不可见 ${hiddenFormulas} 处`);
          let visibleTextChars = 0;
          for (const root of contentRoots) {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
              const node = walker.currentNode, parent = node.parentElement;
              if (!node.textContent.trim() || parent.closest('mjx-assistive-mml,script,style,.tb-copy,.tb-star,svg defs')) continue;
              if (!hiddenReason(parent) && parent.getClientRects().length) visibleTextChars += node.textContent.trim().length;
            }
          }
          const hasVisibleMedia = contentRoots.some(root => [root, ...root.querySelectorAll('svg,img,video,canvas')].some(element => {
            if (!element.matches('svg,img,video,canvas') || hiddenReason(element)) return false;
            const bounds = element.getBoundingClientRect();
            return bounds.width > 0 && bounds.height > 0;
          }));
          if (!visibleTextChars && !hasVisibleMedia) issues.push('当前页无可见正文或图像');
          let maxBottom = 0, minTop = 1e9;
          slide.querySelectorAll('*').forEach(element => {
            if (element.closest('.chrome,.foot,mjx-assistive-mml')) return;
            const pre = element.closest('pre');
            if (pre && pre !== element) return;
            const style = getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden') return;
            const bounds = element.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;
            maxBottom = Math.max(maxBottom, bounds.bottom);
            minTop = Math.min(minTop, bounds.top);
            if (bounds.right > innerWidth + 2 || bounds.left < -2) issues.push(`横向越界 ${element.tagName}`);
          });
          if (foot && maxBottom > foot.getBoundingClientRect().top + 2) issues.push('与页脚重叠');
          if (chrome && minTop < chrome.getBoundingClientRect().bottom - 2) issues.push('与页眉重叠');
          if (mathState === 'error' || slide.querySelector('mjx-merror,[data-mjx-error],[data-mj="error"]')) issues.push('公式渲染错误');
          const text = contentRoots.map(root => {
            const clone = root.cloneNode(true);
            clone.querySelectorAll('mjx-container,mjx-assistive-mml,script,style').forEach(node => node.remove());
            return clone.textContent;
          }).join(' ');
          if (/\\\(|\\\)|\\\[|\\\]/.test(text)) issues.push('残留 TeX 定界符');
          return {
            page: index + 1, source: slide.getAttribute('data-source') || '', formulaCount: formulas.length, mathState,
            visibility: { visibleTextChars, hiddenContentCount: hiddenContent.length, hiddenFormulas },
            issues: [...new Set(issues)],
          };
        }, { index, mathReady, timedOut, stalled });
        item.pages[index] = { ...result, checkedAt: new Date().toISOString() };
        processed++;
        if (processed % BATCH_SIZE === 0) {
          saveCheckpoint();
          console.log(`  ${file}：已检查 ${index + 1}/${item.pageCount} 页，检查点已保存`);
        }
      }
      item.complete = true;
      if (chapterHash(file) !== sourceHash || sharedHash() !== shared) {
        item.errors.push('审查期间源码发生变化，请重新运行以确认当前版本');
        item.complete = false;
      }
    } catch (error) { item.errors.push(`audit: ${error.message}`); }
    finally { await context.close(); }
    item.errors = [...new Set(item.errors)];
    saveCheckpoint();
    const report = chapterReport(file, item, cachedPages);
    reports.push(report);
    console.log(`${report.pass ? '✓' : '✗'} ${file}  ${report.checkedPages}/${report.pageCount} 页，${report.issuePages} 页有问题，${report.errors.length} 条报错${cachedPages ? `，复用 ${cachedPages} 页` : ''}`);
    report.pages.filter(item => item.issues.length).forEach(item => console.log(`   P${item.page} ${item.source}: ${item.issues.join('; ')}`));
    report.errors.forEach(error => console.log(`   ! ${error}`));
    saveReport();
  }
} finally { await browser.close(); }
console.log(`报告：${path.join(output, 'report.json')}`);
process.exit(reports.length === list.length && reports.every(item => item.pass) ? 0 : 1);
