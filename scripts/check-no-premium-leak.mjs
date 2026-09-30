#!/usr/bin/env node
/**
 * PREMIUM LEAK GUARD — structural, manifest-INDEPENDENT.
 *
 * Refuses to let premium material enter the PUBLIC aicanvas repo, by PATH, by
 * CONTENT MARKER, and by SECRET SHAPE:
 *   - injected premium working folders   (components-workspace|design-systems)/zz-premium-*
 *   - generated premium shims            *.premium.generated.(ts|tsx), premium-registry.generated.*
 *   - the premium source marker          a fixed token the inject script stamps
 *                                         into every premium file (in ANY path)
 *   - a GitHub Personal Access Token     ghp_… / github_pat_…
 *
 * The CONTENT MARKER is the real backstop: every premium source file MUST carry
 * it, so a hand-authored or mis-placed premium file is blocked even when it is
 * NOT under the zz-premium- path. The marker is assembled from parts below so
 * this guard never matches itself; the inject script must use the identical
 * marker (ideally a shared constant) so the two can't drift.
 *
 * Works before any premium component exists and cannot drift from a manifest.
 * Runs as a pre-commit hook (--staged), a pre-push hook (full tree), and in CI.
 *
 * Usage:
 *   node scripts/check-no-premium-leak.mjs            # whole tracked tree
 *   node scripts/check-no-premium-leak.mjs --staged   # staged blobs only
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const staged = process.argv.includes('--staged')
const listCmd = staged
  ? 'git diff --cached --name-only --diff-filter=ACM'
  : 'git ls-files'

let files
try {
  files = execSync(listCmd, { encoding: 'utf8' }).split('\n').map((s) => s.trim()).filter(Boolean)
} catch (err) {
  console.error('check-no-premium-leak: could not list files:', err.message)
  process.exit(1)
}

// Read the version that WOULD be committed: in --staged mode the staged BLOB
// (`git show :path`), not the working tree — otherwise a stage-then-revert
// (e.g. `git add -p` then edit) slips a secret past the scan (TOCTOU). Full-tree
// mode reads the working copy of tracked files.
function readContent(f) {
  try {
    if (staged) return execSync(`git show :"${f}"`, { encoding: 'utf8' })
    return readFileSync(f, 'utf8')
  } catch {
    return '' // deleted / binary / unreadable — nothing to scan
  }
}

const PREMIUM_PATH =
  /(^|\/)(components-workspace-premium|design-systems-premium)\/|(^|\/)(components-workspace|design-systems)\/zz-premium-/
const PREMIUM_GENERATED =
  /\.premium\.generated\.(ts|tsx|js)$|(^|\/)premium-registry\.generated\.|(^|\/)component-copy\.premium\.generated\./
// Assembled from parts so THIS file does not contain the literal marker (which
// would make the content scan flag the guard itself). Keep in sync with inject.
const MARKER = new RegExp(['AICANVAS', 'PREMIUM', 'DO', 'NOT', 'COMMIT'].join('-'))
const PAT = /\bghp_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/

// ── Injected FREE design-system components (v2) ──────────────────────────────
// scripts/inject-premium.mjs copies vault-authored FREE components into
// design-systems/<system>/components/ at build time (manifest key
// `freeSystemComponents`). Free for users, but the VAULT is their source of
// record — the injected copies must never be committed here. The injected set
// is read from registry-data/_premium.json (written by inject) and, as a
// fallback, recomputed from the managed block in git info/exclude. Both may be
// absent (fork, never injected) → empty set, guard fully inert.
// A path already committed at HEAD is the repo's own source, the same rule
// inject follows (committed always wins, the vault only fills gaps), so it is
// never reported. info/exclude is shared by every worktree, and an older
// worktree's block can still list a file this branch has since committed.
function committedPaths() {
  try {
    return new Set(
      execSync('git ls-tree -r --name-only HEAD design-systems', { encoding: 'utf8' })
        .split('\n').map((s) => s.trim()).filter(Boolean),
    )
  } catch {
    return new Set() // no HEAD yet / no git
  }
}
function injectedFreeDsPaths() {
  const paths = new Set()
  try {
    const premium = JSON.parse(readFileSync('registry-data/_premium.json', 'utf8'))
    const list = Array.isArray(premium.freeSystemComponents) ? premium.freeSystemComponents : []
    for (const p of list) if (typeof p === 'string') paths.add(p)
  } catch { /* not injected / no manifest */ }
  try {
    const excludeFile = execSync('git rev-parse --git-path info/exclude', { encoding: 'utf8' }).trim()
    const lines = readFileSync(excludeFile, 'utf8').split('\n')
    const start = lines.indexOf('# BEGIN inject-premium free-ds')
    const end = lines.indexOf('# END inject-premium free-ds')
    if (start !== -1 && end > start) {
      for (const l of lines.slice(start + 1, end)) {
        const t = l.trim()
        if (t && !t.startsWith('#')) paths.add(t)
      }
    }
  } catch { /* no git / no exclude file */ }
  for (const p of committedPaths()) paths.delete(p)
  return paths
}
const FREE_DS_INJECTED = injectedFreeDsPaths()

// ── Brain content (premium .md + generated bundles) ──────────────────────────
// The design-system brain lives ONLY in the vault. Its content reaches this
// repo solely as the gitignored registry-data/_<slug>-brain.json bundle:
//   - a brain JSON bundle must never be tracked (any *-brain.json)
//   - design-systems/*/foundations/ and design-systems/*/_skills/ exist only in
//     the vault — any file there is vault material
//   - NEW rules.md / *.rules.md files under design-systems/ are vault material.
//     Checked in --staged mode against ADDED files only: the public repo
//     legitimately tracks a handful of frozen v1 rule files, which can only
//     ever show up as modifications, never additions.
const BRAIN_JSON = /(^|\/)registry-data\/[^/]*-brain\.json$/
const BRAIN_FOUNDATIONS = /(^|\/)design-systems\/[^/]+\/foundations\//
const BRAIN_SKILLS = /(^|\/)design-systems\/[^/]+\/_skills\//
const BRAIN_RULES_MD = /(^|\/)design-systems\/.+(\/rules\.md|\.rules\.md)$/
let stagedAdded = new Set()
if (staged) {
  try {
    stagedAdded = new Set(
      execSync('git diff --cached --name-only --diff-filter=A', { encoding: 'utf8' })
        .split('\n').map((s) => s.trim()).filter(Boolean),
    )
  } catch { /* listing failed — the ACM path/content scans still apply */ }
}

const violations = []

for (const f of files) {
  if (PREMIUM_PATH.test(f)) violations.push(`tracked premium working folder: ${f}`)
  if (PREMIUM_GENERATED.test(f)) violations.push(`tracked premium generated shim: ${f}`)
  if (FREE_DS_INJECTED.has(f)) {
    violations.push(
      `build-time-injected free design-system component: ${f} ` +
        '(vault-authored, injected by inject-premium.mjs — never commit the injected copy)',
    )
  }
  if (BRAIN_JSON.test(f)) violations.push(`brain content bundle: ${f} (generated premium content — never tracked)`)
  if (BRAIN_FOUNDATIONS.test(f)) violations.push(`brain foundations file: ${f} (vault-only premium content)`)
  if (BRAIN_SKILLS.test(f)) violations.push(`brain skill file: ${f} (vault-only premium content)`)
  if (staged && stagedAdded.has(f) && BRAIN_RULES_MD.test(f)) {
    violations.push(`NEW brain rules file: ${f} (vault-only premium content — rules are never added in the public repo)`)
  }
}

for (const f of files) {
  const content = readContent(f)
  if (!content) continue
  if (MARKER.test(content)) violations.push(`premium source marker in: ${f}`)
  if (PAT.test(content)) violations.push(`PAT-shaped token in: ${f}`)
}

if (violations.length > 0) {
  console.error('\n🚫 PREMIUM LEAK GUARD — refusing to proceed.')
  console.error('   The public aicanvas repo must never contain premium source,')
  console.error('   premium generated shims, or a GitHub token:\n')
  for (const v of violations) console.error('   • ' + v)
  console.error('\n   Premium source lives ONLY in the private aicanvas-premium repo.')
  console.error('   If this is a false positive, fix the path/marker/secret — do not bypass.\n')
  process.exit(1)
}

console.log(`premium leak guard: clean (${files.length} ${staged ? 'staged' : 'tracked'} files)`)
