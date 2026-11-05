import { pageMetadata } from '../../lib/page-metadata'
import { CopyBlock } from '../_components/CopyBlock'
import { A, C, Cards, DocPage, H2, H3, P, Table, UL } from '../_components/DocsKit'

export const metadata = pageMetadata({
  title: 'Design Systems: Tokens, Components and Templates Your Agent Builds With',
  social: 'AI Canvas design systems',
  description:
    'Install an AI Canvas design system as editable source: its token file, every component, or the templates built from them. Change a token and the whole set follows.',
  url: '/docs/design-systems',
})

const TOC = [
  { id: 'whats-in-a-system', title: "What's in a system" },
  { id: 'the-systems', title: 'The systems' },
  { id: 'install', title: 'Install' },
  { id: 'reshape-it', title: 'Reshape it' },
  { id: 'with-an-agent', title: 'Build with an agent' },
]

export default function DesignSystemsDocPage() {
  return (
    <DocPage
      href="/docs/design-systems"
      title="Design systems"
      lead="One token file, the components that follow it, and templates built from them. Your agent builds every new screen from the same parts."
      toc={TOC}
    >
      <H2 id="whats-in-a-system">What&apos;s in a system</H2>
      <UL>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">Tokens.</strong> One file defines every colour, spacing value, radius and
          font. Every component reads from it.
        </li>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">Components.</strong> The building blocks, from buttons and inputs to data
          tables and charts, each following the tokens.
        </li>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">Templates.</strong> Complete screens, such as dashboards and sign-in pages,
          built only from the system&apos;s components.
        </li>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">The AI Brain.</strong> Rule files that tell your agent how the system is
          meant to be used. See <A href="/docs/ai-brain">AI Brain</A>.
        </li>
      </UL>

      <H2 id="the-systems">The systems</H2>
      <Table
        head={['System', 'Licence', 'Install needs']}
        rows={[
          [
            <A key="p" href="/design-systems/andromeda-pro">Andromeda Pro</A>,
            'AI Canvas Premium License',
            'Free to explore; Premium to install',
          ],
          [
            <A key="l" href="/design-systems/andromeda">Andromeda Legacy</A>,
            'MIT',
            'Tokens: no account. Components: free account. Templates and AI Brain: Premium',
          ],
        ]}
      />
      <P>Both come in light and dark.</P>

      <H2 id="install">Install</H2>
      <P>
        Every system offers the same four installs. Replace <C>&lt;system&gt;</C> with <C>andromeda-pro</C> or <C>andromeda</C>.
      </P>
      <H3>Only the foundation</H3>
      <P>Tokens, utilities and the system icon. A good start when you build the components yourself.</P>
      <CopyBlock code="npx shadcn@latest add @aicanvas/<system>-tokens" label="tokens command" />
      <H3>One component</H3>
      <P>The component and the tokens it needs. The name is on the component&apos;s page, for example <C>andromeda-pro-accordion</C>.</P>
      <CopyBlock code="npx shadcn@latest add @aicanvas/<system>-<component>" label="component command" />
      <H3>Every component</H3>
      <CopyBlock code="npx shadcn@latest add @aicanvas/<system>" label="system command" />
      <H3>Every component and the templates</H3>
      <CopyBlock code="npx shadcn@latest add @aicanvas/<system>-all" label="full system command" />
      <P>
        Files land in <C>components/aicanvas/&lt;system&gt;/</C>, keeping the system&apos;s own folder layout so its imports keep
        working. A single template installs the same way with its own name, shown on the template&apos;s page.
      </P>

      <H2 id="reshape-it">Reshape it</H2>
      <P>
        The system is your code once it is installed. Change a token for colour, type or spacing and every component follows. Edit
        or replace any component, or ask your agent for new ones. With the AI Brain in the project, new parts stay consistent with
        the rest.
      </P>

      <H2 id="with-an-agent">Build with an agent</H2>
      <P>
        Give your agent the system, not loose components. With the <A href="/docs/mcp">MCP server</A> connected, ask it to plan the
        page first: it picks the closest template, one component per part, and installs the tokens before anything else.
      </P>
      <Cards
        items={[
          { title: 'AI Brain', href: '/docs/ai-brain', body: 'The rules your agent reads before it builds.' },
          { title: 'MCP server', href: '/docs/mcp', body: 'Plan, install and check from the chat.' },
        ]}
      />
    </DocPage>
  )
}
