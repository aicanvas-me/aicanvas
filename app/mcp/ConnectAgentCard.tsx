'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Code, Robot } from '@phosphor-icons/react'
import { Step } from '../components/Step'
import { copyText } from '../components/useCopied'
import { ClaudeMark, CodeBlock, CodexMark, CursorMark, Toast, useToast } from './InstallCards'

// ─── ConnectAgentCard ─────────────────────────────────────────────────────────
// The hosted MCP setup: add one address to the AI agent, sign in once in the browser,
// never copy a key. Shown on /mcp, on /welcome for Premium and on /account/connect after
// sign-up, only while HOSTED_MCP_OAUTH is on (the pages decide). The API key stays for
// machines with no browser (CI, a remote shell) and for the npm package.

export const HOSTED_MCP_URL = 'https://mcp.aicanvas.me'

type Agent = 'claude' | 'cursor' | 'vscode' | 'codex' | 'desktop' | 'other'

const AGENTS: { id: Agent; label: string; mark: React.ReactNode }[] = [
  { id: 'claude', label: 'Claude Code', mark: <ClaudeMark /> },
  { id: 'cursor', label: 'Cursor', mark: <CursorMark /> },
  { id: 'vscode', label: 'VS Code', mark: <Code weight="regular" className="size-4" /> },
  { id: 'codex', label: 'Codex', mark: <CodexMark /> },
  { id: 'desktop', label: 'Claude Desktop', mark: <ClaudeMark /> },
  { id: 'other', label: 'Other', mark: <Robot weight="regular" className="size-4" /> },
]

const CLAUDE_ADD = `claude mcp add --transport http --scope user aicanvas ${HOSTED_MCP_URL}`
const CLAUDE_LOGIN = 'claude mcp login aicanvas'
const CODEX_ADD = `codex mcp add aicanvas --url ${HOSTED_MCP_URL}`
const CODEX_LOGIN = 'codex mcp login aicanvas'
const CURSOR_CONFIG = JSON.stringify({ mcpServers: { aicanvas: { url: HOSTED_MCP_URL } } }, null, 2)
const CURSOR_DEEPLINK = `cursor://anysphere.cursor-deeplink/mcp/install?name=aicanvas&config=${btoa(JSON.stringify({ url: HOSTED_MCP_URL }))}`
const VSCODE_CONFIG = JSON.stringify({ servers: { aicanvas: { type: 'http', url: HOSTED_MCP_URL } } }, null, 2)

const MASKED_KEY = 'aic_••••••••'
const MASKED_API_HEADER = `Authorization: Bearer ${MASKED_KEY}`
const MASKED_CLAUDE_HEADER_COMMAND = `claude mcp add --transport http --scope user aicanvas ${HOSTED_MCP_URL} --header "${MASKED_API_HEADER}"`

function Inline({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">
      {children}
    </code>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-sm text-sand-600 dark:text-sand-400">{children}</p>
}

export function ConnectAgentCard({ skipHref, showDocsLink = true }: { skipHref?: string; showDocsLink?: boolean }) {
  const [agent, setAgent] = useState<Agent>('claude')
  const [copied, setCopied] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const toast = useToast()

  // The API key is only for machines without a browser; read it the way the other
  // install cards do, and show nothing when signed out.
  useEffect(() => {
    let alive = true
    fetch('/api/me/token')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setApiKey(d?.token ?? null))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

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
    <Step number={2} isLast>
      <p className="text-sm text-sand-700 dark:text-sand-300">
        Your browser opens. Sign in to AI Canvas and click <span className="font-semibold">Allow</span>. That&rsquo;s it.
      </p>
    </Step>
  )

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Connect your AI agent</h2>
        <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-sand-700 dark:bg-sand-950 dark:text-sand-300">
          Beta
        </span>
      </div>
      <p className="mb-4 text-sm text-sand-600 dark:text-sand-400">
        Add AI Canvas to your AI agent and sign in once in the browser. No key to copy.
      </p>

      <div className="overflow-hidden rounded-xl border border-sand-200 dark:border-sand-800">
        <div className="flex gap-1.5 overflow-x-auto border-b border-sand-200 bg-sand-100 p-1.5 dark:border-sand-800 dark:bg-sand-900">
          {AGENTS.map((a) => {
            const active = agent === a.id
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setAgent(a.id)}
                aria-pressed={active}
                className={`relative flex shrink-0 items-center justify-center rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors sm:flex-1 sm:px-3 sm:text-sm ${
                  active
                    ? 'text-sand-900 dark:text-sand-50'
                    : 'text-sand-600 hover:text-sand-700 dark:text-sand-500 dark:hover:text-sand-300'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="connectAgentHighlight"
                    className="absolute inset-0 rounded-lg bg-sand-50 shadow-sm ring-1 ring-sand-300 dark:bg-sand-800 dark:ring-sand-700"
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

        <div className="space-y-6 bg-sand-100 p-4 sm:p-6 dark:bg-sand-900">
          {agent === 'claude' && (
            <>
              <Step number={1}>
                <Hint>Run this in any terminal. It works in every project.</Hint>
                {block('claude-add', CLAUDE_ADD, 'command')}
                <div className="mt-3">{block('claude-login', CLAUDE_LOGIN, 'sign-in command')}</div>
              </Step>
              {signIn}
            </>
          )}

          {agent === 'codex' && (
            <>
              <Step number={1}>
                <Hint>Run this in any terminal.</Hint>
                {block('codex-add', CODEX_ADD, 'command')}
                <div className="mt-3">{block('codex-login', CODEX_LOGIN, 'sign-in command')}</div>
              </Step>
              {signIn}
            </>
          )}

          {agent === 'cursor' && (
            <>
              <Step number={1}>
                <Hint>One click adds it to Cursor.</Hint>
                <a
                  href={CURSOR_DEEPLINK}
                  className="inline-flex items-center gap-2 rounded-lg bg-olive-500 px-4 py-2.5 text-sm font-semibold text-sand-950 transition-colors hover:bg-olive-400"
                >
                  <CursorMark />
                  Add to Cursor
                </a>
                <p className="mb-2.5 mt-5 text-sm text-sand-600 dark:text-sand-400">
                  Or paste this into <Inline>~/.cursor/mcp.json</Inline>:
                </p>
                {block('cursor-config', CURSOR_CONFIG, 'config', true)}
              </Step>
              <Step number={2} isLast>
                <p className="text-sm text-sand-700 dark:text-sand-300">
                  Cursor asks you to sign in. Your browser opens: sign in to AI Canvas and click{' '}
                  <span className="font-semibold">Allow</span>.
                </p>
              </Step>
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
              <Step number={2} isLast>
                <p className="text-sm text-sand-700 dark:text-sand-300">
                  Start the server from that file. VS Code opens your browser: sign in to AI Canvas and click{' '}
                  <span className="font-semibold">Allow</span>.
                </p>
              </Step>
            </>
          )}

          {agent === 'desktop' && (
            <>
              <Step number={1}>
                <Hint>In Claude Desktop, open Settings, then Connectors, and add a custom connector with this address:</Hint>
                {block('desktop-url', HOSTED_MCP_URL, 'address')}
              </Step>
              <Step number={2} isLast>
                <p className="text-sm text-sand-700 dark:text-sand-300">
                  Click Connect. Your browser opens: sign in to AI Canvas and click{' '}
                  <span className="font-semibold">Allow</span>.
                </p>
              </Step>
            </>
          )}

          {agent === 'other' && (
            <>
              <Step number={1}>
                <Hint>Any AI agent that supports remote MCP servers works. Add this server address:</Hint>
                {block('other-url', HOSTED_MCP_URL, 'address')}
              </Step>
              <Step number={2} isLast>
                <p className="text-sm text-sand-700 dark:text-sand-300">
                  When it asks you to sign in, your browser opens: sign in to AI Canvas and click{' '}
                  <span className="font-semibold">Allow</span>.
                </p>
              </Step>
            </>
          )}
        </div>
      </div>

      {showDocsLink && <p className="mt-3 text-sm text-sand-600 dark:text-sand-400">Stuck, or setting up CI? <Link href="/mcp/docs" className="font-medium text-olive-600 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300">Read the docs</Link>.</p>}

      {apiKey && (
        <div className="mt-4 rounded-xl border border-sand-200 p-4 dark:border-sand-800">
          <p className="text-sm font-semibold text-sand-900 dark:text-sand-50">No browser on that machine?</p>
          <p className="mb-3 mt-1 text-sm text-sand-600 dark:text-sand-400">
            In CI or a remote shell, skip the sign-in and send your API key as a header. Store it as a secret, never in git.
          </p>
          <CodeBlock
            command={MASKED_API_HEADER}
            copied={copied === 'api-header'}
            onCopy={() => copy('api-header', `Authorization: Bearer ${apiKey}`, 'Header copied')}
            label="header"
            multiline={false}
          />
          <div className="mt-3">
            <Hint>For Claude Code:</Hint>
            <CodeBlock
              command={MASKED_CLAUDE_HEADER_COMMAND}
              copied={copied === 'api-claude'}
              onCopy={() =>
                copy(
                  'api-claude',
                  `claude mcp add --transport http --scope user aicanvas ${HOSTED_MCP_URL} --header "Authorization: Bearer ${apiKey}"`,
                  'Command copied',
                )
              }
              label="command"
              multiline={false}
            />
          </div>
          <p className="mt-3 text-sm text-sand-600 dark:text-sand-400">
            View or rotate your key in{' '}
            <Link
              href="/account/settings"
              className="font-medium text-olive-600 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300"
            >
              account settings
            </Link>
            .
          </p>
        </div>
      )}

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
