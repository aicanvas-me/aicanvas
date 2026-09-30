/**
 * upload-user-avatars — put the picker's avatar art on ImageKit.
 *
 *   node scripts/upload-user-avatars.mjs "<source folder>"
 *
 * Uploads every PNG in the folder to ImageKit under /user-avatars, renamed
 * avatar-01 … avatar-NN in natural filename order, then prints the ids so
 * app/lib/user-avatars.ts can be checked against what is actually up there.
 * Re-running overwrites the same names and purges the CDN, so fixing one piece
 * of art is a matter of dropping a new file in and running this again.
 *
 * Needs IMAGEKIT_PRIVATE_KEY in .env.local (private_… from the dashboard).
 */
import { readdir } from 'fs/promises'
import path from 'path'
import { uploadToImageKit } from './lib/imagekit.mjs'

if (process.env.IMAGEKIT_PRIVATE_KEY === undefined) {
  try { process.loadEnvFile('.env.local') } catch {}
}
const IMAGEKIT_PRIVATE = process.env.IMAGEKIT_PRIVATE_KEY
if (!IMAGEKIT_PRIVATE) {
  console.error('Missing IMAGEKIT_PRIVATE_KEY. Add it to .env.local (private_… key from the ImageKit dashboard).')
  process.exit(1)
}

const SRC = process.argv[2]
if (!SRC) {
  console.error('Usage: node scripts/upload-user-avatars.mjs "<source folder>"')
  process.exit(1)
}

const FOLDER = '/user-avatars'

const files = (await readdir(SRC))
  .filter((f) => f.toLowerCase().endsWith('.png'))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))

if (files.length === 0) {
  console.error(`No PNGs in ${SRC}`)
  process.exit(1)
}

console.log(`${files.length} files → ImageKit ${FOLDER}\n`)
let n = 0
for (const file of files) {
  const id = `avatar-${String(++n).padStart(2, '0')}`
  const url = await uploadToImageKit({
    localPath: path.join(SRC, file),
    fileName: `${id}.png`,
    privateKey: IMAGEKIT_PRIVATE,
    folder: FOLDER,
  })
  console.log(`  ${id}  ←  ${file}\n           ${url}`)
}
console.log(`\n${n} uploaded → https://ik.imagekit.io/aitoolkit${FOLDER}/`)
