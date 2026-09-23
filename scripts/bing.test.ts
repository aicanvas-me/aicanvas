import fs from 'fs'
import { describe, it, expect } from 'vitest'
import { bingDate } from './bing-api'
import { classify } from './bing-audit'
import { pickUrls, type SubmitLogEntry } from './bing-submit'
import { newUrls, sitemapLocs } from './indexnow'

describe('bingDate', () => {
  it('reads the /Date(ms)/ form, with or without an offset', () => {
    expect(bingDate('/Date(1786606898000)/')).toBe('2026-08-13T07:41:38.000Z')
    expect(bingDate('/Date(1786606898000-0700)/')).toBe('2026-08-13T07:41:38.000Z')
  })

  it('treats the year-0001 placeholder Bing sends for unknown URLs as absent', () => {
    expect(bingDate('/Date(-62135596800000)/')).toBeNull()
    expect(bingDate(undefined)).toBeNull()
  })
})

describe('classify', () => {
  const unknown = '/Date(-62135596800000)/'
  it('crawled when there is a crawl date', () => {
    expect(classify({ DiscoveryDate: '/Date(1777532400000)/', LastCrawledDate: '/Date(1786606898000)/' })).toBe('Crawled')
  })
  it('discovered when only the discovery date is real', () => {
    expect(classify({ DiscoveryDate: '/Date(1777532400000)/', LastCrawledDate: unknown })).toBe('Discovered, not crawled')
  })
  it('unknown when both dates are placeholders or the info is empty', () => {
    expect(classify({ DiscoveryDate: unknown, LastCrawledDate: unknown })).toBe('Unknown to Bing')
    expect(classify(null)).toBe('Unknown to Bing')
  })
})

describe('pickUrls', () => {
  const now = Date.parse('2026-09-23T12:00:00Z')
  const audit = {
    entries: [
      { url: 'https://aicanvas.me/a', category: 'Crawled' as const },
      { url: 'https://aicanvas.me/b', category: 'Unknown to Bing' as const },
      { url: 'https://aicanvas.me/c', category: 'Discovered, not crawled' as const },
      { url: 'https://aicanvas.me/d', category: 'Unknown to Bing' as const },
      { url: 'https://aicanvas.me/e', category: 'Lookup failed' as const },
    ],
  }
  const sent = (url: string, daysAgo: number, status: SubmitLogEntry['status'] = 'success'): SubmitLogEntry => ({
    url,
    submittedAt: new Date(now - daysAgo * 86_400_000).toISOString(),
    category: 'Unknown to Bing',
    status,
  })

  it('takes only uncrawled URLs, in audit order, up to the cap', () => {
    const r = pickUrls(audit, [], 2, now)
    expect(r.eligible).toBe(3)
    expect(r.picked.map((p) => p.url)).toEqual(['https://aicanvas.me/b', 'https://aicanvas.me/c'])
  })

  it('skips a URL sent successfully in the last 14 days, and retries older or failed ones', () => {
    const log = [sent('https://aicanvas.me/b', 3), sent('https://aicanvas.me/c', 20), sent('https://aicanvas.me/d', 1, 'error')]
    expect(pickUrls(audit, log, 10, now).picked.map((p) => p.url)).toEqual(['https://aicanvas.me/c', 'https://aicanvas.me/d'])
  })

  it('picks nothing when the quota is zero but still counts what waits', () => {
    expect(pickUrls(audit, [], 0, now)).toEqual({ eligible: 3, picked: [] })
  })
})

describe('indexnow', () => {
  it('reads every <loc> from the sitemap', () => {
    const xml = '<urlset><url><loc>https://aicanvas.me</loc></url><url><loc>\n https://aicanvas.me/mcp </loc></url></urlset>'
    expect(sitemapLocs(xml)).toEqual(['https://aicanvas.me', 'https://aicanvas.me/mcp'])
  })

  it('pings everything on the first run and only new URLs after', () => {
    expect(newUrls(['a', 'b'], null)).toEqual(['a', 'b'])
    expect(newUrls(['a', 'b', 'c'], ['a', 'b'])).toEqual(['c'])
  })

  it('ships a key file IndexNow accepts (8 to 128 hex or dash characters, no newline)', () => {
    const key = fs.readFileSync('public/indexnow-key.txt', 'utf8')
    expect(key).toMatch(/^[a-zA-Z0-9-]{8,128}$/)
  })
})
