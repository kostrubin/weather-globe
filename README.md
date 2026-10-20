# Weather Globe

An interactive 3D weather and environmental atlas, prepared for autonomous implementation in Codex Cloud.

**Current status: preparation only. The application has not been implemented yet.**

## Project specification

- [Complete build assignment](docs/CODEX_MASTER_PROMPT.txt)
- [Cloud environment preparation](docs/CODEX_SETUP.md)
- [Current progress](docs/PROGRESS.md)
- [Repository instructions](AGENTS.md)

The intended application includes temperature, precipitation, wind, UV, European pollen, PM2.5, cloud cover, humidity, and mean sea-level pressure, with an interactive globe, timeline, selected-place forecast, and Russian/English UI.

## Start development

Prepare the private Codex environment using `docs/CODEX_SETUP.md`. Then start a separate build task with the full assignment in `docs/CODEX_MASTER_PROMPT.txt`, or ask Codex to read that file completely and execute it in `BUILD_WITHOUT_PAUSES` mode.

The base branch is `master`. Implementation belongs on `feat/weather-globe`, followed by a draft PR targeting `master` when the connected environment permits it. Do not merge or publish the application automatically.

## Boundaries

- No new external spending, payment methods, paid APIs, or trials requiring a card.
- Personal, noncommercial default use of hosted weather APIs.
- No production deployment or repository visibility changes.
- No CI workflows or recurring ingestion jobs are configured by this bootstrap.
- A GPL-compatible code distribution profile is planned for the selected OM decoder; exact dependency licenses and corresponding-source requirements must be verified during implementation. This preparation repository does not claim a finished application license.

The repository intentionally has no `package.json`, lockfile, or application scaffold yet. The implementation task will choose compatible pinned versions after verifying the real data path. Do not report build/test commands as passed before they exist.
