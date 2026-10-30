#!/usr/bin/env python3
"""逐份运行配套 Python 示例；使用无界面绘图、隔离目录和可续跑检查点。"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import importlib.metadata
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
DEPENDENCIES = ["numpy", "sympy", "networkx", "matplotlib"]


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "artifacts" / "source-examples")
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args()
    missing = [name for name in DEPENDENCIES if importlib.util.find_spec(name) is None]
    if missing:
        parser.error("缺少示例运行依赖：" + ", ".join(missing))
    environment = {"python": sys.version, "executable": sys.executable, "backend": "Agg", "dependencies": {name: importlib.metadata.version(name) for name in DEPENDENCIES}}
    output = args.output.resolve()
    for directory in [output, output / "logs", output / "cwd"]:
        directory.mkdir(parents=True, exist_ok=True)
    checkpoint_path = output / "checkpoint.json"
    checkpoint = {"version": 1, "environment": environment, "items": {}}
    if args.resume and checkpoint_path.exists():
        try:
            saved = json.loads(checkpoint_path.read_text(encoding="utf-8"))
            if saved.get("version") == 1 and saved.get("environment") == environment and isinstance(saved.get("items"), dict):
                checkpoint = saved
        except (ValueError, OSError):
            pass
    files = sorted((ROOT / "assets" / "source-code").glob("CH*/*.py"), key=lambda path: tuple(map(int, path.stem.split("."))))
    process_environment = {**os.environ, "MPLBACKEND": "Agg", "OPENBLAS_NUM_THREADS": "1", "OMP_NUM_THREADS": "1"}

    def run(path: Path) -> tuple[str, dict]:
        relative = path.relative_to(ROOT).as_posix()
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        saved = checkpoint["items"].get(relative, {})
        if args.resume and saved.get("sha256") == digest and saved.get("returncode") == 0:
            return relative, {**saved, "resumed": True}
        working = output / "cwd" / path.parent.name / path.stem
        working.mkdir(parents=True, exist_ok=True)
        started = time.monotonic()
        try:
            result = subprocess.run([sys.executable, "-I", "-X", "utf8", str(path)], cwd=working, env=process_environment, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=40, check=False)
            code = result.returncode
            stdout = result.stdout.decode("utf-8", errors="replace")
            stderr = result.stderr.decode("utf-8", errors="replace")
        except subprocess.TimeoutExpired as error:
            code = "timeout"
            stdout = (error.stdout or b"").decode("utf-8", errors="replace")
            stderr = (error.stderr or b"").decode("utf-8", errors="replace") + "\n超过40秒，已终止该示例进程。"
        if hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            code = "source-changed"
            stderr += "\n运行期间源码改变，请重新核验。"
        log = Path("logs") / f"{path.parent.name}-{path.stem}.txt"
        (output / log).write_text("STDOUT\n" + stdout + "\nSTDERR\n" + stderr, encoding="utf-8")
        return relative, {"sha256": digest, "returncode": code, "seconds": round(time.monotonic() - started, 3), "stdout_chars": len(stdout), "stderr": stderr[-5000:], "log": log.as_posix()}

    records: dict[str, dict] = {}
    with ThreadPoolExecutor(max_workers=2) as executor:
        for future in as_completed([executor.submit(run, path) for path in files]):
            name, result = future.result()
            records[name] = result
            checkpoint["items"][name] = result
            temporary = checkpoint_path.with_suffix(".json.tmp")
            temporary.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2), encoding="utf-8")
            temporary.replace(checkpoint_path)
            if result["returncode"] != 0:
                print(f"✗ {name}：{result['returncode']}\n{result['stderr'][-1000:]}", flush=True)
            if len(records) % 50 == 0:
                print(f"已检查 {len(records)} / {len(files)}，检查点已保存。", flush=True)
    failed = {name: result for name, result in records.items() if result["returncode"] != 0}
    report = {"environment": environment, "files": len(files), "passed": len(records) - len(failed), "failed": failed, "results": dict(sorted(records.items()))}
    (output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"配套源码运行：{report['passed']}/{len(files)} 通过；报告：{output / 'report.json'}")
    return int(bool(failed))


if __name__ == "__main__":
    raise SystemExit(main())
