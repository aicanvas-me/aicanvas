import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { getEntitlement } from '@/app/lib/entitlement'

export const runtime = 'nodejs'

// The two Pro files of the Andromeda Pro image pack. They are authored in the
// vault and injected into the gitignored design-systems/andromeda-pro/ tree, so
// a build without premium has no copy to read and answers 404. The images
// themselves are public on R2 and never pass through here.
const FILES: Record<string, { name: string; type: string }> = {
  'style-bible.md': { name: 'STYLE-BIBLE.md', type: 'text/markdown; charset=utf-8' },
  'qa-manifest.json': { name: 'qa-manifest.json', type: 'application/json; charset=utf-8' },
}

const DIR = join(process.cwd(), 'design-systems', 'andromeda-pro', 'image-pack')

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const entry = Object.hasOwn(FILES, file) ? FILES[file] : undefined
  if (!entry) return json({ error: 'not found' }, 404)

  // Fail closed: an entitlement error must never hand out Pro bytes.
  let tier
  try {
    tier = (await getEntitlement(req)).tier
  } catch (err) {
    console.error('[image-pack] entitlement error, failing closed:', err)
    return json({ error: 'temporarily-unavailable' }, 503)
  }
  if (tier !== 'premium') return json({ error: 'premium-only' }, 402)

  let body: string
  try {
    body = await readFile(join(DIR, entry.name), 'utf8')
  } catch {
    return json({ error: 'not found' }, 404)
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': entry.type,
      'Content-Disposition': `attachment; filename="${entry.name}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}

function json(body: object, status: number) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}
