import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextResponse } from 'next/server'

// The welcome email's once-only rules, moved here from the callback unchanged.
const calls: string[] = []
let markError: { message: string } | null = null
vi.mock('@/app/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: {
      admin: {
        updateUserById: async () => {
          calls.push('mark')
          return { error: markError }
        },
      },
    },
  }),
}))

import { maybeSendWelcome, setRecoveryMarker, WELCOME_LAUNCH_ISO } from './post-sign-in'

const clientFor = (user: Record<string, unknown> | null) => ({
  auth: { getUser: async () => ({ data: { user } }) },
}) as unknown as Parameters<typeof maybeSendWelcome>[0]

const NEW_USER = { id: 'u1', email: 'a@b.c', created_at: '2026-10-01T00:00:00Z', user_metadata: {} }

beforeEach(() => {
  calls.length = 0
  markError = null
  process.env.RESEND_API_KEY = 'test'
  vi.stubGlobal('fetch', vi.fn(async () => {
    calls.push('send')
    return new Response('{}')
  }))
})
afterEach(() => vi.unstubAllGlobals())

describe('maybeSendWelcome', () => {
  it('a new account: claims the flag FIRST, then sends once', async () => {
    await maybeSendWelcome(clientFor(NEW_USER))
    expect(calls).toEqual(['mark', 'send'])
  })

  it('an account from before launch never gets one', async () => {
    await maybeSendWelcome(clientFor({ ...NEW_USER, created_at: '2026-01-01T00:00:00Z' }))
    expect(calls).toEqual([])
    expect(Date.parse('2026-01-01T00:00:00Z')).toBeLessThan(Date.parse(WELCOME_LAUNCH_ISO))
  })

  it('an unreadable created_at never gets one', async () => {
    await maybeSendWelcome(clientFor({ ...NEW_USER, created_at: 'nonsense' }))
    expect(calls).toEqual([])
  })

  it('an account already welcomed gets nothing', async () => {
    await maybeSendWelcome(clientFor({ ...NEW_USER, user_metadata: { welcome_sent: true } }))
    expect(calls).toEqual([])
  })

  it('no send when the flag cannot be claimed', async () => {
    markError = { message: 'boom' }
    await maybeSendWelcome(clientFor(NEW_USER))
    expect(calls).toEqual(['mark'])
  })

  it('no Resend key: nothing at all', async () => {
    delete process.env.RESEND_API_KEY
    await maybeSendWelcome(clientFor(NEW_USER))
    expect(calls).toEqual([])
  })

  it('never throws, even when the send fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network')
    }))
    await expect(maybeSendWelcome(clientFor(NEW_USER))).resolves.toBeUndefined()
  })
})

describe('setRecoveryMarker', () => {
  it('sets a short-lived HTTP-only cookie scoped to the reset page', () => {
    const res = NextResponse.redirect('https://aicanvas.me/account/reset-password')
    setRecoveryMarker(res)
    const c = res.headers.get('set-cookie') ?? ''
    expect(c).toContain('ac_recovery_session=1')
    expect(c).toContain('Path=/account/reset-password')
    expect(c).toContain('Max-Age=600')
    expect(c.toLowerCase()).toContain('httponly')
    expect(c.toLowerCase()).toContain('secure')
    expect(c.toLowerCase()).toContain('samesite=lax')
  })
})
