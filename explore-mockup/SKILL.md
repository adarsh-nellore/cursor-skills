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
2. **Feature buffet** — `concepts.json`, preview at **http://localhost:3009/sketch.html**
3. **Handoff** — `mockup-handoff.json` after user approval (Gate 4)

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

### Beat 2 — Asset copy

```bash
mkdir -p {project-dir}
cp ~/.cursor/skills/explore-mockup/{sketch.html,lofi.js,lofi.css,REGIONS.md,directions.html,directions.js} {project-dir}/
```

### Beat 3 — Feature concepts (parallel agents)

For the **chosen direction only**, decide N concepts (default 6, range 4–8). Each concept:

- `id`, `title`, `blurb` (≤30 words, two sentences, third person)
- Layout hint (`queue-table` / `box.xl` / `side-by-side`)

Spawn N `Task` agents in **one batch**. Each writes `{project-dir}/_concept{N}.json` using `REGIONS.md` vocabulary (same template as build-lofi v4).

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
  "explore_ports": { "directions": 3008, "buffet": 3009 }
}
```

### Stop condition

Print:

1. **http://localhost:3008/directions.html** (if still running)
2. **http://localhost:3009/sketch.html**
3. Path to `mockup-handoff.json`
4. One-line concept list
5. Next: `@dress-up --from-mockup {project-dir} --prd {project-dir}/PRD.md`

Then stop.

---

## Bundled files

- `SKILL.md`, `REGIONS.md`, `sketch.html`, `lofi.js`, `lofi.css`
- `directions.html`, `directions.js`

---

## Out of scope

- React / Next.js generation (use `dress-up --from-mockup`)
- Magic Patterns
- Pick-one "recommended direction" without user Gate 3
