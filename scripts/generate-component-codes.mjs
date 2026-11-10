/**
 * Generate component-codes.generated.ts from actual source files.
 * Run this before build to ensure the code users copy from the website
 * matches the real component source.
 *
 * Usage: node scripts/generate-component-codes.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import { toInstalledIconPaths, transformRootHeightClass } from './lib/copy-paste-transform.mjs'

const wsDir = 'components-workspace'
const premiumDir = 'components-workspace-premium' // injected, gitignored (may be absent)
const outFile = 'app/lib/component-codes.generated.ts'

function listDirs(base) {
  try {
    return readdirSync(base).filter((d) => {
      try { return statSync(join(base, d)).isDirectory() && d !== '_template' } catch { return false }
    })
  } catch { return [] }
}

// Free components + any injected premium components, keyed by their clean slug.
const entries = [
  ...listDirs(wsDir).map((d) => ({ base: wsDir, dir: d })),
  ...listDirs(premiumDir).map((d) => ({ base: premiumDir, dir: d })),
].sort((a, b) => a.dir.localeCompare(b.dir))

const lines = [
  '// AUTO-GENERATED — do not edit manually.',
  '// Run: node scripts/generate-component-codes.mjs',
  '',
  'export const componentCodes: Record<string, string> = {',
]

let count = 0
for (const { base, dir } of entries) {
  const file = join(base, dir, 'index.tsx')
  let content
  try {
    content = readFileSync(file, 'utf-8')
  } catch {
    continue
  }

  // Make copy-paste ready: h-full → min-h-screen on the ROOT element only
  // (see scripts/lib/copy-paste-transform.mjs for why root-only)
  const copyPasteReady = toInstalledIconPaths(transformRootHeightClass(content))

  // Escape for template literal embedding
  const escaped = copyPasteReady
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')

  lines.push(`  '${dir}': \`${escaped}\`,`)
  lines.push('')
  count++
}

lines.push('}')
lines.push('')

writeFileSync(outFile, lines.join('\n'))
console.log(`Generated ${outFile} with ${count} components`)

// Automatically lint after generating — catches missing npm/font comments
// before the agent can proceed. Non-zero exit stops the pipeline.
try {
  execSync('node scripts/lint-components.mjs', { stdio: 'inherit' })
} catch {
  process.exit(1)
}
