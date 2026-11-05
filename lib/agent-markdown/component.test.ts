import { describe, it, expect } from 'vitest'
import { componentMarkdown, publicContent, fence, type ComponentMarkdownInput } from './component'

const SCAFFOLD = [
  '## 1. Setup',
  'npm install framer-motion',
  '',
  '## 2. Constants',
  'const COLORS = ["#f00"]',
  '',
  '## 3. State',
  'const rootRef = useRef<HTMLDivElement>(null)',
  '',
  '## 4. Tree',
  '<div className="relative h-full" />',
  '',
  '## 7. Check',
  '- the canvas fills its parent',
].join('\n')

const CODE = [
  "'use client'",
  '// npm install framer-motion three',
  '// font: Manrope',
  'export default function SecretEngine() { return null }',
].join('\n')

function input(overrides: Partial<ComponentMarkdownInput> = {}): ComponentMarkdownInput {
  return {
    slug: 'demo-card',
    name: 'Demo Card',
    description: 'A demo card.',
    tags: [{ label: 'Cards & Modals', accent: true }, { label: 'React' }, { label: 'Motion' }],
    isBlock: false,
    code: CODE,
    prompt: SCAFFOLD,
    propTables: [],
    related: [],
    isPremium: false,
    enforcing: false,
    freeAccountGate: false,
    siteUrl: 'https://aicanvas.me',
    ...overrides,
  }
}

describe('publicContent: the twin never shows more than the signed-out page', () => {
  it('free, permissive: full source and full prompt', () => {
    const view = publicContent(input())
    expect(view.source).toBe(CODE)
    expect(view.prompt).toBe(SCAFFOLD)
    expect(view.promptLocked).toBe(false)
  })

  it('free, enforcing: source withheld, prompt stays public', () => {
    const view = publicContent(input({ enforcing: true }))
    expect(view.source).toBeNull()
    expect(view.prompt).toBe(SCAFFOLD)
  })

  it('premium: no source even when permissive, prompt cut before block 3', () => {
    const view = publicContent(input({ isPremium: true }))
    expect(view.source).toBeNull()
    expect(view.promptLocked).toBe(true)
    expect(view.prompt).toContain('## 2. Constants')
    expect(view.prompt).not.toContain('## 3. State')
    expect(view.prompt).not.toContain('rootRef')
  })

  it('premium prompt without the scaffold is withheld whole', () => {
    const view = publicContent(input({ isPremium: true, prompt: 'Build the whole engine like this...' }))
    expect(view.prompt).toBeNull()
  })
})

describe('componentMarkdown', () => {
  it('premium document carries no source and no locked prompt block', () => {
    const md = componentMarkdown(input({ isPremium: true }))
    for (const gone of ['SecretEngine', '## 3. State', '## 4. Tree', '## 7. Check', 'rootRef', 'fills its parent']) {
      expect(md).not.toContain(gone)
    }
    expect(md).toContain('The source is Premium and is not published.')
    expect(md).toContain('Requires a Premium subscription.')
    // The directive lines are public on the page, so they stay public here.
    expect(md).toContain('npm install framer-motion three')
  })

  it('premium with an unredactable prompt drops the Remix section', () => {
    const md = componentMarkdown(input({ isPremium: true, prompt: 'no scaffold here' }))
    expect(md).not.toContain('## Remix prompt')
    expect(md).not.toContain('no scaffold here')
  })

  it('free document has the source, the full prompt and the llms.txt pointer first', () => {
    const md = componentMarkdown(input())
    expect(md.startsWith('> Free, MIT-licensed standalone component (part of no design system')).toBe(true)
    expect(md).toContain('https://aicanvas.me/llms.txt')
    expect(md).toContain('SecretEngine')
    expect(md).toContain('## 3. State')
    expect(md).toContain('npx shadcn@latest add @aicanvas/demo-card')
  })

  it('names the free-account placeholder only when the gate is on', () => {
    expect(componentMarkdown(input())).not.toContain('free account required')
    expect(componentMarkdown(input({ freeAccountGate: true }))).toContain('(free account required)')
  })

  it('escapes pipes in prop types so the table keeps its columns', () => {
    const md = componentMarkdown(
      input({
        propTables: [
          {
            table: 'DemoCardProps',
            props: [{ name: 'size', type: "'sm' | 'lg'", optional: true, default: "'sm'", description: 'Card size.' }],
          },
        ],
      }),
    )
    expect(md).toContain("| `size?` | `'sm' \\| 'lg'` | `'sm'` | Card size. |")
  })

  it('links related entries to their own markdown twins', () => {
    const md = componentMarkdown(input({ related: [{ slug: 'other', name: 'Other', description: 'Another one.' }] }))
    expect(md).toContain('- [Other](https://aicanvas.me/components/other.md): Another one.')
  })
})

describe('fence', () => {
  it('outgrows the longest backtick run inside, so an embedded fence cannot close it', () => {
    expect(fence('a\n```tsx\nx\n```', 'markdown')).toBe('````markdown\na\n```tsx\nx\n```\n````')
    expect(fence('plain', 'bash')).toBe('```bash\nplain\n```')
  })
})
