"""Validate the actual Pages artifact using the public URL resolution rules."""
import json
import posixpath
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

sys.dont_write_bytecode = True
from topic_navigation import TopicList

cache = Path(__file__).resolve().parent / ".build"
fixture = "--fixture" in sys.argv
site = cache / ("fixture-site" if fixture else "site")
manifest = json.loads((cache / ("fixture-manifest.json" if fixture else "manifest.json")).read_text("utf8"))
index = json.loads((site / "static/contentIndex.json").read_text("utf8"))
base = manifest["base"]
base_path = urlsplit(base).path
files = {p.relative_to(site).as_posix() for p in site.rglob("*") if p.is_file()}
notes = set(manifest["notes"])
generated = {"tags/index.md"}
for name in notes:
    generated.update(str(d.as_posix())+"/index.md" for d in Path(name).parents if d != Path("."))
for entry in index.values():
    generated.update("tags/"+tag+".md" for tag in entry["tags"])
assert notes <= {n["filePath"] for n in index.values()}
for slug, entry in index.items():
    assert entry["filePath"] in notes | generated, (slug, entry["filePath"])
# Keep the former Quartz folder bookmark while displaying Codex as a single note.
if "agents/codex.md" in notes:
    codex_slug = next(s for s, n in index.items() if n["filePath"] == "agents/codex.md")
    assert not any(s.startswith("agents/codex/") for s in index), "Codex appears as a folder"
    alias = (site / "agents/codex/index.html").read_text("utf8")
    redirect = re.search(r'<meta http-equiv="refresh" content="0; ?url=([^"]+)"', alias, re.I)
    assert redirect and posixpath.normpath(posixpath.join("agents/codex", redirect[1])) == codex_slug, "Broken Codex bookmark"
main_files = {s+".html" for s in index}
approved = main_files | set(manifest["assets"]) | set(manifest["downloads"]) | {"404.html","favicon.ico","sitemap.xml","robots.txt"}
for legacy in manifest["legacyRoutes"]:
    file, target = legacy["file"], legacy["target"]
    assert file in files and target in (main_files | set(manifest["assets"])), (file, target)
    href = legacy["href"]
    assert href.startswith(base_path) and not urlsplit(href).netloc, href
    route = unquote(href[len(base_path):])
    assert target in {route, route + ".html", posixpath.join(route, "index.html")}, (href, target)
    html = (site / file).read_text("utf8")
    assert f'<link rel="canonical" href="{href}">' in html and 'content="noindex"' in html, file
    if legacy["kind"] == "source":
        assert f'<a download href="{href}">' in html and 'http-equiv="refresh"' not in html, file
    else:
        assert f'http-equiv="refresh" content="0; url={href}"' in html, file
    approved.add(file)
for file in files - approved:
    if file.startswith("static/") or re.fullmatch(r"(?:component|index|pre(?:script)|postscript)-[a-f0-9]+\.(css|js)",file):
        continue
    # Quartz alias redirects must point to a published page.
    data = (site/file).read_text("utf8") if file.endswith(".html") else ""
    canonical = re.search(r'<link rel="canonical" href="([^"]+)"', data)
    if 'http-equiv="refresh"' in data.lower() and canonical:
        dest = posixpath.normpath(posixpath.join(posixpath.dirname(file),canonical[1]))
        if dest in index: continue
    raise ValueError("Unexpected output: "+file)

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.ids, self.links, self.body_links = set(), [], []
        self.article = False
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a: self.ids.add(a["id"])
        if tag=="article": self.article=True
        if tag in {"a","link","script","img","iframe","embed","source","object"}:
            ref = a.get("href") or a.get("src") or a.get("data")
            if ref:
                self.links.append(ref)
                if self.article: self.body_links.append(ref)
    def handle_endtag(self, tag):
        if tag=="article": self.article=False

expected_topics = TopicList((site/"index.html").read_text("utf8"), base).groups
pages = {}
for file in main_files:
    html = (site/file).read_text("utf8")
    assert TopicList(html, base, sidebar=True).groups == expected_topics, file
    assert '</nav><details class="file-browser"><summary>按文件夹浏览</summary><ul class="explorer-ul ' in html, file
    pages[file] = Page(html)
def route(file):
    return re.sub(r"(^|/)index$","\\1",file[:-5])
def resolve(origin, href):
    url = urlsplit(urljoin(base+route(origin),href))
    # Another public Pages repository shares the owner's custom domain.
    if href.startswith("https://notes.psiqaq.cn/blender_mcp-setup-guide/"): return None
    if url.netloc != urlsplit(base).netloc or url.scheme not in ("https","http"): return None
    pathname = unquote(url.path)
    if not pathname.startswith(base_path): raise ValueError("Escapes site prefix: "+origin+" -> "+href)
    rel = pathname[len(base_path):]
    for candidate in (rel,rel+".html",posixpath.join(rel,"index.html")):
        if candidate in files:
            if url.fragment and candidate in pages and unquote(url.fragment) not in pages[candidate].ids:
                raise ValueError("Missing anchor: "+origin+" -> "+href)
            return candidate
    raise ValueError("Missing resource: "+origin+" -> "+href)
for file, page in pages.items():
    for href in page.links: resolve(file,href)
seen, pending = set(), ["index.html"]
while pending:
    file = pending.pop()
    if file in seen: continue
    seen.add(file)
    if file in pages:
        pending.extend(x for ref in pages[file].body_links if (x:=resolve(file,ref)))
required = {s+".html" for s,n in index.items() if n["filePath"] in notes and not n["filePath"].startswith("fixture/")}
required.update(f for f in manifest["assets"] if not f.startswith("fixture/"))
required.update(manifest["downloads"])
assert required <= seen, sorted(required-seen)
for name in manifest["downloads"]:
    source = next(p for p in (cache.parent.parent/"content").rglob(Path(name).name))
    assert source.read_bytes()==(site/name).read_bytes()
secret = re.compile(rb"(?:-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{36,}|AKIA[A-Z0-9]{16})")
for file in files:
    assert not any(p.startswith(".") or p in {"Drafts","Seeds","Templates",".history","node_modules"} for p in Path(file).parts), file
    if file.endswith((".html",".json",".md",".xml",".bat",".sh")):
        data=(site/file).read_bytes()
        assert not secret.search(data), "Possible credential in "+file
        assert all(s not in data for s in (b"synthetic-private-canary",b"withdrawn-canary")),file
if fixture:
    example=(site/"fixture/中文-空格.html").read_text("utf8")
    for marker in ("markdown-embed-content","可嵌入文本","class=\"katex\"","data-callout","mermaid","sample.pdf","footnote","data-language"):
        assert marker in example,marker
    assert "中文-空格" in (site/"fixture/目标-笔记.html").read_text("utf8")
print(f"Passed: {len(notes)} notes, {len(manifest['assets'])} attachments, {len(index)} index entries, {len(files)} output files at {base}")
