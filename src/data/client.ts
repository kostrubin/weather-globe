import type { FieldFrame, LayerId, Manifest, Species } from "./model";
import { Lru } from "./model";
const workers = new Map<string, Worker>();
let generation = 0;
const cache = new Lru<string, FieldFrame>(6);
export function frameKey(
  layer: LayerId,
  species: Species,
  time: string,
  manifest: Manifest,
  low: boolean,
) {
  return `${layer}/${species}/${manifest.reference_time}/${manifest.last_modified_time}/${time}/${low}`;
}
export function cachedFrame(
  layer: LayerId,
  species: Species,
  time: string,
  manifest: Manifest,
  low: boolean,
) {
  return cache.get(frameKey(layer, species, time, manifest, low));
}
export function loadFrame(
  layer: LayerId,
  species: Species,
  time: string,
  manifest: Manifest,
  low: boolean,
  signal: AbortSignal,
  lane = "scalar",
): Promise<FieldFrame> {
  const key = frameKey(layer, species, time, manifest, low),
    cached = cache.get(key);
  if (cached) return Promise.resolve(cached);
  if (!workers.has(lane))
    workers.set(
      lane,
      new Worker(new URL("./field.worker.ts", import.meta.url), {
        type: "module",
      }),
    );
  const target = workers.get(lane)!,
    id = ++generation;
  return new Promise((resolve, reject) => {
    const clean = () => {
      clearTimeout(timeout);
      target.removeEventListener("message", message);
      target.removeEventListener("error", failure);
      signal.removeEventListener("abort", abort);
    };
    const abort = () => {
      clean();
      target.postMessage({ id, cancel: true });
      reject(new DOMException("Aborted", "AbortError"));
    };
    const failure = (e: ErrorEvent) => {
      clean();
      target.terminate();
      workers.delete(lane);
      reject(Error(e.message));
    };
    const message = (e: MessageEvent) => {
      if (e.data.id !== id) return;
      clean();
      if (e.data.error) reject(Error(e.data.error));
      else {
        cache.set(key, e.data.frame);
        resolve(e.data.frame);
      }
    };
    const timeout = setTimeout(() => {
      clean();
      target.terminate();
      workers.delete(lane);
      reject(Error("Spatial request timeout (45s)"));
    }, 45000);
    target.addEventListener("message", message);
    target.addEventListener("error", failure);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
    else target.postMessage({ id, layer, species, time, manifest, low });
  });
}
