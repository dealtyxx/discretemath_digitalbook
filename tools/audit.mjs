#!/usr/bin/env node
/**
 * 版面回归检查：逐页翻遍 11 章，检测内容溢出 / 与页眉页脚重叠 / 公式排版错误 / 残留 TeX / 控制台报错 / 资源 404。
 *
 * 用法（需先安装 playwright：npm i -D playwright && npx playwright install chromium）：
 *   npx http-server . -p 8080 -c-1 &          # 在仓库根目录起静态服务
 *   node tools/audit.mjs [章号|all]            # 默认 all；可用环境变量 BASE 指定地址
 * 退出码：有问题为 1，否则 0。
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://127.0.0.1:8080/';
const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.body.html'))
  .sort((a, b) => +a.match(/第(\d+)章/)[1] - +b.match(/第(\d+)章/)[1]);
const which = process.argv[2] || 'all';
const list = which === 'all' ? files : files.filter(f => f.includes(`第${which}章`));

const browser = await chromium.launch();
let bad = 0;
for (const file of list) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errs.push(`${r.status()} ${r.url().slice(-80)}`); });
  await page.addInitScript(() => { try { localStorage.setItem('tb-hint-seen', '1'); } catch (e) {} });
  await page.goto(BASE + encodeURI(file), { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.classList.contains('mathjax-ready'), null, { timeout: 60000 }).catch(() => errs.push('MathJax 未就绪'));
  await page.addStyleTag({ content: '.slide,.anim-item{transition:none!important;animation:none!important}' });
  const issues = await page.evaluate(async () => {
    const slides = [...document.querySelectorAll('.slide')], out = [], vw = innerWidth, vh = innerHeight;
    for (let i = 0; i < slides.length; i++) {
      window.__deckGoTo(i);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const s = slides[i];
      for (let w = 0; w < 200 && s.getAttribute('data-mj') === 'pending'; w++) await new Promise(r => setTimeout(r, 25));
      const probs = [], body = s.querySelector('.slide-body'), foot = s.querySelector('.foot'), chrome = s.querySelector('.chrome');
      if (body && body.scrollHeight - body.clientHeight > 3) probs.push('内容溢出 +' + (body.scrollHeight - body.clientHeight));
      let maxB = 0, minT = 1e9;
      s.querySelectorAll('.slide-body *').forEach(el => {
        if (el.closest('mjx-assistive-mml,pre')) return;
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
        maxB = Math.max(maxB, r.bottom); minT = Math.min(minT, r.top);
        if (r.right > vw + 2 || r.left < -2) probs.push('横向越界 ' + el.tagName);
      });
      if (foot && maxB > foot.getBoundingClientRect().top + 2) probs.push('与页脚重叠');
      if (chrome && minT < chrome.getBoundingClientRect().bottom - 2) probs.push('与页眉重叠');
      if (s.querySelector('mjx-merror')) probs.push('公式渲染错误');
      const t = [...s.querySelectorAll('.slide-body')].map(b => { const c = b.cloneNode(true); c.querySelectorAll('mjx-container,mjx-assistive-mml,script,style').forEach(n => n.remove()); return c.textContent; }).join(' ');
      if (/\\\(|\\\)|\\\[|\\\]/.test(t)) probs.push('残留 TeX 定界符');
      if (probs.length) out.push(`P${i + 1} ${s.getAttribute('data-source') || ''}: ${[...new Set(probs)].join('; ')}`);
    }
    return out;
  });
  const n = issues.length + errs.length; bad += n;
  console.log(`${n ? '✗' : '✓'} ${file}  ${issues.length} 页有问题，${errs.length} 条报错`);
  issues.forEach(x => console.log('   ' + x)); errs.forEach(x => console.log('   ! ' + x));
  await ctx.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
