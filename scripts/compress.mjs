import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync, brotliCompressSync, constants } from "node:zlib";
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(js|css|wasm|geojson|html|txt)$/.test(p)) {
      const b = await readFile(p);
      await writeFile(p + ".gz", gzipSync(b, { level: 9 }));
      await writeFile(
        p + ".br",
        brotliCompressSync(b, {
          params: { [constants.BROTLI_PARAM_QUALITY]: 9 },
        }),
      );
    }
  }
}
await walk("dist");
