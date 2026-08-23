import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock ONLY the two outbound boundaries: the Supabase session lookup and the
// Resend send. Every branch under test (category whitelist, the billing email
// requirement, subject prefixing, reply_to) runs for real.
vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  })),
}))

import { POST } from './route'

// Each request gets its own IP. The route's rate limiter is module-level state
// that survives between tests, and it caps a single IP at 4 per 10 minutes —
// reusing one address would 429 the later cases instead of testing them.
let ipCounter = 0

// Email is mandatory, so it is defaulted here and every test that is about
// something else stays about that something else. Override with email: '' to
// exercise the missing-address path.
function post(payload: Record<string, unknown>) {
  ipCounter += 1
  return POST(
    new NextRequest('http://localhost/api/feedback', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': `10.0.0.${ipCounter}`,
        'user-agent': 'TestAgent/1.0',
      },
      body: JSON.stringify({ email: 'tester@example.com', ...payload }),
    }),
  )
}

/** The JSON body the route handed to Resend, or null if it never called out. */
function sentPayload(): Record<string, string> | null {
  const call = vi.mocked(global.fetch).mock.calls[0]
  if (!call) return null
  return JSON.parse(String((call[1] as RequestInit).body))
}

beforeEach(() => {
  process.env.RESEND_API_KEY = 'test-key'
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{}', { status: 200 })),
  )
})

describe('POST /api/feedback', () => {
  it('prefixes the subject by category — this is the whole triage system', async () => {
    const cases = [
      ['general', '[Feedback]'],
      ['bug', '[Bug]'],
      ['billing', '[Billing]'],
      ['other', '[Other]'],
    ] as const

    for (const [category, prefix] of cases) {
      vi.mocked(global.fetch).mockClear()
      const res = await post({
        category,
        message: 'the copy button does nothing',
        email: 'someone@example.com',
      })
      expect(res.status, category).toBe(200)
      expect(sentPayload()?.subject).toBe(`${prefix} the copy button does nothing`)
    }
  })

  it('rejects any category with no email — the address is mandatory now', async () => {
    for (const category of ['general', 'bug', 'billing', 'other']) {
      vi.mocked(global.fetch).mockClear()
      const res = await post({ category, message: 'something', email: '' })
      expect(res.status, category).toBe(400)
      expect(global.fetch, category).not.toHaveBeenCalled()
    }
  })

  it('always sets reply_to, so Gmail answers the sender', async () => {
    const res = await post({
      category: 'general',
      message: 'love the site',
      email: 'someone@example.com',
    })
    expect(res.status).toBe(200)
    expect(sentPayload()?.reply_to).toBe('someone@example.com')
  })

  it('includes the 0-10 rating when one was given', async () => {
    await post({ category: 'general', message: 'good', score: 0 })
    // 0 is a real rating, not "unrated" — a falsy check here would drop the
    // single most useful score on the scale.
    expect(sentPayload()?.text).toContain('Rating: 0 / 10')
  })

  it('omits the rating entirely when the slider was never touched', async () => {
    await post({ category: 'general', message: 'good', score: null })
    expect(sentPayload()?.text).not.toContain('Rating')
  })

  it('ignores an out-of-range or non-integer rating rather than echoing it', async () => {
    for (const score of [11, -1, 2.5, '7', {}]) {
      vi.mocked(global.fetch).mockClear()
      await post({ category: 'general', message: 'good', score })
      expect(sentPayload()?.text, String(score)).not.toContain('Rating')
    }
  })

  it('rejects an unknown category so the subject prefix can never be attacker-controlled', async () => {
    const res = await post({ category: 'constructor', message: 'hi' })
    expect(res.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('rejects a malformed email rather than dropping it, so nobody waits for a reply that cannot arrive', async () => {
    const res = await post({ category: 'general', message: 'hi', email: 'not-an-email' })
    expect(res.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('rejects an empty message', async () => {
    const res = await post({ category: 'general', message: '   ' })
    expect(res.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('swallows a filled honeypot: fake success, nothing sent', async () => {
    const res = await post({
      category: 'general',
      message: 'buy my pills',
      website: 'http://spam.example',
    })
    expect(res.status).toBe(200)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('attaches request context instead of asking the visitor for it', async () => {
    await post({
      category: 'bug',
      message: 'broken',
      where: 'scroll-wipe-gallery',
      context: { referrer: 'https://aicanvas.me/components', viewport: '1440x900' },
    })
    const text = sentPayload()?.text ?? ''
    expect(text).toContain('https://aicanvas.me/components')
    expect(text).toContain('1440x900')
    expect(text).toContain('TestAgent/1.0')
    expect(text).toContain('not signed in')
    expect(text).toContain('scroll-wipe-gallery')
  })

  it('rate-limits a single IP', async () => {
    const req = () =>
      POST(
        new NextRequest('http://localhost/api/feedback', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.9.9.9' },
          body: JSON.stringify({ category: 'general', message: 'spam' }),
        }),
      )
    const codes: number[] = []
    for (let i = 0; i < 6; i += 1) codes.push((await req()).status)
    expect(codes.at(-1)).toBe(429)
  })
})

describe('POST /api/feedback when Resend does not answer', () => {
  it('a timed-out send returns 502 instead of crashing the route', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new DOMException('timeout', 'TimeoutError') }))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await post({ category: 'general', message: 'hello' })
    expect(res.status).toBe(502)
  })
})
