/**
 * gsc-keywords.ts — Google Search Console Search Analytics report.
 *
 * Sibling to gsc-audit.ts. Where the audit answers "is each URL indexed?",
 * this script answers "what queries is Google actually showing us for, and
 * at what position / CTR?" It calls the Search Analytics API on the same
 * service-console property with the same service-account credentials.
 *
 * Outputs (under scripts/gsc-output/):
 *   - keywords.json         machine-readable: full query + query×page rows
 *   - keywords-report.md    human-readable: top queries, opportunities, wins
 *
 * Run: npm run gsc:keywords
 * Flags:
 *   --days=N          Window size in days (default 28). Max 480.
 *   --row-limit=N     Max rows per dimension request (default 1000, max 25000).
 *   --min-impr=N      Filter queries with fewer than N impressions (default 1).
 */

import fs from 'fs'
import path from 'path'
import { google } from 'googleapis'
import { GAXIOS_OPTS, guardedCall } from './gsc-net.ts'


// Secrets come from .env.local when present; variables already in the
// environment win, the same precedence as before.
try {
  process.loadEnvFile('.env.local')
} catch {}

// ─────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────
const SITE_URL = process.env.GSC_SITE_URL
const PROPERTY = process.env.GSC_PROPERTY || SITE_URL
const CREDS = process.env.GOOGLE_APPLICATION_CREDENTIALS
const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'gsc-output')
const KEYWORDS_JSON = path.join(OUTPUT_DIR, 'keywords.json')
const KEYWORDS_MD = path.join(OUTPUT_DIR, 'keywords-report.md')
const PREVIOUS_JSON = path.join(OUTPUT_DIR, 'keywords-previous.json')

interface QueryRow {
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface QueryPageRow {
  query: string
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface KeywordsFile {
  generatedAt: string
  property: string
  startDate: string
  endDate: string
  days: number
  totals: { clicks: number; impressions: number; ctr: number; position: number }
  queries: QueryRow[]
  queryPages: QueryPageRow[]
}

// ─────────────────────────────────────────────────────────────────────
// Flags
// ─────────────────────────────────────────────────────────────────────
function parseFlags(argv: string[]): { days: number; rowLimit: number; minImpr: number } {
  let days = 28
  let rowLimit = 1000
  let minImpr = 1
  for (const arg of argv) {
    if (arg.startsWith('--days=')) {
      const n = parseInt(arg.slice('--days='.length), 10)
      if (!Number.isFinite(n) || n <= 0 || n > 480) throw new Error(`Invalid --days: ${arg}`)
      days = n
    } else if (arg.startsWith('--row-limit=')) {
      const n = parseInt(arg.slice('--row-limit='.length), 10)
      if (!Number.isFinite(n) || n <= 0 || n > 25000) throw new Error(`Invalid --row-limit: ${arg}`)
      rowLimit = n
    } else if (arg.startsWith('--min-impr=')) {
      const n = parseInt(arg.slice('--min-impr='.length), 10)
      if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid --min-impr: ${arg}`)
      minImpr = n
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown flag: ${arg}`)
    }
  }
  return { days, rowLimit, minImpr }
}

// ─────────────────────────────────────────────────────────────────────
// Date helpers — GSC expects YYYY-MM-DD in property's timezone (UTC-ish)
// ─────────────────────────────────────────────────────────────────────
function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function dateRange(days: number): { startDate: string; endDate: string } {
  // GSC data lags ~2 days. End at "today - 2", start at "end - (days - 1)".
  const today = new Date()
  const end = new Date(today)
  end.setUTCDate(end.getUTCDate() - 2)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - (days - 1))
  return { startDate: fmtDate(start), endDate: fmtDate(end) }
}

// ─────────────────────────────────────────────────────────────────────
// API call
// ─────────────────────────────────────────────────────────────────────
async function querySearchAnalytics(
  property: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  rowLimit: number,
): Promise<any[]> {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
  const searchconsole = google.searchconsole({ version: 'v1', auth })

  const all: any[] = []
  let startRow = 0
  const PAGE_SIZE = Math.min(rowLimit, 25000)
  // Paginate up to rowLimit rows total (or until API runs out).
  while (all.length < rowLimit) {
    const remaining = rowLimit - all.length
    const thisLimit = Math.min(PAGE_SIZE, remaining)
    const res = await guardedCall(
      () =>
        searchconsole.searchanalytics.query(
          {
            siteUrl: property,
            requestBody: {
              startDate,
              endDate,
              dimensions,
              rowLimit: thisLimit,
              startRow,
              dataState: 'final',
            },
          },
          GAXIOS_OPTS,
        ),
      `keywords ${dimensions.join('+')} @${startRow}`,
    )
    const rows = res.data.rows || []
    all.push(...rows)
    if (rows.length < thisLimit) break
    startRow += rows.length
  }
  return all
}

// ─────────────────────────────────────────────────────────────────────
// Report writers
// ─────────────────────────────────────────────────────────────────────
function fmtNum(n: number, digits = 0): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

function buildMarkdown(data: KeywordsFile, previous: KeywordsFile | null): string {
  const lines: string[] = []
  lines.push(`# GSC keyword report — ${data.property}`)
  lines.push('')
  lines.push(`Generated: ${data.generatedAt}`)
  lines.push(`Window:    ${data.startDate} → ${data.endDate}  (${data.days} days)`)
  lines.push('')
  lines.push(`**Totals:** ${fmtNum(data.totals.clicks)} clicks · ${fmtNum(data.totals.impressions)} impressions · CTR ${fmtPct(data.totals.ctr)} · avg position ${data.totals.position.toFixed(1)}`)
  if (previous) {
    const dClicks = data.totals.clicks - previous.totals.clicks
    const dImpr = data.totals.impressions - previous.totals.impressions
    const dPos = data.totals.position - previous.totals.position
    lines.push('')
    lines.push(`vs previous run: ${dClicks >= 0 ? '+' : ''}${dClicks} clicks · ${dImpr >= 0 ? '+' : ''}${fmtNum(dImpr)} impressions · position ${dPos >= 0 ? '+' : ''}${dPos.toFixed(2)}`)
  }
  lines.push('')

  // Top 50 queries by impressions
  const top50 = [...data.queries].sort((a, b) => b.impressions - a.impressions).slice(0, 50)
  lines.push('## Top 50 queries by impressions')
  lines.push('')
  lines.push('| # | Query | Impr | Clicks | CTR | Pos |')
  lines.push('|---:|---|---:|---:|---:|---:|')
  top50.forEach((r, i) => {
    lines.push(`| ${i + 1} | ${r.query} | ${fmtNum(r.impressions)} | ${fmtNum(r.clicks)} | ${fmtPct(r.ctr)} | ${r.position.toFixed(1)} |`)
  })
  lines.push('')

  // Almost-there queries — position 11-20 with at least a few impressions
  const almost = data.queries
    .filter((r) => r.position > 10 && r.position <= 20 && r.impressions >= 5)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
  lines.push(`## Almost there — position 11-20, ≥5 impressions (${almost.length})`)
  lines.push('')
  lines.push('Highest-leverage optimization targets. Small ranking gains here pull queries onto page 1.')
  lines.push('')
  if (almost.length === 0) {
    lines.push('_No queries match._')
  } else {
    lines.push('| Query | Impr | Pos |')
    lines.push('|---|---:|---:|')
    for (const r of almost) lines.push(`| ${r.query} | ${fmtNum(r.impressions)} | ${r.position.toFixed(1)} |`)
  }
  lines.push('')

  // Page 1 already (pos 1-10) but no clicks — CTR / title-and-snippet issue
  const ctrIssue = data.queries
    .filter((r) => r.position <= 10 && r.impressions >= 10 && r.clicks === 0)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
  lines.push(`## Page 1, zero clicks — CTR / snippet issue (${ctrIssue.length})`)
  lines.push('')
  lines.push('Queries where we rank on page 1 but earn no clicks. Usually a title/description rewrite problem.')
  lines.push('')
  if (ctrIssue.length === 0) {
    lines.push('_No queries match._')
  } else {
    lines.push('| Query | Impr | Pos |')
    lines.push('|---|---:|---:|')
    for (const r of ctrIssue) lines.push(`| ${r.query} | ${fmtNum(r.impressions)} | ${r.position.toFixed(1)} |`)
  }
  lines.push('')

  // Top earning queries (clicks)
  const topClicks = [...data.queries].sort((a, b) => b.clicks - a.clicks).slice(0, 20).filter((r) => r.clicks > 0)
  lines.push(`## Top earning queries by clicks (${topClicks.length})`)
  lines.push('')
  if (topClicks.length === 0) {
    lines.push('_No clicks recorded in window._')
  } else {
    lines.push('| Query | Clicks | Impr | CTR | Pos |')
    lines.push('|---|---:|---:|---:|---:|')
    for (const r of topClicks) lines.push(`| ${r.query} | ${fmtNum(r.clicks)} | ${fmtNum(r.impressions)} | ${fmtPct(r.ctr)} | ${r.position.toFixed(1)} |`)
  }
  lines.push('')

  // Top landing pages by impressions (collapsed from query×page join)
  const pageMap = new Map<string, { clicks: number; impressions: number; queries: number }>()
  for (const r of data.queryPages) {
    const m = pageMap.get(r.page) || { clicks: 0, impressions: 0, queries: 0 }
    m.clicks += r.clicks
    m.impressions += r.impressions
    m.queries += 1
    pageMap.set(r.page, m)
  }
  const topPages = [...pageMap.entries()]
    .map(([page, v]) => ({ page, ...v }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
  lines.push(`## Top landing pages by impressions (${topPages.length})`)
  lines.push('')
  lines.push('| Page | Impr | Clicks | Distinct queries |')
  lines.push('|---|---:|---:|---:|')
  for (const p of topPages) lines.push(`| ${p.page} | ${fmtNum(p.impressions)} | ${fmtNum(p.clicks)} | ${p.queries} |`)
  lines.push('')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────
async function main() {
  const flags = parseFlags(process.argv.slice(2))

  if (!SITE_URL) throw new Error('GSC_SITE_URL is not set. Add it to .env.local.')
  if (!CREDS) throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set. Add it to .env.local.')
  if (!fs.existsSync(CREDS)) throw new Error(`Service account JSON not found at: ${CREDS}`)

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const { startDate, endDate } = dateRange(flags.days)
  console.log(`GSC keywords — ${SITE_URL}`)
  console.log(`Property:    ${PROPERTY}`)
  console.log(`Window:      ${startDate} → ${endDate}  (${flags.days} days)`)
  console.log(`Row limit:   ${flags.rowLimit}`)
  console.log('')

  console.log('Fetching queries (dimensions: [query])...')
  const queryRows = await querySearchAnalytics(PROPERTY!, startDate, endDate, ['query'], flags.rowLimit)
  const queries: QueryRow[] = queryRows
    .map((r: any) => ({
      query: (r.keys && r.keys[0]) || '',
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: r.ctr ?? 0,
      position: r.position ?? 0,
    }))
    .filter((r) => r.impressions >= flags.minImpr)
  console.log(`  ${queries.length} query rows (≥${flags.minImpr} impressions)`)

  console.log('Fetching query × page (dimensions: [query, page])...')
  const qpRows = await querySearchAnalytics(PROPERTY!, startDate, endDate, ['query', 'page'], flags.rowLimit)
  const queryPages: QueryPageRow[] = qpRows.map((r: any) => ({
    query: (r.keys && r.keys[0]) || '',
    page: (r.keys && r.keys[1]) || '',
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }))
  console.log(`  ${queryPages.length} query×page rows`)

  // Totals (no dimensions — single row)
  const totalsRows = await querySearchAnalytics(PROPERTY!, startDate, endDate, [], 1)
  const totalsRow = totalsRows[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 }
  const totals = {
    clicks: totalsRow.clicks ?? 0,
    impressions: totalsRow.impressions ?? 0,
    ctr: totalsRow.ctr ?? 0,
    position: totalsRow.position ?? 0,
  }

  const data: KeywordsFile = {
    generatedAt: new Date().toISOString(),
    property: PROPERTY!,
    startDate,
    endDate,
    days: flags.days,
    totals,
    queries,
    queryPages,
  }

  // Preserve previous run for diffing
  let previous: KeywordsFile | null = null
  if (fs.existsSync(KEYWORDS_JSON)) {
    try {
      previous = JSON.parse(fs.readFileSync(KEYWORDS_JSON, 'utf8'))
    } catch {
      previous = null
    }
    fs.copyFileSync(KEYWORDS_JSON, PREVIOUS_JSON)
  }

  fs.writeFileSync(KEYWORDS_JSON, JSON.stringify(data, null, 2))
  fs.writeFileSync(KEYWORDS_MD, buildMarkdown(data, previous))

  console.log('')
  console.log('Done.')
  console.log('')
  console.log(`Totals: ${fmtNum(totals.clicks)} clicks · ${fmtNum(totals.impressions)} impressions · CTR ${fmtPct(totals.ctr)} · pos ${totals.position.toFixed(1)}`)
  console.log('')
  console.log(`JSON:   ${path.relative(process.cwd(), KEYWORDS_JSON)}`)
  console.log(`Report: ${path.relative(process.cwd(), KEYWORDS_MD)}`)
}

main().catch((err) => {
  console.error('\nFAILED:', err?.message || err)
  process.exit(1)
})
