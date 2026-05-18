# Modal and overlay loading states

Centered overlays (Word modals, analyze-run, assist loading) must not use pulsing dot rows. They read as "weird upward moving dots" and fight layout stability.

## Do

- `ProgressBar` (or raw Tailwind bar) + static `MetaText` / label line.
- Reserve **equal min-height** for running vs done branches so the footer CTA does not jump when state flips.
- Keep loading UI inside the fixed modal shell (see `WORD_MODAL_SHELL.md`).

## Do not

- `ThinkingIndicator` (three `animate-pulse` dots) inside centered modals or overlay cards.
- `agent-block` with dot animations for simple "working" waits.
- `AnimatePresence` with `y` exit on modal view keys.

## analyze-run pattern

```tsx
// Same WordModalShell; body min-height fixed
{done ? (
  <>
    <Heading>Check complete</Heading>
    <MetaText>...</MetaText>
    <LinkButton href="..." variant="primary" navHighlight>View preview</LinkButton>
  </>
) : (
  <>
    <Heading>Analyzing …</Heading>
    <ProgressBar value={progress} />
    <MetaText tone="faint">Cross-walking template required elements…</MetaText>
  </>
)}
```

## explore-mockup lo-fi

Loading `state-panel` regions: progress skel + label line only (see `REGIONS.md`).
