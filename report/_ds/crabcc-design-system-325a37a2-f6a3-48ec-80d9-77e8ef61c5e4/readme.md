# crabcc Design System

> **crabcc** — *Symbol index for AI coding agents.* A small Rust CLI + MCP
> server that indexes your repo's symbols (functions, classes, methods) into a
> SQLite store and exposes four primitives an agent actually wants — `sym`,
> `refs`, `callers`, `outline` — plus token-shaping flags (`--count`,
> `--files-only`, `--limit`) that collapse 16k-token result sets to ~3 tokens
> when the question only needs a number or a deduped file list.

This project is the **design system** for that product: tokens, fonts, brand
assets, reusable React components, and full-screen UI-kit recreations of the two
real surfaces crabcc ships (the **CLI/terminal** and the **`crabcc viz`
localhost dashboard**).

---

## Product context

crabcc is a developer tool, not a consumer app. Its entire personality is the
terminal: a prompt, a command, and a tight slab of typed JSON in return. It is
fast (up to 4412× faster than `grep -rn` on a 13k-file monorepo), frugal (85%
fewer bytes sent to the LLM), and precise (it understands "symbol" — `class User`
and the string `"User"` are not the same thing). The brand should always feel
**fast, exact, frugal, and a little playful** — the playfulness comes entirely
from the mascot: a cheerful terracotta crab.

**Surfaces represented in this system:**
- **CLI** — `crabcc sym Foo`, `crabcc callers handleAuth --count`. The canonical
  experience. Monospace, ANSI-colored, JSON output.
- **`crabcc viz`** — a localhost call-graph + live-activity dashboard
  (`crabcc serve`). WebGL force-graph, a live activity panel, light/dark themes.
- **MCP server** — same code paths over JSON-RPC 2.0. Not a visual surface, but
  shapes the "typed output" motif.
- **Marketing / docs** — the GitHub README, install one-liners, bench tables.

### Sources used to build this system

Everything here was reverse-engineered from the real repository. If you have
access, read further:

- **GitHub:** [`crabcc-labs/crabcc`](https://github.com/crabcc-labs/crabcc)
  *(private — invite only)*. Key files studied:
  - `README.md` — voice, bench tables, install copy, the four primitives.
  - `AGENTS.md` — command surface, conventions, terse instructional tone.
  - `assets/logo.svg`, `logo-banner.svg`, `logo-mono.svg`, `logo-small.svg` —
    the mascot + wordmark (imported into `assets/`).
  - `crates/crabcc-viz/assets/index.html` — the live dashboard's CSS variable
    theme (the literal source of our color tokens, light + dark).
  - `crates/crabcc-viz/src/banner.rs` — the ANSI startup banner (brand =
    256-color 208 orange; dim/label/warn styles).
  - `crates/crabcc-viz/web/DESIGN.md` — the React dashboard rewrite rationale.

> **Reader:** if you're extending this system, the crabcc repo is the source of
> truth. Browse it to pull real component code, additional screens (the `/live`
> dashboard, the memory browser), and exact copy before inventing anything new.

---

## Content fundamentals

How crabcc writes. Match this voice in any copy you produce.

- **Voice: terse, technical, confident, lightly wry.** Sentences are short and
  load-bearing. No marketing fluff, no exclamation points (except the mascot's
  occasional 🦀). Example: *"`grep -rn` and `find . -name` are the wrong
  defaults for an LLM."*
- **Person.** Docs address the reader as **you** ("index your repo", "pick the
  smallest shape the question allows"). The tool refers to itself as **crabcc**,
  lowercase, always — never "Crabcc" or "CrabCC", even at the start of a
  sentence where possible.
- **Casing.** **Lowercase is the default** — the wordmark, commands, flags, and
  most headings. Code, flags, paths, and symbol names are always in `monospace`.
  UPPERCASE is reserved for tiny eyebrow labels in UI chrome (`LIVE ACTIVITY`,
  `GET`, `POST`) with wide letter-spacing.
- **Numbers do the talking.** Claims are quantified and exact, not rounded for
  flattery: "4412× faster", "−99.6%", "253 bytes vs 62,541", "~250ms no-op".
  Always show the before/after when boasting about savings.
- **Honest losses.** The brand explicitly documents where it loses ("Honest
  losses: single-file outline of a small file…"). This candor is part of the
  voice — never overstate.
- **Instructional tone (AGENTS.md / docs).** Imperative and table-dense: "Do
  this", "Reach for `rg`", "Never `ALTER TABLE … DROP COLUMN`". Tables map a
  *want* → a *command*.
- **Emoji.** Sparingly and on-brand: 🦀 (the crab) and the occasional status
  glyph (🔒, 🟢, ✅, 🚧, ⚠). Never decorative emoji in body copy.
- **Symbols as content.** The product's "words" are command lines and JSON.
  `$ crabcc sym Assessment` → `{"count":3}`. Lean on this: a terminal block or a
  JSON snippet is often the clearest possible illustration.

**Micro-copy examples (lift these):**
- Empty state: *"No graph yet — type a symbol name above and press `load`."*
- Status line: *"enter a symbol and press `load`"*, *"14 nodes · 23 edges"*
- Hint: *"Pick the smallest shape the question allows."*
- Warning: *"non-loopback — viewer is unauthenticated"*

---

## Visual foundations

- **Color.** A warm **terracotta "crab"** brand (`--crab-500 #d35400` light /
  `--crab-hot #ff8c42` dark) over a near-neutral, very slightly warm graphite
  canvas. The palette is lifted verbatim from the dashboard's CSS variables.
  Color is used **surgically** — accent on the wordmark, the active node, the
  live dot, links, and one primary button per view. Everything else is
  neutral. Semantic hues: green `#27ae60` for live/ok, amber for warn, red for
  error, a muted slate-blue for info and graph nodes.
- **Type.** **Monospace-first**, because the product is a CLI.
  **JetBrains Mono** carries the wordmark (800 weight, −2px tracking), all UI
  chrome, code, and data. **IBM Plex Sans** handles only long-form reading
  (docs prose, marketing paragraphs). The canonical UI body size is a compact
  **13px**; reading body is 15px.
- **Spacing.** A strict **4px grid**. The product UI is dense — log rows, JSON,
  tables — so the small steps (4/8/12px) dominate. Generous whitespace is
  reserved for marketing.
- **Backgrounds.** Flat, near-solid surfaces by default. Two sanctioned
  exceptions: the **banner block** (`--crab-50 → --crab-100`, a soft cream-to-shell
  wash) and the **"calm" aurora** — a slow, low-contrast warm shader
  (`ShaderBackground` / Ghostty `calm.glsl`) used as a living backdrop behind
  terminals, hero units, login and empty states. It stays dark on dark themes
  and light on light themes so foreground text is always readable. Still **no**
  purple/blue hero gradients, no mesh, no noise textures, no full-bleed
  photography. The "hero" of any crabcc surface is a **terminal block** (dark
  `#0e0e10`, rounded 6px) or the call-graph canvas.
- **Animation.** Quick and functional. Default control transitions are
  ~140ms on an ease-out curve. The two signature motions, both from the
  dashboard: the **live-dot pulse** (an expanding ring, 1.6s ease-out, infinite
  while connected) and the **fresh-row fade** (a new activity row flashes the
  accent wash then fades to transparent over 1.6s). The graph nodes use a small
  spring/overshoot. No bouncy decorative motion, no parallax.
- **Hover states.** Controls darken toward `--accent-hover`; rows get a
  `--surface-hover` wash plus a 2px accent left-border. Links underline on hover
  (2px offset). Ghost/secondary buttons gain an accent border + accent text.
- **Press states.** Color deepens to `--accent-press`; no scale-down on buttons
  (the tool feels mechanical, not springy). Graph nodes are the exception —
  they have physics.
- **Borders.** **Hairline 1px** is the default, in a warm-neutral
  (`--border-subtle #e3e3e3`). Active/selected elements use a 2px accent edge.
  Borders carry more of the visual weight than shadows do.
- **Shadows.** Restrained and warm-tinted (`rgba(20,14,10,…)`). `--shadow-sm`
  for cards, `--shadow-md` for tooltips, up to `--shadow-xl` for dialogs. Dark
  theme drops shadows almost entirely and leans on borders. **No glow.**
- **Corner radius.** Small. **4px** is canonical for buttons/inputs, **6px** for
  cards/panels, 3px for chips/badges, 10px for the banner block. Pills are used
  only for status badges. Small radii read as "precise instrument".
- **Transparency & blur.** Used very little. `color-mix(… transparent)` for
  focus rings, selection, and tinted hovers. No frosted-glass/backdrop-blur
  chrome.
- **Imagery vibe.** The only imagery is the **mascot** (warm terracotta, cream
  highlights, friendly) and the **demo GIFs** (terminal recordings — dark,
  monospace, ANSI-colored). The aesthetic is warm-but-precise: a friendly crab
  guarding a very fast, very exact machine.
- **Layout rules.** Fixed top header (~48px), optional fixed right sidebar
  (280px — the activity panel) on dashboard surfaces. Content is left-aligned
  and dense. Marketing surfaces center within a max width and breathe more.

---

## Iconography

- **There is no bespoke icon set in the product.** crabcc's "icons" are almost
  entirely **typographic and glyph-based** — this is a terminal tool and it
  leans into that.
  - **Unicode glyphs** carry most of the load: `$` (prompt), `→`, `←`, `↻`
    (re-index), `·` (separator), `─` (banner rule), box-drawing characters
    (`┌ ┐ │ └ ▼`) for the ASCII architecture diagrams, and `…` for truncation.
  - **Status emoji** appear in the README and iTerm2 HUD: 🦀 (brand), 🟢
    (live), 🔒 (private), ✅ / 🚧 / ⚠ (roadmap + warnings). Use these, sparingly,
    only for status — never as decorative bullets.
  - The **live dot** is a pure CSS circle with a pulsing ring, not an icon.
- **The mascot SVGs are the only real vector assets.** They live in `assets/`.
  `logo-holo.svg` — the **AI-sentinel hologram crab** (cyan→orange wireframe
  shell, scanlines, glowing sentinel eyes, projection plinth) — is now the
  **default brand mark**, used for the primary lockup and any dark / AI-forward
  surface. The flat **`logo.svg`** (terracotta crab) is the **light-background
  alternate**; `logo-banner.svg`, `logo-mono.svg`, and `logo-small.svg` round
  out the set. The PWA PNG icons (favicons / touch icons) are generated from
  them in the repo. All are **hand-tuned — do not run them through an optimizer.**
- **The hologram is the one place the brand's "no glow" rule is intentionally
  broken.** It is the headline mark; reach for the flat terracotta crab only on
  light backgrounds where the hologram's glow can't read.
- **If you need UI icons** (a few appear in the dashboard chrome — reload,
  search, chevrons), use **[Lucide](https://lucide.dev)** from CDN: it matches
  the product's thin (1.5–2px) stroke and rounded line-caps. This is a
  **documented substitution** — crabcc ships no icon font of its own — flagged
  so you can swap in real assets if the team adds them. Keep icon usage minimal;
  prefer a glyph or a text label.
- **Never** hand-draw decorative SVG iconography or use emoji as UI affordances.

---

## Files & index

**Root**
- `styles.css` — the entry point consumers link. `@import` manifest only.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill manifest (for use in Claude Code etc.).

**`tokens/`** — design tokens, each `@import`ed by `styles.css`
- `fonts.css` — `@font-face` for JetBrains Mono + IBM Plex Sans (self-hosted woff2).
- `colors.css` — base palette + semantic aliases, light (`:root`) + dark (`[data-theme="dark"]`). Dark is **explicit/opt-in** via the data attribute; OS `prefers-color-scheme: dark` only hints `color-scheme` (the token set is single-sourced from the `[data-theme="dark"]` scope, not duplicated into a media query).
- `typography.css` — families, weights, type scale, tracking.
- `spacing.css` — 4px grid, containers, control sizing.
- `elevation.css` — radius, borders, shadows, motion.
- `base.css` — minimal resets + element defaults + utility helpers.

**`assets/`** — `logo-holo.svg` (**default mark** — AI-sentinel hologram crab), `logo.svg` (flat terracotta, light-bg alternate), `logo-banner.svg`, `logo-mono.svg`, `logo-small.svg`, `fonts/*.woff2`.

**`guidelines/`** — 17 foundation specimen cards (the Design System tab):
- **Colors** — `color-brand`, `color-neutral`, `color-semantic`, `color-surfaces`, `color-interactive`.
- **Type** — `type-display`, `type-mono-scale`, `type-sans-body`, `type-weights`.
- **Spacing** — `spacing-scale`, `radius`, `elevation`.
- **Brand** — `brand-logos`, `brand-mascot`, `brand-terminal`, `brand-graph`, `brand-ida-session`.

**`components/`** — reusable React primitives, grouped (see each `.prompt.md`):
- `badges/` — `Badge`, `LiveDot`.
- `brand/` — `ShaderBackground` (live calm-aurora backdrop; the Ghostty shader, for design files).
- `buttons/` — `Button`, `IconButton`.
- `forms/` — `Input`, `Select`, `Switch`.
- `surfaces/` — `Card`, `Tabs`.
- `feedback/` — `Tooltip`.

Each group has a `*.card.html` thumbnail; `Badge`, `Button`, `Input`, `Card`,
and `ShaderBackground` are exposed as **starting points** for consuming projects.

**`ghostty/`** — a brand-matched [Ghostty](https://ghostty.org) terminal profile:
`config` (auto light/dark + JetBrains Mono + the calm shader), `themes/crabcc-dark`
& `themes/crabcc-light` (the surface + text tokens as a 16-color palette),
`shaders/calm.glsl` (the live, glyph-masked aurora), and `README.md` (install).
The same aurora is available to design files as the `ShaderBackground` component.

> **Not yet built.** `ui_kits/` (the CLI + `crabcc viz` dashboard recreations)
> and `slides/` (branded deck templates) are planned surfaces — the product
> context, voice, and tokens above are the brief for them, but the directories
> don't exist in this system yet. Build them from the repo as the next step.

---

## Caveats / substitutions

- **Fonts** are self-hosted from the open-source originals (JetBrains Mono, IBM
  Plex Sans) — crabcc ships no proprietary typeface, so these are the brand
  faces, not substitutions.
- **UI icons** fall back to **Lucide** (CDN) — crabcc has no icon font. Flagged
  above; swap if the team standardizes a set.
