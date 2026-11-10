import { pageMetadata } from '../lib/page-metadata'
import { AI_CANVAS_DEFINITION } from '../lib/config'
import { A, C, Cards, DocPage, H2, P, UL } from './_components/DocsKit'

export const metadata = pageMetadata({
  title: 'Docs: Design Systems and Components for AI Agents',
  social: 'AI Canvas docs',
  description:
    'How AI Canvas works: design systems your agent builds with, standalone React components, the shadcn registry, the MCP server and the AI Brain.',
  url: '/docs',
})

const TOC = [
  { id: 'what-you-get', title: 'What you get' },
  { id: 'how-it-works', title: 'How it works' },
  { id: 'principles', title: 'Principles' },
  { id: 'start-here', title: 'Start here' },
]

export default function DocsIntroPage() {
  return (
    <DocPage
      href="/docs"
      title="Introduction"
      lead="No more AI slop. AI Canvas gives your coding agent a real design system to build with, and you get editable source you own."
      toc={TOC}
    >
      <P>{AI_CANVAS_DEFINITION}</P>

      <H2 id="what-you-get">What you get</H2>
      <UL>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">Design systems.</strong> A token file for colour, type and spacing, the
          components that follow it, and templates built from them. Change a token and every component follows.
        </li>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">The AI Brain.</strong> Rule files that live in your project and tell your
          agent how the system is built, so new screens stay consistent with the rest.
        </li>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">Standalone components.</strong> Backgrounds, 3D, motion and text effects,
          cards, buttons and widgets that belong to no system and drop into any project.
        </li>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">An MCP server.</strong> Your agent searches, reads and installs everything
          above from the chat.
        </li>
      </UL>

      <H2 id="how-it-works">How it works</H2>
      <P>
        Everything is published as a <A href="https://ui.shadcn.com/docs/registry">shadcn registry</A> under the{' '}
        <C>@aicanvas</C> namespace. One command copies the real source into your project, with its dependencies:
      </P>
      <P>
        <C>npx shadcn@latest add @aicanvas/&lt;name&gt;</C>
      </P>
      <P>
        Nothing is installed as a package you cannot open. The files land in your codebase, so you or your agent can edit, rename,
        restyle or delete them. Your agent can run the same command itself, or reach the registry through the{' '}
        <A href="/docs/mcp">MCP server</A>.
      </P>

      <H2 id="principles">Principles</H2>
      <UL>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">Open code.</strong> You get source, not a black box. Free components and
          Andromeda Legacy are MIT and their source is always public; the Line icons they use are free under the AI Canvas Premium License, with a one-line credit kept in the code.
        </li>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">Systems before snippets.</strong> An agent builds better when it starts from
          one coherent system instead of mixing unrelated components.
        </li>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">Readable by agents.</strong> Rules, props and indexes are plain files an
          agent can read: the AI Brain, <C>llms.txt</C> and a props file for every component.
        </li>
        <li>
          <strong className="text-sand-900 dark:text-sand-50">Yours to reshape.</strong> Tokens, components and rules are all editable, so
          the system becomes your project&apos;s own.
        </li>
      </UL>

      <H2 id="start-here">Start here</H2>
      <Cards
        items={[
          { title: 'Installation', href: '/docs/installation', body: 'Set up a project and install your first component.' },
          { title: 'Design systems', href: '/docs/design-systems', body: 'Install a whole system, or start from its tokens.' },
          { title: 'MCP server', href: '/docs/mcp', body: 'Connect Claude Code, Codex or Cursor in one step.' },
          { title: 'Licences and plans', href: '/docs/licensing', body: 'What is MIT, what is free to use and what comes with Premium.' },
        ]}
      />
    </DocPage>
  )
}
