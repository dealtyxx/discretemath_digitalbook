#!/usr/bin/env node
/** Build the HTTP module distribution and a self-contained file:// distribution. */
import { build } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LAB = path.join(ROOT, 'lab');
const configFile = path.join(ROOT, 'vite.config.ts');

async function sourceSnapshot() {
  const files = [];
  async function visit(relative) {
    const absolute = path.resolve(ROOT, relative);
    const stat = await fs.stat(absolute);
    if (stat.isDirectory()) {
      for (const name of (await fs.readdir(absolute)).sort()) await visit(path.join(relative, name));
    } else {
      files.push({ path: relative.replaceAll('\\', '/'), sha256: createHash('sha256').update(await fs.readFile(absolute)).digest('hex') });
    }
  }
  for (const relative of ['interactive/src', 'interactive/index.html', 'interactive/tsconfig.json', 'assets/fonts', 'package.json', 'package-lock.json', 'vite.config.ts', 'tools/build-lab.mjs']) await visit(relative);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}
const sources = await sourceSnapshot();
const moduleResult = await build({ configFile });
const moduleFiles = new Set();
for (const bundle of Array.isArray(moduleResult) ? moduleResult : [moduleResult]) {
  if (!Array.isArray(bundle.output)) throw new Error('Expected Vite build output, not a watcher.');
  for (const item of bundle.output) {
    moduleFiles.add(item.fileName);
    if (item.type === 'chunk' && item.map) moduleFiles.add(`${item.fileName}.map`);
  }
}
const indexPath = path.join(LAB, 'index.html');
let html = await fs.readFile(indexPath, 'utf8');
const entry = html.match(/<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
if (!entry || styles.length !== 1) throw new Error('Expected one Vite entry script and stylesheet.');

await build({
  configFile,
  build: {
    outDir: path.join(LAB, 'offline'),
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: () => true,
    rollupOptions: {
      input: path.join(ROOT, 'interactive', 'src', 'offline.ts'),
      output: {
        format: 'iife', name: 'DiscreteMathOffline', inlineDynamicImports: true,
        entryFileNames: 'book-lab.js', assetFileNames: 'book-lab.[ext]',
      },
    },
  },
});

const paths = {
  moduleScript: entry[1], moduleStyle: styles[0][1],
  offlineScript: './offline/book-lab.js', offlineStyle: './offline/book-lab.css',
};
for (const key of ['offlineScript', 'offlineStyle']) {
  const file = path.resolve(LAB, paths[key]);
  if (!file.startsWith(LAB + path.sep) || (await fs.stat(file)).size < 1000) throw new Error(`Missing distribution file: ${key}`);
}

html = html.replace(entry[0], '').replace(styles[0][0], '');
const startup = `<div data-lab-startup id="lab-startup" role="status" aria-live="polite">
      <small>DISCRETE MATHEMATICS</small><h1>离散数学 · 交互实验室</h1>
      <p>正在准备数学模型…</p><a href="../index.html">返回全书目录</a>
    </div>`;
html = html.replace('<div id="root"></div>', `<div id="root">${startup}</div>`);
html = html.replace('</head>', `<style>
  [data-lab-startup]{box-sizing:border-box;max-width:640px;margin:12vh auto;padding:32px;font:16px/1.8 "Microsoft YaHei",sans-serif;color:#142330;background:#fcfcfb;border:1px solid #b8b0a4}
  [data-lab-startup] small{letter-spacing:.16em;color:#6f675d}[data-lab-startup] h1{font-size:clamp(24px,5vw,32px);line-height:1.4;font-weight:400}
  [data-lab-startup] a,[data-lab-startup] button{color:inherit;margin-right:16px}[data-lab-startup] button{padding:8px 16px;font:inherit;cursor:pointer}
  @media(max-width:700px){[data-lab-startup]{margin:8vh 16px;padding:24px}}
  </style></head>`);
html = html.replace('</body>', `<script id="lab-distribution-loader">
  (function(){
    'use strict';
    var paths=${JSON.stringify(paths)};
    var local=location.protocol==='file:';
    document.documentElement.setAttribute('data-lab-distribution',local?'offline':'module');
    function failed(){
      var box=document.getElementById('lab-startup');
      if(!box)return;
      box.setAttribute('role','alert');
      box.querySelector('p').textContent='实验室文件加载失败，请确认教材文件夹完整。';
      if(!box.querySelector('button')){var retry=document.createElement('button');retry.type='button';retry.textContent='重新加载';retry.onclick=function(){location.reload();};box.insertBefore(retry,box.querySelector('a'));}
    }
    var css=document.createElement('link');css.rel='stylesheet';
    css.href=local?paths.offlineStyle:paths.moduleStyle;
    css.onerror=failed;
    css.onload=function(){
      var script=document.createElement('script');
      if(!local)script.type='module';
      script.src=local?paths.offlineScript:paths.moduleScript;
      script.onerror=failed;document.body.appendChild(script);
    };
    document.head.appendChild(css);
    setTimeout(function(){if(document.getElementById('lab-startup'))failed();},20000);
  })();
  </script><noscript>请启用 JavaScript 以使用交互实验室。<a href="../index.html">返回全书目录</a></noscript></body>`);
await fs.writeFile(indexPath, html, 'utf8');
if (JSON.stringify(sources) !== JSON.stringify(await sourceSnapshot())) throw new Error('Sources changed during the build; run again after edits finish.');

// Some programmatic Vite builds retain old hashes despite emptyOutDir. Only
// prune generated hashed files, after both distributions have built successfully.
const assetDirectory = path.resolve(LAB, 'assets');
if (path.dirname(assetDirectory) !== path.resolve(LAB) || path.dirname(path.resolve(LAB)) !== ROOT) throw new Error('Unsafe generated asset directory.');
let removedFiles = 0;
let removedBytes = 0;
for (const entry of await fs.readdir(assetDirectory, { withFileTypes: true })) {
  if (!entry.isFile() || !/^.+-[A-Za-z0-9_-]{8,}\.(?:js|css|svg|woff2?|ttf)(?:\.map)?$/.test(entry.name) || moduleFiles.has(`assets/${entry.name}`)) continue;
  const absolute = path.resolve(assetDirectory, entry.name);
  if (path.dirname(absolute) !== assetDirectory) throw new Error('Unsafe generated asset path.');
  removedBytes += (await fs.stat(absolute)).size;
  await fs.unlink(absolute);
  removedFiles++;
}
const outputFiles = [];
for (const relative of [...new Set([...moduleFiles, 'index.html', 'offline/book-lab.js', 'offline/book-lab.css'])].sort()) {
  const absolute = path.resolve(LAB, relative);
  if (!absolute.startsWith(path.resolve(LAB) + path.sep)) throw new Error(`Unsafe distribution path: ${relative}`);
  const contents = await fs.readFile(absolute);
  outputFiles.push({ path: relative, bytes: contents.length, sha256: createHash('sha256').update(contents).digest('hex') });
}
await fs.writeFile(path.join(LAB, 'build-manifest.json'), JSON.stringify({ version: 1, sources, files: outputFiles }, null, 2) + '\n', 'utf8');
console.log(`Pruned ${removedFiles} obsolete assets (${(removedBytes / 1024 / 1024).toFixed(2)} MiB); wrote verified build manifest.`);
console.log('Built HTTP modules and file:// classic script with embedded fonts.');
