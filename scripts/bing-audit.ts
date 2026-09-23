/**
 * bing-audit.ts — Bing Webmaster audit, the Bing twin of gsc-audit.ts.
 *
 * Fetches the live sitemap, asks Bing what it knows about each URL
 * (GetUrlInfo), adds the site-level numbers (crawl stats, crawl issues, top
 * queries, traffic, sitemap status, submission quota), and writes:
 *   - scripts/bing-output/audit.json      (machine-readable, used by bing-submit)
 *   - scripts/bing-output/audit-report.md (human-readable summary + actions)
 *
 * Bing's API has no per-URL "indexed" verdict like GSC's URL Inspection.
 * GetUrlInfo says whether Bing discovered and crawled a URL; the indexed
 * count comes from GetCrawlStats (InIndex) for the site as a whole. Site
 * stats stay empty for the first days after a site is added.
 *
 * Run: npm run bing:audit
 */

import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { SITE_URL, bingDate, bingGet, fetchSitemapUrls, getQuota, scrubbed, type Quota } from './bing-api.ts'
import {
  carryStartedAt,
  clearCheckpoint,
  loadCheckpoint,
  mergeForSave,
  saveCheckpoint,
  takeLock,
  usableEntries,
  type Checkpoint,
} from './gsc-resume.ts'

const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'bing-output')
const AUDIT_JSON = path.join(OUTPUT_DIR, 'audit.json')
const AUDIT_MD = path.join(OUTPUT_DIR, 'audit-report.md')
const PROGRESS_JSON = path.join(OUTPUT_DIR, 'audit-progress.json')
const AUDIT_LOCK = path.join(OUTPUT_DIR, 'audit.lock')
const CHECKPOINT_EVERY = 10
// Bing throttles after about ten back-to-back calls, and still now and then at
// this pace; bing-api.ts backs off and retries those. A full pass takes ~25 min.
const URL_INFO_GAP_MS = 6_000

export type Category = 'Crawled' | 'Discovered, not crawled' | 'Unknown to Bing' | 'Lookup failed'

export interface AuditEntry {
  url: string
  category: Category
  discovered?: string | null
  lastCrawled?: string | null
  documentSize?: number
  inboundLinks?: number
  error?: string
}

interface UrlInfo {
  Url?: string
  DiscoveryDate?: string
  LastCrawledDate?: string
  DocumentSize?: number
  AnchorCount?: number
}

interface CrawlStats {
  Date: string
  InIndex: number
  CrawledPages: number
  CrawlErrors: number
  BlockedByRobotsTxt: number
}

interface CrawlIssue {
  Url: string
  HttpCode: number
  Issues: number
}

interface QueryStats {
  Query: string
  Clicks: number
  Impressions: number
  AvgImpressionPosition: number
}

interface TrafficStats {
  Date: string
  Clicks: number
  Impressions: number
}

interface Feed {
  Url: string
  Status: string
  UrlCount: number
  LastCrawled: string
}

export interface SiteStats {
  inIndex: number | null
  crawlStatsDate: string | null
  crawlErrors: number | null
  crawlIssues: { url: string; httpCode: number; issues: number }[]
  topQueries: { query: string; clicks: number; impressions: number; avgPosition: number }[]
  last7Days: { clicks: number; impressions: number } | null
  sitemaps: { url: string; status: string; urlCount: number; lastCrawled: string | null }[]
  quota: Quota | null
  errors: string[]
}

export interface AuditFile {
  generatedAt: string
  siteUrl: string
  sitemapUrl: string
  totalUrls: number
  counts: Partial<Record<Category, number>>
  site: SiteStats
  entries: AuditEntry[]
}

export function classify(info: UrlInfo | null | undefined): Category {
  if (bingDate(info?.LastCrawledDate)) return 'Crawled'
  if (bingDate(info?.DiscoveryDate)) return 'Discovered, not crawled'
  return 'Unknown to Bing'
}

const ACTION_BY_CATEGORY: Record<Category, string> = {
  Crawled: 'No action needed. Bing has fetched the page.',
  'Discovered, not crawled': 'Submit (`npm run bing:submit`). Bing knows the URL but has not fetched it.',
  'Unknown to Bing': 'Submit (`npm run bing:submit`) and check the URL is in the sitemap.',
  'Lookup failed': 'API call errored. Re-run the audit.',
}

const ORDER: Category[] = ['Crawled', 'Discovered, not crawled', 'Unknown to Bing', 'Lookup failed']

// Each site call is independent: one failing leaves its field empty and is
// listed in the report instead of failing the whole audit.
async function siteStats(): Promise<SiteStats> {
  const errors: string[] = []
  const safe = async <T>(label: string, fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn()
    } catch (err) {
      errors.push(`${label}: ${scrubbed(err)}`)
      return null
    }
  }
  const crawl = (await safe('GetCrawlStats', () => bingGet<CrawlStats[]>('GetCrawlStats'))) ?? []
  const issues = (await safe('GetCrawlIssues', () => bingGet<CrawlIssue[]>('GetCrawlIssues'))) ?? []
  const queries = (await safe('GetQueryStats', () => bingGet<QueryStats[]>('GetQueryStats'))) ?? []
  const traffic = (await safe('GetRankAndTrafficStats', () => bingGet<TrafficStats[]>('GetRankAndTrafficStats'))) ?? []
  const feeds = (await safe('GetFeeds', () => bingGet<Feed[]>('GetFeeds'))) ?? []
  const quota = await safe('GetUrlSubmissionQuota', getQuota)

  const byDate = <T extends { Date: string }>(rows: T[]) =>
    [...rows].sort((a, b) => (bingDate(a.Date) ?? '').localeCompare(bingDate(b.Date) ?? ''))
  const latest = byDate(crawl).at(-1)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const recent = traffic.filter((t) => (bingDate(t.Date) ?? '') >= weekAgo)

  return {
    inIndex: latest?.InIndex ?? null,
    crawlStatsDate: bingDate(latest?.Date),
    crawlErrors: latest?.CrawlErrors ?? null,
    crawlIssues: issues.map((i) => ({ url: i.Url, httpCode: i.HttpCode, issues: i.Issues })),
    topQueries: [...queries]
      .sort((a, b) => b.Clicks - a.Clicks || b.Impressions - a.Impressions)
      .slice(0, 10)
      .map((q) => ({ query: q.Query, clicks: q.Clicks, impressions: q.Impressions, avgPosition: q.AvgImpressionPosition })),
    last7Days: traffic.length
      ? recent.reduce((acc, t) => ({ clicks: acc.clicks + t.Clicks, impressions: acc.impressions + t.Impressions }), {
          clicks: 0,
          impressions: 0,
        })
      : null,
    sitemaps: feeds.map((f) => ({ url: f.Url, status: f.Status, urlCount: f.UrlCount, lastCrawled: bingDate(f.LastCrawled) })),
    quota,
    errors,
  }
}

async function inspectAll(
  urls: string[],
  resume: { done: Map<string, AuditEntry>; checkpoint: Checkpoint<AuditEntry> },
): Promise<AuditEntry[]> {
  const entries: AuditEntry[] = []
  let i = 0
  for (const url of urls) {
    i++
    process.stdout.write(`  [${String(i).padStart(3, ' ')}/${urls.length}] ${url} ... `)
    const already = resume.done.get(url)
    if (already) {
      entries.push(already)
      process.stdout.write(`${already.category} (resumed)\n`)
      continue
    }
    try {
      const info = await bingGet<UrlInfo | null>('GetUrlInfo', { url })
      const entry: AuditEntry = {
        url,
        category: classify(info),
        discovered: bingDate(info?.DiscoveryDate),
        lastCrawled: bingDate(info?.LastCrawledDate),
        documentSize: info?.DocumentSize ?? 0,
        inboundLinks: info?.AnchorCount ?? 0,
      }
      entries.push(entry)
      process.stdout.write(`${entry.category}\n`)
    } catch (err) {
      const message = scrubbed(err)
      entries.push({ url, category: 'Lookup failed', error: message })
      process.stdout.write(`ERROR: ${message}\n`)
    }
    if (i % CHECKPOINT_EVERY === 0 || i === urls.length) {
      resume.checkpoint.entries = mergeForSave(entries, resume.done)
      saveCheckpoint(PROGRESS_JSON, resume.checkpoint)
    }
    if (i < urls.length) await new Promise((r) => setTimeout(r, URL_INFO_GAP_MS))
  }
  return entries
}

function buildMarkdown(audit: AuditFile): string {
  const { site } = audit
  const lines: string[] = []
  lines.push(`# Bing audit — ${audit.siteUrl}`)
  lines.push('')
  lines.push(`Generated: ${audit.generatedAt}`)
  lines.push(`Sitemap:   ${audit.sitemapUrl}`)
  lines.push('')
  lines.push(`**${audit.counts['Crawled'] || 0} / ${audit.totalUrls} sitemap URLs crawled by Bing.**`)
  lines.push('')
  lines.push('## Site')
  lines.push('')
  lines.push(`- In index: ${site.inIndex ?? 'no data yet'}${site.crawlStatsDate ? ` (crawl stats of ${site.crawlStatsDate.slice(0, 10)})` : ''}`)
  lines.push(`- Crawl errors: ${site.crawlErrors ?? 'no data yet'}`)
  lines.push(`- Last 7 days: ${site.last7Days ? `${site.last7Days.clicks} clicks, ${site.last7Days.impressions} impressions` : 'no data yet'}`)
  lines.push(`- Submission quota left: ${site.quota ? `${site.quota.DailyQuota} today, ${site.quota.MonthlyQuota} this month` : 'unknown'}`)
  for (const s of site.sitemaps) {
    lines.push(`- Sitemap ${s.url}: ${s.status}, ${s.urlCount} URLs, last read ${s.lastCrawled?.slice(0, 10) ?? 'never'}`)
  }
  lines.push('')

  lines.push('## Sitemap URLs')
  lines.push('')
  lines.push('| Category | Count | Action |')
  lines.push('|---|---:|---|')
  for (const cat of ORDER) {
    const n = audit.counts[cat] || 0
    if (n) lines.push(`| ${cat} | ${n} | ${ACTION_BY_CATEGORY[cat]} |`)
  }
  lines.push('')

  if (site.topQueries.length) {
    lines.push('## Top queries')
    lines.push('')
    lines.push('| Query | Clicks | Impressions | Avg position |')
    lines.push('|---|---:|---:|---:|')
    for (const q of site.topQueries) lines.push(`| ${q.query} | ${q.clicks} | ${q.impressions} | ${q.avgPosition} |`)
    lines.push('')
  }

  if (site.crawlIssues.length) {
    lines.push(`## Crawl issues (${site.crawlIssues.length})`)
    lines.push('')
    for (const c of site.crawlIssues) lines.push(`- ${c.url} (HTTP ${c.httpCode}, issue flags ${c.issues})`)
    lines.push('')
  }

  for (const cat of ORDER) {
    if (cat === 'Crawled') continue
    const matching = audit.entries.filter((e) => e.category === cat)
    if (!matching.length) continue
    lines.push(`## ${cat} (${matching.length})`)
    lines.push('')
    for (const e of matching) {
      const detail = [e.discovered && `discovered ${e.discovered.slice(0, 10)}`, e.error && `error: ${e.error}`].filter(Boolean)
      lines.push(`- ${e.url}${detail.length ? ` (${detail.join(' · ')})` : ''}`)
    }
    lines.push('')
  }

  if (site.errors.length) {
    lines.push('## API errors')
    lines.push('')
    for (const e of site.errors) lines.push(`- ${e}`)
    lines.push('')
  }

  const crawled = audit.entries.filter((e) => e.category === 'Crawled')
  if (crawled.length) {
    lines.push(`## Crawled (${crawled.length})`)
    lines.push('')
    lines.push('<details><summary>Show URLs</summary>')
    lines.push('')
    for (const e of crawled) lines.push(`- ${e.url} (last crawl ${e.lastCrawled?.slice(0, 10)})`)
    lines.push('')
    lines.push('</details>')
    lines.push('')
  }
  return lines.join('\n')
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  takeLock(AUDIT_LOCK)

  console.log(`Bing audit for ${SITE_URL}`)
  console.log('')
  console.log('Fetching sitemap...')
  const { sitemapUrl, urls } = await fetchSitemapUrls()
  console.log(`  Found ${urls.length} URLs in ${sitemapUrl}`)
  console.log('Fetching site stats...')
  const site = await siteStats()
  for (const e of site.errors) console.log(`  ERROR ${e}`)
  // A failed quota call is the cheapest sign the key or site access is broken.
  if (!site.quota) throw new Error(`Bing API unreachable or key rejected: ${site.errors.join('; ')}`)

  const previous = loadCheckpoint<AuditEntry>(PROGRESS_JSON)
  const done = usableEntries<AuditEntry>(previous, { property: SITE_URL, sitemapUrl })
  const startedAt = carryStartedAt(previous, done.size, new Date().toISOString())
  if (done.size) console.log(`  Resuming: ${done.size} URLs already looked up (since ${startedAt})`)
  console.log(`Looking up URLs (one GetUrlInfo call each, ${URL_INFO_GAP_MS / 1000}s apart)...`)
  const entries = await inspectAll(urls, {
    done,
    checkpoint: { startedAt, property: SITE_URL, sitemapUrl, entries: [] },
  })

  const counts = entries.reduce<Partial<Record<Category, number>>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1
    return acc
  }, {})
  const audit: AuditFile = {
    generatedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    sitemapUrl,
    totalUrls: urls.length,
    counts,
    site,
    entries,
  }

  if (fs.existsSync(AUDIT_JSON)) fs.copyFileSync(AUDIT_JSON, path.join(OUTPUT_DIR, 'audit-previous.json'))
  fs.writeFileSync(AUDIT_JSON, JSON.stringify(audit, null, 2))
  fs.writeFileSync(AUDIT_MD, buildMarkdown(audit))
  clearCheckpoint(PROGRESS_JSON)

  console.log('')
  console.log('Done.')
  console.log('')
  console.log('Summary:')
  for (const cat of ORDER) if (counts[cat]) console.log(`  ${String(counts[cat]).padStart(3, ' ')}  ${cat}`)
  console.log(`  In index (site): ${site.inIndex ?? 'no data yet'}`)
  console.log('')
  console.log(`JSON:   ${path.relative(process.cwd(), AUDIT_JSON)}`)
  console.log(`Report: ${path.relative(process.cwd(), AUDIT_MD)}`)
}

// Only run when executed directly, so the test file can import `classify`.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('\nFAILED:', scrubbed(err))
    process.exit(1)
  })
}
