import { describe, it, expect, vi, beforeEach } from 'vitest'

const insert = vi.fn()
const after = vi.fn()

vi.mock('next/server', () => ({ after: (cb: () => unknown) => after(cb) }))
vi.mock('@/app/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: () => ({ insert }) }),
}))

import { trackPull } from './track-pull'

beforeEach(() => {
  insert.mockReset().mockResolvedValue({ error: null })
  after.mockReset()
})

describe('trackPull', () => {
  it('leaves no note for an anonymous caller', () => {
    trackPull(null, 'peel-corner-reveal', 'standalone')
    expect(after).not.toHaveBeenCalled()
  })

  it('leaves no note for an account that objected', () => {
    process.env.PULL_HISTORY_OPT_OUT = 'u0, U1'
    trackPull('u1', 'peel-corner-reveal', 'standalone')
    delete process.env.PULL_HISTORY_OPT_OUT
    expect(after).not.toHaveBeenCalled()
  })

  it('writes the note only once the response work is handed to after()', async () => {
    trackPull('u1', 'andromeda-pro-brain', 'brain')
    expect(insert).not.toHaveBeenCalled()
    await after.mock.calls[0][0]()
    expect(insert).toHaveBeenCalledWith({ user_id: 'u1', slug: 'andromeda-pro-brain', kind: 'brain' })
  })

  it('never throws: not when scheduling fails, not when the insert fails', async () => {
    after.mockImplementationOnce(() => {
      throw new Error('outside a request scope')
    })
    expect(() => trackPull('u1', 'x', 'standalone')).not.toThrow()

    insert.mockRejectedValue(new Error('db down'))
    trackPull('u1', 'x', 'standalone')
    await expect(after.mock.calls[1][0]()).resolves.toBeUndefined()
  })
})
