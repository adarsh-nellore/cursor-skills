# Primary navigation CTA highlight

Every **forward** primary action ("Continue", "Continue in Word", "Confirm analyze", "Send to Word", next-step in demo spine) must be visually obvious. Shadow-only glow on a coral button is insufficient.

## LinkButton contract

```tsx
<LinkButton
  href="/next-step"
  variant="primary"
  navHighlight={true}  // default true when variant is primary
>
  Continue in Word
</LinkButton>
```

- `navHighlight` defaults to `true` for `variant="primary"`.
- Set `navHighlight={false}` only for in-place actions that are not forward navigation.

## CSS (add to `src/app/globals.css` in Stage 1a seed; preserve in Stage 4)

Use a **wrapper** so the ring sits outside the coral fill:

```tsx
// LinkButton: when navHighlight && variant === 'primary' && !disabled
<span className="cta-nav-highlight-wrap inline-flex max-w-full">
  <Button className="cta-nav-highlight ..." />
</span>
```

```css
.cta-nav-highlight-wrap {
  position: relative;
  display: inline-flex;
  border-radius: var(--radius-md);
  padding: 3px;
}

.cta-nav-highlight-wrap::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px rgb(255 78 73 / 0.85);
  animation: cta-nav-ring 1.8s ease-in-out infinite;
}

.cta-nav-highlight-wrap .cta-nav-highlight {
  position: relative;
  z-index: 1;
}

@keyframes cta-nav-ring {
  0%, 100% { opacity: 0.75; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.03); }
}

@media (prefers-reduced-motion: reduce) {
  .cta-nav-highlight-wrap::before {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

## Hard rules

- Do not rely on `box-shadow` alone on `.bg-coral` buttons.
- Apply to every primary forward CTA on the critical path (see `screen-inventory.json`).
- Stage 4 agents must not remove `cta-nav-highlight-wrap` or strip `navHighlight` from `LinkButton`.
