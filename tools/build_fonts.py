#!/usr/bin/env python3
"""生成自托管字体 fonts/*.woff2 与 fonts/fonts.css（替代 fonts.googleapis.com）。

- 拉丁字体（Playfair Display / Inter / DM Mono / IBM Plex Mono / Source Serif 4）：
  取 Google Fonts CSS 中的 latin 子集 woff2 下载到 fonts/。
- 中文字体（Noto Serif SC / Noto Sans SC，可变字重）：从 google/fonts 仓库下载可变 TTF，
  按“全书用到的字符 ∪ GB2312 一级汉字 3755 字”用 pyftsubset 子集化为 woff2；
  子集外的字符自动回落到系统宋体/黑体。
依赖：pip install fonttools brotli；需要联网。用法：python3 tools/build_fonts.py
书中新增了生僻字后重新运行即可。产物已提交，日常发布不需要运行本脚本。
"""
import glob, os, re, subprocess, sys, tempfile, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'fonts')
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
LATIN_CSS = ('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700'
             '&family=Inter:wght@300..600&family=DM+Mono:wght@400;500&family=IBM+Plex+Mono:wght@300;400;500;600'
             '&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,700;1,8..60,400&display=swap')
CJK = [('Noto Serif SC', 'notoserifsc', 'NotoSerifSC-var'), ('Noto Sans SC', 'notosanssc', 'NotoSansSC-var')]


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=120).read()


def book_chars():
    chars = set()
    for f in glob.glob(os.path.join(ROOT, '*.html')) + [os.path.join(ROOT, 'search-index.json')]:
        chars |= set(open(f, encoding='utf8').read())
    for hi in range(0xB0, 0xD8):            # GB2312 一级汉字
        for lo in range(0xA1, 0xFF):
            try:
                chars.add(bytes([hi, lo]).decode('gb2312'))
            except UnicodeDecodeError:
                pass
    return ''.join(sorted(c for c in chars if ord(c) >= 0x20 and c != '�'))


def main():
    os.makedirs(FONTS, exist_ok=True)
    css = ['/* 自托管字体，由 tools/build_fonts.py 生成，请勿手改 */']
    # 1) 拉丁字体
    seen = {}
    for old in glob.glob(os.path.join(FONTS, '*.woff2')):
        os.unlink(old)
    src = get(LATIN_CSS).decode('utf8')
    for m in re.finditer(r'/\* (\S+) \*/\s*(@font-face\s*\{.*?\})', src, re.S):
        if m.group(1) != 'latin':
            continue
        block = m.group(2)
        fam = re.search(r"font-family:\s*'([^']+)'", block).group(1)
        sty = re.search(r'font-style:\s*(\w+)', block).group(1)
        wt = re.search(r'font-weight:\s*([\d ]+)', block).group(1).strip().replace(' ', '-')
        url = re.search(r'url\((https://[^)]+)\)', block).group(1)
        name = '%s-%s-%s-latin.woff2' % (fam.replace(' ', ''), sty, wt)
        if url in seen:                      # 同一文件被多个字重引用时只存一份
            name = seen[url]
        else:
            seen[url] = name
            open(os.path.join(FONTS, name), 'wb').write(get(url))
        css.append(re.sub(r'url\([^)]+\)', 'url(%s)' % name, block))
    # 2) 中文字体
    txt = tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False, encoding='utf8')
    txt.write(book_chars()); txt.close()
    for fam, folder, out in CJK:
        ttf = os.path.join(tempfile.gettempdir(), out + '.ttf')
        if not os.path.exists(ttf):
            open(ttf, 'wb').write(get('https://github.com/google/fonts/raw/main/ofl/%s/%s%%5Bwght%%5D.ttf' % (folder, out.replace('-var', ''))))
        woff = os.path.join(FONTS, out.replace('-var', '') + '-subset.woff2')
        subprocess.check_call([sys.executable, '-m', 'fontTools.subset', ttf, '--text-file=' + txt.name,
                               '--flavor=woff2', '--layout-features=*', '--output-file=' + woff])
        css.append("@font-face{font-family:'%s';font-style:normal;font-weight:100 900;font-display:swap;"
                   "src:url(%s) format('woff2')}" % (fam, os.path.basename(woff)))
    os.unlink(txt.name)
    open(os.path.join(FONTS, 'fonts.css'), 'w', encoding='utf8').write('\n'.join(css) + '\n')
    tot = sum(os.path.getsize(f) for f in glob.glob(os.path.join(FONTS, '*.woff2')))
    print('字体文件总量 %.2f MB' % (tot / 1048576))


if __name__ == '__main__':
    main()
