import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve("dist/client");
const mime = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/\/$/, "") || "/";
  try {
    const candidates = pathname === "/" ? ["/index.html"] : [pathname, `${pathname}.html`];
    for (const candidate of candidates) {
      const file = resolve(root, `.${candidate}`);
      if (!file.startsWith(`${root}${sep}`) || !(await stat(file).catch(() => undefined))?.isFile()) continue;
      response.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" });
      createReadStream(file).pipe(response);
      return;
    }
    throw new Error("not found");
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(3000, () => console.log("Preview: http://127.0.0.1:3000"));
