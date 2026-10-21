import {
  BlockCacheBackend,
  LruBlockCache,
  OmDataType,
  OmFileReader,
} from "@openmeteo/file-reader";
import { layerById, precipitationRate } from "./model";
import type { FieldFrame, LayerId, Manifest, Species } from "./model";
import { fileUrl } from "./network";
import { RangeBackend } from "./range";
const blocks = new LruBlockCache(65536, 160);
let active: AbortController | null = null;
let activeId = 0;
let queue = Promise.resolve();
interface Request {
  id: number;
  layer: LayerId;
  species: Species;
  time: string;
  manifest: Manifest;
  low: boolean;
  cancel?: boolean;
}
self.onmessage = ({ data }: { data: Request }) => {
  if (data.cancel) {
    if (data.id === activeId) active?.abort();
    return;
  }
  active?.abort();
  const controller = new AbortController();
  active = controller;
  activeId = data.id;
  queue = queue
    .catch(() => {})
    .then(async () => {
      if (controller.signal.aborted) return;
      const start = performance.now(),
        def = layerById(data.layer),
        url = fileUrl(def.model, data.manifest.reference_time, data.time),
        backend = new RangeBackend(url, controller.signal);
      let root: OmFileReader | undefined;
      const children: OmFileReader[] = [];
      try {
        await backend.count();
        let key = 14695981039346656037n;
        for (const c of url + "|" + backend.version)
          key = BigInt.asUintN(
            64,
            (key ^ BigInt(c.charCodeAt(0))) * 1099511628211n,
          );
        root = await OmFileReader.create(
          BlockCacheBackend.withBigIntKeys(backend, blocks, key),
        );
        for (const [name, expected] of [
          ["forecast_reference_time", data.manifest.reference_time],
          ["valid_time", data.time],
        ]) {
          const c = await root.getChildByName(name);
          if (!c) throw Error("Missing source time");
          try {
            const seconds = c.readScalar<number | bigint>(OmDataType.Int64);
            if (Number(seconds) * 1000 !== Date.parse(expected))
              throw Error("Source time mismatch");
          } finally {
            c.dispose();
          }
        }
        const crs = await root.getChildByName("crs_wkt");
        if (!crs) throw Error("Missing CRS");
        try {
          const wkt = crs.readScalar<string>(OmDataType.String);
          if (wkt !== data.manifest.crs_wkt || !wkt?.includes("WGS 84"))
            throw Error("CRS mismatch");
        } finally {
          crs.dispose();
        }
        const names =
          data.layer === "pollen" ? [`${data.species}_pollen`] : def.variables;
        const arrays: Float32Array[] = [];
        let width = 0,
          height = 0;
        for (const name of names) {
          const child = await root.getChildByName(name);
          if (!child) throw Error(`Variable unavailable: ${name}`);
          children.push(child);
          const unitChild = await child.getChildByName("unit");
          if (unitChild) {
            const unit = unitChild.readScalar<string>(OmDataType.String);
            unitChild.dispose();
            const expected =
              data.layer === "precipitation"
                ? "mm"
                : data.layer === "wind"
                  ? "m/s"
                  : def.unit;
            if (unit && unit.replace("μ", "µ") !== expected)
              throw Error(`Unexpected unit ${unit}`);
          }
          const dims = child.getDimensions();
          const expectedDims =
            def.model === "ecmwf_ifs025"
              ? [721, 1440]
              : def.model === "cams_global"
                ? [451, 900]
                : [420, 700];
          if (dims.length !== 2 || dims.some((n, i) => n !== expectedDims[i]))
            throw Error("Unsupported source grid");
          [height, width] = dims;
          const a = await child.read({
            type: OmDataType.FloatArray,
            ranges: dims.map((n) => ({ start: 0, end: n })),
            prefetch: true,
            prefetchConcurrency: 3,
            ioSizeMax: 524288n,
            signal: controller.signal,
          });
          arrays.push(a);
        }
        controller.signal.throwIfAborted();
        const regional = def.model === "cams_europe",
          step = data.low
            ? regional
              ? 4
              : 4
            : regional
              ? 2
              : def.model === "ecmwf_ifs025"
                ? 4
                : 2;
        const outWidth = Math.ceil(width / step),
          outHeight = Math.ceil((height - 1) / step) + 1;
        const outputs = arrays.map(
          () => new Float32Array(outWidth * outHeight),
        );
        for (let y = 0; y < outHeight; y++)
          for (let x = 0; x < outWidth; x++) {
            const sy = Math.round((y * (height - 1)) / (outHeight - 1)),
              sx = regional
                ? Math.round((x * (width - 1)) / (outWidth - 1))
                : Math.min(width - 1, x * step),
              index = (regional ? height - 1 - sy : sy) * width + sx;
            arrays.forEach((a, j) => {
              outputs[j][y * outWidth + x] = a[index];
            });
          }
        const i = data.manifest.valid_times.indexOf(data.time),
          previous = data.manifest.valid_times[i - 1];
        const intervalHours =
          data.layer === "precipitation" && previous
            ? (Date.parse(data.time) - Date.parse(previous)) / 3600000
            : null;
        if (data.layer === "precipitation") {
          if (!intervalHours) throw Error("No accumulation interval");
          for (let j = 0; j < outputs[0].length; j++)
            outputs[0][j] = precipitationRate(outputs[0][j], intervalHours);
        }
        const values =
          data.layer === "wind"
            ? Float32Array.from(outputs[0], (u, i) =>
                Math.hypot(u, outputs[1][i]),
              )
            : outputs[0];
        const frame: FieldFrame = {
          layer: data.layer,
          species: data.species,
          model: def.model,
          run: data.manifest.reference_time,
          validTime: data.time,
          intervalStart: data.layer === "precipitation" ? previous : null,
          intervalHours,
          width: outWidth,
          height: outHeight,
          bounds: regional
            ? [-24.95, 30.05, 44.95, 71.95]
            : [-180, -90, 180, 90],
          values,
          u: data.layer === "wind" ? outputs[0] : undefined,
          v: data.layer === "wind" ? outputs[1] : undefined,
          sourceWidth: width,
          sourceHeight: height,
          unit: def.unit,
          retrievedAt: new Date().toISOString(),
          sourceReference: url,
          provenance: "live",
          stats: {
            bytes: backend.bytes,
            requests: backend.requests,
            elapsedMs: performance.now() - start,
            decodedBytes:
              width * height * 4 * arrays.length +
              outputs.reduce((n, a) => n + a.byteLength, 0),
            etag: backend.version,
            rangeVerified: backend.verified || backend.bytes === 0,
          },
        };
        controller.signal.throwIfAborted();
        const transfer = [
          frame.values.buffer,
          ...(frame.u ? [frame.u.buffer, frame.v!.buffer] : []),
        ];
        self.postMessage({ id: data.id, frame }, transfer);
      } catch (error) {
        if (!controller.signal.aborted)
          self.postMessage({ id: data.id, error: String(error) });
      } finally {
        children.forEach((c) => c.dispose());
        root?.dispose();
        await backend.close();
      }
    });
};
