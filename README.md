# 离散数学 · 交互式数字教材

《离散数学：基于 Python 语言的实现》交互式数字教材 —— 11 章 996 页，每个小节配微课视频、播客音频与可运行的 Python 配套源码。

在线阅读：<https://dealtyxx.github.io/discretemath_digitalbook/>　｜　阅读操作说明见 [使用说明.md](使用说明.md)

## 内容概览

| 项目 | 数量 | 说明 |
|------|------|------|
| 章 / 页 | 11 章 / 996 页 | 定义、定理、例题、应用动画、Python 实现、自测习题 |
| 微课视频 | 36 讲，约 294 分钟 | `assets/micro-lectures/`，按需加载 |
| 播客音频 | 36 期，约 318 分钟 | `assets/podcasts/`（MP3），另有作者声明 |
| 配套源码 | 253 段，3822 行 | `assets/source-code/CH1`…`CH11`，内嵌于正文并可下载 |
| 应用动画 | 107 段 | `assets/app-videos-ch1`…`ch11`，翻到所在页才加载 |

## 目录结构

```
index.html                      全书目录（章节卡片、阅读进度、作者声明音频）
离散数学_第N章_*.html            章节入口页（外壳）：1920×1080 固定版心等比缩放
离散数学_第N章_*.body.html       章节正文（由入口页以 iframe 载入，勿单独打开）
assets/
  fonts/                        自托管字体（Noto Serif SC 分片子集、Playfair Display、Inter、DM Mono）
  css/  shell.css               入口页样式
        book-polish.css         正文增强样式（非当前页跳过渲染、排版细节、焦点态）
  js/   shell.js                入口页脚本（缩放、载入提示、快捷键转发、全屏）
        book-polish.js          正文增强脚本（MathJax 按页排版、邻页预热、动画按需加载）
  mathjax/  @mathjax/           公式渲染引擎（本地化，离线可用）
  micro-lectures/  podcasts/  source-code/  app-videos-ch*/
tools/                          维护脚本（字体子集构建、版面回归检查）
```

## 本地预览

浏览器直接打开 `index.html` 即可，全站不依赖任何外部网络资源。
若需本地起服务（推荐，视频拖动进度依赖 Range 请求）：

```bash
npx http-server . -p 8080 -c-1     # 或 python 之外的任意静态服务器
```

推荐 Chrome / Edge / Safari / Firefox 的最新版本。

## 设计与性能要点

- **风格**：「笛卡尔」博物馆图录风格 —— 石色纸面、墨色文字、一像素线条；全站共用同一套色彩与字体。
- **自托管字体**：字体随站点分发（SIL OFL 1.1），国内网络与离线环境下排版一致，无外部字体请求。
  中文字体按字频切片，页面只下载实际用到的分片。
- **公式按页排版**：MathJax 只排版当前页及邻近页，其余页在空闲时逐页完成，章节打开不再整章卡顿。
- **非当前页不参与渲染**：`content-visibility` 让几十上百页同时存在于 DOM 却几乎不产生排版开销。
- **媒体按需加载**：微课视频点击播放才读取；应用动画翻到该页才设置 `src`；播客由常驻迷你播放器统一控制。

## 维护

- 重新生成字体子集（正文用字变化后）：`python3 tools/build_fonts.py`（说明见脚本头部）。
- 版面回归检查（需 Playwright）：`node tools/audit.mjs`，逐页检测溢出、公式排版错误与控制台报错。
- 修改章节正文后，请同步检查 `assets/source-code/` 中对应源码，二者应保持一致。

## 分发说明

- 整个文件夹即为完整教材，可整体拷贝 / 压缩分发；内部相对路径不可打乱。
- 完整体积约 **770 MB**（微课视频约 554 MB、播客音频约 92 MB、应用动画约 100 MB）。
  需要精简分发时可单独移除 `assets/micro-lectures`，其余功能不受影响，仅微课视频页无法播放。
- `assets/source-code/book-code-v2-20250513.zip` 为《书内配套代码》原始归档，仅作存档。

## 许可与版权

离散数学数字化教材©2026 湖南信息学院 ｜ 作者：谢鑫

第三方组件：MathJax（Apache-2.0）；字体见 `assets/fonts/LICENSES.txt`（均为 SIL OFL 1.1）。
