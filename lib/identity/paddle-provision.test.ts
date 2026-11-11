import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { provisionUserByEmail, signInLinkFor } from './paddle-provision'
import { nextFromRedirectTo } from '@/app/lib/auth/email-link'

// An account that already exists for the checkout email, and a spy on the one
// call that mints a token.
const generateLink = vi.fn(async (opts: { email: string }) => ({
  data: { user: { id: 'u_from_link' }, properties: { hashed_token: 'hash_1' } },
  error: null as { message: string } | null,
  opts,
}))
const admin = {
  auth: {
    admin: {
      createUser: async () => ({ data: { user: null }, error: { code: 'email_exists', status: 422, message: 'exists' } }),
      generateLink,
    },
  },
} as unknown as Parameters<typeof provisionUserByEmail>[0]

let searchAnswer: () => Promise<Response>
const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
  if (String(input).includes('/auth/v1/admin/users')) return searchAnswer()
  throw new Error(`unexpected fetch ${String(input)}`)
})

beforeEach(() => {
  generateLink.mockClear()
  fetchMock.mockClear()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://proj.supabase.co'
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_test'
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('provisionUserByEmail for an email that already has an account', () => {
  it('finds the exact address through the admin search and mints no token', async () => {
    searchAnswer = async () =>
      Response.json({ users: [{ id: 'u_other', email: 'xbuyer@example.com' }, { id: 'u_buyer', email: 'Buyer@Example.com' }] })
    expect(await provisionUserByEmail(admin, 'buyer@example.com')).toEqual({ userId: 'u_buyer', createdNew: false })
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      'https://proj.supabase.co/auth/v1/admin/users?filter=buyer%40example.com&per_page=50',
    )
    expect(generateLink).not.toHaveBeenCalled()
  })

  it('falls back to the old resolve when the search fails, so a buyer is never stranded', async () => {
    searchAnswer = async () => new Response('down', { status: 503 })
    expect(await provisionUserByEmail(admin, 'buyer@example.com')).toEqual({ userId: 'u_from_link', createdNew: false })
    expect(generateLink).toHaveBeenCalledTimes(1)
  })

  it('falls back when the search has no exact match', async () => {
    searchAnswer = async () => Response.json({ users: [{ id: 'u_other', email: 'xbuyer@example.com' }] })
    expect(await provisionUserByEmail(admin, 'buyer@example.com')).toEqual({ userId: 'u_from_link', createdNew: false })
  })
})

describe('signInLinkFor', () => {
  it('builds a confirm link that lands on /welcome', async () => {
    const link = await signInLinkFor(admin, 'buyer@example.com')
    expect(link).toBe(
      'https://aicanvas.me/account/auth/confirm?token_hash=hash_1&type=email&redirect_to=https://aicanvas.me/account/auth/callback?next=%2Fwelcome',
    )
    const url = new URL(link!)
    expect(url.searchParams.get('token_hash')).toBe('hash_1')
    expect(nextFromRedirectTo(url.search, 'https://aicanvas.me')).toBe('/welcome')
  })

  it('is null when Supabase refuses, so the email points at /welcome instead', async () => {
    generateLink.mockResolvedValueOnce({ data: null, error: { message: 'no' }, opts: { email: '' } } as never)
    expect(await signInLinkFor(admin, 'buyer@example.com')).toBeNull()
  })
})
