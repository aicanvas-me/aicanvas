/**
 * gsc-audit.ts — Google Search Console URL Inspection audit.
 *
 * Fetches the live sitemap, runs each URL through GSC's URL Inspection API,
 * classifies results into actionable buckets, and writes:
 *   - scripts/gsc-output/audit.json      (machine-readable, used by gsc-submit)
 *   - scripts/gsc-output/audit-report.md (human-readable summary + actions)
 *
 * Setup (one-time): see plan at ~/.claude/plans/synchronous-dancing-token.md.
 * TL;DR: GCP service account JSON at $GOOGLE_APPLICATION_CREDENTIALS,
 * service-account email added as Owner in GSC, GSC_SITE_URL set in .env.local.
 *
 * Run: npm run gsc:audit
 */

import fs from 'fs'
import path from 'path'
import { google } from 'googleapis'
import { XMLParser } from 'fast-xml-parser'
import { GAXIOS_OPTS, errMessage, guardedCall } from './gsc-net.ts'


// Secrets come from .env.local when present; variables already in the
// environment win, the same precedence as before.
try {
  process.loadEnvFile('.env.local')
} catch {}

// ─────────────────────────────────────────────────────────────────────
// Config + types
// ─────────────────────────────────────────────────────────────────────
const SITE_URL = process.env.GSC_SITE_URL
// GSC property identifier — for Domain properties this is `sc-domain:<host>`;
// for URL-prefix properties it's the same as SITE_URL. Defaults to SITE_URL.
const PROPERTY = process.env.GSC_PROPERTY || SITE_URL
const CREDS = process.env.GOOGLE_APPLICATION_CREDENTIALS
const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'gsc-output')
const AUDIT_JSON = path.join(OUTPUT_DIR, 'audit.json')
const AUDIT_MD = path.join(OUTPUT_DIR, 'audit-report.md')

type Category =
  | 'Indexed'
  | 'Discovered, awaiting crawl'
  | 'Crawled, not indexed'
  | 'Duplicate / canonical issue'
  | 'Redirect'
  | 'Fetch error'
  | 'Unknown to Google'
  | 'Other'
  | 'Inspection failed'

interface AuditEntry {
  url: string
  category: Category
  verdict?: string | null
  coverageState?: string | null
  pageFetchState?: string | null
  robotsTxtState?: string | null
  indexingState?: string | null
  googleCanonical?: string | null
  userCanonical?: string | null
  lastCrawlTime?: string | null
  inspectionLink?: string | null
  error?: string
}

interface AuditFile {
  generatedAt: string
  siteUrl: string
  sitemapUrl: string
  totalUrls: number
  counts: Record<Category, number>
  entries: AuditEntry[]
}

// Categories that gsc-submit.ts should target by default.
export const SUBMITTABLE: ReadonlyArray<Category> = [
  'Discovered, awaiting crawl',
  'Unknown to Google',
]

// ─────────────────────────────────────────────────────────────────────
// Sitemap fetch + parse
// ─────────────────────────────────────────────────────────────────────
async function fetchSitemapUrls(siteUrl: string): Promise<{ sitemapUrl: string; urls: string[] }> {
  const sitemapUrl = `${siteUrl.replace(/\/$/, '')}/sitemap.xml`
  const res = await fetch(sitemapUrl)
  if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status} ${res.statusText} (${sitemapUrl})`)
  const xml = await res.text()
  const parser = new XMLParser({ ignoreAttributes: true })
  const parsed = parser.parse(xml)
  const urlsetUrls = parsed?.urlset?.url
  if (!urlsetUrls) throw new Error(`Sitemap missing <urlset><url> entries — got: ${xml.slice(0, 200)}`)
  const list: { loc?: string }[] = Array.isArray(urlsetUrls) ? urlsetUrls : [urlsetUrls]
  const urls = list.map((u) => u.loc).filter((u): u is string => typeof u === 'string')
  return { sitemapUrl, urls }
}

// ─────────────────────────────────────────────────────────────────────
// Classification
// ─────────────────────────────────────────────────────────────────────
function classify(r: NonNullable<AuditEntry['verdict']> extends never ? never : AuditEntry): Category {
  // Defensive: if inspection itself failed
  if (r.error) return 'Inspection failed'
  const cov = (r.coverageState || '').toLowerCase()
  const fetch = (r.pageFetchState || '').toUpperCase()

  if (r.verdict === 'PASS') return 'Indexed'
  if (cov.includes('unknown to google')) return 'Unknown to Google'
  if (cov.includes('discovered') && cov.includes('not indexed')) return 'Discovered, awaiting crawl'
  if (cov.includes('crawled') && cov.includes('not indexed')) return 'Crawled, not indexed'
  if (cov.includes('duplicate')) return 'Duplicate / canonical issue'
  if (cov.includes('redirect')) return 'Redirect'
  if (fetch && fetch !== 'SUCCESSFUL') return 'Fetch error'
  return 'Other'
}

// Per-category guidance shown in the markdown report.
const ACTION_BY_CATEGORY: Record<Category, string> = {
  Indexed: 'No action needed.',
  'Discovered, awaiting crawl':
    'Submit via Indexing API (`npm run gsc:submit`). Google knows about the URL but has not crawled it yet.',
  'Crawled, not indexed':
    'Content/quality signal — Google chose not to index. Submission will NOT help. Improve the page: more unique content, internal links, reduce duplication.',
  'Duplicate / canonical issue':
    'Investigate canonical URL. If `googleCanonical` differs from `userCanonical`, fix the canonical tag or the duplicate page. Common cause: `/preview/[slug]` competing with `/components/[slug]`.',
  Redirect:
    'Check the page redirects: it should resolve to a 200, or the canonical destination should be the one in the sitemap.',
  'Fetch error':
    'Google could not fetch the page. Test the URL in a browser, check robots.txt, server errors, or rate-limiting on the host.',
  'Unknown to Google':
    'Google has no record of the URL. Submit via Indexing API and verify the URL appears in the sitemap.',
  Other: 'Inspect manually in the GSC URL Inspection UI — the response did not match a known bucket.',
  'Inspection failed': 'API call errored. Re-run the audit; if it persists, check service-account permissions in GSC.',
}

// ─────────────────────────────────────────────────────────────────────
// Inspection (with rate limiting)
// ─────────────────────────────────────────────────────────────────────
async function inspectAll(urls: string[], property: string): Promise<AuditEntry[]> {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
  const searchconsole = google.searchconsole({ version: 'v1', auth })

  const entries: AuditEntry[] = []
  let i = 0
  for (const url of urls) {
    i++
    process.stdout.write(`  [${String(i).padStart(2, ' ')}/${urls.length}] ${url} ... `)
    try {
      const res = await guardedCall(
        () =>
          searchconsole.urlInspection.index.inspect(
            { requestBody: { inspectionUrl: url, siteUrl: property, languageCode: 'en-US' } },
            GAXIOS_OPTS,
          ),
        url,
      )
      const idx = res.data.inspectionResult?.indexStatusResult || {}
      const entry: AuditEntry = {
        url,
        category: 'Other',
        verdict: idx.verdict ?? null,
        coverageState: idx.coverageState ?? null,
        pageFetchState: idx.pageFetchState ?? null,
        robotsTxtState: idx.robotsTxtState ?? null,
        indexingState: idx.indexingState ?? null,
        googleCanonical: idx.googleCanonical ?? null,
        userCanonical: idx.userCanonical ?? null,
        lastCrawlTime: idx.lastCrawlTime ?? null,
        inspectionLink: res.data.inspectionResult?.inspectionResultLink ?? null,
      }
      entry.category = classify(entry)
      entries.push(entry)
      process.stdout.write(`${entry.category}\n`)
    } catch (err: unknown) {
      const message = errMessage(err)
      entries.push({ url, category: 'Inspection failed', error: message })
      process.stdout.write(`ERROR: ${message}\n`)
    }
    // Throttle: ~10 req/sec — well under 600/min quota.
    if (i < urls.length) await new Promise((r) => setTimeout(r, 100))
  }
  return entries
}

// ─────────────────────────────────────────────────────────────────────
// Report writers
// ─────────────────────────────────────────────────────────────────────
function buildMarkdown(audit: AuditFile): string {
  const lines: string[] = []
  const total = audit.totalUrls
  const indexed = audit.counts['Indexed'] || 0
  const notIndexed = total - indexed
  const ts = new Date(audit.generatedAt).toISOString()

  lines.push(`# GSC audit — ${audit.siteUrl}`)
  lines.push('')
  lines.push(`Generated: ${ts}`)
  lines.push(`Sitemap:   ${audit.sitemapUrl}`)
  lines.push('')
  lines.push(`**${notIndexed} / ${total} URLs not indexed.**`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('| Category | Count | Action |')
  lines.push('|---|---:|---|')
  const orderedCats: Category[] = [
    'Indexed',
    'Discovered, awaiting crawl',
    'Unknown to Google',
    'Crawled, not indexed',
    'Duplicate / canonical issue',
    'Redirect',
    'Fetch error',
    'Other',
    'Inspection failed',
  ]
  for (const cat of orderedCats) {
    const count = audit.counts[cat] || 0
    if (count === 0) continue
    lines.push(`| ${cat} | ${count} | ${ACTION_BY_CATEGORY[cat]} |`)
  }
  lines.push('')

  // Per-category sections (skip Indexed — no action needed, just clutter).
  for (const cat of orderedCats) {
    if (cat === 'Indexed') continue
    const matching = audit.entries.filter((e) => e.category === cat)
    if (matching.length === 0) continue
    lines.push(`## ${cat} (${matching.length})`)
    lines.push('')
    lines.push(`> ${ACTION_BY_CATEGORY[cat]}`)
    lines.push('')
    for (const e of matching) {
      lines.push(`- ${e.url}`)
      const detail: string[] = []
      if (e.coverageState) detail.push(`coverage: ${e.coverageState}`)
      if (e.pageFetchState && e.pageFetchState !== 'SUCCESSFUL') detail.push(`fetch: ${e.pageFetchState}`)
      if (e.robotsTxtState && e.robotsTxtState !== 'ALLOWED') detail.push(`robots: ${e.robotsTxtState}`)
      if (e.googleCanonical && e.userCanonical && e.googleCanonical !== e.userCanonical) {
        detail.push(`google→${e.googleCanonical} (user said ${e.userCanonical})`)
      }
      if (e.lastCrawlTime) detail.push(`last crawl: ${e.lastCrawlTime}`)
      if (e.error) detail.push(`error: ${e.error}`)
      if (detail.length) lines.push(`  - ${detail.join(' · ')}`)
    }
    lines.push('')
  }

  // Indexed list at the very end (nice to have for verification).
  const indexedEntries = audit.entries.filter((e) => e.category === 'Indexed')
  if (indexedEntries.length) {
    lines.push(`## Indexed (${indexedEntries.length})`)
    lines.push('')
    lines.push('<details><summary>Show URLs</summary>')
    lines.push('')
    for (const e of indexedEntries) lines.push(`- ${e.url}`)
    lines.push('')
    lines.push('</details>')
    lines.push('')
  }

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!SITE_URL) throw new Error('GSC_SITE_URL is not set. Add it to .env.local.')
  if (!CREDS) throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set. Add it to .env.local.')
  if (!fs.existsSync(CREDS)) throw new Error(`Service account JSON not found at: ${CREDS}`)

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log(`GSC audit for ${SITE_URL}`)
  console.log(`Property:        ${PROPERTY}`)
  console.log(`Service account: ${CREDS}`)
  console.log('')
  console.log('Fetching sitemap...')
  const { sitemapUrl, urls } = await fetchSitemapUrls(SITE_URL)
  console.log(`  Found ${urls.length} URLs in ${sitemapUrl}`)
  console.log('')
  console.log('Inspecting URLs (this calls the GSC URL Inspection API once per URL)...')

  const entries = await inspectAll(urls, PROPERTY!)

  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1
    return acc
  }, {})

  const audit: AuditFile = {
    generatedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    sitemapUrl,
    totalUrls: urls.length,
    counts: counts as Record<Category, number>,
    entries,
  }

  // Preserve the prior audit so callers (subagent, weekly cron) can diff.
  const PREVIOUS_JSON = path.join(OUTPUT_DIR, 'audit-previous.json')
  if (fs.existsSync(AUDIT_JSON)) fs.copyFileSync(AUDIT_JSON, PREVIOUS_JSON)

  fs.writeFileSync(AUDIT_JSON, JSON.stringify(audit, null, 2))
  fs.writeFileSync(AUDIT_MD, buildMarkdown(audit))

  console.log('')
  console.log('Done.')
  console.log('')
  console.log('Summary:')
  for (const [cat, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3, ' ')}  ${cat}`)
  }
  console.log('')
  console.log(`JSON:   ${path.relative(process.cwd(), AUDIT_JSON)}`)
  console.log(`Report: ${path.relative(process.cwd(), AUDIT_MD)}`)
}

main().catch((err) => {
  console.error('\nFAILED:', errMessage(err))
  process.exit(1)
})
