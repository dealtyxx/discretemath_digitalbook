#!/usr/bin/env python3
"""重新生成自托管字体（assets/fonts/）。

何时运行：教材文字有增删、出现字体中缺失的汉字，或界面文案（index.html / 入口页 / assets/js 中的提示语）有变化之后。
做什么：
  1. 统计全站实际用到的汉字，按字频把 Noto Serif SC（400 / 700）裁成 a / b / c 三片：
       a = 正文高频字 + 全部外壳页（首页、入口页、脚本提示语）用字      —— 每页几乎都要下载
       b = 其余用到的汉字                                              —— 用到才下载
       c = 备用：GB2312 一级汉字中当前未使用的字（整个汉字区兜底）         —— 几乎不会下载
  2. 拷贝 Playfair Display / Inter / DM Mono 的拉丁子集，生成 fonts.css。
依赖：pip install fonttools brotli；需要联网下载字体源文件（缓存到 tools/.fontsrc/）。
字体许可：均为 SIL OFL 1.1，见 assets/fonts/LICENSES.txt。
"""
import collections, glob, io, json, os, re, shutil, subprocess, sys, tarfile, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE) + '/'
OUT = ROOT + 'assets/fonts/'
SRC = HERE + '/.fontsrc/'
os.makedirs(OUT, exist_ok=True); os.makedirs(SRC, exist_ok=True)

NOTO = 'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/SubsetOTF/SC/NotoSerifSC-%s.otf'
NPM = {'playfair': '@fontsource-variable/playfair-display', 'inter': '@fontsource-variable/inter', 'dmmono': '@fontsource/dm-mono'}

def fetch(url, dest):
    if not os.path.exists(dest):
        print('下载', url)
        with urllib.request.urlopen(url) as r, open(dest, 'wb') as f: shutil.copyfileobj(r, f)
    return dest

def npm_files(pkg):
    """下载 npm 包并解出 files/ 下的 woff2 到 .fontsrc/<pkg>/"""
    d = SRC + pkg.replace('/', '_') + '/'
    if os.path.isdir(d): return d
    meta = json.load(urllib.request.urlopen('https://registry.npmjs.org/' + pkg + '/latest'))
    data = urllib.request.urlopen(meta['dist']['tarball']).read()
    os.makedirs(d)
    with tarfile.open(fileobj=io.BytesIO(data)) as t:
        for m in t.getmembers():
            if '/files/' in m.name and m.name.endswith('.woff2'):
                open(d + os.path.basename(m.name), 'wb').write(t.extractfile(m).read())
    return d

def is_hanzi(c): return '一' <= c <= '鿿'
def read(p): return open(p, encoding='utf-8', errors='ignore').read()

shell_files = [ROOT + 'index.html'] + [g for g in glob.glob(ROOT + '离散数学_第*章_*.html') if not g.endswith('.body.html')] \
    + glob.glob(ROOT + 'assets/js/*.js') + glob.glob(ROOT + 'assets/css/*.css')
body_files = glob.glob(ROOT + '离散数学_第*章_*.body.html')

freq = collections.Counter()
for f in body_files:
    s = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', read(f), flags=re.S)
    freq.update(c for c in re.sub(r'<[^>]+>', ' ', s) if is_hanzi(c))
shell_chars = {c for f in shell_files for c in read(f) if is_hanzi(c)}
all_used = {c for f in shell_files + body_files + glob.glob(ROOT + 'assets/source-code/CH*/*.py') for c in read(f) if is_hanzi(c)}
other = {c for f in shell_files + body_files for c in read(f) if ord(c) > 0x7e and not is_hanzi(c)} - {'﻿'}

gb1 = set()
for hi in range(0xB0, 0xD8):
    for lo in range(0xA1, 0xFF):
        try: gb1.add(bytes([hi, lo]).decode('gb2312'))
        except Exception: pass

ranked = [c for c, _ in freq.most_common()]
s1 = set(ranked[:700]) | shell_chars
s2 = (all_used | set(ranked)) - s1
s3 = gb1 - s1 - s2
print('分片字数 a/b/c =', len(s1), len(s2), len(s3))

BASE = ('U+0020-007E,U+00A0-00FF,U+2010-2027,U+2030-205E,U+2190-21FF,U+2200-22FF,U+2460-24FF,U+25A0-25FF,'
        'U+3000-303F,U+FF01-FF5E,U+FFE0-FFE5')

def ranges(chars):
    cps = sorted(ord(c) for c in chars); out = []; i = 0
    while i < len(cps):
        j = i
        while j + 1 < len(cps) and cps[j + 1] == cps[j] + 1: j += 1
        out.append('U+%X' % cps[i] if i == j else 'U+%X-%X' % (cps[i], cps[j])); i = j + 1
    return ','.join(out)

def subset(font, out, chars, with_base):
    tf = OUT + '_text.tmp'
    open(tf, 'w', encoding='utf-8').write(''.join(sorted(chars)) + (''.join(sorted(other)) if with_base else ''))
    cmd = [sys.executable, '-m', 'fontTools.subset', font, '--text-file=' + tf, '--flavor=woff2',
           '--layout-features=kern,liga,ccmp,locl,mark,mkmk,palt,halt,pwid,fwid,hwid', '--no-hinting', '--notdef-outline', '--output-file=' + out]
    if with_base: cmd.append('--unicodes=' + BASE)
    r = subprocess.run(cmd, capture_output=True, text=True)
    os.remove(tf)
    if r.returncode: raise SystemExit(r.stderr)
    print(os.path.basename(out), os.path.getsize(out))

css = ['/* 自托管字体 · 由 tools/build_fonts.py 生成，勿手工编辑。全部字体均为 SIL OFL 1.1 许可，见 LICENSES.txt。 */',
       '/* CJK 分片：同一字重按声明顺序倒序匹配——后声明的 a/b 片优先，c 片（备用字库）兜底整个汉字区。 */']
for old in glob.glob(OUT + 'noto-serif-sc-*.woff2'): os.remove(old)
for weight, style in ((400, 'Regular'), (700, 'Bold')):
    otf = fetch(NOTO % style, SRC + 'NotoSerifSC-%s.otf' % style)
    for tag, chars, base in (('c', s3, False), ('b', s2, False), ('a', s1, True)):
        name = 'noto-serif-sc-%d-%s.woff2' % (weight, tag)
        subset(otf, OUT + name, chars, base)
        ur = 'U+4E00-9FFF' if tag == 'c' else ((BASE + ',' + ranges(other) + ',' if base else '') + ranges(chars))
        css.append('@font-face{font-family:"Noto Serif SC";font-style:normal;font-weight:%d;font-display:swap;src:url(%s) format("woff2");unicode-range:%s}' % (weight, name, ur))

LAT = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
pf, it, dm = (npm_files(NPM[k]) for k in ('playfair', 'inter', 'dmmono'))
latin = [('Playfair Display', 'normal', '400 900', pf + 'playfair-display-latin-wght-normal.woff2', 'playfair-display-latin.woff2'),
         ('Playfair Display', 'italic', '400 900', pf + 'playfair-display-latin-wght-italic.woff2', 'playfair-display-latin-italic.woff2'),
         ('Inter', 'normal', '100 900', it + 'inter-latin-wght-normal.woff2', 'inter-latin.woff2'),
         ('DM Mono', 'normal', '400', dm + 'dm-mono-latin-400-normal.woff2', 'dm-mono-latin-400.woff2'),
         ('DM Mono', 'normal', '500', dm + 'dm-mono-latin-500-normal.woff2', 'dm-mono-latin-500.woff2')]
for fam, st, wt, src, name in latin:
    shutil.copy(src, OUT + name)
    css.append('@font-face{font-family:"%s";font-style:%s;font-weight:%s;font-display:swap;src:url(%s) format("woff2");unicode-range:%s}' % (fam, st, wt, name, LAT))
open(OUT + 'fonts.css', 'w', encoding='utf-8').write('\n'.join(css) + '\n')
print('fonts.css', os.path.getsize(OUT + 'fonts.css'), '字节')
