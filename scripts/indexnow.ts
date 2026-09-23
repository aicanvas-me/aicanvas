/**
 * indexnow.ts — tell IndexNow search engines (Bing, Yandex, Seznam, Naver)
 * which aicanvas.me URLs are new, with no account and no daily quota worth
 * worrying about (10,000 URLs per request).
 *
 * The key is public by design: IndexNow proves site ownership by fetching it
 * from public/indexnow-key.txt on the live site. It is not a secret.
 *
 * Modes:
 *   --state=<file>   Ping the live-sitemap URLs missing from <file>, then write
 *                    the sitemap to <file>. No file yet = ping everything once.
 *                    This is what the post-deploy workflow runs.
 *   --all            Ping every URL in the live sitemap.
 *   --url=<URL>      Ping one URL (repeatable).
 *   --dry-run        Print what would be pinged, send nothing.
 *
 * ponytail: --state only catches URLs that are NEW in the sitemap. A changed
 * page is not pinged on deploy (the sitemap carries no lastmod to tell which
 * changed); ping one by hand with --url, or add a path-to-URL map if that
 * starts to matter.
 *
 * Run:
 *   npm run indexnow -- --url=https://aicanvas.me/components/cube-carousel
 */

import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const HOST = 'aicanvas.me'
const ORIGIN = `https://${HOST}`
const KEY_FILE = 'indexnow-key.txt'
const KEY_LOCATION = `${ORIGIN}/${KEY_FILE}`
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const TIMEOUT_MS = 30_000

// Regex, not an XML parser: the post-deploy workflow runs this with no npm
// install, and the sitemap is our own flat <urlset>.
export function sitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1])
}

/** URLs in `current` that `known` has not seen. `known` null = first run, everything is new. */
export function newUrls(current: string[], known: string[] | null): string[] {
  if (!known) return current
  const seen = new Set(known)
  return current.filter((u) => !seen.has(u))
}

async function get(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`GET ${url}: HTTP ${res.status}`)
  return res.text()
}

function parseFlags(argv: string[]) {
  const urls: string[] = []
  let all = false
  let dryRun = false
  let state: string | null = null
  for (const arg of argv) {
    if (arg === '--all') all = true
    else if (arg === '--dry-run') dryRun = true
    else if (arg.startsWith('--state=')) state = arg.slice('--state='.length)
    else if (arg.startsWith('--url=')) {
      const u = arg.slice('--url='.length).trim()
      if (!u.startsWith(`${ORIGIN}/`) && u !== ORIGIN) throw new Error(`--url must be on ${ORIGIN}: ${u}`)
      urls.push(u)
    } else throw new Error(`Unknown flag: ${arg}`)
  }
  if ([all, state !== null, urls.length > 0].filter(Boolean).length !== 1) {
    throw new Error('Pick exactly one of --all, --state=<file>, --url=<URL>')
  }
  return { urls, all, dryRun, state }
}

async function main() {
  const flags = parseFlags(process.argv.slice(2))
  const key = fs.readFileSync(path.join(process.cwd(), 'public', KEY_FILE), 'utf8').trim()

  let sitemap: string[] | null = null
  let toPing = flags.urls
  if (flags.all || flags.state) {
    sitemap = sitemapLocs(await get(`${ORIGIN}/sitemap.xml`))
    if (!sitemap.length) throw new Error('Live sitemap has no <loc> entries')
    let known: string[] | null = null
    if (flags.state && fs.existsSync(flags.state)) known = JSON.parse(fs.readFileSync(flags.state, 'utf8'))
    toPing = flags.all ? sitemap : newUrls(sitemap, known)
    console.log(`Sitemap: ${sitemap.length} URLs${flags.state ? `, ${known ? `${known.length} already known` : 'no state yet'}` : ''}`)
  }

  console.log(`IndexNow: ${toPing.length} URL(s) to ping${flags.dryRun ? ' (dry run)' : ''}`)
  for (const u of toPing) console.log(`  ${u}`)

  if (toPing.length && !flags.dryRun) {
    // IndexNow answers 403 when it cannot read the key, which says nothing
    // about why. Checking the live file first names the real cause.
    const live = (await get(KEY_LOCATION).catch(() => '')).trim()
    if (live !== key) throw new Error(`${KEY_LOCATION} does not serve the key in public/${KEY_FILE} yet. Is the deploy live?`)

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key, keyLocation: KEY_LOCATION, urlList: toPing }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    // 200 = accepted, 202 = accepted while the key is still being checked.
    if (res.status !== 200 && res.status !== 202) {
      throw new Error(`IndexNow answered HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
    }
    console.log(`Done. IndexNow accepted ${toPing.length} URL(s) (HTTP ${res.status}).`)
  } else if (!toPing.length) {
    console.log('Done. Nothing new to ping.')
  }

  // Record the sitemap only after a successful ping, so a failed run retries next deploy.
  if (flags.state && sitemap && !flags.dryRun) fs.writeFileSync(flags.state, JSON.stringify(sitemap, null, 2))
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('\nFAILED:', err instanceof Error ? err.message : String(err))
    process.exit(1)
  })
}
