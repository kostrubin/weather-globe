// Static-only QA server. No proxying, functions, credentials or data middleware.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("dist"),
  port = Number(process.argv[process.argv.indexOf("--port") + 1]) || 4173,
  prefix = process.env.WG_BASE_PATH || "/";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".geojson": "application/geo+json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
};
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (!pathname.startsWith(prefix)) throw Error("404");
    const relative = pathname.slice(prefix.length),
      p = resolve(root, relative || "index.html");
    if (!p.startsWith(root + "/")) throw Error("404");
    const encoding = /\bbr\b/.test(req.headers["accept-encoding"] ?? "")
        ? "br"
        : /\bgzip\b/.test(req.headers["accept-encoding"] ?? "")
          ? "gzip"
          : null,
      suffix = encoding === "br" ? ".br" : ".gz";
    let actual = p,
      use = false;
    if (encoding) {
      try {
        await stat(p + suffix);
        actual = p + suffix;
        use = true;
      } catch {}
    }
    const data = await readFile(actual);
    res.writeHead(200, {
      "Content-Type": mime[extname(p)] ?? "application/octet-stream",
      "Content-Length": data.length,
      Vary: "Accept-Encoding",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      ...(use ? { "Content-Encoding": encoding } : {}),
    });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, "0.0.0.0", () =>
  console.log(`Static preview: http://localhost:${port}${prefix}`),
);
