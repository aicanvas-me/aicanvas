import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getEntitlement } from '@/app/lib/entitlement'
import { isIconCategory } from '@/app/icons/_lib/categories'
import { icons } from '@/app/icons/_lib/server-data'
import { buildIconZip, zipFileName, type ZipFormat } from '@/app/icons/_lib/zip-export'
import type { IconStyle } from '@/app/icons/_lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Download all: every icon of one style, built on the server from the toolbar's
// settings. A bulk download is Premium for every style, Line included.
const STYLES = new Set<IconStyle>(['line', 'duotone', 'solid', 'solid-duotone'])
const FORMATS = new Set<ZipFormat>(['svg', 'react'])
const NO_STORE = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, Authorization' }

const fail = (status: number, error: string) => Response.json({ error }, { status, headers: NO_STORE })
const inRange = (value: unknown, min: number, max: number, step: number): value is number =>
  typeof value === 'number' && value >= min && value <= max && Number.isInteger((value - min) / step)

// Each read is scoped to its own folder: a free-form path makes the bundler trace the whole repo.
const readJson = async <T,>(path: string): Promise<T> => JSON.parse(await readFile(path, 'utf8')) as T
const registryItem = (slug: string) =>
  readJson<{ files: { content: string }[] }>(join(process.cwd(), 'registry-data', `${slug}.json`)).then((i) => i.files[0].content)
const styleMarkup = (style: IconStyle) =>
  readJson<Record<string, string>>(
    style === 'line'
      ? join(process.cwd(), 'public', 'icons-data', 'line.json')
      : join(process.cwd(), '.icons-data', `${style}.json`),
  )

export async function POST(req: Request) {
  let tier: string
  try {
    tier = (await getEntitlement(req)).tier
  } catch {
    // An unreadable subscription is never a downgrade to free and never a grant.
    return fail(503, 'temporarily-unavailable')
  }
  if (tier === 'anonymous') return fail(401, 'sign-in-required')
  if (tier !== 'premium') return fail(403, 'premium-required')

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const { style, format, size, strokeWidth, absolute, colour, category } = body ?? {}
  if (
    !STYLES.has(style as IconStyle) ||
    !FORMATS.has(format as ZipFormat) ||
    !inRange(size, 16, 96, 4) ||
    !inRange(strokeWidth, 1, 3, 0.25) ||
    typeof absolute !== 'boolean' ||
    !(colour === null || (typeof colour === 'string' && /^#[0-9A-F]{6}$/.test(colour))) ||
    !(category === undefined || (typeof category === 'string' && isIconCategory(category)))
  ) {
    return fail(400, 'bad-settings')
  }

  const iconStyle = style as IconStyle
  const names = icons.filter((icon) => !category || icon.category === category).map((icon) => icon.name).sort()
  if (!names.length) return fail(404, 'no-icons')
  const suffix = iconStyle === 'line' ? '' : `-${iconStyle}`
  const markup = await styleMarkup(iconStyle)
  const react =
    format === 'react'
      ? {
          base: await registryItem('icon-base'),
          files: Object.fromEntries(
            await Promise.all(names.map(async (name) => [`${name}${suffix}.tsx`, await registryItem(`icon-${name}${suffix}`)] as const)),
          ),
        }
      : { base: '', files: {} }

  const zip = await buildIconZip({
    style: iconStyle,
    format: format as ZipFormat,
    size: size as number,
    strokeWidth: strokeWidth as number,
    absolute,
    colour: colour as string | null,
    names,
    markup,
    react,
  })
  return new Response(zip as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipFileName(iconStyle, format as ZipFormat)}"`,
      ...NO_STORE,
    },
  })
}
