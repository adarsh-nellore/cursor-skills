---
name: explore-mockup
description: >
  Explore design directions from a code-ready PRD: 2-3 IA direction comparisons (dev server port 3008), user picks one, then 4-8 feature sketches as HTML lo-fi buffet (port 3009). Writes mockup-handoff.json for dress-up --from-mockup. Mandatory background preview servers; never kill port 3053. Triggers: explore mockup, design directions, lo-fi exploration, feature sketches after PRD. Composes upstream from design-spec (./PRD.md). Downstream dress-up --from-mockup. Legacy alias: build-lofi. Works in Cursor Agent.
---

## Cursor runtime

| Claude Code | Cursor |
|-------------|--------|
| `Agent` | `Task` (`subagent_type`: `generalPurpose`, `explore`, `shell`) |
| `AskUserQuestion` | `AskQuestion` |
| Playwright | MCP `playwright` — not used in this skill |

---

## What this skill produces

1. **IA directions** — `directions.json`, `DIRECTIONS.md`, preview at **http://localhost:3008/directions.html**
2. **Screen inventory** — `screen-inventory.json` (PRD §9 + §10, including intermediate states)
3. **Feature buffet** — `concepts.json` with **multi-state** structured lo-fi (modal frame + CTA slot when applicable), preview at **http://localhost:3009/sketch.html**
4. **Handoff** — `mockup-handoff.json` after user approval (Gate 4), including inventory path and dress-up flags

Front-end only (HTML + JSON). No React. No Magic Patterns required.

---

## Hard rules

- **Single primary persona** (PRD §7).
- **Read `./PRD.md`** (and `IDEATION.md` if present) in the project folder.
- **Two review gates** — direction pick (Gate 3), mockup approval (Gate 4). Do not write `mockup-handoff.json` until Gate 4.
- **Never kill port 3053** when starting 3008/3009.
- **Only kill the target port** if re-running that same preview (use `bin/start-preview-server.sh`).
- **No em dashes.** No "you" in blurbs.

---

## Inputs

1. Path to project folder (contains `PRD.md`), or
2. `./PRD.md` in cwd.

Default folder: same as design-spec output `~/Documents/{slug}/`.

Requires `mockup-handoff.json` absent OR user explicitly re-running explore (overwrite with confirmation).

---

## Preview servers (mandatory)

After each visual beat, run:

```bash
chmod +x ~/.cursor/skills/bin/start-preview-server.sh
~/.cursor/skills/bin/start-preview-server.sh 3008 {project-dir}   # after directions.json
~/.cursor/skills/bin/start-preview-server.sh 3009 {project-dir}   # after concepts.json
```

Open for the user (MCP `open_resource` or print URLs):

- **http://localhost:3008/directions.html**
- **http://localhost:3009/sketch.html**

---

## Execution sequence

### Beat 1 — IA directions (main thread)

Read PRD §7–10 and cornerstone from `IDEATION.md` if present.

Produce **2–3** distinct IA directions. Each includes:

- `id` (kebab-case, e.g. `dir-editor-first`)
- `title` (3–6 words)
- `summary` (2 sentences: nav + cornerstone philosophy)
- `cornerstone`, `nav_model`, `tradeoffs`, `risks`

Write:

- `{project-dir}/directions.json`:

```json
{
  "product": "...",
  "primary_persona": "Name, Role",
  "subtitle": "optional",
  "directions": [ /* 2-3 objects */ ]
}
```

- `{project-dir}/DIRECTIONS.md` — comparison prose (why A vs B vs C, persona fit, recommendation)

Start preview on **3008**. **Gate 3** — `AskQuestion`: pick direction (allow "combine X + Y" as free-text follow-up).

Record `chosen_direction_id` in main-thread memory.

### Beat 1.5 — Screen inventory (main thread, mandatory)

After Gate 3, before Beat 3 concepts. Read PRD **§9** (state transitions / routing) and **§10** (UI surface inventory). Write `{project-dir}/screen-inventory.json`:

```json
{
  "product": "...",
  "cornerstone_route": "/from-prd-section-19",
  "views": [
    {
      "id": "analyze-run",
      "path": "/demo/word?view=analyze-run",
      "type": "loading",
      "label": "Analyze in progress",
      "prd_sections": ["§9", "§17"]
    }
  ],
  "routes": [
    {
      "path": "/onboarding/assist/loading",
      "type": "temporal",
      "label": "Assist loading",
      "prd_sections": ["§9", "§12"]
    }
  ]
}
```

**Row `type` values (use exactly one per row):** `happy` | `loading` | `confirm` | `empty` | `error` | `permission` | `success-bridge` | `temporal`.

**Hard rules:**

- Every PRD §9 transition that changes what the persona sees must have a `views[]` or `routes[]` row. Happy path alone is insufficient.
- `views[]` = cornerstone overlays (`?view=`, `?modal=`) or in-app panes on the cornerstone route.
- `routes[]` = full App Router paths (invite, login, browser setup, assist, sync, etc.).
- For Peer-style onboarding / Word-bridge PRDs, cross-check against a canonical spine: invite → SSO → accept → Word entry → hook → sources modal → **analyze-run** → results preview → repo → sources → readiness → tailor → assist loading → assist verify → sync → complete → reveal → steady. Add any PRD-required row missing from that spine.
- Do not proceed to Beat 3 until `screen-inventory.json` exists and lists at least one `loading`, one `confirm`, and every §10 surface the PRD names for the primary persona's critical path.

### Beat 2 — Asset copy

```bash
mkdir -p {project-dir}
cp ~/.cursor/skills/explore-mockup/{sketch.html,lofi.js,lofi.css,REGIONS.md,directions.html,directions.js} {project-dir}/
```

### Beat 3 — Feature concepts (parallel agents)

For the **chosen direction only**, decide N concepts (default 6, range 4–8). Map concepts to **screen-inventory rows** where possible; at least **half** of concepts must cover an intermediate type (`loading`, `confirm`, `error`, `permission`, or `success-bridge`), not only happy-path chrome.

Each concept object includes:

- `id`, `title`, `blurb` (≤30 words, two sentences, third person)
- `states`: array of 2–3 state ids, e.g. `["default", "loading", "confirm"]` (required)
- `modal_frame`: `true` when the concept is a centered overlay / Word modal / pre-flight dialog (default `false`)
- `primary_cta_label`: string for the forward CTA pill when `modal_frame` is true (e.g. `"Continue in Word"`)
- `inventory_refs`: optional array of `screen-inventory.json` view/route ids this concept illustrates
- `lofi`: region tree using `REGIONS.md` (include **`state-panel`** per state when `states.length` > 1)

**Structured lo-fi (required when `modal_frame` or `states.length` > 1):**

- Wrap the sketch in **`modal-frame`** (fixed width, same footprint across states).
- Show **`cta-primary`** in the footer slot on every state that has a forward action.
- Stack **`state-panel`** regions (one per state, labeled DEFAULT / LOADING / CONFIRM) inside one concept card on 3009.

Spawn N `Task` agents in **one batch**. Each writes `{project-dir}/_concept{N}.json` using `REGIONS.md` vocabulary. Agents must read `{project-dir}/screen-inventory.json` and cite matching rows in `inventory_refs`.

**Agent prompt snippet (append to each Beat 3 task):**

```
Read {project-dir}/screen-inventory.json. Your concept must cover at least one inventory row via inventory_refs.
If modal_frame: use modal-frame + cta-primary regions; render all states[] as labeled state-panel children.
No upward-floating dot animations in loading state-panels; use a progress bar skel + static label line only.
```

### Beat 4 — Merge + buffet preview

Merge into `concepts.json`, delete `_concept*.json`, start preview on **3009**.

**Gate 4** — `AskQuestion`: approve mockup set / request re-run of specific concepts.

On approval, write `mockup-handoff.json`:

```json
{
  "approved_direction_id": "dir-b",
  "approved_concept_ids": ["concept-id-1", "..."],
  "cornerstone_route": "/from-prd-section-19",
  "prd_path": "./PRD.md",
  "project_dir": "{absolute project-dir}",
  "screen_inventory_path": "{absolute project-dir}/screen-inventory.json",
  "required_views": ["analyze-run", "reveal"],
  "required_routes": ["/invite", "/onboarding/assist/loading", "/onboarding/sync"],
  "overlay_pattern": "fixed-modal-shell",
  "cta_nav_highlight": true,
  "demo_flow_spine": true,
  "explore_ports": { "directions": 3008, "buffet": 3009 }
}
```

- `required_views` / `required_routes`: copied from `screen-inventory.json` critical-path rows (all non-optional intermediates). Dress-up Stage 1a uses these for the completeness gate.
- `overlay_pattern`, `cta_nav_highlight`, `demo_flow_spine`: always set as shown for modal-heavy / onboarding products; dress-up reads `references/onboarding-patterns/` (navigation, motion, CTAs).

### Stop condition

Print:

1. **http://localhost:3008/directions.html** (if still running)
2. **http://localhost:3009/sketch.html**
3. Path to `screen-inventory.json` and `mockup-handoff.json`
4. One-line concept list (note which concepts are multi-state / modal_frame)

Then apply **Next skill** below and stop.

---

## Next skill (suggest when this skill is done)

**Previous step in pipeline:** `@design-spec` (same `{project-dir}` must contain `PRD.md`).

**Next step:** `@dress-up --from-mockup`

**When to suggest:** Gate 4 passed, `mockup-handoff.json` written, user has reviewed **3009** and approves the mockup set (or explicitly asks to move to hi-fi).

**Say:**

> Mockup approved. Next: **`@dress-up --from-mockup {project-dir} --prd {project-dir}/PRD.md`** (optional `--out` for a fresh DS clone folder). That starts the raw Tailwind seed on **http://localhost:3053**, then stops for `--analyze` and `--finish`. Keep **3008/3009** open to compare lo-fi vs clickable seed.

**Mid-skill (after Gate 3 only):** Do not suggest dress-up yet. Say:

> Direction chosen. Continuing explore-mockup: feature buffet next, then Gate 4, then dress-up.

**Do not** auto-run dress-up.

---

## Bundled files

- `SKILL.md`, `REGIONS.md`, `sketch.html`, `lofi.js`, `lofi.css`
- `directions.html`, `directions.js`
- Downstream patterns live in `~/.cursor/skills/dress-up/references/onboarding-patterns/` (handoff flags point there)

---

## Out of scope

- React / Next.js generation (use `dress-up --from-mockup`)
- Magic Patterns
- Pick-one "recommended direction" without user Gate 3
