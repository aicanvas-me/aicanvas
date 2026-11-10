#!/usr/bin/env node
/**
 * publish-premium.mjs — the ONE command that ships premium to production.
 *
 * Why this exists: production builds the EXACT premium commit recorded in
 * premium.lock.json (see scripts/inject-premium.mjs), never floating `main`. So a
 * bare `git push` on premium main does NOT go live on its own. Publishing = bump
 * the pin and push public. This script does that atomically and then proves the
 * release actually went live via /api/premium/health.
 *
 * What it does:
 *   1. Verifies the private premium checkout ($PREMIUM_LOCAL_PATH) is on `main` and clean.
 *   2. Pushes premium `main` to GitHub (so Vercel's read-only PAT can fetch the sha).
 *   3. Writes that sha into the PUBLIC premium.lock.json, commits it, pushes public `main`
 *      — which is what Vercel auto-deploys.
 *   4. Polls https://aicanvas.me/api/premium/health until prod serves that EXACT sha,
 *      degraded:false, the count matches the manifest and iconCount > 0. Only then reports success.
 *
 * Usage:
 *   PREMIUM_LOCAL_PATH=/path/to/aicanvas-premium npm run publish-premium
 *   flags: --yes (skip confirm)  --site <url> (default https://aicanvas.me)  --no-verify (skip health poll)
 *
 * Nothing here contains premium source — only a commit id crosses into the public repo.
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline'

const ROOT = process.cwd() // the public aicanvas repo
const LOCK = join(ROOT, 'premium.lock.json')
const args = process.argv.slice(2)
const YES = args.includes('--yes')
const NO_VERIFY = args.includes('--no-verify')
const SITE = (args[args.indexOf('--site') + 1] && args.includes('--site')) ? args[args.indexOf('--site') + 1] : 'https://aicanvas.me'

const die = (m) => { console.error('\n🚫 ' + m + '\n'); process.exit(1) }
const ok = (m) => console.log('✅ ' + m)
const step = (m) => console.log('\n▸ ' + m)
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'pipe' }).toString().trim()

// ── 0. Locate the premium checkout ───────────────────────────────────────────
const PREMIUM = process.env.PREMIUM_LOCAL_PATH
if (!PREMIUM) die('set PREMIUM_LOCAL_PATH to your aicanvas-premium checkout, e.g.\n   PREMIUM_LOCAL_PATH=/Users/you/aicanvas-premium npm run publish-premium')
try { sh('git rev-parse --is-inside-work-tree', PREMIUM) } catch { die(PREMIUM + ' is not a git repo') }

// ── 1. Premium must be on a clean `main` ─────────────────────────────────────
step('checking the premium checkout')
const pBranch = sh('git rev-parse --abbrev-ref HEAD', PREMIUM)
if (pBranch !== 'main') die(`premium is on "${pBranch}", not main. Merge finished work into main first (that is the release gate), then re-run.`)
if (sh('git status --porcelain', PREMIUM)) die('premium main has uncommitted changes. Commit or stash them first — only committed work can ship.')
const newSha = sh('git rev-parse HEAD', PREMIUM)
const shortSha = newSha.slice(0, 7)
ok(`premium main is clean @ ${shortSha}`)

// manifest count, so we can assert prod serves the right number of components
let manifestCount = null
try {
  const man = JSON.parse(readFileSync(join(PREMIUM, 'premium-manifest.json'), 'utf8'))
  manifestCount = Array.isArray(man.standalones) ? man.standalones.length : null
} catch { /* non-fatal */ }

// ── 2. Public must be on `main`; read the current pin ────────────────────────
const pubBranch = sh('git rev-parse --abbrev-ref HEAD', ROOT)
if (pubBranch !== 'main') die(`this (public) repo is on "${pubBranch}", not main. Run publish-premium from the public repo on main.`)
let currentPin = ''
try { currentPin = String(JSON.parse(readFileSync(LOCK, 'utf8')).sha || '') } catch { /* first pin */ }
if (currentPin === newSha) {
  ok(`premium.lock.json already points at ${shortSha} — nothing new to publish (premium main hasn't moved).`)
  if (!YES) process.exit(0)
}

// ── confirm ──────────────────────────────────────────────────────────────────
console.log('\nThis will:')
console.log(`  1. push premium main (${shortSha}) to GitHub`)
console.log(`  2. bump premium.lock.json  ${currentPin ? currentPin.slice(0, 7) : '(none)'} → ${shortSha}`)
console.log('  3. commit + push PUBLIC main  → triggers a production deploy')
console.log(`  4. verify ${SITE}/api/premium/health serves ${shortSha}`)
if (!YES) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await new Promise((r) => rl.question('\nProceed? (y/N) ', r))
  rl.close()
  if (!/^y(es)?$/i.test(answer.trim())) die('aborted — nothing pushed.')
}

// ── 3. Push premium main ─────────────────────────────────────────────────────
step('pushing premium main to GitHub')
try { execSync('git push origin main', { cwd: PREMIUM, stdio: 'inherit' }) } catch { die('failed to push premium main. Fix and re-run.') }
ok('premium main pushed')

// ── 4. Bump the pin, commit + push public ────────────────────────────────────
step('bumping premium.lock.json and pushing public')
const lockObj = (() => { try { return JSON.parse(readFileSync(LOCK, 'utf8')) } catch { return {} } })()
lockObj.sha = newSha
writeFileSync(LOCK, JSON.stringify(lockObj, null, 2) + '\n')
try {
  execSync(`git add ${JSON.stringify(LOCK)}`, { cwd: ROOT, stdio: 'pipe' })
  execSync(`git commit -m ${JSON.stringify('chore(premium): pin ' + shortSha)}`, { cwd: ROOT, stdio: 'inherit' })
  execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' })
} catch { die('failed to commit/push the pin. Resolve and re-run (premium was already pushed, so just re-running is safe).') }
ok('public main pushed — Vercel is now building public + premium@' + shortSha)

// ── 5. Verify it actually went live ──────────────────────────────────────────
if (NO_VERIFY) { ok('done (skipped health verification).'); process.exit(0) }
step(`waiting for production to serve ${shortSha} (polling ${SITE}/api/premium/health)`)
const DEADLINE = Date.now() + 8 * 60 * 1000 // 8 minutes
let confirmed = false
let iconCount = 0
while (Date.now() < DEADLINE) {
  await new Promise((r) => setTimeout(r, 12000))
  let h
  try {
    const res = await fetch(`${SITE}/api/premium/health`, { cache: 'no-store' })
    h = await res.json()
  } catch { process.stdout.write('.'); continue }
  const shaOk = h.premiumSha === newSha && h.pinnedSha === newSha
  const countOk = manifestCount == null || h.premiumStandaloneCount === manifestCount
  iconCount = h.iconCount ?? 0
  const iconsOk = iconCount > 0
  if (shaOk && h.degraded === false && countOk && iconsOk) { confirmed = true; break }
  process.stdout.write('.')
}
console.log('')
if (confirmed) {
  ok(`LIVE and verified: production serves premium@${shortSha}, degraded:false${manifestCount != null ? `, ${manifestCount} component(s)` : ''}, ${iconCount} icon(s).`)
} else {
  die(`NOT confirmed within the timeout. The deploy may still be building — re-check ${SITE}/api/premium/health in a minute (look for premiumSha == ${shortSha}, degraded:false, iconCount > 0). Do NOT assume it's live until it matches.`)
}
