---
name: code-ready-prd
description: >
  Generates code-ready PRDs. Triggers: "generate a PRD", "make a PRD for Claude Code", "turn this spec into a PRD", "audit my PRD", "add the data schema", "make this Claude Code ready". Also triggers after /design-ideation to generate the PRD from the Phase 8 handoff block. When a Phase 8 handoff block exists: read it first, map cornerstone → Sections 9+10, agent capabilities → Sections 13+14+17, core objects → Sections 15+16, design decisions → Section 8, out of scope → Section 6. CRITICAL — Section 9 is NOT a navigation table. It is cornerstone-first IA: name the primary surface the user works on, then classify every feature as Inline/Overlay/Ambient/Secondary relative to it. Section 10 is NOT core screens. It is a UI surface inventory starting with the cornerstone. Overlays, badges, and drawers are NOT screens. Section 19 routes only the cornerstone and justified secondary surfaces. Composes upstream from /design-ideation; downstream /build-lofi, /build-hifi, /dress-up --prd. Works in Cursor Agent.
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


# code-ready PRD Skill

## What this skill does

Produces or audits a PRD formatted for direct use as a AI coding tool input. The key difference
from a standard product PRD: this format includes the 6 sections that AI coding tools specifically
needs to generate working code without back-and-forth.

**The 6 implementation-critical sections (often missing from standard PRDs):**
- Component inventory (actual component names, types, props, screens)
- Data schema (field-level types: uuid, enum, timestamp, boolean — not just object names)
- State transition table (formatted as a table with triggers and guards, not prose)
- Agent capability spec (input/output/confidence/fallback/human touchpoint per action)
- Mock data examples (realistic JSON, multiple states, not placeholder values)
- Navigation and routing (explicit route paths)
- Tech stack declaration (framework, styling, DB, auth, AI calls — nothing assumed)

---

## Pipeline composition

- **Preferred upstream:** `@design-spec` (writes `IDEATION.md`, `HANDOFF.md`, `PRD.md`).
- **Legacy upstream:** `/design-ideation` (Phase 8 handoff). `/founding-design-ideation` is legacy.
- **Downstream:** `@explore-mockup`, `@dress-up --from-mockup`, `@build-hifi` (fast lane). Legacy: `@build-lofi`, MP + `@dress-up <url>`.

## Next skill (if run standalone)

**When:** Full 22-section `PRD.md` is done and user asks what is next.

**Suggest:** `@explore-mockup` in the folder containing `PRD.md`. Prefer **`@design-spec`** for the full gated flow next time.

---

## How to invoke

**Generate a full PRD:**
> "Generate a code-ready PRD for [product/feature description]"

**Audit an existing PRD:**
> "Audit this PRD for implementation readiness" + paste PRD

**Patch missing sections only:**
> "Add the missing implementation sections to this PRD" + paste PRD

---

## Output delivery

Always write the full PRD to `./PRD.md` in the project working directory.
Use plain markdown only — pipe-syntax tables for Sections 14–22, fenced
code blocks, plain lists. Report the local file path when done.

---

## Operating modes

### Mode 1: Full PRD generation

**If invoked after /design-ideation**, the conversation will contain a Phase 8 handoff block.
Read it before writing anything. The handoff block contains:
- Product name + primary persona
- Cornerstone UI (use this exactly in Sections 9 and 10 — do not invent a different surface)
- Agent capabilities with surface class + cornerstone anchor (use these in Sections 13, 14, 17)
- Core objects + states (use these in Sections 15 and 16)
- Key design decisions (use these to write Section 8 design principles)
- Out of scope (use this to write Section 6 non-goals)

Map each handoff field to its PRD section explicitly. Do not discard any handoff field.
Do not add screens, surfaces, or features not present in the handoff block.

**If generating from scratch** (no handoff block in conversation), ask upfront:
- What is the product and primary persona?
- What does the product already do (if anything)?
- What is the cornerstone UI — the surface where the user already works?
- What integrations are in scope vs. out of scope for v1?
- What tech stack should Cursor use?

### Mode 2: PRD audit

When given an existing PRD, run it against the 20-section checklist below.
Report: present / missing / incomplete for each section.
Then offer to generate the missing sections inline.

### Mode 3: Patch mode

When the user has a PRD and wants only the missing implementation sections added,
generate just the missing sections and clearly mark where to insert them.

---

## The 20 required PRD sections

### Section 1: Document header
Table with: product name, version, status, primary persona, document purpose, output use.

### Section 2: Background and context
- What the product already does (if anything)
- What this PRD adds
- Key integration assumptions, especially what is explicitly OUT of scope

### Section 3: Problem statement
One paragraph. Specific. Anchors everything that follows. No solution language.

### Section 4: Product goal
3–5 questions the user should be able to answer after using the product.

### Section 5: Success criteria
- User outcomes (what the user can do/feel/stop doing)
- Product outcomes (behavioral or metric)

### Section 6: Non-goals
Explicit list. These prevent scope creep in implementation.

### Section 7: Personas
**Primary:** role, accountability, what they're NOT responsible for, AI relationship,
success and failure descriptions.
**Secondary (1–2):** role, primary motivation, one critical need.

### Section 8: Design principles
4–6 principles, each implying a decision. Format: **Name:** implication.

---

## 🔴 Mandatory checkpoint — declare the cornerstone before writing Sections 9–19

**Sections 1–8 define the problem, persona, and principles. Before writing any UI section,
you must name the cornerstone. Do not write Section 9 until this is done.**

The cornerstone is the primary surface where the user already works — the main product
interface that exists regardless of the feature being specced. Every UI element, agent
output, overlay, badge, and secondary screen in Sections 9–19 must be described in
explicit relation to the cornerstone. Not as a peer screen. Not as a parallel dashboard.

**If generating from a /design-ideation handoff:** the cornerstone is already named in
the handoff block. Use it exactly as stated. Do not invent additional screens.

**If generating from scratch:** name it now before continuing.
"Cornerstone: [name] — [one-line description of what the user does there]"

Common types:
| Type | Use when |
|------|----------|
| Doc editor | Primary task is writing, reviewing, or annotating a document |
| Submission / project navigator | Primary task is managing a collection of docs, tasks, or sections |
| Dashboard | Primary task IS monitoring — only if that is the entire job |
| List / queue | Primary task is triaging and acting on items one by one |

**Hard rules for Sections 9–19:**
- Section 9 opens with the cornerstone declaration — before any other feature is placed
- Section 10 opens with the cornerstone — every other surface references it explicitly
- Section 14 (component inventory) — every component names the cornerstone surface it lives on
- Section 17 (agent capabilities) — every capability names the cornerstone surface it appears on
- Section 19 (routing) — routes exist only for the cornerstone and explicitly justified secondary surfaces

**Violation examples — catch these before writing Section 9:**
- Listing a "Conflict Resolution Screen" when it is a Drawer on the doc editor
- Giving a badge count its own route or screen entry
- Creating a "Guidance Dashboard" when guidance alerts surface inline in an existing navigator
- Any screen in Section 10 that could have been an overlay or a column in the cornerstone view

**Self-test:** Read Sections 9 and 10 back as if you are a prototype tool with no other
context. Would you generate a standalone screen for anything that should be an overlay
or badge? If yes, rewrite before proceeding.

---

### Section 9: Information architecture — cornerstone-first, gravity-organized

The cornerstone was declared in the mandatory checkpoint above. Use it as the anchor for
everything in this section. Do not re-declare it — just reference it by name.

**Place every feature relative to the cornerstone using this classification:**
| Class | What it means | Has a route? | Must name |
|-------|--------------|-------------|-----------|
| Primary surface | The cornerstone itself — where the user works | Yes | Shell + content area |
| Inline | Embedded in the cornerstone's content (flag on a row, annotation on a value) | No | Which element in the cornerstone |
| Overlay | Drawer, panel, popover on the cornerstone — no navigation | No | Which cornerstone surface it overlays |
| Ambient | Passive indicator in the cornerstone's chrome (badge, column, dot) | No | Which part of the cornerstone chrome |
| Secondary surface | Separate screen navigated to from the cornerstone — justify explicitly | Yes | Why it can't be an overlay |

**Rule:** Never list an Overlay, Ambient indicator, or inline element as a peer screen to the
cornerstone. A conflict count badge is not a screen. A resolution Drawer is not a screen.
A status column in a navigator is not a screen. If a prototype tool could misread this section
and generate a standalone dashboard for it, rewrite it.

Produce (reference the cornerstone declared in the checkpoint above — do not re-name it):
- **Inline elements** — trigger → what appears → which specific element/location in the cornerstone
- **Overlays** — trigger → component → content summary → which cornerstone surface it overlays → dismiss
- **Ambient indicators** — which part of the cornerstone chrome → what it shows → when it updates
- **Secondary surfaces** — name, purpose, explicit justification, who uses it
- **Key system objects** — named and described in one line each

---

### Section 10: UI surface inventory

**Start with the cornerstone. Everything else is described relative to it.**
Do not give Overlays, Inline elements, or Ambient indicators their own top-level screen entry.
A reader of this section — including a prototype tool — should be able to answer:
"Where does the user live, and what comes to them there?"

**Cornerstone (primary surface):**
Name | Shell component | Purpose (one sentence) | What is always visible

If there are two primary surfaces (e.g. navigator + doc editor), describe both and the
transition between them (e.g. "clicking a section row in the navigator opens the doc editor").

**Inline elements — on [Cornerstone name]:**
Per element: name | trigger condition | visual treatment | exactly where in the cornerstone content

**Overlays — on [Cornerstone name]:**
Per overlay: name | trigger | component (Drawer/Panel/Popover) | key content | which cornerstone surface it overlays | dismiss behavior

**Ambient indicators — in [Cornerstone name] chrome:**
Per indicator: name | exact location in the cornerstone (nav bar / section header / row column / etc.) | what value or state it shows | what triggers an update

**Secondary surfaces — navigated to from [Cornerstone name]:**
Per surface: name | purpose | explicit reason it cannot be an overlay | who uses it | key modules

### Section 11: User stories
Per persona. Format: "As [persona], I want [action] so that [outcome]."
Minimum 3 per persona.

### Section 12: Functional requirements
- State model (table: state, description, terminal?)
- Classification/severity model (if applicable)
- Confidence model (if AI-involved: level, threshold, UI behavior)
- Notification rules (trigger, recipient, channel — sparingly)
- Permission model (role → can do / cannot do table)

### Section 13: Feature specs
Per feature: description, **surface class** (Inline/Overlay/Ambient/Secondary), user actions,
agent actions, tech scope, failure states and fallbacks, risk mitigation pattern.

---

### Section 14: Component inventory ⚡ implementation-critical

```
| Component | Type | Surface class | Props / Inputs | Actions emitted | Screen(s) |
|-----------|------|--------------|----------------|-----------------|-----------|
| [Name] | [page/panel/modal/table/form/card/badge/button] | [Primary/Inline/Overlay/Ambient/Secondary] | [prop: type] | [onAction] | [Screen or "on [PrimaryScreen]"] |
```

Type options: page, panel, modal, table, form, card, badge, button, input, drawer,
toast, stepper, timeline, sidebar, tab, tooltip.

Surface class is mandatory. Components classified as Inline, Overlay, or Ambient must
reference the primary surface they live on in the Screen(s) column — not a standalone page name.

Every UI element that needs to be built gets a row. Be specific — "IssueDetailPanel"
not "issue screen".

---

### Section 15: Data schema ⚡ implementation-critical

Per object:
```
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | uuid | yes | auto | Primary key |
| name | string | yes | — | Display name |
| status | enum(detected,assigned,resolved,closed) | yes | detected | Workflow state |
| severity | enum(blocking,high,medium,minor) | no | null | Filing risk level |
| created_at | timestamp | yes | now | Creation time |
| assignee_id | uuid (FK → User) | no | null | Assigned owner |
| is_archived | boolean | no | false | Soft delete flag |
```

Field types to use: string, text, uuid, integer, float, boolean, timestamp, enum(val1,val2,...),
json, uuid (FK → ObjectName).

Include relationships (belongs to, has many) and owner (user-created / agent-created / system).

---

### Section 16: State transition table ⚡ implementation-critical

```
| From state | To state | Trigger | Guard | Side effects | Initiated by |
|------------|----------|---------|-------|--------------|--------------|
| Detected | Assigned | User assigns owner | Owner field not null | Notify assignee, log event | User |
| Assigned | In progress | Assignee opens issue | — | Log view event | Agent (passive) |
| In progress | Resolved pending | Assignee submits rationale | Rationale field complete | Notify lead for review | User |
| Resolved pending | Closed | Lead approves | Rationale passes quality check | Log closure, update health | User |
| Any | Blocked | User marks blocked | — | Alert lead | User |
```

Every transition needs all 6 columns. No prose state descriptions here.

---

### Section 17: Agent capability spec ⚡ implementation-critical

Per agent action:
```
### Capability: [ActionName]
| Field | Value |
|-------|-------|
| Input | [Data sources the agent reads] |
| Output | [What it produces and where] |
| Surface class | [Inline / Overlay / Ambient / Secondary — where the output appears] |
| Cornerstone anchor | [Which specific cornerstone surface this appears on — e.g. "on doc editor", "in submission navigator section-status column". Required for every capability.] |
| Confidence model | [How uncertainty is expressed in the UI] |
| Fallback — low confidence | [What it does/shows when uncertain] |
| Fallback — hard failure | [What it does/shows when it cannot complete] |
| Human touchpoint | [Yes — requires review before effect / No — applies automatically] |
| Trigger | [What initiates this action] |
| Side effects | [State changes, notifications, log entries] |
```

---

### Section 18: Mock data examples ⚡ implementation-critical

Realistic JSON examples for each core object. Requirements:
- 2–3 examples per object
- Realistic field values (not "string1", "user@email.com", "test")
- Cover multiple states: one active, one stalled or blocked, one resolved/closed
- Include domain-appropriate values (real-sounding names, realistic dates, plausible content)

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Dosing frequency differs between Section 2.4 and Module 5.3",
    "state": "assigned",
    "severity": "high",
    "assignee": "Dr. Maria Chen",
    "created_at": "2025-03-12T09:14:00Z",
    "_note": "Active, assigned, not yet acknowledged"
  }
]
```

---

### Section 19: Navigation and routing ⚡ implementation-critical

Routes exist only for primary surfaces and secondary surfaces. Overlays, inline elements,
and ambient indicators have no routes — they are triggered in-place on their parent surface.

```
| Route | Screen | Surface class | Auth required | Notes |
|-------|--------|--------------|--------------|-------|
| / | Command Center | Primary | Yes | Default landing after login |
| /inconsistencies | Inconsistency Queue | Primary | Yes | |
| /inconsistencies/:id | Issue Detail | Secondary | Yes | Deep-link to specific issue |
| /audit | Audit View | Secondary | Yes | QC reviewer only |
| /login | Login | — | No | Redirects to / if authenticated |
```

---

### Section 20: Tech stack declaration ⚡ implementation-critical

```
| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend framework | React / Next.js / Vue | |
| Styling | Tailwind / CSS Modules | |
| State management | useState / Zustand / React Query | |
| Routing | React Router / Next.js router | |
| Backend/API | Mock data / Express / Next.js API routes / Supabase | |
| Database | PostgreSQL / SQLite / in-memory mock | |
| Auth | None for prototype / Clerk / NextAuth / mock session | |
| AI/LLM calls | Anthropic Claude API / OpenAI / mocked | |
| Notifications | In-app only / Email (mocked) / None for prototype | |
| Deployment target | Vercel / local only | |
```

Nothing left blank. The coding agent will not assume.

---

## PRD quality gate checklist

Run this before calling the PRD done:

**Completeness**
- [ ] All 20 sections present
- [ ] No section contains TBD, to be defined, or placeholder text
- [ ] Non-goals list would prevent scope creep

**implementation readiness**
- [ ] Component inventory lists real component names with types and props
- [ ] Data schema has field-level types, not just field names
- [ ] State transition table is a table, not described in prose
- [ ] Agent capabilities each have a defined fallback for low confidence and hard failure
- [ ] Mock data uses realistic values across different states
- [ ] All routes are declared explicitly
- [ ] Tech stack leaves nothing unspecified

**Design integrity**
- [ ] Agent vs. human actions clearly separated throughout
- [ ] Low-confidence scenarios are designed for, not just mentioned
- [ ] Every agent action that changes state has a human review point (or explicitly doesn't)

**UI gravity + cornerstone**
- [ ] Section 9 declares the cornerstone UI by name before placing any feature
- [ ] Section 9 organizes surfaces by gravity — Cornerstone first, then Inline, Overlay, Ambient, Secondary
- [ ] Section 10 opens with the cornerstone and every other surface references it explicitly
- [ ] No Overlay, Inline element, or Ambient indicator appears as a standalone screen in Section 10
- [ ] Every Overlay in Section 10 names which cornerstone surface it overlays
- [ ] Every Ambient indicator in Section 10 names its exact location in the cornerstone chrome
- [ ] Every agent capability in Section 17 has a surface class AND names the cornerstone surface it appears on
- [ ] Every component in Section 14 has a surface class referencing the cornerstone
- [ ] Section 19 route table contains only Cornerstone (primary) and Secondary surface routes
- [ ] No feature that belongs as an Overlay or Ambient indicator has its own route

