# Weather Globe

An interactive 3D weather and environmental atlas, prepared for autonomous implementation in Codex Cloud.

**Current status: the repository and private Codex Cloud environment are prepared and verified for a separate implementation task. The application has not been implemented yet.**

## Project specification

- [Complete build assignment](docs/CODEX_MASTER_PROMPT.txt)
- [Cloud environment preparation](docs/CODEX_SETUP.md)
- [Current progress](docs/PROGRESS.md)
- [Repository instructions](AGENTS.md)

The intended application includes temperature, precipitation, wind, UV, European pollen, PM2.5, cloud cover, humidity, and mean sea-level pressure, with an interactive globe, timeline, selected-place forecast, and Russian/English UI.

## Start development

The private `weather-globe` environment is prepared. See `docs/PROGRESS.md` for verified runtime/data/browser checks and the remaining application-level work. In ChatGPT, open Explore → Codex, choose Work in → Cloud → `weather-globe`, then start a separate build task with the launch text in `docs/CODEX_SETUP.md` or the complete assignment in `docs/CODEX_MASTER_PROMPT.txt`.

The prepared launch uses `GPT-6.1 Sol High` and `Approve for me`. Its prompt tells Codex to read the full assignment and execute it in `BUILD_WITHOUT_PAUSES` mode through implementation, verification and an available private preview.

The base branch is `master`. Implementation belongs on `feat/weather-globe`, followed by a draft PR targeting `master` when the connected environment permits it. Do not merge or publish the application automatically.

## Boundaries

- No new external spending, payment methods, paid APIs, or trials requiring a card.
- Personal, noncommercial default use of hosted weather APIs.
- No production deployment or repository visibility changes.
- No CI workflows or recurring ingestion jobs are configured by this bootstrap.
- A GPL-compatible code distribution profile is planned for the selected OM decoder; exact dependency licenses and corresponding-source requirements must be verified during implementation. This preparation repository does not claim a finished application license.

The repository intentionally has no `package.json`, lockfile, or application scaffold yet. The implementation task will choose compatible pinned versions after verifying the real data path. Do not report build/test commands as passed before they exist.
