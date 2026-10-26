import { BRAIN_TEASER } from '@/app/lib/andromeda-pro-brain-teaser.generated'
import type { FaqRow } from '@/app/components/FaqRows'

// The AI Brain page's questions, phrased the way people search for them. Plain
// text, so the same strings render the visible FAQ (BrainStoryV4) and the
// FAQPage structured data (page.tsx); the two can never disagree. Every claim
// here is one the page already makes above the FAQ.
const total = BRAIN_TEASER.totalFiles

export const BRAIN_FAQ: FaqRow[] = [
  {
    q: 'What is the Andromeda Pro AI Brain?',
    a: `The AI Brain is the design skill for Andromeda Pro: ${total} files your AI agent reads before it builds. It holds the system's rules, its foundations, a rule file for each component, skills for building and reviewing, and the tools that check finished work.`,
  },
  {
    q: 'What is a design skill for Claude Code?',
    a: 'A design skill is a set of files a coding agent reads and follows, written in the SKILL.md format Claude Code uses. It tells the agent how to build and how to check its own work, so the screens it makes follow a design system instead of guessing. The AI Brain ships two: one builds with Andromeda Pro, one reviews a finished build against every must rule.',
  },
  {
    q: 'Does the AI Brain work with Cursor and Codex?',
    a: 'Yes. The files land in your project as plain Markdown and scripts, so any agent that reads files can follow them, including Claude Code, Cursor and Codex.',
  },
  {
    q: 'How does it stop AI slop?',
    a: 'It hands your agent the decisions a designer would make: which token a color comes from, how cards sit in a grid, which button leads a row. Then the done-gate checks the finished screen, and fails any component that reaches past those rules, before the agent calls it done.',
  },
  {
    q: 'How do I install the AI Brain?',
    a: `One command installs all ${total} files in your project, and running it again updates them. The AI Brain comes with Premium, which also opens the reader with every rule a click away.`,
    link: { label: 'Premium', href: '/pricing' },
  },
]

export const BRAIN_FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: BRAIN_FAQ.map((it) => ({
    '@type': 'Question',
    name: it.q,
    acceptedAnswer: { '@type': 'Answer', text: it.a },
  })),
}
