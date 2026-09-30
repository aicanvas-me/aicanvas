import { describe, it, expect } from 'vitest'
import { splitPromptAtPaywall, splitSystemPromptAtPaywall, splitProPromptAtPaywall } from './prompt-blocks'

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
  '## 5. Why',
  '- the RAF loop is disposed on unmount',
  '',
  '## 6. Remix',
  '- swap the palette',
  '',
  '## 7. Check',
  '- the canvas fills its parent',
].join('\n')

describe('splitPromptAtPaywall', () => {
  it('keeps blocks 1 and 2, withholds everything from block 3 on', () => {
    const split = splitPromptAtPaywall(SCAFFOLD)
    expect(split).not.toBeNull()
    const shipped = split!.head
    for (const kept of ['## 1. Setup', 'npm install framer-motion', '## 2. Constants', 'COLORS']) {
      expect(shipped).toContain(kept)
    }
    for (const gone of [
      '## 3. State', '## 4. Tree', '## 5. Why', '## 6. Remix', '## 7. Check',
      'rootRef', 'className', 'RAF loop', 'swap the palette', 'fills its parent',
    ]) {
      expect(shipped).not.toContain(gone)
    }
  })

  it('fails closed when the scaffold is missing', () => {
    expect(splitPromptAtPaywall('Build a card. Use framer-motion.')).toBeNull()
  })

  it('fails closed when the cut heading repeats at line start', () => {
    // Two cuts are ambiguous, so refuse rather than guess which one is real.
    expect(splitPromptAtPaywall(`## 3. State\nleaked\n${SCAFFOLD}`)).toBeNull()
  })

  it('fails closed when a later locked heading survives the cut', () => {
    // Block 2 quoting a real block-5 heading at line start would ship it.
    const prompt = [
      '## 1. Setup', 'x',
      '## 2. Constants',
      '## 5. Why',
      'SECRET-AFTER-STRAY-HEADING',
      '## 3. State', 'SECRET-STATE',
    ].join('\n')
    expect(splitPromptAtPaywall(prompt)).toBeNull()
  })

  it('ignores a locked heading quoted mid-line, cutting only at a real one', () => {
    // Anchoring to line starts is what makes this safe: the quoted copy is not at
    // a line start, so it neither moves the cut nor trips the survivor assertion.
    const prompt = [
      '## 1. Setup', 'x',
      '## 2. Constants',
      'const label = "## 3. State (quoted in a string)"',
      '## 3. State', 'SECRET-STATE',
      '## 4. Tree', 'SECRET-TREE',
      '## 5. Why', '- prose',
    ].join('\n')
    const out = splitPromptAtPaywall(prompt)
    expect(out).not.toBeNull()
    expect(out!.head).toContain('quoted in a string')
    expect(out!.head).not.toContain('SECRET-STATE')
    expect(out!.head).not.toContain('SECRET-TREE')
    expect(out!.head).not.toContain('- prose')
  })

  it('treats a heading with trailing whitespace as a heading', () => {
    const prompt = [
      '## 1. Setup', 'x',
      '## 2. Constants', 'public',
      '## 3. State   ', 'SECRET-STATE',
      '## 4. Tree', 'SECRET-TREE',
    ].join('\n')
    const out = splitPromptAtPaywall(prompt)
    expect(out).not.toBeNull()
    expect(out!.head).not.toContain('SECRET-STATE')
    expect(out!.head).not.toContain('SECRET-TREE')
    expect(out!.head).toContain('## 2. Constants')
  })
})

describe('splitSystemPromptAtPaywall', () => {
  const body = 'x'.repeat(400)

  it('keeps the opening and withholds from the first heading on', () => {
    const r = splitSystemPromptAtPaywall(`Intro line.\n\n## API\n${body}\n\n## Colour\n${body}`)
    expect(r?.head).toBe('Intro line.')
    expect(r?.head).not.toContain('## API')
  })

  it('withholds whole when there is no heading to cut at', () => {
    expect(splitSystemPromptAtPaywall(`Intro only, no sections.\n\n${body}`)).toBeNull()
  })

  it('withholds whole when the opening IS most of the prompt', () => {
    // Nothing left to sell: shipping this head would ship the brief.
    expect(splitSystemPromptAtPaywall(`${body}\n\n## Tail\nshort`)).toBeNull()
  })

  it('never lets a section survive the cut', () => {
    const r = splitSystemPromptAtPaywall(`Intro.\n\n## One\n${body}\n\n## Two\n${body}`)
    expect(r).not.toBeNull()
    expect(r!.head.match(/^##\s/gm)).toBeNull()
  })

  it('treats a fenced heading as a real one, cutting earlier rather than later', () => {
    // Safe direction: the seam may ship less than intended, never more.
    const r = splitSystemPromptAtPaywall(`Intro.\n\n\`\`\`md\n## Not a section\n\`\`\`\n\n## Real\n${body}`)
    expect(r?.head).toBe('Intro.\n\n```md')
  })

  it('withholds the component palette on a real compound prompt', () => {
    // Regression for the seam that shipped 69% of Alert, all 21 colours, free.
    const prompt = `Build **Alert**: a banner. It sits on oklch(0.135 0.002 286.2).\n\n## API\nvariant\n\n## Colour\n${'accent oklch(0.7 0.1 200) '.repeat(40)}`
    const r = splitSystemPromptAtPaywall(prompt)
    expect(r!.head).not.toContain('oklch(0.7 0.1 200)')
    expect(r!.head.length / prompt.length).toBeLessThan(0.4)
  })
})

describe('splitProPromptAtPaywall', () => {
  const body = 'x'.repeat(400)

  it('cuts a scaffold prompt at block 3, keeping blocks 1 and 2', () => {
    const split = splitProPromptAtPaywall(SCAFFOLD)
    expect(split).not.toBeNull()
    expect(split!.head).toContain('## 2. Constants')
    expect(split!.head).not.toContain('## 3. State')
    expect(split!.head).not.toContain('rootRef')
  })

  it('falls back to the structural cut for a prose brief', () => {
    const r = splitProPromptAtPaywall(`Intro line.\n\n## API\n${body}\n\n## Colour\n${body}`)
    expect(r?.head).toBe('Intro line.')
    expect(r?.head).not.toContain('## API')
  })

  it('fails closed when a scaffold prompt repeats the cut heading', () => {
    // Two "## 3. State" starts are ambiguous, so refuse rather than guess.
    expect(splitProPromptAtPaywall(`## 3. State\nleaked\n${SCAFFOLD}`)).toBeNull()
  })

  it('fails closed when there is no heading to cut at', () => {
    expect(splitProPromptAtPaywall('Build a card. Use framer-motion.')).toBeNull()
  })
})
