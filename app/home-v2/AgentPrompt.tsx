'use client'

// The hero's third way in: a sentence to hand straight to a coding agent.
// llms.txt is the site's agent entry point (install commands, MCP, the
// account and token steps), so this works as written in any agent that can
// fetch a URL.

import { useState } from 'react'
import { Check, Copy } from '@phosphor-icons/react'

const PROMPT = 'Read aicanvas.me/llms.txt, then build my next screen with Andromeda.'

export function AgentPrompt() {
  const [copied, setCopied] = useState(false)
  return (
    <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-sand-200 bg-sand-100/80 py-1 pl-4 pr-1 text-left backdrop-blur dark:border-sand-800 dark:bg-sand-900/70">
      <span className="hidden shrink-0 text-xs font-semibold text-sand-600 dark:text-sand-400 sm:inline">Tell your agent</span>
      <code className="min-w-0 truncate font-mono text-[12px] text-sand-900 dark:text-sand-100">{PROMPT}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(PROMPT)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1600)
          } catch {
            // Clipboard blocked: the sentence stays selectable on screen.
          }
        }}
        aria-label={copied ? 'Copied' : 'Copy the agent prompt'}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sand-600 transition-colors hover:bg-sand-200 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-50"
      >
        {copied ? <Check weight="regular" size={14} className="text-olive-600 dark:text-olive-400" /> : <Copy weight="regular" size={14} />}
      </button>
    </div>
  )
}
