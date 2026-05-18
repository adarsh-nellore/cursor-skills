# Fixed overlay shell (Word / onboarding modals)

Use **one shell component** for every centered overlay on the cornerstone route (`?view=` / `?modal=`). Do not mix a second floating `Card` pattern with different `max-w-*` on different views.

## Layout contract

| Region | Classes / behavior |
|--------|-------------------|
| Backdrop | `absolute inset-0 flex items-center justify-center overflow-hidden` + dim (`bg-black/25`) |
| Card | `w-full max-w-md h-[min(520px,calc(100dvh-12rem))] min-h-[460px] flex flex-col rounded-card border bg-paper shadow-xl overflow-hidden` |
| Body | `flex-1 min-h-[220px] min-h-0 overflow-y-auto` + consistent padding (`p-5`) |
| Footer | `shrink-0 border-t min-h-[88px] px-5 py-4 flex flex-col gap-2` when primary CTA present |

## Dispatcher pattern

Cornerstone page reads `useSearchParams().get('view')` and switches views inside **the same shell** (e.g. `WordModalShell` + inner content). Views: `feedback`, `generate-confirm`, `analyze-run`, etc.

## Hard rules

- **Same card footprint** across all modal views; only body content scrolls.
- **Sticky footer** for primary + secondary actions; do not let footer jump when content height changes.
- **analyze-run** and other loading views use this shell, not a separate centered `max-w-sm` card.
- Optional `title` / `subtitle` props on the shell for consistent header block across views.
- Do not wrap modal `view` keys in `AnimatePresence` with vertical motion; swap content instantly inside the stable shell. Pane views (hook, reveal, steady) may fade.

## Stage mapping

- **Stage 1a / 3:** raw Tailwind divs matching the table above.
- **Stage 4:** translate to `<Card>` + `<Stack>` but **preserve** fixed `max-w-md`, `min-h-[460px]`, footer `min-h-[88px]`.

## Reference

Peer onboarding prototype: `WordModalShell` in `WordShell.tsx` (read-only pattern source).
