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
  root.style.setProperty('--accent', '#6F675D', 'important');
  root.style.setProperty('--accent-rgb', '111,103,93', 'important');
  function scrollRegions(slide) {
    if (!slide) return;
    slide.querySelectorAll('.formula,.formula-sm,.math-inline-source,table,pre.code,.vis-center').forEach(function (el) {
      el.setAttribute('data-book-scroll', '');
      if (el.scrollWidth > el.clientWidth + 2) {
        el.tabIndex = 0;
        if (!el.hasAttribute('aria-label') && !el.classList.contains('math-inline-source')) el.setAttribute('aria-label', '可横向滚动的教材内容');
      }
    });
  }

  function cur() {
    var a = deck.querySelector('.slide.active');
    var i = a ? slides.indexOf(a) : 0;
    return i < 0 ? 0 : i;
  }
  // Other open entry pages may clear learning records while this chapter stays open.
  function syncLearningState(key, cleared) {
    if (window.__bookSyncLearning) window.__bookSyncLearning(key, cleared);
    if (window.__bookSyncAudioPosition) window.__bookSyncAudioPosition(key);
  }
  window.addEventListener('storage', function (event) {
    syncLearningState(event.key, event.newValue === null);
  });
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) syncLearningState(null, true);
  });
  function idle(fn) {
    if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 500 });
    else setTimeout(fn, 50);
  }

  /* ---------------- ① MathJax 按页排版 ---------------- */
  var mjReady = false, mjBusy = false, mjStopped = false;
  slides.forEach(function (s) {
    if (s.querySelector(MATH)) s.setAttribute('data-mj', 'pending');
  });

  function mjCheck() {
    if (mjReady || mjStopped) return;
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function' &&
        root.classList.contains('mathjax-ready')) {
      mjReady = true;
      schedule();
    }
  }
  try {
    new MutationObserver(mjCheck).observe(root, { attributes: true, attributeFilter: ['class'] });
  } catch (e) {}
  function stopMath() {
    mjStopped = true; mjReady = false; mjBusy = false;
    root.classList.add('mj-fail');
    slides.forEach(function (s) { if (s.getAttribute('data-mj') === 'pending') s.setAttribute('data-mj', 'error'); s.removeAttribute('data-mj-run'); });
  }
  // Formula enhancement must never keep body text hidden or wait forever.
  setTimeout(function () { if (!mjReady) stopMath(); }, 15000);

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
    var completed = false;
    var watchdog = setTimeout(function () { if (!completed) { completed = true; stopMath(); } }, 12000);
    s.setAttribute('data-mj-run', '');                       // 排版期间保持渲染（MathJax 需要测量宽度）
    function done(failed) {
      if (completed) return;
      completed = true; clearTimeout(watchdog);
      s.removeAttribute('data-mj-run');
      s.setAttribute('data-mj', failed ? 'error' : 'ok');
      if (!failed) {
        s.querySelectorAll(MATH).forEach(function (formula) {
          // Let MathJax expose the actual expression, rather than an old flattened label.
          if (formula.querySelector('mjx-container')) formula.removeAttribute('aria-label');
        });
      }
      if (s.classList.contains('active')) scrollRegions(s);
      mjBusy = false;
      schedule();
    }
    var p;
    try { p = window.MathJax.typesetPromise([s]); } catch (e) { p = Promise.reject(e); }
    Promise.resolve(p).then(function () { done(false); }, function (err) {
      if (window.console) console.warn('[book] 第 ' + (i + 1) + ' 页公式排版失败', err);
      done(true);
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
    requestAnimationFrame(function () { scrollRegions(slides[c]); });
    slides.forEach(function (s, i) { s.inert = i !== c; });
    if (root.classList.contains('reader-mode')) window.scrollTo(0, 0);
    document.querySelectorAll('#nav .dot').forEach(function (dot, i) {
      dot.setAttribute('aria-label', '第 ' + (i + 1) + ' 页：' + (slides[i].getAttribute('data-source') || '本章内容'));
      dot.setAttribute('aria-current', i === c ? 'page' : 'false');
      dot.tabIndex = i === c ? 0 : -1;
    });
    if (window.parent !== window) window.parent.postMessage({ type: 'book-state', index: c, total: slides.length }, '*');
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

  /* ---------------- 阅读模式与可达控件 ---------------- */
  function labelControls(scope) {
    scope.querySelectorAll('[data-tip]').forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-tip')); });
    scope.querySelectorAll('.tb-close').forEach(function (el) { el.setAttribute('aria-label', '关闭面板'); el.setAttribute('type', 'button'); });
    scope.querySelectorAll('.tb-item,.tb-card,.tb-sr,.mk-li[data-mk-go],.mk-li[data-mk-code],.mk-li.a,.mk-code-file').forEach(function (el) {
      if (el.tagName !== 'BUTTON' && el.tagName !== 'A') { el.setAttribute('role', 'button'); el.tabIndex = 0; }
    });
    scope.querySelectorAll('.tb-ans').forEach(function (el) {
      el.setAttribute('role', 'button'); el.tabIndex = 0;
      var revealed = el.classList.contains('tb-revealed');
      el.setAttribute('aria-label', revealed ? '答案：' + el.textContent.trim() + '，点击隐藏' : '显示答案');
      el.setAttribute('aria-expanded', String(el.classList.contains('tb-revealed')));
      var answerText = el.querySelector('.tb-ans-x');
      if (answerText) answerText.setAttribute('aria-hidden', String(!revealed));
    });
    scope.querySelectorAll('.tb-sinput').forEach(function (el) { el.setAttribute('aria-label', '搜索本章内容'); });
    scope.querySelectorAll('pre.code').forEach(function (el) { el.tabIndex = 0; el.setAttribute('aria-label', 'Python 代码，可横向滚动'); });
    scope.querySelectorAll('.mk-wave').forEach(function (el) { el.tabIndex = 0; el.setAttribute('aria-valuemin', '0'); el.setAttribute('aria-valuemax', '100'); el.setAttribute('aria-valuenow', '0'); });
    scope.querySelectorAll('svg').forEach(function (svg) { if (svg.closest('button') && !svg.hasAttribute('role')) svg.setAttribute('aria-hidden', 'true'); });
  }
  labelControls(document);
  var podcast = document.getElementById('mk-audio');
  function syncWaves() {
    document.querySelectorAll('.mk-wave').forEach(function (wave) {
      var pct = wave.children.length ? Math.round(wave.querySelectorAll('.mk-on').length / wave.children.length * 100) : 0;
      wave.setAttribute('aria-valuenow', String(pct));
      wave.setAttribute('aria-valuetext', '已播放 ' + pct + '%');
    });
  }
  if (podcast) ['timeupdate', 'loadedmetadata', 'ended'].forEach(function (name) { podcast.addEventListener(name, syncWaves); });
  var toast = document.getElementById('tb-toast');
  if (toast) { toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite'); }
  /* Both source browsers use the same truthful copy result and preserve focus. */
  function copyMessage(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('tb-show');
    clearTimeout(toast.__bookCopyTimer);
    toast.__bookCopyTimer = setTimeout(function () { toast.classList.remove('tb-show'); }, 2600);
  }
  function copyFallback(text) {
    var previous = document.activeElement, area = null, copied = false;
    try {
      area = document.createElement('textarea'); area.value = text;
      area.style.cssText = 'position:fixed;left:-10000px;top:0;opacity:0';
      document.body.appendChild(area); area.focus(); area.select();
      copied = document.execCommand('copy') === true;
    } catch (e) {} finally {
      if (area && area.parentNode) area.parentNode.removeChild(area);
      if (previous && previous.isConnected) previous.focus({ preventScroll: true });
    }
    return copied;
  }
  document.addEventListener('click', function (e) {
    var button = e.target.closest && e.target.closest('#mk-copy,.tb-copy');
    if (!button) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var inline = button.classList.contains('tb-copy');
    var source = inline ? button.closest('.tb-codewrap').querySelector('pre.code') : document.getElementById('mk-src-pre');
    var text = source ? source.textContent : '';
    if (inline) text = text.replace(/\u00a0/g, ' ');
    if (!text.trim()) { copyMessage('请先选择一个源码文件'); return; }
    function done() {
      if (inline) {
        var label = button.querySelector('span');
        button.classList.add('tb-copied'); if (label) label.textContent = '已复制';
        clearTimeout(button.__t);
        button.__t = setTimeout(function () { button.classList.remove('tb-copied'); if (label) label.textContent = '复制'; }, 1600);
      }
      copyMessage('源码已复制到剪贴板');
    }
    function fallback() {
      if (copyFallback(text)) done();
      else {
        button.classList.remove('tb-copied');
        var label = inline && button.querySelector('span'); if (label) label.textContent = '复制';
        copyMessage('复制失败，请选择代码复制或下载源码');
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { Promise.resolve(navigator.clipboard.writeText(text)).then(done, fallback); } catch (err) { fallback(); }
    } else fallback();
  }, true);
  var lastDialog = null, returnFocus = null;
  function dialogsChanged() {
    var overlay = document.querySelector('.tb-overlay.tb-show');
    var dialog = overlay && overlay.querySelector('.tb-panel');
    document.querySelectorAll('.tb-overlay').forEach(function (el) {
      el.setAttribute('aria-hidden', el === overlay ? 'false' : 'true');
      labelControls(el);
    });
    if (dialog === lastDialog) return;
    if (!lastDialog && dialog) returnFocus = document.activeElement;
    document.querySelectorAll('#deck,#nav,#tb-dock,#mk-mini').forEach(function (el) { el.inert = !!dialog; });
    root.classList.toggle('book-modal-open', !!dialog);
    if (dialog) {
      dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); dialog.tabIndex = -1;
      var title = dialog.querySelector('.tb-ptitle');
      dialog.setAttribute('aria-label', title ? title.textContent.trim() : '搜索本章内容');
      // Keep mobile keyboards closed until the reader selects the search field.
      var target = dialog.querySelector('.tb-close') || dialog;
      target.focus({ preventScroll: true });
    } else if (returnFocus && returnFocus.isConnected && !returnFocus.closest('[inert]')) {
      returnFocus.focus({ preventScroll: true });
    }
    lastDialog = dialog;
  }
  document.querySelectorAll('.tb-overlay').forEach(function (overlay) {
    new MutationObserver(dialogsChanged).observe(overlay, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
  });
  dialogsChanged();
  document.addEventListener('keydown', function (e) {
    var wave = e.target.closest && e.target.closest('.mk-wave');
    if (wave && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].indexOf(e.key) >= 0) {
      e.preventDefault();
      var pct = Number(wave.getAttribute('aria-valuenow')) || 0;
      pct = e.key === 'Home' ? 0 : e.key === 'End' ? 100 : Math.max(0, Math.min(100, pct + (e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5 : 5)));
      var bounds = wave.getBoundingClientRect();
      wave.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: bounds.left + bounds.width * pct / 100, clientY: bounds.top + bounds.height / 2 }));
      wave.setAttribute('aria-valuenow', String(pct));
    }
    var dialog = document.querySelector('.tb-overlay.tb-show .tb-panel');
    if (dialog && e.key === 'Tab') {
      var focusable = Array.from(dialog.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')).filter(function (el) { return !el.disabled && el.getClientRects().length; });
      var first = focusable[0], end = focusable[focusable.length - 1];
      if (!first) { e.preventDefault(); dialog.focus(); }
      else if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); end.focus(); }
      else if (!e.shiftKey && (document.activeElement === end || document.activeElement === dialog)) { e.preventDefault(); first.focus(); }
    }
    var target = e.target.closest && e.target.closest('[role="button"]');
    if (target && !/^(BUTTON|A)$/.test(target.tagName) && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); target.click(); }
  }, true);
  document.addEventListener('click', function (e) {
    var answer = e.target.closest('.tb-ans');
    if (answer) setTimeout(function () { labelControls(answer.parentNode); }, 0);
  });
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent || !e.data) return;
    if (e.data.type === 'book-layout') {
      root.classList.toggle('reader-mode', !!e.data.reader);
      window.scrollTo(0, 0);
      requestAnimationFrame(function () { scrollRegions(slides[cur()]); });
    }
    if (e.data.type === 'book-page' && Number.isInteger(e.data.index) && e.data.index >= 0 && e.data.index < slides.length && window.__deckGoTo) window.__deckGoTo(e.data.index);
    if (e.data.type === 'book-scroll' && root.classList.contains('reader-mode')) {
      var key = e.data.key;
      if (key === 'Home') window.scrollTo(0, 0);
      else if (key === 'End') window.scrollTo(0, document.documentElement.scrollHeight);
      else {
        var amount = key === 'ArrowUp' || key === 'ArrowDown' ? 48 : innerHeight * .85;
        var backwards = key === 'ArrowUp' || key === 'PageUp' || (key === ' ' && e.data.shiftKey);
        window.scrollBy(0, backwards ? -amount : amount);
      }
    }
  });
  var scrollRegionFrame = 0;
  function queueScrollRegions() {
    if (scrollRegionFrame) return;
    scrollRegionFrame = requestAnimationFrame(function () {
      scrollRegionFrame = 0;
      scrollRegions(slides[cur()]);
    });
  }
  window.addEventListener('resize', queueScrollRegions);
  // Font controls update the root style without a viewport resize.
  new MutationObserver(queueScrollRegions).observe(root, { attributes: true, attributeFilter: ['style'] });

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
