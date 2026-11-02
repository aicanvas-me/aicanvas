/**
 * Upload hero card art shot by screenshot-andromeda-hero.mjs to ImageKit
 * `andromeda-pro/hero-2/<slug>-<theme>.png`, then print the slug → URL map.
 *
 * A NEW folder on purpose: the live site reads `andromeda-pro/<slug>.png`, so an
 * upload here changes nothing live until a branch wiring these URLs ships.
 * Refuses a file that already exists unless --replace, so a reshoot never
 * overwrites art a shipped page uses by accident.
 *
 * Usage: node scripts/upload-andromeda-hero.mjs <dir> [--replace]
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
const [dir, flag] = process.argv.slice(2)
if (!dir) {
  console.error('usage: node scripts/upload-andromeda-hero.mjs <dir> [--replace]')
  process.exit(1)
}
// Change both: heroShot in app/_lib/andromeda-pro/andromeda-meta.ts.
const FOLDER = '/andromeda-pro/hero-2'
const files = readdirSync(dir).filter((f) => /^[a-z0-9-]+-(dark|light)\.png$/.test(f)).sort()

const auth = Buffer.from(`${key}:`).toString('base64')
const res = await fetch(`https://api.imagekit.io/v1/files?path=${encodeURIComponent(FOLDER)}&limit=1000`, {
  headers: { Authorization: `Basic ${auth}` },
})
const existing = new Set((await res.json()).map?.((f) => f.name) ?? [])
const clash = files.filter((f) => existing.has(f))
if (clash.length && flag !== '--replace') {
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
