# Design pipeline skills (Cursor)

Personal Agent Skills ported from [adarsh-nellore/claude-skills](https://github.com/adarsh-nellore/claude-skills).

## Skills

- **agent-states** — `~/.cursor/skills/agent-states/SKILL.md`
- **agentic-design** — `~/.cursor/skills/agentic-design/SKILL.md`
- **build-hifi** — `~/.cursor/skills/build-hifi/SKILL.md`
- **build-lofi** — `~/.cursor/skills/build-lofi/SKILL.md`
- **code-ready-prd** — `~/.cursor/skills/code-ready-prd/SKILL.md`
- **design-ideation** — `~/.cursor/skills/design-ideation/SKILL.md`
- **dress-up** — `~/.cursor/skills/dress-up/SKILL.md`
- **founding-design-ideation** — `~/.cursor/skills/founding-design-ideation/SKILL.md` *(legacy; use **design-ideation** for new work)*
- **humanizer** — `~/.cursor/skills/humanizer/SKILL.md`
- **portfolio-voice** — `~/.cursor/skills/portfolio-voice/SKILL.md`
- **the-humanizer** — `~/.cursor/skills/the-humanizer/SKILL.md`
- **tooltip-walkthrough** — `~/.cursor/skills/tooltip-walkthrough/SKILL.md`
- **ux-review** — `~/.cursor/skills/ux-review/SKILL.md`

## Pipeline order

```
design-ideation → code-ready-prd → build-lofi → build-hifi
                                    ↘ dress-up (Magic Patterns import)
agentic-design → tooltip-walkthrough → ux-review
```

**Ideation entry:** `design-ideation` is the current ideation skill. `founding-design-ideation` remains for older workflows only.

## Re-sync from Claude skills

```bash
node ~/.cursor/skills/_port-from-claude.mjs
```

Source of truth remains `~/.claude/skills` (git: claude-skills repo). Install one-off skill packs from `.skill` zips, then run the port transforms in `_port-from-claude.mjs` (or the inline install script used for `design-ideation` and `code-ready-prd`).
