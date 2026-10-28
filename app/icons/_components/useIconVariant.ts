'use client'

import { useEffect, useState } from 'react'
import type { IconMarkupMap, IconStyle } from '../_lib/types'

const sessionVariantCache = new Map<IconStyle, IconMarkupMap>()

export function useIconVariant(initialLine: IconMarkupMap, style: IconStyle, loadFullLine = false) {
  const [loadedVariants, setLoadedVariants] = useState<Partial<Record<IconStyle, IconMarkupMap>>>({})
  const [failedStyles, setFailedStyles] = useState<IconStyle[]>([])
  const cached = loadedVariants[style] ?? sessionVariantCache.get(style)
  const data = cached ?? initialLine
  const failed = failedStyles.includes(style)
  const loading = style !== 'line' && !cached && !failed

  useEffect(() => {
    let alive = true
    const needsFullLine = style === 'line' && loadFullLine && !sessionVariantCache.has('line')
    const needsVariant = style !== 'line' && !sessionVariantCache.has(style)
    if ((!needsFullLine && !needsVariant) || failedStyles.includes(style)) return

    fetch(`/icons-data/${style}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${style} icons`)
        return response.json() as Promise<IconMarkupMap>
      })
      .then((next) => {
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
  }, [failedStyles, loadFullLine, style])

  return { data, loading }
}
