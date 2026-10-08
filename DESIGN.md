# Swap Lens design system

## Overview

Swap Lens helps Ethereum token holders explore liquidity in under a minute. Its visual character pairs an editorial serif headline with a compact technical workbench: warm paper, dark ink, restrained blue selection states, and a live numerical result. The page has one heading, one form, one result panel, an explanation, and a visible project note. It is an independent module without host-site branding.

The source of truth is `src/style.css`, with semantic structure and the chart in `src/main.ts`. The side-by-side workbench is specific to this page; spacing, control treatments, type roles, and focus behavior are reusable.

## Colors

The `:root` block in `src/style.css:1` defines sRGB hex primitives and semantic aliases. Components use role tokens.

| Semantic token | Value | Use |
| --- | --- | --- |
| `--color-page` | `#f5f4ef` | Warm page canvas |
| `--color-surface` | `#fffefb` | Form fields, result panel, text on filled selections |
| `--color-soft` | `#efeee8` | Simulation label and neutral insight |
| `--color-text` | `#202b30` | Headings, primary content, chart marker label background |
| `--color-muted` | `#586367` | Hints, secondary copy, axis labels |
| `--color-border` | `#d9ddd9` | Structural separators and chart grid |
| `--color-control-border` | `#7d8788` | Interactive control outlines |
| `--color-accent` | `#2352cc` | Selected controls and selected pool curve |
| `--color-accent-hover` | `#1943ad` | Hover on filled selected tolerance |
| `--color-selected` | `#edf2ff` | Selected pool and amount backgrounds |
| `--color-chart-fill` | `#dbe6fc` | Under-curve area at 0.65 opacity |
| `--color-focus` | `#2352cc` | Two-pixel keyboard focus perimeter |
| `--color-caution-bg` | `#fcf0e8` | High-impact insight background |
| `--color-caution-text` | `#a14525` | High-impact copy and small headline accent |
| `--color-error` | `#ae302b` | Inline input errors |

Selected radios combine fill, border, and a checked indicator; high impact has explanatory text. There is one light theme. Forced-colors media rules preserve selected borders and chart content using system colors. Measured pairs and evidence are recorded in `artifacts/validation.md`.

## Typography

No fonts are fetched or bundled. The page uses available system fonts:

- `--font-body`: Segoe UI, -apple-system, BlinkMacSystemFont, Arial, sans-serif.
- `--font-display`: Georgia, Times New Roman, serif, for the headline and italic footer motto.
- `--font-mono`: SFMono-Regular, Consolas, Liberation Mono, monospace, for small technical labels and chart axes.

Requested weights are 400, 500, 600, and 650; the platform maps these to installed faces. Synthetic styling is disabled. Actual face selection varies by operating system; there are no custom font files to verify.

| Role | Implemented size at 16px root | Treatment |
| --- | --- | --- |
| Main heading | `clamp(2.5rem, 5vw, 3.75rem)` | Serif 400, line-height 1.07, -2px tracking; -1.4px below 25rem |
| Section heading | `1.0625rem` | Sans 600; result heading 1rem below 25rem |
| Body | `1rem` | Line-height 1.5; intro 1.0625rem/1.65 on desktop |
| Labels | `0.875rem` | 500 or 600 |
| Small UI | `0.8125rem` | Insights and compact controls |
| Captions | `0.75rem` | Hints, reserve amounts, footer |
| Secondary metadata | `0.6875rem` | Fee row, chart legend, simulation label; small badge reduces to 0.5625rem below 25rem |
| Result | `clamp(2rem, 4.4vw, 3.5rem)` | 500, -1.8px tracking; 8vw preferred size below 47rem |
| Metric | `1.4375rem` | 600; 1.25rem below 25rem |
| Amount input | `2rem` | 500, comfortably above the 16px mobile input floor |
| SVG labels | 12px axes; 11px marker | ViewBox follows actual available width to preserve legibility |

Changing values use tabular numerals. Headings balance; prose uses pretty wrapping. Explanations cap at 75ch and footer copy at 76ch. Values wrap instead of truncating. The language is explicitly English.

## Layout

Spacing tokens are 4, 8, 12, 16, 24, 32, and 48px (`--space-1` through `--space-7`). The shell is at most 1184px wide with 48px inline padding. Desktop workbench columns use 0.76fr/1.24fr and a 24px gap. The form leads in DOM and visual order; results follow.

- At 62rem and below: shell padding is 24px, columns become 0.85fr/1.15fr, and result inset is 20px.
- At 47rem and below: intro and workbench become single columns; control targets rise from 40px to 44px; footer stacks. The controls come before the result and the page scrolls naturally.
- At 25rem and below: shell padding is 16px, result inset is 16px, and metadata becomes more compact.
- Metrics use `repeat(auto-fit, minmax(min(100%, 8rem), 1fr))` so they stack when enlarged text or narrow width cannot fit two readable values.
- Header, section heading, and quote label rows wrap. Text containers have no fixed heights. The chart's height is 190 SVG units; a `ResizeObserver` recalculates its viewBox width and points when the panel width changes.

The final export was measured at 320, 360, 600, 752, 800, and 1200px without horizontal overflow for default and maximum inputs. Desktop and 360px screenshots were visually reviewed. Root text size at 200% was checked at 320, 360, and 1200px; this is distinct from native browser zoom.

## Elevation & Depth

The interface is flat: no shadows, overlays, sticky panels, or gradient surfaces. The result panel uses a one-pixel structural border on an off-white surface. Selected pool backgrounds separate state from neutral cards. Chart area tint provides context without competing with its curve. Only the skip link has an elevated stacking level (`z-index: 2`).

## Shapes

`--radius-control` is 6px and `--radius-panel` is 12px. Amount and pool fields use 8px, chart labels 4px, and the simulation badge 3px. Radio indicators are circular. One-pixel borders communicate editable/clickable structure; focus uses a separate two-pixel outline with a three-pixel offset. The chart is not clipped, preserving axis labels.

## Components

These are native HTML/CSS patterns, not framework component exports.

| Pattern / source | Behavior and states |
| --- | --- |
| `.section-heading`, `src/main.ts:23` | Number, section heading, optional trailing reset or simulation badge; row can wrap |
| `.amount-box`, `src/main.ts:27` | Labeled decimal text field; linked hint/error; preserves input while typing; `aria-invalid` and inline message; invalid input replaces stale output with an explanation |
| `.amount-presets`, `src/main.ts:30` | Four real buttons with explicit accessible names and `aria-pressed`; native Enter/Space activation |
| `.pool-option`, `src/main.ts:33` | Native radio group with full-card labels, reserves, decorative depth bars, checked circle, and focus outline; arrow keys select |
| `.slippage-options`, `src/main.ts:35` | Native radios; filled current selection; updates only minimum received |
| `.result-panel`, `src/main.ts:40` | Large estimated output, auto-fitting metric grid, descriptive chart, insight and fee; stable polite announcements after a 350ms debounce |
| `drawChart`, `src/main.ts:73` | Local SVG curve, axes, independent-quote marker, dynamic range, accessible title and description; numbers are also available in adjacent text |
| `.insight`, `src/main.ts:124` | Low (<1%), moderate (1–<5%), and high (>=5%) price-impact copy; only high uses the caution surface; thresholds are educational |
| `.method`, `src/main.ts:56` | Native details/summary; Enter/Space toggles model explanation, icon rotates without animation |
| `.reset`, `src/main.ts:139` | Restores amount 1, Growing pool, 0.5% tolerance; announces reset without moving focus |

Hover rules apply only when hover is supported. Under `prefers-reduced-motion: no-preference`, buttons transition background/border and scale for 150ms, with a pressed scale of 0.96 and easing `cubic-bezier(0.2, 0, 0, 1)`. Reduced motion removes these transitions and scaling. There is no animation on load. No loading state is needed because computation is immediate and local.

## Do's and Don'ts

- Reuse semantic role tokens, shared space steps, native labeled controls, and visible keyboard focus.
- Keep quote units and fictional-pool assumptions close to results. Describe errors with a way to recover.
- Keep fields ahead of results in reading order, preserve entered text, and keep minimum received distinct from expected output.
- Do not add external fonts, remote scripts, live prices, account flows, or wallet dependencies to this offline module.
- Do not use status color alone, hide useful values with truncation, or animate frequent numerical updates.

For a related view, start with `.shell`, one main heading, `.section-heading`, and the existing control/result patterns. Use the spacing tokens and meaningful form legends, then test the view at 360px, 1200px, keyboard navigation, and enlarged text. Keep a single static page or use hash navigation so the export needs no route rewrites.
