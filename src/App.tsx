import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Globe2,
  Search,
  Settings2,
  Info,
  LocateFixed,
  Share2,
  RotateCcw,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Thermometer,
  CloudRain,
  Wind,
  Sun,
  Flower2,
  Layers3,
  Cloud,
  Droplets,
  Gauge,
  X,
  Star,
  ArrowUpRight,
  Plus,
  Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  FieldFrame,
  Lang,
  LayerId,
  Place,
  Quality,
  Species,
} from "./data/model";
import {
  layers,
  layerById,
  species,
  horizon,
  nearestTime,
  inEurope,
} from "./data/model";
import { getManifest } from "./data/network";
import { loadFrame } from "./data/client";
import { weather, air, searchPlaces, coordinates } from "./data/point";
import { dictionary } from "./i18n";
import { initial, save, savedPlaces } from "./state";
import { demoFrame, demoManifest, demoTime } from "./data/demo";
import Forecast, { displayValue, unitLabel } from "./components/Forecast";
const Globe = lazy(() => import("./components/Globe"));
const icons: Record<LayerId, LucideIcon> = {
  temperature: Thermometer,
  precipitation: CloudRain,
  wind: Wind,
  uv: Sun,
  pollen: Flower2,
  pm25: Layers3,
  cloud: Cloud,
  humidity: Droplets,
  pressure: Gauge,
};
const placeKey = (p: Place) =>
  `${p.latitude.toFixed(3)},${p.longitude.toFixed(3)}`;
function canWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}
export default function App() {
  const [start] = useState(initial),
    [example, setExample] = useState(start.example),
    [lang, setLang] = useState<Lang>(start.lang),
    [place, setPlace] = useState<Place>(start.place),
    [layer, setLayer] = useState<LayerId>(start.layer),
    [spec, setSpec] = useState<Species>(start.species),
    [quality, setQuality] = useState<Quality>(start.quality),
    [fahrenheit, setFahrenheit] = useState(start.fahrenheit),
    [kmh, setKmh] = useState(start.kmh),
    [requested, setRequested] = useState(
      start.demo ? Date.parse(demoTime) : start.time,
    );
  const [frame, setFrame] = useState<FieldFrame | null>(null),
    [loading, setLoading] = useState(false),
    [fieldError, setFieldError] = useState(""),
    [retry, setRetry] = useState(0),
    [playing, setPlaying] = useState(false),
    [focus, setFocus] = useState<Place | null>(null),
    [reset, setReset] = useState(0),
    [zoom, setZoom] = useState(0),
    [webgl, setWebgl] = useState(() => canWebGL());
  const [favorites, setFavorites] = useState<Place[]>(() =>
      savedPlaces("favorites"),
    ),
    [recent, setRecent] = useState<Place[]>(() => savedPlaces("recent")),
    [q, setQ] = useState(""),
    [debounced, setDebounced] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [highlight, setHighlight] = useState(0),
    [notice, setNotice] = useState(""),
    [overlay, setOverlay] = useState(false),
    [overlayFrame, setOverlayFrame] = useState<FieldFrame | null>(null);
  const [reduce, setReduce] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [autoLow, setAutoLow] = useState(
      () =>
        window.innerWidth < 700 ||
        !!(navigator as Navigator & { connection?: { saveData: boolean } })
          .connection?.saveData,
    );
  const t = dictionary(lang),
    locale = lang === "ru" ? "ru-RU" : "en-GB",
    low = quality === "low" || (quality === "auto" && autoLow);
  const settings = useRef<HTMLDialogElement>(null),
    sources = useRef<HTMLDialogElement>(null),
    linkDialog = useRef<HTMLDialogElement>(null),
    searchRef = useRef<HTMLDivElement>(null);
  const [shareLink, setShareLink] = useState("");
  const [viewNow, setViewNow] = useState(Date.now);
  const manifestQuery = useQuery({
    queryKey: ["manifest", layerById(layer).model],
    queryFn: ({ signal }) => getManifest(layerById(layer).model, signal),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchIntervalInBackground: false,
    enabled: !start.demo,
    retry: 1,
  });
  useEffect(() => {
    if (!start.demo) setViewNow(Date.now());
  }, [manifestQuery.dataUpdatedAt, start.demo]);
  const manifest = start.demo ? demoManifest(layer) : manifestQuery.data;
  const times = useMemo(
    () =>
      manifest
        ? horizon(manifest, start.demo ? Date.parse(demoTime) : viewNow, layer)
        : [],
    [manifest, layer, start.demo, viewNow],
  );
  const noFrames = !!manifest && times.length === 0;
  const selectedTime = times.length ? nearestTime(times, requested) : null,
    index = selectedTime ? times.indexOf(selectedTime) : 0;
  const weatherQuery = useQuery({
    queryKey: ["weather", placeKey(place)],
    queryFn: ({ signal }) => weather(place, signal),
    staleTime: 20 * 60 * 1000,
    enabled: !start.demo,
  });
  const airQuery = useQuery({
    queryKey: ["air", placeKey(place)],
    queryFn: ({ signal }) => air(place, signal),
    staleTime: 20 * 60 * 1000,
    enabled: !start.demo,
  });
  const searchQuery = useQuery({
    queryKey: ["search", debounced, lang],
    queryFn: ({ signal }) => searchPlaces(debounced, lang, signal),
    enabled: debounced.length >= 2 && !coordinates(debounced),
    staleTime: 60 * 60 * 1000,
  });
  const direct = coordinates(q),
    results = direct ? [direct] : (searchQuery.data ?? []);
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(q.trim());
      setHighlight(0);
    }, 300);
    return () => clearTimeout(id);
  }, [q]);
  useEffect(() => {
    document.documentElement.lang = lang;
    save("lang", lang);
  }, [lang]);
  useEffect(() => {
    save("place", place);
  }, [place]);
  useEffect(() => save("quality", quality), [quality]);
  useEffect(() => save("temp", fahrenheit ? "f" : "c"), [fahrenheit]);
  useEffect(() => save("wind", kmh ? "kmh" : "ms"), [kmh]);
  useEffect(() => save("favorites", favorites), [favorites]);
  useEffect(() => save("recent", recent), [recent]);
  useEffect(() => {
    performance.mark("shell-ready");
    const shortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.querySelector("input")?.focus();
      }
    };
    document.addEventListener("keydown", shortcut);
    const click = (e: PointerEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("pointerdown", click);
    return () => {
      document.removeEventListener("pointerdown", click);
      document.removeEventListener("keydown", shortcut);
    };
  }, []);
  useEffect(() => {
    const c = new AbortController();
    if (!manifest || !selectedTime) {
      setLoading(false);
      return;
    }
    setLoading(true);
    window.__weather = { ...window.__weather, status: "loading" };
    setFieldError("");
    const task = start.demo
      ? Promise.resolve(demoFrame(layer, spec, selectedTime))
      : loadFrame(layer, spec, selectedTime, manifest, low, c.signal);
    task
      .then((f) => {
        if (c.signal.aborted) return;
        setFrame(f);
        setLoading(false);
        performance.mark("first-real-field");
        window.__weather = {
          ...window.__weather,
          frame: f,
          ready: true,
          status: "ready",
        };
      })
      .catch((e) => {
        if (c.signal.aborted) return;
        setFieldError(String(e));
        setLoading(false);
        setPlaying(false);
        window.__weather = { ...window.__weather, status: "error" };
      });
    return () => c.abort();
  }, [
    manifest?.reference_time,
    manifest?.last_modified_time,
    selectedTime,
    layer,
    spec,
    low,
    retry,
    start.demo,
  ]);
  useEffect(() => {
    if (weatherQuery.data) performance.mark("local-forecast-ready");
  }, [weatherQuery.data]);
  const step = useCallback(
    (dir: number) => {
      if (times.length) {
        setRequested(
          Date.parse(
            times[Math.min(times.length - 1, Math.max(0, index + dir))],
          ),
        );
      }
    },
    [times, index],
  );
  useEffect(() => {
    if (!playing || loading || fieldError || !frame) return;
    if (index >= times.length - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => step(1), 1400);
    return () => clearTimeout(id);
  }, [playing, loading, fieldError, frame, index, times.length, step]);
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, []);
  useEffect(() => {
    if (quality !== "auto" || autoLow) return;
    const id = setInterval(() => {
      const d = window.__weather?.frameDurations?.slice(-90) ?? [];
      if (d.length >= 60) {
        const sorted = [...d].sort((a, b) => a - b);
        if (sorted[Math.floor(sorted.length * 0.95)] > 40) setAutoLow(true);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [quality, autoLow]);
  // Overlay uses the same worker sequentially, after the scalar request commits.
  const windManifest = useQuery({
    queryKey: ["manifest", "ecmwf_ifs025"],
    queryFn: ({ signal }) => getManifest("ecmwf_ifs025", signal),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchIntervalInBackground: false,
    enabled: overlay && layer !== "wind" && !start.demo,
  });
  useEffect(() => {
    setOverlayFrame(null);
    if (
      !overlay ||
      loading ||
      !frame ||
      frame.layer !== layer ||
      Date.parse(frame.validTime) !== Date.parse(selectedTime ?? "") ||
      layer === "wind"
    )
      return;
    const m = windManifest.data;
    if (
      !m ||
      !m.valid_times.some((s) => Date.parse(s) === Date.parse(frame.validTime))
    )
      return;
    const time = m.valid_times.find(
      (s) => Date.parse(s) === Date.parse(frame.validTime),
    )!;
    const c = new AbortController();
    loadFrame("wind", spec, time, m, low, c.signal, "overlay")
      .then((f) => {
        if (!c.signal.aborted) setOverlayFrame(f);
      })
      .catch(() => {});
    return () => c.abort();
  }, [
    overlay,
    frame,
    loading,
    layer,
    windManifest.data,
    low,
    spec,
    selectedTime,
  ]);
  const select = useCallback((p: Place) => {
    setPlace(p);
    setExample(false);
    setFocus(p);
    setRecent((old) =>
      [p, ...old.filter((x) => placeKey(x) !== placeKey(p))].slice(0, 6),
    );
    setQ("");
    setSearchOpen(false);
  }, []);
  const failed = useCallback(() => setWebgl(false), []),
    isFavorite = favorites.some((p) => placeKey(p) === placeKey(place));
  const toggleFavorite = () =>
    setFavorites((old) =>
      isFavorite
        ? old.filter((p) => placeKey(p) !== placeKey(place))
        : [place, ...old].slice(0, 8),
    );
  const format = (time: string, full = false) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      month: full ? "short" : undefined,
      day: full ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(Date.parse(time));
  const share = async () => {
    const u = new URL(location.href);
    u.search = "";
    const p = u.searchParams;
    p.set("lat", place.latitude.toFixed(4));
    p.set("lon", place.longitude.toFixed(4));
    p.set("name", place.name);
    p.set("layer", layer);
    p.set("species", spec);
    p.set("temp", fahrenheit ? "f" : "c");
    p.set("wind", kmh ? "kmh" : "ms");
    p.set("time", new Date(requested).toISOString());
    if (start.demo) p.set("demo", "1");
    history.replaceState(null, "", u);
    try {
      await navigator.clipboard.writeText(u.href);
      setNotice(t.copied);
    } catch {
      setShareLink(u.href);
      linkDialog.current?.showModal();
    }
  };
  const locate = () => {
    if (!navigator.geolocation) {
      setNotice(t.geoDenied);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) =>
        select({
          name: "",
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        }),
      () => setNotice(t.geoDenied),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };
  const activeLayer = frame ? layerById(frame.layer) : null,
    noCoverage =
      layer === "pollen" && !inEurope(place.latitude, place.longitude),
    pending =
      frame &&
      (frame.layer !== layer ||
        (frame.species !== spec && layer === "pollen") ||
        Date.parse(frame.validTime) !== Date.parse(selectedTime ?? ""));
  const expired =
    times.length > 0 &&
    (requested < Date.parse(times[0]) ||
      requested > Date.parse(times[times.length - 1]));
  const timeAdjusted =
    selectedTime && Math.abs(Date.parse(selectedTime) - requested) > 31 * 60000;
  const stale = frame && Date.parse(frame.run) < Date.now() - 36 * 3600000;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#forecast">
        {t.local}
      </a>
      <header className="topbar">
        <a className="brand" href={import.meta.env.BASE_URL}>
          <span className="brand-orbit">
            <Globe2 size={25} strokeWidth={1.2} />
          </span>
          <span>
            Weather <b>Globe</b>
            <small>{t.atlas}</small>
          </span>
        </a>
        <div className="search-wrap" ref={searchRef}>
          <Search size={18} />
          <input
            aria-label={t.search}
            placeholder={t.search}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            role="combobox"
            aria-expanded={searchOpen}
            aria-controls="places"
            aria-autocomplete="list"
            aria-activedescendant={
              searchOpen && results.length ? `place-${highlight}` : undefined
            }
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchOpen(false);
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlight((h) => Math.min(h + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight((h) => Math.max(0, h - 1));
              }
              if (e.key === "Enter" && results[highlight]) {
                e.preventDefault();
                select(results[highlight]);
              }
            }}
          />
          <kbd>⌘ K</kbd>
          {searchOpen && (
            <div
              className="search-results"
              id="places"
              role="listbox"
              aria-label={t.searchHint}
            >
              {q.length >= 2 ? (
                <>
                  {results.length ? (
                    results.map((p, i) => (
                      <button
                        id={`place-${i}`}
                        role="option"
                        aria-selected={highlight === i}
                        key={placeKey(p) + p.name}
                        onPointerMove={() => setHighlight(i)}
                        onClick={() => select(p)}
                      >
                        <MapPlace p={p} fallback={t.coordinates} />
                      </button>
                    ))
                  ) : (
                    <p>
                      {searchQuery.isFetching
                        ? t.loading
                        : searchQuery.isError
                          ? t.unavailable
                          : t.noResults}
                    </p>
                  )}
                </>
              ) : (
                <>
                  {favorites.length > 0 && (
                    <p className="eyebrow">{t.favorites}</p>
                  )}
                  {favorites.map((p) => (
                    <button
                      role="option"
                      aria-selected={false}
                      key={placeKey(p)}
                      onClick={() => select(p)}
                    >
                      <Star size={14} />
                      <MapPlace p={p} fallback={t.coordinates} />
                    </button>
                  ))}
                  {recent.length > 0 && <p className="eyebrow">{t.recent}</p>}
                  {recent.map((p) => (
                    <button
                      role="option"
                      aria-selected={false}
                      key={placeKey(p)}
                      onClick={() => select(p)}
                    >
                      <Clock3 size={14} />
                      <MapPlace p={p} fallback={t.coordinates} />
                    </button>
                  ))}
                  {!favorites.length && !recent.length && (
                    <p>
                      {t.searchHint}
                      <br />
                      <small>−34.60, −58.38</small>
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div className="top-actions">
          <span className="live-badge">
            <i />
            {start.demo ? "DEMO" : t.live}
          </span>
          <button
            className="lang-button"
            aria-label={t.language}
            onClick={() => setLang(lang === "ru" ? "en" : "ru")}
          >
            {lang.toUpperCase()}
            <span> / {lang === "ru" ? "EN" : "RU"}</span>
          </button>
          <button
            className="icon-button"
            onClick={() => settings.current?.showModal()}
            aria-label={t.settings}
          >
            <Settings2 size={20} />
          </button>
          <button
            className="icon-button"
            onClick={() => sources.current?.showModal()}
            aria-label={t.sources}
          >
            <Info size={20} />
          </button>
        </div>
      </header>
      <div className="workspace">
        <nav className="layer-rail" aria-label={t.layers}>
          <span className="rail-label">{t.layers}</span>
          {layers.map((l) => {
            const Icon = icons[l.id];
            return (
              <button
                data-layer={l.id}
                key={l.id}
                className={layer === l.id ? "active" : ""}
                aria-pressed={layer === l.id}
                onClick={() => {
                  setLayer(l.id);
                  setPlaying(false);
                }}
              >
                <Icon size={21} strokeWidth={1.5} />
                <span>{t[l.id]}</span>
                {layer === l.id && <span className="active-dot" />}
              </button>
            );
          })}
          <button
            className="rail-info"
            onClick={() => sources.current?.showModal()}
          >
            <Info size={18} />
            <span>{t.sources}</span>
          </button>
        </nav>
        <main className="atlas-main">
          <div className="map-heading">
            <div className="eyebrow">
              {t.forecast} <span>/</span>{" "}
              {activeLayer?.model === "cams_europe"
                ? "CAMS EUROPE"
                : activeLayer?.model === "cams_global"
                  ? "CAMS GLOBAL"
                  : "ECMWF IFS"}
            </div>
            <h1>
              {frame ? t[frame.layer] : t[layer]}
              <span>
                {frame ? unitLabel(frame.layer, lang, fahrenheit, kmh) : ""}
              </span>
            </h1>
            <p>{frame ? t[`${frame.layer}Info`] : t.loading}</p>
          </div>
          {layer === "pollen" && (
            <div className="species-select">
              <label htmlFor="species">{t.species}</label>
              <select
                id="species"
                value={spec}
                onChange={(e) => setSpec(e.target.value as Species)}
              >
                {species.map((s) => (
                  <option key={s} value={s}>
                    {t[s]}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="globe-stage" aria-label={t.map} role="region">
            {webgl ? (
              <Suspense
                fallback={
                  <div className="globe-placeholder">
                    <Globe2 size={100} strokeWidth={0.5} />
                  </div>
                }
              >
                <Globe
                  frame={frame}
                  place={place}
                  focus={focus}
                  reset={reset}
                  zoom={zoom}
                  low={low}
                  reduced={reduce || start.demo}
                  wind={layer === "wind" || (overlay && !!overlayFrame)}
                  windFrame={layer === "wind" ? frame : overlayFrame}
                  onSelect={select}
                  onFailure={failed}
                />
              </Suspense>
            ) : (
              <div className="no-webgl">
                <Globe2 size={64} strokeWidth={1} />
                <p>{t.webgl}</p>
                <button
                  className="now-button"
                  onClick={() => {
                    if (canWebGL()) setWebgl(true);
                  }}
                >
                  {t.retry3d}
                </button>
                <a href="#forecast">
                  {t.forecastView} <ArrowUpRight size={16} />
                </a>
              </div>
            )}
          </div>
          <div className="map-tools">
            <button
              className="icon-button"
              onClick={() => setZoom((z) => z + 1)}
              aria-label={t.zoomIn}
            >
              <Plus size={19} />
            </button>
            <button
              className="icon-button"
              onClick={() => setZoom((z) => z - 1)}
              aria-label={t.zoomOut}
            >
              <Minus size={19} />
            </button>
            <span />
            <button
              className="icon-button"
              onClick={() => {
                setFocus(place);
                setReset((r) => r + 1);
              }}
              aria-label={t.reset}
            >
              <RotateCcw size={18} />
            </button>
            <button
              className="icon-button"
              onClick={locate}
              aria-label={t.geolocate}
            >
              <LocateFixed size={19} />
            </button>
            <button
              className="icon-button"
              onClick={share}
              aria-label={t.share}
            >
              <Share2 size={18} />
            </button>
          </div>
          <span className="compass">
            N <span>↑</span>
          </span>
          <div className="globe-instruction">{t.controls}</div>
          {overlay && layer !== "wind" && !overlayFrame && (
            <div className="overlay-note">{t.windMatch}</div>
          )}
          {start.demo && <div className="demo-banner">{t.demo}</div>}
          {(loading ||
            manifestQuery.isFetching ||
            noFrames ||
            fieldError ||
            manifestQuery.isError ||
            stale ||
            pending ||
            timeAdjusted) && (
            <div
              className={`field-status ${fieldError || manifestQuery.isError || noFrames ? "error" : ""}`}
              role="status"
            >
              {loading || manifestQuery.isFetching ? (
                <>
                  <span className="spinner" />
                  {playing ? t.buffering : t.loading}
                  {pending && ` · ${t.pending}: ${t[layer]}`}
                </>
              ) : fieldError || manifestQuery.isError || noFrames ? (
                <>
                  <span>
                    {noFrames ? t.noFuture : t.unavailable}
                    {frame ? ` · ${t.stale}` : ""}
                  </span>
                  <button
                    onClick={() => {
                      setRetry((r) => r + 1);
                      void manifestQuery.refetch();
                    }}
                  >
                    {t.retry}
                  </button>
                  <details>
                    <summary>{t.source}</summary>
                    {fieldError || String(manifestQuery.error)}
                  </details>
                </>
              ) : stale ? (
                t.stale
              ) : timeAdjusted ? (
                expired ? (
                  t.expired
                ) : (
                  t.timeAdjusted
                )
              ) : (
                ""
              )}
            </div>
          )}
          {noCoverage && (
            <div className="coverage-callout">
              <Flower2 size={20} />
              <div>
                <strong>{t.noCoverage}</strong>
                <button
                  onClick={() => {
                    setFocus({ name: "Europe", latitude: 49, longitude: 12 });
                    setReset((r) => r + 1);
                  }}
                >
                  {t.showCoverage} ↗
                </button>
              </div>
            </div>
          )}
          <div className="map-bottom">
            <div className="legend-block">
              <div className="legend-heading">
                <span>{frame ? t[frame.layer] : t[layer]}</span>
                <span>
                  {frame?.model === "cams_europe" ? t.europe : t.global}
                </span>
              </div>
              {activeLayer && (
                <>
                  <div
                    className="legend-gradient"
                    style={{
                      background: `linear-gradient(90deg,${activeLayer.colors.join(",")})`,
                    }}
                  />
                  <div className="legend-ticks">
                    {Array.from({ length: 5 }, (_, i) => {
                      const v =
                        activeLayer.domain[0] +
                        (i / 4) *
                          (activeLayer.domain[1] - activeLayer.domain[0]);
                      return (
                        <span key={i}>
                          {displayValue(v, activeLayer.id, fahrenheit, kmh)}
                          {i === 4
                            ? " " +
                              unitLabel(activeLayer.id, lang, fahrenheit, kmh)
                            : ""}
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="legend-foot">
                <span>
                  <i className="nodata-key" />
                  {t.noData}
                </span>
                <span>
                  {activeLayer?.resolution}°
                  {frame?.intervalHours
                    ? ` · ${frame.intervalHours} ${t.hours}`
                    : ""}
                </span>
              </div>
            </div>
            <div className="map-attribution">
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
              >
                Open-Meteo · ECMWF / Copernicus CAMS ↗
              </a>
              <button onClick={() => sources.current?.showModal()}>
                {t.sources}
              </button>
            </div>
          </div>
        </main>
        <div id="forecast">
          <Forecast
            example={example}
            place={place}
            weather={weatherQuery.data}
            air={airQuery.data}
            error={weatherQuery.isError || airQuery.isError}
            loading={weatherQuery.isFetching}
            frame={frame}
            lang={lang}
            fahrenheit={fahrenheit}
            kmh={kmh}
            favorite={isFavorite}
            onFavorite={toggleFavorite}
            onRetry={() => {
              void weatherQuery.refetch();
              void airQuery.refetch();
            }}
            noCoverage={noCoverage}
          />
        </div>
      </div>
      <footer className="timeline">
        <div className="timeline-top">
          <div>
            <Clock3 size={14} />
            <span>{t.timeline}</span>
            <b>{frame ? format(frame.validTime, true) : "—"}</b>
            <span className="zone-chip">UTC</span>
          </div>
          <span>
            {loading && selectedTime
              ? `${t.pending}: ${format(selectedTime, true)}`
              : frame?.intervalStart
                ? `${t.interval}: ${format(frame.intervalStart)}–${format(frame.validTime)} UTC`
                : frame
                  ? `${t.run}: ${format(frame.run, true)} UTC`
                  : ""}
          </span>
        </div>
        <div className="timeline-main">
          <div className="playback">
            <button
              className="icon-button"
              aria-label={t.previous}
              onClick={() => {
                setPlaying(false);
                step(-1);
              }}
              disabled={!times.length || index === 0}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="play-button"
              aria-label={playing ? t.pause : t.play}
              aria-pressed={playing}
              disabled={!times.length || reduce}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? (
                <Pause size={19} />
              ) : (
                <Play size={19} fill="currentColor" />
              )}
            </button>
            <button
              className="icon-button"
              aria-label={t.next}
              onClick={() => {
                setPlaying(false);
                step(1);
              }}
              disabled={!times.length || index === times.length - 1}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="time-track">
            <input
              type="range"
              aria-label={t.timeline}
              min={0}
              max={Math.max(1, times.length - 1)}
              value={index}
              disabled={!times.length}
              onChange={(e) => {
                setPlaying(false);
                setRequested(Date.parse(times[Number(e.target.value)]));
              }}
            />
            <div className="time-labels">
              {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                const time = times[Math.round(f * (times.length - 1))];
                return <span key={f}>{time ? format(time, true) : "—"}</span>;
              })}
            </div>
          </div>
          <button
            className="now-button"
            onClick={() => {
              setPlaying(false);
              setRequested(start.demo ? Date.parse(demoTime) : Date.now());
              setViewNow(Date.now());
              if (!start.demo) {
                void manifestQuery.refetch();
                if (weatherQuery.isStale) void weatherQuery.refetch();
                if (airQuery.isStale) void airQuery.refetch();
              }
            }}
          >
            {t.now}
          </button>
        </div>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button
            className="icon-button"
            onClick={() => setNotice("")}
            aria-label={t.close}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <dialog ref={settings} className="modal">
        <div className="dialog-heading">
          <h2>{t.settings}</h2>
          <button
            className="icon-button"
            aria-label={t.close}
            onClick={() => settings.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <label>
          {t.language}
          <select
            aria-label={t.language}
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          {t.tempUnit}
          <select
            aria-label={t.tempUnit}
            value={fahrenheit ? "f" : "c"}
            onChange={(e) => setFahrenheit(e.target.value === "f")}
          >
            <option value="c">°C</option>
            <option value="f">°F</option>
          </select>
        </label>
        <label>
          {t.windUnit}
          <select
            aria-label={t.windUnit}
            value={kmh ? "kmh" : "ms"}
            onChange={(e) => setKmh(e.target.value === "kmh")}
          >
            <option value="ms">{t.ms}</option>
            <option value="kmh">{t.kmh}</option>
          </select>
        </label>
        <label>
          {t.quality}
          <select
            aria-label={t.quality}
            value={quality}
            onChange={(e) => setQuality(e.target.value as Quality)}
          >
            <option value="auto">{t.auto}</option>
            <option value="high">{t.high}</option>
            <option value="low">{t.low}</option>
          </select>
        </label>
        <label>
          {t.reduced}
          <input
            type="checkbox"
            checked={reduce}
            onChange={(e) => setReduce(e.target.checked)}
          />
        </label>
        <label>
          {t.windOverlay}
          <input
            type="checkbox"
            checked={overlay}
            onChange={(e) => setOverlay(e.target.checked)}
          />
        </label>
        <p className="precision-note">
          {t.windMatch}
          {overlay && !overlayFrame && layer !== "wind" ? " · " + t.noData : ""}
        </p>
      </dialog>
      <dialog ref={sources} className="modal sources-modal">
        <div className="dialog-heading">
          <h2>{t.sources}</h2>
          <button
            className="icon-button"
            aria-label={t.close}
            onClick={() => sources.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <p>{t.sourceText}</p>
        <p>{t.dataLicense}</p>
        <p>{t.privacy}</p>
        <p>{t.service}</p>
        <p>{t.software}</p>
        {frame && (
          <dl>
            <dt>{t.source}</dt>
            <dd>
              <a
                href={
                  frame.sourceReference.startsWith("https:")
                    ? frame.sourceReference
                    : undefined
                }
              >
                {frame.model}
              </a>
            </dd>
            <dt>{t.run}</dt>
            <dd>{frame.run}</dd>
            <dt>{t.valid}</dt>
            <dd>{frame.validTime}</dd>
            <dt>{t.retrieved}</dt>
            <dd>{frame.retrievedAt}</dd>
            <dt>{t.resolution}</dt>
            <dd>
              {frame.sourceWidth}×{frame.sourceHeight} / {frame.width}×
              {frame.height}
            </dd>
            {overlayFrame && (
              <>
                <dt>
                  {t.windOverlay} · {t.source}
                </dt>
                <dd>
                  <a href={overlayFrame.sourceReference}>
                    {overlayFrame.model}
                  </a>
                </dd>
                <dt>
                  {t.windOverlay} · {t.run}
                </dt>
                <dd>{overlayFrame.run}</dd>
                <dt>
                  {t.windOverlay} · {t.valid}
                </dt>
                <dd>{overlayFrame.validTime}</dd>
              </>
            )}
          </dl>
        )}
        <div className="source-links">
          <a href="https://open-meteo.com/en/licence">Open-Meteo</a>
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
          <a href="https://atmosphere.copernicus.eu/">Copernicus CAMS</a>
          <a href="https://www.ecmwf.int/">ECMWF</a>
          <a href="https://www.naturalearthdata.com/about/terms-of-use/">
            Natural Earth
          </a>
          <a href="https://github.com/kostrubin/weather-globe/tree/feat/weather-globe">
            {t.sourceCode} · GPL-2.0
          </a>
          <a
            href={`${import.meta.env.BASE_URL}sources/openmeteo-0.0.20-corresponding-source.tar.gz`}
          >
            OM 0.0.20 · {t.sourceCode}
          </a>
          <a
            href={`${import.meta.env.BASE_URL}sources/weather-globe-runtime-source.tar.gz`}
          >
            Runtime · {t.sourceCode} (54 MB)
          </a>
          <a href={`${import.meta.env.BASE_URL}THIRD_PARTY_NOTICES.txt`}>
            {t.licenses}
          </a>
        </div>
      </dialog>
      <dialog ref={linkDialog} className="modal">
        <div className="dialog-heading">
          <h2>{t.copyLink}</h2>
          <button
            className="icon-button"
            aria-label={t.close}
            onClick={() => linkDialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <input
          readOnly
          value={shareLink}
          aria-label={t.share}
          onFocus={(e) => e.target.select()}
        />
      </dialog>
    </div>
  );
}
function MapPlace({ p, fallback }: { p: Place; fallback: string }) {
  return (
    <span>
      <strong>{p.name || fallback}</strong>
      <small>
        {[p.admin1, p.country].filter(Boolean).join(" · ") ||
          `${p.latitude.toFixed(2)}, ${p.longitude.toFixed(2)}`}
      </small>
    </span>
  );
}
