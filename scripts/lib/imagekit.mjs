/**
 * Shared ImageKit upload for the screenshot pipelines and the avatar uploader.
 * Uploads a PNG under a fixed name (overwriting any previous version) and purges
 * the CDN, so the same URL immediately serves the new bytes.
 */

import { readFile } from 'fs/promises'

const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload'
const PURGE_URL = 'https://api.imagekit.io/v1/files/purge'

/**
 * @param {Object} options
 * @param {string} options.localPath - PNG on disk to upload
 * @param {string} options.fileName - Name to store it under
 * @param {string} options.privateKey - IMAGEKIT_PRIVATE_KEY
 * @param {string} [options.folder] - Destination folder; omit to upload to the root
 * @returns {Promise<string>} The uploaded file's URL
 */
export async function uploadToImageKit({ localPath, fileName, privateKey, folder }) {
  const base64 = (await readFile(localPath)).toString('base64')
  const auth = Buffer.from(`${privateKey}:`).toString('base64')

  const body = new FormData()
  body.append('file', `data:image/png;base64,${base64}`)
  body.append('fileName', fileName)
  if (folder) body.append('folder', folder)
  body.append('useUniqueFileName', 'false')
  body.append('overwriteFile', 'true')

  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}` },
    body,
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  const { url } = await res.json()

  await fetch(PURGE_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  return url
}
