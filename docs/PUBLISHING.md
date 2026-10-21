# Viewing and static publication

The owner requested a hosted viewing link after the original source-only handoff. The public GitHub Pages site is:

https://kostrubin.github.io/weather-globe/

GitHub automatically enabled Pages when the new `gh-pages` branch was pushed. Built-in run39524866085 completed build/deploy/report-build-status successfully; the deploy log confirmed the exact environment URL. No manual activation is needed. Static commit: `0323e5097181807c8c4a4d26f61a92cf91c31786`; matching application source: `f480926bd6de0215c4142a12ef8831e2a8746fec`.

An owner-private backup is:

https://weather-globe-preview.yummy-bloom-2840.chatgpt.site

Sign in with the same ChatGPT account. This Sites deployment is owner-only; no audience expansion, paid resources, custom domain, database or provider proxy was configured. It serves the verified application from source handoff2c38d793514896aa2159df6ec2d0ed6af4ff0fd2. Subsequent source-delivery documentation and runtime-source download links do not change the weather pipeline. Deployment identity and successful status are in `evidence/publishing.json`; the isolated checkout retains its `.openai/hosting.json` under `work/private-preview/` for future updates. Never create a duplicate Site for that checkout.

## GitHub Pages

The prepared `gh-pages` branch contains a static production build at the root, `.nojekyll`, license notices, matching application source and runtime source. It requires no merge to master, custom Actions workflow, API key or backend. The owner has authorized this viewing publication.

Before upload GitHub reported `has_pages:false`. Direct API activation was unavailable through this environment, but the authorized branch push triggered GitHub's automatic Pages setup and standard dynamic deployment. Repository Pages is now enabled. No custom workflow file or schedule was added, and the public standard runner introduced no external spending.

Before branch delivery an independent Chromium production smoke mounted the actual build at `/weather-globe/`:11 local assets returned200; Worker/lazy3D/WASM paths and WASM MIME passed; real temperature00Z→03Z and UV03Z rendered without page errors. See `evidence/pages-prefix-browser.json`. A future origin-specific check must also verify provider CORS, shared-URL reload and actual compression. GitHub Pages may ignore precompressed sidecars, so their presence alone is not proof of transfer encoding.

The Vite base is already `./`. Keep source archives outside the critical loading path. A public viewing URL is a binary distribution: retain the matching source and notices under `sources/` and follow `SOURCE_DELIVERY.md`. Never include credentials, browser profiles, environment files, .git history or provider downloads in the static branch.
