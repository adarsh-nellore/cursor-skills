# cursor-skills

Cursor Agent Skills for the founding-designer pipeline. Install into `~/.cursor/skills`.

```bash
git clone https://github.com/adarsh-nellore/cursor-skills.git ~/.cursor/skills
```

Pin the pre-change snapshot: `git checkout v0-baseline`

See [PIPELINE.md](PIPELINE.md) for the full flow and preview ports.

## Pipeline skills (default order)

| Skill | Role |
|-------|------|
| **design-spec** | Brief + screenshots → `IDEATION.md` → `PRD.md` (2 review gates) |
| **explore-mockup** | PRD → IA directions (3008) → feature buffet (3009) → `mockup-handoff.json` |
| **dress-up** | Local seed or MP → audit → scaffold → peer-DS hi-fi (3053) |

## Supporting skills

- **agent-states** — reference for agent UX patterns
- **agentic-design** — where to place AI in the product
- **build-hifi** — fast lane (PRD → DS hi-fi, no gates)
- **tooltip-walkthrough** — demo annotations
- **ux-review** — Playwright audit + fixes
- **humanizer**, **portfolio-voice**, **the-humanizer** — writing

## Legacy (still present)

- **founding-design-ideation**, **design-ideation**, **code-ready-prd**, **build-lofi** — use the pipeline skills above instead

## Requirements

- `~/Projects/adarsh-design-system` for dress-up / build-hifi
- Playwright MCP for dress-up Stage 2 walkthrough and ux-review — see [PLAYWRIGHT-SETUP.md](PLAYWRIGHT-SETUP.md)

## Repo layout

```
design-spec/
explore-mockup/     # bundled HTML/CSS/JS renderers
dress-up/bin/         # mp-to-next codemod, DS inventory, audit helpers
build-hifi/
agent-states/
...
```
