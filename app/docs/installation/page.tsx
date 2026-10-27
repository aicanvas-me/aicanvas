import { pageMetadata } from '../../lib/page-metadata'
import { CopyBlock } from '../_components/CopyBlock'
import { A, C, Cards, DocPage, H2, Note, P, Table, UL } from '../_components/DocsKit'

export const metadata = pageMetadata({
  title: 'Installation: Add AI Canvas Components With the shadcn CLI',
  social: 'Install AI Canvas',
  description:
    'Set up a React project with Tailwind CSS and shadcn, connect your free AI Canvas account, and install your first component or design system as editable source.',
  url: '/docs/installation',
})

const TOC = [
  { id: 'requirements', title: 'Requirements' },
  { id: 'set-up-shadcn', title: 'Set up shadcn' },
  { id: 'connect-your-account', title: 'Connect your account' },
  { id: 'install-a-component', title: 'Install a component' },
  { id: 'what-changed', title: 'What changed in your project' },
  { id: 'manual-install', title: 'Manual install' },
  { id: 'next-steps', title: 'Next steps' },
]

export default function InstallationPage() {
  return (
    <DocPage
      href="/docs/installation"
      title="Installation"
      lead="Set up a project once, then every component and design system installs with one command, by you or by your agent."
      toc={TOC}
    >
      <H2 id="requirements">Requirements</H2>
      <UL>
        <li>A React project with TypeScript. Components are built for the Next.js App Router and work in any modern React setup.</li>
        <li>Tailwind CSS v4.</li>
        <li>Node.js, to run the shadcn CLI with <C>npx</C>.</li>
        <li>A free AI Canvas account, to install. Browsing, previews and free source need no account.</li>
      </UL>

      <H2 id="set-up-shadcn">Set up shadcn</H2>
      <P>
        AI Canvas installs through the shadcn CLI. If your project has no <C>components.json</C> yet, run this in the project root and
        answer its questions:
      </P>
      <CopyBlock code="npx shadcn@latest init" label="init command" />
      <P>
        Starting from nothing? Follow the{' '}
        <A href="https://ui.shadcn.com/docs/installation">shadcn installation guide</A> for your framework first, then come back.
      </P>

      <H2 id="connect-your-account">Connect your account</H2>
      <P>
        Installs need a free account. There are two ways to send it with each install:
      </P>
      <UL>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">From a component page.</strong> Sign in, open any component and click
          Copy Command. The command it copies already carries your token.
        </li>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">Once per project.</strong> Add your token to{' '}
          <C>components.json</C>, and every plain <C>@aicanvas/...</C> command is authenticated. See{' '}
          <A href="/docs/components-json">components.json</A>.
        </li>
      </UL>
      <Note>
        Signed out, the command still finishes without an error, but it writes a short placeholder file titled &quot;(free account
        required)&quot; instead of the component. If you see that title, connect your account and run the command again.
      </Note>

      <H2 id="install-a-component">Install a component</H2>
      <P>Every install uses the same shape. Swap in the name from the component&apos;s page:</P>
      <CopyBlock code="npx shadcn@latest add @aicanvas/<name>" label="install command" />
      <P>The CLI fetches the source, installs the npm packages it needs and writes the files into your project. Then import it:</P>
      <CopyBlock
        title="app/page.tsx"
        label="example"
        code={`import AiJobCards from '@/components/aicanvas/ai-job-cards'

export default function Page() {
  return <AiJobCards />
}`}
      />
      <P>
        The import path follows the aliases in your <C>components.json</C>. If your project uses a different alias than{' '}
        <C>@/</C>, use yours.
      </P>

      <H2 id="what-changed">What changed in your project</H2>
      <Table
        head={['You installed', 'Files land in']}
        rows={[
          ['A standalone component', <C key="s">components/aicanvas/&lt;name&gt;.tsx</C>],
          ['A design system or one of its components', <C key="d">components/aicanvas/&lt;system&gt;/...</C>],
          ['An AI Brain', <C key="b">design-systems/&lt;system&gt;/...</C>],
        ]}
      />
      <P>
        The CLI also adds the component&apos;s npm packages to <C>package.json</C>, for example <C>framer-motion</C> or{' '}
        <C>@phosphor-icons/react</C>. Nothing else in your project is touched. The files are yours: edit them like any other code.
      </P>

      <H2 id="manual-install">Manual install</H2>
      <P>
        Prefer to copy by hand? Every free component page has a Manual tab with the packages to install and the full source. Copy
        the file into your project and install the packages it lists.
      </P>

      <H2 id="next-steps">Next steps</H2>
      <Cards
        items={[
          { title: 'Design systems', href: '/docs/design-systems', body: 'Install a whole system and reshape it with tokens.' },
          { title: 'MCP server', href: '/docs/mcp', body: 'Let your agent search and install for you.' },
        ]}
      />
    </DocPage>
  )
}
