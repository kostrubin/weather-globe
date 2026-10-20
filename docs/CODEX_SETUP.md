# Codex Cloud preparation

## Intended configuration

| Setting | Value |
| --- | --- |
| Environment name | `weather-globe` |
| Repository | `kostrubin/weather-globe` only |
| Environment access | Private / only the owner |
| Checkout base | Current default branch, initially `master` |
| Runtime | Node.js 24 LTS |
| Package manager | pnpm 10, actual version recorded during setup |
| Browser checks | Playwright + Chromium, or the environment's supported browser tooling |
| Secrets | None required for the selected public data providers |
| Paid services | None |
| Production deployment | Not authorized |
| Application build | Separate task after environment preparation |

Publishing a prepared Codex environment makes its setup available to future tasks. It is distinct from publishing the application to the internet. Keep environment sharing private.

## Setup request

Use the following text in the cloud environment setup conversation:

```text
Prepare this environment for the new kostrubin/weather-globe project.
This task is environment preparation only; do not build the application and do not execute START NOW from docs/CODEX_MASTER_PROMPT.txt.
Read AGENTS.md and docs/CODEX_SETUP.md. Install or verify Node.js 24 LTS, pnpm 10, Git, and the supported browser testing tools needed for Vite/React/TypeScript/Three.js. Record exact installed versions. Do not create an application scaffold or package manifest during setup.
There are no project dependencies yet. When a later task adds a package.json and lockfile, install its declared dependencies with the pinned package manager and frozen lockfile. Prefer existing supported browser tooling. If a browser installation is necessary, record the exact testing-tool version and matching browser revision; do not guess a Playwright revision before selecting its package version. Use official package sources only.
Verify access to the public data hosts with a small number of bounded requests. Do not download bulk model files or start recurring jobs. Verify that a local static server can be reached by the environment's preview/browser tooling; a disposable temporary page is sufficient and must be clearly identified as a setup check.
Configure internet access only through the supported environment settings and only within the user's granted permissions. Keep the environment private. No secrets, API keys, new paid services, payment methods, production deployments, CI workflows, or repository permission changes are needed. Do not silently change existing GitHub or account-level settings.
Report setup checks as passed/failed/not-run. Return the exact install/start setup and any owner-only blocker. Do not claim the application has been built. Once setup is verified, make the private environment ready for a separate implementation task.
```

## Network access

Use the package-manager preset where supported, plus the required public hosts below. Allow only necessary additional hosts; do not use a CORS proxy, disable certificate verification, or work around organization/network restrictions.

### Runtime data hosts

```text
openmeteo.s3.amazonaws.com
api.open-meteo.com
air-quality-api.open-meteo.com
geocoding-api.open-meteo.com
eccharts.ecmwf.int
```

### Documentation and asset sources used by this assignment

```text
open-meteo.com
registry.opendata.aws
confluence.ecmwf.int
nodejs.org
pnpm.io
vite.dev
react.dev
threejs.org
r3f.docs.pmnd.rs
docs.pmnd.rs
playwright.dev
naturalearthdata.com
www.naturalearthdata.com
github.com
raw.githubusercontent.com
codeload.github.com
release-assets.githubusercontent.com
```

The browser installer may require official download hosts such as `cdn.playwright.dev` or `playwright.download.prss.microsoft.com`. Add the exact host shown by the official installer if required and permitted. Package registry access and browser download access are separate. Keep data origins reachable during the task and from the actual browser/preview context, not only during installation.

## Bounded preflight

1. Verify runtime and package-manager versions.
2. Confirm checkout of this repository and its expected preparation files.
3. Fetch these small completed-run manifests with timeouts:

   - https://openmeteo.s3.amazonaws.com/data_spatial/ecmwf_ifs025/latest.json
   - https://openmeteo.s3.amazonaws.com/data_spatial/cams_global/latest.json
   - https://openmeteo.s3.amazonaws.com/data_spatial/cams_europe/latest.json

4. Verify one small selected-location forecast request, air-quality request, and geocoding request if the environment permits them. Respect rate limits; no bulk coordinate sampling.
5. Verify the public CAMS capabilities endpoint only when checking the fallback adapter: https://eccharts.ecmwf.int/wms/?service=WMS&request=GetCapabilities&version=1.3.0&token=public
6. Open a disposable local static page through the supported preview/browser path. Record browser and renderer availability. This is an environment check, not a mobile performance benchmark or app integration test.
7. Preserve the prepared environment with private access. No GitHub Actions pipeline is necessary for these checks.

The browser Worker/WASM decode, two layers/two times, units, geography, and actual GPU texture tests belong to stage 1 of the build assignment. An HTTP 200 manifest alone does not satisfy them.

## Prepared environment evidence

The private `weather-globe` environment was prepared on 2026-10-20. Read [the progress record](PROGRESS.md) for exact versions, passed checks and checks that still belong to application development.

The prepared runtime uses Node.js v24.19.0 LTS and pnpm 10.34.7, with Python Playwright 1.62.0 and system Chromium 154.0.8037.57. Use the prepared pnpm path:

```bash
cd /workspace/weather-globe
export PATH="/workspace/weather-globe-tools/bin:$PATH"
```

The snapshot retains local/browser test helpers under `/workspace/weather-globe-tools/checks`. The optional browser-origin check succeeded with real page-origin CORS and normal HTTPS verification. It uses the platform's explicit proxy configuration and a wrapper for only the platform-provided CA. The successful run reused an existing matching CA without changing its trust. Do not replace this setup with TLS bypass options.

The Start skill distinguishes environment preparation from a separately authorized build. Setup must not execute the master prompt's implementation command. A build task must read and execute the full master prompt rather than treating preparation-only restrictions as permanent prohibitions.

## Start the separate build task

In ChatGPT, open Explore → Codex, choose Work in → Cloud → `weather-globe`, then use `GPT-6.1 Sol High` with `Approve for me`. A draft with these selections has been prepared; sending it starts implementation. Cloud tasks run remotely, subject to the account's available usage and platform approval rules.

Paste the full `docs/CODEX_MASTER_PROMPT.txt` into a new task in this environment, or use:

```text
Implement Weather Globe in kostrubin/weather-globe. Read AGENTS.md, then read docs/CODEX_MASTER_PROMPT.txt completely and execute it in BUILD_WITHOUT_PAUSES mode. Read docs/PROGRESS.md for the latest preparation evidence. Work on feat/weather-globe from the verified current default branch (initially master). Finish the authorized implementation, real-data browser feasibility checks, polished responsive 3D interface, meaningful verification, production build, and available private preview. Use one implementation writer and independent read-only reviewers when useful. New external spending is zero. Do not stop after a plan or scaffold; follow the specification through completion or a precisely evidenced blocker. Do not merge or deploy to production. Communicate in Russian and return evidence of the completed result.
```

## Official references

- https://learn.chatgpt.com/docs/environments/cloud-environments
- https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://nodejs.org/en/about/previous-releases
- https://playwright.dev/docs/intro
- https://chromium.googlesource.com/chromium/src/+/main/docs/linux/cert_management.md

Configuration names and available controls can change. Follow the actual environment UI and current official documentation, preserving the zero-spend and private-environment constraints.
