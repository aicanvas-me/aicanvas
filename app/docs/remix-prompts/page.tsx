import { pageMetadata } from '../../lib/page-metadata'
import { A, DocPage, H2, OL, P, Table } from '../_components/DocsKit'

export const metadata = pageMetadata({
  title: 'Remix Prompts: Rebuild a Component Variation in Any AI Tool',
  social: 'AI Canvas remix prompts',
  description:
    'Many AI Canvas components come with one detailed AI prompt written against their real source. Paste it into Claude, Cursor, ChatGPT or any AI tool to build your own variation.',
  url: '/docs/remix-prompts',
})

const TOC = [
  { id: 'what-it-is', title: 'What a remix prompt is' },
  { id: 'use-one', title: 'Use one' },
  { id: 'free-and-premium', title: 'Free and Premium' },
  { id: 'prompt-or-install', title: 'Prompt or install?' },
]

export default function RemixPromptsDocPage() {
  return (
    <DocPage
      href="/docs/remix-prompts"
      title="Remix prompts"
      lead="One detailed prompt per component, written against its real code, so any AI tool can build your own variation of it."
      toc={TOC}
    >
      <H2 id="what-it-is">What a remix prompt is</H2>
      <P>
        Many components come with one comprehensive prompt. It describes what the component looks like and how it works, from the
        setup and the constants to the motion, in words any AI coding tool understands. It is not tied to one tool: it works in
        Claude, Cursor, ChatGPT, Codex and the rest.
      </P>

      <H2 id="use-one">Use one</H2>
      <OL>
        <li>
          Open a component in <A href="/components">Components &amp; blocks</A>.
        </li>
        <li>Click Remix with AI. The prompt opens in a side panel.</li>
        <li>Copy it into your AI tool, and add what you want to change: colours, size, speed, content.</li>
      </OL>

      <H2 id="free-and-premium">Free and Premium</H2>
      <Table
        head={['Component', 'What you can read']}
        rows={[
          ['Free', 'The whole prompt, no account needed'],
          ['Premium', 'The setup and the constants; the rest comes with Premium'],
        ]}
      />

      <H2 id="prompt-or-install">Prompt or install?</H2>
      <P>
        A prompt is for building your own variation. For the exact component, install it: you get its real source in one command.
        See <A href="/docs/installation">Installation</A>.
      </P>
    </DocPage>
  )
}
