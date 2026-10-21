# Build plan

Authorized BUILD_WITHOUT_PAUSES. Base verified by GitHub and git HEAD: master c98a20c88ecc8c913fa7ff6efdd4addec4459523. One implementation writer; independent read-only reviews. No paid services, CI activation, production hosting, merge, or visibility changes.

1. Verify browser Worker/WASM/range path with completed spatial runs, units, geography and two times.
2. Complete globe vertical slice, then all nine required scalar modes and physical wind.
3. Complete local forecast/search, timeline, RU/EN, saved places, URL, quality, mobile and accessible fallbacks.
4. Run numerical, interaction, real-provider, production and visual checks. Independent review with at most two formal correction cycles.
5. Package source/licenses and build; feature branch/draft PR only after side-effect inspection, environment preview only if supported.

Decisions: numeric OM spatial route for all required modes; no WMS needed if verified. React state plus React Query (no second global store). One shared scalar texture/palette pipeline, bounded CPU wind simulation with one batched draw. Static-only Vite output; relative base paths. Keep empty/no-coverage distinct from true zero.

Verification decisions: added pinned Prettier 3.8.4 (MIT, dev-only) to make the large TS/JSX implementation reviewable; no runtime capability or service. Fixed a real provider daily-date/DST mismatch using Open-Meteo's civil-date contract, separately from hourly UTC instants.
