export type LayerId =
  | "temperature"
  | "precipitation"
  | "wind"
  | "uv"
  | "pollen"
  | "pm25"
  | "cloud"
  | "humidity"
  | "pressure";
export type Species =
  | "alder"
  | "birch"
  | "grass"
  | "mugwort"
  | "olive"
  | "ragweed";
export type Model = "ecmwf_ifs025" | "cams_global" | "cams_europe";
export type Quality = "auto" | "high" | "low";
export type Lang = "ru" | "en";
export interface Place {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}
export interface LayerDefinition {
  id: LayerId;
  model: Model;
  variables: string[];
  unit: string;
  domain: [number, number];
  colors: string[];
  resolution: number;
}
export const layers: LayerDefinition[] = [
  {
    id: "temperature",
    model: "ecmwf_ifs025",
    variables: ["temperature_2m"],
    unit: "°C",
    domain: [-40, 40],
    colors: [
      "#5555ad",
      "#548ee3",
      "#6bc9ce",
      "#b9ddb0",
      "#eee1a0",
      "#eea46f",
      "#ca5f62",
    ],
    resolution: 0.25,
  },
  {
    id: "precipitation",
    model: "ecmwf_ifs025",
    variables: ["precipitation"],
    unit: "mm/h",
    domain: [0, 10],
    colors: [
      "#1a2d3e",
      "#285d79",
      "#3ca9ac",
      "#8dcd9b",
      "#e1d478",
      "#dc9a61",
      "#b95d96",
    ],
    resolution: 0.25,
  },
  {
    id: "wind",
    model: "ecmwf_ifs025",
    variables: ["wind_u_component_10m", "wind_v_component_10m"],
    unit: "m/s",
    domain: [0, 30],
    colors: [
      "#203a56",
      "#376e91",
      "#4db4b2",
      "#bad792",
      "#e3cd72",
      "#db8869",
      "#aa5d97",
    ],
    resolution: 0.25,
  },
  {
    id: "uv",
    model: "cams_global",
    variables: ["uv_index"],
    unit: "UVI",
    domain: [0, 12],
    colors: [
      "#203f4c",
      "#7fa563",
      "#b8c96b",
      "#e6ce65",
      "#e79a64",
      "#c65b77",
      "#9560ab",
    ],
    resolution: 0.4,
  },
  {
    id: "pollen",
    model: "cams_europe",
    variables: ["grass_pollen"],
    unit: "grains/m³",
    domain: [0, 100],
    colors: ["#233b42", "#527b6c", "#a4b96e", "#e0d07c", "#d99872", "#bd6275"],
    resolution: 0.1,
  },
  {
    id: "pm25",
    model: "cams_global",
    variables: ["pm2_5"],
    unit: "µg/m³",
    domain: [0, 75],
    colors: ["#264b56", "#619d9a", "#b3cba1", "#e6d18e", "#d99074", "#ae617b"],
    resolution: 0.4,
  },
  {
    id: "cloud",
    model: "ecmwf_ifs025",
    variables: ["cloud_cover"],
    unit: "%",
    domain: [0, 100],
    colors: ["#183347", "#4b6a83", "#879bac", "#c3cfd6", "#eef0e9"],
    resolution: 0.25,
  },
  {
    id: "humidity",
    model: "ecmwf_ifs025",
    variables: ["relative_humidity_2m"],
    unit: "%",
    domain: [0, 100],
    colors: ["#a5745c", "#d7b386", "#c3ce9e", "#76bdb4", "#408dac", "#405e9b"],
    resolution: 0.25,
  },
  {
    id: "pressure",
    model: "ecmwf_ifs025",
    variables: ["pressure_msl"],
    unit: "hPa",
    domain: [960, 1040],
    colors: [
      "#625b9b",
      "#527faf",
      "#6eb6ba",
      "#b6d1b0",
      "#dfd49a",
      "#d59d7a",
      "#b96870",
    ],
    resolution: 0.25,
  },
];
export const layerById = (id: LayerId) => layers.find((l) => l.id === id)!;
export const species: Species[] = [
  "alder",
  "birch",
  "grass",
  "mugwort",
  "olive",
  "ragweed",
];
export interface Manifest {
  completed: true;
  reference_time: string;
  last_modified_time: string;
  valid_times: string[];
  variables: string[];
  crs_wkt: string;
}
export interface FieldFrame {
  layer: LayerId;
  species: Species;
  model: Model;
  run: string;
  validTime: string;
  intervalStart: string | null;
  intervalHours: number | null;
  width: number;
  height: number;
  bounds: [number, number, number, number];
  values: Float32Array;
  u?: Float32Array;
  v?: Float32Array;
  sourceWidth: number;
  sourceHeight: number;
  unit: string;
  retrievedAt: string;
  sourceReference: string;
  provenance: "live" | "demo";
  stats: {
    bytes: number;
    requests: number;
    elapsedMs: number;
    decodedBytes: number;
    etag: string | null;
    rangeVerified: boolean;
  };
}
export const inEurope = (lat: number, lon: number) =>
  lat >= 30.05 && lat <= 71.95 && lon >= -24.95 && lon <= 44.95;
export const wrapLon = (lon: number) =>
  ((((lon + 180) % 360) + 360) % 360) - 180;
export function sample(
  frame: FieldFrame,
  lat: number,
  lon: number,
  array = frame.values,
): number | null {
  const [west, south, east, north] = frame.bounds;
  lon = wrapLon(lon);
  if (lat < south || lat > north || lon < west || lon > east) return null;
  const global = east - west >= 359;
  const x =
    ((lon - west) / (east - west)) * (global ? frame.width : frame.width - 1);
  const y = ((lat - south) / (north - south)) * (frame.height - 1);
  const x0 = Math.floor(x) % frame.width,
    x1 = global ? (x0 + 1) % frame.width : Math.min(x0 + 1, frame.width - 1),
    y0 = Math.floor(y),
    y1 = Math.min(y0 + 1, frame.height - 1);
  const points = [
    array[y0 * frame.width + x0],
    array[y0 * frame.width + x1],
    array[y1 * frame.width + x0],
    array[y1 * frame.width + x1],
  ];
  if (points.some((v) => !Number.isFinite(v))) return null;
  const fx = x - Math.floor(x),
    fy = y - y0;
  return (
    points[0] * (1 - fx) * (1 - fy) +
    points[1] * fx * (1 - fy) +
    points[2] * (1 - fx) * fy +
    points[3] * fx * fy
  );
}
export function palette(
  value: number,
  layer: LayerDefinition,
): [number, number, number] {
  const t =
    Math.max(
      0,
      Math.min(
        1,
        (value - layer.domain[0]) / (layer.domain[1] - layer.domain[0]),
      ),
    ) *
    (layer.colors.length - 1);
  const i = Math.min(Math.floor(t), layer.colors.length - 2),
    f = t - i;
  const rgb = (c: string) =>
    [1, 3, 5].map((n) => parseInt(c.slice(n, n + 2), 16));
  const a = rgb(layer.colors[i]),
    b = rgb(layer.colors[i + 1]);
  return a.map((v, j) => Math.round(v + (b[j] - v) * f)) as [
    number,
    number,
    number,
  ];
}
export const precipitationRate = (amount: number, hours: number | null) =>
  Number.isFinite(amount) && amount >= 0 && hours !== null && hours > 0
    ? amount / hours
    : NaN;
export const toTemperature = (c: number, f: boolean) =>
  f ? (c * 9) / 5 + 32 : c;
export const toWind = (ms: number, kmh: boolean) => (kmh ? ms * 3.6 : ms);
export const windFrom = (u: number, v: number) =>
  ((Math.atan2(-u, -v) * 180) / Math.PI + 360) % 360;
export function advanceWind(
  lat: number,
  lon: number,
  u: number,
  v: number,
  seconds: number,
): [number, number] {
  const p = (lat * Math.PI) / 180,
    l = (lon * Math.PI) / 180;
  const x = Math.cos(p) * Math.cos(l),
    y = Math.sin(p),
    z = -Math.cos(p) * Math.sin(l),
    s = seconds / 6371000;
  const nx = x + s * (-Math.sin(l) * u - Math.sin(p) * Math.cos(l) * v),
    ny = y + s * Math.cos(p) * v,
    nz = z + s * (-Math.cos(l) * u + Math.sin(p) * Math.sin(l) * v);
  const len = Math.hypot(nx, ny, nz);
  return [
    (Math.asin(ny / len) * 180) / Math.PI,
    wrapLon((Math.atan2(-nz, nx) * 180) / Math.PI),
  ];
}
export const position = (
  lat: number,
  lon: number,
  r = 1,
): [number, number, number] => [
  r * Math.cos((lat * Math.PI) / 180) * Math.cos((lon * Math.PI) / 180),
  r * Math.sin((lat * Math.PI) / 180),
  -r * Math.cos((lat * Math.PI) / 180) * Math.sin((lon * Math.PI) / 180),
];
export const nearestTime = (times: string[], requested: number) =>
  times.reduce(
    (best, t) =>
      Math.abs(Date.parse(t) - requested) <
      Math.abs(Date.parse(best) - requested)
        ? t
        : best,
    times[0],
  );
export function horizon(
  manifest: Manifest,
  now = Date.now(),
  layer?: LayerId,
): string[] {
  return manifest.valid_times.filter(
    (t, i) =>
      Date.parse(t) >= now - 3 * 3600000 &&
      Date.parse(t) <= now + 72 * 3600000 &&
      (layer !== "precipitation" || i > 0),
  );
}
export class Lru<K, V> {
  private data = new Map<K, V>();
  constructor(readonly capacity: number) {}
  get(k: K) {
    const v = this.data.get(k);
    if (v !== undefined) {
      this.data.delete(k);
      this.data.set(k, v);
    }
    return v;
  }
  set(k: K, v: V) {
    this.data.delete(k);
    this.data.set(k, v);
    while (this.data.size > this.capacity)
      this.data.delete(this.data.keys().next().value!);
  }
  get size() {
    return this.data.size;
  }
}
