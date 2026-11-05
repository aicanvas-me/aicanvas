'use client'

import { useEffect, useState } from 'react'
import { previewMap } from '../_lib/preview'
import type { IconMarkupMap, IconStyle } from '../_lib/types'

const sessionVariantCache = new Map<IconStyle, IconMarkupMap>()

// Line is a public file. A paid style's markup comes from a route that serves it
// to Premium only; a 403 means preview mode, and is not cached, so signing in or
// upgrading shows the vectors on the next load.
const variantUrl = (style: IconStyle) => (style === 'line' ? '/icons-data/line.json' : `/icons/style-data/${style}`)

export function useIconVariant(initialLine: IconMarkupMap, style: IconStyle, loadFullLine = false) {
  const [loadedVariants, setLoadedVariants] = useState<Partial<Record<IconStyle, IconMarkupMap>>>({})
  const [failedStyles, setFailedStyles] = useState<IconStyle[]>([])
  const [lockedStyles, setLockedStyles] = useState<IconStyle[]>([])
  const locked = lockedStyles.includes(style)
  const cached = loadedVariants[style] ?? sessionVariantCache.get(style)
  const data = locked ? previewMap(style) : (cached ?? initialLine)
  const failed = failedStyles.includes(style)
  const loading = style !== 'line' && !cached && !failed && !locked

  useEffect(() => {
    let alive = true
    const needsFullLine = style === 'line' && loadFullLine && !sessionVariantCache.has('line')
    const needsVariant = style !== 'line' && !sessionVariantCache.has(style)
    if ((!needsFullLine && !needsVariant) || failedStyles.includes(style) || lockedStyles.includes(style)) return

    // A subscriber whose sign-in check blipped gets one 403 or 503; ask once more before locking.
    const load = () => fetch(variantUrl(style))
    load()
      .then((response) =>
        response.status === 403 || response.status === 503
          ? new Promise<Response>((resolve) => setTimeout(resolve, 600)).then(load)
          : response,
      )
      .then((response) => {
        if (response.status === 403) return null
        if (!response.ok) throw new Error(`Could not load ${style} icons`)
        return response.json() as Promise<IconMarkupMap>
      })
      .then((next) => {
        if (!next) {
          if (alive) setLockedStyles((current) => [...current, style])
          return
        }
        sessionVariantCache.set(style, next)
        if (alive) {
          setLoadedVariants((current) => ({ ...current, [style]: next }))
        }
      })
      .catch(() => {
        if (alive) setFailedStyles((current) => [...current, style])
      })

    return () => {
      alive = false
    }
  }, [failedStyles, lockedStyles, loadFullLine, style])

  return { data, loading }
}
