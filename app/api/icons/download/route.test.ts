import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/entitlement', () => ({ getEntitlement: vi.fn() }))
vi.mock('@/app/icons/_lib/zip-export', () => ({
  buildIconZip: vi.fn(async () => new Uint8Array([80, 75, 5, 6])),
  zipFileName: (style: string, format: string) => `aicanvas-icons-${style}-${format}.zip`,
}))

import { POST } from './route'
import { getEntitlement } from '@/app/lib/entitlement'
import { buildIconZip } from '@/app/icons/_lib/zip-export'

const entitlement = vi.mocked(getEntitlement)
const build = vi.mocked(buildIconZip)
const SETTINGS = { style: 'solid', format: 'svg', size: 24, strokeWidth: 1.5, absolute: true, colour: null }
const post = (body: unknown) =>
  POST(new Request('https://aicanvas.me/api/icons/download', { method: 'POST', body: JSON.stringify(body) }))

beforeEach(() => {
  entitlement.mockReset()
  build.mockClear()
})

describe('POST /api/icons/download', () => {
  it('refuses a signed-out caller with 401 and a free account with 403, building nothing', async () => {
    entitlement.mockResolvedValue({ tier: 'anonymous', userId: null })
    expect((await post(SETTINGS)).status).toBe(401)
    entitlement.mockResolvedValue({ tier: 'free', userId: 'u1' })
    for (const style of ['line', 'solid']) expect((await post({ ...SETTINGS, style })).status).toBe(403)
    expect(build).not.toHaveBeenCalled()
  })

  it('answers 503, never a grant, when the subscription read fails', async () => {
    entitlement.mockRejectedValue(new Error('db down'))
    expect((await post(SETTINGS)).status).toBe(503)
    expect(build).not.toHaveBeenCalled()
  })

  it('builds the ZIP for Premium with the paid markup and an attachment name, never shared-cached', async () => {
    entitlement.mockResolvedValue({ tier: 'premium', userId: 'u2' })
    const res = await post(SETTINGS)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="aicanvas-icons-solid-svg.zip"')
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
    const input = build.mock.calls[0][0]
    expect(input.names.length).toBeGreaterThan(0)
    expect(input.markup[input.names[0]]).toBeTruthy()
  })

  it('narrows to a category and hands React the shipped registry files', async () => {
    entitlement.mockResolvedValue({ tier: 'premium', userId: 'u2' })
    await post({ ...SETTINGS, format: 'react', style: 'duotone', category: 'arrows' })
    const input = build.mock.calls[0][0]
    expect(input.names.length).toBeLessThan(100)
    expect(Object.keys(input.react.files)).toEqual(input.names.map((name) => `${name}-duotone.tsx`))
    expect(input.react.base).toContain('createIcon')
  })

  it('rejects settings the toolbar cannot produce', async () => {
    entitlement.mockResolvedValue({ tier: 'premium', userId: 'u2' })
    for (const bad of [
      { ...SETTINGS, style: 'bold' },
      { ...SETTINGS, format: 'pdf' },
      { ...SETTINGS, size: 1000 },
      { ...SETTINGS, size: 25 },
      { ...SETTINGS, strokeWidth: 9 },
      { ...SETTINGS, colour: 'red"/><script>' },
      { ...SETTINGS, category: '../secret' },
      null,
    ]) {
      expect((await post(bad)).status).toBe(400)
    }
    expect(build).not.toHaveBeenCalled()
  })
})
