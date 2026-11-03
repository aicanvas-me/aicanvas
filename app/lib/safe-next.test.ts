import { describe, it, expect } from 'vitest'
import { safeNext } from './safe-next'

const ch = (code: number) => String.fromCharCode(code)
const TAB = ch(9)
const LF = ch(10)
const CR = ch(13)
const BS = ch(92) // backslash

describe('safeNext', () => {
  it('keeps same-origin paths, with query and hash', () => {
    for (const p of ['/', '/account', '/components/x?tab=code&q=a+b', '/docs#install', '/a%2Fb', '/search?q=%20x']) {
      expect(safeNext(p)).toBe(p)
    }
  })

  it('refuses absolute and protocol-relative targets', () => {
    for (const p of ['https://evil.com', 'javascript:alert(1)', '//evil.com', `/${BS}evil.com`, 'evil.com', '']) {
      expect(safeNext(p)).toBe('/account')
    }
  })

  it('refuses tab, CR and LF that the URL parser would delete into //evil.com', () => {
    for (const p of [`/${TAB}/evil.com`, `/${LF}/evil.com`, `/${CR}/evil.com`, `/${TAB}${BS}evil.com`, `/${CR}${LF}/evil.com`]) {
      expect(safeNext(p)).toBe('/account')
      // Proof the guard is needed: unguarded, each of these leaves the origin.
      expect(new URL(p, 'https://aicanvas.me').origin).not.toBe('https://aicanvas.me')
    }
  })

  it('refuses any control character, space, DEL or backslash anywhere', () => {
    for (const code of [0, 1, 9, 10, 13, 31, 32, 127, 92]) {
      expect(safeNext(`/a${ch(code)}b`)).toBe('/account')
    }
  })

  it('refuses dot segments that resolve to a protocol-relative path', () => {
    for (const p of ['/..//evil.com', '/.//evil.com', '/%2e%2e//evil.com', '/a/../..//evil.com']) {
      expect(safeNext(p)).toBe('/account')
    }
  })

  it('returns the resolved path, never raw dot segments', () => {
    expect(safeNext('/a/../components/x?tab=code')).toBe('/components/x?tab=code')
  })

  it('unicode spaces and fullwidth slashes stay on our path, percent-encoded', () => {
    for (const code of [0x2028, 0x00a0, 0xfeff, 0xff0f, 0xff3c]) {
      const out = safeNext(`/${ch(code)}/evil.com`)
      expect(out.startsWith('/%')).toBe(true)
      expect(new URL(out, 'https://aicanvas.me').origin).toBe('https://aicanvas.me')
    }
  })

  it('honours a custom fallback', () => {
    expect(safeNext(null, '/welcome')).toBe('/welcome')
    expect(safeNext('//evil.com', '/welcome')).toBe('/welcome')
  })
})
