#!/usr/bin/env python3
"""无需第三方依赖的本地教材服务：支持字体、ES 模块、媒体 Range 和离线阅读。"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import socket
import urllib.parse
import urllib.request
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IDENTITY = hashlib.sha256(str(ROOT).encode('utf-8')).hexdigest()[:16]
HEALTH = '/_book_health'

class BookServer(ThreadingHTTPServer):
    # Windows SO_REUSEADDR can bind a second listener to an already active
    # port. Own the port exclusively so the adjacent-port fallback is reliable.
    allow_reuse_address = not hasattr(socket, 'SO_EXCLUSIVEADDRUSE')

    def server_bind(self) -> None:
        if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def same_book_running(address: str) -> bool:
    try:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(address + HEALTH.lstrip('/'), timeout=.5) as response:
            payload = json.loads(response.read(4096))
        return isinstance(payload, dict) and payload.get('book') == IDENTITY
    except (OSError, ValueError):
        return False

class BookHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg'}

    def log_message(self, fmt: str, *args: object) -> None:
        if args and str(args[1] if len(args) > 1 else '').startswith(('4', '5')):
            super().log_message(fmt, *args)

    def end_headers(self) -> None:
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def send_head(self):
        self.byte_range = None
        url = urllib.parse.urlsplit(self.path)
        if url.path == HEALTH:
            import io
            payload = json.dumps({'book': IDENTITY}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            return io.BytesIO(payload)
        path = Path(self.translate_path(url.path)).resolve()
        if not path.is_relative_to(ROOT):
            self.send_error(403, 'Path outside book directory')
            return None
        if path.is_dir():
            if not url.path.endswith('/'):
                self.send_response(301)
                self.send_header('Location', urllib.parse.urlunsplit(('', '', url.path+'/', url.query, '')))
                self.send_header('Content-Length', '0')
                self.end_headers()
                return None
            path = path / 'index.html'
        if not path.is_file():
            self.send_error(404, 'Book resource not found')
            return None
        source = path.open('rb')
        size = path.stat().st_size
        value = self.headers.get('Range')
        if value:
            match = re.fullmatch(r'bytes=(\d*)-(\d*)', value.strip())
            try:
                if not match or not any(match.groups()) or not size:
                    raise ValueError
                left, right = match.groups()
                start = int(left) if left else max(0, size - int(right))
                end = min(size-1, int(right)) if left and right else size-1
                if start < 0 or start >= size or end < start:
                    raise ValueError
            except ValueError:
                source.close()
                self.send_response(416)
                self.send_header('Content-Range', f'bytes */{size}')
                self.send_header('Content-Length', '0')
                self.end_headers()
                return None
            self.byte_range = (start, end)
            source.seek(start)
            self.send_response(206)
            self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
            length = end - start + 1
        else:
            self.send_response(200)
            length = size
        self.send_header('Content-Type', self.guess_type(str(path)))
        self.send_header('Content-Length', str(length))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Last-Modified', self.date_time_string(path.stat().st_mtime))
        self.end_headers()
        return source

    def copyfile(self, source, outputfile) -> None:
        try:
            if self.byte_range is None:
                shutil.copyfileobj(source, outputfile, 256 * 1024)
            else:
                remaining = self.byte_range[1] - self.byte_range[0] + 1
                while remaining:
                    chunk = source.read(min(remaining, 256 * 1024))
                    if not chunk:
                        break
                    outputfile.write(chunk)
                    remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass  # 翻页或暂停媒体会正常取消请求。

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8080)
    parser.add_argument('--no-open', action='store_true')
    args = parser.parse_args()
    if not 1 <= args.port <= 65525:
        parser.error('port must be between 1 and 65525')
    server = None
    for port in range(args.port, args.port+11):
        address = f'http://127.0.0.1:{port}/'
        if same_book_running(address):
            if not args.no_open: webbrowser.open(address)
            print(address, flush=True)
            return
        try:
            server = BookServer(('127.0.0.1', port), partial(BookHandler, directory=str(ROOT)))
            break
        except OSError:
            if same_book_running(address):
                if not args.no_open: webbrowser.open(address)
                print(address, flush=True)
                return
    if server is None:
        raise SystemExit('No available local port in the requested range.')
    print(address, flush=True)
    if not args.no_open:
        # The listening socket is ready; the browser request is served below.
        webbrowser.open(address)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
