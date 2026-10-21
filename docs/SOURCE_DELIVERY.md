# Corresponding source and redistribution

Weather Globe code is GPL-2.0-only. Preserve LICENSE, THIRD_PARTY_NOTICES.txt, licenses/runtime.json and dependency notices. Data/service terms are separate; the code has no noncommercial restriction.

## Runtime source delivery

The preferred-source follow-up completed2026-10-21. `public/sources/weather-globe-runtime-source.tar.gz` includes original/publisher source forms and build inputs for all22 audited production packages: exact package snapshots, readable source-map contents, immutable upstream React/Zustand/suspend-react/Babel archives, build scripts, notices, provenance records and the R3F reconstruction below. It excludes installed node_modules, caches, credentials, browser profiles, .git history and provider downloads. This optional download is outside the application's critical loading path.

Size:53,850,808B. SHA256:`1b729fa33097988af2fc28cb0b7cd98dcb9b19e021593dc9623a3c0b7f3418c0`.

R3F9.8.2's unavailable npm gitHead is not claimed obtained. Correspondence is supported by rebuilding available commit `d74622ea8ed717f7212d7e19d65ff3e325508389` with two recorded package-metadata adjustments: version9.8.1→9.8.2 and the explicit files list including native. Source TypeScript is unchanged. All13 JavaScript entry/chunk files have identical normalized Babel ASTs to the installed package; normalization ignores comments, positions, raw lexemes and hashed chunk basenames, preserving code, identifiers and values. Vendored reconciler JavaScript is byte-identical. Full source/config/frozen lockfile, metadata patch, comparison script and rebuilding instructions accompany the archive. Whole-package bit reproducibility is not claimed.

The earlier archive503/gitHead404 observations remain historical evidence in `evidence/source-delivery-status.json`. Later original-source downloads and verified R3F reconstruction closed the known preferred-source gaps; see `evidence/runtime-source-delivery.json` and `evidence/r3f-source-build.json`. Independent Sigstore signature verification is not claimed.

## Exact OM GPL/WASM source

The build also retains `sources/openmeteo-0.0.20-corresponding-source.tar.gz`, containing exact reader/binding commit `659de288ac1e2d16f8e40ab0cb73f51a1e1e73f9` (npm gitHead/v0.0.20), populated C submodule `18bee8578d953bd95ad7de1ae688faa7cf421f7c`, GPL texts, original build scripts and CORRESPONDING_SOURCE_BUILD.txt for npm ci/Emscripten4.0.12/make/JS build.

Archive SHA256:`78ff107061570c1abdcfc9eeef3cd5b2438cad299dc3f67f18a4fcdd625425b0`. Installed/build WASM SHA256:`f90353337fb9f5c171888b78ae2124d153d07b5e09fc12e880e1ac77090a1e29` (2,107,535B). Upstream OM binary recompilation/bit reproducibility was not tested.

## Application source and publication

The feature branch supplies package.json, pnpm-lock.yaml, application source, scripts and public assets. Use Node24 and pnpm10.34.7: `pnpm install --frozen-lockfile`, `pnpm build`. A distributable static build must carry matching application source and this runtime archive together, with notices and build instructions. The `gh-pages` handoff places `sources/weather-globe-app-source.zip` alongside the runtime archive. That application ZIP omits the large runtime archive only because it is co-delivered separately; its source manifest names the hash. No three-year written source offer is used.

Runtime licenses include GPL-2.0-only, MIT, ISC and BSD-3-Clause. `pnpm run licenses` regenerates production-package notices; R3F MIT text is preserved separately because its npm artifact omits LICENSE. React's MIT notices cover the reconciler vendored in R3F. MIT/BSD/ISC themselves require notices; the full preferred-source collection supports the GPL2§3 combined-bundle delivery profile. Dev-tool licenses do not relabel bundled code. See `PUBLISHING.md` for the private preview and GitHub Pages activation status.
