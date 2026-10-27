import { pageMetadata } from '../../lib/page-metadata'
import { BRAIN_TEASER } from '../../lib/andromeda-pro-brain-teaser.generated'
import { CopyBlock } from '../_components/CopyBlock'
import { A, C, DocPage, H2, P, UL } from '../_components/DocsKit'

export const metadata = pageMetadata({
  title: 'AI Brain: Design Rules Your Coding Agent Follows',
  social: 'AI Canvas AI Brain',
  description:
    'The AI Brain is a design system’s rule files in your project: foundations, one rule file per component, a building skill and a review skill for Claude Code, Cursor and Codex.',
  url: '/docs/ai-brain',
})

const TOC = [
  { id: 'what-it-is', title: 'What it is' },
  { id: 'install-and-update', title: 'Install and update' },
  { id: 'use-it', title: 'Use it with your agent' },
  { id: 'make-it-yours', title: 'Make it yours' },
]

export default function AiBrainDocPage() {
  return (
    <DocPage
      href="/docs/ai-brain"
      title="AI Brain"
      lead="The rule files your agent reads before it builds, so the screens it writes look like your design system and not like AI slop."
      toc={TOC}
    >
      <H2 id="what-it-is">What it is</H2>
      <P>
        Each design system has an AI Brain: plain Markdown and scripts that live in your project. The{' '}
        <A href="/design-systems/andromeda-pro/brain">Andromeda Pro AI Brain</A> holds {BRAIN_TEASER.totalFiles} files:
      </P>
      <UL>
        <li>The system rules and the foundations: colour, type, spacing, layout and motion.</li>
        <li>One rule file per component: when to use it, and how.</li>
        <li>A building skill and a review skill, plus tools that check finished work.</li>
      </UL>
      <P>Because they are plain files, any agent that reads files follows them, Claude Code, Cursor and Codex included.</P>

      <H2 id="install-and-update">Install and update</H2>
      <P>
        One command installs every file. Run it again to update them; <C>--overwrite</C> replaces the old rules in place.
      </P>
      <CopyBlock code="npx shadcn@latest add --overwrite @aicanvas/andromeda-pro-brain" label="AI Brain command" />
      <P>
        For Andromeda Legacy, the name is <C>andromeda-brain</C>. Files land in <C>design-systems/&lt;system&gt;/</C> in your
        project. The AI Brain comes with <A href="/pricing">Premium</A>.
      </P>

      <H2 id="use-it">Use it with your agent</H2>
      <P>
        Point your agent at the rules before it builds, for example in your <C>CLAUDE.md</C> or <C>AGENTS.md</C>, or simply in the
        prompt:
      </P>
      <CopyBlock
        wrap
        label="prompt"
        code="Read design-systems/andromeda-pro/ before you build. Build the settings page from Andromeda Pro components and follow its rules."
      />
      <P>
        When it is done, ask it to run the review skill on the result. With the <A href="/docs/mcp">MCP server</A> connected, it
        can also check the props of every component it used.
      </P>

      <H2 id="make-it-yours">Make it yours</H2>
      <P>
        The rules are yours to change. Edit a rule file when your project decides differently, and your agent follows the new rule
        from the next prompt on. Updating with <C>--overwrite</C> replaces the files, so keep your own changes in a separate file or
        under version control.
      </P>
    </DocPage>
  )
}
