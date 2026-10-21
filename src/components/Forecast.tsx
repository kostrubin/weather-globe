import {
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import type { Air, Weather } from "../data/point";
import { hourIndex, dailyCalendarDate, safeZone } from "../data/point";
import type { FieldFrame, Lang, Place } from "../data/model";
import {
  sample,
  toTemperature,
  toWind,
  inEurope,
  windFrom,
} from "../data/model";
import { dictionary, weatherLabel } from "../i18n";
export function displayValue(
  value: number | null | undefined,
  layer: string,
  f: boolean,
  kmh: boolean,
) {
  if (value === null || value === undefined || !Number.isFinite(value))
    return "—";
  const v =
    layer === "temperature"
      ? toTemperature(value, f)
      : layer === "wind"
        ? toWind(value, kmh)
        : value;
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: ["pressure", "humidity", "cloud", "uv"].includes(
      layer,
    )
      ? 0
      : 1,
  }).format(v);
}
export function unitLabel(layer: string, lang: Lang, f: boolean, kmh: boolean) {
  const t = dictionary(lang);
  return layer === "temperature"
    ? f
      ? "°F"
      : "°C"
    : layer === "wind"
      ? kmh
        ? t.kmh
        : t.ms
      : layer === "precipitation"
        ? t.mmh
        : layer === "pollen"
          ? t.grains
          : layer === "pm25"
            ? t.micro
            : layer === "pressure"
              ? t.hpa
              : layer === "uv"
                ? "UVI"
                : "%";
}
interface Props {
  example: boolean;
  place: Place;
  weather?: Weather;
  air?: Air;
  error: boolean;
  loading: boolean;
  frame: FieldFrame | null;
  lang: Lang;
  fahrenheit: boolean;
  kmh: boolean;
  favorite: boolean;
  onFavorite: () => void;
  onRetry: () => void;
  noCoverage: boolean;
}
export default function Forecast(p: Props) {
  const t = dictionary(p.lang),
    [expanded, setExpanded] = useState(false),
    locale = p.lang === "ru" ? "ru-RU" : "en-GB",
    w = p.weather,
    a = p.air,
    zone = safeZone(w?.timezone ?? p.place.timezone ?? "UTC");
  const i = w ? hourIndex(w.hourly.time) : 0,
    j = a ? hourIndex(a.hourly.time) : 0,
    instant = p.frame ? Date.parse(p.frame.validTime) : Date.now(),
    mi = w ? hourIndex(w.hourly.time, instant) : 0,
    mj = a ? hourIndex(a.hourly.time, instant) : 0;
  const temp = w?.hourly.temperature_2m[i],
    active = p.frame?.layer ?? "temperature",
    mapValue = p.frame
      ? sample(p.frame, p.place.latitude, p.place.longitude)
      : null;
  const pointValue =
    active === "pollen"
      ? inEurope(p.place.latitude, p.place.longitude)
        ? a?.hourly[`${p.frame?.species}_pollen`]?.[mj]
        : null
      : active === "pm25"
        ? a?.hourly.pm2_5[mj]
        : active === "uv"
          ? a?.hourly.uv_index[mj]
          : w?.hourly[
              (
                {
                  temperature: "temperature_2m",
                  precipitation: "precipitation",
                  wind: "wind_speed_10m",
                  humidity: "relative_humidity_2m",
                  cloud: "cloud_cover",
                  pressure: "pressure_msl",
                } as const
              )[active]
            ]?.[mi];
  const date = (n: number, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { timeZone: zone, ...options }).format(n);
  const chart = w ? w.hourly.temperature_2m.slice(i, i + 24) : [],
    valid = chart.filter((v): v is number => v !== null),
    min = Math.min(...valid) - 2,
    max = Math.max(...valid) + 2;
  const path = chart
    .map((v, k) =>
      v === null
        ? ""
        : `${k === 0 || chart[k - 1] === null ? "M" : "L"}${8 + (k / 23) * 284},${80 - ((v - min) / (max - min)) * 60}`,
    )
    .join(" ");
  return (
    <aside
      className={`forecast-panel ${expanded ? "expanded" : ""}`}
      aria-label={t.local}
    >
      <button
        className="sheet-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}{" "}
        {expanded ? t.collapse : t.expand}
      </button>
      <div className="place-heading">
        <div>
          <div className="eyebrow">
            <MapPin size={12} />
            {t.local}
          </div>
          <h2>{p.place.name || t.coordinates}</h2>
          <p>
            {p.place.country ??
              `${p.place.latitude.toFixed(2)}°, ${p.place.longitude.toFixed(2)}°`}
            {p.place.admin1 ? ` · ${p.place.admin1}` : ""}
          </p>
          {p.example && <span className="default-example">{t.example}</span>}
        </div>
        <button
          className={`icon-button favorite ${p.favorite ? "selected" : ""}`}
          aria-label={p.favorite ? t.saved : t.save}
          aria-pressed={p.favorite}
          onClick={p.onFavorite}
        >
          <Star size={20} fill={p.favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="current-weather">
        <div>
          <span className="current-temperature">
            {displayValue(temp, "temperature", p.fahrenheit, p.kmh)}
            <small>{p.fahrenheit ? "°F" : "°"}</small>
          </span>
          <p>
            {w
              ? weatherLabel(w.hourly.weather_code[i], t)
              : p.loading
                ? t.loading
                : t.unavailable}
          </p>
        </div>
        <CloudSun size={54} strokeWidth={1.1} />
      </div>
      <p className="time-note">
        {w
          ? date(w.hourly.time[i] * 1000, {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}{" "}
        · {zone}
      </p>
      {p.error && (
        <div className="inline-error">
          {t.unavailable} <button onClick={p.onRetry}>{t.retry}</button>
        </div>
      )}
      <div className="local-stats">
        <div>
          <Wind size={16} />
          <span>{t.wind}</span>
          <b>
            {displayValue(w?.hourly.wind_speed_10m[i], "wind", false, p.kmh)}{" "}
            <small>{p.kmh ? t.kmh : t.ms}</small>
          </b>
        </div>
        <div>
          <Droplets size={16} />
          <span>{t.humidity}</span>
          <b>{w?.hourly.relative_humidity_2m[i] ?? "—"}%</b>
        </div>
        <div>
          <CloudRain size={16} />
          <span>{t.rainChance}</span>
          <b>{w?.hourly.precipitation_probability[i] ?? "—"}%</b>
        </div>
        <div>
          <ArrowUpRight size={16} />
          <span>{t.feels}</span>
          <b>
            {displayValue(
              w?.hourly.apparent_temperature[i],
              "temperature",
              p.fahrenheit,
              false,
            )}
            °
          </b>
        </div>
      </div>
      <div className="sheet-content">
        <div className="active-readout">
          <div>
            <span className="eyebrow">{t.layerValue}</span>
            <h3>{t[active]}</h3>
          </div>
          <strong>
            {displayValue(mapValue, active, p.fahrenheit, p.kmh)}{" "}
            <small>{unitLabel(active, p.lang, p.fahrenheit, p.kmh)}</small>
          </strong>
        </div>
        {p.noCoverage ? (
          <p className="coverage-note">{t.noCoverage}</p>
        ) : (
          <p className="time-note">
            {t.local}: {displayValue(pointValue, active, p.fahrenheit, p.kmh)}{" "}
            {unitLabel(active, p.lang, p.fahrenheit, p.kmh)}
            {active === "precipitation" ? " / 1 " + t.hours : ""}
          </p>
        )}
        {active === "wind" && (
          <p className="time-note">
            {t.direction}:{" "}
            {p.frame?.u &&
            p.frame.v &&
            sample(p.frame, p.place.latitude, p.place.longitude, p.frame.u) !==
              null &&
            sample(p.frame, p.place.latitude, p.place.longitude, p.frame.v) !==
              null
              ? Math.round(
                  windFrom(
                    sample(
                      p.frame,
                      p.place.latitude,
                      p.place.longitude,
                      p.frame.u,
                    )!,
                    sample(
                      p.frame,
                      p.place.latitude,
                      p.place.longitude,
                      p.frame.v,
                    )!,
                  ),
                ) + "°"
              : "—"}{" "}
            · {t.from}
          </p>
        )}
        <p className="time-note">
          {t.aqi}: <b>{a?.hourly.european_aqi[j] ?? "—"}</b> · {t.aqiNote}
        </p>
        <section className="chart-section">
          <div className="section-heading">
            <h3>{t.hourly}</h3>
            <span>{p.fahrenheit ? "°F" : "°C"}</span>
          </div>
          {w && valid.length > 0 && (
            <>
              <svg
                className="hourly-chart"
                viewBox="0 0 300 108"
                role="img"
                aria-label={`${t.hourly}: ${displayValue(Math.min(...valid), "temperature", p.fahrenheit, false)}–${displayValue(Math.max(...valid), "temperature", p.fahrenheit, false)} ${p.fahrenheit ? "°F" : "°C"}`}
              >
                <defs>
                  <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#67d5d1" stopOpacity=".22" />
                    <stop offset="1" stopColor="#67d5d1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={path + " L292,90 L8,90Z"} fill="url(#chart-fill)" />
                <path d={path} stroke="#80d7cc" strokeWidth="2" fill="none" />
                {[0, 6, 12, 18, 23].map((k) => (
                  <g key={k}>
                    <text
                      x={8 + (k / 23) * 284}
                      y={102}
                      textAnchor={
                        k === 0 ? "start" : k === 23 ? "end" : "middle"
                      }
                    >
                      {w.hourly.time[i + k]
                        ? date(w.hourly.time[i + k] * 1000, { hour: "2-digit" })
                        : ""}
                    </text>
                  </g>
                ))}
              </svg>
              <details className="chart-table">
                <summary>{t.table}</summary>
                <table>
                  <thead>
                    <tr>
                      <th>
                        {t.date} · {zone}
                      </th>
                      <th>{t.temperature}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chart.map((v, k) => (
                      <tr key={k}>
                        <td>
                          {date(w.hourly.time[i + k] * 1000, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>
                          {displayValue(v, "temperature", p.fahrenheit, false)}°
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          )}
        </section>
        <section className="daily-section">
          <h3>{t.daily}</h3>
          <p className="time-note">{t.dailyNote}</p>
          {w?.daily.time.map((time, k) => (
            <div className="day-row" key={time}>
              <span>
                {new Intl.DateTimeFormat(locale, {
                  timeZone: "UTC",
                  weekday: "short",
                  day: "numeric",
                }).format(
                  Date.parse(
                    dailyCalendarDate(time, w.utc_offset_seconds) +
                      "T12:00:00Z",
                  ),
                )}
              </span>
              <CloudSun
                size={17}
                aria-label={weatherLabel(w.daily.weather_code[k], t)}
              />
              <span className="day-rain">
                {w.daily.precipitation_sum[k] ?? "—"} mm
              </span>
              <strong>
                {displayValue(
                  w.daily.temperature_2m_max[k],
                  "temperature",
                  p.fahrenheit,
                  false,
                )}
                °
              </strong>
              <span>
                {displayValue(
                  w.daily.temperature_2m_min[k],
                  "temperature",
                  p.fahrenheit,
                  false,
                )}
                °
              </span>
            </div>
          ))}
        </section>
        <p className="time-note">
          {t.dailyUv}: {w?.daily.uv_index_max[0] ?? "—"}
        </p>
        <p className="precision-note">{t.precision}</p>
      </div>
      <a
        className="attribution"
        href="https://open-meteo.com/"
        target="_blank"
        rel="noreferrer"
      >
        {t.forecast}: Open-Meteo · CAMS / ECMWF ↗
      </a>
    </aside>
  );
}
