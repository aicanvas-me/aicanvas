import type { CSSProperties } from 'react'

// A template poster shown as its screen only. Every Andromeda Pro poster frames
// its screen at 62px of 1200 x 675 and bleeds it off the right and bottom
// edges, so sizing the image to 105.45% x 110.11% and pinning it bottom-right
// crops the frame away exactly (1200 / 1138 and 675 / 613). Boxes using these
// need an aspect of 1138 / 613.
//
// The image rides two custom properties so one element follows the site
// theme: --poster-l on light, --poster-d under .dark. FLIP shows the other one.
export const POSTER_BG =
  'bg-no-repeat [background-position:right_bottom] [background-size:105.45%_110.11%] [background-image:var(--poster-l)] dark:[background-image:var(--poster-d)]'
export const POSTER_BG_FLIP =
  'bg-no-repeat [background-position:right_bottom] [background-size:105.45%_110.11%] [background-image:var(--poster-d)] dark:[background-image:var(--poster-l)]'

export function posterVars(p: { dark: string | null; light: string | null }): CSSProperties {
  const dark = p.dark ?? p.light
  const light = p.light ?? p.dark
  return {
    '--poster-d': dark ? `url("${dark}")` : 'none',
    '--poster-l': light ? `url("${light}")` : 'none',
  } as CSSProperties
}
