"""Serve the verified artifact locally with GitHub Pages style clean URLs."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

parser=argparse.ArgumentParser()
parser.add_argument("--port",type=int,default=8849)
parser.add_argument("--fixture",action="store_true")
args=parser.parse_args()
root=Path(__file__).resolve().parent/".build"/("fixture-site" if args.fixture else "site")
prefix="/project/" if args.fixture else "/"
if not (root/"index.html").is_file(): parser.error("Build the site first")

class Pages(SimpleHTTPRequestHandler):
    def translate_path(self, url):
        route=unquote(urlsplit(url).path)
        if not route.startswith(prefix): return str(root/".absent")
        target=(root/route[len(prefix):]).resolve()
        if not target.is_relative_to(root): return str(root/".absent")
        if not target.exists() and target.with_suffix(".html").is_file(): return str(target.with_suffix(".html"))
        return str(target)
    def list_directory(self,path):
        self.send_error(404)
        return None

print(f"http://127.0.0.1:{args.port}{prefix}",flush=True)
ThreadingHTTPServer(("127.0.0.1",args.port),partial(Pages,directory=str(root))).serve_forever()
