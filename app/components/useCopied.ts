'use client'

import { useCallback, useState } from 'react'

/**
 * Write `text` to the clipboard, resolving to whether it worked. Never rejects.
 *
 * Copy buttons route through here. A bare
 * `navigator.clipboard.writeText(...)` left unawaited is a floating promise,
 * and the browser refuses the write more often than it looks: no permission,
 * the document not focused, a non-secure context. That refusal surfaces as an
 * unhandled rejection carrying a message the browser wrote rather than one of
 * ours, which is indistinguishable from third-party extension noise by the time
 * it reaches the error beacon.
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
 * Copy `text` to the clipboard and report "copied" for a moment, the pattern
 * every copy button on the site follows. `reset` clears the state early, for
 * example when the surrounding menu closes.
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
