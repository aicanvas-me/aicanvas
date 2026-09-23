/**
 * bing-submit.ts — Bing Webmaster URL submission, the Bing twin of gsc-submit.ts.
 *
 * Two modes:
 *
 *   1. Batch (default): reads scripts/bing-output/audit.json (produced by
 *      bing-audit.ts) and submits the URLs Bing has not crawled yet
 *      ("Unknown to Bing", "Discovered, not crawled"), within today's quota.
 *      A URL submitted in the last RESUBMIT_AFTER_DAYS is skipped: Bing
 *      takes days to act, and re-sending it only burns quota.
 *
 *   2. Single URL: --url=<URL> submits one URL directly, skipping audit.json.
 *
 * Quota: GetUrlSubmissionQuota, checked before every run. On 2026-09-23 it
 * was 100 a day and 700 a month for aicanvas.me.
 *
 * Flags:
 *   --dry-run      Print what would be submitted, exit.
 *   --limit=N      Cap submissions below the quota.
 *   --url=<URL>    Submit one URL directly.
 *
 * Run:
 *   npm run bing:submit -- --dry-run
 *   npm run bing:submit -- --url=https://aicanvas.me/components/cube-carousel
 */

import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { bingPost, getQuota, scrubbed } from './bing-api.ts'
import type { AuditFile, Category } from './bing-audit.ts'

const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'bing-output')
const AUDIT_JSON = path.join(OUTPUT_DIR, 'audit.json')
const SUBMIT_LOG = path.join(OUTPUT_DIR, 'submit-log.json')
const SUBMITTABLE: Category[] = ['Unknown to Bing', 'Discovered, not crawled']
const RESUBMIT_AFTER_DAYS = 14
const BATCH_SIZE = 100

export interface SubmitLogEntry {
  url: string
  submittedAt: string
  category: string
  status: 'success' | 'error'
  error?: string
}

function readSubmitLog(): SubmitLogEntry[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(SUBMIT_LOG, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function appendToSubmitLog(entries: SubmitLogEntry[]) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.writeFileSync(SUBMIT_LOG, JSON.stringify([...readSubmitLog(), ...entries], null, 2))
}

/** URLs eligible today: not crawled yet, and not sent successfully within the resubmit window. */
export function pickUrls(
  audit: Pick<AuditFile, 'entries'>,
  log: SubmitLogEntry[],
  cap: number,
  now = Date.now(),
): { eligible: number; picked: { url: string; category: string }[] } {
  const cutoff = now - RESUBMIT_AFTER_DAYS * 24 * 60 * 60 * 1000
  const recent = new Set(log.filter((l) => l.status === 'success' && Date.parse(l.submittedAt) > cutoff).map((l) => l.url))
  const eligible = audit.entries.filter((e) => SUBMITTABLE.includes(e.category) && !recent.has(e.url))
  return { eligible: eligible.length, picked: eligible.slice(0, Math.max(0, cap)).map((e) => ({ url: e.url, category: e.category })) }
}

function parseFlags(argv: string[]) {
  let dryRun = false
  let limit = Infinity
  let url: string | null = null
  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true
    else if (arg.startsWith('--limit=')) {
      const n = parseInt(arg.slice('--limit='.length), 10)
      if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid --limit value: ${arg}`)
      limit = n
    } else if (arg.startsWith('--url=')) {
      const u = arg.slice('--url='.length).trim()
      if (!/^https?:\/\//.test(u)) throw new Error(`--url is not a valid http(s) URL: ${u}`)
      url = u
    } else throw new Error(`Unknown flag: ${arg}`)
  }
  return { dryRun, limit, url }
}

async function submit(batch: { url: string; category: string }[]): Promise<SubmitLogEntry[]> {
  const submittedAt = new Date().toISOString()
  try {
    await bingPost('SubmitUrlBatch', { urlList: batch.map((b) => b.url) })
    return batch.map((b) => ({ ...b, submittedAt, status: 'success' as const }))
  } catch (err) {
    const error = scrubbed(err)
    return batch.map((b) => ({ ...b, submittedAt, status: 'error' as const, error }))
  }
}

async function main() {
  const flags = parseFlags(process.argv.slice(2))
  const quota = await getQuota()
  const cap = Math.min(flags.limit, quota.DailyQuota, quota.MonthlyQuota)

  let picked: { url: string; category: string }[]
  let eligible: number
  if (flags.url) {
    picked = [{ url: flags.url, category: 'single-url' }]
    eligible = 1
  } else {
    if (!fs.existsSync(AUDIT_JSON)) throw new Error(`audit.json not found at ${AUDIT_JSON}.\nRun \`npm run bing:audit\` first.`)
    const audit: AuditFile = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'))
    const ageH = (Date.now() - Date.parse(audit.generatedAt)) / 3_600_000
    if (ageH > 24) console.warn(`⚠ audit.json is ${ageH.toFixed(1)}h old. Consider re-running bing:audit first.\n`)
    ;({ eligible, picked } = pickUrls(audit, readSubmitLog(), cap))
  }
  picked = picked.slice(0, Math.max(0, cap))

  console.log('Bing submit')
  console.log('---')
  console.log(`Quota left:   ${quota.DailyQuota} today, ${quota.MonthlyQuota} this month`)
  console.log(`Eligible:     ${eligible}`)
  console.log(`Will submit:  ${picked.length}`)
  console.log(`Dry run:      ${flags.dryRun ? 'yes' : 'no'}`)
  console.log('')

  if (!picked.length) {
    const why = eligible && cap <= 0 ? ` Quota used up, ${eligible} waiting.` : ''
    console.log(`Done. 0 ok, 0 errors.${why}`)
    return
  }
  if (flags.dryRun) {
    for (const p of picked) console.log(`  [${p.category}] ${p.url}`)
    console.log('\n(dry run — no submissions made)')
    return
  }

  const log: SubmitLogEntry[] = []
  for (let i = 0; i < picked.length; i += BATCH_SIZE) {
    const results = await submit(picked.slice(i, i + BATCH_SIZE))
    for (const r of results) console.log(`  ${r.status === 'success' ? 'OK   ' : 'ERROR'} ${r.url}${r.error ? ` — ${r.error}` : ''}`)
    log.push(...results)
  }
  appendToSubmitLog(log)

  const ok = log.filter((l) => l.status === 'success').length
  console.log('')
  console.log(`Done. ${ok} ok, ${log.length - ok} errors.${eligible > picked.length ? ` ${eligible - picked.length} left for later runs.` : ''}`)
  console.log(`Log: ${path.relative(process.cwd(), SUBMIT_LOG)}`)
  if (ok < log.length) process.exit(1)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('\nFAILED:', scrubbed(err))
    process.exit(1)
  })
}
