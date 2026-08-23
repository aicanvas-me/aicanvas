'use client'

import { useCallback, useState } from 'react'

/**
 * Copy `text` to the clipboard and report "copied" for a moment, the pattern
 * every copy button on the site follows. `reset` clears the state early, for
 * example when the surrounding menu closes.
 */
export function useCopied(text: string, ms = 2000) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), ms)
    } catch {}
  }, [text, ms])
  const reset = useCallback(() => setCopied(false), [])
  return { copied, copy, reset }
}
