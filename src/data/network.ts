import { z } from "zod";
import type { Manifest, Model } from "./model";
export const spatialRoot = "https://openmeteo.s3.amazonaws.com/data_spatial";
const manifestSchema = z.object({
  completed: z.literal(true),
  reference_time: z.iso.datetime(),
  last_modified_time: z.iso.datetime(),
  valid_times: z
    .array(z.string().refine((s) => Number.isFinite(Date.parse(s))))
    .min(2)
    .max(500),
  variables: z.array(z.string()).max(500),
  crs_wkt: z.string(),
});
export async function boundedJson(
  url: string,
  signal?: AbortSignal,
  cap = 512 * 1024,
): Promise<unknown> {
  const response = await fetch(url, {
    signal: AbortSignal.any([
      signal ?? new AbortController().signal,
      AbortSignal.timeout(20000),
    ]),
  });
  if (!response.ok)
    throw Error(
      response.status === 429
        ? `429 · Retry-After: ${response.headers.get("retry-after") ?? "60"}s`
        : `HTTP ${response.status}`,
    );
  const reader = response.body!.getReader();
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > cap) {
      await reader.cancel();
      throw Error("Response limit");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let i = 0;
  for (const c of chunks) {
    bytes.set(c, i);
    i += c.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export async function getManifest(
  model: Model,
  signal?: AbortSignal,
): Promise<Manifest> {
  const m = manifestSchema.parse(
    await boundedJson(`${spatialRoot}/${model}/latest.json`, signal),
  );
  if (
    m.valid_times.some(
      (t, i) => i > 0 && Date.parse(t) <= Date.parse(m.valid_times[i - 1]),
    )
  )
    throw Error("Invalid frame order");
  return m;
}
export function fileUrl(model: Model, run: string, time: string): string {
  const r = new Date(run).toISOString(),
    t = new Date(time).toISOString();
  return `${spatialRoot}/${model}/${r.slice(0, 4)}/${r.slice(5, 7)}/${r.slice(8, 10)}/${r.slice(11, 13)}${r.slice(14, 16)}Z/${t.slice(0, 13)}${t.slice(14, 16)}.om`;
}
