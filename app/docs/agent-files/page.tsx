import { pageMetadata } from '../../lib/page-metadata'
import { A, C, DocPage, H2, P, Table } from '../_components/DocsKit'

export const metadata = pageMetadata({
  title: 'Files for AI Agents: llms.txt, Registry Index and Props',
  social: 'AI Canvas files for agents',
  description:
    'The plain files AI agents read to understand AI Canvas: llms.txt, llms-full.txt, the shadcn registry index, every registry item and one props file for all components.',
  url: '/docs/agent-files',
})

const TOC = [
  { id: 'the-files', title: 'The files' },
  { id: 'llms-txt', title: 'llms.txt' },
  { id: 'registry', title: 'The registry' },
  { id: 'props-file', title: 'The props file' },
]

export default function AgentFilesDocPage() {
  return (
    <DocPage
      href="/docs/agent-files"
      title="Files for agents"
      lead="Everything on AI Canvas is also published as plain files, so an agent can read the catalog without a browser."
      toc={TOC}
    >
      <H2 id="the-files">The files</H2>
      <Table
        head={['File', 'What is in it']}
        rows={[
          [<A key="1" href="/llms.txt">/llms.txt</A>, 'A short index: what AI Canvas is, how to install, every component and system with one line each.'],
          [<A key="2" href="/llms-full.txt">/llms-full.txt</A>, 'The long version, for an agent that wants everything in one read.'],
          [<A key="3" href="/r/registry.json">/r/registry.json</A>, 'The shadcn registry index: every item, its files and its packages.'],
          [<C key="4">/r/&lt;name&gt;.json</C>, 'One registry item, the file the shadcn CLI installs.'],
          [<A key="5" href="/r/aicanvas-props.json">/r/aicanvas-props.json</A>, 'The documented props of every component in one file.'],
        ]}
      />

      <H2 id="llms-txt">llms.txt</H2>
      <P>
        <C>llms.txt</C> follows the <A href="https://llmstxt.org">llms.txt convention</A>: a Markdown index an AI model can read in
        one go. Ours opens with what AI Canvas is and how to install, then lists the design systems with their install commands, the collections and
        every component. Point an agent at it when it needs to know what exists.
      </P>

      <H2 id="registry">The registry</H2>
      <P>
        <C>/r/registry.json</C> is a standard <A href="https://ui.shadcn.com/docs/registry">shadcn registry</A> index, so any tool
        that understands shadcn registries understands it. Each item&apos;s own file at <C>/r/&lt;name&gt;.json</C> carries its source.
        Source needs a free account; see <A href="/docs/components-json">components.json</A>.
      </P>

      <H2 id="props-file">The props file</H2>
      <P>
        <C>/r/aicanvas-props.json</C> holds every documented prop: name, type, whether it is required, its default and what it does.
        It is built from each component&apos;s own source comments, so it matches the code, and it needs no account. The{' '}
        <A href="/docs/mcp">MCP server</A> serves the same data through <C>get_component_props</C> and checks files against it with{' '}
        <C>validate_usage</C>.
      </P>
    </DocPage>
  )
}
