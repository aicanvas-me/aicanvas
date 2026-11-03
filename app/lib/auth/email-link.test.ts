import { describe, it, expect } from 'vitest'
import { destinationFor, isEmailLinkType, kindFor, nextFromRedirectTo } from './email-link'

const ORIGIN = 'https://aicanvas.me'
// What the app passes as emailRedirectTo / redirectTo today.
const redirectFor = (next: string) => `${ORIGIN}/account/auth/callback?next=${encodeURIComponent(next)}`
// Go's html/template query-escapes {{ .RedirectTo }} inside an href, lowercase hex.
const goEscape = (s: string) =>
  encodeURIComponent(s).replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase())
const search = (redirectTo: string) => `?token_hash=abc123&type=email&redirect_to=${redirectTo}`

describe('nextFromRedirectTo', () => {
  const nexts = [
    '/components/sticker-wall',
    '/welcome',
    '/account/reset-password',
    '/components/x?tab=code&theme=dark',
    '/search?q=a+b',
    '/docs#install',
    '/path%2Fwith%2Fslash',
  ]

  it.each(nexts)('escaped redirect (as the email renders it) keeps %s exactly', (next) => {
    expect(nextFromRedirectTo(search(goEscape(redirectFor(next))), ORIGIN)).toBe(next)
  })

  it.each(nexts)('raw redirect (unescaped copy) keeps %s exactly', (next) => {
    expect(nextFromRedirectTo(search(redirectFor(next)), ORIGIN)).toBe(next)
  })

  it('uppercase escapes decode the same', () => {
    expect(nextFromRedirectTo(search(encodeURIComponent(redirectFor('/a?b=1&c=2'))), ORIGIN)).toBe('/a?b=1&c=2')
  })

  it('Site URL fallback (no next) goes to /account', () => {
    expect(nextFromRedirectTo(search(goEscape(ORIGIN)), ORIGIN)).toBe('/account')
    expect(nextFromRedirectTo(search(ORIGIN), ORIGIN)).toBe('/account')
  })

  it('missing or empty redirect_to goes to /account', () => {
    expect(nextFromRedirectTo('?token_hash=abc&type=email', ORIGIN)).toBe('/account')
    expect(nextFromRedirectTo('?token_hash=abc&type=email&redirect_to=', ORIGIN)).toBe('/account')
  })

  it('another origin goes to /account', () => {
    const evil = 'https://evil.com/account/auth/callback?next=%2Fx'
    expect(nextFromRedirectTo(search(evil), ORIGIN)).toBe('/account')
    expect(nextFromRedirectTo(search(goEscape(evil)), ORIGIN)).toBe('/account')
    expect(nextFromRedirectTo(search('https://aicanvas.me.evil.com/account/auth/callback?next=%2Fx'), ORIGIN)).toBe('/account')
  })

  it('a path other than our callback goes to /account', () => {
    expect(nextFromRedirectTo(search(`${ORIGIN}/somewhere?next=%2Fx`), ORIGIN)).toBe('/account')
  })

  it('an off-site inner next is refused by safeNext', () => {
    for (const bad of ['//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)']) {
      expect(nextFromRedirectTo(search(goEscape(redirectFor(bad))), ORIGIN)).toBe('/account')
    }
  })

  it('a tab or newline smuggled into the inner next is refused', () => {
    for (const enc of ['%09', '%0A', '%0D', '%09%5C']) {
      const r = `${ORIGIN}/account/auth/callback?next=/${enc}/evil.com`
      expect(nextFromRedirectTo(search(goEscape(r)), ORIGIN)).toBe('/account')
      expect(nextFromRedirectTo(search(r), ORIGIN)).toBe('/account')
    }
  })

  it('non-http schemes and junk go to /account', () => {
    expect(nextFromRedirectTo(search('javascript:alert(1)'), ORIGIN)).toBe('/account')
    expect(nextFromRedirectTo(search('https%3a%2f%2f%E0%A4%A'), ORIGIN)).toBe('/account')
    expect(nextFromRedirectTo(search('not a url'), ORIGIN)).toBe('/account')
  })

  it('only a real redirect_to parameter counts, not a lookalike name', () => {
    expect(nextFromRedirectTo(`?xredirect_to=${redirectFor('/x')}`, ORIGIN)).toBe('/account')
  })

  it('works on the local test origin', () => {
    const local = 'http://localhost:3001'
    const r = `${local}/account/auth/callback?next=${encodeURIComponent('/welcome')}`
    expect(nextFromRedirectTo(search(goEscape(r)), local)).toBe('/welcome')
  })
})

describe('isEmailLinkType', () => {
  it('accepts only the two types our templates send', () => {
    expect(['email', 'recovery'].every(isEmailLinkType)).toBe(true)
    for (const t of ['magiclink', 'signup', 'invite', 'email_change', 'sms', '', null, undefined, 1]) {
      expect(isEmailLinkType(t)).toBe(false)
    }
  })
})

describe('kindFor', () => {
  it('only picks wording, from a closed set', () => {
    expect(kindFor('email', 'signup')).toBe('signup')
    expect(kindFor('email', null)).toBe('signin')
    expect(kindFor('email', 'anything')).toBe('signin')
    expect(kindFor('recovery', 'signup')).toBe('recovery')
  })
})

describe('destinationFor', () => {
  it('recovery always lands on the reset page', () => {
    expect(destinationFor('recovery', '/components/x')).toBe('/account/reset-password')
  })
  it('email links follow next', () => {
    expect(destinationFor('email', '/components/x')).toBe('/components/x')
    expect(destinationFor('email', '/welcome')).toBe('/welcome')
  })
})
