'use client'

// The one-sentence prompt a buyer gives their agent alongside the two Pro files.
import { useState } from 'react'
import { Check, Copy } from '@phosphor-icons/react'
import { buttonClasses } from '../../../components/buttonClasses'

export function ImagePackPrompt({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-sand-300 bg-sand-100 p-4 sm:flex-row sm:items-center dark:border-sand-800 dark:bg-sand-900">
      <p className="flex-1 text-sm leading-relaxed text-sand-900 dark:text-sand-50">{prompt}</p>
      <button
        type="button"
        onClick={copy}
        className={`${buttonClasses({ variant: 'outline', size: 'sm' })} self-start sm:self-auto`}
      >
        {copied ? <Check weight="regular" size={14} /> : <Copy weight="regular" size={14} />}
        {copied ? 'Copied' : 'Copy prompt'}
      </button>
    </div>
  )
}
