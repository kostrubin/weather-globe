import { layerById } from "./model";
import type { FieldFrame, LayerId, Manifest, Species } from "./model";
export const demoTime = "2026-10-21T00:00:00.000Z";
export function demoManifest(layer: LayerId): Manifest {
  return {
    completed: true,
    reference_time: demoTime,
    last_modified_time: demoTime,
    valid_times: Array.from({ length: 25 }, (_, i) =>
      new Date(Date.parse(demoTime) + i * 3 * 3600000).toISOString(),
    ),
    variables: layerById(layer).variables,
    crs_wkt: "DEMO",
  };
}
export function demoFrame(
  layer: LayerId,
  species: Species,
  time: string,
): FieldFrame {
  const regional = layer === "pollen",
    width = regional ? 70 : 180,
    height = regional ? 42 : 91,
    values = new Float32Array(width * height),
    u = new Float32Array(values.length).fill(8),
    v = new Float32Array(values.length).fill(3),
    def = layerById(layer);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const lat = regional ? 30.05 + (y / (height - 1)) * 41.9 : -90 + y * 2;
      values[y * width + x] =
        layer === "temperature"
          ? 28 - Math.abs(lat) * 0.65
          : layer === "wind"
            ? Math.hypot(8, 3)
            : layer === "pressure"
              ? 1013 + 12 * Math.sin((x / width) * Math.PI * 2)
              : layer === "uv"
                ? Math.max(0, 8 - Math.abs(lat) * 0.15)
                : layer === "precipitation"
                  ? x % 30 < 8
                    ? 1
                    : 0
                  : layer === "pollen"
                    ? 0
                    : (def.domain[0] + def.domain[1]) / 2;
    }
  return {
    layer,
    species,
    model: def.model,
    run: demoTime,
    validTime: time,
    intervalStart:
      layer === "precipitation"
        ? new Date(Date.parse(time) - 3 * 3600000).toISOString()
        : null,
    intervalHours: layer === "precipitation" ? 3 : null,
    width,
    height,
    bounds: regional ? [-24.95, 30.05, 44.95, 71.95] : [-180, -90, 180, 90],
    values,
    u: layer === "wind" ? u : undefined,
    v: layer === "wind" ? v : undefined,
    sourceWidth: width,
    sourceHeight: height,
    unit: def.unit,
    retrievedAt: demoTime,
    sourceReference: "Deterministic synthetic demonstration",
    provenance: "demo",
    stats: {
      bytes: 0,
      requests: 0,
      elapsedMs: 0,
      decodedBytes: values.byteLength,
      etag: null,
      rangeVerified: false,
    },
  };
}
