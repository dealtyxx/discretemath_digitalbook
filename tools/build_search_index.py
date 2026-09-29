#!/usr/bin/env python3
"""生成全书搜索索引 search-index.json（供 index.html 全书搜索使用）。
用法：在仓库根目录运行  python3 tools/build_search_index.py
索引格式：{"v":1,"chapters":[{"n":1,"f":"章入口页文件名","t":"章名","p":[[页码,"标题","正文摘要"],...]}]}
"""
import glob, html, json, re, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
SLIDE = re.compile(r'<section class="slide[^"]*"([^>]*)>(.*?)(?=<section class="slide|</div>\s*<script|\Z)', re.S)
def clean(s):
    s = re.sub(r'<(script|style|pre)\b.*?</\1>', ' ', s, flags=re.S)
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s)
    s = s.replace('\\(', ' ').replace('\\)', ' ').replace('\\[', ' ').replace('\\]', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    s = s.replace('离散数学 · 基于 Python 语言的实现', '')
    s = re.sub(r'\\[a-zA-Z]+', ' ', s)          # 去掉 LaTeX 命令
    s = re.sub(r'[{}^_]', '', s)
    s = re.sub(r'\s+', ' ', s)
    return re.sub(r'\b\d+ / \d+\b', '', s).strip()
chapters = []
for body in sorted(glob.glob('离散数学_第*章_*.body.html'), key=lambda f: int(re.search(r'第(\d+)章', f).group(1))):
    n = int(re.search(r'第(\d+)章', body).group(1))
    src = open(body, encoding='utf8').read()
    entry = body.replace('.body.html', '.html')
    title = re.search(r'第\d+章_(.*)\.body\.html', body).group(1)
    pages = []
    parts = re.split(r'(?=<section class="slide[ "])', src)
    parts = [p for p in parts if p.startswith('<section class="slide')]
    for i, part in enumerate(parts, 1):
        attrs = re.match(r'<section class="slide[^"]*"([^>]*)>', part).group(1)
        m = re.search(r'data-source="([^"]*)"', attrs)
        head = re.search(r'<h[12][^>]*>(.*?)</h[12]>', part, re.S)
        t = html.unescape(m.group(1)) if m else ''
        if head: t = t or clean(head.group(1))
        text = clean(part)
        text = re.sub(r'\d+\s*/\s*\d+\s*$', '', text).strip()[:220]
        pages.append([i, (t or clean(head.group(1)) if head else t) or f'第 {i} 页', text])
    chapters.append({'n': n, 'f': entry, 't': title, 'p': pages})
out = json.dumps({'v': 1, 'chapters': chapters}, ensure_ascii=False, separators=(',', ':'))
open('search-index.json', 'w', encoding='utf8').write(out)
print(sum(len(c['p']) for c in chapters), 'pages,', len(out.encode('utf8')) // 1024, 'KB')
