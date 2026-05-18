# Navigation and clickable CTAs

Multi-step onboarding / demo prototypes fail review when primary buttons do not navigate, disabled buttons still link, or labels do not match the next screen. Encode these in **Stage 1a seed** and preserve through Stage 4.

## LinkButton is mandatory for route changes

```tsx
// CORRECT — every "go to next screen" action
<LinkButton href="/onboarding/tailor?ready=1" variant="primary" navHighlight>
  Continue
</LinkButton>

// WRONG — looks like a button but may be unwired or use wrong handler
<Button onClick={() => router.push("/foo")}>Continue</Button>
```

| Action type | Component |
|-------------|-----------|
| Change route / `?view=` | `<LinkButton href="...">` |
| Toggle, dismiss, submit in place | `<Button onClick={...}>` |
| External doc | `<LinkButton external href="https://...">` |

## Disabled must not navigate

When `disabled={true}`, render **only** `<Button disabled>` — never wrap in `<Link>`.

```tsx
if (disabled) {
  return <Button variant={variant} className={className} disabled {...buttonProps} />;
}
```

Common bug: disabled primary still inside `<Link>` — pointer events pass through and the user lands on the wrong step.

## Label ↔ destination audit

Before Checkpoint #1, grep every `LinkButton` / `href=` on the critical path:

| Screen | Primary label | `href` must resolve |
|--------|---------------|---------------------|
| feedback modal | Confirm analyze | `?view=analyze-run` or next inventory step |
| analyze complete | View preview | `?view=analyze-results` |
| indexing | Continue (when enabled) | next setup route from PRD (not a stale path) |
| sync | Send to Word / Continue | `complete` or `?view=reveal` per PRD |

Locked actions: use `variant="secondary"` + `disabled`, or enabled secondary link to the blocking prerequisite (e.g. "View indexing progress" while generate stays locked).

## Demo flow spine (portfolio / exercise builds)

For 8+ step demos, add:

1. `src/lib/demo-flow-notes.ts` — `DEMO_FLOW_CANONICAL[]` with `{ label, href, note, stage }` per spine step; `demoFlowRouteKey(pathname, searchParams)` for active state.
2. `FlowIndex` client component in root layout — bottom-left collapsible panel; links use real `href`s; `usePathname` + `useSearchParams` for active highlight.
3. Optional QA routes in `DEMO_FLOW_QA[]` for `?error=`, `?edge=` branches.

Stage 1a: one agent owns flow index + notes if `mockup-handoff.json` has `"demo_flow_spine": true` (default true for onboarding slugs).

## Handoff flags

```json
{
  "cta_nav_highlight": true,
  "demo_flow_spine": true
}
```

## Stage 4

- Keep `LinkButton` import from `@/components/layout/LinkButton`.
- Do not replace forward primaries with plain `<Button href>` (audit fails).
- Preserve `navHighlight` and `cta-nav-highlight-wrap` (see `CTA_NAV_HIGHLIGHT.md`).
