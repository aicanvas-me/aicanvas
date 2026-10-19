'use client'

import { useCallback, useSyncExternalStore } from 'react'

// A media query as React state. The server (and the hydrating first pass)
// answers `serverValue`; the browser's real answer follows right after, with
// no hydration mismatch and no setState inside an effect. The subscription is
// stable per query, so frequent re-renders never re-subscribe.
export function useMedia(query: string, serverValue: boolean) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    [query],
  )
  const get = useCallback(() => window.matchMedia(query).matches, [query])
  return useSyncExternalStore(subscribe, get, () => serverValue)
}
