/* ==========================================================================
   离散数学数字教材 · 章节页运行时增强（11 章共享）
   ① MathJax 按页排版：先排当前页与邻近页，其余页在空闲时逐页完成，
      避免打开章节时把全部公式一次性排完造成 1 秒以上的卡顿。
   ② 邻近页预热：让即将翻到的页提前完成布局，翻页第一帧不掉帧。
   ③ 应用动画视频按需加载：所在页成为当前页（或紧邻当前页）时才设置 src，
      不再一进章节就预载十几个视频。
   本文件在各章内联脚本之后加载；缺少它时页面仍可正常阅读，只是回到旧的整章排版方式。
   ========================================================================== */
(function () {
  'use strict';
  if (window.__bookPolish) return;
  window.__bookPolish = true;

  var deck = document.getElementById('deck');
  if (!deck) return;
  var root = document.documentElement;
  var slides = Array.prototype.slice.call(deck.querySelectorAll('.slide'));
  var MATH = '.math-inline-source,.mathjax-display-source';

  function cur() {
    var a = deck.querySelector('.slide.active');
    var i = a ? slides.indexOf(a) : 0;
    return i < 0 ? 0 : i;
  }
  function idle(fn) {
    if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 500 });
    else setTimeout(fn, 50);
  }

  /* ---------------- ① MathJax 按页排版 ---------------- */
  var mjReady = false, mjBusy = false;
  slides.forEach(function (s) {
    if (s.querySelector(MATH)) s.setAttribute('data-mj', 'pending');
  });

  function mjCheck() {
    if (mjReady) return;
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function' &&
        root.classList.contains('mathjax-ready')) {
      mjReady = true;
      schedule();
    }
  }
  try {
    new MutationObserver(mjCheck).observe(root, { attributes: true, attributeFilter: ['class'] });
  } catch (e) {}
  /* 15 秒仍未就绪（例如 MathJax 文件缺失）：放开隐藏，至少显示 TeX 源码 */
  setTimeout(function () { if (!mjReady) root.classList.add('mj-fail'); }, 15000);

  function pickNext() {
    var c = cur(), best = -1, bd = 1e9;
    for (var i = 0; i < slides.length; i++) {
      if (slides[i].getAttribute('data-mj') !== 'pending') continue;
      var d = Math.abs(i - c) + (i < c ? 0.4 : 0);          // 优先向后翻的方向
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  function pump() {
    if (!mjReady || mjBusy) return;
    var i = pickNext();
    if (i < 0) return;
    var s = slides[i];
    mjBusy = true;
    s.setAttribute('data-mj-run', '');                       // 排版期间保持渲染（MathJax 需要测量宽度）
    function done() {
      s.removeAttribute('data-mj-run');
      s.setAttribute('data-mj', 'ok');
      mjBusy = false;
      schedule();
    }
    var p;
    try { p = window.MathJax.typesetPromise([s]); } catch (e) { p = Promise.reject(e); }
    Promise.resolve(p).then(done, function (err) {
      if (window.console) console.warn('[book] 第 ' + (i + 1) + ' 页公式排版失败', err);
      done();
    });
  }
  function schedule() {
    if (!mjReady || mjBusy) return;
    var c = cur();
    if (slides[c] && slides[c].getAttribute('data-mj') === 'pending') { pump(); return; }   // 当前页最优先
    var near = false;
    for (var k = -2; k <= 2; k++) {
      var s = slides[c + k];
      if (s && s.getAttribute('data-mj') === 'pending') { near = true; break; }
    }
    if (near) setTimeout(pump, 30); else idle(pump);
  }

  /* ---------------- ② 邻近页预热 ---------------- */
  var warm = [];
  function setWarm(list) {
    var keep = {};
    list.forEach(function (i) { if (slides[i]) keep[i] = true; });
    warm.forEach(function (i) { if (!keep[i]) slides[i].removeAttribute('data-warm'); });
    warm = [];
    Object.keys(keep).forEach(function (i) {
      slides[i].setAttribute('data-warm', '');
      warm.push(+i);
    });
  }

  /* ---------------- ③ 应用动画视频按需加载 ---------------- */
  function armSlide(s) {
    if (!s) return;
    Array.prototype.forEach.call(s.querySelectorAll('video[data-app-video]'), function (v) {
      if (v.__armed) return;
      v.__armed = true;
      v.setAttribute('preload', 'metadata');
      v.setAttribute('src', v.getAttribute('data-app-video'));
    });
  }
  document.addEventListener('error', function (e) {
    var v = e.target;
    if (!v || v.tagName !== 'VIDEO' || !v.hasAttribute('data-app-video')) return;
    if (!v.__retried) {                                       // 网络抖动：1.2 秒后重试一次
      v.__retried = true;
      setTimeout(function () { try { v.load(); } catch (err) {} }, 1200);
      return;
    }
    var hint = v.closest('.slide') && v.closest('.slide').querySelector('.app-video-foot-hint');
    if (hint) hint.textContent = '动画读取失败，请检查网络，或确认 assets/app-videos 目录完整';
  }, true);
  document.addEventListener('play', function (e) {            // 同一时刻只播放一个视频
    var t = e.target;
    if (!t || t.tagName !== 'VIDEO') return;
    Array.prototype.forEach.call(document.querySelectorAll('video'), function (v) {
      if (v !== t) { try { v.pause(); } catch (err) {} }
    });
  }, true);

  /* ---------------- 翻页联动 ---------------- */
  var last = -1, raf = 0;
  function onNav() {
    raf = 0;
    var c = cur();
    if (c === last) return;
    last = c;
    setWarm([c - 1, c + 1]);
    armSlide(slides[c]);
    armSlide(slides[c + 1]);
    schedule();
  }
  try {
    new MutationObserver(function () { if (!raf) raf = requestAnimationFrame(onNav); })
      .observe(deck, { subtree: true, attributes: true, attributeFilter: ['class'] });
  } catch (e) {}
  onNav();
  mjCheck();

  /* ---------------- 与外壳页通信 ---------------- */
  /* 外壳把焦点在其自身时的按键转发进来（postMessage 在 file:// 下同样可用） */
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (e.source !== window.parent || !d || d.type !== 'book-key' || typeof d.key !== 'string') return;
    try {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: d.key, code: d.code || '', bubbles: true, cancelable: true,
        ctrlKey: !!d.ctrlKey, metaKey: !!d.metaKey, shiftKey: !!d.shiftKey, altKey: !!d.altKey
      }));
    } catch (err) {}
  });
  /* 首屏画出后通知外壳撤掉「载入中」遮罩 */
  if (window.parent && window.parent !== window) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        try { window.parent.postMessage({ type: 'book-ready' }, '*'); } catch (err) {}
      });
    });
  }
})();
