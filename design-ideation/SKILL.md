---
name: design-ideation
description: >
  Design ideation skill: brief → persona → pain points → HMWs → cornerstone → agent futures → state machine → handoff to /code-ready-prd. Triggers: "run the design ideation skill", "run ideation on this brief", "I have a brief", "turn this into a PRD", "ideation exercise". CRITICAL — PHASE 4.5 IS MANDATORY: After Phase 4 (HMWs), before Phase 5 (agent futures), render a dedicated Phase 4.5 widget section declaring the cornerstone: the primary surface where the user already works, views they move across, and what is always in the chrome. Every Phase 5 agent capability must name the cornerstone surface it lives on. Skipping Phase 4.5 or showing Inline/Overlay/Ambient pills without a preceding Phase 4.5 widget block is a failure. Works in Cursor Agent.
---

## Cursor runtime

Ported from [claude-skills](https://github.com/adarsh-nellore/claude-skills).

| Claude Code | Cursor |
|-------------|--------|
| `Agent` / parallel screen agents | `Task` tool (`subagent_type`: `generalPurpose`, `explore`, or `shell`) |
| `AskUserQuestion` | `AskQuestion` |
| `mcp__playwright__*` | Playwright MCP via `CallMcpTool` (read tool schemas under the MCP folder first) |
| Slash commands (`/build-hifi`, etc.) | Say the trigger phrase or `@` the skill — discovery uses the `description` field |
| Playwright (dress-up Stage 2, ux-review) | MCP server `playwright` in `~/.cursor/mcp.json`. Preflight: `~/.cursor/skills/bin/preflight-playwright.sh`. See `~/.cursor/skills/PLAYWRIGHT-SETUP.md` |


# Design Ideation Skill

## ⚠ Critical execution rules

1. **NEVER call the Anthropic API.** All phase output is produced by Claude directly in the
   conversation — no `fetch()`, no artifact-based generation, no async API calls.

2. **NEVER build interactive async widgets** that call external endpoints to generate content.
   Use `visualize:show_widget` with **hardcoded, pre-written HTML** only.

3. **Render phases 1–7 as a single widget, then immediately generate the PRD file.** Do not
   split into multiple widget calls. One render, one file, done.

4. **Make assumptions, don't ask questions.** If information is missing from the brief, make
   a reasonable, clearly-stated assumption and proceed. State assumptions explicitly in Phase 1.
   Never block progress with a list of clarifying questions.

5. **Primary persona POV always wins.** All design decisions, HMWs, agent capabilities, and
   the final PRD are evaluated from the primary persona's perspective. Secondary stakeholders
   are noted but never drive design direction.

6. **Speed is a quality.** The goal is Brief → PRD as fast as possible without losing
   analytical depth. Consolidate, don't truncate.

---

## Philosophy

This skill compresses the ideation loop from Brief → code-ready PRD into a single fast
pass. Phases 1–7 render together as one scrollable widget with section headers, color-coded
severity, and tables. Phase 8 writes the PRD file immediately after. No pausing, no sequencing,
no waiting for the designer to approve each phase before the next begins.

**8 phases — rendered in 2 outputs:**

| # | Phase | Mode |
|---|-------|------|
| 1 | Brief digestion + assumptions | Analysis |
| 2 | Persona definition | Research synthesis |
| 3 | Pain point mapping | Problem framing |
| 4 | HMW generation | Ideation |
| 4.5 | Cornerstone declaration | UX surface mapping |
| 5 | Agent futures | AI capability design |
| 6 | Technical scoping | Integration + constraints |
| 7 | Agent state machine | Interaction design |
| 8 | Handoff to /code-ready-prd | Structured handoff block (plain text) |

**Output 1:** Single `show_widget` call containing all of phases 1–7 (including Phase 4.5).
**Output 2:** `create_file` + `present_files` for the PRD. No widget for the PRD.

---

## How to invoke

When a user shares a brief, immediately generate the single consolidated widget (phases 1–7)
and then the PRD file. Do not orient, explain, or pause between phases.

If they say "pause between phases" or "let me review each phase": revert to rendering one
widget per phase and waiting for approval. This is the exception, not the default.

If they have outputs from earlier phases: accept them and jump directly to the PRD file.

If they ask to re-run or adjust a specific phase: re-render only that section of the widget.

---

## Phase instructions

### Phase 1 — Brief digestion + assumptions

**Goal:** Understand the problem space and surface the key design challenge.

Produce:
- **Core problem restatement** — one sentence, no solution language
- **Explicit constraints** — pulled directly from the brief
- **Implicit constraints** — what the brief implies but doesn't say
- **Assumptions** — anything not stated that you're treating as true (be explicit)
- **Key tension** — the central design tradeoff (e.g. speed vs. accuracy, flexibility vs. consistency)
- **What success looks like** — from the primary persona's POV only

Do not ask for missing information. Make reasonable assumptions and state them.

---

### Phase 2 — Persona definition

**Goal:** Define the primary persona with enough specificity to make design decisions.

Produce:
- **Name + role** — specific job title, not just "user"
- **Core accountability** — what this person is ultimately responsible for
- **What they are NOT responsible for** — important for scoping
- **Day-in-the-life** — 3–4 sentences, grounded in the domain
- **Their relationship with AI tools** — skeptic / pragmatist / power user
- **Success looks like** — one sentence from their perspective
- **Failure looks like** — one sentence, what keeps them up at night
- **Secondary personas (1–2)** — name, role, one critical need only

Primary persona drives all subsequent phases. Secondary personas are constraints, not co-leads.

---

### Phase 3 — Pain point mapping

**Goal:** Identify the real friction points the primary persona experiences today.

Produce 6–8 pain points, each with:
- **Pain** — specific, observable behaviour or situation (not "it's hard to...")
- **Current workaround** — what they actually do today
- **Cost** — time lost, risk introduced, or quality degraded
- **Severity** — High / Medium / Low from primary persona's POV

Group by theme if 3+ pain points share a root cause.

---

### Phase 4 — HMW generation

**Goal:** Reframe pain points as design opportunities.

Produce:
- 8–10 HMW statements, derived from Phase 3 pain points
- Each HMW should be: specific enough to generate ideas, open enough to allow multiple solutions
- Tag each with the pain point it addresses
- Mark the **top 3** most impactful from primary persona's POV, with one sentence of rationale

Format: "How might we [verb] [subject] so that [primary persona outcome]?"

---

### Phase 4.5 — Cornerstone declaration

**Goal:** Map the primary persona's existing work environment before designing any feature.
This phase determines the UX. Everything in Phase 5 onward is placed relative to what is
decided here. Do not skip or merge this into Phase 5.

Answer these questions in order:

**1. Where does this person already work?**
Name the surface(s) they spend the majority of their time in. This is not a new screen —
it is the existing product environment the feature will be built into. Be specific:
not "a document tool" but "a structured document editor with a left section navigator,
a main canvas, and a right properties panel."

**2. What views/screens do they move across in a typical session?**
List 2–4 views the persona actually navigates between. These are the existing surfaces.
Examples: submission overview → section editor → review panel. Not invented for this brief.

**3. What is the cornerstone — the single surface where they spend the most time?**
Name it explicitly. If two surfaces share equal time, name both and describe how the user
moves between them. This becomes the gravitational center for all features.

**4. What is always visible in the cornerstone's chrome?**
Top nav, left nav, section headers, status bars — what persistent UI elements surround
the main content area? These are candidate homes for ambient indicators.

Produce a named declaration:
> **Cornerstone: [name]** — [one sentence describing what the user does there and what
> the screen looks like: shell type, main content area, persistent chrome elements]

Every agent capability in Phase 5 must reference this declaration by name. A capability
that cannot be placed on or triggered from the cornerstone requires explicit justification
for why it needs its own screen.

Violation check before proceeding to Phase 5:
- Would any feature designed so far require a new top-level screen? If yes — is it justified?
- Is there a risk of designing a "dashboard" for something that should be a column, badge, or drawer?

---

### Phase 5 — Agent futures ideation

**Goal:** Design how AI agents would change the primary persona's work — and exactly where on the cornerstone each capability surfaces.

The cornerstone has already been declared in the mandatory checkpoint above. Use it.
Classify every capability relative to it:

| Class | What it means | Must reference |
|-------|--------------|----------------|
| **Inline** | Embedded directly in cornerstone content (flag on a row, annotation on a value) | Which element in the cornerstone it appears on |
| **Overlay** | Drawer, panel, or popover on the cornerstone — no navigation away | Which cornerstone surface it overlays |
| **Ambient** | Persistent passive indicator in the cornerstone chrome (badge, dot, count in a column) | Exact location in the cornerstone chrome |
| **Secondary surface** | Separate screen navigated to from the cornerstone — justify explicitly | Why it cannot be an overlay; who uses it |

When in doubt, it's an overlay on the cornerstone — not a new screen.

Produce:
- **3–4 agent capabilities**, each with:
  - What the agent does (concrete action, not "helps with")
  - What data/input it needs
  - What it produces
  - **Surface class + anchor** — class (Inline/Overlay/Ambient/Secondary) AND which specific part of the cornerstone it lives on (e.g. "Overlay on doc editor" not just "Overlay")
  - Failure mode: what happens when the agent is wrong?
- **"Day after" scenario** — 3–4 sentences describing the primary persona's workflow once these agents exist. Output this as plain text after the widget, not inside it.

Anchor everything to the primary persona's goals. Do not design agent capabilities that primarily serve secondary stakeholders.

---

### Phase 6 — Technical scoping + integration mapping

**Goal:** Identify what the product needs to connect to, and what the key technical constraints are.

Produce:
- **Core data objects** — the 3–5 main entities the product works with
- **Integration surface** — what external systems does this product read from / write to?
- **Trust boundary** — what data can the agent act on autonomously vs. what requires human approval?
- **Edge cases** — 6–8 specific situations that could break the experience or cause harm
  - Format: Situation → What breaks → How to handle it
- **MVP vs. later** — which integrations and capabilities are v1 vs. post-launch

Edge cases should be concrete and domain-specific (e.g. "claim approved in one market but not another" — not "data inconsistency").

---

### Phase 7 — Agent state machine design

**Goal:** Map the key states and transitions in the product's core workflow.

Produce:
- **State list** — every state a core object can be in (e.g. a claim: draft / under review / approved / expired)
- **Transition table:**

| From state | To state | Trigger | Guard | Side effect | Initiated by |
|------------|----------|---------|-------|-------------|--------------|
| Draft | Under review | Writer submits | All required fields complete | Notify reviewer | User |

- **Happy path** — the sequence of states for the primary persona's most common workflow
- **Exception paths** — 2–3 common deviations (rejection, escalation, expiry)

---

### Phase 8 — Handoff to /code-ready-prd

**Goal:** Package the ideation output cleanly so `/code-ready-prd` can consume it directly
and generate the full code-ready PRD without needing to re-ask questions.

**Do not generate the PRD here.** Phase 8 ends the ideation pass. The PRD is a separate
document produced by the `/code-ready-prd` skill. Tell the user:

> "Ideation complete. Run `/code-ready-prd` with this output to generate the full PRD."

**What to output at the end of Phase 8:**

Produce a compact handoff block (plain text, not a widget) containing:

- **Product name + primary persona** — one line
- **Cornerstone UI** — the named primary surface(s) where the persona works (e.g. "Submission navigator + Doc editor"). This must match Phase 5.
- **Agent capabilities** — for each: name, surface class, AND which specific cornerstone surface it lives on (e.g. "Inline on doc editor", "Ambient in submission navigator section-status column")
- **Core objects + states** — from Phase 7
- **Key design decisions** — 3–5 decisions made during ideation that the PRD must respect
- **Out of scope** — anything explicitly ruled out

This block is the input contract for `/code-ready-prd`. It should be copy-pasteable.
The cornerstone UI named here must flow directly into Section 9 and 10 of the PRD.

**Downstream (after PRD):** Once `/code-ready-prd` writes `./PRD.md`, continue with
`/build-lofi` (consumes `./PRD.md` for lo-fi feature sketches) or `/dress-up --prd <path>`
after a Magic Patterns import (same PRD as the audit contract).

---

## Widget rendering guide

**Before the `show_widget` call, always call `visualize:read_me` with modules `["mockup"]`.**

Phases 1–7 render as **one single `show_widget` call**. The widget is a long scrollable document
with phase section headers, cards, tables, and color-coded severity. Do not split into multiple
widget calls.

### Structure of the single widget

```
[Phase 1–2 block] — Brief + Persona side by side in a 2-col grid
[Phase 3 block]   — Pain points as a compact table with severity color coding
[Phase 4 block]   — HMWs as a table, top 3 highlighted in blue
[Phase 4.5 block] — Cornerstone declaration as a dedicated card with: where they work, views they move across, named cornerstone, chrome elements. This is its own widget section with a phase header.
[Phase 5 block]   — Agent capabilities as condensed cards (3 agents max, 4 attributes each)
[Phase 6 block]   — Edge cases as a table; MVP/later as a 2-col grid
[Phase 7 block]   — State pills row + transition table
```

### HTML primitives to use

```html
<!-- Phase section header — separates phases visually -->
<div style="font-size: 11px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase;
            color: var(--color-text-tertiary); margin: 28px 0 12px;">
  Phase N — Phase Name
</div>

<!-- Standard card -->
<div style="background: var(--color-background-primary);
            border: 0.5px solid var(--color-border-tertiary);
            border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 10px;">
  <div style="font-weight: 500; color: var(--color-text-primary); margin-bottom: 6px;">Title</div>
  <div style="color: var(--color-text-secondary);">Content</div>
</div>

<!-- 2-col grid -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 10px; margin-bottom: 10px;">
</div>

<!-- Compact table (pain points, HMWs, edge cases, state transitions) -->
<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 10px;">
  <thead>
    <tr style="border-bottom: 0.5px solid var(--color-border-tertiary);">
      <th style="text-align: left; padding: 6px 8px; color: var(--color-text-tertiary);
                 font-weight: 500;">Col</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 0.5px solid var(--color-border-tertiary);">
      <td style="padding: 6px 8px; color: var(--color-text-secondary);">Value</td>
    </tr>
  </tbody>
</table>

<!-- Severity / priority color coding -->
<span style="color: #e05252; font-weight: 500;">High</span>
<span style="color: #e09c3a; font-weight: 500;">Medium</span>
<span style="color: #6db56d; font-weight: 500;">Low</span>

<!-- Top 3 HMW highlight (blue left border) -->
<div style="border-left: 2px solid var(--color-border-info); padding-left: 10px;">

<!-- State pill -->
<span style="display: inline-block; background: var(--color-background-secondary);
             border: 0.5px solid var(--color-border-tertiary); border-radius: 4px;
             padding: 2px 8px; font-size: 11px; color: var(--color-text-secondary);
             margin-right: 4px; margin-bottom: 4px;">State name</span>
```

### Content density rules

- Pain points: table with columns Pain / Workaround / Cost / Severity. Max 8 rows.
- HMWs: table with columns # / Statement / Pain ref. Top 3 get blue left border. Max 9 rows.
- Agent capabilities: 3 agents max. Each card shows: What it does / Input / Output / Surface class / Failure mode.
  Surface class gets a colored pill: Inline (blue), Overlay (purple), Ambient (gray), Secondary (amber).
  Drop the "day after" scenario from the widget — it goes in the PRD.
- Edge cases: table with columns Situation / Breaks / Handle. Max 8 rows.
- State machine: state pills in a horizontal row, then the full transition table.

**Rules:**
- All content hardcoded in HTML — no JavaScript
- CSS variables only (`var(--color-*)`) — no hex except severity indicators (#e05252 etc.)
- Tables use `table-layout: auto` — do not set fixed column widths
- No nested scrolling — widget auto-fits height

---

## Quality checklist (run before calling ideation done)

- [ ] Phases 1–7 rendered in a **single** `show_widget` call
- [ ] Assumptions stated explicitly in Phase 1 section of the widget
- [ ] Primary persona POV is the lens for all decisions
- [ ] Pain points table has Severity column with color coding
- [ ] Top 3 HMWs are visually distinguished (blue left border)
- [ ] Phase 4.5 cornerstone declaration is rendered as its own widget section between Phase 4 and Phase 5
- [ ] Phase 4.5 names: where they work, views they move across, the cornerstone, and chrome elements
- [ ] Every agent capability has a surface class AND a named anchor (e.g. "Overlay on doc editor")
- [ ] No agent capability is classified as a standalone screen when Inline/Overlay/Ambient is correct
- [ ] Agent capabilities capped at 3, each with surface class pill in the widget
- [ ] Phase 8 handoff block names the cornerstone and uses relational anchors for all capabilities
- [ ] Edge cases are concrete and domain-specific
- [ ] State transition table has all 6 columns
- [ ] Phase 8 handoff block is present and copy-pasteable
- [ ] No API calls were made
- [ ] No widget used JavaScript to generate content dynamically

