"""Build the article sidebar from the public links Quartz actually rendered on the home page."""
import hashlib
import json
import re
import sys
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit


class TopicList(HTMLParser):
    """Read the marked home lists or the generated navigation, preserving document order."""

    def __init__(self, html, home_url, *, sidebar=False):
        super().__init__()
        self.home_url = home_url
        self.sidebar = sidebar
        self.active = False
        self.starts = self.ends = self.depth = 0
        self.first_link = self.reading_link = False
        self.groups = []
        self.feed(html)
        self.close()
        if (self.starts, self.ends) != (1, 1) or not self.groups or any(not links for _, links in self.groups):
            raise ValueError("Missing or empty topic navigation group or region")

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if (self.sidebar and tag == "nav" and a.get("class") == "topic-nav") or (
            not self.sidebar and a.get("id") == "topic-nav-start"
        ):
            self.starts += 1
            self.active = True
        if not self.active:
            return
        if not self.sidebar and a.get("id") == "topic-nav-end":
            self.active = False
            self.ends += 1
        elif tag in ("h2", "h3") and "data-heading" in a:
            self.groups.append((a["data-heading"], []))
        elif tag in ("ul", "ol"):
            self.depth += 1
        elif tag == "li" and self.depth == 1:
            self.first_link = True
        elif tag == "a" and self.first_link and self.depth == 1:
            if not self.groups:
                raise ValueError("Place a group heading before the first topic list")
            url = urlsplit(urljoin(self.home_url, a["href"]))
            base = urlsplit(self.home_url)
            if url.netloc != base.netloc or url.scheme != base.scheme or not url.path.startswith(base.path):
                raise ValueError("Topic must point into the published site: " + a["href"])
            self.href = url.path + ("?" + url.query if url.query else "") + ("#" + url.fragment if url.fragment else "")
            self.label = []
            self.reading_link = True
            self.first_link = False

    def handle_data(self, data):
        if self.reading_link:
            self.label.append(data)

    def handle_endtag(self, tag):
        if not self.active:
            return
        if tag == "a" and self.reading_link:
            label = "".join(self.label).strip()
            if not label:
                raise ValueError("Empty topic link")
            self.groups[-1][1].append((label, self.href))
            self.reading_link = False
        elif tag == "li" and self.depth == 1 and self.first_link:
            raise ValueError("Each topic list item needs a link")
        elif tag in ("ul", "ol"):
            self.depth -= 1
        elif self.sidebar and tag == "nav":
            self.active = False
            self.ends += 1


def build_navigation(site, base):
    groups = TopicList((site / "index.html").read_text("utf8"), base).groups
    contents = []
    for heading, links in groups:
        title = escape(heading)
        items = "".join(f'<li><a href="{escape(href)}">{escape(label)}</a></li>' for label, href in links)
        contents.append(f'<h3 data-heading="{title}">{title}</h3><ul>{items}</ul>')
    nav = '<nav class="topic-nav" aria-label="主题导航">' + "".join(contents) + '</nav>'
    summary = '<details class="file-browser"><summary>按文件夹浏览</summary>'
    head = []
    for ext in ("css", "js"):
        asset = Path(__file__).with_name("topic-navigation." + ext).read_bytes()
        version = hashlib.sha256(asset).hexdigest()[:12]
        filename = f"static/topic-navigation-{version}.{ext}"
        (site / filename).write_bytes(asset)
        href = escape(urljoin(urlsplit(base).path, filename))
        head.append(f'<link rel="stylesheet" href="{href}">' if ext == "css" else f'<script defer src="{href}"></script>')
    index = json.loads((site / "static/contentIndex.json").read_text("utf8"))
    # Insert before the empty list that Explorer populates on load; retain its native drawer and tree.
    tree = re.compile(r'(<ul class="explorer-ul [^"]*"[^>]*><li class="overflow-end"></li></ul>)')
    for slug in index:
        page = site / (slug + ".html")
        html = page.read_text("utf8")
        html, count = tree.subn(lambda m: nav + summary + m[0] + "</details>", html)
        if count != 1:
            raise ValueError(f"{slug}: expected one Quartz Explorer list, found {count}")
        page.write_text(html.replace("</head>", "".join(head) + "</head>", 1), "utf8", newline="\n")


if __name__ == "__main__":
    build_navigation(Path(sys.argv[1]), sys.argv[2])
