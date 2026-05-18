---
name: design-spec
description: >
  Brief plus optional screenshots to reviewed IDEATION.md then reviewed PRD.md in one project folder. Two AskQuestion gates: approve ideation before PRD draft, approve PRD before explore-mockup. Cursor-native markdown only (no Claude widgets). Triggers: design spec, brief to PRD, run ideation, I have a brief, turn this into a PRD. Replaces design-ideation plus code-ready-prd for the default pipeline. Downstream explore-mockup, dress-up --from-mockup, build-hifi fast lane. Works in Cursor Agent.
---

## Cursor runtime

| Claude Code | Cursor |
|-------------|--------|
| `Agent` | `Task` (`subagent_type`: `generalPurpose`, `explore`, `shell`) |
| `AskUserQuestion` | `AskQuestion` |
| `visualize:show_widget` | **Do not use** — write `IDEATION.md` instead |

---

## Role

Merge **design ideation** (phases 1–7 + cornerstone 4.5) and **code-ready PRD** (22 sections) with **two mandatory review gates**. The user pastes the full brief and may attach screenshots.

**No dev server** in this skill. Visual preview starts at `@explore-mockup`.

---

## Inputs

- **Brief** (required): pasted in chat or `--brief-file <path>`
- **Screenshots** (optional): image paths or attachments — reference in Phase 1 assumptions and constraints
- **Output folder** (optional): `--out ~/Documents/{slug}/` — default slug from product name (kebab-case, ≤32 chars)

If brief is missing, ask once. Do not run gates on empty input.

---

## Outputs

| File | When |
|------|------|
| `IDEATION.md` | After Beat A |
| `HANDOFF.md` | After Beat A (Phase 8 compact block) |
| `PRD.md` | After Beat B draft; finalized Beat C |

---

## Beat A — Ideation → IDEATION.md

Run all phases below in one pass. Write **`IDEATION.md`** as structured markdown (tables, headings). Incorporate screenshot observations in Phase 1.

### Phase 1 — Brief digestion + assumptions

- Core problem (one sentence, no solution language)
- Explicit / implicit constraints
- **Assumptions** (explicit; include what screenshots show if provided)
- Key tension
- Success from primary persona POV

### Phase 2 — Persona

- Name + role, accountability, not responsible for
- Day-in-the-life (3–4 sentences)
- AI relationship, success / failure (one sentence each)
- 1–2 secondary personas (name, role, one need only)

### Phase 3 — Pain points (6–8)

Table: Pain | Workaround | Cost | Severity (High/Medium/Low)

### Phase 4 — HMWs (8–10)

Table with pain ref; mark **top 3** in prose.

### Phase 4.5 — Cornerstone (mandatory)

Answer: where they work, views across session, named cornerstone, chrome elements.

> **Cornerstone: [name]** — one sentence on shell + content + chrome.

### Phase 5 — Agent capabilities (3–4 max)

Each: action, input, output, surface class (Inline/Overlay/Ambient/Secondary), anchor on cornerstone, failure mode.

### Phase 6 — Technical scoping

Core objects, integrations, trust boundary, 6–8 edge cases (Situation → Breaks → Handle), MVP vs later.

### Phase 7 — State machine

State list, full transition table (6 columns), happy path, 2–3 exception paths.

### Phase 8 — HANDOFF block

Also write **`HANDOFF.md`** containing:

- Product + primary persona
- Cornerstone UI
- Agent capabilities (name, class, anchor)
- Core objects + states
- Key design decisions (3–5)
- Out of scope

---

## Gate 1 — Review ideation

`AskQuestion`: Approve `IDEATION.md` / request edits to specific phases.

- If edits requested: update `IDEATION.md` + `HANDOFF.md`, re-present Gate 1.
- **Do not draft PRD until Gate 1 passes.**

---

## Beat B — Draft PRD.md

Read `HANDOFF.md`. Generate full **22-section** PRD per code-ready-prd rules:

**Critical mappings**

- Cornerstone → §9 (cornerstone-first IA, not a flat nav table) and §10 (UI surface inventory)
- Agents → §13, §14, §17
- Objects/states → §15, §16
- Decisions → §8; out of scope → §6
- §21 edge cases: ≥12 rows, 6 categories, UI surface column
- §22 assumptions from Phase 1

Single primary persona in §7; no secondary-persona screens.

Notion publish only if Notion MCP available; always write local `PRD.md`.

---

## Gate 2 — Review PRD

`AskQuestion`: Approve PRD / list sections to patch.

Patch only requested sections if needed, then re-gate.

---

## Beat C — Finalize

Ensure no TBD placeholders. Run PRD quality checklist (code-ready-prd). Print:

```
Project folder: {path}
IDEATION.md, HANDOFF.md, PRD.md
```

Then apply **Next skill** below and stop.

---

## Next skill (suggest when this skill is done)

**Previous step in pipeline:** none (entry point).

**Next step:** `@explore-mockup` in the same project folder.

**When to suggest:** Gate 2 passed, `PRD.md` finalized with no TBDs, and the user confirms the spec is ready (or asks what comes next).

**Say:**

> Spec is locked. Next: **`@explore-mockup`** with project folder `{absolute-path}` (uses `PRD.md` and `IDEATION.md`). That skill will show IA directions on port **3008**, then feature sketches on **3009**, with two review gates before hi-fi.

**Do not** auto-run explore-mockup or dress-up. Wait for the user to invoke the next skill.

---

## Hard rules

- **Primary persona POV** for all design decisions.
- **Phase 4.5 before agent capabilities** — every capability names cornerstone anchor.
- **Gates are mandatory** — not optional even if user says "skip review" unless they explicitly approve both artifacts in one message.
- **No `visualize:*` API calls.**
- State assumptions explicitly; do not block on long question lists.

---

## Legacy

- `@design-ideation` + `@code-ready-prd` → use **`@design-spec`** instead.
- `founding-design-ideation` is legacy only.

---

## Out of scope

- Lo-fi or hi-fi prototypes
- Magic Patterns
- Notion-only delivery without local `PRD.md`
