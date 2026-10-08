# Swap Lens

A small, offline Ethereum swap simulator for the IMD community. Change an ETH amount, pool depth, or slippage tolerance to explore estimated tokens received, price impact, and minimum received. A chart and plain-language explanation update immediately. The visible footer explains what was built and why.

This complements the existing gas converter and stacking game. It uses fictional TOKEN reserves and is a learning tool, with no live quotes, wallet, signing, accounts, storage, analytics, or external runtime requests.

## Install and run

Use Node.js 22.18+ (verified with 24.9.0) and npm. Vite 7.3.7 and TypeScript 5.9.3 are pinned in the lockfile. This small module uses native HTML controls and TypeScript without a UI framework or runtime dependencies.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The development server can load source updates; offline/runtime checks apply to the production export.

## Rebuild and preview

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

`dist/` is the complete production website, included alongside its source and lockfile. Preview it over HTTP rather than opening `index.html` as a local file: browsers restrict ES modules on `file:` URLs. `vite.config.ts` sets `base: './'`, so all asset references work under a static hosting subdirectory.

## Publish and embed

Upload **the complete contents of `dist/`** to the static hosting directory. Serve `index.html` for that directory and keep `assets/`, `favicon.svg`, and `THIRD_PARTY_NOTICES.txt` beside it. No build service, server rewrites, runtime configuration, API, or credentials are needed. For the contributor submission, include the generated `dist/` as well as `src/`, `public/`, package files, tests, and documentation; the publisher serves the export without rebuilding.

Use the deployed directory URL as the iframe `src`, give it `title="Swap Lens"`, and let it fill the available width. The module supports 360px and 1200px widths and uses normal vertical scrolling; a 900px iframe height is a useful starting point. There is no parent-page messaging or automatic height negotiation. Standard unsandboxed embedding works; if the host uses a sandbox, the tested configuration is `sandbox="allow-scripts allow-same-origin"` on a dedicated module origin. The module needs scripts and a usable origin for its local ES modules, and needs no wallet, popup, top-navigation, or form-submission permissions. Hosting headers must permit the intended parent to frame the page.

## Checks and actual results

```sh
npx playwright install chromium
npm run test:browser
```

The browser script starts its own bounded local HTTP server, serves the export at `/preview/`, opens Chromium, checks interactions and accessibility, captures `artifacts/desktop.png` and `artifacts/mobile.png`, and closes both server and browser. Temporary logs and extra screenshots go under `/tmp`.

Actual checks on 2026-10-08:

- Production build and strict TypeScript check passed.
- Seven model tests passed, including independent quote values, pool conservation, input boundaries, and tolerance behavior.
- Twelve browser check groups passed: presets, all pools, tolerance, invalid/empty input, recovery, reset, keyboard controls, disclosure, responsive chart, offline calculations, iframe loading, and local-only resources.
- No horizontal overflow at 320, 360, 600, 752, 800, or 1200px, including maximum input. Also checked 200% text enlargement at 320, 360, and 1200px.
- Axe reported zero WCAG A/AA violations in the tested default and invalid states. Eight measured rendered text/background pairs exceeded 4.5:1. This is not a claim of full accessibility certification.
- No console errors, failed resources, HTTP errors, or external requests during the browser run. The final dependency audit reported zero vulnerabilities.

The supplied browser connector lacked its Chromium executable. A separately installed Playwright Chromium 141 performed the actual rendered checks. Native browser zoom, real screen-reader sessions, physical touch devices, Safari, and Firefox were not tested. System-font rendering can vary between platforms. Details, fixes, evidence, and remaining limitations are in [artifacts/validation.md](artifacts/validation.md).

For this restricted contributor workspace, dependencies and browser binaries were installed entirely under `/tmp`; the repository contains no dependency/cache directory. Equivalent commands used:

```sh
PATH=/tmp/swap-lens-tools/node_modules/.bin:$PATH npm run typecheck
PATH=/tmp/swap-lens-tools/node_modules/.bin:$PATH npm run build
npm test
SWAP_LENS_TOOL_ROOT=/tmp/swap-lens-tools PLAYWRIGHT_BROWSERS_PATH=/tmp/swap-lens-browsers npm run test:browser
```

`SWAP_LENS_TOOL_ROOT` is an optional test-tool path, not runtime configuration. Normal installations do not need it. Keep generated dependencies, browser downloads, caches, and archives out of the Git submission at every nesting level. No ignore file was created or modified.

## Model and limitations

All pools start at 1,000 TOKEN per ETH, with ETH reserves of 10, 100, or 1,000 and matching token reserves. The input fee is 0.3%.

```text
net input = ETH input × 0.997
output = token reserve × net input / (ETH reserve + net input)
price impact (%) = net input / (ETH reserve + net input) × 100
minimum received = output × (1 − slippage tolerance / 100)
```

Price impact excludes the input fee and compares average execution with the initial reserve ratio. Each chart point is an independent hypothetical trade from the initial reserves. Values use JavaScript floating point and are rounded for display; they are not on-chain integer quotes. The model excludes gas, transfer taxes, concentrated liquidity, routing, other trades, and execution rounding. Tolerance choices and insight bands are educational controls, not recommendations.

## Source map

- `src/main.ts`: semantic page, interactions, announcements, responsive SVG chart.
- `src/model.ts`: pure calculations, presets, validation, formatting.
- `src/style.css`: design tokens, components, responsiveness, accessibility states.
- `tests/`: repeatable model and production-browser validation.
- [DESIGN.md](DESIGN.md): implemented design system.
- `artifacts/`: design review, screenshots, and guide license record.

The implementation applied the pinned Better Interface design reference (MIT, upstream commit `267330e1adfc66a718fb65fa6918c1f06d0a689e`) and its adapted Impeccable documentation method (Apache-2.0, upstream commit `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8`). The supplied attribution and license texts are preserved in `artifacts/design-guide-LICENSE.txt`. The Vite runtime helper notice is in `public/THIRD_PARTY_NOTICES.txt` and the export.
