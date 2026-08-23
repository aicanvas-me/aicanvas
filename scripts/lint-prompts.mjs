/**
 * Lint a component's `prompts.ts` 'Claude Code' lane against the seven-block scaffold.
 *
 * The scaffold's premise: blocks 1-4 are EXTRACTION from index.tsx, not prose about
 * index.tsx. Every failure this script hunts is a string that already existed in the
 * source and died during the retype — a className that lost its text colour, a hex that
 * got paraphrased as "a teal accent", a `key={}` that never made it across.
 *
 * MODES
 *   node scripts/lint-prompts.mjs                 corpus advisory report (always exit 0)
 *   node scripts/lint-prompts.mjs --strict <slug> reviewer gate (exit 1 on any violation)
 *   node scripts/lint-prompts.mjs --fix <slug>    inject npm install line + Root note only
 *   node scripts/lint-prompts.mjs --selftest      assert the extractors on fixtures
 *   node scripts/lint-prompts.mjs --ci            selftest + every prompt evaluates +
 *                                                 strict on every scoped/new-format prompt
 *
 * WHAT MAKES A SLUG STRICT: membership in scripts/prompts-scaffold-scope.json, NOT the
 * presence of "## 4. Tree" in its own text. Keying it off the text made the gate opt-in by
 * the party it polices — delete one heading, go green forever. For a scoped slug a missing
 * heading is itself the failure. Unscoped legacy prose gets the advisory path and can never
 * hard-fail; an earlier probe proved a blanket className gate is noisy on prose and would
 * fail complete-but-prose prompts.
 *
 * Exit:  0 = clean / advisory, 1 = strict violations
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { findJSXReturnContentStart } from './lib/copy-paste-transform.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Premium is injected into components-workspace-premium/ by scripts/inject-premium.mjs.
// Scan it when present, exactly like tsc does.
const WORKSPACES = ['components-workspace', 'components-workspace-premium']
  .map(d => join(ROOT, d))
  .filter(existsSync)

const NEW_FORMAT_MARKER = '## 4. Tree'
const HEADINGS = [
  '## 1. Setup', '## 2. Constants', '## 3. State', '## 4. Tree',
  '## 5. Why', '## 6. Remix', '## 7. Check',
]

/**
 * SCOPE — which slugs are REQUIRED to be in the seven-block scaffold.
 *
 * This file is the whole reason the gate has teeth. Keying strictness off the prompt's own
 * content ("does it contain ## 4. Tree?") makes the gate opt-in by the very party it
 * polices: an agent facing a red lint can delete one heading and flip it green forever.
 * Scope lives OUTSIDE the prompt, so for a scoped slug a missing heading IS the failure.
 *
 * Add a slug the moment its prompt is converted. Forgetting is safe (it stays advisory,
 * the status quo). Removing one to silence a failure is deliberate and shows in the diff.
 */
const SCOPE_FILE = join(__dirname, 'prompts-scaffold-scope.json')
const SCOPE = new Set(
  existsSync(SCOPE_FILE) ? (JSON.parse(readFileSync(SCOPE_FILE, 'utf-8')).slugs ?? []) : []
)

/**
 * TIER: premium runs the SAME verbatim scaffold as free, plus two accident guards.
 *
 * Verbatim blocks 2-4 of a large premium component reproduce most of the paywalled
 * source, and that is accepted. The tier sells polished source files, CLI, MCP and
 * support, not secrecy, so the strongest possible prompt is on-strategy on both tiers.
 * There is no weaker or inverted rule set for premium prompts.
 *
 * The only premium-specific checks (see premiumGuards) are orthogonal to fidelity: the
 * source marker must never reach public prompt text, and private asset URLs must not be
 * pasted, because buyers rebuilding against them run up charges on an account that is
 * not theirs.
 */
// Assembled, never written as a literal: scripts/check-no-premium-leak.mjs content-scans
// every tracked public file for this exact string and would (correctly) refuse the commit.
// A lint that detects the marker cannot itself contain it.
const PREMIUM_MARKER = ['AICANVAS', 'PREMIUM', 'DO', 'NOT', 'COMMIT'].join('-')
const PRIVATE_ASSET_HOSTS = [/ik\.imagekit\.io\/[^\s'"`)]+/gi]

/** Prose caps for blocks 5-7, from the scaffold. Unenforced caps are not caps. */
const PROSE_CAPS = { '## 5. Why': [0, 8], '## 6. Remix': [3, 3], '## 7. Check': [5, 8] }

/** Split a scaffold prompt into { heading: body } so blocks can be checked individually. */
function splitBlocks(prompt) {
  const out = {}
  for (let i = 0; i < HEADINGS.length; i++) {
    const at = prompt.indexOf(HEADINGS[i])
    if (at === -1) continue
    const next = HEADINGS.slice(i + 1).map(h => prompt.indexOf(h, at + 1)).find(x => x > -1)
    out[HEADINGS[i]] = prompt.slice(at + HEADINGS[i].length, next === undefined ? prompt.length : next)
  }
  return out
}

const bulletCount = body => (body.match(/^\s*[-*]\s+\S/gm) ?? []).length
const contentLines = body => body.split('\n').filter(l => l.trim().length > 2).length

/** Module-scope `const NAME =` / `function name(` identifiers, i.e. what block 2 must carry. */
function scanModuleConsts(source) {
  const head = source.slice(0, source.search(/export\s+default\s+function/) + 1 || source.length)
  return [...new Set([
    ...[...head.matchAll(/^const\s+([A-Z_][A-Z0-9_]{2,})\s*=/gm)].map(m => m[1]),
    ...[...head.matchAll(/^function\s+([A-Za-z0-9_]+)\s*\(/gm)].map(m => m[1]),
  ])]
}

const ROOT_NOTE =
  'The source ships h-full because AI Canvas renders it inside a sized preview frame. ' +
  'A standalone paste needs min-h-screen, or an ancestor with a real height, or the root ' +
  'collapses and takes its absolute layers with it.'
const ROOT_NOTE_FULL_HEIGHT =
  'The root ships full height with min-h-screen and the CLI install delivers it exactly as shown, ' +
  'so a standalone paste needs no change. Drop it into a container of your own and that container ' +
  'needs a real height, or the root collapses and takes its absolute layers with it.'

// These three are copied from lint-components.mjs rather than extracted to lib/:
// that script sits in the build path and this is a lint, so a shared module is not
// worth the blast radius. Keep them in sync if the package rules change.
const ALWAYS_AVAILABLE = new Set(['react', 'react-dom', 'next', 'typescript'])
const ALWAYS_AVAILABLE_PREFIXES = ['react/', 'next/', '@types/']
const isAlwaysAvailable = pkg =>
  ALWAYS_AVAILABLE.has(pkg) || ALWAYS_AVAILABLE_PREFIXES.some(p => pkg.startsWith(p))
const getPackageName = p => (p.startsWith('@') ? p.split('/').slice(0, 2).join('/') : p.split('/')[0])

/**
 * Em-dashes in prompt prose. House style is a comma, colon or period, and a prompt is
 * copy a buyer reads. Fenced code blocks are exempt: those are verbatim source, so a
 * dash inside one belongs to the component, not to the prose.
 */
const EM_DASH = '\u2014'
function emDashHits(prompt) {
  const hits = []
  let inFence = false
  const lines = prompt.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) { inFence = !inFence; continue }
    if (!inFence && lines[i].includes(EM_DASH)) hits.push(`line ${i + 1}: ${lines[i].trim().slice(0, 90)}`)
  }
  return hits
}

// ─── Text normalisers ─────────────────────────────────────────────────────────
const lower = s => s.toLowerCase()
/** Collapse ALL whitespace — lets a prompt wrap a long expression across lines. */
const squash = s => s.replace(/\s+/g, '').toLowerCase()

// ─── Prompt extraction ────────────────────────────────────────────────────────

/**
 * Resolve the 'Claude Code' lane by actually evaluating the module.
 *
 * Reading the file text naively is wrong: 9 corpus files compose their lane from a
 * `const SPEC = \`...\`` (plus CARD_RADIUS / DROP_SHADOW / GP / RING consts), so a naive
 * read either misses the body entirely or scores `${SPEC}` as literal text. Evaluating
 * resolves every interpolation for free. The only module-level import in a prompts.ts is
 * the type-only `Platform`, so stripping the type syntax leaves valid ESM.
 */
async function loadLane(promptsPath) {
  let src = readFileSync(promptsPath, 'utf-8')
    .replace(/^import\s+type\s+.*$/m, '')
    .replace(/:\s*Partial<Record<Platform,\s*string>>/, '')
  const mod = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'))
  return mod.prompts?.['Claude Code'] ?? ''
}

// ─── index.tsx extractors ─────────────────────────────────────────────────────

/**
 * The root element's className, using the SAME definition the shipped copy-paste
 * transform uses: first `className="..."` after the JSX `return (` of the DEFAULT
 * export. Starting the search at `export default function` is what stops a helper
 * subcomponent defined above it from being mistaken for the root.
 */
function rootClassName(source) {
  const m = source.match(/export\s+default\s+function/)
  if (!m) return { value: null, dynamic: false }
  const start = findJSXReturnContentStart(source, m.index)
  if (start === -1) return { value: null, dynamic: false }

  // Take the FIRST className in any form, not the first quoted one. Measured: 4 corpus
  // roots are brace-form (`className={\`… \${font.className}\`}`); matching only quoted
  // classNames walked past them and handed back an INNER element's className, which
  // rule 3 then exempted from the verbatim check — a silent miss.
  const rest = source.slice(start)
  const at = rest.search(/className\s*=\s*/)
  if (at === -1) return { value: null, dynamic: false }
  const after = rest.slice(at).replace(/^className\s*=\s*/, '')
  if (after[0] === '"' || after[0] === "'") {
    return { value: after.slice(1, after.indexOf(after[0], 1)), dynamic: false }
  }
  return { value: readBraced(after, 0).replace(/\s+/g, ' ').trim(), dynamic: true }
}

/**
 * Harvest the STATIC class tokens out of a template-literal className.
 *
 * Skipping `className={`...`}` wholesale was a real blind spot: only the `${...}` parts are
 * unmatchable, and the literal text around them is ordinary class names that Tailwind scans
 * and a prompt must carry. Measured cost of the old behaviour: a live fix adding
 * `order-[var(--o)] md:order-[var(--o-md)]` inside a template literal passed strict
 * untouched while the prompt still described the class it had replaced.
 *
 * Conservative by construction. Any token TOUCHING an interpolation is dropped, since it may
 * be a fragment like `text-` from `text-${size}`. If stripping interpolations leaves stray
 * brace or backtick syntax (nested template literal, object literal), the whole className
 * degrades to the old skip-it behaviour rather than emitting garbage failures.
 */
function staticClassTokens(tpl) {
  let t = tpl.trim().replace(/^`/, '').replace(/`$/, '')
  if (!t.includes('${')) return t.split(/\s+/).filter(Boolean)
  // Sentinel, not a space: replacing with a space would split `text-${size}` into the
  // fragment `text-`, and rule 3 would then demand that fragment appear in the prompt.
  t = t.replace(/\$\{[^{}]*\}/g, '\u0000')
  if (t.includes('${') || t.includes('{') || t.includes('}') || t.includes('`')) return null
  return t.split(/\s+/).filter(x => x && !x.includes('\u0000') && /^[a-zA-Z]/.test(x))
}

/**
 * Split every className into static literals (checkable verbatim) and runtime-composed
 * ones (template literals / ternaries / cn() calls), which are reported as skipped
 * rather than failed — their final text does not exist in the source.
 */
function scanClassNames(source) {
  const statics = []
  const dynamic = []
  const re = /className\s*=\s*/g
  let m
  while ((m = re.exec(source)) !== null) {
    const i = m.index + m[0].length
    const ch = source[i]
    if (ch === '"' || ch === "'") {
      const end = source.indexOf(ch, i + 1)
      if (end !== -1) statics.push(source.slice(i + 1, end))
    } else if (ch === '{') {
      const inner = readBraced(source, i)
      const quoted = inner.match(/^\s*(["'])([^"'`]*)\1\s*$/)
      if (quoted) { statics.push(quoted[2]); continue }
      const tokens = inner.trim().startsWith('`') ? staticClassTokens(inner) : null
      if (tokens) statics.push(...tokens)
      dynamic.push(inner.slice(0, 70).replace(/\s+/g, ' '))
    }
  }
  return {
    statics: [...new Set(statics.map(s => s.trim()).filter(Boolean))],
    dynamic,
  }
}

/** Read a balanced `{...}` starting at `open`, returning the inside. */
function readBraced(source, open) {
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}' && --depth === 0) return source.slice(open + 1, i)
  }
  return source.slice(open + 1, open + 80)
}

/**
 * Hex and rgb()/rgba() literals.
 *
 * Canvas components build colours at runtime — `rgba(${dotRGB},${alpha.toFixed(3)})`.
 * Measured: 18 such strings across 12 corpus components. They are not literals, they
 * cannot appear verbatim in a prompt, and the naive `[^)]*` capture even truncates them
 * mid-`toFixed(`. Skip them the same way runtime-composed classNames are skipped.
 */
function scanColors(source) {
  const hexes = source.match(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g) ?? []
  const all = source.match(/rgba?\([^)]*\)/g) ?? []
  const composed = all.filter(r => r.includes('${'))
  return {
    hexes: [...new Set(hexes.map(lower))],
    rgbas: [...new Set(all.filter(r => !r.includes('${')).map(squash))],
    composed: [...new Set(composed.map(r => r.replace(/\s+/g, ' ')))],
  }
}

function scanIdentifiers(source) {
  const keys = []
  const re = /key\s*=\s*\{/g
  let m
  while ((m = re.exec(source)) !== null) {
    const open = m.index + m[0].length - 1
    keys.push(`key={${readBraced(source, open).trim()}}`)
  }
  return {
    keys: [...new Set(keys)],
    motionTags: [...new Set([...source.matchAll(/<(motion\.[A-Za-z0-9_]+)/g)].map(x => x[1]))],
    handlers: [...new Set([...source.matchAll(/\bconst\s+(handle[A-Za-z0-9_]*)/g)].map(x => x[1]))],
    exportName: source.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/)?.[1] ?? null,
  }
}

function scanPackages(source) {
  const pkgs = new Set()
  const re = /^import\s[\s\S]*?from\s+['"]([^'"]+)['"]/gm
  let m
  while ((m = re.exec(source)) !== null) {
    const p = m[1]
    if (p.startsWith('.') || p.startsWith('/')) continue
    const pkg = getPackageName(p)
    if (!isAlwaysAvailable(pkg)) pkgs.add(pkg)
  }
  return [...pkgs]
}

/**
 * Every `npm install ...` tail in a text, as token lists.
 *
 * Not just the first: measured false positives on three corpus prompts that mention
 * "npm install" in prose before the real line ("…npm install framer-motion" comment at
 * the top."). Splitting on punctuation as well as whitespace is what stops the trailing
 * backtick in "…@phosphor-icons/react`." from making the package look absent.
 */
function npmInstallTokens(text) {
  return [...text.matchAll(/npm install\s+([^\n]*)/g)]
    .map(m => m[1].trim().split(/[\s"'`,;()]+/).filter(Boolean))
}

// ─── The rules ────────────────────────────────────────────────────────────────

/** Rules 1-6. Returns { issues, skipped }. Caller gates on the Tree marker. */
function strictCheck(source, prompt) {
  const issues = []
  const pSquash = squash(prompt)
  const pLower = lower(prompt)

  // 1. Seven headings, present and in order.
  let cursor = -1
  for (const h of HEADINGS) {
    const at = prompt.indexOf(h, cursor + 1)
    if (at === -1) issues.push(`[1 headings] missing heading "${h}"`)
    else if (at < cursor) issues.push(`[1 headings] "${h}" appears out of order`)
    else cursor = at
  }

  // 2. Root sizing token.
  const root = rootClassName(source)
  if (!prompt.includes('min-h-screen')) {
    issues.push(
      `[2 root] prompt never says min-h-screen` +
      (root.value ? ` (root className in source: ${root.dynamic ? `{${root.value}}` : `"${root.value}"`})` : '') +
      ` — a naked paste collapses`
    )
  }

  // 3. Static classNames verbatim. Only a STATIC root is exempt: it legitimately differs
  //    by the h-full → min-h-screen swap that rule 2 already covers. A brace-form root
  //    exempts nothing — it is already skipped as runtime-composed.
  const { statics, dynamic } = scanClassNames(source)
  for (const cn of statics) {
    if (!root.dynamic && cn === root.value) continue
    if (!prompt.includes(cn)) issues.push(`[3 className] not in prompt: className="${cn}"`)
  }

  // 4. Colours.
  const { hexes, rgbas, composed } = scanColors(source)
  for (const h of hexes) if (!pLower.includes(h)) issues.push(`[4 color] not in prompt: ${h}`)
  for (const r of rgbas) if (!pSquash.includes(r)) issues.push(`[4 color] not in prompt: ${r}`)

  // 5. Identifiers the rebuilder cannot invent.
  const { keys, motionTags, handlers, exportName } = scanIdentifiers(source)
  for (const k of keys) if (!pSquash.includes(squash(k))) issues.push(`[5 ident] not in prompt: ${k}`)
  for (const t of motionTags) if (!prompt.includes(t)) issues.push(`[5 ident] not in prompt: <${t}`)
  for (const h of handlers) if (!prompt.includes(h)) issues.push(`[5 ident] not in prompt: const ${h}`)
  if (exportName && !prompt.includes(exportName)) {
    issues.push(`[5 ident] default export name not in prompt: ${exportName}`)
  }

  // 6. npm install line covers every bare-module import.
  const pkgs = scanPackages(source)
  const declared = npmInstallTokens(prompt)
  if (pkgs.length > 0) {
    if (declared.length === 0) {
      issues.push(`[6 setup] prompt has no "npm install" line (source imports: ${pkgs.join(' ')})`)
    } else for (const p of pkgs) {
      if (!declared.some(toks => toks.includes(p))) {
        issues.push(`[6 setup] "${p}" missing from every npm install line in the prompt`)
      }
    }
  }

  // 7. Block substance. Rules 3-5 have almost nothing to check on a literal-poor component
  //    (sphere-lines: 1 className, 2 hexes, 0 handlers, 0 keys), so a seven-heading shell
  //    would sail through. These floors are what stop an empty scaffold passing.
  const blocks = splitBlocks(prompt)
  for (const h of ['## 2. Constants', '## 3. State', '## 4. Tree']) {
    const body = blocks[h]
    if (body !== undefined && contentLines(body) < 3) {
      issues.push(`[7 substance] "${h}" has ${contentLines(body)} content line(s) — an empty block is not a filled block`)
    }
  }

  // 8. Module-scope constants. The value of a canvas or math component lives here, not in
  //    its classNames. Paraphrasing a constant is exactly the wave-lines / jar-of-emotions
  //    drift the advisory scores surfaced.
  for (const id of scanModuleConsts(source)) {
    if (!prompt.includes(id)) issues.push(`[8 const] module constant not in prompt: ${id}`)
  }

  // 9. Prose caps. Unenforced caps are not caps.
  for (const [h, [min, max]] of Object.entries(PROSE_CAPS)) {
    const body = blocks[h]
    if (body === undefined) continue
    const n = bulletCount(body)
    if (n < min) issues.push(`[9 caps] "${h}" has ${n} bullets, needs at least ${min}`)
    if (n > max) issues.push(`[9 caps] "${h}" has ${n} bullets, cap is ${max}`)
  }

  return {
    issues,
    skipped: [
      ...dynamic.map(d => `className={${d}}`),
      ...composed.map(c => `color ${c})`),
    ],
  }
}

/**
 * PREMIUM guards: accident guards only, NOT a fidelity policy.
 *
 * Premium prompts use the SAME verbatim scaffold as free. The tier sells polished source
 * files, CLI, MCP and support, not secrecy, so a high-fidelity prompt is on-strategy.
 * There is no weaker or inverted rule set for premium.
 *
 * What remains is orthogonal to fidelity and protects against accidents rather than policy:
 *   P1  the source marker must never appear in prompt text, which ships publicly.
 *   P2  private asset URLs must not be pasted. This is a bandwidth and account concern, not
 *       a leak one: buyers rebuilding against ik.imagekit.io run up charges on an account
 *       that is not theirs. Describe the asset and let the buyer supply their own.
 */
function premiumGuards(prompt, source = '') {
  const issues = []

  // P3: a @property default renders into the PUBLIC props table on the component page.
  // For a gated premium component that table is the ONLY anon-visible surface for the URL
  // (the component itself is never shipped to anonymous visitors, so it is not in any page
  // chunk). The code default may hold the real URL; the JSDoc default must not. Describe the
  // asset in the description instead and let the buyer supply their own.
  for (const line of source.split('\n')) {
    if (!line.includes('@property')) continue
    for (const re of PRIVATE_ASSET_HOSTS) {
      for (const url of line.match(re) ?? []) {
        issues.push(`[P3 propstable] private asset URL in a @property default, which renders publicly in the props table: ${url}`)
      }
    }
  }

  if (prompt.includes(PREMIUM_MARKER)) {
    issues.push(`[P1 marker] the source marker is inside the prompt TEXT, which ships publicly`)
  }

  for (const re of PRIVATE_ASSET_HOSTS) {
    for (const url of prompt.match(re) ?? []) {
      issues.push(`[P2 asset] private asset URL in prompt text: ${url} — describe the asset, let the buyer supply their own`)
    }
  }

  return issues
}

/** Advisory scoring for legacy prose prompts — score only, never pass/fail. */
function advise(source, prompt) {
  const { hexes } = scanColors(source)
  const pLower = lower(prompt)
  const missed = hexes.filter(h => !pLower.includes(h))
  return {
    rootToken: prompt.includes('min-h-screen'),
    hexTotal: hexes.length,
    hexMissed: missed.length,
    missRate: hexes.length === 0 ? 0 : missed.length / hexes.length,
    worst: missed.slice(0, 6),
  }
}

// ─── Corpus walk ──────────────────────────────────────────────────────────────

function findComponents() {
  const out = []
  for (const ws of WORKSPACES) {
    for (const e of readdirSync(ws, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name.startsWith('_')) continue
      const dir = join(ws, e.name)
      const index = join(dir, 'index.tsx')
      const prompts = join(dir, 'prompts.ts')
      if (existsSync(index) && existsSync(prompts)) out.push({ slug: e.name, dir, index, prompts })
    }
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug))
}

async function load(c) {
  const source = readFileSync(c.index, 'utf-8')
  const raw = readFileSync(c.prompts, 'utf-8')
  let prompt = ''
  let loadError = null
  try {
    prompt = await loadLane(c.prompts)
  } catch (e) {
    loadError = e.message.split('\n')[0]
  }
  return {
    ...c, source, raw, prompt, loadError,
    isNew: prompt.includes(NEW_FORMAT_MARKER),
    premium: source.includes(PREMIUM_MARKER) || raw.includes(PREMIUM_MARKER),
    scoped: SCOPE.has(c.slug),
  }
}

const pct = n => `${(n * 100).toFixed(0)}%`

// ─── Modes ────────────────────────────────────────────────────────────────────

async function runStrict(slug) {
  const c = findComponents().find(x => x.slug === slug)
  if (!c) {
    console.log(`\n✗ No component "${slug}" with both index.tsx and prompts.ts\n`)
    process.exit(1)
  }
  const f = await load(c)
  console.log(`\nPrompt Lint (strict) — ${slug}\n`)

  if (f.loadError) {
    console.log(`✗ could not evaluate prompts.ts: ${f.loadError}\n`)
    process.exit(1)
  }

  const dashes = emDashHits(f.prompt)
  if (dashes.length) {
    console.log(`\u2717 ${dashes.length} em-dash(es) in the 'Claude Code' lane. Use a comma, colon or period:\n`)
    for (const d of dashes) console.log(`    \u2192 ${d}`)
    console.log()
    process.exit(1)
  }

  if (f.premium) console.log(`premium component — same verbatim scaffold as free, plus the marker and asset guards\n`)

  if (!f.isNew) {
    // SCOPED but not converted, or converted and then un-converted. This is the branch that
    // closes the self-disarming hole: for a scoped slug, deleting the "## 4. Tree" heading
    // does not escape the gate, it IS the failure.
    if (f.scoped) {
      console.log(`✗ ${slug} is listed in scripts/prompts-scaffold-scope.json but its prompt has no "${NEW_FORMAT_MARKER}".`)
      console.log(`  Either restore the seven-block scaffold, or remove the slug from the scope file`)
      console.log(`  as a deliberate, reviewable change. Deleting the heading is not an escape hatch.\n`)
      process.exit(1)
    }
    const a = advise(f.source, f.prompt)
    console.log(`legacy prose prompt (no "${NEW_FORMAT_MARKER}", not in scope) — advisory only, never a hard fail`)
    console.log(`  root token min-h-screen : ${a.rootToken ? 'present' : 'ABSENT'}`)
    console.log(`  hex drift               : ${a.hexMissed}/${a.hexTotal} missing (${pct(a.missRate)} miss rate)`)
    if (a.worst.length) console.log(`  first missing           : ${a.worst.join(' ')}`)
    console.log(`\nRewrite it to the seven-block scaffold to get the real gate.\n`)
    process.exit(0)
  }

  if (!f.scoped) {
    console.log(`note: ${slug} is in the new format but NOT listed in scripts/prompts-scaffold-scope.json.`)
    console.log(`      Add it, or the gate can be disarmed later by deleting one heading.\n`)
  }

  const { issues, skipped } = strictCheck(f.source, f.prompt)
  if (f.premium) issues.push(...premiumGuards(f.prompt, f.source))
  if (skipped.length) {
    console.log(`${skipped.length} runtime-composed value(s) skipped (no verbatim text to match):`)
    for (const d of skipped) console.log(`    ~ ${d}`)
    console.log()
  }
  if (issues.length === 0) {
    console.log('✓ Seven-block scaffold intact\n')
    process.exit(0)
  }
  console.log(`✗ ${issues.length} violation(s):\n`)
  for (const i of issues) console.log(`    → ${i}`)
  console.log(`\nEvery one of these is a string already sitting in index.tsx. Paste it, do not describe it.\n`)
  process.exit(1)
}

async function runAdvisory() {
  const comps = findComponents()
  const rows = []
  let newFormat = 0, legacy = 0, broken = 0, skippedTotal = 0
  const strictFails = []
  const emDashed = []

  for (const c of comps) {
    const f = await load(c)
    if (f.loadError) {
      broken++
      rows.push({ slug: f.slug, note: `EVAL FAILED: ${f.loadError}` })
      continue
    }
    const a = advise(f.source, f.prompt)
    const dashes = emDashHits(f.prompt).length
    if (dashes) emDashed.push(`${f.slug}(${dashes})`)
    skippedTotal += scanClassNames(f.source).dynamic.length + scanColors(f.source).composed.length
    if (f.isNew) {
      newFormat++
      const { issues } = strictCheck(f.source, f.prompt)
      if (issues.length) strictFails.push({ slug: f.slug, n: issues.length })
      rows.push({ slug: f.slug, fmt: 'new', a, strict: issues.length })
    } else {
      legacy++
      rows.push({ slug: f.slug, fmt: 'legacy', a })
    }
  }

  console.log(`\nPrompt Lint — advisory report over ${comps.length} components`)
  console.log(`workspaces: ${WORKSPACES.map(w => w.replace(ROOT + '/', '')).join(', ')}\n`)
  console.log(`  slug                            fmt     root      hex drift`)
  console.log(`  ${'-'.repeat(68)}`)
  for (const r of rows) {
    if (r.note) { console.log(`  ${r.slug.padEnd(31)} ${r.note}`); continue }
    const rootCol = r.a.rootToken ? 'ok  ' : 'MISS'
    const hexCol = r.a.hexTotal === 0 ? '-' : `${r.a.hexMissed}/${r.a.hexTotal} (${pct(r.a.missRate)})`
    const strictCol = r.strict === undefined ? '' : r.strict === 0 ? '  strict:ok' : `  strict:${r.strict} fail`
    console.log(`  ${r.slug.padEnd(31)} ${r.fmt.padEnd(7)} ${rootCol}      ${hexCol}${strictCol}`)
  }

  const scored = rows.filter(r => r.a && r.a.hexTotal > 0)
  const avg = scored.reduce((s, r) => s + r.a.missRate, 0) / (scored.length || 1)
  const noRoot = rows.filter(r => r.a && !r.a.rootToken)
  const clean = scored.filter(r => r.a.hexMissed === 0)

  console.log(`\nSummary`)
  const row = (label, v) => console.log(`  ${label.padEnd(44)}: ${v}`)
  row(`new-format (has "${NEW_FORMAT_MARKER}")`, newFormat)
  row('legacy prose', legacy)
  if (broken) row('prompts.ts that would not eval', broken)
  row('missing root token min-h-screen', noRoot.length)
  row('zero hex drift', `${clean.length}/${scored.length}`)
  row('mean hex miss rate', pct(avg))
  row('runtime-composed classNames + colors skipped', skippedTotal)
  row('prompts with em-dashes in prose', emDashed.length)
  if (emDashed.length) console.log(`\n  em-dashes (hard fail under --strict): ${emDashed.join(', ')}`)
  if (strictFails.length) {
    console.log(`\n  new-format files failing strict: ${strictFails.map(f => `${f.slug}(${f.n})`).join(', ')}`)
    console.log(`  run: node scripts/lint-prompts.mjs --strict <slug>`)
  }
  console.log(`\nAdvisory only — always exits 0. The gate is --strict <slug>.\n`)
  process.exit(0)
}

/** Inject the npm install line and the Root note into a legacy prompt. Nothing else. */
async function runFix(slug) {
  const c = findComponents().find(x => x.slug === slug)
  if (!c) {
    console.log(`\n✗ No component "${slug}"\n`)
    process.exit(1)
  }
  const f = await load(c)
  if (f.loadError) {
    console.log(`\n✗ could not evaluate prompts.ts: ${f.loadError}\n`)
    process.exit(1)
  }

  const pkgs = scanPackages(f.source)
  const root = rootClassName(f.source)
  const inject = []

  const declared = npmInstallTokens(f.prompt)
  const undeclared = pkgs.filter(p => !declared.some(toks => toks.includes(p)))
  if (undeclared.length) inject.push(`// npm install ${pkgs.join(' ')}`)
  if (!f.prompt.includes('min-h-screen')) {
    const swapped = root.value && !root.dynamic ? root.value.replace(/\bh-full\b/g, 'min-h-screen') : null
    // The note describes the source as shipped, so decide from the source itself.
    const note = root.value?.includes('min-h-screen') ? ROOT_NOTE_FULL_HEIGHT : ROOT_NOTE
    inject.push(
      (swapped ? `Root element: className="${swapped}"\n` : `Root element must use min-h-screen.\n`) + note
    )
  }

  if (inject.length === 0) {
    console.log(`\n✓ ${slug} already has both the npm install line and the root note — nothing to inject\n`)
    process.exit(0)
  }

  const raw = readFileSync(c.prompts, 'utf-8')
  const m = raw.match(/['"]Claude Code['"]\s*:\s*`/)
  if (!m) {
    console.log(`\n✗ ${slug}: could not find the 'Claude Code' lane opening backtick — fix by hand\n`)
    process.exit(1)
  }
  const at = m.index + m[0].length
  const block = inject.join('\n\n') + '\n\n'
  writeFileSync(c.prompts, raw.slice(0, at) + block + raw.slice(at))

  console.log(`\n✓ ${slug} — injected into the 'Claude Code' lane:\n`)
  for (const line of block.trimEnd().split('\n')) console.log(`    ${line}`)
  console.log()
  process.exit(0)
}

// ─── Self-check ───────────────────────────────────────────────────────────────
// The corpus is 100% legacy today, so the strict path has no live coverage. These
// fixtures are the smallest thing that fails if the extractors break.
function selftest() {
  const assert = (cond, msg) => { if (!cond) { console.log(`✗ ${msg}`); process.exitCode = 1 } else console.log(`  ok  ${msg}`) }

  const src = `'use client'
// npm install framer-motion @phosphor-icons/react
import { motion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'

function Badge() {
  return (
    <span className="helper-root-decoy">x</span>
  )
}

export default function DemoThing() {
  const handleTap = () => {}
  return (
    <div className="flex h-full w-full bg-[#E8E8DF]">
      <motion.ul className={\`px-2 \${open ? 'a' : 'b'}\`}>
        {items.map(i => <motion.li key={i.id} className="rounded-full" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />)}
      </motion.ul>
      <canvas data-fill={\`rgba(\${dotRGB},\${alpha.toFixed(3)})\`} />
    </div>
  )
}`

  assert(rootClassName(src).value === 'flex h-full w-full bg-[#E8E8DF]', 'rootClassName skips the helper defined above the default export')
  const braceRoot = src.replace('className="flex h-full w-full bg-[#E8E8DF]"', 'className={`flex h-full w-full bg-[#E8E8DF] ${font.className}`}')
  assert(rootClassName(braceRoot).dynamic === true, 'brace-form root detected as dynamic, so no inner className gets wrongly exempted')
  const cn = scanClassNames(src)
  assert(cn.dynamic.length === 1, 'template-literal className detected as runtime-composed, not failed')
  assert(cn.statics.includes('rounded-full'), 'static classNames collected')
  assert(cn.statics.includes('px-2'), 'static tokens INSIDE a template-literal className are harvested (regression: order-[var(--o)] blind spot)')
  assert(!staticClassTokens('`text-${size} px-2`').includes('text-'), 'a token touching an interpolation is dropped, never emitted as a fragment')
  assert(staticClassTokens('`text-${size} px-2`').includes('px-2'), 'the untouched token beside an interpolation still counts')
  assert(staticClassTokens('`a ${cond ? `x` : `y`} b`').join(' ') === 'a b', 'a nested template literal inside an interpolation is consumed with it; surrounding static tokens still count')
  assert(staticClassTokens('`a ${xs.map(v => ({ v }))} b`') === null, 'brace syntax surviving the strip degrades to skip, not to garbage')
  const col = scanColors(src)
  assert(col.hexes.includes('#e8e8df') && col.rgbas[0] === 'rgba(255,255,255,0.3)', 'colours normalised (case + whitespace)')
  assert(col.rgbas.length === 1 && col.composed.length === 1, 'runtime-composed rgba() skipped, not failed (the one FP the corpus scan found)')
  const id = scanIdentifiers(src)
  assert(id.exportName === 'DemoThing' && id.keys[0] === 'key={i.id}' && id.motionTags.length === 2 && id.handlers[0] === 'handleTap', 'identifiers extracted')

  // A realistic filled scaffold: every block has substance, prose blocks respect the caps.
  const good = [
    '## 1. Setup',
    '// npm install framer-motion @phosphor-icons/react',
    "'use client' · export default function DemoThing()",
    "import { motion } from 'framer-motion'",
    '## 2. Constants',
    'function Badge() — helper, renders className="helper-root-decoy"',
    'const items: Item[] = [...]',
    'no module-scope colour constants',
    '## 3. State',
    'const handleTap = () => {}',
    'no refs',
    'no effects',
    '## 4. Tree',
    'div className="min-h-screen w-full bg-[#E8E8DF]"',
    '  motion.ul className={`px-2 ${open ? \'a\' : \'b\'}`}',
    '    motion.li key={i.id} className="rounded-full" style={{ color: \'rgba(255, 255, 255, 0.3)\' }} [map items]',
    '## 5. Why',
    '- the helper is defined above the default export on purpose',
    '- the list key is the item id, not the index',
    '## 6. Remix',
    '- swap the background bg-[#E8E8DF]',
    '- change the row radius rounded-full',
    '- retime the spring',
    '## 7. Check',
    '- a naked paste fills the viewport',
    '- #E8E8DF appears unchanged',
    '- every animated element is a motion.* tag',
    '- keys are stable across reorders',
    '- the helper renders above the root',
  ].join('\n')
  const goodIssues = strictCheck(src, good).issues
  assert(goodIssues.length === 0, `a complete seven-block prompt passes strict${goodIssues.length ? ' — got: ' + goodIssues.join(' | ') : ''}`)

  // Rules 7-9: the shell that rules 3-5 alone would wave through.
  const shell = HEADINGS.join('\n') + '\nDemoThing min-h-screen'
  assert(strictCheck(src, shell).issues.some(i => i.startsWith('[7 substance]')), 'an empty seven-heading shell fails rule 7')
  assert(strictCheck(src, good.replace('function Badge() — helper, renders ', '')).issues.some(i => i.startsWith('[8 const]')), 'a dropped module-scope helper fails rule 8')
  const over = good + '\n' + Array.from({ length: 4 }, (_, i) => `- extra bullet ${i}`).join('\n')
  assert(strictCheck(src, over).issues.some(i => i.startsWith('[9 caps]')), 'a 9-bullet Check block breaks the 5-8 cap (rule 9)')
  const under = good.replace(/^- (a naked paste|#E8E8DF appears|every animated).*$/gm, '')
  assert(strictCheck(src, under).issues.some(i => i.includes('needs at least 5')), 'a 2-bullet Check block breaks the lower bound (rule 9)')
  assert(premiumGuards('see https://ik.imagekit.io/aitoolkit/models/chair.glb').some(i => i.startsWith('[P2 asset]')), 'a private asset URL fails the premium guards')
  assert(premiumGuards(PREMIUM_MARKER).some(i => i.startsWith('[P1 marker]')), 'the source marker in prompt text fails the premium guards')
  assert(premiumGuards(good).length === 0, 'a clean verbatim prompt passes the premium guards (fidelity is no longer policed)')
  const jsdocSrc = " * @property {string} [model='https://ik.imagekit.io/aitoolkit/models/chair.glb'] the model"
  assert(premiumGuards('', jsdocSrc).some(i => i.startsWith('[P3 propstable]')), 'a private asset URL in a @property default is caught (it renders in the public props table)')
  assert(premiumGuards('', "  model: 'https://ik.imagekit.io/aitoolkit/models/chair.glb',").length === 0, 'the same URL as a CODE default is fine, only the JSDoc one renders publicly')

  // replaceAll, not replace: the hex appears in both block 4 and block 7, and replacing only
  // the first left rule 4 satisfied by the survivor — the assert passed for the wrong reason.
  const bad = good.replaceAll('#E8E8DF', 'a warm sand tone').replaceAll('key={i.id}', 'give each item a key')
  const badIssues = strictCheck(src, bad).issues
  assert(badIssues.some(i => i.startsWith('[4 color]')) && badIssues.some(i => i.startsWith('[5 ident]')), 'paraphrased hex and dropped key both fail')

  assert(strictCheck(src, good.replace('min-h-screen', 'h-full')).issues.some(i => i.startsWith('[2 root]')), 'h-full root fails rule 2')

  // The other measured FP: prose says "npm install" before the real line, and the real
  // line ends in a backtick. Both used to make present packages look missing.
  const proseFirst = good.replace(
    '// npm install framer-motion @phosphor-icons/react',
    'Add a "// npm install framer-motion" comment at the top.\n// npm install framer-motion @phosphor-icons/react`.'
  )
  assert(!strictCheck(src, proseFirst).issues.some(i => i.startsWith('[6 setup]')), 'prose "npm install" mention + trailing backtick do not fake a missing package')
  console.log()
}

// ─── Entry ────────────────────────────────────────────────────────────────────

const [flag, arg] = process.argv.slice(2)
if (flag === '--strict') {
  if (!arg) { console.log('\nusage: node scripts/lint-prompts.mjs --strict <slug>\n'); process.exit(1) }
  await runStrict(arg)
} else if (flag === '--fix') {
  if (!arg) { console.log('\nusage: node scripts/lint-prompts.mjs --fix <slug>\n'); process.exit(1) }
  await runFix(arg)
} else if (flag === '--selftest') {
  console.log('\nPrompt Lint — selftest\n')
  selftest()
} else if (flag === '--ci') {
  // Deterministic backstop for the reviewer agent, which is skippable and non-deterministic.
  // Safe to run in CI because GitHub Actions cannot block a Vercel deploy; this can never
  // gate production. Advisory mode deliberately still exits 0, so a prompt that fails to
  // evaluate would otherwise be invisible to everything except a full build.
  console.log('\nPrompt Lint — CI\n')
  selftest()
  let failures = 0
  for (const c of findComponents()) {
    const f = await load(c)
    if (f.loadError) {
      console.log(`✗ ${f.slug}: prompts.ts does not evaluate — ${f.loadError}`)
      failures++
      continue
    }
    if (f.premium) {
      const guards = premiumGuards(f.prompt, f.source)
      if (guards.length) { console.log(`✗ ${f.slug} (premium guards): ${guards.length} violation(s)`); failures++ }
      // falls through to the same scope + strict checks as a free component
    }
    if (f.scoped && !f.isNew) {
      console.log(`✗ ${f.slug}: in scope but missing "${NEW_FORMAT_MARKER}"`)
      failures++
      continue
    }
    if (f.isNew) {
      const { issues } = strictCheck(f.source, f.prompt)
      if (issues.length) { console.log(`✗ ${f.slug}: ${issues.length} strict violation(s)`); failures++ }
    }
    const dashes = emDashHits(f.prompt).length
    if (dashes) { console.log(`✗ ${f.slug}: ${dashes} em-dash(es) in prose`); failures++ }
  }
  console.log(failures === 0 ? '\n✓ every prompt evaluates; every scoped and new-format prompt passes\n' : `\n✗ ${failures} component(s) failing\n`)
  process.exit(failures === 0 && !process.exitCode ? 0 : 1)
} else {
  await runAdvisory()
}
