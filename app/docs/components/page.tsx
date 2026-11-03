import { pageMetadata } from '../../lib/page-metadata'
import { CopyBlock } from '../_components/CopyBlock'
import { A, C, DocPage, H2, P, UL } from '../_components/DocsKit'

export const metadata = pageMetadata({
  title: 'Standalone Components: React Effects and Widgets for Any Project',
  social: 'AI Canvas standalone components',
  description:
    'Standalone AI Canvas components belong to no design system: backgrounds, 3D, motion and text effects, cards and widgets, installed as editable React source with shadcn.',
  url: '/docs/components',
})

const TOC = [
  { id: 'what-they-are', title: 'What they are' },
  { id: 'the-component-page', title: 'The component page' },
  { id: 'install', title: 'Install' },
  { id: 'props', title: 'Props' },
  { id: 'stack', title: 'Stack' },
]

export default function StandaloneDocsPage() {
  return (
    <DocPage
      href="/docs/components"
      title="Standalone components"
      lead="Effects and widgets that belong to no design system, so they drop into any project, next to any system."
      toc={TOC}
    >
      <H2 id="what-they-are">What they are</H2>
      <P>
        Standalone components and blocks are single files: backgrounds, glass, 3D and shaders, typography and motion effects, plus
        cards, buttons, navigation and widgets. Each one has its own look and is meant to be recoloured, retimed or rebuilt for your
        project. Browse them in <A href="/components">Components &amp; blocks</A>.
      </P>

      <H2 id="the-component-page">The component page</H2>
      <UL>
        <li>A live preview, in light and dark where the component supports both.</li>
        <li>Copy Command: the install command, with your token when you are signed in.</li>
        <li>The source and a Manual tab with its packages, public for every free component.</li>
        <li>The props table, when the component takes props.</li>
        <li>Remix with AI, when the component has a remix prompt. See <A href="/docs/remix-prompts">Remix prompts</A>.</li>
      </UL>

      <H2 id="install">Install</H2>
      <CopyBlock code="npx shadcn@latest add @aicanvas/<name>" label="install command" />
      <P>
        The file lands at <C>components/aicanvas/&lt;name&gt;.tsx</C> and exports the component as its default export. Installs need a
        free account; Premium components need <A href="/pricing">Premium</A>. Setup is in{' '}
        <A href="/docs/installation">Installation</A>.
      </P>

      <H2 id="props">Props</H2>
      <P>
        Documented props come from each component&apos;s own source comments, so they match the code. They are on the component page,
        in one file for agents at <C>/r/aicanvas-props.json</C>, and through the MCP tool <C>get_component_props</C>. See{' '}
        <A href="/docs/agent-files">Files for agents</A>.
      </P>

      <H2 id="stack">Stack</H2>
      <P>
        React with TypeScript, Tailwind CSS v4 and Framer Motion, with Three.js in some 3D components. Icons come from Phosphor. The
        CLI installs whichever of these a component needs.
      </P>
    </DocPage>
  )
}
