import { z } from "zod";
import { layers, species } from "./data/model";
import type { Lang, LayerId, Place, Quality, Species } from "./data/model";
const placeSchema = z.object({
  name: z.string().max(150),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  country: z.string().optional(),
  admin1: z.string().optional(),
  timezone: z.string().optional(),
});
export const initialPlace: Place = {
  name: "Buenos Aires",
  country: "Argentina",
  latitude: -34.6037,
  longitude: -58.3816,
  timezone: "America/Argentina/Buenos_Aires",
};
export function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem("wg-" + key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export function save(key: string, value: unknown) {
  try {
    localStorage.setItem("wg-" + key, JSON.stringify(value));
  } catch {
    /* Storage is optional. */
  }
}
export function savedPlaces(key: string): Place[] {
  const r = placeSchema.array().max(8).safeParse(read(key, []));
  return r.success ? r.data : [];
}
export function initial() {
  const p = new URLSearchParams(location.search),
    saved = placeSchema.safeParse(read("place", null));
  let place = saved.success ? saved.data : initialPlace;
  if (p.has("lat") && p.has("lon")) {
    const parsed = placeSchema.safeParse({
      name: p.get("name") ?? "",
      latitude: Number(p.get("lat")),
      longitude: Number(p.get("lon")),
    });
    if (parsed.success) place = parsed.data;
  }
  const layer = (
    layers.some((l) => l.id === p.get("layer")) ? p.get("layer") : "temperature"
  ) as LayerId;
  const spec = (
    species.includes(p.get("species") as Species) ? p.get("species") : "grass"
  ) as Species;
  const lang: Lang = read<Lang>("lang", "ru") === "en" ? "en" : "ru",
    q = read<Quality>("quality", "auto");
  return {
    example: !saved.success && !p.has("lat"),
    place,
    layer,
    species: spec,
    lang,
    quality: ["auto", "high", "low"].includes(q) ? q : ("auto" as Quality),
    fahrenheit: (p.get("temp") ?? read("temp", "c")) === "f",
    kmh: (p.get("wind") ?? read("wind", "ms")) === "kmh",
    time:
      p.get("time") &&
      /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(p.get("time")!) &&
      Number.isFinite(Date.parse(p.get("time")!))
        ? Date.parse(p.get("time")!)
        : Date.now(),
    demo: p.get("demo") === "1",
  };
}
