#!/usr/bin/env node
/**
 * Port skills from ~/.cursor/skills to ~/.cursor/skills (Cursor Agent Skills format).
 * Source: https://github.com/adarsh-nellore/claude-skills
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.env.HOME, ".claude/skills");
const DST = path.join(process.env.HOME, ".cursor/skills");
const SKIP = new Set(["_archive", "_port-from-claude.mjs", ".git"]);

const CURSOR_RUNTIME = `## Cursor runtime

Ported from [claude-skills](https://github.com/adarsh-nellore/claude-skills).

| Claude Code | Cursor |
|-------------|--------|
| \`Agent\` / parallel screen agents | \`Task\` tool (\`subagent_type\`: \`generalPurpose\`, \`explore\`, or \`shell\`) |
| \`AskUserQuestion\` | \`AskQuestion\` |
| \`mcp__playwright__*\` | Playwright MCP via \`CallMcpTool\` (read tool schemas under the MCP folder first) |
| Slash commands (\`/build-hifi\`, etc.) | Say the trigger phrase or \`@\` the skill — discovery uses the \`description\` field |
| Playwright (dress-up Stage 2, ux-review) | MCP server \`playwright\` in \`~/.cursor/mcp.json\`. Preflight: \`~/.cursor/skills/bin/preflight-playwright.sh\`. See \`~/.cursor/skills/PLAYWRIGHT-SETUP.md\` |

`;

function transformBody(body) {
  return (
    body
      .replaceAll("AskUserQuestion", "AskQuestion")
      .replaceAll(
        /Spawn (ONE |N\+1 |N )?`general-purpose` Agent calls/g,
        (_, n = "") =>
          `Launch ${n || ""}parallel \`Task\` calls (\`subagent_type: generalPurpose\`)`,
      )
      .replaceAll(
        "ONE `general-purpose` Agent call",
        "one `Task` call (`subagent_type: generalPurpose`)",
      )
      .replaceAll(
        "`general-purpose` Agent calls",
        "`Task` calls (`subagent_type: generalPurpose`)",
      )
      .replaceAll("**Agent 0 (mock data):**", "**Subagent 0 (mock data):**")
      .replaceAll("**Agents 1 through N", "**Subagents 1 through N")
      .replaceAll("from Agent 0", "from subagent 0")
      .replaceAll("Agent for <route>", "Subagent for <route>")
      .replaceAll("Claude Code session", "Cursor session")
      .replaceAll(/Claude Code\s+session/g, "Cursor session")
      .replaceAll("Claude Code-critical", "implementation-critical")
      .replaceAll("Claude Code critical", "implementation-critical")
      .replaceAll("Claude Code readiness", "implementation readiness")
      .replaceAll("Claude Code input", "AI coding tool input")
      .replaceAll("Claude Code sections", "implementation sections")
      .replaceAll("for direct use as a Claude Code input", "for direct use in Cursor or Claude Code")
      .replaceAll("Claude Code specifically", "AI coding tools specifically")
      .replaceAll("Claude Code will not", "The coding agent will not")
      .replaceAll("Claude Code references", "The coding agent references")
      .replaceAll("Claude Code knows", "The coding agent knows")
      .replaceAll("Claude Code use", "Cursor use")
      .replaceAll("Claude Code needs", "the coding agent needs")
      .replaceAll("reload Claude Code", "reload Cursor")
      .replaceAll("PRD quality gate before Claude Code", "PRD quality gate before handoff")
      .replaceAll("Produce Claude Code input", "Produce code-ready PRD")
      .replaceAll("make this Claude Code ready", "make this code-ready")
      .replaceAll("Claude Code-ready", "code-ready")
      .replaceAll("Claude Code PRD", "code-ready PRD")
      .replaceAll("for Claude Code", "for Cursor")
      .replaceAll("in Claude Code", "in Cursor")
      .replaceAll("Claude Chat", "inline chat")
      .replaceAll(
        "Claude Agent SDK",
        "Cursor Agent / multi-step agent flows",
      )
  );
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { meta: {}, body: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { meta: {}, body: raw };
  const fm = raw.slice(4, end);
  const body = raw.slice(end + 5);
  const meta = {};
  let key = null;
  let buf = [];
  const flush = () => {
    if (!key) return;
    const val = buf.join("\n").trim();
    meta[key] = val;
    buf = [];
  };
  for (const line of fm.split("\n")) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) {
      flush();
      key = m[1];
      if (m[2] === "|" || m[2] === ">") continue;
      if (m[2]) buf.push(m[2]);
      else buf = [];
    } else if (key) {
      buf.push(line);
    }
  }
  flush();
  return { meta, body };
}

function normalizeDescription(desc) {
  if (!desc) return desc;
  return desc
    .replace(/\s+/g, " ")
    .replace(/Claude Code-ready/gi, "code-ready")
    .trim();
}

function buildSkillMd(raw) {
  const { meta, body } = parseFrontmatter(raw);
  const name = meta.name || "skill";
  let description = normalizeDescription(meta.description || "");
  if (description && !/cursor/i.test(description)) {
    description = `${description} Works in Cursor Agent.`;
  }
  const transformed = transformBody(body);
  const injected = transformed.includes("## Cursor runtime")
    ? transformed
    : `${CURSOR_RUNTIME}${transformed}`;
  const descField = `>\n  ${description}`;

  return `---
name: ${name}
description: ${descField}
---

${injected.trimStart()}\n`;
}

function copyDir(srcDir, dstDir) {
  fs.mkdirSync(dstDir, { recursive: true });
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const s = path.join(srcDir, ent.name);
    const d = path.join(dstDir, ent.name);
    if (ent.isDirectory()) {
      copyDir(s, d);
    } else if (ent.name === "SKILL.md") {
      const raw = fs.readFileSync(s, "utf8");
      fs.writeFileSync(d, buildSkillMd(raw));
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

const skills = fs
  .readdirSync(SRC, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !SKIP.has(e.name))
  .map((e) => e.name);

fs.mkdirSync(DST, { recursive: true });
for (const skill of skills) {
  copyDir(path.join(SRC, skill), path.join(DST, skill));
  console.log("ported:", skill);
}

const readme = `# Design pipeline skills (Cursor)

Personal Agent Skills ported from [adarsh-nellore/claude-skills](https://github.com/adarsh-nellore/claude-skills).

## Skills

${skills.map((s) => `- **${s}** — \`~/.cursor/skills/${s}/SKILL.md\``).join("\n")}

## Pipeline order

\`\`\`
design-ideation → code-ready-prd → build-lofi → build-hifi
                                    ↘ dress-up (Magic Patterns import)
agentic-design → tooltip-walkthrough → ux-review
\`\`\`

## Re-sync from Claude skills

\`\`\`bash
node ~/.cursor/skills/_port-from-claude.mjs
\`\`\`

Source of truth remains \`~/.cursor/skills\` (git: claude-skills repo).
`;

fs.writeFileSync(path.join(DST, "README.md"), readme);
console.log("\nDone:", skills.length, "skills →", DST);
