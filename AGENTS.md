# Weather Globe — repository instructions

## Scope and task mode

Work only in `kostrubin/weather-globe`. Preserve unrelated files and user changes. Communicate progress and final results in Russian; use English for code and technical documentation.

`docs/CODEX_MASTER_PROMPT.txt` is the complete build specification. Read it fully for an explicitly requested implementation task. During cloud environment preparation, treat it as reference only: do not execute its `START NOW` instruction or start building the product. Environment preparation is complete when the runtime, tools, repository access, and bounded data access checks are ready; the product starts in a separate build task.

This repository initially contains preparation documents only. The absence of `package.json` is expected, not an application failure. Do not invent successful app tests, a runnable server, or a completed feature.

## Implementation workflow

- Base: the verified current default branch, initially `master`.
- Create or reuse the task's isolated feature branch, normally `feat/weather-globe`.
- Keep implementation commits off the default branch, `master`, and `main`.
- One implementation writer; additional agents may review without editing the same tree.
- Routine in-scope implementation, tests, reversible fixes, and local commits are authorized by the build assignment.
- Push a feature branch and create/update one draft PR only through an already authorized connection, after checking CI/deployment side effects. Target `master` while it remains the default branch.
- Do not merge, force-push, reset user work, change repository visibility, modify protected settings, or publish a production site.
- Keep concise `docs/PLAN.md`, `docs/PROGRESS.md`, `docs/DATA.md`, and `docs/VERIFICATION.md` as implementation progresses. Resume from recorded evidence.

## Budget and dependencies

New external spending is zero. Use the existing Codex entitlement and free project tools. Do not add billing details, subscribe, purchase credits, create paid cloud resources, or enable scheduled workflows. This rule is not an account-level spending control.

Preferred runtime: Node.js 24 LTS and pnpm 10. Pin actual compatible dependency and package-manager versions with a lockfile when creating the app. Keep install/setup reproducible. Verify exact licenses before distributing GPL/WASM components; do not label all dependencies MIT.

## Data and completion

- First verify real spatial data through the browser Worker and production build.
- Never construct a global field with thousands of point API requests.
- No-data is not zero. Pollen coverage is regional. Precipitation intervals, source/model/run, valid time, units, and legends must remain consistent.
- Never present synthetic or cached demonstration data as live data.
- Verify meaningful numeric cases, real provider smoke checks, production build, desktop/mobile layout, accessibility, and actual responsiveness.
- Report passed, failed, and not-run checks honestly. Headless software rendering does not establish hardware-mobile FPS.
