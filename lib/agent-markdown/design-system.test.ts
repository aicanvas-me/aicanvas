import { describe, it, expect } from 'vitest'
import { publicSystemPrompt, systemComponentMarkdown, systemMarkdown, type SystemInput } from './design-system'
import { homeMarkdown, mcpMarkdown } from './site'

const SCAFFOLD = [
  '## 1. Setup',
  'npm install motion',
  '',
  '## 2. Constants',
  'const RADIUS = 2',
  '',
  '## 3. State',
  'const engineRef = useRef(null)',
  '',
  '## 4. Tree',
  '<div data-secret-tree />',
].join('\n')

const SITE = 'https://aicanvas.me'
const accordion = { slug: 'accordion', registrySlug: 'andromeda-pro-accordion', name: 'Accordion', description: 'Opens answers.' }

describe('publicSystemPrompt', () => {
  it('keeps only the public head of a scaffold prompt', () => {
    const head = publicSystemPrompt(SCAFFOLD)
    expect(head).toContain('## 2. Constants')
    expect(head).not.toContain('## 3. State')
    expect(head).not.toContain('engineRef')
  })

  it('withholds a prompt it cannot cut', () => {
    expect(publicSystemPrompt('one long brief with no headings at all')).toBeNull()
    expect(publicSystemPrompt(null)).toBeNull()
  })
})

describe('systemComponentMarkdown', () => {
  const base = {
    system: { slug: 'andromeda-pro', name: 'Andromeda Pro', paid: true },
    component: accordion,
    installTier: 'Premium, requires an AI Canvas token',
    propTables: [],
    prompt: SCAFFOLD,
    related: [],
    siteUrl: SITE,
  }

  it('Pro: public prompt head only, Premium install wording, no source', () => {
    const md = systemComponentMarkdown(base)
    expect(md).toContain('npx shadcn@latest add @aicanvas/andromeda-pro-accordion')
    expect(md).toContain('Requires a Premium subscription.')
    expect(md).toContain('## Remix prompt')
    for (const gone of ['## 3. State', 'engineRef', 'data-secret-tree', '```tsx']) {
      expect(md).not.toContain(gone)
    }
  })

  it('free system component: free-account wording, no prompt section without a prompt', () => {
    const md = systemComponentMarkdown({
      ...base,
      system: { slug: 'andromeda', name: 'Andromeda Legacy', paid: false },
      component: { ...accordion, registrySlug: 'andromeda-accordion' },
      installTier: 'free account',
      prompt: null,
    })
    expect(md).toContain('(free account required)')
    expect(md).not.toContain('## Remix prompt')
    expect(md).toContain('License: MIT')
  })
})

describe('systemMarkdown', () => {
  const input: SystemInput = {
    slug: 'andromeda',
    name: 'Andromeda Legacy',
    tagline: 'Sci-fi blueprint design system',
    description: 'One typeface.',
    font: 'JetBrains Mono',
    paid: false,
    components: [{ slug: 'alert', registrySlug: 'andromeda-alert', name: 'Alert', description: 'Banner.' }],
    templates: [
      { folder: 'mission-control', registrySlug: 'andromeda-mission-control', name: 'Mission Control', description: 'Telemetry.', installTier: 'Premium, requires an AI Canvas token' },
    ],
    installs: [{ tier: 'free account', command: 'npx shadcn@latest add @aicanvas/andromeda', note: 'Every component' }],
    brain: { installTier: 'Premium, requires an AI Canvas token' },
    pages: [{ path: 'system', label: 'Every component, live' }],
    siteUrl: SITE,
  }

  it('links components to their markdown pages and labels every install with its tier', () => {
    const md = systemMarkdown(input)
    expect(md).toContain('- [Alert](https://aicanvas.me/design-systems/andromeda/alert.md): Banner.')
    expect(md).toContain('- Every component (free account): `npx shadcn@latest add @aicanvas/andromeda`')
    expect(md).toContain('Install (Premium, requires an AI Canvas token): `npx shadcn@latest add @aicanvas/andromeda-mission-control`')
    expect(md).toContain('@aicanvas/andromeda-brain')
  })

  it('leaves the brain out when the build did not ship it', () => {
    expect(systemMarkdown({ ...input, brain: undefined })).not.toContain('## AI Brain')
  })
})

describe('site twins', () => {
  it('home leads with the free design system and names the standalones as standalone', () => {
    const md = homeMarkdown({
      siteUrl: SITE,
      standaloneCount: 88,
      systems: [
        { slug: 'andromeda-pro', name: 'Andromeda Pro', paid: true, componentCount: 69, templateCount: 9, installTier: 'Premium, requires an AI Canvas token' },
        { slug: 'andromeda', name: 'Andromeda Legacy', paid: false, componentCount: 39, templateCount: 4, installTier: 'free account' },
      ],
    })
    expect(md.indexOf('Andromeda Legacy')).toBeLessThan(md.indexOf('Andromeda Pro'))
    expect(md).toContain('## Standalone components and blocks')
    expect(md).toContain('belong to no design system')
  })

  it('mcp twin carries no token and says the server is read-only', () => {
    const md = mcpMarkdown({ siteUrl: SITE })
    expect(md).toContain('claude mcp add aicanvas --scope user -- npx -y @aicanvas/mcp')
    expect(md).toContain('read-only')
    expect(md).not.toMatch(/AICANVAS_TOKEN=[^<]/)
  })
})
