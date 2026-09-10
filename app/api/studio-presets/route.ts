// UNTRACKED dev-only route — the Studio's preset store. Never commit this
// file; like app/studio/page.tsx it exists so the vault Studio WIP can be
// driven through the public harness.
//
// Presets used to live in localStorage, which meant they were invisible to
// anything but the browser that wrote them and died with a cache clear. They
// are a file now: readable, diffable, and backed up with the rest of the
// devtools repo.
import { readFile, writeFile } from 'node:fs/promises'

const STORE = '/Users/alexandrudaniel/.aicanvas-devtools/studio-presets.json'

export async function GET() {
  try {
    const raw = await readFile(STORE, 'utf8')
    return Response.json(JSON.parse(raw))
  } catch {
    // Missing or unparseable file is not an error — it just means no presets yet.
    return Response.json({})
  }
}

export async function PUT(request: Request) {
  const body = await request.json()
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return Response.json({ error: 'expected an object of name -> theme' }, { status: 400 })
  }
  await writeFile(STORE, JSON.stringify(body, null, 2) + '\n', 'utf8')
  return Response.json({ ok: true, count: Object.keys(body).length })
}
