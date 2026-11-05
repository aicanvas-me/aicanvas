// Connecting an agent must be one obvious click from this list, whether it is empty or not.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ConnectedAgentsSection, type ConnectedAgent } from './ConnectedAgentsSection'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }))

const cursor: ConnectedAgent = {
  id: 'g1',
  name: 'Cursor',
  destination: 'On a computer',
  connectedAt: '2026-11-03T10:00:00Z',
  lastUsedAt: null,
  staleRefreshAt: null,
  countryMismatch: null,
}

describe('ConnectedAgentsSection', () => {
  it('offers one call to action when nothing is connected', () => {
    const html = renderToStaticMarkup(<ConnectedAgentsSection agents={[]} />)
    expect(html).toContain('Connect an AI agent')
    expect(html).not.toContain('Connect another')
    expect(html.match(/href="\/account\/connect"/g)).toHaveLength(1)
  })

  it('offers to connect another next to the list', () => {
    const html = renderToStaticMarkup(<ConnectedAgentsSection agents={[cursor]} />)
    expect(html).toContain('Connect another')
    expect(html).toContain('href="/account/connect"')
    expect(html).toContain('Cursor')
  })

  it('keeps a lone row to the date', () => {
    const html = renderToStaticMarkup(<ConnectedAgentsSection agents={[cursor]} />)
    expect(html).toContain('On a computer · Connected 3 Nov 2026<')
    expect(html).not.toContain('UTC')
    expect(html).not.toContain('Never used')
  })

  it('tells same-name rows apart by time and use', () => {
    const used = { ...cursor, id: 'g2', connectedAt: '2026-11-03T14:05:00Z', lastUsedAt: '2026-11-04T09:00:00Z' }
    const html = renderToStaticMarkup(<ConnectedAgentsSection agents={[cursor, used]} />)
    expect(html).toContain('Connected 3 Nov 2026, 10:00 UTC · Never used')
    expect(html).toContain('Connected 3 Nov 2026, 14:05 UTC · Last used 4 Nov 2026')
  })
})
