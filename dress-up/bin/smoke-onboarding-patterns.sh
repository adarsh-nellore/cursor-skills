#!/usr/bin/env bash
# Smoke test dress-up onboarding pattern references + skill markers.
set -euo pipefail

CURSOR_ROOT="${CURSOR_SKILLS:-$HOME/.cursor/skills}"
CLAUDE_ROOT="${CLAUDE_SKILLS:-$HOME/.claude/skills}"
PASS=0
FAIL=0

ok() { echo "OK  $1"; PASS=$((PASS + 1)); }
bad() { echo "FAIL $1"; FAIL=$((FAIL + 1)); }

check_file() {
  if [[ -f "$1" ]]; then ok "$1"; else bad "missing $1"; fi
}

PATTERNS=(
  WORD_MODAL_SHELL.md
  CTA_NAV_HIGHLIGHT.md
  MODAL_LOADING.md
  NAVIGATION_AND_CTAS.md
  MOTION_AND_SCROLL.md
  SCREEN_INVENTORY_TEMPLATE.json
)

for root in "$CURSOR_ROOT/dress-up" "$CLAUDE_ROOT/dress-up"; do
  for f in "${PATTERNS[@]}"; do
    check_file "$root/references/onboarding-patterns/$f"
  done
done

node -e "JSON.parse(require('fs').readFileSync('$CURSOR_ROOT/dress-up/references/onboarding-patterns/SCREEN_INVENTORY_TEMPLATE.json','utf8'))" \
  && ok "SCREEN_INVENTORY_TEMPLATE.json parses" || bad "JSON parse"

SKILL="$CURSOR_ROOT/dress-up/SKILL.md"
for needle in \
  "NAVIGATION_AND_CTAS.md" \
  "MOTION_AND_SCROLL.md" \
  "demo_flow_spine" \
  "LinkButton" \
  "scroll-tame" \
  "anim-fade-in" \
  "opacity-only" \
  "Prototype surface patterns"
do
  if grep -q "$needle" "$SKILL" 2>/dev/null; then ok "SKILL contains: $needle"; else bad "SKILL missing: $needle"; fi
done

DIFF=$(diff -q "$CURSOR_ROOT/dress-up/SKILL.md" "$CLAUDE_ROOT/dress-up/SKILL.md" 2>/dev/null && echo 0 || echo 1)
if [[ "$DIFF" == "0" ]]; then ok "cursor/claude dress-up SKILL in sync"; else bad "cursor/claude dress-up SKILL differ"; fi

echo "--- PASS=$PASS FAIL=$FAIL"
exit $(( FAIL > 0 ? 1 : 0 ))
