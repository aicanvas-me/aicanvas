import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// The verify client, the session client and the welcome email are mocked; the
// route's own decisions (origin check, type allowlist, destination, marker,
// failure paths) run for real.
const verifyOtp = vi.fn()
const verifyGetUser = vi.fn()
let sessionUser: { id: string } | null = null
const welcome = vi.fn()

vi.mock('@/app/lib/supabase/verify', () => ({
  createVerifyClient: async () => ({ auth: { verifyOtp, getUser: verifyGetUser } }),
}))
vi.mock('@/app/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: sessionUser } }) } }),
}))
vi.mock('@/app/lib/auth/post-sign-in', async (orig) => ({
  ...(await orig<typeof import('@/app/lib/auth/post-sign-in')>()),
  maybeSendWelcome: (...a: unknown[]) => welcome(...a),
}))

import { GET, POST } from './route'

const ORIGIN = 'https://aicanvas.me'

function get(query: string) {
  return GET(new NextRequest(`${ORIGIN}/account/auth/confirm${query}`))
}

function post(fields: Record<string, string>, headers: Record<string, string> = { origin: ORIGIN }) {
  return POST(
    new NextRequest(`${ORIGIN}/account/auth/confirm`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', ...headers },
      body: new URLSearchParams(fields).toString(),
    }),
  )
}

const where = (res: Response) => {
  const loc = new URL(res.headers.get('location')!)
  return loc.pathname + loc.search
}

beforeEach(() => {
  verifyOtp.mockReset().mockResolvedValue({ error: null })
  verifyGetUser.mockReset()
  welcome.mockReset()
  sessionUser = null
})

describe('GET /account/auth/confirm', () => {
  it('hands a valid link to the Continue page without verifying it', async () => {
    const r = `${ORIGIN}/account/auth/callback?next=${encodeURIComponent('/components/x?a=1&b=2')}`
    const res = await get(`?token_hash=th1&type=email&redirect_to=${encodeURIComponent(r)}`)
    expect(res.status).toBe(303)
    const loc = new URL(res.headers.get('location')!)
    expect(loc.pathname).toBe('/account/auth/continue')
    expect(loc.searchParams.get('token_hash')).toBe('th1')
    expect(loc.searchParams.get('type')).toBe('email')
    expect(loc.searchParams.get('kind')).toBe('signin')
    expect(loc.searchParams.get('next')).toBe('/components/x?a=1&b=2')
    expect(verifyOtp).not.toHaveBeenCalled()
  })

  it('refuses a type the templates never send', async () => {
    for (const type of ['magiclink', 'signup', 'email_change', 'invite', '']) {
      const res = await get(`?token_hash=th1&type=${type}`)
      expect(where(res)).toBe('/account/sign-in?error=link_invalid')
    }
    expect(verifyOtp).not.toHaveBeenCalled()
  })

  it('passes the sign-up wording through, and nothing else', async () => {
    const kind = async (q: string) => new URL((await get(q)).headers.get('location')!).searchParams.get('kind')
    expect(await kind('?token_hash=th1&type=email&kind=signup')).toBe('signup')
    expect(await kind('?token_hash=th1&type=email&kind=<script>')).toBe('signin')
    expect(await kind('?token_hash=th1&type=recovery&kind=signup')).toBe('recovery')
  })

  it('refuses a link without a token', async () => {
    expect(where(await get('?type=email'))).toBe('/account/sign-in?error=link_invalid')
  })
})

describe('POST /account/auth/confirm', () => {
  it('refuses a cross-site POST (login CSRF) without verifying', async () => {
    const res = await post({ token_hash: 'th1', type: 'email', next: '/x' }, { origin: 'https://evil.com' })
    expect(where(res)).toBe('/account/sign-in?error=link_invalid')
    expect(verifyOtp).not.toHaveBeenCalled()
  })

  it('refuses a POST with Origin null', async () => {
    const res = await post({ token_hash: 'th1', type: 'email', next: '/x' }, { origin: 'null' })
    expect(where(res)).toBe('/account/sign-in?error=link_invalid')
    expect(verifyOtp).not.toHaveBeenCalled()
  })

  it('refuses a POST with no Origin unless Sec-Fetch-Site says same-origin', async () => {
    expect(where(await post({ token_hash: 'th1', type: 'email', next: '/x' }, {}))).toBe(
      '/account/sign-in?error=link_invalid',
    )
    const ok = await post({ token_hash: 'th1', type: 'email', next: '/x' }, { 'sec-fetch-site': 'same-origin' })
    expect(where(ok)).toBe('/x')
  })

  it('magic link: verifies with the token hash and lands on next, no recovery marker', async () => {
    const res = await post({ token_hash: 'th1', type: 'email', next: '/components/x?a=1&b=2' })
    expect(verifyOtp).toHaveBeenCalledWith({ type: 'email', token_hash: 'th1' })
    expect(res.status).toBe(303)
    expect(where(res)).toBe('/components/x?a=1&b=2')
    expect(res.headers.get('set-cookie') ?? '').not.toContain('ac_recovery_session')
    expect(welcome).toHaveBeenCalledTimes(1)
  })

  it('sign-up confirmation verifies as email too', async () => {
    const res = await post({ token_hash: 'th1', type: 'email', next: '/welcome' })
    expect(verifyOtp).toHaveBeenCalledWith({ type: 'email', token_hash: 'th1' })
    expect(where(res)).toBe('/welcome')
  })

  it('recovery: always the reset page, with the marker, whatever next says', async () => {
    const res = await post({ token_hash: 'th1', type: 'recovery', next: '/components/x' })
    expect(where(res)).toBe('/account/reset-password')
    const cookie = res.headers.get('set-cookie') ?? ''
    expect(cookie).toContain('ac_recovery_session=1')
    expect(cookie).toContain('Path=/account/reset-password')
    expect(cookie.toLowerCase()).toContain('httponly')
  })

  it('the marker follows the type, never the destination', async () => {
    const res = await post({ token_hash: 'th1', type: 'email', next: '/account/reset-password' })
    expect(where(res)).toBe('/account/reset-password')
    expect(res.headers.get('set-cookie') ?? '').not.toContain('ac_recovery_session')
  })

  it('an off-site next falls back to /account', async () => {
    for (const next of ['//evil.com', 'https://evil.com', '/\\evil.com']) {
      expect(where(await post({ token_hash: 'th1', type: 'email', next }))).toBe('/account')
    }
  })

  it('refuses a type the templates never send, even on POST', async () => {
    const res = await post({ token_hash: 'th1', type: 'email_change', next: '/x' })
    expect(where(res)).toBe('/account/sign-in?error=link_invalid')
    expect(verifyOtp).not.toHaveBeenCalled()
  })

  describe('when verify fails (expired, or already used)', () => {
    beforeEach(() => verifyOtp.mockResolvedValue({ error: { message: 'Token has expired or is invalid' } }))

    it('a browser that is already signed in goes on to the destination', async () => {
      sessionUser = { id: 'u1' }
      expect(where(await post({ token_hash: 'th1', type: 'email', next: '/x' }))).toBe('/x')
    })

    it('a signed-in second click on a reset link goes to the reset page WITHOUT a new marker', async () => {
      sessionUser = { id: 'u1' }
      const res = await post({ token_hash: 'th1', type: 'recovery', next: '/x' })
      expect(where(res)).toBe('/account/reset-password')
      expect(res.headers.get('set-cookie') ?? '').not.toContain('ac_recovery_session')
    })

    it('signed out, a reset link goes back to forgot-password', async () => {
      expect(where(await post({ token_hash: 'th1', type: 'recovery', next: '/x' }))).toBe(
        '/account/forgot-password?error=link_expired',
      )
    })

    it('signed out, a sign-in link goes to sign-in and keeps next', async () => {
      expect(where(await post({ token_hash: 'th1', type: 'email', next: '/components/x' }))).toBe(
        '/account/sign-in?error=link_expired&next=%2Fcomponents%2Fx',
      )
    })

    it('never sends the welcome email', async () => {
      await post({ token_hash: 'th1', type: 'email', next: '/welcome' })
      expect(welcome).not.toHaveBeenCalled()
    })
  })
})
