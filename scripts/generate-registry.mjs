/**
 * Generate shadcn-compatible registry JSON files from component source files.
 * Outputs to registry-data/ — each component gets its own JSON file. The files
 * are served at /r/<slug>.json by the dynamic route in app/r/[file]/route.ts
 * (NOT statically from public/), so the route can identify the caller and
 * enforce entitlement. Same bytes as before; only the on-disk location moved.
 *
 * Usage: node scripts/generate-registry.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, unlinkSync, existsSync } from 'fs'
import { join, dirname, resolve, relative, sep, posix } from 'path'
import { execSync } from 'child_process'
import { transformRootHeightClass } from './lib/copy-paste-transform.mjs'
import { DESIGN_SYSTEMS, FREE_DS_PLACEHOLDER_SENTINEL } from './lib/design-systems.config.mjs'
import { reconcileLedger } from './lib/order-ledger.mjs'
import { parseJsdocProps } from './lib/parse-jsdoc-props.mjs'

// A free-lane design-system component file counts as PRESENT only when it is the
// real injected source. A degraded/partial build leaves a sentinel-marked
// placeholder in its place (so direct imports resolve) — that must register as
// absent, exactly like a missing file, so a placeholder is never registered,
// props-parsed, or installed. See FREE_DS_PLACEHOLDER_SENTINEL / inject-premium.mjs.
function isInjectedComponentPresent(abs) {
  if (!existsSync(abs)) return false
  try {
    return !readFileSync(abs, 'utf-8').startsWith(FREE_DS_PLACEHOLDER_SENTINEL)
  } catch {
    return false
  }
}

// A design system's source root. Each system now owns one: Andromeda Legacy
// reads its committed tree, Andromeda Pro reads the tree the vault injects.
function dsRoot(ds) {
  return ds.rootDir
}

// Systems this build can actually read. An injected-only system (Andromeda Pro,
// whose whole tree comes from the vault) is skipped wholesale when its root is
// absent, so a fork or a no-PAT build emits Legacy alone instead of failing or
// shipping half a system.
const SYSTEMS = DESIGN_SYSTEMS.filter((ds) => {
  if (!ds.skipIfMissing || existsSync(dsRoot(ds))) return true
  console.warn(`generate-registry: skipping "${ds.slug}" — ${dsRoot(ds)} is not on disk`)
  return false
})

const wsDir = 'components-workspace'
const outDir = 'registry-data'
const SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json'
const REGISTRY_SCHEMA = 'https://ui.shadcn.com/schema/registry.json'

// Origin that serves the registry items (app/r/[file]/route.ts → /r/<slug>.json).
// registryDependencies MUST be fully-qualified URLs (or @namespace/name). A BARE
// slug makes shadcn resolve it against its DEFAULT registry (ui.shadcn.com) and
// 404 — which silently broke every design-system + template install. Emitting
// full URLs is the documented shadcn pattern for self-hosted/custom registries.
// Overridable so the generator can emit a localhost variant for install tests.
// Dependency ranges this app installs itself, for systems that pin them
// (design-systems.config.mjs `pinDependencies`). A package the app does not
// list (a font package the app loads through next/font instead) stays bare.
const APP_PACKAGE = JSON.parse(readFileSync('package.json', 'utf-8'))
const APP_RANGES = { ...(APP_PACKAGE.devDependencies ?? {}), ...(APP_PACKAGE.dependencies ?? {}) }

function pinnedDependencies(ds, pkgs) {
  if (!ds.pinDependencies) return pkgs
  return pkgs.map((pkg) => (APP_RANGES[pkg] ? `${pkg}@${APP_RANGES[pkg]}` : pkg))
}

// The `@types/*` companions of a pinned system's dependencies, as the item's
// devDependencies. A package that ships no types of its own (three) otherwise
// fails a fresh strict TypeScript project with TS7016. Only unscoped packages
// have a plain `@types/<name>`, and only a companion this app installs is named.
function typeDevDependencies(ds, pkgs) {
  if (!ds.pinDependencies) return []
  return pkgs
    .filter((pkg) => !pkg.startsWith('@') && APP_RANGES[`@types/${pkg}`])
    .map((pkg) => `@types/${pkg}@${APP_RANGES[`@types/${pkg}`]}`)
}

// Spread into an item: `dependencies`, and `devDependencies` only when there are any.
function dependencyFields(ds, pkgs) {
  const devDependencies = typeDevDependencies(ds, pkgs)
  return {
    dependencies: pinnedDependencies(ds, pkgs),
    ...(devDependencies.length > 0 ? { devDependencies } : {}),
  }
}

const REGISTRY_BASE = (process.env.AICANVAS_REGISTRY_BASE ?? 'https://aicanvas.me').replace(/\/+$/, '')
const depUrl = (slug) => `${REGISTRY_BASE}/r/${slug}.json`

// Folders to skip when building the public registry. `_template` is the
// scaffold copy-source and is never publicly installable.
const SKIP_FOLDERS = new Set(['_template'])

// ── Extract metadata from the component registry ──────────────────────────────

function parseRegistryMetadata() {
  const file = readFileSync('app/lib/component-registry.tsx', 'utf-8')
  const metadata = {}

  // IMPORTANT: scope parsing to the COMPONENTS_RAW array only. The entry regex
  // below is non-greedy, so if it runs over the whole file a `slug:` in an
  // earlier object (e.g. the `andromeda` design system in DESIGN_SYSTEMS) pairs
  // with the *first* component's `code: componentCodes[...]`, fabricating a
  // phantom component and clobbering the real one (wave-lines). Slice first.
  const rawStart = file.indexOf('const COMPONENTS_RAW')
  const rawEnd = file.indexOf('export const COMPONENTS', rawStart)
  if (rawStart === -1 || rawEnd === -1 || rawEnd <= rawStart) {
    throw new Error(
      'generate-registry: could not locate the COMPONENTS_RAW array in component-registry.tsx',
    )
  }
  const content = file.slice(rawStart, rawEnd)

  // Match each entry block in COMPONENTS_RAW
  const entryRegex = /\{\s*slug:\s*'([^']+)',[\s\S]*?code:\s*componentCodes\['([^']+)'\]/g
  let match
  while ((match = entryRegex.exec(content)) !== null) {
    const slug = match[1]
    const folder = match[2]
    const block = match[0]

    const nameMatch = block.match(/name:\s*(['"])((?:(?!\1).)*)\1/)
    const descMatch = block.match(/description:\s*(['"])((?:(?!\1).)*)\1/)
    const imageMatch = block.match(/image:\s*(['"])((?:(?!\1).)*)\1/)
    const badgeMatch = block.match(/badge:\s*(['"])((?:(?!\1).)*)\1/)
    const dualThemeMatch = block.match(/dualTheme:\s*true/)

    // Tags are a JSX-ish array of objects: tags: [ { label: 'X', accent: true }, ... ]
    // Capture every {...} entry inside the array.
    const tags = []
    const tagsBlockMatch = block.match(/tags:\s*\[([\s\S]*?)\]/)
    if (tagsBlockMatch) {
      const tagEntryRegex = /\{[^}]*label:\s*(['"])((?:(?!\1).)*)\1[^}]*\}/g
      let tm
      while ((tm = tagEntryRegex.exec(tagsBlockMatch[1])) !== null) {
        const label = tm[2]
        const accent = /accent:\s*true/.test(tm[0])
        tags.push({ label, accent })
      }
    }

    metadata[folder] = {
      slug,
      name: nameMatch ? nameMatch[2] : folder.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: descMatch ? descMatch[2].replace(/\\'/g, "'") : '',
      image: imageMatch ? imageMatch[2] : '',
      badge: badgeMatch ? badgeMatch[2] : undefined,
      dualTheme: !!dualThemeMatch,
      tags,
    }
  }

  return metadata
}

// ── Extract dependencies from source file ─────────────────────────────────────

function getDeps(content) {
  const match = content.match(/^\/\/ npm install (.+)$/m)
  if (!match) return []
  return match[1].split(' ').filter(Boolean)
}

// ── Convert folder name to readable title ─────────────────────────────────────

function toTitle(folder) {
  return folder
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ── Design-system dependency walker ───────────────────────────────────────────
// Used by `template` and `system` registry items to bundle every relative-imported
// file inside the system's `rootDir`. External imports (npm packages) become
// the item's `dependencies[]`.

const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.json']

// Built into any React/Next user project — never listed as installable deps.
function isProjectBuiltin(pkg) {
  if (pkg === 'react' || pkg === 'react-dom') return true
  if (pkg === 'next' || pkg.startsWith('next/')) return true
  return false
}

function toPackageName(spec) {
  // '@scope/pkg/sub' → '@scope/pkg'; 'pkg/sub' → 'pkg'
  if (spec.startsWith('@')) {
    const parts = spec.split('/')
    return parts.slice(0, 2).join('/')
  }
  return spec.split('/')[0]
}

// Match every quoted specifier reachable via `from '...'` (covers all variants
// of `import` / `import type` / `export ... from`) plus bare side-effect
// `import '...'` lines. The `from` keyword is unambiguous in JS/TS source so
// false positives in code strings are extremely rare.
function extractImportSpecifiers(content) {
  const specs = []
  const fromRe = /\bfrom\s+['"]([^'"]+)['"]/g
  let m
  while ((m = fromRe.exec(content)) !== null) specs.push(m[1])
  const sideRe = /^\s*import\s+['"]([^'"]+)['"]/gm
  while ((m = sideRe.exec(content)) !== null) specs.push(m[1])
  return specs
}

function resolveImport(fromFile, spec) {
  const baseDir = dirname(fromFile)
  const candidate = resolve(baseDir, spec)
  const tryPaths = [
    candidate,
    ...RESOLVE_EXTENSIONS.map((ext) => candidate + ext),
    ...RESOLVE_EXTENSIONS.map((ext) => join(candidate, 'index' + ext)),
  ]
  for (const p of tryPaths) {
    try { if (statSync(p).isFile()) return p } catch {}
  }
  return null
}

/**
 * Walk transitive relative imports starting from `entries`. Returns the closed
 * set of files this item ships, plus the set of external npm packages.
 *
 * `excludedFiles` lists absolute paths of files that another registry item
 * already ships (declared via `registryDependencies`). The walker treats them
 * as boundaries — it sees the import edge but does not ship the file or
 * recurse into it. Use this to keep tokens out of the system bundle, or
 * components out of template bundles.
 *
 * @param {string[]} entries        Absolute paths to entry files
 * @param {string}   rootDirAbs     Absolute path to the system's root directory
 * @param {Set<string>} [excludedFiles=new Set()]  Files already shipped by deps
 * @returns {{ files: string[], npmDeps: string[] }}
 */
function walkDependencies(entries, rootDirAbs, excludedFiles = new Set()) {
  const shipped = new Set()
  const queue = entries.filter((f) => !excludedFiles.has(f))
  const npmDeps = new Set()

  while (queue.length > 0) {
    const file = queue.shift()
    if (shipped.has(file)) continue
    shipped.add(file)

    let content
    try { content = readFileSync(file, 'utf-8') } catch {
      throw new Error(`walkDependencies: cannot read ${file}`)
    }

    for (const spec of extractImportSpecifiers(content)) {
      if (spec.startsWith('.') || spec.startsWith('/')) {
        const resolved = resolveImport(file, spec)
        if (!resolved) continue   // missing relative target — likely an asset/types path; skip silently
        const rel = relative(rootDirAbs, resolved)
        if (rel.startsWith('..') || rel === '' || rel.startsWith(sep)) {
          throw new Error(
            `walkDependencies: import escapes system root\n` +
            `  ${file}\n  imports "${spec}"\n  → ${resolved}\n  rootDir: ${rootDirAbs}\n` +
            `Design-system items must be self-contained.`,
          )
        }
        // Boundary: file is provided by a registry dep — record the edge and stop.
        if (excludedFiles.has(resolved)) continue
        queue.push(resolved)
      } else {
        const pkg = toPackageName(spec)
        if (!isProjectBuiltin(pkg)) npmDeps.add(pkg)
      }
    }
  }

  return {
    files: [...shipped].sort(),
    npmDeps: [...npmDeps].sort(),
  }
}

// Convert an absolute file path inside the system's rootDir into the registry
// `path` / `target` (POSIX, forward slashes). Layout under rootDir is preserved
// verbatim so internal relative imports continue to resolve in the user's project.
function targetPathFor(fileAbs, rootDirAbs, systemSlug) {
  const rel = relative(rootDirAbs, fileAbs).split(sep).join(posix.sep)
  return `components/aicanvas/${systemSlug}/${rel}`
}

// ── Main ──────────────────────────────────────────────────────────────────────

mkdirSync(outDir, { recursive: true })

const metadata = parseRegistryMetadata()

// Injected premium components (gitignored components-workspace-premium/, absent
// on forks). Emitted as GATED registry JSON under their clean slug from their own
// meta.json — never added to the public registry.json index.
const premiumWsDir = 'components-workspace-premium'
let premiumSlugDirs = []
try {
  premiumSlugDirs = readdirSync(premiumWsDir).filter((d) => {
    try { return statSync(join(premiumWsDir, d)).isDirectory() } catch { return false }
  })
} catch { /* none injected */ }

// Build the set of expected output filenames (slug-based) so we can
// delete any stale folder-named files left over from previous runs.
const expectedNames = new Set(
  readdirSync(wsDir)
    .filter(d => statSync(join(wsDir, d)).isDirectory() && !SKIP_FOLDERS.has(d))
    .map(d => (metadata[d]?.slug ?? d))
)
expectedNames.add('registry') // keep the root index
expectedNames.add('aicanvas-mcp') // MCP metadata file
for (const slug of premiumSlugDirs) expectedNames.add(slug) // keep gated premium JSON
expectedNames.add('_premium') // gate input (written by inject-premium) — must survive cleanup
expectedNames.add('_manifest') // gate manifest
// Brain files (written by inject-premium): the underscore page bundle
// (_<slug>-brain.json, /r can never serve it) AND the servable CLI item
// (<slug>-brain.json, gated as 'brain' premium content). Preserve the ones the
// current injection declared; a degraded run writes no brains key, so stale
// files get cleaned.
let premiumBrains = []
try {
  const premiumEarly = JSON.parse(readFileSync(join(outDir, '_premium.json'), 'utf-8'))
  premiumBrains = Array.isArray(premiumEarly.brains) ? [...premiumEarly.brains] : []
  for (const b of premiumBrains) {
    expectedNames.add(`_${b}-brain`)
    expectedNames.add(`${b}-brain`)
  }
} catch { /* no _premium.json — no brain files to preserve */ }
// The remix-prompt bundles inject-premium writes, one per whole-system design
// system. Underscore-prefixed so /r can never serve them; reserved here or the
// stale-file sweep below deletes them on every generate.
for (const ds of SYSTEMS) expectedNames.add(`_${ds.slug}-prompts`)
// Reserve filenames for design systems (tokens + per-component + system +
// templates) so they survive the stale-file cleanup pass.
function componentSlug(systemSlug, fileBaseName) {
  // Convert PascalCase file name to kebab-case, prefix with system slug.
  // Button.tsx → andromeda-button; PanelHeader.tsx → andromeda-panel-header.
  const kebab = fileBaseName
    .replace(/\.(tsx|ts|jsx|js|mjs|cjs)$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
  return `${systemSlug}-${kebab}`
}
// Resolve a system component's registry slug, honoring per-system `slugOverrides`
// (keyed by the file's posix path relative to the system rootDir). Lets a
// design-system component whose natural slug collides with a published standalone
// (e.g. Button.tsx → andromeda-button) emit under its own unique slug instead of
// being skipped.
function dsComponentSlug(ds, entryRelPosix, baseName) {
  return ds.slugOverrides?.[entryRelPosix] ?? componentSlug(ds.slug, baseName)
}
// A system's component entries with their optionality. `optionalSystemEntries`
// are build-time-injected v2 files (see scripts/inject-premium.mjs) that may
// legitimately be absent (degraded build / older premium pin) — consumers skip
// those with a warning instead of failing the walk.
function dsAllEntries(ds) {
  return [
    ...ds.systemEntries.map((path) => ({ path, optional: false })),
    ...(ds.optionalSystemEntries ?? []).map((path) => ({ path, optional: true })),
  ]
}
for (const ds of SYSTEMS) {
  expectedNames.add(`${ds.slug}-tokens`)
  expectedNames.add(ds.slug)
  for (const { path: entry, optional } of dsAllEntries(ds)) {
    // Optional entries only reserve their name while the file is actually
    // present — a degraded run must let the stale-cleanup pass below delete
    // the previous run's JSON so /r and the gate manifest stay in sync.
    if (optional && !isInjectedComponentPresent(resolve(dsRoot(ds), entry))) continue
    const baseName = entry.split('/').pop()
    expectedNames.add(dsComponentSlug(ds, entry, baseName))
  }
  for (const template of ds.templates) expectedNames.add(template.slug)
  if (ds.templates.length > 0) expectedNames.add(`${ds.slug}-all`)
}
for (const existing of readdirSync(outDir).filter(f => f.endsWith('.json'))) {
  const stem = existing.replace(/\.json$/, '')
  if (!expectedNames.has(stem)) {
    unlinkSync(join(outDir, existing))
  }
}

const dirs = readdirSync(wsDir).filter(d => {
  const p = join(wsDir, d)
  return statSync(p).isDirectory() && !SKIP_FOLDERS.has(d)
}).sort()

const registryItems = []
let count = 0

for (const dir of dirs) {
  const file = join(wsDir, dir, 'index.tsx')
  let content
  try { content = readFileSync(file, 'utf-8') } catch { continue }

  const meta = metadata[dir] || {}
  // Use the registry slug as the output name — if slug differs from folder (e.g.
  // traveldeck → floating-cards) the JSON file must be named after the slug so the
  // CLI URL on the component page resolves correctly.
  const name = meta.slug || dir
  const title = meta.name || toTitle(dir)
  const description = meta.description || ''
  const deps = getDeps(content)

  // Make copy-paste ready: h-full → min-h-screen on the ROOT element only
  // (see scripts/lib/copy-paste-transform.mjs for why root-only)
  const copyPasteReady = transformRootHeightClass(content)

  // Build the registry item JSON
  const item = {
    $schema: SCHEMA,
    name,
    type: 'registry:ui',
    title,
    description,
    author: 'aicanvas <https://aicanvas.me>',
    dependencies: deps,
    files: [
      {
        path: `components/aicanvas/${name}.tsx`,
        content: copyPasteReady,
        type: 'registry:ui',
        target: `components/aicanvas/${name}.tsx`,
      },
    ],
  }

  // Write individual item JSON
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(item, null, 2) + '\n')

  // Add to index (without content for smaller file)
  registryItems.push({
    name,
    type: 'registry:ui',
    title,
    description,
    dependencies: deps,
    files: [
      {
        path: `components/aicanvas/${name}.tsx`,
        type: 'registry:ui',
        target: `components/aicanvas/${name}.tsx`,
      },
    ],
  })

  count++
}

// ── Premium standalones (gated) ───────────────────────────────────────────────
// Emitted under their clean slug from their own meta.json. Served gated by /r
// (premiumSlugs); deliberately NOT added to registryItems (the public index).
//
// HIDDEN_SLUGS — temporarily withheld from the website's discovery surfaces
// (grid, homepage carousel, sidebar counts, MCP listing, search). These derive
// solely from `premiumMetas`, so excluding a slug there hides it everywhere at
// once while keeping the build assertions balanced. The gated JSON below is
// STILL written, so a hidden component stays installable via the CLI/MCP. Keep
// in sync with HIDDEN_SLUGS in app/lib/component-registry.tsx, which hides it
// from the runtime surfaces (detail page + sitemap). Add a slug to hide it.
const HIDDEN_SLUGS = new Set([])
let premiumCount = 0
const premiumMetas = []
for (const slug of premiumSlugDirs) {
  const file = join(premiumWsDir, slug, 'index.tsx')
  let content
  try { content = readFileSync(file, 'utf-8') } catch { continue }
  let pmeta = {}
  try { pmeta = JSON.parse(readFileSync(join(premiumWsDir, slug, 'meta.json'), 'utf-8')) } catch { /* fall back below */ }
  if (!HIDDEN_SLUGS.has(slug)) {
    premiumMetas.push({ slug, name: pmeta.name || toTitle(slug), description: pmeta.description || '', tags: pmeta.tags || [], image: pmeta.image, dependencies: getDeps(content) })
  }
  const item = {
    $schema: SCHEMA,
    name: slug,
    type: 'registry:ui',
    title: pmeta.name || toTitle(slug),
    description: pmeta.description || '',
    author: 'aicanvas <https://aicanvas.me>',
    dependencies: getDeps(content),
    files: [
      {
        path: `components/aicanvas/${slug}.tsx`,
        content: transformRootHeightClass(content),
        type: 'registry:ui',
        target: `components/aicanvas/${slug}.tsx`,
      },
    ],
  }
  writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(item, null, 2) + '\n')
  premiumCount++
}
if (premiumCount > 0) console.log(`Generated ${premiumCount} GATED premium component(s) in ${outDir}/`)

// ── Design systems & templates ───────────────────────────────────────────────
// Three-layer registry items connected by `registryDependencies` so files are
// installed exactly once regardless of which entry the user picks:
//
//   <slug>-tokens     (registry:lib)    — tokens.ts + utils + system icons
//   <slug>            (registry:style)  — every component file; deps on tokens
//   <slug>-<template> (registry:block)  — only the example folder; deps on system
//
// Note: shadcn's CLI requires the `type` field to be one of its known enum
// values — `registry:block` is shadcn vocabulary, kept verbatim in the JSON.
// Everything user-facing (URLs, copy, MCP tool names) uses "template".
//
// Internal relative imports stay intact because every layer writes into the
// same `components/aicanvas/<slug>/` tree, preserving the source layout.

let dsCount = 0

// Every shipped file is code (.ts/.tsx) → registry:lib. The .md "brain" docs are
// deliberately NOT shipped to consumers; they stay in design-systems/ for
// internal use only.
function makeFile(fileAbs, rootDirAbs, slug) {
  const target = targetPathFor(fileAbs, rootDirAbs, slug)
  return {
    path: target,
    content: readFileSync(fileAbs, 'utf-8'),
    type: 'registry:lib',
    target,
  }
}

function indexEntry(item, files) {
  return {
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies,
    devDependencies: item.devDependencies,
    registryDependencies: item.registryDependencies,
    files: files.map(({ path, type, target }) => ({ path, type, target })),
  }
}

// Premium standalone slugs (closed-source, born premium) come from
// registry-data/_premium.json, written by scripts/inject-premium.mjs at build
// time from the private repo's manifest. Absent (no premium injected, or a
// public fork with no PAT) → empty, so premium gating is fully inert.
let premiumSlugs = []
try {
  const premiumRaw = JSON.parse(readFileSync(join(outDir, '_premium.json'), 'utf8'))
  premiumSlugs = Array.isArray(premiumRaw.standalones) ? [...premiumRaw.standalones] : []
} catch { /* no _premium.json — no premium standalones */ }

// Content-type manifest consumed by the /r gate (lib/registry/lookup.ts).
// Collected from what this generator ACTUALLY emits, so the paywall classifier
// can never drift from the registry contents. Written as _manifest.json — the
// /r route's filename regex rejects leading underscores, so it is not servable.
const manifest = {
  systemSlugs: [],
  // Systems whose every item is paid-to-install (design-systems.config.mjs
  // `paidToInstall`). The gate reads this to tell a free MIT system's
  // components from a premium system's.
  paidSystemSlugs: SYSTEMS.filter((ds) => ds.paidToInstall).map((ds) => ds.slug).sort(),
  designSystemSlugs: [],
  templateSlugs: [],
  premiumSlugs,
  // Gated brain items (servable <slug>-brain.json written by inject-premium):
  // classified 'brain' by the gate — premium, mode-independent, fail-closed.
  brainSlugs: premiumBrains.map((b) => `${b}-brain`).sort(),
}

// Per-bundle popover copy, collected while emitting and written to the
// always-generated app/lib/install-contents.generated.ts after the loop.
const installContents = {}
// template slug → used-component count (null = full-system fallback)
const templateContents = new Map()

for (const ds of SYSTEMS) {
  const rootDirAbs = resolve(dsRoot(ds))
  const tokenEntriesAbs = (ds.tokenEntries ?? []).map((p) => resolve(rootDirAbs, p))
  // Optional (build-time-injected v2) entries join the system exactly like the
  // committed ones when their file exists; when absent the build stays green —
  // the entry is skipped with a warning and the gate-manifest count drops.
  const presentEntries = []
  for (const e of dsAllEntries(ds)) {
    if (e.optional && !isInjectedComponentPresent(resolve(rootDirAbs, e.path))) {
      console.warn(
        `generate-registry: WARNING — optional ${ds.slug} entry "${e.path}" is absent ` +
          '(not injected — degraded build or older premium pin); skipping its registry item.',
      )
      continue
    }
    presentEntries.push(e)
  }
  const systemEntriesAbs = presentEntries.map((e) => resolve(rootDirAbs, e.path))
  manifest.systemSlugs.push(ds.slug)

  // ── 1. Tokens ────────────────────────────────────────────────────────────────
  const tokensSlug = `${ds.slug}-tokens`
  const tokensWalk = walkDependencies(tokenEntriesAbs, rootDirAbs)
  const tokensFiles = tokensWalk.files.map((f) => makeFile(f, rootDirAbs, ds.slug))
  // Self-load the system font for installed projects. The app provides the font
  // via next/font; consumers don't — so inject the font import into the SHIPPED
  // tokens file ONLY (on-disk source stays clean, app keeps using next/font) and
  // declare the package so shadcn installs it for the consumer.
  const fontPackages = ds.fontPackages ?? []
  if (fontPackages.length > 0) {
    const injectTarget = targetPathFor(resolve(rootDirAbs, ds.fontInjectInto), rootDirAbs, ds.slug)
    const injectFile = tokensFiles.find((f) => f.target === injectTarget)
    if (!injectFile) {
      throw new Error(`generate-registry: fontInjectInto "${ds.fontInjectInto}" is not among the ${ds.slug} tokens files`)
    }
    injectFile.content = fontPackages.map((p) => `import '${p}';`).join('\n') + '\n' + injectFile.content
  }
  const tokensItem = {
    $schema: SCHEMA,
    name: tokensSlug,
    type: 'registry:lib',
    title: `${ds.name} tokens`,
    description: `Foundation files for the ${ds.name} design system — tokens, shared utilities, and the system mark. Required by every ${ds.name} component and template.`,
    author: 'aicanvas <https://aicanvas.me>',
    ...dependencyFields(ds, [...new Set([...tokensWalk.npmDeps, ...fontPackages])].sort()),
    files: tokensFiles,
  }
  writeFileSync(join(outDir, `${tokensSlug}.json`), JSON.stringify(tokensItem, null, 2) + '\n')
  registryItems.push(indexEntry(tokensItem, tokensFiles))
  dsCount++

  const tokensFileSet = new Set(tokensWalk.files)

  // ── 2. System (components) ───────────────────────────────────────────────────
  // Excludes anything shipped by the tokens item; depends on it via registry deps.
  const systemWalk = walkDependencies(systemEntriesAbs, rootDirAbs, tokensFileSet)
  const systemFiles = systemWalk.files.map((f) => makeFile(f, rootDirAbs, ds.slug))
  const systemItem = {
    $schema: SCHEMA,
    name: ds.slug,
    type: 'registry:style',
    title: `${ds.name} design system`,
    description: `Every ${ds.name} component (${systemFiles.length} files). Installs the foundation tokens automatically.`,
    author: 'aicanvas <https://aicanvas.me>',
    registryDependencies: [depUrl(tokensSlug)],
    ...dependencyFields(ds, systemWalk.npmDeps),
    files: systemFiles,
  }
  writeFileSync(join(outDir, `${ds.slug}.json`), JSON.stringify(systemItem, null, 2) + '\n')
  registryItems.push(indexEntry(systemItem, systemFiles))
  dsCount++

  const systemFileSet = new Set(systemWalk.files)
  const dsBoundary = new Set([...tokensFileSet, ...systemFileSet])

  // ── 2b. Individual components ───────────────────────────────────────────────
  // One installable item per component file. Each ships its own `.tsx` + sibling
  // `.rules.md`, depends on `andromeda-tokens` for the foundation, and declares
  // any other system components it imports as `registryDependencies` so the dep
  // graph stays correct (PanelHeader → IconButton → tokens, etc.).
  //
  // Collision handling: if a component's slug already exists as a published
  // standalone in `components-workspace/` (e.g. the inlined `andromeda-button`
  // wrapper), skip the system emit — the standalone retains the slug. Users on
  // that component's page get the standalone install command; the system version
  // is still reachable via the full `andromeda` bundle install.
  const componentWorkspaceSlugs = new Set(
    readdirSync(wsDir).filter((d) => {
      try { return statSync(join(wsDir, d)).isDirectory() } catch { return false }
    }),
  )

  // Files that are emitted as their OWN individual registry item. Only these may
  // become another component's `registryDependencies`. Every OTHER file reached
  // by the system walk — shared non-component helpers like components/lib/motion.ts
  // (imported by Button/IconButton/StatTile but never published on its own) —
  // must be BUNDLED into each component that imports it, or the installed file
  // would carry an unresolved relative import (`./lib/motion`) and fail to build.
  const emittedComponentFiles = new Set()
  for (const { path: entry } of presentEntries) {
    const fileAbs = resolve(rootDirAbs, entry)
    if (!systemFileSet.has(fileAbs)) continue
    const slug = dsComponentSlug(ds, entry, entry.split('/').pop())
    if (componentWorkspaceSlugs.has(slug)) continue   // emitted as a standalone instead
    emittedComponentFiles.add(fileAbs)
  }

  for (const { path: entry } of presentEntries) {
    const fileAbs = resolve(rootDirAbs, entry)
    if (!systemFileSet.has(fileAbs)) continue   // not part of system walk (skipped)
    const baseName = entry.split('/').pop()
    const slug = dsComponentSlug(ds, entry, baseName)

    // Slug collision with components-workspace — skip individual emit (unless a
    // slugOverride gave this file its own unique slug, which won't collide).
    if (componentWorkspaceSlugs.has(slug)) continue

    // Walk this component's transitive deps within the system, excluding tokens
    // files (those come via registry deps) AND excluding OTHER individually-emitted
    // components (those become registry deps). Shared helpers that are NOT emitted
    // on their own (e.g. lib/motion.ts) fall through and get bundled inline so the
    // component's relative imports resolve after install.
    const otherComponentFiles = [...emittedComponentFiles].filter((f) => f !== fileAbs)
    const componentBoundary = new Set([...tokensFileSet, ...otherComponentFiles])
    const compWalk = walkDependencies([fileAbs], rootDirAbs, componentBoundary)

    // Read the component's own imports to figure out which sibling components
    // it actually pulls in — those become registry deps. The walker doesn't
    // report this directly, so re-read and parse imports to identify them.
    const sourceContent = readFileSync(fileAbs, 'utf-8')
    const componentRegistryDeps = new Set([`${ds.slug}-tokens`])
    for (const spec of extractImportSpecifiers(sourceContent)) {
      if (!spec.startsWith('.') && !spec.startsWith('/')) continue
      const resolved = resolveImport(fileAbs, spec)
      // Only an individually-emitted sibling component becomes a registry dep.
      // Non-emitted shared helpers (lib/motion.ts) are bundled inline above, so
      // they must NOT be turned into a (non-existent) registry dependency.
      if (!resolved || !emittedComponentFiles.has(resolved) || resolved === fileAbs) continue
      // Sibling component — find its slug
      const relPath = relative(rootDirAbs, resolved)
      const relPosix = relPath.split(sep).join(posix.sep)
      const siblingBase = relPath.split(sep).pop()
      const siblingSlug = dsComponentSlug(ds, relPosix, siblingBase)
      // Only declare a dep if that sibling is itself published individually
      // (i.e. doesn't collide with a workspace standalone).
      if (!componentWorkspaceSlugs.has(siblingSlug)) {
        componentRegistryDeps.add(siblingSlug)
      }
    }

    const compFiles = compWalk.files.map((f) => makeFile(f, rootDirAbs, ds.slug))

    const compName = baseName.replace(/\.tsx$/, '')
    // PascalCase → spaced words for human-facing labels (DateRangePicker →
    // "Date Range Picker"); the slug stays kebab-case for the install URL.
    const compLabel = compName.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    const compItem = {
      $schema: SCHEMA,
      name: slug,
      type: 'registry:ui',
      title: `${compLabel} (${ds.name})`,
      description: `${ds.name} ${compLabel} component. Install just this piece. Tokens and any sibling components are pulled in automatically.`,
      author: 'aicanvas <https://aicanvas.me>',
      registryDependencies: [...componentRegistryDeps].sort().map(depUrl),
      ...dependencyFields(ds, compWalk.npmDeps),
      files: compFiles,
    }
    writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(compItem, null, 2) + '\n')
    registryItems.push(indexEntry(compItem, compFiles))
    manifest.designSystemSlugs.push(slug)
    dsCount++
  }

  // ── 3. Templates (compositions) ──────────────────────────────────────────────
  // Each template depends on ONLY the system components it actually imports
  // (plus tokens) — not the whole system. Transitivity rides the per-component
  // items: each declares its own sibling deps, so the CLI chain completes the
  // closure. The walk boundary is tokens + individually-published components:
  // shared helpers that are NOT published on their own (components/lib/motion,
  // lib/responsive) fall through and get BUNDLED into the template — exactly
  // like the per-component items bundle them — at the same target path, so
  // duplicate copies across items are byte-identical and harmless.
  // (Type stays `registry:block` because that's shadcn's CLI vocabulary.)
  for (const template of ds.templates) {
    const templateEntryAbs = resolve(rootDirAbs, template.entryPath)
    const templateBoundary = new Set([...tokensFileSet, ...emittedComponentFiles])
    const templateWalk = walkDependencies([templateEntryAbs], rootDirAbs, templateBoundary)
    const templateFiles = templateWalk.files.map((f) => makeFile(f, rootDirAbs, ds.slug))

    const usedComponentSlugs = new Set()
    for (const f of templateWalk.files) {
      for (const spec of extractImportSpecifiers(readFileSync(f, 'utf-8'))) {
        if (!spec.startsWith('.') && !spec.startsWith('/')) continue
        const resolved = resolveImport(f, spec)
        if (!resolved || !emittedComponentFiles.has(resolved)) continue
        const relPosix = relative(rootDirAbs, resolved).split(sep).join(posix.sep)
        usedComponentSlugs.add(dsComponentSlug(ds, relPosix, relPosix.split('/').pop()))
      }
    }
    const templateDeps = [`${ds.slug}-tokens`, ...[...usedComponentSlugs].sort()].map(depUrl)
    templateContents.set(template.slug, usedComponentSlugs.size)

    const templateItem = {
      $schema: SCHEMA,
      name: template.slug,
      type: 'registry:block',
      title: `${template.name} (${ds.name})`,
      description:
        `${template.name} composition from ${ds.name}${template.domain ? ` — ${template.domain.toLowerCase()} dashboard` : ''}. ` +
        `Pulls in the ${usedComponentSlugs.size} ${ds.name} components it uses, plus tokens.`,
      author: 'aicanvas <https://aicanvas.me>',
      registryDependencies: templateDeps,
      ...dependencyFields(ds, templateWalk.npmDeps),
      files: templateFiles,
    }
    writeFileSync(join(outDir, `${template.slug}.json`), JSON.stringify(templateItem, null, 2) + '\n')
    registryItems.push(indexEntry(templateItem, templateFiles))
    manifest.templateSlugs.push(template.slug)
    dsCount++
  }

  // ── 4. Full-system bundle (everything) ──────────────────────────────────────
  // Single registry item that pulls components + tokens (via the system slug)
  // plus every template — and, when this system ships a brain, the brain item
  // too — via `registryDependencies`. One CLI command grabs everything. The
  // brain dep is conditional on the current injection (degraded builds emit
  // without it, mirroring what is actually servable).
  if (ds.templates.length > 0) {
    const hasBrain = premiumBrains.includes(ds.slug)
    const allItem = {
      $schema: SCHEMA,
      name: `${ds.slug}-all`,
      type: 'registry:style',
      title: `${ds.name} — full system`,
      description: hasBrain
        ? `Every ${ds.name} component, token, and template, plus the ${ds.name} brain, in one install.`
        : `Every ${ds.name} component, token, and template in one install.`,
      author: 'aicanvas <https://aicanvas.me>',
      registryDependencies: [
        depUrl(ds.slug),
        ...ds.templates.map((t) => depUrl(t.slug)),
        ...(hasBrain ? [depUrl(`${ds.slug}-brain`)] : []),
      ],
      files: [],
    }
    writeFileSync(join(outDir, `${ds.slug}-all.json`), JSON.stringify(allItem, null, 2) + '\n')
    registryItems.push(indexEntry(allItem, []))
    dsCount++
  }

  // ── 5. Install-contents copy (consumed by the install popovers) ─────────────
  // One human line set per installable bundle, derived from what THIS run
  // actually emitted — so the popover can never drift from the registry.
  {
    const componentCount = presentEntries.length
    installContents[ds.slug] = [
      `Install all ${componentCount} ${ds.name} components, tokens, and utilities.`,
      'No templates, no brain.',
    ]
    for (const template of ds.templates) {
      const used = templateContents.get(template.slug) ?? 0
      installContents[template.slug] = [
        `This template plus the ${used} ${ds.name} components it uses.`,
        'Tokens included. Re-installs reuse what is already there.',
      ]
    }
    if (ds.templates.length > 0) {
      const hasBrain = premiumBrains.includes(ds.slug)
      let brainFiles = 0
      if (hasBrain) {
        try {
          brainFiles = JSON.parse(readFileSync(join(outDir, `${ds.slug}-brain.json`), 'utf8')).files.length
        } catch { /* brain JSON absent — count stays 0 */ }
      }
      installContents[`${ds.slug}-all`] = [
        `Install everything: ${componentCount} components, tokens, and ${ds.templates.length} templates.`,
        ...(hasBrain && brainFiles > 0
          ? [`Includes the ${ds.name} brain (${brainFiles} rule files your AI reads).`]
          : []),
      ]
    }
  }
}

// Install-contents module for the UI popovers (TemplateChrome /
// TemplatePreviewShell). ALWAYS written — this generator runs in every dev and
// build chain, including forks — so app imports never dangle. Gitignored.
writeFileSync(
  join('app', 'lib', 'install-contents.generated.ts'),
  [
    '// AUTO-GENERATED by scripts/generate-registry.mjs — gitignored, never committed.',
    '// What each install command actually delivers, derived from the emitted',
    '// registry items so the popover copy can never drift from the registry.',
    `export const INSTALL_CONTENTS: Record<string, string[]> = ${JSON.stringify(installContents, null, 2)}`,
    '',
  ].join('\n'),
)

// ── Design-system prop tables (for the component pages) ───────────────────────
// Parse each component's hand-authored @typedef/@property JSDoc into structured
// rows so the [component] page can render a props table — no typing pass, no
// docgen dependency (the source already documents its own props). Keyed by
// source-file basename (e.g. "Button"), value = one entry per @typedef block
// (compound components like Table declare several). Iterates dsAllEntries so a
// build-time-injected v2 file that is ABSENT (degraded build / older premium pin)
// is skipped with the same optional-entry contract the registry items use — the
// page hides its Props section when a slug has no entry. ALWAYS written so app
// imports never dangle on forks; gitignored.
// A prop table never shows a blank description (competitors always write one —
// e.g. Aceternity/Magic UI describe even `className`). Component-specific props
// carry their own description in the @typedef JSDoc; here we fill the ones whose
// meaning is uniform across every component (writing them 31x in JSDoc would be
// pure duplication) and synthesize option lists for string-literal enums.
const FALLBACK_DESCRIPTIONS = {
  className: 'Additional CSS classes applied to the root element.',
  wrapperClassName: 'Additional CSS classes applied to the outer wrapper.',
  style: 'Inline styles applied to the root element.',
  children: 'Content rendered inside the component.',
  disabled: 'When true, disables the control.',
  id: 'Id set on the underlying element.',
  name: 'Name of the underlying form control.',
  value: 'Controlled value.',
  defaultValue: 'Uncontrolled initial value.',
  placeholder: 'Placeholder text shown when the field is empty.',
  type: 'Type of the underlying element.',
  onClick: 'Handler called when the element is clicked.',
  onChange: 'Handler called when the value changes.',
  onValueChange: 'Handler called when the value changes.',
  onFocus: 'Handler called when the element gains focus.',
  onBlur: 'Handler called when the element loses focus.',
  onKeyDown: 'Handler called on key-down.',
  asChild: 'When true, renders the single child element with this component’s props and styles.',
}
// Only synthesize for a type that is PURELY a union of string literals (plus an
// optional `undefined`), so an incidental quote inside a generic type never trips it.
function enumSynth(type) {
  const cleaned = type.replace(/\s+/g, '')
  if (!/^('[^']*'\|?)+(\|?undefined)?$/.test(cleaned)) return ''
  const opts = (type.match(/'[^']+'/g) || []).map((s) => s.slice(1, -1))
  return opts.length ? `One of: ${opts.join(', ')}.` : ''
}
const fillDescription = (p) => ({
  ...p,
  description: p.description || FALLBACK_DESCRIPTIONS[p.name] || enumSynth(p.type),
})

// Keyed by SYSTEM, then by file basename. Two systems ship a Button, and a
// flat basename key let the second system's table silently replace the first's
// on every shared name.
const propTables = {}
for (const ds of SYSTEMS) {
  const dsRootAbs = resolve(dsRoot(ds))
  const forSystem = (propTables[ds.slug] ??= {})
  for (const { path: entry } of dsAllEntries(ds)) {
    const abs = resolve(dsRootAbs, entry)
    if (!isInjectedComponentPresent(abs)) continue // absent or degraded placeholder — skip, don't fail
    const base = entry.split('/').pop().replace(/\.(tsx|ts)$/, '')
    const tables = parseJsdocProps(readFileSync(abs, 'utf-8'))
    const list = Object.entries(tables).map(([table, props]) => ({
      table,
      props: props.map(fillDescription),
    }))
    if (list.length) forSystem[base] = list
  }
}
writeFileSync(
  join('app', 'lib', 'andromeda-props.generated.ts'),
  [
    '// AUTO-GENERATED by scripts/generate-registry.mjs — gitignored, never committed.',
    '// Prop tables for design-system component pages, parsed from each component’s',
    '// @typedef/@property JSDoc. Keyed by system slug, then source-file basename',
    '// (e.g. ANDROMEDA_PROPS["andromeda-pro"]["Button"]).',
    'export interface AndromedaPropRow { name: string; type: string; optional: boolean; default: string; description: string }',
    'export interface AndromedaPropTable { table: string; props: AndromedaPropRow[] }',
    `export const ANDROMEDA_PROPS: Record<string, Record<string, AndromedaPropTable[]>> = ${JSON.stringify(propTables, null, 2)}`,
    '',
  ].join('\n'),
)
console.log(
  `Generated app/lib/andromeda-props.generated.ts (` +
    Object.entries(propTables).map(([sys, t]) => `${sys}: ${Object.keys(t).length}`).join(', ') +
    ` components with prop tables)`,
)

// Prop tables for STANDALONE component pages (components-workspace + injected
// components-workspace-premium). Free standalones are self-contained and
// propless, so most yield nothing (no @typedef → no table → the page hides the
// section); premium components are configurable per the premium standard and
// emit their tables. Keyed by the registry slug the /components/[slug] page
// looks up. Same @typedef parser + fillDescription as the design system, so the
// tables can never drift from the component source.
const standaloneProps = {}
const addStandaloneProps = (slug, abs) => {
  if (!existsSync(abs)) return
  const tables = parseJsdocProps(readFileSync(abs, 'utf-8'))
  const list = Object.entries(tables).map(([table, props]) => ({ table, props: props.map(fillDescription) }))
  if (list.length) standaloneProps[slug] = list
}
for (const dir of dirs) addStandaloneProps(metadata[dir]?.slug ?? dir, join(wsDir, dir, 'index.tsx'))
for (const slug of premiumSlugDirs) addStandaloneProps(slug, join(premiumWsDir, slug, 'index.tsx'))
writeFileSync(
  join('app', 'lib', 'standalone-props.generated.ts'),
  [
    '// AUTO-GENERATED by scripts/generate-registry.mjs — gitignored, never committed.',
    '// Prop tables for standalone component pages (components-workspace +',
    '// injected components-workspace-premium), parsed from @typedef JSDoc.',
    '// Keyed by registry slug. Self-contained (propless) standalones have no entry.',
    "import type { PropTable } from '../components/PropsTable'",
    `export const STANDALONE_PROPS: Record<string, PropTable[]> = ${JSON.stringify(standaloneProps, null, 2)}`,
    '',
  ].join('\n'),
)
console.log(`Generated app/lib/standalone-props.generated.ts (${Object.keys(standaloneProps).length} components with prop tables)`)

// ── Declare per-item gating in the index ──────────────────────────────────────
// The directory reviewer's #1 ask: the index must tell installers, BEFORE they
// run `add`, whether an item resolves to real code anonymously. So append a
// one-line gating note to every index description. Free items install with a
// free account (source is public to read); design systems and templates are
// premium. The token foundation installs anonymously (classified 'meta'), so it
// carries no note. Classification MIRRORS classifyContent() in
// lib/registry/content-type.ts, reusing the gate manifest built above, so the
// note can never drift from what app/r/[file]/route.ts actually serves. The note
// goes on the INDEX only — per-slug item files already self-declare at fetch time
// (an anonymous fetch returns the sign-up/upgrade stub).
const FREE_GATE_NOTE = 'Free account required to install; source is free to read.'
const PREMIUM_GATE_NOTE = 'Requires AI Canvas Premium to install.'
const gate = {
  systems: new Set(manifest.systemSlugs),
  paidSystems: new Set(manifest.paidSystemSlugs),
  dsComponents: new Set(manifest.designSystemSlugs),
  templates: new Set(manifest.templateSlugs),
  premiumStandalones: new Set(manifest.premiumSlugs),
  brains: new Set(manifest.brainSlugs),
}
function gateNoteFor(name) {
  if (name === 'registry' || name === 'aicanvas-mcp') return null // meta
  if (gate.templates.has(name)) return PREMIUM_GATE_NOTE
  if (gate.brains.has(name)) return PREMIUM_GATE_NOTE
  for (const system of gate.systems) {
    // A PAID system's foundation is premium like the rest of it; only a free
    // system's tokens are the anonymous shared dependency. This branch must
    // stay in step with classifyContent(), or the catalog advertises a free
    // install for something /r gates.
    if (name === `${system}-tokens`) {
      return gate.paidSystems.has(system) ? PREMIUM_GATE_NOTE : null
    }
    if (name === system || name === `${system}-all`) return PREMIUM_GATE_NOTE
  }
  for (const system of gate.paidSystems) {
    if (name.startsWith(`${system}-`) && gate.dsComponents.has(name)) return PREMIUM_GATE_NOTE
  }
  if (gate.dsComponents.has(name)) return FREE_GATE_NOTE
  if (gate.premiumStandalones.has(name)) return PREMIUM_GATE_NOTE
  return FREE_GATE_NOTE // standalone
}
for (const item of registryItems) {
  const note = gateNoteFor(item.name)
  if (!note) continue
  const base = (item.description || '').trim()
  item.description = base ? `${base} ${note}` : note
}

// Write the root registry index
const registry = {
  $schema: REGISTRY_SCHEMA,
  name: 'aicanvas',
  homepage: 'https://aicanvas.me',
  items: registryItems,
}

writeFileSync(join(outDir, 'registry.json'), JSON.stringify(registry, null, 2) + '\n')

// Gate manifest (see lib/registry/lookup.ts). Sorted for stable diffs.
manifest.systemSlugs.sort()
manifest.designSystemSlugs.sort()
manifest.templateSlugs.sort()
manifest.premiumSlugs.sort()
writeFileSync(join(outDir, '_manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

console.log(`Generated ${count} components + ${dsCount} system/template items in ${outDir}/ (+ gate manifest: ${manifest.designSystemSlugs.length} ds components, ${manifest.templateSlugs.length} templates)`)

// ── AI Canvas MCP metadata ────────────────────────────────────────────────
// A separate JSON the MCP server fetches at runtime. Carries fields the
// shadcn registry schema doesn't (image, categories, dualTheme, badge,
// homepage URL, install command). Keeps the shadcn registry strict-clean.
//
// Buckets: components[] (standalones only), systems[], templates[], and
// systemComponents[] (per-component design-system items — installable + searchable
// via the MCP, but kept OUT of components[] so the standalone catalog/categories
// stay clean). componentCount counts standalones only.

const mcpComponents = []
const categoryCounts = {}

for (const dir of dirs) {
  const meta = metadata[dir]
  if (!meta) continue
  const slug = meta.slug
  const deps = (() => {
    try {
      const src = readFileSync(join(wsDir, dir, 'index.tsx'), 'utf-8')
      return getDeps(src)
    } catch { return [] }
  })()

  // Convention: tags with `accent: true` are the canonical category.
  const categories = meta.tags.filter(t => t.accent).map(t => t.label)
  const subTags = meta.tags.filter(t => !t.accent).map(t => t.label)
  for (const c of categories) categoryCounts[c] = (categoryCounts[c] ?? 0) + 1

  mcpComponents.push({
    slug,
    name: meta.name,
    description: meta.description,
    categories,
    tags: subTags,
    image: meta.image || undefined,
    badge: meta.badge,
    dualTheme: meta.dualTheme,
    dependencies: deps,
    homepageUrl: `https://aicanvas.me/components/${slug}`,
    sourceUrl: `https://aicanvas.me/r/${slug}.json`,
    installCommand: `npx shadcn@latest add @aicanvas/${slug}`,
  })
}

// Premium components — first-class in the website listings (grid, search,
// categories) and the MCP, exactly like free ones. Their SOURCE stays gated
// (served via /r/<slug>.json); only metadata is listed here. Never added to
// registryItems (the registry.json index carries source).
for (const m of premiumMetas) {
  const pcats = (m.tags || []).filter((t) => t.accent).map((t) => t.label)
  const psub = (m.tags || []).filter((t) => !t.accent).map((t) => t.label)
  for (const c of pcats) categoryCounts[c] = (categoryCounts[c] ?? 0) + 1
  mcpComponents.push({
    slug: m.slug,
    name: m.name,
    description: m.description,
    categories: pcats,
    tags: psub,
    image: m.image || undefined,
    badge: 'Premium',
    dualTheme: false,
    dependencies: m.dependencies || [],
    homepageUrl: `https://aicanvas.me/components/${m.slug}`,
    sourceUrl: `https://aicanvas.me/r/${m.slug}.json`,
    installCommand: `npx shadcn@latest add @aicanvas/${m.slug}`,
  })
}

// ── Per-system meta-slug map (for design-system component homepage URLs) ──────
// A DS component's homepage lives at /design-systems/<system>/<metaSlug>, where
// metaSlug is the WEBSITE slug declared in app/_lib/<system>/<system>-meta.ts —
// usually the registry slug minus the `<system>-` prefix, but not always
// (andromeda-button-system → button via a slugOverride). Parse the meta file's
// `slug:` values so the URLs match the live routes instead of guessing.
function loadSystemMetaSlugs(systemSlug) {
  const metaPath = join('app', '_lib', systemSlug, `${systemSlug}-meta.ts`)
  let src
  try { src = readFileSync(metaPath, 'utf-8') } catch { return null }
  // Scope to the *_COMPONENT_META array so the system-level ANDROMEDA_META
  // (which has no `slug:`) and any other objects can't leak in.
  const arrStart = src.search(/_COMPONENT_META[^=]*=\s*\[/)
  const scoped = arrStart === -1 ? src : src.slice(arrStart)
  const slugs = new Set()
  const re = /\bslug:\s*'([^']+)'/g
  let m
  while ((m = re.exec(scoped)) !== null) slugs.add(m[1])
  return slugs
}

// Build design-system / template metadata from the same source-of-truth config.
// Each entry mirrors the per-slug JSON's shape at a high level — enough for an
// AI agent to decide what to install and to surface the dep chain.
const mcpSystems = []
const mcpTemplates = []
const mcpSystemComponents = []
const mcpBrains = []
for (const ds of SYSTEMS) {
  const tokensSlug = `${ds.slug}-tokens`
  const tokensJsonPath = join(outDir, `${tokensSlug}.json`)
  const sysJsonPath = join(outDir, `${ds.slug}.json`)
  let tokensItem, sysItem
  try { tokensItem = JSON.parse(readFileSync(tokensJsonPath, 'utf-8')) } catch { tokensItem = null }
  try { sysItem = JSON.parse(readFileSync(sysJsonPath, 'utf-8')) } catch { sysItem = null }

  // ── Per-component (design-system) metadata for the MCP ──────────────────────
  // Mirrors the individual component registry items emitted above. The MCP keeps
  // these in a SEPARATE `systemComponents` bucket (NOT in `components[]`) so the
  // standalone catalog + categories stay clean, while get_component /
  // get_install_command / search_components can still resolve every DS slug.
  const metaSlugs = loadSystemMetaSlugs(ds.slug)
  const systemComponentSlugs = []
  // dsAllEntries: optional (injected v2) entries included — an absent one never
  // produced a per-slug JSON above, so the compItem check below skips it.
  for (const { path: entry } of dsAllEntries(ds)) {
    const baseName = entry.split('/').pop()
    const slug = dsComponentSlug(ds, entry, baseName)
    // Skip files that were emitted as a standalone instead of an individual DS
    // item (same condition the per-component emit loop uses), and any entry that
    // never produced a per-slug JSON.
    const compJsonPath = join(outDir, `${slug}.json`)
    let compItem
    try { compItem = JSON.parse(readFileSync(compJsonPath, 'utf-8')) } catch { compItem = null }
    if (!compItem) continue

    // metaSlug: registry slug minus the `<system>-` prefix, unless a slugOverride
    // already mapped it to a distinct meta slug. Validate against the website meta.
    const overrideMeta = ds.slugOverrides?.[entry]
      ? slug.replace(new RegExp(`^${ds.slug}-`), '')
      : null
    let metaSlug = slug.replace(new RegExp(`^${ds.slug}-`), '')
    if (overrideMeta && metaSlugs && !metaSlugs.has(metaSlug)) {
      // andromeda-button-system → its registry slug strips to "button-system",
      // but the website route is "button". Resolve via the meta file.
      const baseGuess = baseName.replace(/\.(tsx|ts)$/, '')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
      if (metaSlugs.has(baseGuess)) metaSlug = baseGuess
    }
    if (metaSlugs && !metaSlugs.has(metaSlug)) {
      console.warn(
        `generate-registry: WARNING — DS component "${slug}" has metaSlug "${metaSlug}" ` +
          `with no matching entry in ${ds.slug}-meta.ts. Homepage URL may 404.`,
      )
    }

    systemComponentSlugs.push(slug)
    // brainSlugs is built earlier in this file from the premium manifest; a
    // system only advertises a brain when one actually shipped this build.
    const brainSlug = `${ds.slug}-brain`
    const hasBrain = premiumBrains.includes(ds.slug)
    mcpSystemComponents.push({
      slug,
      name: compItem.title ?? slug,
      description: compItem.description ?? '',
      system: ds.slug,
      systemLabel: `${ds.name} design system`,
      // The one-line signpost. Not the rules — those install as real files.
      // get_component spreads this record verbatim, so it reaches the agent
      // with no MCP server change and no npm publish.
      ...(hasBrain
        ? {
            brainSlug,
            brainNote:
              `Part of the ${ds.name} design system, which has a Brain: the rules an AI agent reads ` +
              `to build on-brand ${ds.name} UI (tokens, layout, motion, per-component rules). Premium. ` +
              `Install once per project with \`npx shadcn@latest add @aicanvas/${brainSlug}\` and the ` +
              `rules land as files your agent reads directly on every build.`,
          }
        : {}),
      dependencies: compItem.dependencies ?? [],
      registryDependencies: compItem.registryDependencies ?? [],
      homepageUrl: `https://aicanvas.me/design-systems/${ds.slug}/${metaSlug}`,
      sourceUrl: `https://aicanvas.me/r/${slug}.json`,
      installCommand: `npx shadcn@latest add @aicanvas/${slug}`,
    })
  }

  // ── Brain bucket ────────────────────────────────────────────────────────────
  // A design system's Brain is its rules corpus, gated premium and installed as
  // real .md files in the consumer's project (never served as tool output). It
  // gets its own bucket because it is not a component, a template, or code —
  // listing it is how an agent learns the rules exist at all.
  if (premiumBrains.includes(ds.slug)) {
    const brainSlug = `${ds.slug}-brain`
    let brainItem
    try { brainItem = JSON.parse(readFileSync(join(outDir, `${brainSlug}.json`), 'utf-8')) } catch { brainItem = null }
    mcpBrains.push({
      slug: brainSlug,
      name: `${ds.name} Brain`,
      system: ds.slug,
      systemLabel: `${ds.name} design system`,
      description:
        `The design rules behind ${ds.name}: system invariants, foundations (colour, spacing, ` +
        `layout, motion, charts), and per-component rules. Installs as markdown files into the ` +
        `project so an AI agent reads them directly on every build — not fetched per request.`,
      premium: true,
      fileCount: brainItem?.files?.length ?? 0,
      homepageUrl: `https://aicanvas.me/design-systems/${ds.slug}/brain`,
      sourceUrl: `https://aicanvas.me/r/${brainSlug}.json`,
      installCommand: `npx shadcn@latest add @aicanvas/${brainSlug}`,
    })
  }

  mcpSystems.push({
    slug: ds.slug,
    name: `${ds.name} design system`,
    description: sysItem?.description ?? `${ds.name} design system.`,
    ...(premiumBrains.includes(ds.slug) ? { brainSlug: `${ds.slug}-brain` } : {}),
    componentCount: sysItem?.files?.length ?? 0,
    tokenFileCount: tokensItem?.files?.length ?? 0,
    dependencies: [...new Set([...(tokensItem?.dependencies ?? []), ...(sysItem?.dependencies ?? [])])].sort(),
    registryDependencies: sysItem?.registryDependencies ?? [],
    tokensSlug,
    componentSlugs: systemComponentSlugs,
    templateSlugs: ds.templates.map((t) => t.slug),
    homepageUrl: `https://aicanvas.me/design-systems/${ds.slug}`,
    sourceUrl: `https://aicanvas.me/r/${ds.slug}.json`,
    tokensSourceUrl: `https://aicanvas.me/r/${tokensSlug}.json`,
    installCommand: `npx shadcn@latest add @aicanvas/${ds.slug}`,
    tokensInstallCommand: `npx shadcn@latest add @aicanvas/${tokensSlug}`,
  })
  for (const template of ds.templates) {
    const templateJsonPath = join(outDir, `${template.slug}.json`)
    let templateItem
    try { templateItem = JSON.parse(readFileSync(templateJsonPath, 'utf-8')) } catch { templateItem = null }
    mcpTemplates.push({
      slug: template.slug,
      name: `${template.name} (${ds.name} template)`,
      system: ds.slug,
      systemLabel: `${ds.name} design system`,
      domain: template.domain,
      description: templateItem?.description ?? `${template.name} template from ${ds.name}.`,
      fileCount: templateItem?.files?.length ?? 0,
      dependencies: templateItem?.dependencies ?? [],
      registryDependencies: templateItem?.registryDependencies ?? [],
      homepageUrl: `https://aicanvas.me/design-systems/${ds.slug}/templates/${template.slug.replace(`${ds.slug}-`, '')}`,
      sourceUrl: `https://aicanvas.me/r/${template.slug}.json`,
      installCommand: `npx shadcn@latest add @aicanvas/${template.slug}`,
    })
  }
}

// No $schema: this catalog is our own shape, not a shadcn registry item, and
// there is no schema document to point at. The field used to advertise
// /r/aicanvas-mcp.schema.json, which 404s twice over — no such file was ever
// generated, and the route's filename guard (`^[a-z0-9-]+\.json$`,
// app/r/[file]/route.ts:24) rejects the second dot anyway. Publish a real
// schema before re-adding the field.
const mcpMeta = {
  name: 'aicanvas',
  homepage: 'https://aicanvas.me',
  generatedAt: new Date().toISOString(),
  componentCount: mcpComponents.length,
  categories: Object.entries(categoryCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count),
  components: mcpComponents,
  systems: mcpSystems,
  templates: mcpTemplates,
  // Design-system COMPONENTS kept in their own bucket, never merged into
  // components[] (which is standalones only). The MCP's get_component /
  // get_install_command / search_components fall back to this list so every DS
  // slug resolves, while list_components and the categories stay standalone-only.
  systemComponents: mcpSystemComponents,
  // Design-system Brains (rules corpora, premium, installed as files).
  brains: mcpBrains,
}

// ── Integrity guard ──────────────────────────────────────────────────────────
// AI agents turn these slugs into /components/<slug> and /design-systems/<slug>
// URLs. A slug landing in more than one bucket (e.g. the 'andromeda' design
// system leaking into components[]) ships a dead link straight to the MCP.
// Fail the build loudly instead.
{
  const bucketOf = new Map()
  const claim = (slug, bucket) => {
    if (bucketOf.has(slug)) {
      throw new Error(
        `generate-registry: slug "${slug}" is in both "${bucketOf.get(slug)}" and "${bucket}". ` +
          `Each slug must belong to exactly one of components/systems/templates/systemComponents, ` +
          `otherwise the MCP hands AI agents a URL that 404s.`,
      )
    }
    bucketOf.set(slug, bucket)
  }
  for (const c of mcpComponents) claim(c.slug, 'components')
  for (const s of mcpSystems) claim(s.slug, 'systems')
  for (const t of mcpTemplates) claim(t.slug, 'templates')
  for (const sc of mcpSystemComponents) claim(sc.slug, 'systemComponents')
  for (const b of mcpBrains) claim(b.slug, 'brains')
}

writeFileSync(join(outDir, 'aicanvas-mcp.json'), JSON.stringify(mcpMeta, null, 2) + '\n')
console.log(`Generated MCP metadata: ${mcpComponents.length} components, ${Object.keys(categoryCounts).length} categories, ${mcpSystems.length} systems, ${mcpSystemComponents.length} system components, ${mcpTemplates.length} templates`)

// ── Lightweight nav counts (sidebar / mobile-nav) ─────────────────────────────
// The client nav imports THIS registry-free module instead of component-registry,
// so the preview components it references (three.js, matter-js, …) never enter
// the shared client bundle. Counts use accent (category) tags, which the
// stack-tag transform never touches, so they match the registry exactly.
const navTs =
  '// AUTO-GENERATED by scripts/generate-registry.mjs — do not edit by hand.\n' +
  '// Category counts + total for the sidebar/mobile nav, with zero component\n' +
  '// imports (keeps three.js etc. out of the shared bundle).\n\n' +
  `export const CATEGORY_COUNTS: Record<string, number> = ${JSON.stringify(categoryCounts, null, 2)}\n\n` +
  `export const TOTAL_COMPONENTS = ${mcpComponents.length}\n`
writeFileSync('app/lib/component-nav.generated.ts', navTs)
console.log(`Generated app/lib/component-nav.generated.ts (${Object.keys(categoryCounts).length} categories, ${mcpComponents.length} total)`)

// ── Registry-free component metadata (grid + homepage) ────────────────────────
// COMPONENT_META mirrors `COMPONENTS.map(toMeta)` exactly — same order
// (COMPONENTS reverses COMPONENTS_RAW) and the same tag transform (when a
// component has an ACCURATE_STACKS entry, its non-accent tags become the stack
// labels; accent/category tags are preserved). The grid and homepage import
// THIS instead of component-registry so three.js/matter-js never enter their
// route bundles. The detail/preview routes keep the full registry (they render
// the live preview).
{
  // Parse ACCURATE_STACKS from component-copy.ts (same source the runtime
  // transform reads), so the generated tags can't drift from the registry.
  const copySrc = readFileSync('app/lib/component-copy.ts', 'utf-8')
  const stacksStart = copySrc.indexOf('export const ACCURATE_STACKS')
  if (stacksStart === -1) throw new Error('generate-registry: ACCURATE_STACKS not found in component-copy.ts')
  const stacksBlock = copySrc.slice(stacksStart, copySrc.indexOf('\n}', stacksStart))
  const stacks = {}
  const stackRe = /'([^']+)':\s*\[([^\]]*)\]/g
  let sm
  while ((sm = stackRe.exec(stacksBlock)) !== null) {
    stacks[sm[1]] = sm[2]
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
  }

  // metadata is keyed in COMPONENTS_RAW source order; COMPONENTS reverses it.
  const transformTags = (m) =>
    stacks[m.slug]
      ? [...m.tags.filter((t) => t.accent), ...stacks[m.slug].map((label) => ({ label }))]
      : m.tags
  const freeMetaList = Object.values(metadata)
    .reverse()
    .map((m) => {
      const entry = { slug: m.slug, name: m.name, description: m.description, tags: transformTags(m) }
      if (m.image) entry.image = m.image
      if (m.badge) entry.badge = m.badge
      return entry
    })
  // Premium components are first-class listings — woven into the grid, search
  // and category like any free component. component-meta is metadata only; the
  // premium SOURCE is never here.
  const premiumMetaList = premiumMetas.map((m) => {
    const entry = { slug: m.slug, name: m.name, description: m.description, tags: transformTags(m), badge: 'Premium' }
    if (m.image) entry.image = m.image
    return entry
  })

  // Every slug needs a row in BOTH maps in component-copy.ts. A missing row is
  // silent at runtime but not harmless: with no ACCURATE_STACKS entry the page
  // keeps its authored secondary tags and publishes them as the "built with"
  // answer in its FAQPage JSON-LD, and with no COMPONENT_COPY entry it loses
  // its use-case chips and About section. fluid-simulation-hero shipped that
  // way, telling search engines it was built with "Hero" and "Interactive".
  // The accent check catches the sibling bug: an accent tag that is not a
  // categories.ts label makes a category with no page, and the component drops
  // out of every category listing.
  const copyStart = copySrc.indexOf('export const COMPONENT_COPY')
  if (copyStart === -1) throw new Error('generate-registry: COMPONENT_COPY not found in component-copy.ts')
  const copyKeys = new Set(
    [...copySrc.slice(copyStart).matchAll(/^  '([^']+)':/gm)].map((m) => m[1]),
  )
  const catLabels = new Set(
    [...readFileSync('app/lib/categories.ts', 'utf-8').matchAll(/^\s*label: '([^']+)'/gm)].map((m) => m[1]),
  )
  const copyProblems = []
  for (const m of [...freeMetaList, ...premiumMetaList]) {
    const gaps = [!stacks[m.slug] && 'ACCURATE_STACKS', !copyKeys.has(m.slug) && 'COMPONENT_COPY'].filter(Boolean)
    if (gaps.length > 0) copyProblems.push(`${m.slug}: missing from ${gaps.join(' + ')}`)
    for (const t of m.tags) {
      if (t.accent && !catLabels.has(t.label)) {
        copyProblems.push(`${m.slug}: accent tag "${t.label}" is not a label in app/lib/categories.ts`)
      }
    }
  }
  if (copyProblems.length > 0) {
    throw new Error(
      `generate-registry: ${copyProblems.length} tag/copy problem(s):\n  ` +
        copyProblems.join('\n  ') +
        '\nSee .claude/skills/component-pipeline/references/seo-naming.md for what to write.',
    )
  }

  // Grid order = the committed order ledger (component-order.json), reversed to
  // newest-first so the newest push (free OR premium) sits on top. See
  // scripts/lib/order-ledger.mjs for why it's committed and only ever appended,
  // never recomputed from git at build time. A newly-added component lands on
  // top automatically with no dates to maintain.
  const metaBySlug = new Map()
  for (const m of freeMetaList) metaBySlug.set(m.slug, m)
  for (const m of premiumMetaList) metaBySlug.set(m.slug, m)

  const ORDER_LEDGER = 'component-order.json'
  let ledger = []
  try { ledger = JSON.parse(readFileSync(ORDER_LEDGER, 'utf8')) } catch { /* first run / missing */ }
  // Deterministic append order for never-seen slugs (free oldest-first, then
  // premium) so a dev build and a shallow prod build that both meet the same new
  // slug agree on where it lands.
  const appendOrder = [...[...freeMetaList].reverse().map((m) => m.slug), ...premiumMetaList.map((m) => m.slug)]
  const reconciled = reconcileLedger(ledger, appendOrder, new Set(metaBySlug.keys()))
  if (reconciled.grew) writeFileSync(ORDER_LEDGER, JSON.stringify(reconciled.ledger, null, 2) + '\n')
  const metaList = reconciled.gridSlugs.map((slug) => metaBySlug.get(slug))

  if (metaList.length !== mcpComponents.length) {
    throw new Error(
      `generate-registry: COMPONENT_META count ${metaList.length} != component count ${mcpComponents.length}`,
    )
  }

  const metaTs =
    '// AUTO-GENERATED by scripts/generate-registry.mjs — do not edit by hand.\n' +
    '// Registry-free component metadata (mirrors COMPONENTS.map(toMeta)) for the\n' +
    '// grid + homepage, so the heavy registry (three.js etc.) stays out of those\n' +
    '// route bundles.\n' +
    "import type { ComponentMeta } from './component-registry'\n\n" +
    `export const COMPONENT_META: ComponentMeta[] = ${JSON.stringify(metaList, null, 2)}\n`
  writeFileSync('app/lib/component-meta.generated.ts', metaTs)
  console.log(`Generated app/lib/component-meta.generated.ts (${metaList.length} components)`)
}

// ── Lint the shipped JSON for transform integrity ─────────────────────────────
// Catches the regex-too-greedy class of bug (e.g. inner h-full incorrectly
// turned into min-h-screen, breaking installs). Non-zero exit fails the build.
try {
  execSync('node scripts/lint-registry-json.mjs', { stdio: 'inherit' })
} catch {
  process.exit(1)
}
