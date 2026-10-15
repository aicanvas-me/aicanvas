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
    `## Standalone components and blocks\n\n${input.standaloneCount} animated components and page-section blocks that belong to no design system and drop into any React + Tailwind app. Free ones are MIT; Premium ones need a Premium subscription to install.\n\n- [All standalone components and blocks](${siteUrl}/components.md)`,
    `## Install\n\n${'```bash'}\nnpx shadcn@latest add @aicanvas/<slug>\n${'```'}\n\nOne-command installs need a free AI Canvas account; Premium items need a Premium subscription. Token setup: the Install section of ${siteUrl}/llms.txt.`,
    `## For AI agents\n\n- [MCP server](${siteUrl}/mcp.md): \`npx -y ${MCP_PACKAGE}\`, read-only tools to search the catalog and get install commands.\n- [llms.txt](${siteUrl}/llms.txt): the full index, install setup and the public JSON read API.\n- [Registry index](${siteUrl}/r/registry.json): every installable item as shadcn registry JSON.`,
  ].join('\n\n') + '\n'
}

export function mcpMarkdown(input: { siteUrl: string }): string {
  const { siteUrl } = input
  const cmd = (tool: 'claude' | 'codex') =>
    tool === 'claude'
      ? `claude mcp add ${MCP_SERVER_NAME} --scope user -- npx -y ${MCP_PACKAGE}`
      : `codex mcp add ${MCP_SERVER_NAME} -- npx -y ${MCP_PACKAGE}`
  const cursorConfig = JSON.stringify(
    { mcpServers: { [MCP_SERVER_NAME]: { command: 'npx', args: ['-y', MCP_PACKAGE] } } },
    null,
    2,
  )

  return [
    pointer(siteUrl),
    '# AI Canvas MCP server',
    `\`${MCP_PACKAGE}\` is an MCP server (stdio) that lets Claude Code, Codex, Cursor and any MCP client search the AI Canvas catalog: design systems, standalone components, blocks and templates, with props, design specs and install commands. It is read-only: it returns the install command, and the agent runs it. It reads the live registry at runtime, so new components reach it about five minutes after they ship.`,
    `## Install\n\nClaude Code (user scope, every project):\n\n${'```bash'}\n${cmd('claude')}\n${'```'}\n\nCodex:\n\n${'```bash'}\n${cmd('codex')}\n${'```'}\n\nCursor: add this to \`~/.cursor/mcp.json\`, then reload the window.\n\n${'```json'}\n${cursorConfig}\n${'```'}\n\nAny other MCP client: run \`npx -y ${MCP_PACKAGE}\` as a stdio server.`,
    `## Account token\n\nWithout a token the agent can browse and search, but installs write a placeholder instead of the source. To let installs pull source, sign in at ${siteUrl}/account/settings, copy your token, and pass it to the server as the \`AICANVAS_TOKEN\` environment variable (for Claude Code: \`--env AICANVAS_TOKEN=<token>\` before \`--\`). Keep the token out of files that are committed to git.`,
    `## Tools\n\n${MCP_TOOLS.map((t) => `- \`${t}\``).join('\n')}`,
    `## Try it\n\nAfter installing, restart the client and ask:\n\n- Use AI Canvas to show me what categories of components are available.\n- What's the best navbar component in AI Canvas? Install it for me.\n- I need an animated background for my landing page. Find me a good one in AI Canvas.`,
    `## More\n\n- Package: https://www.npmjs.com/package/${MCP_PACKAGE}\n- Page: ${siteUrl}/mcp\n- Full index: ${siteUrl}/llms.txt`,
  ].join('\n\n') + '\n'
}
