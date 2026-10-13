'use client'

import { useSyncExternalStore } from 'react'

// A media query as React state. The server (and the hydrating first pass)
// answers `serverValue`; the browser's real answer follows right after, with
// no hydration mismatch and no setState inside an effect.
export function useMedia(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}
