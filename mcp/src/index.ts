#!/usr/bin/env node
/**
 * AI Canvas MCP server
 * --------------------
 * Exposes the AI Canvas standalone component registry to AI editors
 * (Claude Code, Cursor, Claude Desktop, Codex). The AI can search,
 * inspect, and install components without leaving the chat.
 *
 * Data flow:
 *   - aicanvas.me/r/aicanvas-mcp.json   → metadata for the 80+ standalone
 *     components plus the Andromeda design system, its components, and templates
 *   - aicanvas.me/r/aicanvas-props.json → the documented props per component
 *   - aicanvas.me/r/<slug>.json         → full source code per component
 *
 * Both are static files, served from Vercel's CDN. Stateless server.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer } from './tools.js'

// ── Configuration ────────────────────────────────────────────────────────────

const REGISTRY_BASE =
  process.env.AICANVAS_REGISTRY_BASE ?? 'https://aicanvas.me/r'
const MCP_VERSION = '0.3.1'
const USER_AGENT = `aicanvas-mcp/${MCP_VERSION}`
// Optional per-user token (the website bakes it into the copied MCP config).
// Identifies the account so free-component source pulls are authorized and any
// premium content you own unlocks. Absent = anonymous: metadata browsing still
// works, but source pulls of free components need a free account.
const USER_TOKEN = process.env.AICANVAS_TOKEN ?? ''

function registryHeaders(): Record<string, string> {
  return {
    Accept: 'application/json',
    'User-Agent': USER_AGENT,
    ...(USER_TOKEN ? { Authorization: `Bearer ${USER_TOKEN}` } : {}),
  }
}

const server = createServer(
  {
    registryBase: REGISTRY_BASE,
    token: USER_TOKEN,
    // A token pasted into a config goes stale when the user rotates it.
    probeBeforeInstall: true,
    fetchRegistry: (file, opts) =>
      fetch(`${REGISTRY_BASE}/${file}`, {
        headers: opts?.probe ? { ...registryHeaders(), 'X-AICanvas-Probe': '1' } : registryHeaders(),
      }),
  },
  { version: MCP_VERSION },
)

// ── Boot ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // stdio transport runs forever — closes when host kills stdin
}

main().catch((err) => {
  // stderr only — stdout is reserved for JSON-RPC
  console.error('aicanvas-mcp fatal:', err)
  process.exit(1)
})
