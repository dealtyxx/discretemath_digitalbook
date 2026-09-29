#!/usr/bin/env python3
"""对全书 HTML 一次性应用性能 / 无障碍 / 移动端 / SEO 优化（幂等：已应用的文件会被跳过）。

作用范围：
  离散数学_第N章_*.body.html   章节正文（生成物）
  离散数学_第N章_*.html        章节入口页（外壳）
  index.html                   全书目录
用法：在仓库根目录运行  python3 tools/apply_optimizations.py
注意：正文/入口页若被上游生成器重新生成，需要重新运行本脚本。
"""
import glob, os, re, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SITE = 'https://dealtyxx.github.io/discretemath_digitalbook/'
MARK = 'perf-a11y-v1'
VER = '20260929'

FONTS_CSS = ('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700'
             '&family=Inter:wght@300..600&family=DM+Mono:wght@400..500'
             '&family=Noto+Serif+SC:wght@400;500;600;700;900&family=Noto+Sans+SC:wght@300;400;500;700;900'
             '&family=IBM+Plex+Mono:wght@300;400;500;600'
             '&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,700;1,8..60,400&display=swap')
FONT_BLOCK = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
              '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
              '<link rel="stylesheet" href="%s" media="print" onload="this.media=\'all\'">'
              '<noscript><link rel="stylesheet" href="%s"></noscript>' % (FONTS_CSS.replace('&', '&amp;'), FONTS_CSS.replace('&', '&amp;')))
FONT_LINK_RE = re.compile(r'<link\b[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*', re.I)


def merge_fonts(s, block=FONT_BLOCK):
    """把多组 Google Fonts 链接合并为一组非阻塞加载；block 为空串时整体移除。"""
    first = [True]

    def rep(m):
        if first[0]:
            first[0] = False
            return block
        return ''
    return FONT_LINK_RE.sub(rep, s)


BODY_CSS = '''<style id="%s">
/* 中文字体兜底：Google Fonts 加载失败/较慢时（国内网络常见）退回系统宋体/黑体，避免长时间空白 */
:root{--serif-zh:"Noto Serif SC","Source Serif 4","Songti SC","STSong","SimSun",serif;--sans-zh:"Noto Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif}
/* 键盘焦点可见 */
.tb-ctl:focus-visible,#nav .dot:focus-visible,.tb-close:focus-visible,.mk-jump:focus-visible,.mk-tab:focus-visible,.tb-copy:focus-visible,.tb-item:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
#nav .dot{min-width:8px}
.tb-ctl:not(.tb-on):not(:hover){color:#6b6359!important}
/* 手机竖屏：不再固定 16:9 舞台，改为整页重排，页内可上下滚动 */
@media (max-width:820px){
  #tb-dock{top:.5rem;right:.5rem;left:.5rem;transform:none;flex-direction:row;flex-wrap:wrap;justify-content:flex-end;gap:.35rem}
  .tb-ctl{width:2.3rem;height:2.3rem}
  .tb-ctl[data-tip]::after{display:none}
  .slide,.slide.dark,.slide.light{overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding:3.4rem 1.1rem 3rem!important}
  .slide-body{flex:none;min-height:auto;justify-content:flex-start}
  .slide.bare .w-statement{margin-left:0!important;max-width:100%%}
  .slide .foot{margin-top:1.4rem}
  .grid-2-7-5,.grid-3,[style*="5fr 7fr"],[style*="4fr 8fr"],[style*="minmax(0,1fr) minmax(0,1.15fr)"],[style*="minmax(0,16rem)"]{grid-template-columns:1fr!important}
  [style*="repeat(3,1fr)"],[style*="repeat(4,1fr)"],[style*="repeat(4,minmax(0,1fr))"]{grid-template-columns:repeat(2,1fr)!important}
  .display-zh{font-size:clamp(2.2rem,11vw,3.2rem)}
  .code-pane,pre.code{max-width:100%%}
}
</style>''' % MARK


def patch_body(s):
    if MARK in s:
        return s, False
    o = s
    # 1) 字体：3 组 Google Fonts 链接 -> 1 组非阻塞
    s = merge_fonts(s)
    # 2) 允许用户缩放（WCAG 1.4.4）
    s = re.sub(r'(<meta[^>]*name="viewport"[^>]*?)content="[^"]*"', r'\1content="width=device-width, initial-scale=1.0"', s, count=1)
    s = s.replace('content="width=device-width, initial-scale=1.0, user-scalable=no" name="viewport"',
                  'content="width=device-width, initial-scale=1.0" name="viewport"')
    # 3) 视频：不再进页面就整章预取（原来 preload="auto" 会在打开第 1 章时下载约 25 MB 动画）
    s = s.replace('preload="auto"', 'preload="none"')
    s = s.replace("v.setAttribute('preload','auto');", "v.setAttribute('preload','metadata');")
    s = s.replace("document.querySelectorAll('video[data-app-video], .app-video-stage video').forEach(fixVideo);",
                  "document.querySelectorAll('.slide.active video[data-app-video], .slide.active .app-video-stage video').forEach(fixVideo);")
    # 4) 无障碍：翻页圆点、控制坞按钮、关闭按钮命名，当前页标记，正文地标
    s = s.replace("d.className='dot';d.onclick=()=>goTo(i);",
                  "d.className='dot';d.type='button';d.setAttribute('aria-label','第 '+(i+1)+' 页');d.onclick=()=>goTo(i);")
    s = s.replace("d.classList.toggle('active',i===current);",
                  "d.classList.toggle('active',i===current);if(i===current)d.setAttribute('aria-current','true');else d.removeAttribute('aria-current');")
    s = s.replace("b.setAttribute('data-tip',tip);",
                  "b.setAttribute('data-tip',tip);b.type='button';b.setAttribute('aria-label',tip.replace(/\\s*\\(.*\\)\\s*$/,''));")
    s = s.replace('<button class="tb-close" data-close>', '<button class="tb-close" data-close type="button" aria-label="关闭">')
    s = s.replace("btn.setAttribute('data-tip','数字资源  (V)');", "btn.setAttribute('data-tip','数字资源  (V)');btn.setAttribute('aria-label','数字资源');btn.type='button';")
    s = s.replace('<div id="tb-toast">', '<div id="tb-toast" role="status">')
    s = s.replace('<div id="deck">', '<div id="deck" role="main" aria-label="教材页面">', 1)
    # 5) 样式块
    s = s.replace('</head>', BODY_CSS + '\n</head>', 1)
    return s, s != o


def chapter_meta(fname):
    m = re.search(r'第(\d+)章_(.*)\.html$', fname)
    return m.group(1), m.group(2)


def patch_wrapper(s, fname):
    if MARK in s:
        return s, False
    o = s
    n, name = chapter_meta(fname)
    body = fname.replace('.html', '.body.html')
    url = SITE + urllib.parse.quote(fname)
    desc = '离散数学交互式数字教材 第%s章「%s」：含微课视频、播客音频与 Python 配套源码，支持章内目录、搜索与书签。' % (n, name)
    # 外壳不用 Google Fonts（正文页自己会加载），去掉阻塞渲染的外部样式表
    s = merge_fonts(s, '')
    s = s.replace('<link rel="icon" href="data:,">',
                  '<link rel="icon" href="favicon.svg" type="image/svg+xml">')
    head_extra = ('\n<meta name="description" content="%s">'
                  '\n<meta name="theme-color" content="#E2DBD1">'
                  '\n<link rel="canonical" href="%s">'
                  '\n<meta property="og:type" content="website"><meta property="og:locale" content="zh_CN">'
                  '\n<meta property="og:title" content="离散数学 第%s章 · %s">'
                  '\n<meta property="og:description" content="%s">'
                  '\n<meta property="og:url" content="%s">'
                  '\n<meta name="twitter:card" content="summary">'
                  '\n' % (desc, url, n, name, desc, url))
    css = '''<style id="%s">
.copyright-bar,.source-tools a{font-family:"Inter","Noto Serif SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif}
.source-tools a:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.noscript-tip{position:fixed;inset:0;display:grid;place-items:center;text-align:center;padding:2rem;color:var(--ink);background:var(--paper);z-index:6000;font:16px/1.8 system-ui,sans-serif}
/* 手机竖屏：取消 1920x1080 缩放舞台，正文页直接铺满屏幕（正文页内部已按 vw 自适应） */
@media (max-width:820px){
  .deck-stage{width:100vw!important;height:calc(100vh - 26px)!important;height:calc(100dvh - 26px)!important;transform:none!important;border:0;box-shadow:none}
  .book-frame{width:100%%!important;height:100%%!important}
  .source-tools{display:none}
  .loading{font-size:13px}
}
</style>''' % MARK
    s = s.replace('</head>', head_extra + css + '\n</head>', 1)
    # 视口
    s = s.replace('<meta name="viewport" content="width=device-width,initial-scale=1.0">',
                  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">')
    # iframe 直接带 src，浏览器解析 HTML 时即可开始请求正文（原先要等脚本执行）
    s = s.replace('<iframe class="book-frame" id="bookFrame" title="%s"' % s[s.index('id="bookFrame" title="') + 22:s.index('" allowfullscreen')],
                  '<iframe class="book-frame" id="bookFrame" src="%s?v=%s" title="%s"' % (
                      urllib.parse.quote(body), VER, s[s.index('id="bookFrame" title="') + 22:s.index('" allowfullscreen')]), 1)
    s = s.replace('frame.src=bodyName+\'?v=20260724c\';',
                  'if(!frame.getAttribute("src"))frame.src=bodyName+\'?v=%s\';' % VER)
    # ?p=页码 / #p=页码 深链接（全书搜索结果使用）
    s = s.replace("const tool=new URLSearchParams(location.search).get('tool');",
                  "const qs=new URLSearchParams(location.search);\n"
                  "    const pg=parseInt(qs.get('p')||(location.hash.match(/p=(\\d+)/)||[])[1],10);\n"
                  "    if(pg>0){setTimeout(function(){try{frame.contentWindow.__deckGoTo(pg-1);}catch(e){}},120);}\n"
                  "    const tool=qs.get('tool');")
    # 无 JS 提示
    s = s.replace('<div class="loading" id="loading">',
                  '<noscript><div class="noscript-tip">本教材需要启用 JavaScript。<br><a href="%s">直接打开正文</a></div></noscript>\n<div class="loading" id="loading" role="status">' % urllib.parse.quote(body), 1)
    # 顶栏“全书目录”补 aria（外壳 nav 已有 aria-label）
    return s, s != o


IDX_CSS = '''<style id="%s">
/* 对比度：辅助文字由 #8A8178（3.1:1）加深到 #6B6359（≥4.5:1） */
.kicker,.hstat .l,.overall .otxt,.ch-no,.ch-secs li,.ch-res li,.ch-pages,.reset,footer,.res-stat em,.kbd,.gcard .kbd{color:#6b6359!important}
.skip-link{position:absolute;left:8px;top:-60px;z-index:20000;background:var(--ink);color:var(--paper);padding:.6rem 1rem;font-size:.9rem;transition:top .15s}
.skip-link:focus{top:8px}
a:focus-visible,button:focus-visible,.gcard[role="button"]:focus-visible{outline:2px solid var(--ink);outline-offset:3px}
.index-page-hits{margin-top:1.4rem}
.index-page-hits h3{font:500 .85rem/1.4 var(--sans);letter-spacing:.06em;color:#6b6359;margin-bottom:.6rem}
.index-page-hit{display:block;width:100%%;text-align:left;background:rgba(255,255,255,.3);border:1px solid var(--line);padding:.7rem .9rem;margin-bottom:.5rem;cursor:pointer;font:inherit;color:var(--ink)}
.index-page-hit:hover,.index-page-hit:focus-visible{background:rgba(255,255,255,.6)}
.index-page-hit b{display:block;font-weight:500;font-size:.95rem}
.index-page-hit small{display:block;color:#6b6359;font-size:.78rem;line-height:1.5;margin-top:.15rem}
.index-page-hit mark{background:rgba(58,95,168,.22);color:inherit}
</style>''' % MARK

IDX_JSONLD = '''<script type="application/ld+json">{"@context":"https://schema.org","@type":"Book","name":"离散数学 · 交互式数字教材","inLanguage":"zh-CN","author":{"@type":"Person","name":"谢鑫"},"publisher":{"@type":"Organization","name":"湖南信息学院"},"copyrightYear":2026,"url":"%s","description":"十一章离散数学交互式数字教材，每小节配微课视频、播客音频与 Python 配套源码。"}</script>''' % SITE

# 全书搜索：在原“章节搜索”之外，惰性加载 search-index.json，追加页面级命中
SEARCH_OLD = "input.addEventListener('input',render);input.addEventListener('keydown',function(e){if(e.key==='Enter'){var first=results.querySelector('[data-index-nav]');if(first)first.click();}});render();input.focus();"
SEARCH_NEW = r"""var pageBox=document.createElement('div');pageBox.className='index-page-hits';results.parentNode.appendChild(pageBox);
      var bookIdx=null,loading=false,timer=null;
      function loadIdx(cb){if(bookIdx)return cb();if(loading)return;loading=true;fetch('search-index.json').then(function(r){return r.json()}).then(function(d){bookIdx=d;cb();}).catch(function(){loading=false;pageBox.innerHTML='<div class="index-tool-empty">全书页面索引加载失败，仍可搜索章节。</div>';});}
      function hl(t,q){var i=t.toLowerCase().indexOf(q);return i<0?esc(t):esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+q.length))+'</mark>'+esc(t.slice(i+q.length));}
      function pageSearch(){var q=input.value.trim().toLowerCase();if(q.length<2){pageBox.innerHTML='';return;}loadIdx(function(){var hits=[];bookIdx.chapters.forEach(function(c){c.p.forEach(function(p){var ti=p[1].toLowerCase().indexOf(q),tx=p[2].toLowerCase().indexOf(q);if(ti>-1||tx>-1)hits.push({c:c,p:p,s:(ti>-1?0:1)*1000+(ti>-1?ti:tx)});});});hits.sort(function(a,b){return a.s-b.s});var shown=hits.slice(0,30);var em=results.querySelector('.index-tool-empty');if(em)em.style.display=hits.length?'none':'';pageBox.innerHTML=hits.length?'<h3>正文页面命中 '+hits.length+' 处'+(hits.length>30?'（显示前 30）':'')+'</h3>'+shown.map(function(h){var t=h.p[2],k=t.toLowerCase().indexOf(q),sn=k>-1?t.slice(Math.max(0,k-24),k+60):t.slice(0,60);return '<button type="button" class="index-page-hit" data-href="'+esc(h.c.f)+'?p='+h.p[0]+'"><b>第 '+h.c.n+' 章 · 第 '+h.p[0]+' 页 · '+hl(h.p[1],q)+'</b><small>'+hl(sn,q)+'</small></button>';}).join(''):'<div class="index-tool-empty">正文中没有匹配「'+esc(input.value.trim())+'」的页面。</div>';});}
      pageBox.addEventListener('click',function(e){var b=e.target.closest('.index-page-hit');if(b)location.href=b.getAttribute('data-href');});
      input.addEventListener('input',function(){render();clearTimeout(timer);timer=setTimeout(pageSearch,180);});input.addEventListener('keydown',function(e){if(e.key==='Enter'){var first=results.querySelector('[data-index-nav]')||pageBox.querySelector('.index-page-hit');if(first)first.click();}});render();input.focus();"""


def patch_index(s):
    if MARK in s:
        return s, False
    o = s
    s = merge_fonts(s)
    desc = '离散数学交互式数字教材（十一章、996 页）：计数与数论、集合、关系、命题与谓词逻辑、图论、代数系统、群环域格与布尔代数，每小节配微课视频、播客音频与 Python 配套源码。湖南信息学院 谢鑫。'
    head_extra = ('\n<meta name="description" content="%s">'
                  '\n<meta name="theme-color" content="#EDE8E0">'
                  '\n<link rel="canonical" href="%s">'
                  '\n<meta property="og:type" content="book"><meta property="og:locale" content="zh_CN">'
                  '\n<meta property="og:title" content="离散数学 · 数字教材">'
                  '\n<meta property="og:description" content="%s">'
                  '\n<meta property="og:url" content="%s">'
                  '\n<meta name="twitter:card" content="summary">\n' % (desc, SITE, desc, SITE))
    s = s.replace('<link rel="icon" href="data:,">', '<link rel="icon" href="favicon.svg" type="image/svg+xml">')
    s = s.replace('</head>', head_extra + IDX_JSONLD + '\n' + IDX_CSS + '\n</head>', 1)
    s = s.replace('<body>', '<body>\n<a class="skip-link" href="#main">跳到章节目录</a>', 1)
    s = s.replace('<main>', '<main id="main" tabindex="-1">', 1)
    s = s.replace('<section class="res-band">', '<section class="res-band" aria-label="数字资源概览">', 1)
    assert SEARCH_OLD in s, 'index 搜索代码未找到'
    s = s.replace(SEARCH_OLD, SEARCH_NEW, 1)
    s = s.replace("openPanel('全书目录搜索','<input class=\"index-tool-search\" id=\"index-search-input\" placeholder=\"输入章节、概念或小节名称…\"",
                  "openPanel('全书搜索','<input class=\"index-tool-search\" id=\"index-search-input\" aria-label=\"搜索全书\" placeholder=\"输入章节、概念或小节名称，如：欧拉函数、Dijkstra、拉格朗日…\"")
    return s, s != o


def main():
    changed = 0
    for f in sorted(glob.glob('离散数学_第*章_*.html')):
        txt = open(f, encoding='utf8').read()
        if f.endswith('.body.html'):
            new, ch = patch_body(txt)
        else:
            new, ch = patch_wrapper(txt, f)
        if ch:
            open(f, 'w', encoding='utf8').write(new)
            changed += 1
    txt = open('index.html', encoding='utf8').read()
    new, ch = patch_index(txt)
    if ch:
        open('index.html', 'w', encoding='utf8').write(new)
        changed += 1
    print('已修改文件数：', changed)


if __name__ == '__main__':
    main()
