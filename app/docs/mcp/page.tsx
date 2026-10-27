import { pageMetadata } from '../../lib/page-metadata'
import { CopyBlock } from '../_components/CopyBlock'
import { A, C, DocPage, H2, H3, Note, P, Table, UL } from '../_components/DocsKit'
import { Tabs } from '../_components/Tabs'

export const metadata = pageMetadata({
  title: 'MCP Server Docs: Connect Claude Code, Codex and Cursor to AI Canvas',
  social: 'AI Canvas MCP server docs',
  description:
    'Set up @aicanvas/mcp in Claude Code, Codex, Cursor or Claude Desktop. Your agent searches, reads, plans and installs AI Canvas components and design systems from the chat.',
  url: '/docs/mcp',
})

const TOC = [
  { id: 'quick-start', title: 'Quick start' },
  { id: 'try-it', title: 'Try it' },
  { id: 'tools', title: 'Tools' },
  { id: 'accounts', title: 'Accounts and Premium' },
  { id: 'configuration', title: 'Configuration' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
]

const JSON_CONFIG = `{
  "mcpServers": {
    "aicanvas": {
      "command": "npx",
      "args": ["-y", "@aicanvas/mcp"],
      "env": { "AICANVAS_TOKEN": "your-token" }
    }
  }
}`

export default function McpDocsPage() {
  return (
    <DocPage
      href="/docs/mcp"
      title="MCP server"
      lead="@aicanvas/mcp lets your agent search, read and install AI Canvas components and design systems without leaving the chat."
      toc={TOC}
    >
      <P>
        The server speaks the Model Context Protocol (MCP), the standard AI coding tools use to reach outside data. It reads the live
        registry, so new components show up within minutes with no update. Every tool is read-only: nothing changes on AI
        Canvas&apos;s side.
      </P>

      <H2 id="quick-start">Quick start</H2>
      <P>
        Pick your agent. Replace <C>your-token</C> with the token from <A href="/account/settings">Account settings</A>, or sign in
        on the <A href="/mcp">MCP page</A> and copy a command with your token already in it.
      </P>
      <Tabs
        tabs={[
          {
            label: 'Claude Code',
            content: (
              <>
                <P>Run this in any terminal. With <C>--scope user</C> the server works in every project you open.</P>
                <CopyBlock
                  label="Claude Code command"
                  code="claude mcp add aicanvas --scope user --env AICANVAS_TOKEN=your-token -- npx -y @aicanvas/mcp"
                />
                <P>
                  Use <C>--scope project</C> to share it with your team through <C>.mcp.json</C>, or <C>--scope local</C> for only
                  you, in only this project.
                </P>
              </>
            ),
          },
          {
            label: 'Codex',
            content: (
              <>
                <P>Run this in any terminal. Codex registers the server for every project.</P>
                <CopyBlock
                  label="Codex command"
                  code="codex mcp add aicanvas --env AICANVAS_TOKEN=your-token -- npx -y @aicanvas/mcp"
                />
              </>
            ),
          },
          {
            label: 'Cursor',
            content: (
              <>
                <P>
                  Add the server to <C>~/.cursor/mcp.json</C> for every project, or <C>.cursor/mcp.json</C> for one, then restart
                  Cursor. The <A href="/mcp">MCP page</A> also has a one-click install.
                </P>
                <CopyBlock title="~/.cursor/mcp.json" label="Cursor config" code={JSON_CONFIG} />
              </>
            ),
          },
          {
            label: 'Claude Desktop',
            content: (
              <>
                <P>Add the server to <C>claude_desktop_config.json</C>, then restart Claude Desktop.</P>
                <UL>
                  <li>
                    macOS: <C>~/Library/Application Support/Claude/claude_desktop_config.json</C>
                  </li>
                  <li>
                    Windows: <C>%APPDATA%\Claude\claude_desktop_config.json</C>
                  </li>
                  <li>
                    Linux: <C>~/.config/Claude/claude_desktop_config.json</C>
                  </li>
                </UL>
                <CopyBlock title="claude_desktop_config.json" label="Claude Desktop config" code={JSON_CONFIG} />
              </>
            ),
          },
          {
            label: 'Other tools',
            content: (
              <>
                <P>
                  Any tool that runs MCP servers over stdio can start it with <C>npx -y @aicanvas/mcp</C>. Most take the same JSON
                  shape:
                </P>
                <CopyBlock title="mcp config" label="MCP config" code={JSON_CONFIG} />
              </>
            ),
          },
        ]}
      />

      <H2 id="try-it">Try it</H2>
      <P>Ask your agent:</P>
      <CopyBlock label="test prompt" code="What categories of components does AI Canvas have?" />
      <P>It should list the categories with their counts. Then try:</P>
      <UL>
        <li>&quot;Find a navbar in AI Canvas and install it.&quot;</li>
        <li>&quot;Plan a settings page from Andromeda Pro, then build it.&quot;</li>
        <li>&quot;Check the AI Canvas components in this file against their props.&quot;</li>
      </UL>

      <H2 id="tools">Tools</H2>
      <H3>Find</H3>
      <Table
        head={['Tool', 'What it does']}
        rows={[
          [<C key="1">list_categories</C>, 'Every category with its component count.'],
          [<C key="2">list_components</C>, 'Browse standalone components, optionally by category.'],
          [<C key="3">search_components</C>, 'Search standalone and design-system components by keyword.'],
          [<C key="4">list_systems</C>, 'The design systems, with component and template counts.'],
          [<C key="5">list_templates</C>, 'The ready-made screens, optionally by system.'],
        ]}
      />
      <H3>Read</H3>
      <Table
        head={['Tool', 'What it does']}
        rows={[
          [<C key="1">get_component</C>, 'Details and the full source of one component.'],
          [<C key="2">get_component_props</C>, 'The documented props of one component. No account needed.'],
          [<C key="3">get_system</C>, 'Every file of a design system, its tokens and its install commands.'],
          [<C key="4">get_template</C>, 'Every file of one template, with what it depends on.'],
        ]}
      />
      <H3>Plan and check</H3>
      <Table
        head={['Tool', 'What it does']}
        rows={[
          [<C key="1">compose_page</C>, 'Turns a one-line brief into a build plan: template, components, install order. Writes no code.'],
          [<C key="2">validate_usage</C>, 'Checks a file against the props of the components it uses, with line numbers.'],
          [<C key="3">get_audit_checklist</C>, 'The checklist to run on a finished page: install, props, both themes, small screens, keyboard.'],
        ]}
      />
      <H3>Install</H3>
      <Table
        head={['Tool', 'What it does']}
        rows={[[<C key="1">get_install_command</C>, 'The shadcn command for any component, system or template.']]}
      />
      <P>
        The best order for a new page: <C>compose_page</C> to plan, <C>get_component_props</C> before writing each component,{' '}
        <C>validate_usage</C> on the finished file, <C>get_audit_checklist</C> before calling it done.
      </P>

      <H2 id="accounts">Accounts and Premium</H2>
      <UL>
        <li>Browsing, search, props and install commands need no account.</li>
        <li>Reading source needs a free account: set <C>AICANVAS_TOKEN</C>.</li>
        <li>Premium design systems and templates need an account with <A href="/pricing">Premium</A>.</li>
      </UL>
      <P>
        Without a token, a source request returns a short note asking for a free account instead of the code.
      </P>

      <H2 id="configuration">Configuration</H2>
      <Table
        head={['Variable', 'Default', 'What it does']}
        rows={[
          [<C key="t">AICANVAS_TOKEN</C>, 'none', 'Your account token. Unlocks source, and Premium when your account has it.'],
          [
            <C key="r">AICANVAS_REGISTRY_BASE</C>,
            <C key="d">https://aicanvas.me/r</C>,
            'The registry root. Change it only to test against your own mirror.',
          ],
        ]}
      />
      <P>
        <C>npx -y @aicanvas/mcp</C> runs the latest published version each time your tool starts it. The package is on{' '}
        <A href="https://www.npmjs.com/package/@aicanvas/mcp">npm</A>.
      </P>

      <H2 id="troubleshooting">Troubleshooting</H2>
      <H3>The tools do not show up</H3>
      <P>
        Restart your tool after adding the server; most read their MCP list only at start. Check that Node.js is installed and that{' '}
        <C>npx</C> runs in a terminal.
      </P>
      <H3>&quot;Failed to spawn process&quot; or a network error</H3>
      <P>
        <C>npx</C> could not fetch the package. Check your connection or proxy, then restart the tool.
      </P>
      <H3>Source comes back as a sign-up note</H3>
      <P>
        The token is missing or wrong. Copy it again from <A href="/account/settings">Account settings</A> and update the{' '}
        <C>AICANVAS_TOKEN</C> value in your config.
      </P>
      <H3>Test the server on its own</H3>
      <P>This opens a browser window where you can call each tool by hand:</P>
      <CopyBlock label="inspector command" code="npx -y @modelcontextprotocol/inspector npx -y @aicanvas/mcp" />
      <Note>
        Prefer commands over chat? The same components install with the shadcn CLI. See <A href="/docs/installation">Installation</A>.
      </Note>
    </DocPage>
  )
}
