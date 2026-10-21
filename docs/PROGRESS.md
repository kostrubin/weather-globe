# Implementation status — 2026-10-21

## Delivered scope

Weather Globe is implemented in `feat/weather-globe`, based on verified current default `master` c98a20c88ecc8c913fa7ff6efdd4addec4459523. Preparation evidence remains in that base commit. One implementation writer; independent read-only data, browser-trust, license and implementation reviews.

- Nine real OM scalar modes, u/v wind animation and exact-time optional overlay; conditional bounded ranges, threadless Worker/WASM, version-aware bounded caches and latest-request commitment.
- Interactive georeferenced globe, Natural Earth coastlines, palettes, run/valid/interval information and explicit regional pollen masks.
- Selected-point forecast/chart/table/7 daily summaries, named European AQI, search/coordinates, RU/EN, favorites/recent places, persistent settings, share URL and explicit geolocation.
- Responsive desktop/mobile sheet, keyboard controls, reduced motion, Auto/High/Low quality and usable WebGL-loss/absent fallback with retry.
- Ordinary static production build with relative paths, Brotli/gzip sidecars, exact OM GPL source archive and third-party notices. Full dependency preferred-source correspondence is not claimed.

## Verified

- Frozen install, typecheck, lint, 15 numeric/network/schema tests, 7 E2E scenarios and production build passed.
- All nine modes decoded and rendered in production Chromium 154 / SwiftShader from completed real runs; several second valid times and six pollen species verified.
- Four actual pixels matched numerical palette RGB exactly. Berlin DST daily-date issue fixed and independently checked against provider ISO response.
- Desktop/mobile screenshots visually inspected; WCAG scans zero violations in tested states. Short landscape legend containment fixed and verified.
- `/atlas/` Worker/WASM and actual compressed transfers verified. No physical-mobile or hardware FPS claim. Detailed results in `VERIFICATION.md` and `evidence/`.
- First independent review defects fixed and targeted rechecked: near-side raycast, zoom delta, overlay cancellation, interpolation agreement, numerical wind bearing, source identity, missing chart handling and context retry.

## Delivery boundaries

No new spending, billing, CI workflow, production deployment, merge, force-push or repository visibility change. Existing GitHub connection authorizes feature delivery. Available remote side-effect inspection found no workflows/hosting configuration, zero Actions runs and empty default-commit statuses. Remote push/draft PR outcome and final SHA are recorded in handoff after verification.

## Precise remaining environment limits

At 00:07 UTC the environment's outbound HTTPS tunnel began returning HTTP 503 with `upstream connect error ... Invalid argument|remote address:envoy://cloudflare_https_tunnel/` for S3 and point APIs; an independent bounded retry confirmed it. This blocked a fresh live wind performance rerun after earlier successful integration checks. It was not bypassed or silently replaced by demo data. Source errors remain visible; last known frames retain their own time. Local renderer profiling is explicitly labeled synthetic fixture evidence.

No native remote-preview/port-forward tool is available. Loopback production QA servers are not presented as user-accessible private URLs. Firefox/WebKit, real mobile GPU targets and real-visit CWV are untested. Exact current hosted pricing/terms pages returned403; conservative noncommercial service constraints are documented. No owner decision is needed for the finished local artifacts; permanent hosting remains a separate authorized task.

Verified remote implementation commit: `b341bc90b43d14aef66564c4c243a8db90155707`, tree `dcf648ecfeacf3fffd25098aa5b7023e0f63608b`. It includes the full verified implementation and a final typechecked/built display-only change exposing optional overlay provenance independently. Git HTTPS push received the same503 tunnel failure; the existing GitHub connector delivered the identical Git tree from verified master via Git Data APIs. The local branch was synchronized to that exact content-addressed commit without rewriting published history. Later delivery-documentation commits do not change application code.

The designated projectless output mount is absent/read-only in this managed runtime (`mkdir /codex/.../output` fails even with the exact filesystem grant). User-facing evidence is therefore delivered through the authorized GitHub feature branch. Production `dist/` and verified ZIPs remain local; no external compiled bundle or permanent site is published.

External binary delivery is partial: exact OM GPL source is included, but React source archive retrieval returned503, R3F npm gitHead returned404 and the available release tag declares9.8.1 rather than installed9.8.2, and some generated modules still lack preferred-source forms. The independent review preserved package/source-map snapshots locally. `SOURCE_DELIVERY.md` records exact findings and a pinned retrieval procedure. These findings do not block reviewing or rebuilding the application source; they prevent claiming a source-complete binary release.
