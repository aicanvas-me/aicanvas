import { hostedMcpOAuthEnabled } from '../../../lib/flags'
import { HOSTED_MCP_URL } from '../../lib/hosted-mcp'
import { pageMetadata } from '../../lib/page-metadata'
import { ConnectAgentCard } from '../../mcp/ConnectAgentCard'
import { CopyBlock } from '../_components/CopyBlock'
import { A, C, DocPage, H2, H3, Note, OL, P, Table, UL } from '../_components/DocsKit'
import { Tabs } from '../_components/Tabs'

export const metadata = pageMetadata({
  title: 'MCP Server Docs: Connect Claude Code, Codex and Cursor to AI Canvas',
  social: 'AI Canvas MCP server docs',
  description:
    'Set up @aicanvas/mcp in Claude Code, Codex, Cursor or Claude Desktop. Your agent searches, reads, plans and installs AI Canvas components and design systems from the chat.',
  url: '/docs/mcp',
})

// The sign-in sections exist only while HOSTED_MCP_OAUTH is on; off, the page is the npm docs alone.
const HOSTED_TOC = [
  { id: 'sign-in', title: 'Connect with sign-in' },
  { id: 'your-account', title: 'Your account stays yours' },
  { id: 'ci', title: 'No browser? CI and remote shells' },
  { id: 'stuck', title: 'Stuck signed out?' },
  { id: 'what-we-store', title: 'What we store' },
]

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
  const hosted = hostedMcpOAuthEnabled()
  return (
    <DocPage
      href="/docs/mcp"
      title="MCP server"
      lead={
        hosted
          ? 'Connect your agent with one address and a browser sign-in, or run @aicanvas/mcp on your machine. Either way it searches, reads and installs AI Canvas components and design systems without leaving the chat.'
          : '@aicanvas/mcp lets your agent search, read and install AI Canvas components and design systems without leaving the chat.'
      }
      toc={hosted ? [...HOSTED_TOC, ...TOC.map((t) => (t.id === 'quick-start' ? { ...t, title: 'Run it locally with npm' } : t))] : TOC}
    >
      <P>
        The server speaks the Model Context Protocol (MCP), the standard AI coding tools use to reach outside data. It reads the live
        registry, so new components show up within minutes with no update.{' '}
        {hosted
          ? 'Every tool only reads, except disconnect, which ends your own agent\'s connection.'
          : <>Every tool is read-only: nothing changes on AI Canvas&apos;s side.</>}
      </P>

      {hosted && (
        <>
          <H2 id="sign-in">Connect with sign-in</H2>
          <P>Add this address to your agent. It speaks Streamable HTTP. Sign-in is in beta.</P>
          <CopyBlock label="server address" code={HOSTED_MCP_URL} />
          <OL>
            <li>Add the address to your agent.</li>
            <li>
              Your browser opens when the agent connects, or when you click its Connect button (in Cursor: Settings, Tools &amp;
              MCPs). Sign in to AI Canvas or create a free account, then click Allow right away: some agents stop waiting in less than a
              minute.
            </li>
            <li>Ask for what you want in plain words.</li>
          </OL>
          <div className="mt-6">
            <ConnectAgentCard heading={false} showDocsLink={false} />
          </div>

          <H2 id="your-account">Your account stays yours</H2>
          <P>
            Your agent gets its own sign-in. It never gets your password or your browser session. It cannot change your account, your
            password or your plan, and it cannot buy anything.
          </P>
          <P>
            Each sign-in lasts an hour and renews itself until you disconnect the agent. You get an email when a new agent connects.
          </P>
          <P>
            See and disconnect every agent in <A href="/account/settings">Settings, Connected AI agents</A>. An agent can also
            disconnect itself with the <C>disconnect</C> tool.
          </P>

          <H2 id="ci">No browser? CI and remote shells</H2>
          <P>
            Send your API key to the same address as the header <C>Authorization: Bearer &lt;your key&gt;</C>. Get or rotate the key
            in <A href="/account/settings">Account settings</A>. Store it as a secret in your CI, never in git. Use either the browser
            sign-in or the header, never both: a saved header overrides the sign-in, so every call would fail.
          </P>
          <CopyBlock
            title="Claude Code"
            label="Claude Code command with a key"
            code={`claude mcp add --transport http --scope user aicanvas ${HOSTED_MCP_URL} --header "Authorization: Bearer aic_your_key"`}
          />

          <H2 id="stuck">Stuck signed out?</H2>
          <P>AI Canvas tools may stop answering, or your agent may say it is not authorized. Possible causes:</P>
          <UL>
            <li>You disconnected the agent in settings.</li>
            <li>
              The sign-in took longer than your agent waits. Some wait less than a minute. If the browser says it cannot reach localhost
              after you click Allow, your agent had already stopped waiting.
            </li>
            <li>The browser says &ldquo;This sign-in request has ended&rdquo; because the request expired or was already answered.</li>
            <li>
              The browser says &ldquo;Your AI agent needs to connect again&rdquo;: its saved connection is no longer valid. Starting
              again reuses it, so remove the server from your agent and add it again.
            </li>
            <li>If you use the header method, you rotated your API key.</li>
          </UL>
          <P>
            To fix it, start the sign-in again from your agent. For Claude Code, run <C>claude mcp login aicanvas</C>. For Codex, run{' '}
            <C>codex mcp login aicanvas</C>. In other agents, use the reconnect or sign-in action, or remove the server and add it
            again. If you are already signed in to aicanvas.me in that browser, it goes straight to Allow. For the header method, copy
            your new key.
          </P>
          <P>
            In Cursor, click Authenticate when it appears in the chat, or open Cursor Settings, Tools &amp; MCPs and click Connect
            next to aicanvas. Until you sign in again it shows Error there: click Logout, then Connect. If the Error stays after
            that, quit Cursor and open it again.
          </P>
          <P>
            Codex does not open the sign-in by itself: its AI Canvas tools answer &ldquo;Authentication required&rdquo;. Run{' '}
            <C>codex mcp login aicanvas</C> in a terminal, then click Allow.
          </P>

          <H2 id="what-we-store">What we store</H2>
          <P>
            For each connected agent, we store its name, the address it returns to after sign-in, when it connected, when it was last
            used, and the country of the browser and the agent. Sign-in tokens are stored only as hashes. Disconnecting deletes the
            connection. Read the <A href="/privacy">Privacy Policy</A>.
          </P>
        </>
      )}

      <H2 id="quick-start">{hosted ? 'Run it locally with npm' : 'Quick start'}</H2>
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
                <P>Run this in any terminal → works in every project</P>
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
                  Add the <C>aicanvas</C> entry to <C>~/.cursor/mcp.json</C> → Cursor Settings → Tools &amp; MCPs → <C>aicanvas</C>{' '}
                  on. Your token stays in your home folder, out of git. One click instead: the <A href="/mcp">MCP page</A>.
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
      <P>Start every prompt with &ldquo;use the aicanvas MCP&rdquo;. Agents often skip MCP tools and search the web unless you name them.</P>
      <CopyBlock wrap label="test prompt" code="Use the aicanvas MCP to list the component categories." />
      <P>It should list the categories with their counts. Then try:</P>
      <UL>
        <li>&quot;Use the aicanvas MCP to find a navbar and install it.&quot;</li>
        <li>&quot;Use the aicanvas MCP to plan a settings page from Andromeda Pro, then build it.&quot;</li>
        <li>&quot;Use the aicanvas MCP to check the components in this file against their props.&quot;</li>
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
        rows={[[<C key="1">get_install_command</C>, 'The shadcn command for one standalone or design-system component. Whole systems and templates list theirs in get_system and get_template.']]}
      />
      <H3>Icons</H3>
      <Table
        head={['Tool', 'What it does']}
        rows={[
          [<C key="1">search_icons</C>, 'Finds icons by name, tag or category, best match first.'],
          [<C key="2">get_icon_install</C>, 'The shadcn command, import line and JSX for one icon in one style.'],
        ]}
      />
      {hosted && (
        <>
          <H3>Account (sign-in only)</H3>
          <Table
            head={['Tool', 'What it does']}
            rows={[
              [<C key="1">whoami</C>, 'The connected AI Canvas account, its plan and what that plan can install.'],
              [<C key="2">disconnect</C>, 'Ends this agent\'s connection when you ask it to sign out.'],
            ]}
          />
        </>
      )}
      <P>
        The best order for a new page: <C>compose_page</C> to plan, <C>get_component_props</C> before writing each component,{' '}
        <C>validate_usage</C> on the finished file, <C>get_audit_checklist</C> before calling it done.
      </P>

      <H2 id="accounts">Accounts and Premium</H2>
      <UL>
        <li>Browsing, search, props and install commands need no account.</li>
        <li>Reading source needs a free account: set <C>AICANVAS_TOKEN</C>.</li>
        <li>Premium design systems and templates need an account with <A href="/pricing">Premium</A>.</li>
        <li>Icons in the Line style install with a free account. Duotone, Solid and Solid duotone need Premium.</li>
        {hosted && (
          <li>
            With sign-in, your plan comes along: Premium items show as locked with an upgrade link, and upgrading unlocks them on the
            same connection. There is no daily request limit.
          </li>
        )}
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
        <C>npx</C> can reuse a copy it cached earlier. To always start the newest version, use <C>@aicanvas/mcp@latest</C> in the
        command. The package is on <A href="https://www.npmjs.com/package/@aicanvas/mcp">npm</A>.
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
