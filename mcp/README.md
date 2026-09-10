# `@aicanvas/mcp`

<a href="https://mcpservers.org/servers/uinerd16/aicanvas"><img src="https://raw.githubusercontent.com/aicanvas-me/aicanvas/main/assets/readme-buttons/btn-mcpservers-sm.png" alt="Listed on mcpservers.org" width="167" height="28" /></a>

Model Context Protocol server for [AI Canvas](https://aicanvas.me). Lets your AI editor (Claude Code, Cursor, Claude Desktop, Codex) discover and install AI Canvas components without leaving the chat.

```
You:   "find me an animated card stack"
AI:    [calls search_components → ranks matches → picks polaroid-stack]
       [calls get_install_command → returns: npx shadcn add @aicanvas/polaroid-stack]
       [runs the command — file lands in your project]
You:   "make the rotation more dramatic"
AI:    [edits the file directly]
```

## What it exposes

Nine tools, derived from the live [aicanvas.me](https://aicanvas.me) registry. Adding a component to the website auto-updates the MCP within minutes. The registry holds 80+ standalone components, plus the Andromeda design system with its own components and templates.

| Tool | Purpose |
|---|---|
| `list_categories` | Show every category with component counts. Orient before drilling in. |
| `list_components` | Browse standalone components, optionally filtered by category. Paginated. |
| `search_components` | Fuzzy keyword search across standalone AND design-system components (slugs, names, descriptions, categories, tags). Ranked results. |
| `get_component` | Full metadata plus complete `.tsx` source code for one component. Resolves both standalone slugs and design-system component slugs (e.g. `andromeda-heat-grid`). |
| `get_install_command` | Get the `npx shadcn add @aicanvas/<slug>` command for any standalone or design-system component. |
| `list_systems` | List the design systems available (e.g. Andromeda), with component and template counts. |
| `get_system` | Every file for a whole design system, plus its shared tokens, its component install commands, and the dependency chain. |
| `list_templates` | List the ready-made templates (complete example screens), optionally filtered by design system. |
| `get_template` | Every file for a single template (a ready-made composition), with the registry dependencies it pulls in. |

All tools are read-only. Nothing is mutated on AI Canvas's side.

Standalone components and design-system components are kept in separate buckets. `list_components` and `list_categories` cover the 80+ standalones only, so the catalog stays clean. Design-system components are reached through `list_systems` / `get_system`, and are also resolvable by slug through `get_component`, `get_install_command`, and `search_components`.

## Setup

### Claude Desktop

Edit `claude_desktop_config.json`:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "aicanvas": {
      "command": "npx",
      "args": ["-y", "@aicanvas/mcp"]
    }
  }
}
```

Restart Claude Desktop. The `aicanvas` tools should appear in the tools list.

### Cursor

Project-level (`.cursor/mcp.json` in your repo) or global (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "aicanvas": {
      "command": "npx",
      "args": ["-y", "@aicanvas/mcp"]
    }
  }
}
```

### Claude Code

Project-level `.mcp.json` (committed alongside your code):

```json
{
  "mcpServers": {
    "aicanvas": {
      "command": "npx",
      "args": ["-y", "@aicanvas/mcp"]
    }
  }
}
```

Or via the CLI:

```bash
claude mcp add aicanvas -- npx -y @aicanvas/mcp
```

### Codex

`~/.codex/config.toml`:

```toml
[mcp_servers.aicanvas]
command = "npx"
args = ["-y", "@aicanvas/mcp"]
```

## Verify it works

Inside any of the AI editors above, ask:

> "What categories of components does AI Canvas have?"

You should see all 11 categories with counts. If you don't, check the host's MCP logs. Typically a "Failed to spawn process" or network error means npx couldn't fetch the package, or the host wasn't restarted after editing the config.

To inspect the server outside an editor:

```bash
npx -y @modelcontextprotocol/inspector npx -y @aicanvas/mcp
```

This opens a browser UI where you can call each tool by hand.

## Configuration

| Env var | Default | What it does |
|---|---|---|
| `AICANVAS_REGISTRY_BASE` | `https://aicanvas.me/r` | Registry root URL. Override only for local development against a self-hosted mirror. |
| `AICANVAS_TOKEN` | _(none)_ | Optional per-account token. The website bakes it into the MCP config it gives you. It identifies your AI Canvas account so source pulls are authorized and any premium content you own unlocks. Sent as a `Bearer` token on every registry request. Without it you are anonymous: metadata browsing still works, but pulling a component's source returns a short "create a free account" notice instead of the code. |

### Accounts and premium content

Browsing metadata (`list_categories`, `list_components`, `search_components`, `list_systems`, `list_templates`, `get_install_command`) is free and needs no account. Pulling actual source (`get_component`, `get_system`, `get_template`) runs against a free AI Canvas account: set `AICANVAS_TOKEN` from your account and the website gives you the ready-made config. Without a token, a free-component source pull returns a short "create a free account" notice instead of the code, and premium content (full design systems and templates) returns HTTP 402 with an upgrade link at [aicanvas.me/pricing](https://aicanvas.me/pricing). Update anytime with `npx @aicanvas/mcp@latest`.

## How the registry stays fresh

The MCP fetches `https://aicanvas.me/r/aicanvas-mcp.json` on first use and caches it for 5 minutes. New components on AI Canvas appear in the MCP automatically, no package update required.

The full source code for each component is fetched on demand from `/r/<slug>.json` (the same shadcn registry items the CLI installs).

## Local development

```bash
git clone https://github.com/aicanvas-me/aicanvas.git
cd aicanvas/mcp
npm install
npm run build

# Smoke-test against the deployed registry:
npm run inspect

# Or point at a locally running aicanvas dev server:
AICANVAS_REGISTRY_BASE=http://localhost:3000/r node dist/index.js
```

Edit `src/index.ts`, run `npm run build`, restart your AI editor.

## License

MIT, same as the AI Canvas project.
