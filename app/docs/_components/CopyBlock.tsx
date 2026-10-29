'use client'

import { Check, Copy } from '@phosphor-icons/react'
import { useCopied } from '../../components/useCopied'

// Geist Mono shapes `--` as a ligature, which swallows the space before it in a
// command (`aicanvas--scope`). Off for every command and config shown here.
const NO_LIGATURES = {
  fontVariantLigatures: 'none',
  fontFeatureSettings: '"liga" 0, "calt" 0',
} as const

/**
 * A command or a config file with a copy button, the same block the MCP page
 * and the component pages use. `title` names the file above a config. `wrap`
 * is for a prompt written as a sentence: it wraps instead of scrolling sideways.
 */
export function CopyBlock({
  code,
  title,
  label = 'code',
  wrap = false,
}: {
  code: string
  title?: string
  label?: string
  wrap?: boolean
}) {
  const { copied, copy } = useCopied(code)
  const multiline = wrap || code.includes('\n')
  return (
    <div className="my-5 overflow-hidden rounded-inset border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
      {title && (
        <div className="border-b border-sand-200 px-4 py-2 font-mono text-xs text-sand-600 dark:border-sand-800 dark:text-sand-400">
          {title}
        </div>
      )}
      <div className={`flex gap-3 py-3 pl-4 pr-2.5 ${multiline ? 'items-start' : 'items-center'}`}>
        <pre
          className={`min-w-0 flex-1 py-0.5 ${wrap ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto'} font-mono text-sm leading-relaxed text-sand-800 dark:text-sand-200`}
          style={NO_LIGATURES}
        >
          <code>{code}</code>
        </pre>
        <button
          type="button"
          onClick={() => void copy()}
          aria-label={`Copy ${label}`}
          className="shrink-0 rounded-control p-2 text-sand-600 transition-all hover:bg-sand-200 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-90 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-100"
        >
          {copied ? (
            <Check weight="regular" size={14} className="text-success" />
          ) : (
            <Copy weight="regular" size={14} />
          )}
        </button>
      </div>
    </div>
  )
}
