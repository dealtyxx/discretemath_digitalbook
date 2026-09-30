/* ==========================================================================
   章节入口页（外壳）脚本 · 11 章共享
   - 舞台等比缩放
   - 载入提示（正文就绪或 iframe load 即淡出）
   - 快捷键代理：焦点在外壳时把按键转发给正文（postMessage，file:// 下同样可用）
   - ?tool=toc|grid|search|help|bookmark|focus|font|res|audio|code 直达对应面板
   - 全屏按钮、手机竖屏提示
   ========================================================================== */
(function () {
  'use strict';
  var frame = document.getElementById('bookFrame');
  var stage = document.getElementById('deckStage');
  var loading = document.getElementById('loading');
  if (!frame || !stage) return;
  var BAR = 26;                                              // 与 CSS 中 --bar-h 一致

  /* ---------- 舞台缩放 ---------- */
  function fit() {
    var w = window.innerWidth, h = window.innerHeight - BAR;
    if (!w || h <= 0) return;
    var s = Math.min(w / 1920, h / 1080);
    stage.style.transform = 'translate(' + ((w - 1920 * s) / 2) + 'px,' + ((h - 1080 * s) / 2) + 'px) scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  fit();
  setTimeout(fit, 120);

  /* ---------- 给正文发键盘 / 面板指令 ---------- */
  function sendKey(key, e) {
    try {
      frame.contentWindow.postMessage({
        type: 'book-key', key: key, code: (e && e.code) || '',
        ctrlKey: !!(e && e.ctrlKey), metaKey: !!(e && e.metaKey), shiftKey: !!(e && e.shiftKey), altKey: !!(e && e.altKey)
      }, '*');
    } catch (err) {}
  }

  /* ---------- 载入提示 ---------- */
  var isReady = false;
  function ready() {
    if (isReady) return;
    isReady = true;
    if (loading) loading.classList.add('done');
    try { frame.contentWindow.focus(); } catch (e) {}
    var tool = new URLSearchParams(location.search).get('tool');
    var keys = { toc: 'm', grid: 'g', search: '/', help: '?', bookmark: 'b', focus: 'f', font: 't', res: 'v', audio: 'a', code: 'c' };
    if (tool && keys[tool]) setTimeout(function () { sendKey(keys[tool]); }, 260);
  }
  frame.addEventListener('load', ready);
  window.addEventListener('message', function (e) {
    if (e.source === frame.contentWindow && e.data && e.data.type === 'book-ready') ready();
  });
  setTimeout(function () { if (!isReady && loading) loading.classList.add('slow'); }, 6000);
  window.addEventListener('focus', function () { try { frame.contentWindow.focus(); } catch (e) {} });

  /* ---------- 快捷键代理 ---------- */
  var FORWARD = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, ' ': 1, PageUp: 1, PageDown: 1, Home: 1, End: 1,
    Escape: 1, m: 1, M: 1, g: 1, G: 1, '/': 1, '?': 1, b: 1, B: 1, f: 1, F: 1, t: 1, T: 1, v: 1, V: 1, a: 1, A: 1, c: 1, C: 1 };
  window.addEventListener('keydown', function (e) {
    var t = e.target, tag = ((t && t.tagName) || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
    if ((tag === 'A' || tag === 'BUTTON') && (e.key === 'Enter' || e.key === ' ')) return;   // 让按钮 / 链接自己响应
    var k = e.key;
    var ctrlK = (e.ctrlKey || e.metaKey) && (k === 'k' || k === 'K');
    var plain = FORWARD[k] && !(e.ctrlKey || e.metaKey || e.altKey);
    if (!plain && !ctrlK) return;
    sendKey(k, e);
    e.preventDefault();
    e.stopPropagation();
  }, true);

  /* ---------- 全屏 ---------- */
  var fs = document.getElementById('fsBtn');
  if (fs) {
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) { fs.hidden = true; }
    else {
      var cur = function () { return document.fullscreenElement || document.webkitFullscreenElement; };
      fs.addEventListener('click', function () {
        if (cur()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        else req.call(el);
      });
      var sync = function () { fs.textContent = cur() ? '退出全屏' : '全屏'; setTimeout(fit, 80); };
      document.addEventListener('fullscreenchange', sync);
      document.addEventListener('webkitfullscreenchange', sync);
    }
  }

  /* ---------- 手机竖屏提示 ---------- */
  var hint = document.getElementById('rotateHint');
  if (hint) {
    try { if (sessionStorage.getItem('rotate-hint-off') === '1') hint.classList.add('hide'); } catch (e) {}
    var b = hint.querySelector('button');
    if (b) b.addEventListener('click', function () {
      hint.classList.add('hide');
      try { sessionStorage.setItem('rotate-hint-off', '1'); } catch (e) {}
    });
  }
})();
