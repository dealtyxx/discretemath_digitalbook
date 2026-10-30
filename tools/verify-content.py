#!/usr/bin/env python3
"""核验教材页数、源码、媒体、站内引用与实验室构建产物。"""
from __future__ import annotations

import ast
import argparse
import hashlib
import json
import re
import subprocess
import sys
import tokenize
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_PAGES = [92, 97, 109, 105, 91, 74, 71, 126, 79, 73, 79]
MEDIA_DIRECTORIES = {
    "micro_lectures": ("micro-lectures", ".mp4", 36),
    "podcasts": ("podcasts", ".mp3", 37),
    "application_videos": ("app-videos", ".mp4", 107),
}


class DocumentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.labels: list[str] = []
        self.fragments: list[str] = []
        self.references: list[str] = []
        self.slide_count = 0
        self.source_json_parts: list[str] = []
        self.in_source_json = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "script" and attributes.get("id") == "mk-data":
            self.in_source_json = True
        if attributes.get("id"):
            self.ids.append(attributes["id"] or "")
        if tag == "label" and attributes.get("for"):
            self.labels.append(attributes["for"] or "")
        classes = (attributes.get("class") or "").split()
        if "slide" in classes:
            self.slide_count += 1
        for name in ("src", "href", "poster", "data-app-video", "data-video", "data-audio"):
            value = attributes.get(name)
            if not value:
                continue
            if name == "href" and value.startswith("#") and len(value) > 1:
                self.fragments.append(unquote(value[1:]))
            elif not value.startswith(("#", "http:", "https:", "mailto:", "data:", "javascript:")):
                self.references.append(value.split("#", 1)[0])

    def handle_data(self, data: str) -> None:
        if self.in_source_json:
            self.source_json_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script":
            self.in_source_json = False


def chapter_number(path: Path) -> int:
    match = re.search(r"第(\d+)章", path.name)
    if not match:
        raise ValueError(f"无法识别章节：{path.name}")
    return int(match.group(1))


def probe_media(path: Path) -> tuple[bool, str]:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries",
            "stream=codec_type,codec_name,width,height,duration",
            "-of", "json", str(path),
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
        check=False,
    )
    if result.returncode:
        return False, result.stderr.strip()[:300]
    try:
        streams = json.loads(result.stdout).get("streams", [])
    except json.JSONDecodeError as error:
        return False, str(error)
    expected = "audio" if path.suffix.lower() == ".mp3" else "video"
    if not any(stream.get("codec_type") == expected for stream in streams):
        return False, f"缺少 {expected} 流"
    return True, ""


def main() -> int:
    options = argparse.ArgumentParser(description=__doc__)
    options.add_argument("--resume", action="store_true")
    options.add_argument("--output", type=Path, default=ROOT / "artifacts")
    args = options.parse_args()
    output_directory = args.output.resolve()
    output_directory.mkdir(parents=True, exist_ok=True)
    checkpoint_path = output_directory / "content-checkpoint.json"
    probe_version = subprocess.run(["ffprobe", "-version"], capture_output=True, text=True, check=True).stdout.splitlines()[0]
    environment = {"root": str(ROOT), "python": sys.version, "ffprobe": probe_version}
    checkpoint = {"version": 1, "environment": environment, "sources": {}, "media": {}}
    if args.resume and checkpoint_path.is_file():
        try:
            saved = json.loads(checkpoint_path.read_text(encoding="utf-8"))
            if saved.get("version") == 1 and saved.get("environment") == environment and isinstance(saved.get("sources"), dict) and isinstance(saved.get("media"), dict):
                checkpoint = saved
        except (OSError, ValueError):
            pass
    def save_checkpoint() -> None:
        temporary = checkpoint_path.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2), encoding="utf-8")
        temporary.replace(checkpoint_path)

    errors: list[str] = []
    root_html = sorted(ROOT.glob("*.html"))
    bodies = sorted(ROOT.glob("*.body.html"), key=chapter_number)
    shells = sorted(
        (path for path in root_html if not path.name.endswith(".body.html") and path.name != "index.html"),
        key=chapter_number,
    )
    if len(root_html) != 23 or len(bodies) != 11 or len(shells) != 11:
        errors.append(f"HTML 数量异常：根级 {len(root_html)}，正文 {len(bodies)}，外壳 {len(shells)}")

    pages_by_chapter: dict[int, int] = {}
    html_references: list[str] = []
    body_texts: dict[int, str] = {}
    embedded_sources: dict[int, dict] = {}
    for path in root_html:
        text = path.read_text(encoding="utf-8")
        parser = DocumentParser()
        parser.feed(text)
        duplicates = sorted(name for name, count in Counter(parser.ids).items() if count > 1)
        if duplicates:
            errors.append(f"{path.name} 重复 ID：{duplicates}")
        missing_labels = sorted(set(parser.labels) - set(parser.ids))
        if missing_labels:
            errors.append(f"{path.name} label 目标缺失：{missing_labels}")
        missing_fragments = sorted(set(parser.fragments) - set(parser.ids))
        if missing_fragments:
            errors.append(f"{path.name} 页内锚点缺失：{missing_fragments}")
        html_references.extend(parser.references)
        if path in bodies:
            number = chapter_number(path)
            pages_by_chapter[number] = parser.slide_count
            body_texts[number] = text
            try:
                data = json.loads("".join(parser.source_json_parts))
                if not isinstance(data, dict) or data.get("ch") != number or not isinstance(data.get("files"), dict):
                    raise ValueError("章节号或 files 格式错误")
                embedded_sources[number] = data["files"]
                if data.get("nc") != len(data["files"]):
                    errors.append(f"{path.name} 内嵌源码数量字段 nc 不正确")
                listed_files = [name for section in data.get("sections", []) for name in section.get("c", {}).get("files", [])]
                if Counter(listed_files) != Counter(data["files"].keys()):
                    errors.append(f"{path.name} 分节源码清单与内嵌源码不一致")
            except (json.JSONDecodeError, ValueError, TypeError, AttributeError) as error:
                errors.append(f"{path.name} 内嵌源码数据错误：{error}")
        if path in shells:
            number = chapter_number(path)
            if f"lab/index.html?chapter={number}" not in text:
                errors.append(f"{path.name} 缺少或错配第 {number} 章实验室入口")
        for match in re.finditer(r"(?:assets|lab)/[^\s\"'<>]+\.[A-Za-z0-9]+", text):
            html_references.append(match.group(0).rstrip("),;"))

    pages = [pages_by_chapter.get(number, 0) for number in range(1, 12)]
    if pages != EXPECTED_PAGES:
        errors.append(f"页数异常：{pages}，合计 {sum(pages)}")

    index_text = (ROOT / "index.html").read_text(encoding="utf-8")
    for shell in shells:
        if shell.name not in index_text:
            errors.append(f"教材首页缺少 {shell.name} 入口")

    missing_references: list[str] = []
    for reference in sorted(set(html_references)):
        clean = unquote(reference).split("?", 1)[0]
        if not clean or clean.startswith("../"):
            continue
        if not (ROOT / clean).is_file():
            missing_references.append(reference)
    if missing_references:
        errors.append(f"站内资源引用缺失：{missing_references}")

    source_files = sorted((ROOT / "assets" / "source-code").glob("CH*/*.py"))
    source_lines = 0
    source_errors: list[str] = []
    unembedded_sources: list[str] = []
    source_embedding_errors: list[str] = []
    source_embedding_verified = 0
    source_syntax_resumed = 0
    for path in source_files:
        relative = path.relative_to(ROOT).as_posix()
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        try:
            with tokenize.open(path) as handle:
                source = handle.read()
            cached = checkpoint["sources"].get(relative, {})
            if args.resume and cached.get("sha256") == digest and cached.get("ok") is True:
                source_syntax_resumed += 1
            else:
                ast.parse(source, filename=str(path))
            source_lines += len(source.splitlines())
            checkpoint["sources"][relative] = {"sha256": digest, "ok": True}
            save_checkpoint()
        except (SyntaxError, UnicodeError) as error:
            source_errors.append(f"{path.relative_to(ROOT)}：{error}")
            checkpoint["sources"][relative] = {"sha256": digest, "ok": False}
            save_checkpoint()
            continue
        match = re.fullmatch(r"CH(\d+)", path.parent.name, re.IGNORECASE)
        if not match or int(match.group(1)) not in embedded_sources:
            unembedded_sources.append(str(path.relative_to(ROOT)))
            continue
        records = embedded_sources[int(match.group(1))]
        record = records.get(path.name)
        if not isinstance(record, dict) or not isinstance(record.get("src"), str):
            unembedded_sources.append(str(path.relative_to(ROOT)))
            continue
        embedded = record["src"]
        embedding_issue_count = len(source_embedding_errors)
        if record.get("dir") != path.parent.name or record.get("sec") != ".".join(path.stem.split(".")[:2]):
            source_embedding_errors.append(f"{path.relative_to(ROOT)}：内嵌章节或小节不匹配")
        if record.get("lines") != len(embedded.splitlines()):
            source_embedding_errors.append(f"{path.relative_to(ROOT)}：内嵌行数不正确")
        if source.replace("\r\n", "\n").rstrip("\n") != embedded.replace("\r\n", "\n").rstrip("\n"):
            source_embedding_errors.append(f"{path.relative_to(ROOT)}：下载源码与内嵌正文内容不一致")
        if len(source_embedding_errors) == embedding_issue_count:
            source_embedding_verified += 1
    for number, records in embedded_sources.items():
        actual_names = {path.name for path in source_files if path.parent.name == f"CH{number}"}
        extra_names = sorted(set(records) - actual_names)
        if extra_names:
            source_embedding_errors.append(f"第{number}章内嵌了不存在的源码：{extra_names}")
    if len(source_files) != 253:
        errors.append(f"Python 源码数量异常：{len(source_files)}")
    if source_errors:
        errors.append(f"Python 语法错误：{source_errors}")
    if unembedded_sources:
        errors.append(f"源码未嵌入对应章节：{unembedded_sources}")
    if source_embedding_errors:
        errors.append(f"内嵌源码不一致：{source_embedding_errors}")

    media_files: list[Path] = []
    media_counts: dict[str, int] = {}
    for category, (directory, suffix, expected) in MEDIA_DIRECTORIES.items():
        if directory == "app-videos":
            files = sorted((ROOT / "assets").glob("app-videos-ch*/*.mp4"))
        else:
            files = sorted((ROOT / "assets" / directory).glob(f"*{suffix}"))
        media_counts[category] = len(files)
        media_files.extend(files)
        if len(files) != expected:
            errors.append(f"{category} 数量异常：{len(files)}，应为 {expected}")

    media_errors: list[str] = []
    media_resumed = 0
    for path in media_files:
        relative = path.relative_to(ROOT).as_posix()
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        cached = checkpoint["media"].get(relative, {})
        if args.resume and cached.get("sha256") == digest and cached.get("ok") is True:
            valid, detail = True, ""
            media_resumed += 1
        else:
            valid, detail = probe_media(path)
        checkpoint["media"][relative] = {"sha256": digest, "ok": valid, "detail": detail}
        save_checkpoint()
        if not valid:
            media_errors.append(f"{path.relative_to(ROOT)}：{detail}")
    if media_errors:
        errors.append(f"媒体流检查失败：{media_errors}")

    actual_media = {path.relative_to(ROOT).as_posix() for path in media_files}
    textbook_text = "\n".join([index_text, *body_texts.values()])
    media_reference_list = re.findall(r"assets/[^\s\"'<>]+?\.(?:mp4|mp3)", textbook_text, re.IGNORECASE)
    referenced_media = set(media_reference_list)
    missing_media = sorted(referenced_media - actual_media)
    unused_media = sorted(actual_media - referenced_media)
    if missing_media or unused_media or len(referenced_media) != 180:
        errors.append(
            f"媒体引用不一一对应：唯一引用 {len(referenced_media)} 个，"
            f"缺失 {missing_media}，闲置 {unused_media}"
        )

    build_parser = DocumentParser()
    build_parser.feed((ROOT / "lab" / "index.html").read_text(encoding="utf-8"))
    build_missing = [
        reference for reference in build_parser.references
        if not (ROOT / "lab" / reference).resolve().is_file()
    ]
    if build_missing:
        errors.append(f"实验室构建资源缺失：{build_missing}")
    # The entry selects module or classic assets at runtime; HTML src/href alone is insufficient.
    lab_index = (ROOT / "lab" / "index.html").read_text(encoding="utf-8")
    distribution = re.search(r"var paths=(\{[^\n]+\});", lab_index)
    distribution_paths: dict[str, str] = {}
    if distribution:
        try:
            distribution_paths = json.loads(distribution.group(1))
        except json.JSONDecodeError:
            errors.append("实验室协议入口配置无法解析")
    if set(distribution_paths) != {"moduleScript", "moduleStyle", "offlineScript", "offlineStyle"}:
        errors.append("实验室缺少 HTTP / file 双入口构建配置")
    for name, reference in distribution_paths.items():
        asset = (ROOT / "lab" / reference).resolve()
        if not asset.is_relative_to((ROOT / "lab").resolve()) or not asset.is_file() or asset.stat().st_size < 1000:
            errors.append(f"实验室运行时资源缺失：{name} = {reference}")
    offline_css = ROOT / "lab" / "offline" / "book-lab.css"
    if offline_css.is_file():
        urls = re.findall(r"url\(([^)]+)\)", offline_css.read_text(encoding="utf-8"))
        if any(not url.strip("\"' ").startswith(("data:", "#")) for url in urls):
            errors.append("实验室本地直开样式仍依赖外部字体文件")
    build_asset_count = sum(1 for path in (ROOT / "lab" / "assets").iterdir() if path.is_file())

    manifest_source_count = 0
    manifest_output_count = 0
    try:
        manifest = json.loads((ROOT / "lab" / "build-manifest.json").read_text(encoding="utf-8"))
        if manifest.get("version") != 1:
            raise ValueError("未知清单版本")
        required_sources = {path.relative_to(ROOT).as_posix() for directory in [ROOT / "interactive" / "src", ROOT / "assets" / "fonts"] for path in directory.rglob("*") if path.is_file()}
        required_sources.update(["interactive/index.html", "interactive/tsconfig.json", "package.json", "package-lock.json", "vite.config.ts", "tools/build-lab.mjs"])
        actual_sources = [record["path"] for record in manifest["sources"]]
        if set(actual_sources) != required_sources or len(actual_sources) != len(set(actual_sources)):
            errors.append("构建清单未完整覆盖当前源码，请重新构建")
        for key, base in [("sources", ROOT), ("files", ROOT / "lab")]:
            records = manifest[key]
            if not isinstance(records, list) or not records:
                raise ValueError(f"{key} 清单为空或格式错误")
            for record in records:
                absolute = (base / record["path"]).resolve()
                if not absolute.is_relative_to(base.resolve()) or not absolute.is_file():
                    errors.append(f"构建清单路径缺失或越界：{record['path']}")
                    continue
                contents = absolute.read_bytes()
                if hashlib.sha256(contents).hexdigest() != record["sha256"] or (key == "files" and len(contents) != record["bytes"]):
                    errors.append(f"源码与构建清单不匹配：{record['path']}")
            if key == "sources":
                manifest_source_count = len(records)
            else:
                manifest_output_count = len(records)
        declared_assets = {record["path"] for record in manifest["files"] if record["path"].startswith("assets/")}
        present_assets = {"assets/" + path.name for path in (ROOT / "lab" / "assets").iterdir() if path.is_file()}
        if declared_assets != present_assets:
            errors.append(f"构建目录有未声明的旧资源或缺失文件：{sorted(present_assets ^ declared_assets)}")
        declared_outputs = {record["path"] for record in manifest["files"]}
        if not {"index.html", "offline/book-lab.js", "offline/book-lab.css"}.issubset(declared_outputs):
            errors.append("构建清单缺少入口或离线文件")
    except (OSError, ValueError, KeyError, TypeError) as error:
        errors.append(f"构建清单核验失败：{error}")

    report = {
        "chapters": len(bodies),
        "pages_per_chapter": pages,
        "total_pages": sum(pages),
        "root_html_files": len(root_html),
        "source_files": len(source_files),
        "source_lines": source_lines,
        "source_embedding_verified": source_embedding_verified,
        "source_syntax_resumed": source_syntax_resumed,
        "media_counts": media_counts,
        "media_probed": len(media_files) - len(media_errors),
        "media_references": len(referenced_media),
        "media_resumed": media_resumed,
        "media_reference_occurrences": len(media_reference_list),
        "static_reference_count": len(set(html_references)),
        "missing_static_references": missing_references,
        "lab_build_assets": build_asset_count,
        "lab_distribution_assets": distribution_paths,
        "build_manifest_sources": manifest_source_count,
        "build_manifest_outputs": manifest_output_count,
        "errors": errors,
    }
    output = output_directory / "content-report.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"章节与页数：{len(bodies)} 章，{pages}，合计 {sum(pages)} 页")
    print(f"源码：{len(source_files)} 个 Python 文件，{source_lines} 行，语法与章节嵌入检查完成")
    print(f"媒体：{media_counts}，ffprobe 通过 {len(media_files) - len(media_errors)}/{len(media_files)}")
    print(f"引用：{len(set(html_references))} 个静态路径，{len(referenced_media)} 个唯一媒体文件，{len(media_reference_list)} 条引用位置")
    print(f"实验室构建：{build_asset_count} 个资源文件，入口资源缺失 {len(build_missing)}")
    if errors:
        for error in errors:
            print(f"✗ {error}", file=sys.stderr)
        return 1
    print(f"✓ 内容完整性核验通过，报告：{output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
