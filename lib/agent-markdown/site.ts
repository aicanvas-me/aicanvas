/**
 * Markdown twins of the site-level pages: the home page and /mcp.
 *
 * Pure builders like ./component.ts: the routes in app/md/* pass the live
 * data in. Copy rules that apply here:
 *   - Lead with the design systems, free (MIT) one first, never with Premium.
 *   - The standalone components belong to NO design system; say "standalone".
 *   - The MCP server is read-only: it returns install commands, it never
 *     installs anything itself.
 */

/** The read-only tools @aicanvas/mcp exposes. llms.txt lists the same set. */
export const MCP_TOOLS = [
  'list_categories',
  'list_components',
  'search_components',
  'get_component',
  'get_component_props',
  'get_install_command',
  'list_systems',
  'get_system',
  'list_templates',
  'get_template',
  'validate_usage',
  'compose_page',
  'get_audit_checklist',
  'search_icons',
  'get_icon_install',
] as const

export const MCP_PACKAGE = '@aicanvas/mcp'
export const MCP_SERVER_NAME = 'aicanvas'

function pointer(siteUrl: string): string {
  return `> Markdown version of an AI Canvas page, for AI agents. Full index and install setup: ${siteUrl}/llms.txt`
}

export interface HomeSystem {
  slug: string
  name: string
  /** Premium to install (Andromeda Pro). */
  paid: boolean
  componentCount: number
  templateCount: number
  /** Who may install the whole system, from the /r gate's classifier. */
  installTier: string
}

export function homeMarkdown(input: {
  siteUrl: string
  systems: HomeSystem[]
  standaloneCount: number
}): string {
  const { siteUrl } = input
  // Free system first: the copy leads with what anyone can install.
  const systems = [...input.systems].sort((a, b) => Number(a.paid) - Number(b.paid))
  const systemLines = systems.map((s) => {
    const parts = [`${s.componentCount} components`]
    if (s.templateCount > 0) parts.push(`${s.templateCount} templates`)
    return `- [${s.name}](${siteUrl}/design-systems/${s.slug}.md): ${s.paid ? 'Premium' : 'Free, MIT'} design system, ${parts.join(', ')}. Install every component (${s.installTier}): \`npx shadcn@latest add @aicanvas/${s.slug}\`.`
  })

  return [
    pointer(siteUrl),
    '# AI Canvas',
    `AI Canvas is a shadcn-compatible registry of React design systems, standalone components, blocks and templates, built with Tailwind CSS and Motion, for AI agents, developers and designers. Everything installs as real, editable source with one shadcn CLI command, and AI agents can browse it through the AI Canvas MCP server.`,
    `## Design systems\n\nEach system is a set of tokens plus components that follow its rules, with templates built only from those components.\n\n${systemLines.join('\n')}`,
    `## Standalone components and blocks\n\nStandalone React components and page-section blocks (${input.standaloneCount} in all) that belong to no design system, fit any of them, and drop into any React + Tailwind app. Free ones are MIT; Premium ones need Premium to install.\n\n- [All standalone components and blocks](${siteUrl}/components.md)`,
    `## Install\n\n${'```bash'}\nnpx shadcn@latest add @aicanvas/<slug>\n${'```'}\n\nOne-command installs need a free AI Canvas account; Premium items need Premium. Token setup: the Install section of ${siteUrl}/llms.txt.`,
    `## For AI agents\n\n- [MCP server](${siteUrl}/mcp.md): \`npx -y ${MCP_PACKAGE}\`, read-only tools to search the catalog and get install commands.\n- [llms.txt](${siteUrl}/llms.txt): the full index, install setup and the public JSON read API.\n- [Registry index](${siteUrl}/r/registry.json): every installable item as shadcn registry JSON.`,
  ].join('\n\n') + '\n'
}

/**
 * The /mcp twin. `hostedUrl` is the hosted server's address while its browser sign-in is
 * on (the page shows the connect card then); null keeps the twin to the npm server.
 */
export function mcpMarkdown(input: { siteUrl: string; hostedUrl: string | null }): string {
  const { siteUrl, hostedUrl } = input
  const fence = (lang: string, body: string) => `${'```'}${lang}\n${body}\n${'```'}`
  const npmJson = (shape: 'cursor' | 'vscode') =>
    JSON.stringify(
      shape === 'cursor'
        ? { mcpServers: { [MCP_SERVER_NAME]: { command: 'npx', args: ['-y', MCP_PACKAGE] } } }
        : { servers: { [MCP_SERVER_NAME]: { type: 'stdio', command: 'npx', args: ['-y', MCP_PACKAGE] } } },
      null,
      2,
    )
  const ask = (who: string, prompt = `Use the ${MCP_SERVER_NAME} MCP: what can you add to my app?`) => `Then ask ${who}: "${prompt}"`

  const hosted = hostedUrl
    ? [
        `## Connect your AI agent (hosted, beta)\n\nAdd the hosted server at \`${hostedUrl}\` (streamable HTTP) and sign in once in the browser: sign in to AI Canvas and click Allow. No key to copy.`,
        `### Claude Code\n\nRun this in any terminal. It works in every project.\n\n${fence('bash', `claude mcp add --transport http --scope user ${MCP_SERVER_NAME} ${hostedUrl}\nclaude mcp login ${MCP_SERVER_NAME}`)}\n\nYour browser opens: sign in and click Allow. ${ask('your agent')}`,
        `### Codex\n\n${fence('bash', `codex mcp add ${MCP_SERVER_NAME} --url ${hostedUrl}`)}\n\nThe browser opens: sign in, click Allow, and the terminal says "Successfully logged in". No browser, or "Authentication required" later: run \`codex mcp login ${MCP_SERVER_NAME}\`. ${ask('your agent')}`,
        `### ChatGPT\n\nChatGPT desktop app: Settings, Plugins, MCPs, Add, Add MCP server. Choose Streamable HTTP, name \`${MCP_SERVER_NAME}\`, address \`${hostedUrl}\`, token and headers empty. Then Authenticate next to ${MCP_SERVER_NAME}, sign in and click Allow. ChatGPT and Codex share one list, so a server added with the Codex command is already there.`,
        `### Claude app or claude.ai\n\nSettings, Customize, Connectors, Add, custom connector: name \`${MCP_SERVER_NAME}\`, address \`${hostedUrl}\`. Continue, keep the sign-in settings it detects, sign in and click Allow.`,
        `### Cursor\n\nAdd the \`${MCP_SERVER_NAME}\` entry to \`~/.cursor/mcp.json\` (it replaces the npm one):\n\n${fence('json', JSON.stringify({ mcpServers: { [MCP_SERVER_NAME]: { url: hostedUrl } } }, null, 2))}\n\nThen Cursor Settings, Tools & MCPs, Connect, sign in and click Allow within 30 seconds.`,
        `### VS Code\n\nAdd this to \`.vscode/mcp.json\` in your project and trust the folder:\n\n${fence('json', JSON.stringify({ servers: { [MCP_SERVER_NAME]: { type: 'http', url: hostedUrl } } }, null, 2))}\n\nClick Start above ${MCP_SERVER_NAME} in mcp.json, sign in in the browser and click Allow. ${ask('Copilot', `#${MCP_SERVER_NAME} what can you add to my app?`)}`,
        `### Any other AI agent\n\nAny AI agent that supports remote MCP servers works: add \`${hostedUrl}\`, and when it asks you to sign in, sign in to AI Canvas and click Allow.\n\nStuck, or setting up CI: ${siteUrl}/docs/mcp#sign-in`,
      ]
    : []

  return [
    pointer(siteUrl),
    '# AI Canvas MCP server',
    `The AI Canvas MCP connects Claude Code, Codex, Cursor and any other MCP client to AI Canvas: design systems, standalone components, blocks, templates and icons, with props, design specs and install commands. Its catalog tools are read-only: they return the install command, and the agent runs it. It reads the live registry at runtime, so new components reach it about five minutes after they ship.${hostedUrl ? ' Connect the hosted server with a browser sign-in, or run the npm package locally.' : ''}`,
    ...hosted,
    `## ${hostedUrl ? 'Run it locally with npm' : 'Install'}\n\n\`${MCP_PACKAGE}\` runs as a stdio server on your machine.\n\nClaude Code (user scope, every project):\n\n${fence('bash', `claude mcp add ${MCP_SERVER_NAME} --scope user -- npx -y ${MCP_PACKAGE}`)}\n\nCodex:\n\n${fence('bash', `codex mcp add ${MCP_SERVER_NAME} -- npx -y ${MCP_PACKAGE}`)}\n\nRestart Claude Code or Codex and \`${MCP_SERVER_NAME}\` loads.\n\nCursor: add this to \`~/.cursor/mcp.json\`, then turn \`${MCP_SERVER_NAME}\` on in Cursor Settings, Tools & MCPs.\n\n${fence('json', npmJson('cursor'))}\n\nVS Code: Command Palette, MCP: Open User Configuration, add this entry, then click Start above \`${MCP_SERVER_NAME}\`.\n\n${fence('json', npmJson('vscode'))}\n\nAny other MCP client: run \`npx -y ${MCP_PACKAGE}\` as a stdio server.`,
    `## Account token (npm)\n\nWithout a token the agent can browse and search, but installs write a placeholder instead of the source. A free account works. To let installs pull source, sign in at ${siteUrl}/account/settings, copy your token, and pass it to the server as the \`AICANVAS_TOKEN\` environment variable (for Claude Code: \`--env AICANVAS_TOKEN=<token>\` before \`--\`). Keep the token in your user configuration, out of files that are committed to git.`,
    `## What you get\n\n- One command, then forget it: after setup your agent searches, inspects and installs AI Canvas components on its own.\n- No more from-scratch UI: your agent pulls a real component with full source, the design spec and the motion included.\n- Always current: the server reads the live registry, so new components reach your agent about five minutes after they ship.\n- Works in the agent you use: Claude Code, Claude, ChatGPT, Codex, VS Code and Cursor, or any other client that speaks MCP.\n- A whole system in one call: ask for a design system and your agent gets every component plus the shared tokens in a single response.\n- Checks its own work: before it finishes, your agent can flag props that do not exist, required props it missed and values outside the allowed options, each with its line.`,
    `## Tools\n\n${MCP_TOOLS.map((t) => `- \`${t}\``).join('\n')}${hostedUrl ? `\n\nSigned in, the hosted server adds \`whoami\` (the account and plan this connection uses) and \`disconnect\` (ends this agent's connection to your account).` : ''}`,
    `## Try it\n\nAfter connecting, ask:\n\n- Use the ${MCP_SERVER_NAME} MCP to show me what categories of components are available.\n- Use the ${MCP_SERVER_NAME} MCP: add the task cards to my dashboard and match my dark theme.\n- Use the ${MCP_SERVER_NAME} MCP: my hero section feels boring, find something animated to fix it.\n- Use the ${MCP_SERVER_NAME} MCP to find me a good animated background for my landing page.`,
    `## More\n\n- Page: ${siteUrl}/mcp\n- Docs: ${siteUrl}/docs/mcp\n- Package: https://www.npmjs.com/package/${MCP_PACKAGE}\n- Full index: ${siteUrl}/llms.txt`,
  ].join('\n\n') + '\n'
}
