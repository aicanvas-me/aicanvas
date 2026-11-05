/**
 * Upload hero card art shot by screenshot-andromeda-hero.mjs to ImageKit
 * `<folder>/<slug>-<theme>.png`, then print the slug → URL map. Pro goes to
 * `andromeda-pro/hero-2`, Legacy (--legacy) to `andromeda/hero`.
 *
 * The site reads these folders (heroShot in app/_lib/andromeda-pro/andromeda-meta.ts
 * and app/_lib/andromeda/andromeda-meta.ts).
 * Refuses a file that already exists unless --replace, so a reshoot never
 * overwrites art a shipped page uses by accident.
 *
 * Usage: node scripts/upload-andromeda-hero.mjs <dir> [--legacy] [--replace]
 */

import { readdirSync } from 'fs'
import path from 'path'
import { uploadToImageKit } from './lib/imagekit.mjs'

try {
  process.loadEnvFile('.env.local')
} catch {}
const key = process.env.IMAGEKIT_PRIVATE_KEY
if (!key) {
  console.error('IMAGEKIT_PRIVATE_KEY is not set')
  process.exit(1)
}
const args = process.argv.slice(2)
const dir = args.find((a) => !a.startsWith('--'))
const replace = args.includes('--replace')
const legacy = args.includes('--legacy')
if (!dir) {
  console.error('usage: node scripts/upload-andromeda-hero.mjs <dir> [--legacy] [--replace]')
  process.exit(1)
}
// Change with heroShot in the matching andromeda-meta.ts.
const FOLDER = legacy ? '/andromeda/hero' : '/andromeda-pro/hero-2'
const files = readdirSync(dir).filter((f) => /^[a-z0-9-]+-(dark|light)\.png$/.test(f)).sort()

const auth = Buffer.from(`${key}:`).toString('base64')
const res = await fetch(`https://api.imagekit.io/v1/files?path=${encodeURIComponent(FOLDER)}&limit=1000`, {
  headers: { Authorization: `Basic ${auth}` },
})
const existing = new Set((await res.json()).map?.((f) => f.name) ?? [])
const clash = files.filter((f) => existing.has(f))
if (clash.length && !replace) {
  console.error(`${clash.length} already in ${FOLDER} (pass --replace to overwrite): ${clash.slice(0, 5).join(', ')}`)
  process.exit(1)
}

const map = {}
let fail = 0
for (const f of files) {
  try {
    const url = await uploadToImageKit({ localPath: path.join(dir, f), fileName: f, privateKey: key, folder: FOLDER })
    const [, slug, theme] = f.match(/^(.+)-(dark|light)\.png$/)
    ;(map[slug] ??= {})[theme] = url
    process.stdout.write('.')
  } catch (err) {
    fail++
    console.log(`\n✗ ${f}: ${err.message}`)
  }
}
console.log(`\n${files.length - fail} uploaded, ${fail} failed → https://ik.imagekit.io/aitoolkit${FOLDER}/`)
console.log('HERO_MAP_JSON=' + JSON.stringify(map))
