# Design pipeline (Cursor)

Source of truth: [github.com/adarsh-nellore/cursor-skills](https://github.com/adarsh-nellore/cursor-skills)

## Default flow

Each skill ends by **suggesting the next skill** (never auto-running it). See the "Next skill" section in each `SKILL.md`.

```
@design-spec          → suggest @explore-mockup
@explore-mockup       → suggest @dress-up --from-mockup (after Gate 4)
@dress-up             → --analyze → --finish → suggest @ux-review (optional)
```

## Preview ports (run side by side)

| Port | Skill | URL |
|------|--------|-----|
| 3008 | explore-mockup | `http://localhost:3008/directions.html` |
| 3009 | explore-mockup | `http://localhost:3009/sketch.html` |
| 3053 | dress-up | `http://localhost:3053` |

Do not kill 3008/3009 when starting dress-up. Lo-fi ports are for human comparison; Playwright walkthrough uses 3053 only.

## Optional paths

| Path | When |
|------|------|
| `@dress-up <mp-github-url> --prd ./PRD.md` | Magic Patterns seed already exists |
| `@build-hifi` | Fast lane: PRD → DS-native Next.js in one pass (no explore/dress-up gates) |

## Legacy skills

| Legacy | Use instead |
|--------|-------------|
| `founding-design-ideation` | `design-spec` |
| `design-ideation` + `code-ready-prd` | `design-spec` |
| `build-lofi` | `explore-mockup` |

## Project folder convention

One exercise folder: `~/Documents/{slug}/`

- `IDEATION.md`, `HANDOFF.md`, `PRD.md` from design-spec
- `directions.json`, `DIRECTIONS.md`, `concepts.json`, `mockup-handoff.json` from explore-mockup
- dress-up writes to `{slug}-dressup-YYYY-MM-DD/` (DS clone) unless `--out` overrides

## Version history

- `v0-baseline` — pre-streamline snapshot of ~/.cursor/skills
- `main` (post-baseline) — streamlined pipeline skills
