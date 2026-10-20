# Preparation status

Date: 2026-10-20

## Status

The repository and private Codex Cloud environment are ready for a separate implementation task. This is preparation evidence, not evidence of a completed application.

## Repository

- Target: `kostrubin/weather-globe`; the owner-created public visibility is unchanged.
- Default branch: `master`.
- The repository is selected in the existing ChatGPT Codex Connector installation. Write access was verified.
- Initial README commit: `606622e6618fc541f6fc0bbfc3c6eedcafa887d8`.
- Complete preparation bootstrap: `8602e3411e5b602fbcef3d4d8a0e12a6610e14e7`.
- The complete researched assignment is in `docs/CODEX_MASTER_PROMPT.txt`; repository-specific instructions are in `AGENTS.md`.
- Implementation belongs on `feat/weather-globe`, with a draft PR targeting the verified default branch when supported. No merge or production deployment is authorized.
- No application scaffold, package manifest, GitHub Actions workflow, API key, or paid service was introduced during preparation.

## Cloud environment

- Name: `weather-globe`.
- Attached repository: `kostrubin/weather-globe` only.
- Access: `Only me`, verified in the environment UI.
- The prepared environment was published. A fresh setup session from its published snapshot retained the prepared tools and helper and passed the checks below.
- The final reviewed snapshot includes the reusable browser helpers, the conditional setup/build Start skill, and the Package managers network preset with 19 explicit data/documentation/asset domains.
- The final two added hosts are `raw.githubusercontent.com` and `nodejs.org`, already specified in `docs/CODEX_SETUP.md`.
- No network secrets or project environment variables were added.
- Install checks are local-only. The optional network check is not run on every installation.
- New external spending is zero. Cloud work uses the owner's existing Codex entitlement and is subject to its available usage limits.

The six HTTP checks ran in a fresh runtime with matching network spec/observed revision 4. The policy-status metadata was `unknown`; actual successful requests establish access to the tested hosts, not a claim that every allowlist destination or enforcement state was independently verified.

## Verified tools

| Tool | Observed version / configuration |
| --- | --- |
| Node.js | v24.19.0 LTS, Krypton |
| pnpm | 10.34.7, `/workspace/weather-globe-tools/bin/pnpm` |
| Git | 2.52.0 |
| Python | 3.12.14 |
| Python Playwright | 1.62.0 |
| System Chromium | 154.0.8037.57, `/usr/bin/chromium` |
| Headless renderer | WebGL2 available through SwiftShader |

The install script passed twice during initial preparation. The tools and local browser smoke were checked again in the fresh session from the published snapshot. Application dependencies do not exist yet; the build task must pin compatible versions and create the lockfile after its data feasibility checks.

For each shell:

```bash
cd /workspace/weather-globe
export PATH="/workspace/weather-globe-tools/bin:$PATH"
```

## Data access checks

Each HTTP request used a 20-second timeout and a 256 KiB response cap. The six checks were bounded requests, not bulk model downloads or a global coordinate sampling job.

| Check | Actual result |
| --- | --- |
| ECMWF IFS025 latest manifest | HTTP 200; 5,165 bytes; valid JSON; `completed: true`; times and variables present |
| CAMS Global latest manifest | HTTP 200; 3,132 bytes; valid JSON; `completed: true`; times and variables present |
| CAMS Europe latest manifest | HTTP 200; 2,880 bytes; valid JSON; `completed: true`; times and variables present |
| One selected-location forecast | HTTP 200; 324 bytes; temperature, timestamp and units validated |
| One selected-location air-quality request | HTTP 200; 305 bytes; PM10, timestamp and units validated |
| One geocoding request | HTTP 200; 424 bytes; Berlin, DE result and coordinates validated |
| Disposable local browser page | HTTP 200; page content verified; WebGL2 available |
| Browser-origin S3 manifest fetch | HTTP 200; 5,165 bytes; `completed: true`; response type `cors`; WebGL2 available |

The browser request came from a temporary localhost page through the platform's existing proxy, with HTTPS verification enabled. An earlier browser attempt failed with `ERR_CERT_AUTHORITY_INVALID`; the final helper verified the current platform CA against Chromium's NSS database and the confirming browser request succeeded. The successful run found an already-present matching certificate and preserved its original trust. It did not import or delete a certificate; the helper's new-entry cleanup branch was not exercised by that successful check.

## Retained browser helpers

These environment files are outside the repository and retained in the environment snapshot:

- `/workspace/weather-globe-tools/checks/browser-check.py`: disposable local page/content/WebGL2 smoke.
- `/workspace/weather-globe-tools/checks/with-proxy-ca.py`: verifies only the provided current platform CA and uses the isolated Cloud VM account's NSS database, preserving existing certificates and trust.
- `/workspace/weather-globe-tools/checks/browser-origin-check.py`: optional bounded S3/CORS check.

The wrapper serializes its invocations, reuses an existing matching CA without changing it, and is designed to remove only a matching entry it created after the child test exits. Its scope is the test account's NSS store within the isolated Cloud VM; it is not a process-private store or the owner's actual browser. It does not override HOME, change proxy routing, or disable TLS verification.

Optional local check:

```bash
python /workspace/weather-globe-tools/checks/with-proxy-ca.py -- python /workspace/weather-globe-tools/checks/browser-check.py
```

Optional explicit network check, only when needed to diagnose a concrete readiness issue:

```bash
python /workspace/weather-globe-tools/checks/with-proxy-ca.py -- python /workspace/weather-globe-tools/checks/browser-origin-check.py
```

The tested browser helper configures the platform proxy explicitly and exempts only loopback traffic. Future browser tests should follow that supported configuration; merely inheriting HTTP-client environment variables is not proof of correct browser routing.

## Still part of the implementation assignment

- Real browser Worker/WASM decoding and GPU texture upload for actual fields at two times.
- Correct units, intervals, geography, coverage masks, missing data, interpolation and scientific semantics.
- Application implementation, responsive UI, localization, accessibility and error recovery.
- Dependency/license verification, pinned application versions and lockfile.
- Application tests, production build and private application preview.
- Performance measurement on representative hardware/mobile devices. SwiftShader availability is not hardware FPS or mobile performance evidence.

## Ready launch

A separate Cloud task draft was prepared with environment `weather-globe`, model `GPT-6.1 Sol High`, and `Approve for me`. Its implementation prompt remains unsent. These are launch selections, not promises that platform approvals or usage limits can never interrupt a task.

Use the launch text in `docs/CODEX_SETUP.md`. The build task must read this progress record and the complete master prompt, preserve user changes, continue through the authorized build and verification, and report any genuine blocker precisely. Preparation itself did not start the application build.
