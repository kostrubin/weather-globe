# Corresponding source and redistribution

Weather Globe code is GPL-2.0-only. Preserve LICENSE, THIRD_PARTY_NOTICES.txt, licenses/runtime.json and dependency notices. Data/service terms are separate; the code has no noncommercial restriction.

The static build includes `sources/openmeteo-0.0.20-corresponding-source.tar.gz`, containing:

- exact reader/binding source commit659de288ac1e2d16f8e40ab0cb73f51a1e1e73f9 (npm gitHead and v0.0.20);
- complete populated C source submodule18bee8578d953bd95ad7de1ae688faa7cf421f7c;
- GPL texts and original build scripts;
- CORRESPONDING_SOURCE_BUILD.txt describing npm ci, Emscripten4.0.12 and make/JS build.

Archive SHA256:78ff107061570c1abdcfc9eeef3cd5b2438cad299dc3f67f18a4fcdd625425b0. The distributed WASM SHA256 is f90353337fb9f5c171888b78ae2124d153d07b5e09fc12e880e1ac77090a1e29 (2,107,535 bytes). Upstream source was inspected; upstream binary recompilation/bit reproducibility was not tested.

The handoff includes a matching app-source archive with package.json, pnpm-lock.yaml, source, scripts, public assets and exact GPL source archive. Rebuild the app using Node 24 and pnpm 10.34.7, `pnpm install --frozen-lockfile`, `pnpm build`. Do not redistribute a binary-only build without its matching source/notices. Archive generation excludes .git history, node_modules, work/, credentials, provider downloads and browser profiles.

Runtime licenses include GPL-2.0-only, MIT, ISC and BSD-3-Clause. `pnpm run licenses` regenerates all22 production package notices; R3F MIT text is preserved separately because its npm artifact omits the LICENSE file. React's MIT notices cover the reconciler vendored in R3F. Dev-tool licenses do not relabel bundled code.
