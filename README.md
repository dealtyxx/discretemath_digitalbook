# 离散数学 · 交互式数字教材

《离散数学：基于 Python 语言的实现》交互式数字教材 —— 11 章 996 页，每个小节配微课视频、播客音频与可运行的 Python 配套源码。

新版增加 **11 章交互实验室**：在不删减原教材的前提下，用 React、TypeScript、Three.js / React Three Fiber、KaTeX 与 SVG 构建可旋转、可编辑、可单步回放的数学模型。实验与章节入口双向链接，学习记录仅保存在浏览器本地。

在线阅读：<https://dealtyxx.github.io/discretemath_digitalbook/>　｜　阅读操作说明见 [使用说明.md](使用说明.md)

## 内容概览

| 项目 | 数量 | 说明 |
|------|------|------|
| 章 / 页 | 11 章 / 996 页 | 定义、定理、例题、应用动画、Python 实现、自测习题 |
| 微课视频 | 36 讲，约 294 分钟 | `assets/micro-lectures/`，按需加载 |
| 播客音频 | 36 期，约 318 分钟 | `assets/podcasts/`（MP3），另有作者声明 |
| 配套源码 | 253 段，3858 行 | `assets/source-code/CH1`…`CH11`，内嵌于正文并可下载 |
| 应用动画 | 107 段 | `assets/app-videos-ch1`…`ch11`，翻到所在页才加载 |
| 交互实验 | 11 章 | 计数/RSA、布尔立方体、关系闭包、哈斯图、逻辑、图算法、代数结构等 |

## 目录结构

```
index.html                      全书目录（章节卡片、阅读进度、作者声明音频、实验室入口）
interactive/                   交互实验室源码（React + TypeScript）
  src/components/             共享 KaTeX 公式与教学步骤播放器
  src/lib/                    独立数学模型与 Vitest 单元测试
  src/labs/                   第 1—11 章实验界面，按章懒加载
lab/                          构建后的交互实验室（HTTP 模块版 + file 直开版）
  offline/                    自包含脚本与样式，内嵌全部字体，无需本地服务
离散数学_第N章_*.html            章节入口页：整页版式 / 流式阅读，可用 ?p=页码 直达
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

浏览器直接打开 `index.html` 即可阅读教材并进入交互实验室，全站不依赖外部网络。
`lab/index.html` 会自动选择本地文件直开版本或 HTTP 模块版本；11 章实验、公式、字体与三维场景均可离线使用。

Windows 可双击 `打开教材.cmd`，使用已安装的 Python 3 启动本地服务并打开浏览器。
服务仅监听 `127.0.0.1`，支持音视频拖动进度；端口占用时自动选择相邻端口，不需要外部网络或第三方 Python 库。
也可运行 `python -I tools/serve.py`。关闭服务窗口即可停止。
直接以 `file://` 打开教材正文时使用系统字体和 SVG 数学公式；实验室直开版自带内嵌字体。

首次构建交互实验室：

```bash
npm install --ignore-scripts
npm run build
```

构建后可从各章右上角「交互实验」进入对应章节，也可直接访问 `lab/index.html?chapter=2`。

若需本地起服务进行开发或预览：

```bash
npx http-server . -p 8080 -c-1     # 或 python 之外的任意静态服务器
```

推荐 Chrome / Edge / Safari / Firefox 的最新版本。

手机竖屏默认使用「流式阅读」，正文、表格与公式适应屏幕宽度；顶部可切换回「整页版式」。
流式模式下使用底部按钮、页码输入框或左右方向键翻页，上下方向键、PageUp / PageDown 与滚轮滚动当前页。
长公式、宽表格和源码保持完整，可在各自区域横向滚动；对话框支持 Tab 环绕和 Esc 关闭。

## 设计与性能要点

- **风格**：「笛卡尔」博物馆图录风格 —— 石色纸面、墨色文字、一像素线条；全站共用同一套色彩与字体。
- **自托管字体**：字体随站点分发（SIL OFL 1.1），HTTP 与本地服务使用相同字体，无外部字体请求；直接打开本地文件时使用系统字体，避免浏览器的跨文件字体限制。
  中文字体按字频切片，页面只下载实际用到的分片。
- **公式按页排版**：MathJax 只排版当前页及邻近页，其余页在空闲时逐页完成，章节打开不再整章卡顿。
- **非当前页不参与渲染**：`content-visibility` 让几十上百页同时存在于 DOM 却几乎不产生排版开销。
- **媒体按需加载**：微课视频点击播放才读取；应用动画翻到该页才设置 `src`；播客由常驻迷你播放器统一控制。

## 维护

- 重新生成字体子集（正文用字变化后）：`python3 tools/build_fonts.py`（说明见脚本头部）。
- 版面回归检查（需 Playwright）：`node tools/audit.mjs`，逐页检测溢出、公式排版错误与控制台报错。
- 修改章节正文后，请同步检查 `assets/source-code/` 中对应源码，二者应保持一致。
- 数学模型位于 `interactive/src/lib/`，与 React 渲染分离；修改后运行 `npm test`。
- 交互实验构建与类型检查：`npm run build`；11 章桌面/移动端浏览器回归：`node tools/audit-labs.mjs`。
- 内容完整性检查（需 Python 与 ffprobe）：`python -I tools/verify-content.py`，核验 996 页、源码语法与嵌入、180 个媒体流、站内引用和构建入口，报告写入 `artifacts/content-report.json`。
- 配套源码实际运行：`python -I tools/audit-source-examples.py`。逐份执行 253 个示例，使用隔离目录、UTF-8 与无界面绘图后端，不打开图窗；需已有 `numpy`、`sympy`、`networkx`、`matplotlib`。
  报告与逐文件日志写入 `artifacts/source-examples/`，加 `--resume` 可复用源码和运行环境均未变化的成功结果。
- 内容核验也支持 `--resume` 和 `--output`。源码与媒体按 SHA-256 保存检查点；内嵌源码的实际内容、行数与分节归属每次重新核对。
- 成功构建后自动清理过期的哈希资源，并生成 `lab/build-manifest.json`；内容核验会检查全部编译输入和产物的哈希，防止源码更新后继续分发旧离线包。
- 步骤播放器恢复完整数据快照，不以动画倒放代替算法回退；三维场景只用于布尔编码与空间对称等具有明确几何意义的内容。
- `audit:book` 每 50 页保存检查点；加 `--resume` 续跑。`audit:labs` 按场景保存并支持同一参数。
  源码或资源发生变化时，旧检查结果自动失效。`AUDIT_OUTPUT` 可指定报告根目录，分别写入 `book/` 和 `labs/`。
- 设置 `AUDIT_PROTOCOL=file` 可检查本地文件直开；教材与实验室报告分别写入 `book-file/`、`labs-file/`。
- `npm run build` 会同时生成模块版和直开版；不要只执行 `vite build`，否则缺少本地协议的自包含产物。
- 公式排版作为渐进增强：加载或辅助线程失败时也显示正文；本地文件禁用不受支持的语音线程，保留辅助 MathML。审查同时检查文字真实可见性与公式最终状态。
- 三维渲染不可用或上下文丢失时，第 2 章提供二维哈斯图，第 10 章保留二维面位置示意、矩阵与置换；章节模块加载失败时保留目录、学习路径与自测，并提供重新载入入口。

## 内容审校与规范依据

2026-10-29 的迭代覆盖数学定义、量词规则、图论、代数实例及交互算法，重点纠正缺失前提和混淆概念。
参考 [Judson 开放代数教材](https://judsonbooks.org/aata-files/aata-html/aata.html)、
[OpenLogic 量词推理规则](https://forallx.openlogicproject.org/html/Ch36.html) 与
[NIST 同态加密说明](https://csrc.nist.gov/Projects/pec/fhe)。
界面审查采用 [Vercel Web Design Guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)
和 [React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)，
保留现有教材风格，重点落实键盘操作、存储容错、阅读对比度及按需加载。

## 分发说明

- 整个文件夹即为完整教材，可整体拷贝 / 压缩分发；内部相对路径不可打乱。
- 完整体积约 **770 MB**（微课视频约 554 MB、播客音频约 92 MB、应用动画约 100 MB）。
  需要精简分发时可单独移除 `assets/micro-lectures`，其余功能不受影响，仅微课视频页无法播放。
- `assets/source-code/book-code-v2-20250513.zip` 为《书内配套代码》原始归档，仅作存档。

## 许可与版权

离散数学数字化教材©2026 湖南信息学院 ｜ 作者：谢鑫

第三方组件：MathJax（Apache-2.0）；字体见 `assets/fonts/LICENSES.txt`（均为 SIL OFL 1.1）。
