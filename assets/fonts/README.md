# 本地字体

教材所用字体已全部本地化，页面不再请求 Google Fonts，断网或在 Google 服务不可用的网络环境下显示效果一致。
各页面通过 `assets/fonts/fonts.css` 引用这些字体。

| 字体 | 用途 | 文件 | 说明 |
|------|------|------|------|
| Inter | 正文西文、界面文字 | `inter-*.woff2` | Google Fonts 原版文件，保留 latin / latin-ext / greek 子集 |
| Playfair Display | 标题西文（含斜体） | `playfair-display-*.woff2` | Google Fonts 原版文件，保留 latin / latin-ext 子集 |
| DM Mono | 编号、代码类标注 | `dm-mono-*.woff2` | Google Fonts 原版文件，400 / 500 两个字重 |
| Noto Serif SC | 全部中文 | `noto-serif-sc-subset.woff2` | 由上游可变字体（字重 200–900）裁剪为书中实际出现的字符，约 520 KB |

四款字体均采用 SIL Open Font License 1.1 授权，许可证原文见 `LICENSES/`。

## 新增文字后重新生成

中文字体只包含书中已出现的字符。若修改正文后出现新的汉字，新字会回退为系统字体显示。
此时在仓库根目录运行（需联网）：

```bash
python3 -m pip install fonttools brotli
python3 tools/build_fonts.py
```

脚本会扫描根目录下全部 `.html` 文件中的字符，重新下载并裁剪字体，同时更新 `fonts.css`。
