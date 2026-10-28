'use client'

import { useEffect, useState } from 'react'
import type { IconMarkupMap, IconStyle } from '../_lib/types'

const sessionVariantCache = new Map<IconStyle, IconMarkupMap>()

export function useIconVariant(initialLine: IconMarkupMap, style: IconStyle) {
  const [, setLoadedStyle] = useState<IconStyle | null>(null)
  const [failedStyles, setFailedStyles] = useState<IconStyle[]>([])
  const cached = style === 'line' ? initialLine : sessionVariantCache.get(style)
  const data = cached ?? initialLine
  const failed = failedStyles.includes(style)
  const loading = style !== 'line' && !cached && !failed

  useEffect(() => {
    let alive = true
    if (style === 'line' || sessionVariantCache.has(style) || failedStyles.includes(style)) return

    fetch(`/icons-data/${style}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${style} icons`)
        return response.json() as Promise<IconMarkupMap>
      })
      .then((next) => {
        sessionVariantCache.set(style, next)
        if (alive) setLoadedStyle(style)
      })
      .catch(() => {
        if (alive) setFailedStyles((current) => [...current, style])
      })

    return () => {
      alive = false
    }
  }, [failedStyles, style])

  return { data, loading }
}
