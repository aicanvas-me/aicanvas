// ImageKit URL helper — appends transformation params for serve-time
// resize + WebP conversion. Non-ImageKit URLs pass through untouched.

type Preset = 'thumb' | 'card' | 'detail' | 'lead'

const PRESETS: Record<Preset, string> = {
  // Small row thumbnails (account/saved, account/activity): ~64px display × 2
  thumb: 'w-160,q-80,f-auto',
  // Homepage card thumbnails: ~400px display × 2 for retina
  card: 'w-800,q-85,f-auto',
  // Component detail / larger views: 2× a wider hero crop
  detail: 'w-1600,q-90,f-auto',
  // The template bento's lead card paints at double width, so its poster keeps
  // every pixel of the 1920px source instead of `detail`'s 1600. It used to be
  // served as the raw PNG to protect that detail, but the weight was never
  // buying resolution: same 1920px as WebP is around 60% smaller, and this card
  // now loads two posters, not one.
  lead: 'w-1920,q-95,f-auto',
}

/**
 * Template poster art version. A poster is re-shot under a FIXED filename, so
 * nothing about its URL moves when the art does and a browser or the CDN would
 * keep serving the old one. This is the only thing that busts it.
 *
 * It lives here, shared, because ONE run of
 * scripts/screenshot-andromeda-templates.mjs re-shoots Andromeda Legacy and
 * Andromeda Pro together, and the four templates that exist in both systems
 * appear on four surfaces: both design-system overviews and both meta maps that
 * feed the home grid. A per-file version was a trap: bump one, forget another,
 * and that surface silently serves stale art. Bump this on every re-shoot.
 */
export const TEMPLATE_ART_VERSION = 13

export function optimizeImageKitUrl(url: string, preset: Preset = 'card'): string {
  if (!url.includes('ik.imagekit.io')) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}tr=${PRESETS[preset]}`
}
