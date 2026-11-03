// Production builds this page before the hosted sign-in is switched on, so the flag-off page
// must be the npm docs alone, with nothing that points at an address that does not answer yet.
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/docs/mcp' }))

async function render(flags: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(flags)) vi.stubEnv(k, v as string)
  vi.resetModules()
  const { default: Page } = await import('./page')
  return renderToStaticMarkup(<Page />)
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('/docs/mcp and the hosted sign-in flag', () => {
  it('shows the npm docs alone while the flag is off', async () => {
    const html = await render({ HOSTED_MCP: undefined, HOSTED_MCP_OAUTH: undefined })
    expect(html).toContain('id="quick-start"')
    for (const id of ['sign-in', 'your-account', 'ci', 'stuck', 'what-we-store']) expect(html).not.toContain(`id="${id}"`)
    expect(html).not.toContain('mcp.aicanvas.me')
    expect(html).not.toContain('whoami')
  })

  it('leads with the sign-in sections while the flag is on', async () => {
    const html = await render({ HOSTED_MCP: 'on', HOSTED_MCP_OAUTH: 'on' })
    for (const id of ['sign-in', 'your-account', 'ci', 'stuck', 'what-we-store', 'quick-start']) expect(html).toContain(`id="${id}"`)
    expect(html.indexOf('id="sign-in"')).toBeLessThan(html.indexOf('id="quick-start"'))
    expect(html).toContain('whoami')
  })
})
