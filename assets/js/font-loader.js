/* file:// 的不透明来源不能跨文件读取字体；本地文件使用系统字体，HTTP 使用自托管字体。 */
(function () {
  'use strict';
  if (location.protocol === 'file:') {
    document.documentElement.classList.add('local-fonts');
    return;
  }
  var style = document.createElement('link');
  style.rel = 'stylesheet'; style.href = 'assets/fonts/fonts.css';
  document.head.appendChild(style);
  ['noto-serif-sc-400-a.woff2', 'inter-latin.woff2', 'playfair-display-latin.woff2'].forEach(function (name) {
    var preload = document.createElement('link');
    preload.rel = 'preload'; preload.href = 'assets/fonts/' + name;
    preload.as = 'font'; preload.type = 'font/woff2'; preload.crossOrigin = 'anonymous';
    document.head.appendChild(preload);
  });
})();
