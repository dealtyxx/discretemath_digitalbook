#!/usr/bin/env node
/**
 * 交互实验室全章冒烟、控制台、响应式与可访问性检查。
 * node tools/audit-labs.mjs [--resume]
 * AUDIT_OUTPUT 指定报告根目录；HTTP 写入 labs/，AUDIT_PROTOCOL=file 写入 labs-file/。
 * --resume 只复用源代码、构建产物及检查脚本 hash 一致的成功场景。
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOCOL = process.env.AUDIT_PROTOCOL || 'http';
if (!['http', 'file'].includes(PROTOCOL)) throw new Error('AUDIT_PROTOCOL 仅支持 http 或 file');
const BASE = PROTOCOL === 'file' ? pathToFileURL(path.join(ROOT, 'lab', 'index.html')).href : (process.env.BASE || 'http://127.0.0.1:8080/').replace(/\/?$/, '/');
function labUrl(chapter) {
  const url = new URL(PROTOCOL === 'file' ? BASE : `${BASE}lab/index.html`);
  url.searchParams.set('qbsc', 'system');
  url.searchParams.set('chapter', String(chapter));
  return url.href;
}
const output = path.join(process.env.AUDIT_OUTPUT ? path.resolve(process.env.AUDIT_OUTPUT) : path.join(ROOT, 'artifacts'), PROTOCOL === 'file' ? 'labs-file' : 'labs');
const resume = process.argv.includes('--resume');
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
function getSourceHash() {
  const hash = createHash('sha256').update(PROTOCOL).update(BASE);
  for (const relative of ['tools/audit-labs.mjs', 'tools/build-lab.mjs', 'interactive/src', 'interactive/index.html', 'interactive/offline-entry.ts', 'interactive/tsconfig.json', 'vite.config.ts', 'package.json', 'package-lock.json', 'lab', 'assets/fonts', 'assets/favicon.svg']) hashPaths(hash, relative);
  return hash.digest('hex');
}
const sourceHash = getSourceHash();
let checkpoint = { version: 1, protocol: PROTOCOL, base: BASE, sourceHash, items: {} };
if (resume && fs.existsSync(checkpointPath)) {
  try {
    const saved = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
    if (saved.version === 1 && saved.protocol === PROTOCOL && saved.base === BASE && saved.sourceHash === sourceHash && saved.items && typeof saved.items === 'object') checkpoint = saved;
    else console.log('源码或构建已变化，旧检查点失效，重新检查全部场景。');
  } catch { console.log('检查点无法读取，重新检查全部场景。'); }
}
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-webgl'] });
const report = [];
const successful = item => item && Array.isArray(item.errors) && !item.errors.length && Array.isArray(item.checks) && item.checks.length > 0 && item.checks.every(check => check.pass);
function saveCheckpoint(key, item) {
  checkpoint.items[key] = item;
  checkpoint.updatedAt = new Date().toISOString();
  for (const [file, value] of [[checkpointPath, checkpoint], [path.join(output, 'report.json'), report]]) {
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 2));
    fs.renameSync(`${file}.tmp`, file);
  }
}

async function experimentCount(page, chapter) {
  return page.evaluate(chapterId => {
    const saved = JSON.parse(window.localStorage.getItem('dm-interactive-learning-v2') || '{}');
    return saved.state?.progress?.[chapterId]?.experiments ?? 0;
  }, chapter);
}

async function settleScene(page) {
  await page.evaluate(() => new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }));
}

async function prepareScreenshot(page) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await settleScene(page);
}

async function imageDistance(page, left, right) {
  return page.evaluate(async ({ left, right }) => {
    const readPixels = async base64 => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, canvas.width, canvas.height);
    };
    const [a, b] = await Promise.all([readPixels(left), readPixels(right)]);
    if (a.width !== b.width || a.height !== b.height) return Number.POSITIVE_INFINITY;
    let difference = 0;
    for (let index = 0; index < a.data.length; index += 4) {
      difference += (Math.abs(a.data[index] - b.data[index])
        + Math.abs(a.data[index + 1] - b.data[index + 1])
        + Math.abs(a.data[index + 2] - b.data[index + 2])) / 3;
    }
    return difference / (a.width * a.height);
  }, { left: left.toString('base64'), right: right.toString('base64') });
}

for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', deviceScaleFactor: 1, offline: PROTOCOL === 'file' });
  for (let chapter = 1; chapter <= 11; chapter++) {
    const key = `${viewport.name}:${chapter}`;
    const saved = checkpoint.items[key];
    if (resume && successful(saved)) {
      report.push({ ...saved, resumed: true });
      console.log(`✓ 第${chapter}章 ${viewport.name}: 复用相同源码的成功检查点`);
      continue;
    }
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    if (PROTOCOL === 'file') page.on('request', request => { if (/^https?:/.test(request.url())) errors.push(`file 模式不应请求网络：${request.url()}`); });
    const item = { chapter, viewport: viewport.name, protocol: PROTOCOL, sourceHash, checkedAt: new Date().toISOString(), errors, checks: [] };
    try {
      await page.goto(labUrl(chapter), { waitUntil: 'networkidle', timeout: 60000 });
      await page.locator('.chapter-content').waitFor({ timeout: 30000 });
      await page.locator('.lab-loading').waitFor({ state: 'detached', timeout: 30000 });
      item.checks.push({ name: 'page-identity', pass: new URL(page.url()).searchParams.get('chapter') === String(chapter) && (await page.title()).includes(`第${chapter}章`) });
      item.checks.push({ name: 'chapter-title', pass: (await page.locator('.chapter-hero h1').textContent())?.trim().length > 0 });
      item.checks.push({ name: 'lab-rendered', pass: await page.locator('.chapter-content button').count() > 0 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      item.checks.push({ name: 'no-horizontal-overflow', pass: overflow <= 2, detail: `${overflow}px` });
      const unnamed = await page.locator('button').evaluateAll(buttons => buttons.filter(button => {
        const text = (button.textContent || '').trim();
        return !text && !button.getAttribute('aria-label') && !button.getAttribute('title');
      }).length);
      item.checks.push({ name: 'buttons-have-names', pass: unnamed === 0, detail: `${unnamed} unnamed` });
      const formulaSemantics = await page.locator('.formula').evaluateAll(formulas => ({
        total: formulas.length,
        missing: formulas.filter(formula => !formula.querySelector('.katex-mathml math')).length,
      }));
      item.checks.push({
        name: 'formula-mathml-semantics',
        pass: formulaSemantics.total > 0 && formulaSemantics.missing === 0,
        detail: `${formulaSemantics.missing}/${formulaSemantics.total} missing MathML`,
      });
      item.checks.push({ name: 'no-formula-render-errors', pass: await page.locator('.katex-error').count() === 0 });
      if (viewport.name === 'desktop') {
        await page.evaluate(() => document.fonts.ready);
        await settleScene(page);
        const sceneLabelsBeforeMode = chapter === 2 ? await page.locator('.ch02-scene-label').evaluateAll(labels => labels.map(label => ({
          label: label.getAttribute('aria-label'), width: label.getBoundingClientRect().width,
        }))) : [];
        await page.getByRole('tab', { name: '交互实验' }).focus();
        await page.keyboard.press('ArrowRight');
        item.checks.push({ name: 'tabs-arrow-key', pass: await page.getByRole('tab', { name: '学习路径' }).getAttribute('aria-selected') === 'true' });
        item.checks.push({ name: 'learning-path', pass: await page.locator('.route-item').count() >= 2 });
        await page.getByRole('tab', { name: '学习路径' }).press('End');
        item.checks.push({ name: 'tabs-end-key', pass: await page.getByRole('tab', { name: '自测反馈' }).getAttribute('aria-selected') === 'true' });
        await page.locator('.quiz-options button').first().click();
        item.checks.push({ name: 'quiz-feedback', pass: await page.locator('.quiz-feedback').count() === 1 });
        await page.getByRole('tab', { name: '自测反馈' }).press('Home');
        item.checks.push({ name: 'tabs-home-key', pass: await page.getByRole('tab', { name: '交互实验' }).getAttribute('aria-selected') === 'true' });
        await page.getByRole('tab', { name: '自测反馈' }).click();
        item.checks.push({ name: 'quiz-survives-mode-roundtrip', pass: await page.locator('.quiz-feedback').isVisible() && await page.locator('.quiz-options button').first().isDisabled() });
        await page.getByRole('tab', { name: '交互实验' }).click();
        if (chapter === 7) {
          const titleBeforeHide = await page.locator('.step-player h3').textContent();
          await page.getByRole('button', { name: '自动播放', exact: true }).click();
          await page.getByRole('tab', { name: '学习路径' }).click();
          await page.waitForTimeout(1700);
          await page.getByRole('tab', { name: '交互实验' }).click();
          item.checks.push({
            name: 'hidden-step-player-pauses-and-cancels-timer',
            pass: await page.locator('.step-player h3').textContent() === titleBeforeHide
              && await page.getByRole('button', { name: '自动播放', exact: true }).getAttribute('aria-pressed') === 'false',
          });
        }
        if (chapter === 1) {
          const initial = await page.locator('#ch01-n').inputValue();
          await page.locator('#ch01-n').fill('6');
          await page.getByRole('tab', { name: '学习路径' }).click();
          await page.getByRole('tab', { name: '交互实验' }).click();
          item.checks.push({ name: 'experiment-parameters-survive-mode-roundtrip', pass: await page.locator('#ch01-n').inputValue() === '6' });
          await page.locator('#ch01-n').fill(initial);
        }

        if (chapter === 2) {
          await settleScene(page);
          const afterMode = await page.locator('.ch02-scene-label').evaluateAll(labels => labels.map(label => ({
            label: label.getAttribute('aria-label'), width: label.getBoundingClientRect().width,
          })));
          const labelWidthDifference = Math.max(...sceneLabelsBeforeMode.map((before, index) => (
            afterMode[index]?.label === before.label ? Math.abs(afterMode[index].width - before.width) : Number.POSITIVE_INFINITY
          )));
          item.checks.push({
            name: 'three-label-scales-survive-learning-mode-roundtrip',
            pass: sceneLabelsBeforeMode.length === 8 && afterMode.length === 8 && labelWidthDifference < 0.5,
            detail: `标签宽度最大变化 ${labelWidthDifference.toFixed(4)}px`,
          });
          const sceneLabel = page.getByRole('button', { name: '{b}，点击选择', exact: true });
          await sceneLabel.click();
          await page.locator('.readout-item').first().filter({ hasText: '{b}' }).waitFor();
          item.checks.push({ name: 'three-scene-label-pointer', pass: true });
          await page.getByRole('button', { name: '恢复初始选择', exact: true }).click();

          const canvas = page.locator('.ch02-three-scene canvas');
          await canvas.waitFor();
          await canvas.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center' }));
          await settleScene(page);
          const initialCanvas = await canvas.screenshot();
          await page.getByRole('button', { name: '放大', exact: true }).click();
          await canvas.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center' }));
          await settleScene(page);
          const zoomedCanvas = await canvas.screenshot();
          await page.getByRole('tab', { name: '学习路径' }).click();
          await page.getByRole('tab', { name: '交互实验' }).click();
          await canvas.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center' }));
          await settleScene(page);
          const modeRoundTripCanvas = await canvas.screenshot();
          const modeRoundTripDistance = await imageDistance(page, zoomedCanvas, modeRoundTripCanvas);
          item.checks.push({
            name: 'learning-mode-roundtrip-preserves-camera', pass: modeRoundTripDistance < 1,
            detail: `缩放画面往返差 ${modeRoundTripDistance.toFixed(4)}`,
          });
          await page.getByRole('button', { name: '二维哈斯图', exact: true }).click();
          await page.getByRole('button', { name: '三维立方体', exact: true }).click();
          await canvas.waitFor();
          await canvas.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center' }));
          await settleScene(page);
          const roundTripCanvas = await canvas.screenshot();
          const initialDistance = await imageDistance(page, initialCanvas, roundTripCanvas);
          const staleZoomDistance = await imageDistance(page, zoomedCanvas, roundTripCanvas);
          const cameraReset = initialDistance < 1 && initialDistance < staleZoomDistance;
          item.checks.push({
            name: 'view-roundtrip-clears-stale-camera-command',
            pass: cameraReset,
            detail: `初始画面差 ${initialDistance.toFixed(4)}，旧缩放画面差 ${staleZoomDistance.toFixed(4)}`,
          });
          if (!cameraReset) {
            fs.writeFileSync(path.join(output, 'ch02-camera-initial.png'), initialCanvas);
            fs.writeFileSync(path.join(output, 'ch02-camera-zoomed.png'), zoomedCanvas);
            fs.writeFileSync(path.join(output, 'ch02-camera-roundtrip.png'), roundTripCanvas);
          }

          await page.getByRole('button', { name: '二维哈斯图', exact: true }).click();
          const inactiveSelection = page.locator('.ch02-hasse').getByRole('button', { name: /^\{b, c\}/ });
          const pickerSelection = page.locator('.ch02-subset-picker').getByRole('button', { name: /^\{b, c\}/ });
          item.checks.push({
            name: 'selection-aria-pressed-follows-active-target',
            pass: await inactiveSelection.getAttribute('aria-pressed') === 'false'
              && await pickerSelection.getAttribute('aria-pressed') === 'false',
          });
          await page.getByRole('button', { name: '三维立方体', exact: true }).click();
        }

        if (chapter === 4) {
          await page.getByRole('button', { name: '有限函数与无限对应', exact: true }).click();
          for (const name of [
            '1 对应 b：0，点击加入',
            '2 对应 c：0，点击加入',
            '3 对应 b：0，点击加入',
            '2 对应 b：1，点击移除',
            '3 对应 c：1，点击移除',
          ]) {
            await page.getByRole('button', { name, exact: true }).click();
          }
          const graph = page.locator('.ch04-mapping-graph');
          await graph.evaluate(svg => svg.scrollIntoView({ block: 'center', inline: 'center' }));
          const visibleArrow = graph.getByRole('button', { name: /^3 对应 b：/ });
          const arrowPoint = await visibleArrow.evaluate(group => {
            const path = group.querySelector('.ch04-mapping-edge');
            const length = path.getTotalLength();
            for (const fraction of [.5, .35, .65, .2, .8]) {
              const point = path.getPointAtLength(length * fraction).matrixTransform(path.getScreenCTM());
              const hit = document.elementFromPoint(point.x, point.y);
              if (hit && group.contains(hit)) return { x: point.x, y: point.y };
            }
            throw new Error('可见的 3→b 箭头上没有可命中的点');
          });
          await page.mouse.click(arrowPoint.x, arrowPoint.y);
          item.checks.push({
            name: 'curved-arrow-click-hits-visible-pair',
            pass: await graph.getByRole('button', { name: /^3 对应 b：/ }).getAttribute('aria-pressed') === 'false'
              && await graph.getByRole('button', { name: /^3 对应 c：/ }).getAttribute('aria-pressed') === 'false',
          });
        }

        if (chapter === 8) {
          await page.getByRole('button', { name: 'Huffman 前缀编码', exact: true }).click();
          await page.locator('.ch08-huffman').waitFor();
          const slider = page.locator('#ch08-frequency-a');
          const oldWeight = Number(await slider.inputValue());
          await slider.focus();
          await slider.press('ArrowRight');
          item.checks.push({ name: 'huffman-weight-keyboard', pass: Number(await slider.inputValue()) === oldWeight + 1 });
          const player = page.locator('.ch08-huffman .step-player');
          const initialTitle = await player.locator('h3').textContent();
          await player.getByRole('button', { name: '下一步', exact: true }).click();
          await player.locator('h3').filter({ hasText: '取出两个最小权节点' }).waitFor();
          const nextTitle = await player.locator('h3').textContent();
          await player.getByRole('button', { name: '上一步', exact: true }).click();
          await player.locator('h3').filter({ hasText: initialTitle ?? '' }).waitFor();
          item.checks.push({
            name: 'huffman-forward-back-snapshot',
            pass: nextTitle !== initialTitle && await player.locator('h3').textContent() === initialTitle,
          });
          await player.locator('.step-dots button').last().click();
          await player.locator('h3').filter({ hasText: '前缀编码树构造完成' }).waitFor();
          const codes = await page.locator('.ch08-huffman tbody code').allTextContents();
          item.checks.push({
            name: 'huffman-final-prefix-codes',
            pass: (await player.locator('h3').textContent())?.includes('前缀编码树构造完成')
              && codes.length === 8 && codes.every(code => /^[01]+$/.test(code)),
          });
          await prepareScreenshot(page);
          await page.screenshot({ path: path.join(output, 'ch08-huffman-desktop.png'), fullPage: true });
          await page.getByRole('button', { name: 'Kruskal 最小生成树', exact: true }).click();
          const kruskal = page.locator('.ch08-lab .step-player');
          const countBeforeKruskal = await experimentCount(page, 8);
          await kruskal.locator('.step-dots button').last().click();
          await kruskal.locator('h3').filter({ hasText: '最小生成' }).waitFor();
          const countAtKruskalEnd = await experimentCount(page, 8);
          item.checks.push({
            name: 'kruskal-final-clears-current-edge-and-endpoints',
            pass: countAtKruskalEnd === countBeforeKruskal + 1
              && await page.locator('.ch08-lab .is-current').count() === 0
              && await page.locator('.ch08-endpoint-ring').count() === 0,
          });
          await page.getByRole('button', { name: '欧拉性与边遍历', exact: true }).click();
          await page.getByRole('button', { name: 'Kruskal 最小生成树', exact: true }).click();
          await kruskal.locator('h3').filter({ hasText: '最小生成' }).waitFor();
          item.checks.push({
            name: 'last-step-remount-does-not-double-count',
            pass: await experimentCount(page, 8) === countAtKruskalEnd,
          });
          await page.getByRole('button', { name: '欧拉性与边遍历', exact: true }).click();
          await page.getByRole('button', { name: '完成欧拉性实验', exact: true }).click();
          item.checks.push({
            name: 'euler-experiment-records-completion',
            pass: await experimentCount(page, 8) === countAtKruskalEnd + 1,
          });
        }

        if (chapter === 9) {
          await page.locator('#ch09-hom-a').selectOption('1');
          item.checks.push({
            name: 'homomorphism-parameter-unlocks-completion',
            pass: await page.getByRole('button', { name: '完成本章实验', exact: true }).isEnabled(),
          });
        }

        if (chapter === 10) {
          await page.locator('#ch10-second').selectOption('Z90');
          item.checks.push({
            name: 'comparison-parameter-unlocks-completion',
            pass: await page.getByRole('button', { name: '完成本章实验', exact: true }).isEnabled(),
          });
        }

        if (chapter === 2 || chapter === 10) {
          const controls = page.getByRole('group', { name: '三维相机键盘等价控制' });
          if (chapter === 10) {
            await controls.getByRole('button', { name: '放大', exact: true }).click();
            const canvas = page.locator('.ch10-scene canvas');
            await canvas.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center' }));
            await settleScene(page);
            const beforeMode = await canvas.screenshot();
            await page.getByRole('tab', { name: '学习路径' }).click();
            await page.getByRole('tab', { name: '交互实验' }).click();
            await canvas.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center' }));
            await settleScene(page);
            const afterMode = await canvas.screenshot();
            const distance = await imageDistance(page, beforeMode, afterMode);
            item.checks.push({ name: 'learning-mode-roundtrip-preserves-camera-and-textures', pass: distance < 1, detail: `相机与纹理画面往返差 ${distance.toFixed(4)}` });
          }
          const algebraBefore = chapter === 10 ? await page.locator('.ch10-representation-grid').textContent() : null;
          for (const name of ['视角左旋', '视角右旋', '放大', '缩小', '重置视角']) {
            await controls.getByRole('button', { name, exact: true }).click();
          }
          item.checks.push({
            name: 'camera-keyboard-equivalent-buttons',
            pass: chapter !== 10 || await page.locator('.ch10-representation-grid').textContent() === algebraBefore,
          });
        }
      } else if (chapter === 1) {
        const menuButton = page.getByRole('button', { name: '打开章节目录' });
        await menuButton.click();
        await page.waitForFunction(() => Boolean(document.activeElement?.closest('#chapter-sidebar')));
        item.checks.push({
          name: 'mobile-menu-focus-in',
          pass: await page.evaluate(() => Boolean(document.activeElement?.closest('#chapter-sidebar'))),
        });
        item.checks.push({ name: 'mobile-menu-locks-background', pass: await page.locator('body').evaluate(body => body.style.overflow === 'hidden') && await page.locator('#main-content').evaluate(main => main.inert) });
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === '打开章节目录');
        item.checks.push({
          name: 'mobile-menu-escape-restores-focus',
          pass: await page.getByRole('button', { name: '打开章节目录' }).evaluate(button => document.activeElement === button),
        });
        await page.keyboard.press('Tab');
        item.checks.push({
          name: 'closed-mobile-menu-skips-hidden-controls',
          pass: await page.evaluate(() => !document.activeElement?.closest('#chapter-sidebar')),
        });
      }
      if (chapter === 6) {
        const readoutBases = page.locator('.readout-item .katex .base');
        item.checks.push({
          name: 'quantifier-formula-spans-keep-katex-layout',
          pass: await readoutBases.count() > 0 && await readoutBases.evaluateAll(bases => bases.every(base => getComputedStyle(base).display !== 'block')),
        });
        await page.getByRole('button', { name: '二元关系与量词次序', exact: true }).click();
        item.checks.push({ name: 'binary-quantifier-formulas-render', pass: await page.locator('.katex-error').count() === 0 });
        await prepareScreenshot(page);
        await page.screenshot({ path: path.join(output, `ch06-binary-${viewport.name}.png`), fullPage: true });
        await page.getByRole('button', { name: '一元谓词与量词否定', exact: true }).click();
      }
      if (chapter === 9) {
        const overflow = await page.locator('.ch09-hom-evidence .formula').evaluateAll(formulas => formulas.filter(formula => formula.scrollWidth > formula.clientWidth + 2).map(formula => ({width: formula.clientWidth, content: formula.scrollWidth})));
        item.checks.push({ name: 'homomorphism-derivation-fits-panel', pass: overflow.length === 0, detail: JSON.stringify(overflow) });
      }
      if (chapter === 11) {
        const modeButtons = page.getByRole('group', { name: '第11章实验模式' }).getByRole('button');
        await modeButtons.nth(1).click();
        const overflowingStepFormulas = [];
        const inspectPlayerFormulas = async (mode) => {
          const player = page.locator('.ch11-lab .step-player');
          const dots = player.locator('.step-dots button');
          for (let step = 0; step < await dots.count(); step++) {
            await dots.nth(step).click();
            const overflow = await player.locator('.formula').evaluateAll(formulas => formulas.filter(formula => formula.scrollWidth > formula.clientWidth + 2).map(formula => ({width: formula.clientWidth, content: formula.scrollWidth})));
            if (overflow.length) overflowingStepFormulas.push({mode, step, overflow});
          }
        };
        await inspectPlayerFormulas('divisor');
        await page.getByRole('button', { name: '三元素子集格', exact: true }).click();
        await inspectPlayerFormulas('subset');
        item.checks.push({ name: 'subset-lattice-formulas-render', pass: await page.locator('.katex-error').count() === 0 });
        await prepareScreenshot(page);
        await page.screenshot({ path: path.join(output, `ch11-subset-${viewport.name}.png`), fullPage: true });
        await modeButtons.nth(2).click();
        const operationButtons = page.getByRole('group', { name: '选择布尔主运算' }).getByRole('button');
        const operationErrors = [];
        for (let operation = 0; operation < 3; operation++) {
          await operationButtons.nth(operation).click();
          operationErrors.push(await page.locator('.katex-error').count());
        }
        const lawButtons = page.getByRole('group', { name: '选择要验证的布尔定律' }).getByRole('button');
        for (let law = 0; law < 3; law++) {
          await lawButtons.nth(law).click();
          operationErrors.push(await page.locator('.katex-error').count());
          await inspectPlayerFormulas(`boolean-law-${law}`);
        }
        item.checks.push({ name: 'all-boolean-operations-and-laws-render', pass: operationErrors.every(count => count === 0) });
        item.checks.push({ name: 'lattice-and-boolean-player-formulas-fit', pass: overflowingStepFormulas.length === 0, detail: JSON.stringify(overflowingStepFormulas) });
        await prepareScreenshot(page);
        await page.screenshot({ path: path.join(output, `ch11-boolean-${viewport.name}.png`), fullPage: true });
        await modeButtons.nth(0).click();
      }
      const unfocusableScrollRegions = await page.locator('[role="region"][aria-label*="横向滚动"]').evaluateAll(regions => (
        regions.filter(region => region.tabIndex !== 0).length
      ));
      item.checks.push({ name: 'scroll-regions-keyboard-focusable', pass: unfocusableScrollRegions === 0 });
      const figureLayout = await page.locator('.chapter-content svg.svg-lab:visible').evaluateAll(figures => {
        const issues = [];
        for (const [index, svg] of figures.entries()) {
          const bounds = svg.getBoundingClientRect();
          const labels = [...svg.querySelectorAll('text')].map(element => ({ text: element.textContent, box: element.getBoundingClientRect() })).filter(label => label.box.width && label.box.height);
          for (let a = 0; a < labels.length; a++) {
            const left = labels[a];
            if (left.box.left < bounds.left - 2 || left.box.right > bounds.right + 2 || left.box.top < bounds.top - 2 || left.box.bottom > bounds.bottom + 2) issues.push({ figure: index, clipped: left.text });
            for (let b = a + 1; b < labels.length; b++) {
              const right = labels[b];
              const width = Math.min(left.box.right, right.box.right) - Math.max(left.box.left, right.box.left);
              const height = Math.min(left.box.bottom, right.box.bottom) - Math.max(left.box.top, right.box.top);
              if (width > 1 && height > 1 && width * height / Math.min(left.box.width * left.box.height, right.box.width * right.box.height) > .12) issues.push({ figure: index, overlap: [left.text, right.text] });
            }
          }
        }
        return { count: figures.length, issues };
      });
      item.checks.push({ name: 'svg-labels-fit-without-overlap', pass: figureLayout.issues.length === 0, detail: JSON.stringify(figureLayout) });
      await prepareScreenshot(page);
      await page.screenshot({ path: path.join(output, `ch${String(chapter).padStart(2, '0')}-${viewport.name}.png`), fullPage: true });
      if (chapter === 1) {
        await page.getByRole('button', { name: /下一章/ }).click();
        await page.locator('#chapter-heading').filter({ hasText: '集合' }).waitFor();
        item.checks.push({ name: 'chapter-navigation-preserves-system-query', pass: new URL(page.url()).searchParams.get('qbsc') === 'system' });
        item.checks.push({
          name: 'chapter-change-focuses-heading',
          pass: await page.locator('#chapter-heading').evaluate(heading => document.activeElement === heading),
        });
      }
    } catch (error) {
      errors.push(`audit: ${error.message}`);
    }
    report.push(item);
    const failed = item.checks.filter(check => !check.pass);
    console.log(`${errors.length || failed.length ? '✗' : '✓'} 第${chapter}章 ${viewport.name}: ${failed.length} 项失败，${errors.length} 条报错`);
    failed.forEach(check => console.log(`   - ${check.name}: ${check.detail || 'failed'}`));
    errors.forEach(error => console.log(`   ! ${error}`));
    await page.close();
    saveCheckpoint(key, item);
  }
  await context.close();
}

const restrictedKey = 'storage-blocked:1';
if (resume && successful(checkpoint.items[restrictedKey])) {
  report.push({ ...checkpoint.items[restrictedKey], resumed: true });
  console.log('✓ 第1章 storage-blocked: 复用相同源码的成功检查点');
} else {
const restrictedContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', offline: PROTOCOL === 'file' });
await restrictedContext.addInitScript(() => {
  for (const method of ['getItem', 'setItem', 'removeItem']) {
    Object.defineProperty(Storage.prototype, method, {
      configurable: true,
      value() { throw new DOMException('Storage is disabled for this audit', 'SecurityError'); },
    });
  }
});
const restrictedPage = await restrictedContext.newPage();
const restrictedErrors = [];
restrictedPage.on('pageerror', error => restrictedErrors.push(`pageerror: ${error.message}`));
restrictedPage.on('console', message => { if (message.type() === 'error') restrictedErrors.push(`console: ${message.text()}`); });
if (PROTOCOL === 'file') restrictedPage.on('request', request => { if (/^https?:/.test(request.url())) restrictedErrors.push(`file 模式不应请求网络：${request.url()}`); });
const restrictedItem = { chapter: 1, viewport: 'storage-blocked', protocol: PROTOCOL, sourceHash, checkedAt: new Date().toISOString(), errors: restrictedErrors, checks: [] };
try {
  await restrictedPage.goto(labUrl(1), { waitUntil: 'networkidle', timeout: 60000 });
  await restrictedPage.locator('.chapter-content').waitFor({ timeout: 30000 });
  await restrictedPage.locator('.lab-loading').waitFor({ state: 'detached', timeout: 30000 });
  restrictedItem.checks.push({ name: 'storage-security-error-fallback', pass: await restrictedPage.locator('.chapter-content button').count() > 0 });
  await restrictedPage.getByRole('button', { name: '切换深色模式', exact: true }).click();
  restrictedItem.checks.push({
    name: 'theme-remains-usable-without-storage',
    pass: await restrictedPage.locator('html').getAttribute('data-theme') === 'dark',
  });
  await prepareScreenshot(restrictedPage);
  await restrictedPage.screenshot({ path: path.join(output, 'ch01-storage-blocked.png'), fullPage: true });
} catch (error) {
  restrictedErrors.push(`audit: ${error.message}`);
}
report.push(restrictedItem);
console.log(`${restrictedErrors.length || restrictedItem.checks.some(check => !check.pass) ? '✗' : '✓'} 第1章 storage-blocked`);
await restrictedContext.close();
saveCheckpoint(restrictedKey, restrictedItem);
}
await browser.close();
if (getSourceHash() !== sourceHash) {
  report.push({ chapter: 0, viewport: 'source-changed', errors: ['审查期间源码或构建发生变化，请重新运行以确认当前版本'], checks: [] });
}
fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
const failed = report.filter(item => item.errors.length || item.checks.some(check => !check.pass));
console.log(`报告：${path.join(output, 'report.json')}`);
process.exit(failed.length ? 1 : 0);
