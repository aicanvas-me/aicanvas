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
})
