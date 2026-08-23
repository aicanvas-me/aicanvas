/**
 * Lint all components in components-workspace/ for common mistakes.
 *
 * Checks each index.tsx for:
 *   1. Packages imported but not listed in "// npm install"
 *   2. Font imports (next/font/google, geist/font/*) without a matching font comment
 *   3. Inline fontFamily strings referencing a named font without a font comment
 *   4. Banned markers (internal shorthand, TODO / FIXME / HACK) in index.tsx or prompts.ts
 *
 * Usage:  node scripts/lint-components.mjs
 * Exit:   0 = all clear, 1 = warnings found
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WORKSPACE = join(__dirname, '..', 'components-workspace')

// ─── Packages that are always available — do NOT need "// npm install" ─────────
const ALWAYS_AVAILABLE = new Set([
  'react', 'react-dom', 'next', 'typescript',
])
const ALWAYS_AVAILABLE_PREFIXES = ['react/', 'next/', '@types/']

// ─── Generic CSS font families — not a named font, no comment needed ──────────
const GENERIC_FAMILIES = new Set([
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
  'system-ui', 'inherit', 'initial', 'unset', 'ui-sans-serif',
  'ui-serif', 'ui-monospace',
])

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAlwaysAvailable(pkg) {
  if (ALWAYS_AVAILABLE.has(pkg)) return true
  return ALWAYS_AVAILABLE_PREFIXES.some(p => pkg.startsWith(p))
}

function getPackageName(importPath) {
  if (importPath.startsWith('@')) {
    // scoped: @scope/name/sub → @scope/name
    const parts = importPath.split('/')
    return parts.slice(0, 2).join('/')
  }
  // regular: framer-motion/something → framer-motion
  return importPath.split('/')[0]
}

function parseImportedPackages(source) {
  const packages = new Set()
  // Static imports:  import X from 'pkg'  /  import { X } from 'pkg'
  const staticRe = /^import\s[\s\S]*?from\s+['"]([^'"]+)['"]/gm
  // Dynamic imports: import('pkg')
  const dynamicRe = /\bimport\(['"]([^'"]+)['"]\)/g

  for (const re of [staticRe, dynamicRe]) {
    let m
    while ((m = re.exec(source)) !== null) {
      const path = m[1]
      if (path.startsWith('.') || path.startsWith('/')) continue
      const pkg = getPackageName(path)
      if (!isAlwaysAvailable(pkg)) packages.add(pkg)
    }
  }
  return packages
}

function parseNpmInstallComment(source) {
  const m = source.match(/^\/\/ npm install (.+)$/m)
  if (!m) return new Set()
  return new Set(m[1].trim().split(/\s+/))
}

function hasFontComment(source) {
  return /^\/\/ font(-pkg)?: /m.test(source)
}

function checkFontImports(source) {
  const issues = []
  const hasComment = hasFontComment(source)

  // next/font/google import without // font: comment
  const googleRe = /^import\s+\{([^}]+)\}\s+from\s+['"]next\/font\/google['"]/m
  const googleMatch = googleRe.exec(source)
  if (googleMatch && !hasComment) {
    const rawName = googleMatch[1].trim().split(',')[0].trim()
    const readableName = rawName.replace(/_/g, ' ')
    issues.push(
      `imports '${rawName}' from 'next/font/google' but missing: // font: ${readableName}`
    )
  }

  // geist/font/* import without // font-pkg: comment
  const geistRe = /^import\s+\{([^}]+)\}\s+from\s+['"]geist\/font([^'"]*)['"]/m
  const geistMatch = geistRe.exec(source)
  if (geistMatch && !hasComment) {
    const className = geistMatch[1].trim().split(',')[0].trim()
    const subPath = geistMatch[2] || ''
    const importPath = `geist/font${subPath}`
    issues.push(
      `imports '${className}' from '${importPath}' but missing: // font-pkg: ${importPath}|${className}[|--css-var]`
    )
  }

  return issues
}

function checkInternalImports(source) {
  // Standalone components must never import from inside the project's
  // design-systems/ or app/ folders — those paths don't exist in a user's project.
  const issues = []
  const re = /^import\s[\s\S]*?from\s+['"]([^'"]+)['"]/gm
  let m
  while ((m = re.exec(source)) !== null) {
    const path = m[1]
    if (
      path.includes('/design-systems/') ||
      path.includes('/app/') ||
      path.match(/^\.\.\/.*design-systems/) ||
      path.match(/^\.\.\/.*\/app\//)
    ) {
      issues.push(`imports from internal project path '${path}' — inline the dependency instead`)
    }
  }
  return issues
}

function checkDesignTokens(source) {
  // Strip single-line comments so // sand-100 or // olive-500 in comments don't fire
  const stripped = source.replace(/\/\/[^\n]*/g, '')

  const sandMatches = [...stripped.matchAll(/\bsand-\d+/g)]
  const oliveMatches = [...stripped.matchAll(/\bolive-\d+/g)]

  const issues = []
  for (const m of sandMatches) {
    issues.push(`uses site token class "${m[0]}" — replace with a hardcoded hex color`)
  }
  for (const m of oliveMatches) {
    issues.push(`uses site token class "${m[0]}" — replace with a hardcoded hex color`)
  }
  return issues
}

function checkInlineFont(source) {
  const issues = []
  if (hasFontComment(source)) return issues

  // Match fontFamily: "Name" / fontFamily: 'Name' / fontFamily="Name"
  // Captures the first word/phrase before a comma or quote end
  const re = /fontFamily[=:\s]+["']([^"',;{}]+)/g
  let m
  while ((m = re.exec(source)) !== null) {
    const raw = m[1].trim()
    // Skip CSS variables
    if (raw.startsWith('var(')) continue
    // Extract first name (before comma or space-followed-by-generic)
    const firstName = raw.split(',')[0].trim().replace(/^['"]/, '').replace(/['"]$/, '').trim()
    // Skip generics and lowercase names (likely CSS vars or identifiers)
    if (!firstName || GENERIC_FAMILIES.has(firstName)) continue
    if (firstName[0] !== firstName[0].toUpperCase()) continue
    // Skip if it's clearly a CSS variable reference
    if (firstName.startsWith('--') || firstName.startsWith('var')) continue

    issues.push(
      `uses inline fontFamily: "${firstName}" but missing: // font: ${firstName}`
    )
    break // one warning per component is enough
  }
  return issues
}

// ─── Banned markers ──────────────────────────────────────────────────────────
// index.tsx and prompts.ts are product copy: buyers read both. Internal shorthand
// and unfinished-work markers must never travel with a component.
// The shorthand is assembled from parts so this lint does not itself carry the word
// it bans, which keeps a repo-wide grep for it empty.
const BANNED_MARKERS = [
  new RegExp(['pony', 'tail:'].join(''), 'gi'),
  /\bTODO\b/g,
  /\bFIXME\b/g,
  /\bHACK\b/g,
]

function checkBannedMarkers(source, file) {
  const issues = []
  for (const re of BANNED_MARKERS) {
    const m = re.exec(source)
    re.lastIndex = 0
    // One warning per marker per file is enough to get it fixed.
    if (m) issues.push(`${file} contains the banned marker "${m[0]}": internal note, never ships`)
  }
  return issues
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const entries = readdirSync(WORKSPACE, { withFileTypes: true })
  .filter(e => e.isDirectory() && !e.name.startsWith('_'))
  .sort((a, b) => a.name.localeCompare(b.name))

let checkedCount = 0
let totalWarnings = 0
const report = []

for (const entry of entries) {
  const indexPath = join(WORKSPACE, entry.name, 'index.tsx')
  if (!existsSync(indexPath)) continue

  const source = readFileSync(indexPath, 'utf-8')
  const warnings = []

  // 1. npm install check
  const importedPkgs = parseImportedPackages(source)
  const declaredPkgs = parseNpmInstallComment(source)

  for (const pkg of importedPkgs) {
    if (!declaredPkgs.has(pkg)) {
      warnings.push(`imports '${pkg}' but '${pkg}' is not listed in // npm install`)
    }
  }

  // 2. Internal project path imports — breaks copy-paste
  warnings.push(...checkInternalImports(source))

  // 3. Site design token check — components must use hex colors, not sand-*/olive-*
  warnings.push(...checkDesignTokens(source))

  // 3. Font import → comment check
  warnings.push(...checkFontImports(source))

  // 4. Inline fontFamily → comment check
  warnings.push(...checkInlineFont(source))

  // 5. Banned markers in the two files that ship to buyers
  warnings.push(...checkBannedMarkers(source, 'index.tsx'))
  const promptsPath = join(WORKSPACE, entry.name, 'prompts.ts')
  if (existsSync(promptsPath)) {
    warnings.push(...checkBannedMarkers(readFileSync(promptsPath, 'utf-8'), 'prompts.ts'))
  }

  checkedCount++
  if (warnings.length > 0) {
    totalWarnings += warnings.length
    report.push({ name: entry.name, warnings })
  }
}

// ─── Output ───────────────────────────────────────────────────────────────────

console.log(`\nComponent Lint — ${checkedCount} components scanned\n`)

if (report.length === 0) {
  console.log('✓ All components pass\n')
  process.exit(0)
} else {
  for (const { name, warnings } of report) {
    console.log(`✗  ${name}`)
    for (const w of warnings) {
      console.log(`     → ${w}`)
    }
    console.log()
  }
  console.log(`${totalWarnings} warning(s) in ${report.length} component(s)\n`)
  console.log('Fix the issues above, then re-run: node scripts/lint-components.mjs\n')
  process.exit(1)
}
