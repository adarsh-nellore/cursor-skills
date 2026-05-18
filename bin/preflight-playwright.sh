#!/usr/bin/env bash
# Pre-install Playwright Chromium so dress-up / ux-review don't pay download tax on first MCP use.
set -euo pipefail
echo "Installing Playwright Chromium (one-time, ~150MB)..."
npx -y playwright@latest install chromium
echo "Done. Reload Cursor if you just added playwright to mcp.json."
