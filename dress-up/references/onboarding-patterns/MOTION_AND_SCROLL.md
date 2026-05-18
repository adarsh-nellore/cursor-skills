# Motion and scroll discipline

Onboarding prototypes feel broken when the whole page scrolls, modals resize between steps, or loading dots float inside overlays. Use motion to guide attention on **panes**, not on **modal shells**.

## Scroll lock (required for Word + browser setup)

| Shell | Pattern |
|-------|---------|
| Word demo root page | `h-dvh overflow-hidden` wrapper |
| Stage shell | `flex flex-1 min-h-0 overflow-hidden` (not `min-h-screen` on inner layout) |
| Side panel / workspace | aside `overflow-hidden`; **only** main pane body scrolls |
| Modal overlay | backdrop `overflow-hidden`; card body `overflow-y-auto scroll-tame` |
| Browser setup | chrome fixed; `BrowserViewportMain` column scrolls internally |

Add to `globals.css`:

```css
.scroll-tame {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

Never put `overflow-y-auto` on the document body for these flows.

## Page motion (prefer DS utilities)

Stagger section entrance with built-in classes (no new keyframes in Stage 4):

```tsx
<section className="anim-fade-in">...</section>
<section className="anim-fade-in-1">...</section>
```

`globals.css` should define `ads-fade-in` + `.anim-fade-in` through `.anim-fade-in-5` (opacity-only, 280ms ease-out).

## Pane view transitions (cornerstone `?view=`)

Allowed for **non-modal** pane views (`hook`, `reveal`, `steady`, `entry`):

- `AnimatePresence mode="wait"` with **opacity-only** `fadeIn` (no `y` on exit for chrome that sits next to modals).
- Or skip framer and mount with `anim-fade-in` only.

**Forbidden on modal view keys** (`feedback`, `generate-confirm`, `analyze-run`):

- `AnimatePresence` with `y` translate
- `ThinkingIndicator` pulsing dots (use `MODAL_LOADING.md`)

## Micro-interaction polish (Stage 3+)

| Element | Motion |
|---------|--------|
| Linked finding / source cards | `hover:shadow-pop` or Card hover + slight translate (DS-safe) |
| Stage progress header | `transition` on width when step changes |
| FlowIndex panel | `useReducedMotion`; respect `prefers-reduced-motion` |
| Primary CTA | `cta-nav-highlight-wrap` pulse (see `CTA_NAV_HIGHLIGHT.md`) |

## Stage 4 framer-motion rule (onboarding exception)

Default dress-up Stage 4: strip **new** framer-motion.

**Onboarding / multi-view cornerstone exception:** keep or reintroduce **only**:

- `AnimatePresence` on pane dispatcher (opacity-only)
- `FlowIndex` expand/collapse

Strip framer from modal bodies and loading overlays. Replace `motion.div` page wrappers with `<motion.div>` only when opacity transition is required; otherwise `<motion.div>` → `<motion.div>` with `anim-fade-in`.

## Checkpoint #1 verify

1. Resize window: side panels stay fixed; only document/pane scrolls.
2. Click through spine: no full-page scroll jitter between steps.
3. Modal `?view=` switches: card size stable; no bouncing dot row.
