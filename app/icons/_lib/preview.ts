import type { IconMarkupMap, IconStyle } from './types'

// A paid style without Premium draws from a raster preview, never vector markup.
// It travels in the markup slot so every renderer can tell; copies and downloads
// check isPreview and offer Premium instead.
const PREFIX = 'aic-preview:'

export const isPreview = (markup: string) => markup.startsWith(PREFIX)
// large: the 640px WebP beside each 192px PNG, for the big preview stage only
export const previewSrc = (markup: string, large = false) => {
  const src = markup.slice(PREFIX.length)
  return large ? src.replace(/\.png$/, '.large.webp') : src
}

const maps = new Map<IconStyle, IconMarkupMap>()

// Any name reads as its preview, so names the page has not loaded yet still resolve.
// One map per style, so its identity holds across renders.
export function previewMap(style: IconStyle): IconMarkupMap {
  let map = maps.get(style)
  if (!map) {
    map = new Proxy({}, {
      get: (_, name) => (typeof name === 'string' ? `${PREFIX}/icons-preview/${style}/${name}.png` : undefined),
    })
    maps.set(style, map)
  }
  return map
}
