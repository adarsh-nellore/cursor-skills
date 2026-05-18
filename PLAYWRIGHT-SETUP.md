# Playwright MCP (Cursor)

Pre-wired for **dress-up** Stage 2 (Agent B walkthrough) and **ux-review**.

## One-time setup (done if you followed install below)

1. **MCP server** — `playwright` entry in `~/.cursor/mcp.json` runs `npx -y @playwright/mcp@latest`.
2. **Browsers** — run preflight so the first dress-up run doesn't download Chromium mid-exercise:

```bash
~/.cursor/skills/bin/preflight-playwright.sh
```

3. **Reload Cursor** — Settings → MCP → confirm `playwright` is connected (green).

## Using in skills

Claude Code tool names like `mcp__playwright__playwright_navigate` do **not** exist in Cursor.

1. List tools: MCP folder for server `playwright` (after reload), or Cursor Settings → MCP → playwright.
2. Call via **`CallMcpTool`** with `server: "playwright"` and the tool name from the schema (e.g. `browser_navigate`, `browser_click`, `browser_take_screenshot` — exact names vary by `@playwright/mcp` version; always read the descriptor first).

## Dress-up Agent B checklist

- Dev server up (`http://localhost:3053` or URL from `stage1-done.json`).
- Screenshots → `<out>/.dress-up/screens/` (create dir if missing).
- If MCP is missing: stop and write that in `walkthrough-friction.md` — do not fake friction from source.

## Skills that need Playwright

| Skill | When |
|-------|------|
| `dress-up` | Stage 2 Beat 2.2 Agent B |
| `prototype-refine` | Phase 0 anchor screenshots |
| `ux-review` | Default walkthrough flow |
| `tooltip-walkthrough` | Optional hover verification |
