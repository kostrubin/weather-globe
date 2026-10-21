import { z } from "zod";
import { boundedJson } from "./network";
import { inEurope } from "./model";
import type { Place } from "./model";
const zoneSchema = z.string().refine((zone) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}, "Invalid timezone");
const numbers = z.array(z.number().nullable());
const weatherSchema = z.object({
  timezone: zoneSchema,
  utc_offset_seconds: z.number(),
  hourly: z.object({
    time: z.array(z.number()),
    temperature_2m: numbers,
    apparent_temperature: numbers,
    relative_humidity_2m: numbers,
    precipitation: numbers,
    precipitation_probability: numbers,
    cloud_cover: numbers,
    pressure_msl: numbers,
    wind_speed_10m: numbers,
    wind_direction_10m: numbers,
    weather_code: numbers,
  }),
  daily: z.object({
    time: z.array(z.number()),
    temperature_2m_max: numbers,
    temperature_2m_min: numbers,
    precipitation_sum: numbers,
    weather_code: numbers,
    uv_index_max: numbers,
  }),
});
const airSchema = z.object({
  timezone: zoneSchema,
  hourly: z
    .object({
      time: z.array(z.number()),
      pm2_5: numbers,
      european_aqi: numbers,
      uv_index: numbers,
    })
    .catchall(numbers),
});
export type Weather = z.infer<typeof weatherSchema>;
export type Air = z.infer<typeof airSchema>;
export async function weather(
  place: Place,
  signal: AbortSignal,
): Promise<Weather> {
  const p = new URLSearchParams({
    latitude: place.latitude.toFixed(3),
    longitude: place.longitude.toFixed(3),
    timezone: "auto",
    timeformat: "unixtime",
    forecast_days: "7",
    wind_speed_unit: "ms",
    hourly:
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,precipitation_probability,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code",
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,uv_index_max",
  });
  const data = weatherSchema.parse(
    await boundedJson(`https://api.open-meteo.com/v1/forecast?${p}`, signal),
  );
  validateLengths(data);
  return data;
}
export async function air(place: Place, signal: AbortSignal): Promise<Air> {
  const pollen = inEurope(place.latitude, place.longitude)
    ? ",alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen"
    : "";
  const p = new URLSearchParams({
    latitude: place.latitude.toFixed(3),
    longitude: place.longitude.toFixed(3),
    timezone: "auto",
    timeformat: "unixtime",
    forecast_days: "4",
    hourly: "pm2_5,european_aqi,uv_index" + pollen,
  });
  const data = airSchema.parse(
    await boundedJson(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${p}`,
      signal,
    ),
  );
  validateLengths(data);
  return data;
}
function validateLengths(data: Weather | Air) {
  const hourly = data.hourly;
  for (const [name, values] of Object.entries(hourly))
    if (values.length !== hourly.time.length)
      throw Error(`Hourly length mismatch: ${name}`);
  if ("daily" in data)
    for (const [name, values] of Object.entries(data.daily))
      if (values.length !== data.daily.time.length)
        throw Error(`Daily length mismatch: ${name}`);
  return data;
}
const placesSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        country: z.string().optional(),
        admin1: z.string().optional(),
        timezone: z.string().optional(),
      }),
    )
    .max(20)
    .optional(),
});
export async function searchPlaces(
  q: string,
  lang: string,
  signal: AbortSignal,
): Promise<Place[]> {
  const p = new URLSearchParams({
    name: q,
    count: "8",
    language: lang,
    format: "json",
  });
  return (
    placesSchema.parse(
      await boundedJson(
        `https://geocoding-api.open-meteo.com/v1/search?${p}`,
        signal,
      ),
    ).results ?? []
  );
}
export function coordinates(q: string): Place | null {
  const m = q.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const latitude = Number(m[1]),
    longitude = Number(m[2]);
  return Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
    ? { name: "", latitude, longitude }
    : null;
}
export const hourIndex = (times: number[], instant = Date.now()) =>
  times.reduce(
    (best, t, i) =>
      Math.abs(t * 1000 - instant) < Math.abs(times[best] * 1000 - instant)
        ? i
        : best,
    0,
  );

// Open-Meteo daily epochs are civil-day anchors with the response offset, not DST-aware midnights.
export const dailyCalendarDate = (seconds: number, offsetSeconds: number) =>
  new Date((seconds + offsetSeconds) * 1000).toISOString().slice(0, 10);
export function safeZone(zone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return zone;
  } catch {
    return "UTC";
  }
}
