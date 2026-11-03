import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/entitlement', () => ({ getEntitlement: vi.fn() }))
vi.mock('node:fs/promises', () => ({ readFile: vi.fn(async () => '{"search":"<path d=\\"M1 1\\"/>"}') }))

import { GET } from './route'
import { getEntitlement } from '@/app/lib/entitlement'

const mocked = vi.mocked(getEntitlement)
const get = (style: string) => GET(new Request(`https://aicanvas.me/icons/style-data/${style}`), { params: Promise.resolve({ style }) })

beforeEach(() => {
  mocked.mockReset()
})

describe('GET /icons/style-data/[style]', () => {
  it('serves a paid style to Premium, never shared-cached', async () => {
    mocked.mockResolvedValue({ tier: 'premium', userId: 'u1' })
    const res = await get('solid')
    expect(res.status).toBe(200)
    expect(await res.json()).toHaveProperty('search')
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
  })

  it.each(['free', 'anonymous'] as const)('refuses a %s caller with no markup in the body', async (tier) => {
    mocked.mockResolvedValue({ tier, userId: tier === 'free' ? 'u2' : null })
    for (const style of ['duotone', 'solid', 'solid-duotone']) {
      const res = await get(style)
      expect(res.status).toBe(403)
      expect(await res.text()).not.toContain('path')
    }
  })

  it('answers 503, never a grant, when the subscription read fails', async () => {
    mocked.mockRejectedValue(new Error('db down'))
    const res = await get('duotone')
    expect(res.status).toBe(503)
    expect(await res.text()).not.toContain('path')
  })

  it('serves no style outside the three paid ones, Line included', async () => {
    mocked.mockResolvedValue({ tier: 'premium', userId: 'u1' })
    for (const style of ['line', '..%2F.env', 'unknown']) expect((await get(style)).status).toBe(404)
  })
})
