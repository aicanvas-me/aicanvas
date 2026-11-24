import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getEntitlement } from '@/app/lib/entitlement'
import { trackPull } from '@/app/lib/track-pull'
import { skillDownloadsEnabled } from '@/lib/flags'
import { extractToken } from '@/lib/identity/token'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// A paid agent skill (vault `skills/<slug>/`, zipped by inject-premium) for Premium
// and Lifetime only. The `skill add` command of @aicanvas/mcp sends the token as
// `Authorization: Bearer`; a signed-in browser session works too. Never cached.
const NO_STORE = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, Authorization' }
const PRICING = 'https://aicanvas.me/pricing?ref=skill'
// Each read is scoped to this folder: a free-form path makes the bundler trace the whole repo.
const DIR = join(process.cwd(), 'skills-premium')

type SkillInfo = { version: string | null; sha256: string; bytes: number }

const fail = (status: number, error: string, message: string, extra: Record<string, string> = {}) =>
  Response.json({ error, message, ...extra }, { status, headers: NO_STORE })

const unavailable = () => fail(503, 'temporarily-unavailable', 'Downloads are unavailable right now. Please retry in a few minutes.')

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!skillDownloadsEnabled()) return unavailable()
  const { slug } = await params
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return fail(404, 'not-found', 'No such skill.')

  // The address lands in server and proxy logs; the token must not.
  if (new URL(req.url).searchParams.has('token')) {
    return fail(400, 'token-in-url', 'Send the token in an Authorization: Bearer header, never in the address.')
  }

  let skills: Record<string, SkillInfo>
  try {
    skills = JSON.parse(await readFile(join(DIR, '_skills.json'), 'utf8'))
  } catch {
    // No zips in this build (free-only or a failed inject): never a reason to tell a buyer "no such skill".
    console.error('[skills download] skills-premium/_skills.json missing')
    return unavailable()
  }
  const info = Object.hasOwn(skills, slug) ? skills[slug] : null
  if (!info) return fail(404, 'not-found', 'No such skill.')

  let entitlement
  try {
    entitlement = await getEntitlement(req)
  } catch (err) {
    // An unreadable subscription is never a downgrade to free and never a grant.
    console.error('[skills download] entitlement error, failing closed:', err)
    return unavailable()
  }
  const { tier, userId, tokenUnknown } = entitlement
  if (tier === 'anonymous') {
    // A well-formed token that resolved to nobody without being "unknown" is a failed key read.
    if (extractToken(req) && !tokenUnknown) return unavailable()
    if (tokenUnknown) {
      return fail(401, 'token-changed', 'This token no longer matches an account (it was rotated). Copy the current command from aicanvas.me/skills/' + slug + '.')
    }
    return fail(401, 'sign-in-required', 'This skill is part of AI Canvas Premium. Sign in and copy the install command from aicanvas.me/skills/' + slug + '.', { upgrade: PRICING })
  }
  if (tier !== 'premium') {
    return fail(403, 'premium-required', 'This skill is part of AI Canvas Premium. Upgrade to install it.', { upgrade: PRICING })
  }

  let zip: Buffer
  try {
    zip = await readFile(join(DIR, `${slug}.zip`))
  } catch {
    console.error(`[skills download] ${slug}.zip listed but missing`)
    return unavailable()
  }
  if (req.headers.get('x-aicanvas-probe') !== '1') trackPull(userId, `${slug}@${info.version ?? 'unknown'}`, 'skill')
  return new Response(new Uint8Array(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${slug}-${info.version ?? 'latest'}.zip"`,
      'Content-Length': String(zip.length),
      'X-AICanvas-Skill-Version': info.version ?? '',
      'X-AICanvas-Skill-Sha256': info.sha256,
      ...NO_STORE,
    },
  })
}
