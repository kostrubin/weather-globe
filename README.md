# Weather Globe

Interactive Russian/English weather atlas built with React, TypeScript, Three.js/R3F and a threadless OM WebAssembly Worker. Static frontend, no API key or server/database. Implementation branch: `feat/weather-globe`; no production deployment is configured.

## Run

Node.js24 LTS and pnpm 10.34.7 (pinned in package.json):

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Production and verification:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm preview --port 4174
pnpm test:e2e
pnpm run licenses
```

Open `http://localhost:4174/`. Browser tests require Chromium at `/usr/bin/chromium`, or set `WG_CHROMIUM` to an installed executable. `WG_TEST_URL` selects another production server. Playwright is pinned 1.62.0; no paid testing service or CI workflow is activated. The supplied static QA server serves precompressed Brotli/gzip assets with correct WASM MIME. An ordinary static host also works; verify its compression settings.

For a non-root path: `WG_BASE_PATH=/atlas/ pnpm preview --port 4175`, then open `http://localhost:4175/atlas/`. Vite uses relative assets. No SharedArrayBuffer, COOP/COEP, runtime function or proxy is required.

## Explore

Start with Buenos Aires as an example. Rotate/zoom/select the globe, search a city or `52.52,13.405`, select one of nine layers, and move through real metadata frames. Local forecast includes an hourly chart/table and 7 daily summaries. Favorites, recent places, language and units stay in your browser. Share creates a URL with requested location/layer/species/units/time. Explicit geolocation only; no initial permission prompt.

Temperature, precipitation, wind, clouds, humidity and MSLP use global ECMWF IFS; all-sky UV and PM2.5 use CAMS Global. Pollen supports six species within CAMS Europe, never global pollen. Buenos Aires shows no coverage, with an explicit camera action to see Europe. Wind trajectories use real u/v, accelerated 3000×. PM2.5 concentration and provider **European AQI** are separate. Precipitation is an interval-average model rate, never radar. See [data semantics](docs/DATA.md).

Auto/High/Low quality, reduced motion, keyboard controls, a mobile expandable forecast and a functional no-WebGL/context-loss view are included. Headless software-GPU verification does not establish real-device FPS. `?demo=1` is an explicit synthetic fixed-time test mode, prominently labeled; normal requests never fall back to it. Point data is unavailable in this network-free test mode.

## Evidence and limits

See [verification](docs/VERIFICATION.md), [progress](docs/PROGRESS.md) and [plan](docs/PLAN.md). Nine real spatial modes and multiple valid times were decoded/rendered through the production Worker with conditional206ranges. This is sample integration evidence, not a guarantee of future provider uptime or every future frame.

Public S3 data and selected-point APIs are separate. The hosted API is noncommercial/quota limited; current exact terms pages were blocked403 during revalidation. No new spending, billing, production hosting, tracking or scheduled ingestion. An eventual public/commercial launch needs a separate service-capacity/terms review. A late environment HTTPS tunnel503 interrupted fresh live performance rechecks after successful integration tests. The current cloud environment exposes loopback QA only; no native remote preview/forwarding tool was available.

Code GPL-2.0-only. Data CC BY4.0 with modified Copernicus CAMS/ECMWF credit; Natural Earth public domain. Preserve [third-party notices](THIRD_PARTY_NOTICES.txt) and follow [source delivery status and procedure](docs/SOURCE_DELIVERY.md). Exact OM GPL/WASM source is included; preferred-source correspondence for some other bundled modules remains unresolved, so the compiled bundle is retained locally rather than externally distributed. The feature branch supplies application source and reproducible build inputs, without claiming a universally source-complete binary release. After resolving source delivery, a free static host can serve `dist/` with build command `pnpm install --frozen-lockfile && pnpm build`; do not enable Functions for static assets. Deployment, domains, account creation, merge and production publication are outside this task.
