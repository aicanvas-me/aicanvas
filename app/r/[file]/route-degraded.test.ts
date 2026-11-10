import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// The production degraded path: the gate manifest cannot be read, so the lookup
// falls back and marks itself degraded. Only that read fails; the route still
// reads the real registry-data/<slug>.json through node:fs/promises.
vi.mock('node:fs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:fs')>()),
  readFileSync: () => {
    throw new Error('ENOENT')
  },
}))
vi.mock('@/app/lib/entitlement', () => ({ getEntitlement: vi.fn() }))
vi.mock('@/app/lib/track-pull', () => ({ trackPull: vi.fn() }))

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { GET } from './route'
import { getEntitlement } from '@/app/lib/entitlement'

const mockedGetEntitlement = vi.mocked(getEntitlement)
const FILES = ['andromeda-mission-control.json', 'andromeda-pro-mission-control.json'].filter((f) =>
  existsSync(join(process.cwd(), 'registry-data', f)),
)

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  mockedGetEntitlement.mockReset()
})

afterEach(() => {
  delete process.env.FREE_ACCOUNT_GATE
})

describe.skipIf(FILES.length === 0)('GET /r/<template>.json on a degraded lookup', () => {
  it('fails closed for every template, Legacy included, whatever the caller holds', async () => {
    process.env.FREE_ACCOUNT_GATE = 'on'
    for (const tier of ['anonymous', 'free', 'premium'] as const) {
      mockedGetEntitlement.mockResolvedValue({ tier, userId: tier === 'anonymous' ? null : 'u1' })
      for (const file of FILES) {
        const res = await GET(new NextRequest(`http://localhost/r/${file}`), { params: Promise.resolve({ file }) })
        expect(res.status, `${tier} ${file}`).toBe(503)
        expect(await res.text()).not.toContain('useState')
      }
    }
  })
})
