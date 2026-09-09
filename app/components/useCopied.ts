'use client'

import { useCallback, useState } from 'react'

/**
 * Write `text` to the clipboard, resolving to whether it worked. Never rejects:
 * the browser refuses the write more often than it looks (no permission, the
 * document not focused, a non-secure context), and an unawaited call surfaces
 * that as an unhandled rejection indistinguishable from extension noise by the
 * time it reaches the error beacon.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Copy `text` and report "copied" for a moment, the pattern every copy button on
 * the site follows. `reset` clears the state early, e.g. when a menu closes.
 */
export function useCopied(text: string, ms = 2000) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    if (!(await copyText(text))) return
    setCopied(true)
    setTimeout(() => setCopied(false), ms)
  }, [text, ms])
  const reset = useCallback(() => setCopied(false), [])
  return { copied, copy, reset }
}
