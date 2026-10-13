'use client'

// The agent half of "From catalog to code": connect the AI Canvas MCP from
// here. A prompt types itself into a pill to show what you can ask; Cursor
// gets its one-click install link, Claude Code and Codex copy their command.
// The commands and the Cursor link come from the /mcp page, so the two can
// never disagree. They are the signed-out versions: the setup guide adds the
// account token. Reduced motion keeps the first prompt, still.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Sparkle } from '@phosphor-icons/react'
import { useMedia } from './useMedia'
import { ClaudeMark, CodexMark, CursorMark, CURSOR_DEEPLINK_BASE, claudeCommand, codexCommand } from '../mcp/InstallCards'

const PROMPTS = [
  'Find a pricing section in AI Canvas and add it to this page.',
  'What is the best navbar component in AI Canvas? Install it for me.',
  'Install Andromeda Legacy and build my settings screen with it.',
]

const COMMANDS = {
  claude: claudeCommand('user', ''),
  codex: codexCommand(''),
}

type Copyable = keyof typeof COMMANDS

// The first prompt renders whole on the server and on the first client pass
// (same HTML, no hydration mismatch, readable without JS); the cycle starts
// from there. Reduced motion answers "still" on the server for the same reason.
function useTypedPrompt() {
  const still = useMedia('(prefers-reduced-motion: reduce)', true)
  const [i, setI] = useState(0)
  const [n, setN] = useState(PROMPTS[0].length)

  useEffect(() => {
    if (still) return
    const full = PROMPTS[i]
    // Type, hold, then move to the next prompt.
    const id =
      n < full.length
        ? window.setTimeout(() => setN(n + 1), 32)
        : window.setTimeout(() => {
            setI((i + 1) % PROMPTS.length)
            setN(0)
          }, 2600)
    return () => window.clearTimeout(id)
  }, [i, n, still])

  return { text: PROMPTS[i].slice(0, n), typing: !still && n < PROMPTS[i].length }
}

const BUTTON =
  'inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-sand-100 px-4 py-2.5 text-sm font-semibold text-sand-900 transition-colors hover:border-sand-300 hover:bg-sand-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-50 dark:hover:border-sand-700 dark:hover:bg-sand-800'

export function AgentInstall() {
  const { text, typing } = useTypedPrompt()
  const [copied, setCopied] = useState<Copyable | null>(null)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(null), 2400)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = async (which: Copyable) => {
    try {
      await navigator.clipboard.writeText(COMMANDS[which])
      setCopied(which)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      <img src="/ai-canvas-icon.svg" alt="" aria-hidden className="h-14 w-auto sm:h-16" />
      <h3 className="mt-6 text-balance text-2xl font-bold tracking-tight text-sand-900 sm:text-3xl dark:text-sand-50">
        Install AI Canvas in your agent.
      </h3>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-sand-600 dark:text-sand-400">
        Connect the free MCP server once and sign in with a free account. Then ask in plain words: your agent
        searches the catalog, reads the source and installs what you pick.
      </p>

      {/* What you can ask */}
      <div className="mt-7 flex w-full max-w-xl items-center gap-2.5 rounded-full border border-sand-200 bg-sand-100/60 px-4 py-2.5 text-left dark:border-sand-800 dark:bg-sand-900/60">
        <Sparkle weight="regular" size={15} aria-hidden className="shrink-0 text-olive-600 dark:text-olive-400" />
        <p className="min-w-0 flex-1 truncate font-mono text-[13px] text-sand-700 dark:text-sand-300">
          <span className="sr-only">Example prompt: </span>
          &ldquo;{text}
          {typing ? (
            <span aria-hidden className="ml-px inline-block h-[1.05em] w-[1.5px] translate-y-[2px] animate-pulse bg-sand-500" />
          ) : null}
          &rdquo;
        </p>
      </div>

      {/* One way in per tool */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <a href={CURSOR_DEEPLINK_BASE} className={BUTTON}>
          <span className="text-sand-900 dark:text-sand-50 [&>svg]:size-4">
            <CursorMark />
          </span>
          Add to Cursor
        </a>
        <button type="button" onClick={() => copy('claude')} className={BUTTON}>
          <span className="text-[#D97757] [&>svg]:size-4">
            {copied === 'claude' ? <Check weight="regular" size={16} /> : <ClaudeMark />}
          </span>
          {copied === 'claude' ? 'Command copied' : 'Claude Code'}
        </button>
        <button type="button" onClick={() => copy('codex')} className={BUTTON}>
          <span className="text-sand-900 dark:text-sand-50 [&>svg]:size-4">
            {copied === 'codex' ? <Check weight="regular" size={16} /> : <CodexMark />}
          </span>
          {copied === 'codex' ? 'Command copied' : 'Codex'}
        </button>
      </div>

      {/* The copied command, so nothing lands on the clipboard unseen. */}
      <p aria-live="polite" className="mt-3 min-h-5 max-w-full truncate font-mono text-xs text-sand-600 dark:text-sand-400">
        {copied ? COMMANDS[copied] : ''}
      </p>

      <Link
        href="/mcp"
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300"
      >
        Full setup guide and example prompts
        <ArrowRight weight="regular" size={14} aria-hidden />
      </Link>
    </div>
  )
}
