'use client'

import { useCallback, useState } from 'react'
import { PENDING_INSTALL_TOKEN, resolveInstallToken } from '../_lib/useInstallToken'

/**
 * Write `text` to the clipboard, resolving to whether it worked. Never rejects:
 * the browser refuses the write more often than it looks (no permission, the
 * document not focused, a non-secure context), and an unawaited call surfaces
 * that as an unhandled rejection indistinguishable from extension noise by the
 * time it reaches the error beacon.
 */
export async function copyText(text: string, noTokenText?: string): Promise<boolean> {
  // ClipboardItem takes a promise, so Safari keeps the click's permission while the token loads.
  if (text.includes(PENDING_INSTALL_TOKEN)) {
    const ready = resolveInstallToken(text, noTokenText)
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': ready.then((t) => new Blob([t], { type: 'text/plain' })) })])
      return true
    } catch {
      text = await ready
    }
  }
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
 * `copy` resolves to whether the write worked, so a caller can report it.
 */
export function useCopied(text: string, ms = 2000, noTokenText?: string) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    const ok = await copyText(text, noTokenText)
    if (!ok) return false
    setCopied(true)
    setTimeout(() => setCopied(false), ms)
    return true
  }, [text, ms, noTokenText])
  const reset = useCallback(() => setCopied(false), [])
  return { copied, copy, reset }
}
