import { createRequire } from "node:module";
import { readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
const root = JSON.parse(await readFile("package.json", "utf8")),
  visited = new Set(),
  records = [];
async function visit(name, from) {
  const require = createRequire(from);
  let dir;
  try {
    dir = dirname(require.resolve(name + "/package.json"));
  } catch {
    dir = dirname(require.resolve(name));
    while (true) {
      try {
        const p = JSON.parse(await readFile(join(dir, "package.json"), "utf8"));
        if (p.name === name) break;
      } catch {}
      const parent = dirname(dir);
      if (parent === dir) throw Error("Package root missing " + name);
      dir = parent;
    }
  }
  dir = await realpath(dir);
  if (visited.has(dir)) return;
  visited.add(dir);
  const p = JSON.parse(await readFile(join(dir, "package.json"), "utf8"));
  const texts = [];
  for (const n of await readdir(dir))
    if (/^licen[cs]e/i.test(n))
      texts.push(await readFile(join(dir, n), "utf8"));
  if (name.startsWith("@openmeteo/"))
    texts.push(await readFile("LICENSE", "utf8"));
  if (name === "@react-three/fiber")
    texts.push(await readFile("licenses/R3F-MIT.txt", "utf8"));
  if (!texts.length) throw Error("License text missing " + name);
  records.push({ name: p.name, version: p.version, license: p.license, texts });
  for (const dependency of Object.keys(p.dependencies ?? {}))
    await visit(dependency, join(dir, "package.json"));
}
for (const name of Object.keys(root.dependencies))
  await visit(name, resolve("package.json"));
records.sort((a, b) => a.name.localeCompare(b.name));
const intro = `Weather Globe — third-party notices\n\nCode GPL-2.0-only. Data licenses and hosted API noncommercial terms are separate.\nOpen-Meteo spatial data CC BY4.0; contains modified Copernicus CAMS / ECMWF data.\nNatural Earth coastline: public domain, from natural-earth-vector/geojson/ne_110m_coastline.geojson.\nModifications: spatial subsampling, palettes, wind magnitude, precipitation interval-average rate.\n\nCorresponding source for exact OM reader/WASM0.0.20 is included at sources/openmeteo-0.0.20-corresponding-source.tar.gz.\nReader/binding commit659de288ac1e2d16f8e40ab0cb73f51a1e1e73f9; C submodule18bee8578d953bd95ad7de1ae688faa7cf421f7c.\nEmscripten4.0.12 build instructions included; no byte-reproducibility claim.\nApp source: https://github.com/kostrubin/weather-globe/tree/feat/weather-globe\n\n`;
const content =
  intro +
  records
    .map(
      (r) =>
        `===== ${r.name}@${r.version} — ${r.license} =====\n${r.texts.join("\n")}\n`,
    )
    .join("\n");
await writeFile("THIRD_PARTY_NOTICES.txt", content);
await writeFile("public/THIRD_PARTY_NOTICES.txt", content);
await writeFile(
  "licenses/runtime.json",
  JSON.stringify(
    records.map(({ name, version, license }) => ({ name, version, license })),
    null,
    2,
  ) + "\n",
);
console.log(
  `Preserved license texts for ${records.length} production packages.`,
);
