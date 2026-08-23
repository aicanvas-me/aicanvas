// Replace Andromeda component card shots from the ImageKit folder
// "andromeda/New Screenshoots". Each file whose name matches a known component
// slug (case and space insensitive) is resized to 1280px wide as PNG and
// overwrites andromeda/<slug>.png; the card's ?v cache-bust is bumped in
// andromeda-meta.ts so it refreshes.
// Usage: node scripts/replace-andromeda-shot.mjs <slug>   # one component
//        node scripts/replace-andromeda-shot.mjs --all    # every matching file
import { readFileSync, writeFileSync } from 'fs'

try {
  process.loadEnvFile('.env.local')
} catch {}
const key = process.env.IMAGEKIT_PRIVATE_KEY
if (!key) { console.error('IMAGEKIT_PRIVATE_KEY is not set'); process.exit(1) }
const auth = Buffer.from(key + ':').toString('base64')
const SRC_FOLDER = '/andromeda/New Screenshoots'
const WIDTH = 1280
const META_PATH = 'app/_lib/andromeda/andromeda-meta.ts'
const arg = process.argv[2]
if (!arg) { console.error('usage: node scripts/replace-andromeda-shot.mjs <slug> | --all'); process.exit(1) }
const only = arg === '--all' ? undefined : arg

let meta = readFileSync(META_PATH, 'utf8')
const known = new Set([...meta.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]))
const norm = (n) => n.replace(/\.[a-z0-9]+$/i, '').trim().toLowerCase().replace(/\s+/g, '-')

const listRes = await fetch('https://api.imagekit.io/v1/files?path=' + encodeURIComponent(SRC_FOLDER) + '&limit=300', { headers: { Authorization: `Basic ${auth}` } })
const files = await listRes.json()
if (!Array.isArray(files)) { console.error('list failed: ' + JSON.stringify(files).slice(0, 200)); process.exit(1) }
const candidates = only ? files.filter((f) => norm(f.name) === only) : files
if (only && candidates.length === 0) {
  console.error(`No file matching "${only}" in ${SRC_FOLDER}. Found: ${files.map((f) => f.name).join(', ') || '(empty)'}`)
  process.exit(1)
}
console.log(`folder "${SRC_FOLDER}" has ${files.length} files${only ? `, replacing "${only}"` : ''}\n`)

const replaced = [], skipped = []
for (const f of candidates) {
  const slug = norm(f.name)
  if (!known.has(slug)) { skipped.push(`${f.name} (not a known component)`); continue }
  try {
    // Strip the list URL's own query (?updatedAt=) before adding the transform,
    // or the double ? makes ImageKit ignore it.
    const base = f.url.split('?')[0]
    const r = await fetch(`${base}?tr=w-${WIDTH},f-png`)
    if (!r.ok) { skipped.push(`${f.name} (download ${r.status})`); continue }
    const buf = Buffer.from(await r.arrayBuffer())
    const body = new FormData()
    body.append('file', `data:image/png;base64,${buf.toString('base64')}`)
    body.append('fileName', `${slug}.png`)
    body.append('folder', '/andromeda')
    body.append('useUniqueFileName', 'false')
    body.append('overwriteFile', 'true')
    const up = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', headers: { Authorization: `Basic ${auth}` }, body })
    if (!up.ok) { skipped.push(`${f.name} (upload ${up.status} ${await up.text().catch(() => '')})`); continue }
    const { url } = await up.json()
    await fetch('https://api.imagekit.io/v1/files/purge', { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
    replaced.push(slug)
    console.log(`  OK  ${f.name}  ${f.width}x${f.height}  ->  andromeda/${slug}.png @ ${WIDTH}w (${Math.round(buf.length / 1024)}KB)`)
  } catch (e) { skipped.push(`${f.name} (${e.message})`) }
}

let bumped = 0
for (const slug of replaced) {
  const re = new RegExp(`(andromeda/${slug}\\.png\\?v=)(\\d+)'`)
  if (re.test(meta)) { meta = meta.replace(re, (_m, p, n) => `${p}${+n + 1}'`); bumped++ }
}
if (bumped) writeFileSync(META_PATH, meta)

console.log(`\nreplaced ${replaced.length}: ${replaced.join(', ') || '(none)'}`)
console.log(`cache-bumped ${bumped} entries in andromeda-meta.ts`)
if (skipped.length) console.log(`\nskipped ${skipped.length}:\n  ${skipped.join('\n  ')}`)
if (only && replaced.length === 0) process.exit(1)
