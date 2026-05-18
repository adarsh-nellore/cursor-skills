---
name: prototype-refine
description: >
  Visually elevate a near-finished Next.js (or Vite/React) prototype that already passes its design-system audit. Two layers in parallel: page-level chrome (KPI density, status-toned encoding, hover/focus states, motion stagger, hairline dividers, richer empty states) and domain content inside mock-data.ts (real sentences, named entities, full passages, activity log). Stays inside the existing composition contract — no new primitives, no route changes, no fonts changed; the prebuild audit must keep passing. Built for the handoff after @dress-up or @build-hifi, when the app works but feels sparse. Triggers: "elevate visuals", "refine this prototype", "polish this Cursor app", "fill in content and polish", "make it sleek", "tighten this prototype", "elevate this app", "make this look more designed", "elevate visuals super sleek". Composes upstream from @dress-up and @build-hifi; downstream with @ux-review and @tooltip-walkthrough. Requires Playwright MCP for Phase 0 screenshots. Works in Cursor Agent.
---

## Cursor runtime

Ported from [claude-skills](https://github.com/adarsh-nellore/claude-skills) (`prototype-refine`).

| Claude Code | Cursor |
|-------------|--------|
| `Agent` (chrome / content / shared) | `Task` tool (`subagent_type`: `generalPurpose`) — one message, parallel calls, disjoint file paths |
| `mcp__playwright__playwright_navigate` | `CallMcpTool` — `server: "playwright"` (read MCP tool schemas first; typically `browser_navigate`, `browser_take_screenshot`) |
| `/dress-up`, `/build-hifi`, `/ux-review` | `@dress-up`, `@build-hifi`, `@ux-review` |
| `/fast` | Optional: prefer a fast model or maximize parallel `Task` batches when the user asks for speed |

Preflight: `~/.cursor/skills/bin/preflight-playwright.sh`. See `~/.cursor/skills/PLAYWRIGHT-SETUP.md`.

---

# @prototype-refine

A pragmatic polish pass on a near-finished React/Next.js prototype that already lives inside a design system. The brief is always shaped like: "the app works, it's audit-clean, but visually it feels sparse and the canvas reads like a stub — elevate without restructuring."

Two layers, in parallel:
- **Chrome** — KPI density, status-toned encoding, hover/focus interaction states, motion stagger, hairline dividers, richer empty states, footer clusters.
- **Content** — fill `src/lib/mock-data.ts` with PRD-grade prose: real sentences in each section, named entities, ranked passages, activity log, source summaries.

Target wall-clock: **8–12 min** with parallel `Task` agents and a single pre-flight Read batch.

## When to invoke

Triggers (literal phrases in user messages):
- "elevate visuals" / "elevate this app" / "elevate visuals super sleek"
- "refine this prototype" / "polish this Cursor app"
- "fill in content and polish"
- "make it sleek" / "tighten this prototype"
- "make this look more designed"

The handoff shape is: user points at a running dev server, says the app works but feels sparse, asks to elevate without changing anything fundamentally.

**Do NOT invoke** if the prototype isn't DS-translated yet (audit not passing). Run `@dress-up` or `@build-hifi` first.

## Inputs

1. **URL of the running dev server** — required. The dev server is the source of truth, not the codebase folder name.
2. **Local codebase path** — auto-detect from the dev process if not given:
   ```
   lsof -nP -iTCP:<port> -sTCP:LISTEN     # find PID listening on the port
   lsof -p <pid> | grep cwd                # find cwd of that PID
   ```
3. **Cornerstone route** — optional. The screen the demo lives on. If omitted, infer from the landing route.
4. **PRD path** — optional but recommended. Drives content fidelity for the prose pass.

The user almost never gives all four up front. Ask for the URL (the only one the agent can't derive); derive the rest.

## Composes with

- **Upstream**: `@dress-up` (translates MP → Next.js + DS) and `@build-hifi` (from-scratch DS-aware generation). This skill polishes their output.
- **Downstream**: `@ux-review` (audit-and-fix loop on a polished surface), `@tooltip-walkthrough` (annotate placements).

## Pipeline position

**Previous step (typical):** `@dress-up --finish` (port **3053**) or `@build-hifi`.

**Next step (optional):** `@ux-review` when the user wants a persona walkthrough + surgical fixes.

**Say (when done):**

> Visual polish pass complete. `REFINE-REPORT.md` + updated screenshots. Optional next: **`@ux-review`** on the same dev URL for JTBD friction fixes.

## Pipeline

### Phase 0 — Anchor (≈1 min)

ONE parallel batch:

1. Playwright MCP: navigate to the dev URL → screenshot cornerstone + 1–2 other main routes at 1440×900. Look at what's actually rendered.
2. `lsof -nP -iTCP:<port>` → derive the codebase path.
3. Read `package.json` — confirm stack, locate the audit script + manifest script + `prebuild` hook.
4. `ls src/app` — enumerate routes.

Anchor on the dev server, not the folder name. The folder you'd naively guess (e.g. `~/Documents/second_cursortrial/`) is often the upstream lo-fi artifact, not the final app.

### Phase 1 — Pre-flight (≈1 min)

ONE parallel Read batch covering:

1. The audit script (`scripts/audit-composition.mjs` or similar). Note every blocked pattern, every scanned directory.
2. The composition doc (`docs/COMPOSITION.md` or similar) if present.
3. **Every DS primitive imported in the cornerstone page** — read the file to learn the prop unions. Don't guess. The most common gotchas:
   - `Heading.size` typically tops out at `"h4"`, not `"h5"`.
   - `MetaText.tone` typically is `"default" | "faint" | "faintest" | "ink"`, **not** `"muted"`.
   - `Pill` usually has no `tone` prop — color comes from `variant` or a `leadingIcon` (pass a `Dot`).
   - `Badge.tone` typically includes `info | neutral | accent | success | warning | danger`.
   - `Stat` may natively accept `delta` + `sparkline` — don't wrap it in a second Card.
   - `Table` rarely exposes a row-hover hook — plan to replace with a grid-row Card if hover state matters.
4. The PRD (if present).
5. `src/lib/mock-data.ts` in full.

This batch costs ~30 seconds and prevents the most common failure mode: TypeScript errors on the second pass because the agent assumed a tone/size that doesn't exist.

### Phase 2 — Two-layer plan (≈1 min)

Hold both layers explicitly. Don't merge them into one undifferentiated "fill content" task — that's how the prose layer gets forgotten.

**Layer A — Chrome (visual)**

- **KPI tiles** — use existing `Stat` props (`delta` + `sparkline`); don't wrap in another Card if Stat already has `variant="card"`. Pass a `Sparkline` with `area` for hero tiles, mono delta with `direction` + `tone`.
- **Filter pills** — map filter values to color via `Pill leadingIcon={<Dot color="..." />}`. Don't try to set a `tone` prop on Pill — usually doesn't exist.
- **Status badges** — tone-encode (`in_review` → `info`, `draft` → `neutral`, `ready` → `success`).
- **Tables** — if the DS `Table` doesn't expose row hover, replace with a clickable grid-row layout inside a `Card padding="none"`: header row + `<Link className="group grid grid-cols-[…] items-center hover:bg-stripe …">`. The audit blocks `flex flex-col gap-N` and `flex items-* gap-N`, but **grid is fine**.
- **Empty states** — use `EmptyState variant="soft"` with a meaningful action (`LinkButton` to next logical destination).
- **Footer** — convert orphan text links to a `Cluster` of 3–4 `TextLink size="sm"` above a `Hairline style="fade"`.
- **Entrance motion** — `anim-fade-in-0` through `anim-fade-in-4` on the top-level `Stack` children. These classes typically already exist in `globals.css`.
- **Hover lift on cards** — `transition-all duration-200 ease-out hover:shadow-pop hover:-translate-y-px`.
- **Pulsing dot on "LIVE" pills** — `<Dot color="coral" pulse />` via `Pill leadingIcon`. Don't add new keyframes if `Dot pulse` exists.

**Layer B — Content (prose)**

- Fill `mock-data.ts` with PRD-grade prose: real sentences in each section of the cornerstone document (not 2-sentence stubs), named entities (drug names, study IDs, module locators, named reviewers), ranked passages with real source titles and locators, activity-log entries with named actors and relative timestamps, source summaries with citation counts and last-accessed.
- Match the voice of the PRD if one exists. Otherwise match the domain vocabulary visible in the existing mock data.
- **Additive only.** Never edit existing field values that other code depends on; sidecar new exports keyed by id (e.g. `sourceMeta[id]`).

### Phase 3 — Parallel execution (≈6–10 min)

Single message, multiple `Task` invocations (`subagent_type: generalPurpose`):

1. **Chrome subagent** — edits page files in `src/app/`. Prompt includes the audit rules verbatim and the primitive type unions from Phase 1.
2. **Content subagent** — edits `src/lib/mock-data.ts` only. Prompt includes the PRD path + voice guidance + entity list to flesh out.
3. **Optional shared-component subagent** — edits peer/shared components in `src/components/peer/` or `src/components/ui/` if additive prop changes are needed (e.g. add an `idleRecap` slot to a sidebar, add a dot-tone signal to a queue strip). These are NOT in `src/app/` so the audit doesn't gate them.

The three subagents touch disjoint files. Wall-clock = one subagent's worth of work.

When delegating, hand each subagent:
- Exact file paths it can edit (and forbid the others).
- The audit rules as constraints.
- The primitive type unions it needs.
- A short report-back format so results compose cleanly.

### Phase 4 — Verify (≈2 min)

1. `npm run audit` — must exit 0. Fix violations rather than disabling rules.
2. `npx tsc --noEmit` — must exit clean. Common late-stage failures:
   - `Type '"muted"' is not assignable to type 'MetaTextTone'` → use `"default"` or `"faint"`.
   - `Type '"h5"' is not assignable to type 'HeadingSize'` → use `"h4"`.
   - `Property 'tone' does not exist on type 'PillProps'` → use `variant` + `leadingIcon`.
3. Re-screenshot all routes at 1440×900 → save under `.audit-screenshots/`.
4. Lightweight walkthrough: click into the cornerstone screen, verify the core interaction still works.
5. Write a short `REFINE-REPORT.md` at repo root: 6–10 lines, file-by-file what changed.

If audit fails, fix the violation (almost always a raw `<h1>` / `text-[Npx]` / `flex items-center gap-N`) — never disable the rule.

## Hard contract — what NOT to touch

- Routes (no additions, no removals)
- Primitives in `src/components/ui/`, `typography/`, `layout/`, `patterns/`, `charts/` (no new files)
- Fonts (already loaded via `next/font`)
- Global layout chrome (no TopNav/LeftNav added at root)
- Walkthrough toasts or demo overlays
- Real agent wiring / copilot conversation logic
- Existing mock-data field VALUES that pages depend on (additive sidecars only)
- The audit script itself

## Audit rules — encode in every subagent prompt

- No raw `<h1>` / `<h2>` / `<h3>` / `<p className=…>` → `<Heading>` / `<Body>` / `<MetaText>` / `<MetaLabel>`
- No `text-[Npx]` arbitrary font sizes
- No raw `flex flex-col gap-N` → `<Stack gap="…">`
- No raw `flex items-* gap-N` (and `inline-flex items-* gap-N` triggers the same rule) → `<Cluster gap="…">`
- No hex codes in `className` or `style` (semantic tokens only — `bg-coral`, `text-ink`, `border-hairline-strong`)
- No `<Button href>` → `<LinkButton href>`
- No `w-[Npx]` ≥ 300 (use `min-w-[Npx]` or `max-w-[Npx] w-full`)
- Inline `style={{ width: '${n}%' }}` is fine; inline `style={{ color: '#…' }}` is not

**Trick**: `grid grid-cols-[...]` is not blocked. When the DS Table primitive can't host row-hover, replace with a grid-row Card layout — audit-safe and gives full control over hover states.

## Speed knobs (in order of impact)

1. **Parallel Phase 3** — chrome + content + (optional) shared-component subagents in one message. Disjoint files, no dependency.
2. **One pre-flight Read batch** — primitives, audit script, PRD, mock-data all in a single message. Never read primitives one-at-a-time.
3. **Skip plan mode** — the user already has a working app; the brief is "elevate."
4. **Skip `npm run build`** — if `npx tsc --noEmit` and `npm run audit` pass, build adds 30–60s without catching anything new. Run it only if the user asked for a production-grade verify.
5. **Anchor on dev URL, not folder name** — don't spelunk through related folders. The user pointing at `localhost:3053` is the source of truth.

## Common pitfalls (learned the hard way)

- **Filled the wrong "content."** The user said "fill in content," and a naive read goes for page-chrome density (KPI tiles, recent activity panels). The user almost always means **the document body inside `mock-data.ts`** — the actual sentences in each section. Both layers usually need filling; do them in parallel.
- **Wrong project layer.** A user message like "elevate the project at `~/Documents/foo/`" sometimes points at the lo-fi artifact, not the final dressup app. Always start by checking what's running on the dev port and `lsof` to the cwd.
- **TypeScript surprises.** Primitives' tone/size unions are stricter than they look. Always read the file before composing.
- **Pill has no `tone`.** Use `variant="accent"` for filled-coral or pass a `Dot` via `leadingIcon`.
- **MetaText has no `"muted"` tone.** Use `"default"` (which is already muted-by-design) or `"faint"`.
- **Hover row state in Table.** Most DS `Table` primitives don't expose row hover. Replace with a grid-row Card list to get proper hover lift + status-keyed left accent.

## Outputs

- Edited page files (`src/app/<route>/page.tsx`)
- Edited `src/lib/mock-data.ts` (additive sidecars + content fill)
- Optional edited peer/shared components in `src/components/<area>/`
- `.audit-screenshots/` updated with after pics
- `REFINE-REPORT.md` at repo root (6–10 lines, file-by-file change summary)

## One-shot prompt template (for the user)

```
Elevate visuals on the app at <DEV URL>.
Codebase: <ABSOLUTE PATH or "auto-detect from dev process">.
PRD: <PATH/PRD.md> (optional).
Cornerstone: <ROUTE>.

Two layers — fill both, in parallel:
  1. Page-level chrome (KPI tiles, status-tone encoding,
     hover/focus states, motion stagger, empty states, footer).
  2. Domain content inside mock-data.ts (real sentences in
     each section, ranked passages, named entities, activity log).

Stay inside the DS contract — no new primitives, no route changes,
audit must keep passing.

Skip: walkthrough toast, copilot conversation logic, agent wiring.

Verify: npm run audit, npx tsc --noEmit, re-screenshot at 1440×900,
walk one persona path end-to-end.
```
