'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Code } from '@/app/_icons/icons/code'
import { Bot } from '@/app/_icons/icons/bot'
import { buttonClasses } from '../components/buttonClasses'
import { Step } from '../components/Step'
import { copyText } from '../components/useCopied'
import { ClaudeMark, CodeBlock, CodexMark, CursorMark, INLINE_CODE, Toast, useToast } from './InstallCards'
import { HOSTED_MCP_URL } from '../lib/hosted-mcp'

// ─── ConnectAgentCard ─────────────────────────────────────────────────────────
// The hosted MCP setup: add one address to the AI agent, sign in once in the browser,
// never copy a key. Shown on /mcp, on /welcome for Premium and on /account/connect after
// sign-up, only while HOSTED_MCP_OAUTH is on (the pages decide). Machines with no browser
// (CI, a remote shell) use the API key; /docs/mcp#ci covers that, not this card.

type Agent = 'claude' | 'cursor' | 'vscode' | 'codex' | 'chatgpt' | 'desktop' | 'other'

const AGENTS: { id: Agent; label: string; mark: React.ReactNode }[] = [
  { id: 'claude', label: 'Claude Code', mark: <ClaudeMark /> },
  { id: 'cursor', label: 'Cursor', mark: <CursorMark /> },
  { id: 'vscode', label: 'VS Code', mark: <Code size={16} /> },
  { id: 'codex', label: 'Codex', mark: <CodexMark /> },
  { id: 'chatgpt', label: 'ChatGPT', mark: <CodexMark /> },
  { id: 'desktop', label: 'Claude Desktop', mark: <ClaudeMark /> },
  { id: 'other', label: 'Other', mark: <Bot size={16} /> },
]

const CLAUDE_ADD = `claude mcp add --transport http --scope user aicanvas ${HOSTED_MCP_URL}`
const CLAUDE_LOGIN = 'claude mcp login aicanvas'
const CODEX_ADD = `codex mcp add aicanvas --url ${HOSTED_MCP_URL}`
const CODEX_LOGIN = 'codex mcp login aicanvas'
const CURSOR_CONFIG = JSON.stringify({ mcpServers: { aicanvas: { url: HOSTED_MCP_URL } } }, null, 2)
const CURSOR_DEEPLINK = `cursor://anysphere.cursor-deeplink/mcp/install?name=aicanvas&config=${btoa(JSON.stringify({ url: HOSTED_MCP_URL }))}`
const VSCODE_CONFIG = JSON.stringify({ servers: { aicanvas: { type: 'http', url: HOSTED_MCP_URL } } }, null, 2)


function Inline({ children }: { children: React.ReactNode }) {
  return (
    <code className={INLINE_CODE}>{children}</code>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">{children}</p>
}

// heading={false} where the page draws the section heading itself (/mcp). `note` sits
// under the heading, e.g. the agents an account already connected (/account/connect).
export function ConnectAgentCard({
  skipHref,
  showDocsLink = true,
  heading = true,
  title = 'Connect your AI agent',
  note,
}: {
  skipHref?: string
  showDocsLink?: boolean
  heading?: boolean
  title?: string
  note?: React.ReactNode
}) {
  const [agent, setAgent] = useState<Agent>('claude')
  const [copied, setCopied] = useState<string | null>(null)
  const toast = useToast()


  async function copy(id: string, text: string, message: string) {
    if (!(await copyText(text))) return
    setCopied(id)
    toast.show(message)
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000)
  }

  const block = (id: string, command: string, label: string, multiline = false) => (
    <CodeBlock
      command={command}
      copied={copied === id}
      onCopy={() => copy(id, command, `${label[0].toUpperCase()}${label.slice(1)} copied`)}
      label={label}
      multiline={multiline}
    />
  )

  const signIn = (
    <Step number={2}>
      <p className="text-sm text-sand-700 dark:text-sand-300">
        Your browser opens. Sign in to AI Canvas and click <span className="font-semibold">Allow</span>.
      </p>
    </Step>
  )

  // Agents skip MCP tools unless the prompt names the server, so every check names it.
  const check = (n: number) => (
    <Step number={n} isLast>
      <p className="text-sm text-sand-700 dark:text-sand-300">
        Ask your agent <span className="font-semibold">&ldquo;use the aicanvas MCP: whoami&rdquo;</span> → your email and plan
      </p>
    </Step>
  )

  return (
    <section>
      {heading && (
        <>
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">{title}</h2>
            <span className="rounded-full border border-accent/30 bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              Beta
            </span>
          </div>
          <p className="mb-5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
            Add AI Canvas to your AI agent and sign in once in the browser. No key to copy.
          </p>
          {note && <div className="mb-5">{note}</div>}
        </>
      )}

      {/* Built like the npm install card: the agent switch on the card, the steps in the inset. */}
      <div className="rounded-section border border-sand-200 bg-sand-100 p-2 dark:border-sand-800 dark:bg-sand-900">
        <div className="isolate flex gap-1.5 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {AGENTS.map((a) => {
            const active = agent === a.id
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setAgent(a.id)}
                aria-pressed={active}
                className={`relative flex shrink-0 items-center justify-center rounded-control px-3 py-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:flex-1 sm:text-sm ${
                  active
                    ? 'text-sand-900 dark:text-sand-50'
                    : 'text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="connectAgentHighlight"
                    className="absolute inset-0 rounded-control bg-sand-50 shadow-sm ring-1 ring-sand-300 dark:bg-sand-800 dark:ring-sand-700"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                  {a.mark}
                  {a.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-2 space-y-6 rounded-card bg-sand-50/70 px-4 py-6 sm:px-7 sm:py-8 dark:bg-sand-950">
          {agent === 'claude' && (
            <>
              <Step number={1}>
                <Hint>Run this in any terminal. It works in every project.</Hint>
                {block('claude-add', CLAUDE_ADD, 'command')}
                <div className="mt-3">{block('claude-login', CLAUDE_LOGIN, 'sign-in command')}</div>
              </Step>
              {signIn}
              {check(3)}
            </>
          )}

          {agent === 'codex' && (
            <>
              <Step number={1}>
                <Hint>Run this in any terminal</Hint>
                {block('codex-add', CODEX_ADD, 'command')}
              </Step>
              <Step number={2}>
                <p className="text-sm text-sand-700 dark:text-sand-300">
                  Browser opens → sign in → <span className="font-semibold">Allow</span> → terminal says{' '}
                  <span className="font-semibold">&ldquo;Successfully logged in&rdquo;</span>
                </p>
                <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
                  No browser, or &ldquo;Authentication required&rdquo; later? Run <Inline>{CODEX_LOGIN}</Inline>
                </p>
              </Step>
              {check(3)}
            </>
          )}

          {agent === 'chatgpt' && (
            <>
              <Step number={1}>
                <Hint>
                  ChatGPT desktop app → Settings → <span className="font-semibold">Plugins</span> →{' '}
                  <span className="font-semibold">MCPs</span> → <span className="font-semibold">Add</span> → Streamable HTTP,
                  name <Inline>aicanvas</Inline>, this address, token and headers empty:
                </Hint>
                {block('chatgpt-url', HOSTED_MCP_URL, 'address')}
                <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
                  Added it with the Codex command? It is already there: ChatGPT and Codex share one list.
                </p>
              </Step>
              <Step number={2}>
                <p className="text-sm text-sand-700 dark:text-sand-300">
                  <span className="font-semibold">Authenticate</span> next to aicanvas → sign in →{' '}
                  <span className="font-semibold">Allow</span>
                </p>
                <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
                  The page asks to allow Codex: that is the ChatGPT app.
                </p>
              </Step>
              {check(3)}
            </>
          )}

          {agent === 'cursor' && (
            <>
              <Step number={1}>
                <Hint>
                  Click → <span className="font-semibold">Install</span>
                </Hint>
                <a
                  href={CURSOR_DEEPLINK}
                  className={buttonClasses({ variant: 'primary', size: 'lg' })}
                >
                  <CursorMark />
                  Add to Cursor
                </a>
                <p className="mb-2.5 mt-5 text-sm text-sand-600 dark:text-sand-400">
                  Or add the <Inline>aicanvas</Inline> entry to <Inline>~/.cursor/mcp.json</Inline> (it replaces the npm one):
                </p>
                {block('cursor-config', CURSOR_CONFIG, 'config', true)}
              </Step>
              <Step number={2}>
                <p className="text-sm text-sand-700 dark:text-sand-300">
                  Cursor Settings → <span className="font-semibold">Tools &amp; MCPs</span> →{' '}
                  <span className="font-semibold">Connect</span> → sign in → <span className="font-semibold">Allow</span>{' '}
                  (within 30 seconds)
                </p>
              </Step>
              {check(3)}
            </>
          )}

          {agent === 'vscode' && (
            <>
              <Step number={1}>
                <Hint>
                  Add this to <Inline>.vscode/mcp.json</Inline> in your project:
                </Hint>
                {block('vscode-config', VSCODE_CONFIG, 'config', true)}
              </Step>
              <Step number={2}>
                <p className="text-sm text-sand-700 dark:text-sand-300">
                  The first time your agent uses AI Canvas, your browser opens: sign in and click{' '}
                  <span className="font-semibold">Allow</span>.
                </p>
              </Step>
              {check(3)}
            </>
          )}

          {agent === 'desktop' && (
            <>
              <Step number={1}>
                <Hint>In Claude Desktop, open Settings, then Connectors, and add a custom connector with this address:</Hint>
                {block('desktop-url', HOSTED_MCP_URL, 'address')}
              </Step>
              <Step number={2}>
                <p className="text-sm text-sand-700 dark:text-sand-300">
                  Click Connect. Your browser opens: sign in to AI Canvas and click{' '}
                  <span className="font-semibold">Allow</span>.
                </p>
              </Step>
              {check(3)}
            </>
          )}

          {agent === 'other' && (
            <>
              <Step number={1}>
                <Hint>Any AI agent that supports remote MCP servers works. Add this server address:</Hint>
                {block('other-url', HOSTED_MCP_URL, 'address')}
              </Step>
              <Step number={2}>
                <p className="text-sm text-sand-700 dark:text-sand-300">
                  When it asks you to sign in, your browser opens: sign in to AI Canvas and click{' '}
                  <span className="font-semibold">Allow</span>.
                </p>
              </Step>
              {check(3)}
            </>
          )}
        </div>
      </div>

      {showDocsLink && <p className="mt-4 text-sm text-sand-600 dark:text-sand-400">Stuck, or setting up CI? <Link href="/docs/mcp#sign-in" className="font-semibold text-accent transition-colors hover:text-accent/70">Read the docs</Link>.</p>}

      {skipHref && (
        <div className="mt-6 text-center">
          <Link
            href={skipHref}
            className="text-sm font-semibold text-sand-600 transition-colors hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-50"
          >
            Skip for now
          </Link>
        </div>
      )}

      <Toast message={toast.message} />
    </section>
  )
}
