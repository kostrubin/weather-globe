# Corresponding source and redistribution

Weather Globe code is GPL-2.0-only. Preserve LICENSE, THIRD_PARTY_NOTICES.txt, licenses/runtime.json and dependency notices. Data/service terms are separate; the code has no noncommercial restriction.

The static build includes `sources/openmeteo-0.0.20-corresponding-source.tar.gz`, containing:

- exact reader/binding source commit659de288ac1e2d16f8e40ab0cb73f51a1e1e73f9 (npm gitHead and v0.0.20);
- complete populated C source submodule18bee8578d953bd95ad7de1ae688faa7cf421f7c;
- GPL texts and original build scripts;
- CORRESPONDING_SOURCE_BUILD.txt describing npm ci, Emscripten4.0.12 and make/JS build.

Archive SHA256:78ff107061570c1abdcfc9eeef3cd5b2438cad299dc3f67f18a4fcdd625425b0. The locally installed/built WASM SHA256 is f90353337fb9f5c171888b78ae2124d153d07b5e09fc12e880e1ac77090a1e29 (2,107,535 bytes). Upstream source was inspected; upstream binary recompilation/bit reproducibility was not tested.

The feature branch supplies package.json, pnpm-lock.yaml, application source, scripts, public assets and the exact OM GPL source archive. Rebuild the app using Node 24 and pnpm 10.34.7, `pnpm install --frozen-lockfile`, `pnpm build`. The production build and matching application-source ZIP were prepared and verified locally, but no compiled application bundle was uploaded or published. Archive generation excludes .git history, node_modules, work/, credentials, provider downloads and browser profiles.

## Remaining preferred-source correspondence

Application source, package snapshots and license texts alone do not establish complete corresponding source for every module in a combined minified browser bundle. The source-only feature handoff is complete; external binary redistribution remains blocked pending the following preferred-source work:

- React/ReactDOM/scheduler/use-sync-external-store and the reconciler vendored by R3F contain generated builds in npm snapshots. React19.3.1 npm gitHead `61aa00df822d0eb76d0362eb8b6fdd3527693efe` exists in the upstream Git API, but its codeload archive returned HTTP503 through the configured environment tunnel on2026-10-21. Other React-family package versions must be resolved individually.
- R3F9.8.2 npm gitHead `e6ec3506ebf7879c26bd5ac27986b5d4421f3254` returned GitHub404. The available `v9.8.2` source tag actually declares fiber package version9.8.1, so that tag is an explicitly unverified fallback, not proof of exact9.8.2 source correspondence.
- Zustand's original TypeScript, suspend-react's original TypeScript, and the generator source for Babel runtime helpers were not obtained in the bounded review.

The local review snapshot preserves all22 installed production package snapshots, recovered source-map text, exact OM source and the clearly marked unverified R3F fallback. It is not presented as universally source-complete. Preferred source is present in Three, TanStack Query/Core, Zod and react-use-measure packages, and recovered from supplied `sourcesContent` for Lucide/its-fine. Type-only packages do not produce runtime browser code. Do not make a three-year source offer or claim complete binary redistribution from the lockfile alone.

The bounded raw observations are preserved in `evidence/source-delivery-status.json`.

## Pinned retrieval and assembly procedure

1. Use this branch's frozen lockfile and `licenses/runtime.json` to identify exact installed versions. Preserve their npm tarballs and `dist.integrity`; retain readable source-map `sourcesContent` without modification.
2. For every remaining package, obtain its official version metadata, for example `npm view '@react-three/fiber@9.8.2' repository.url gitHead dist.integrity --json`. Preserve that metadata. Resolve an immutable upstream commit and verify its package version/build inputs against the installed artifact; never substitute a changing default branch or assume a tag is exact.
3. For React19.3.1, retrieve `https://codeload.github.com/react/react/tar.gz/61aa00df822d0eb76d0362eb8b6fdd3527693efe`. Include Flow source, build scripts and notices. Resolve each other generated React-family artifact and the vendored reconciler to its matching source. The current tunnel503 prevents archive retrieval; it does not establish that upstream source is absent.
4. Resolve R3F's unavailable npm gitHead or obtain a publisher-confirmed exact source archive with build scripts. Its404/version-mismatched tag is an unresolved correspondence issue. Obtain the exact Zustand/suspend-react/Babel source forms and required build scripts similarly.
5. Assemble those preferred sources alongside the application and existing exact OM source, preserve notices and instructions, and verify correspondence before distributing the compiled bundle. Include the resulting source archive with that exact build; do not publish the current local ZIP as a source-complete binary release.

Runtime licenses include GPL-2.0-only, MIT, ISC and BSD-3-Clause. `pnpm run licenses` regenerates all22 production package notices; R3F MIT text is preserved separately because its npm artifact omits the LICENSE file. React's MIT notices cover the reconciler vendored in R3F. Dev-tool licenses do not relabel bundled code.
