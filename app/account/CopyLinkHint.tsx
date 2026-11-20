'use client'

import { useEffect, useRef, useState } from 'react'
import { copyText } from '../components/useCopied'

type CopyStatus = 'idle' | 'copied' | 'error'

export function CopyLinkHint() {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const attemptRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    attemptRef.current += 1
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  async function handleCopy() {
    if (timerRef.current) clearTimeout(timerRef.current)
    const attempt = ++attemptRef.current
    setStatus('idle')

    const copied = await copyText(window.location.href)
    if (attempt !== attemptRef.current) return

    setStatus(copied ? 'copied' : 'error')
    timerRef.current = setTimeout(() => {
      setStatus('idle')
      timerRef.current = null
    }, 2000)
  }

  const label = status === 'copied'
    ? 'Copied'
    : status === 'error'
      ? 'Copy the address bar link'
      : 'Copy link'

  return (
    <p className="mt-2 flex flex-wrap items-baseline gap-x-1 text-sm text-sand-600 dark:text-sand-400">
      <span>Signed in elsewhere?</span>
      <button
        type="button"
        onClick={handleCopy}
        className={`min-w-16 whitespace-nowrap rounded-sm text-left font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
          status === 'copied'
            ? 'text-success hover:text-success'
            : status === 'error'
              ? 'text-sand-600 hover:text-sand-600 dark:text-sand-400 dark:hover:text-sand-400'
              : 'text-accent hover:text-accent/70'
        }`}
      >
        <span aria-live="polite">{label}</span>
      </button>
    </p>
  )
}
