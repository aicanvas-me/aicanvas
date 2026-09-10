'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy } from '@phosphor-icons/react'
import { Step } from '../components/Step'

// ── Static config ────────────────────────────────────────────────────────────

const PACKAGE = '@aicanvas/mcp'
const SERVER_NAME = 'aicanvas'

// On-screen mask for the account token — copy/deep-link carry the real value.
const MASKED_TOKEN = 'aic_••••••••'

// The install command / config bakes the account token in as an AICANVAS_TOKEN
// env var so the MCP authenticates on first run (the README's intended flow).
// `token` = real value (for copy), the masked form (for display), or '' when
// signed out (plain command, browse-only). Claude Code has three --scope modes.
function claudeCommand(scope: Scope, token: string) {
  const env = token ? ` --env AICANVAS_TOKEN=${token}` : ''
  return `claude mcp add ${SERVER_NAME} --scope ${scope}${env} -- npx -y ${PACKAGE}`
}
// Codex has no --scope flag yet — its CLI registers the server globally.
function codexCommand(token: string) {
  const env = token ? ` --env AICANVAS_TOKEN=${token}` : ''
  return `codex mcp add ${SERVER_NAME}${env} -- npx -y ${PACKAGE}`
}
// Cursor stores MCP servers as JSON.
function cursorConfig(token: string) {
  const env = token ? `,\n      "env": { "AICANVAS_TOKEN": "${token}" }` : ''
  return `{
  "mcpServers": {
    "${SERVER_NAME}": {
      "command": "npx",
      "args": ["-y", "${PACKAGE}"]${env}
    }
  }
}`
}

// Cursor one-click deep link — config is base64 of the INNER server object.
// Without a token we use the prebuilt string; with one we rebuild it so the
// deep link installs already authenticated. btoa runs client-side only (token
// arrives after the client fetch), so no SSR base64 concerns.
const CURSOR_CONFIG_B64 =
  'eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBhaWNhbnZhcy9tY3AiXX0='
const CURSOR_DEEPLINK_BASE = `cursor://anysphere.cursor-deeplink/mcp/install?name=${SERVER_NAME}&config=${CURSOR_CONFIG_B64}`
function cursorDeeplink(token: string) {
  if (!token) return CURSOR_DEEPLINK_BASE
  const config = btoa(
    JSON.stringify({ command: 'npx', args: ['-y', PACKAGE], env: { AICANVAS_TOKEN: token } }),
  )
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${SERVER_NAME}&config=${config}`
}

const TEST_PROMPT = `What's the best navbar component in AI Canvas? Install it for me.`

// Geist Mono shapes `--` as a ligature/contextual alternate, which visually
// swallows the space before it (e.g. `aicanvas--scope`). Disable ligatures so
// the install commands render with correct spacing.
const NO_LIGATURES = {
  fontVariantLigatures: 'none',
  fontFeatureSettings: '"liga" 0, "calt" 0',
} as const

type Tool = 'claude' | 'codex' | 'cursor'
type Scope = 'user' | 'project' | 'local'

const TOOL_META: Record<Tool, { label: string; ask: string }> = {
  claude: { label: 'Claude Code', ask: 'Claude' },
  codex: { label: 'Codex', ask: 'Codex' },
  cursor: { label: 'Cursor', ask: 'Cursor' },
}

// ── Brand marks ──────────────────────────────────────────────────────────────

function ClaudeMark() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" />
    </svg>
  )
}

function CodexMark() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.15a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  )
}

function CursorMark() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
    </svg>
  )
}

const TOOLS: { id: Tool; mark: React.ReactNode }[] = [
  { id: 'claude', mark: <ClaudeMark /> },
  { id: 'codex', mark: <CodexMark /> },
  { id: 'cursor', mark: <CursorMark /> },
]

const SCOPES: { id: Scope; label: string; desc: React.ReactNode }[] = [
  {
    id: 'user',
    label: 'User',
    desc: (
      <>
        Run this in any terminal. The MCP works in every project you open.
        Install once, then forget it exists.
      </>
    ),
  },
  {
    id: 'project',
    label: 'Project',
    desc: (
      <>
        Run this in your project root. Saved to{' '}
        <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">
          .mcp.json
        </code>{' '}
        and shared through git, so everyone on the project gets it. Best for
        teams.
      </>
    ),
  },
  {
    id: 'local',
    label: 'Local',
    desc: (
      <>
        Run this in your project root. Only you see the MCP, and only in this
        project.
      </>
    ),
  },
]

// ── Toast ────────────────────────────────────────────────────────────────────

function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 2400)
    return () => clearTimeout(t)
  }, [message])
  return { message, show: setMessage }
}

function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-2 rounded-full border border-sand-200 bg-sand-100/95 px-4 py-2.5 text-sm font-semibold text-sand-900 shadow-xl backdrop-blur dark:border-sand-700 dark:bg-sand-800/95 dark:text-sand-50"
          role="status"
        >
          <Check weight="regular" size={15} className="text-olive-600 dark:text-olive-500" />
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

// ── Code block with copy button (matches the per-component install style) ───

function CodeBlock({
  command,
  copied,
  onCopy,
  label,
  multiline,
}: {
  command: string
  copied: boolean
  onCopy: () => void
  label: string
  multiline?: boolean
}) {
  return (
    <div
      className={`flex gap-3 rounded-lg bg-sand-200 dark:bg-sand-950 px-4 py-3.5 ${
        multiline ? 'items-start' : 'items-center justify-between'
      }`}
    >
      {multiline ? (
        <pre
          className="min-w-0 flex-1 overflow-x-auto font-mono text-sm leading-relaxed text-sand-700 dark:text-sand-300"
          style={NO_LIGATURES}
        >
          {command}
        </pre>
      ) : (
        <code
          className="block min-w-0 flex-1 overflow-x-auto font-mono text-sm text-sand-700 dark:text-sand-300"
          style={NO_LIGATURES}
        >
          {command}
        </code>
      )}
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check weight="regular" size={14} className="text-olive-500" />
        ) : (
          <Copy weight="regular" size={14} />
        )}
      </button>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function InstallCards() {
  const { message, show } = useToast()
  const [tool, setTool] = useState<Tool>('claude')
  const [scope, setScope] = useState<Scope>('user')
  const [installCopied, setInstallCopied] = useState(false)
  const [testCopied, setTestCopied] = useState(false)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [tokenLoaded, setTokenLoaded] = useState(false)

  // Signed-in user's API token, so the install command / config can bake it in
  // (AICANVAS_TOKEN) and the MCP authenticates on first run. Fetched client-side
  // so the /mcp page stays static. null = signed out (or no token yet).
  // tokenLoaded gates the token note so a signed-in user never flashes "Sign in".
  useEffect(() => {
    let cancelled = false
    fetch('/api/me/token')
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setUserToken(d?.token ?? null) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setTokenLoaded(true) })
    return () => { cancelled = true }
  }, [])

  function copy(text: string, toast: string, setLocal: (v: boolean) => void) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      show('Copy not supported, copy it manually')
      return
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setLocal(true)
        show(toast)
        setTimeout(() => setLocal(false), 2000)
      })
      .catch(() => show('Copy failed, try again'))
  }

  const isCodex = tool === 'codex'
  const isCursor = tool === 'cursor'
  const { label: toolLabel, ask: askLabel } = TOOL_META[tool]
  // Masked for display, real value for the copy handler.
  const displayToken = userToken ? MASKED_TOKEN : ''
  const installCommandDisplay = isCodex
    ? codexCommand(displayToken)
    : claudeCommand(scope, displayToken)
  const installCommandCopy = isCodex
    ? codexCommand(userToken ?? '')
    : claudeCommand(scope, userToken ?? '')

  return (
    <section className="mt-2">
      <h2 className="mb-3 text-lg font-bold text-sand-900 dark:text-sand-50">
        How to install the MCP
      </h2>
      {/* Tabbed install widget — matches the per-component "Add to your project" */}
      <div className="overflow-hidden rounded-xl border border-sand-200 dark:border-sand-800">
        {/* Tool toggle — Claude Code / Codex / Cursor */}
        <div className="flex gap-1.5 border-b border-sand-200 bg-sand-100 p-1.5 dark:border-sand-800 dark:bg-sand-900">
          {TOOLS.map((t) => {
            const active = tool === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTool(t.id)
                  setInstallCopied(false)
                  setTestCopied(false)
                }}
                aria-pressed={active}
                className={`relative flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors sm:gap-2 sm:px-4 sm:text-sm ${
                  active
                    ? 'text-sand-900 dark:text-sand-50'
                    : 'text-sand-600 hover:text-sand-700 dark:text-sand-500 dark:hover:text-sand-300'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mcpToolHighlight"
                    className="absolute inset-0 rounded-lg bg-sand-50 shadow-sm ring-1 ring-sand-300 dark:bg-sand-800 dark:ring-sand-700"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5 text-center leading-tight sm:gap-2">
                  {t.mark}
                  {TOOL_META[t.id].label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Scope tabs — Claude Code only (Codex/Cursor have no --scope) */}
        {tool === 'claude' && (
          <div className="flex overflow-x-auto border-b border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
            {SCOPES.map((s) => {
              const active = scope === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScope(s.id)}
                  aria-pressed={active}
                  className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'text-sand-900 dark:text-sand-50'
                      : 'text-sand-600 hover:text-sand-700 dark:text-sand-500 dark:hover:text-sand-300'
                  }`}
                >
                  {s.label}
                  {active && (
                    <motion.span
                      layoutId="mcpScopeUnderline"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-sand-900 dark:h-px dark:bg-sand-50"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Steps */}
        <div className="space-y-6 bg-sand-100 px-5 py-6 dark:bg-sand-900">
          <Step number={1}>
            {isCursor ? (
              <>
                <p className="mb-3 text-sm text-sand-600 dark:text-sand-400">
                  One click installs it. The button opens Cursor with the config
                  filled in, so you just enable it.
                </p>
                <a
                  href={cursorDeeplink(userToken ?? '')}
                  className="inline-flex items-center gap-2 rounded-lg bg-olive-500 px-4 py-2.5 text-sm font-semibold text-sand-950 transition-colors hover:bg-olive-400"
                >
                  <CursorMark />
                  Add to Cursor
                </a>
                <p className="mb-2.5 mt-5 text-sm text-sand-600 dark:text-sand-400">
                  Or paste this into{' '}
                  <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">
                    ~/.cursor/mcp.json
                  </code>{' '}
                  (global) or{' '}
                  <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">
                    .cursor/mcp.json
                  </code>{' '}
                  (one project):
                </p>
                <CodeBlock
                  command={cursorConfig(displayToken)}
                  copied={installCopied}
                  onCopy={() =>
                    copy(cursorConfig(userToken ?? ''), 'Config copied', setInstallCopied)
                  }
                  label="Cursor config"
                  multiline
                />
              </>
            ) : (
              <>
                <p className="mb-2.5 text-sm text-sand-600 dark:text-sand-400">
                  {isCodex ? (
                    <>
                      Run this in any terminal. Codex registers the MCP globally,
                      so it works in every project. Its CLI has no per-project
                      scope yet.
                    </>
                  ) : (
                    SCOPES.find((s) => s.id === scope)!.desc
                  )}
                </p>
                <CodeBlock
                  command={installCommandDisplay}
                  copied={installCopied}
                  onCopy={() =>
                    copy(
                      installCommandCopy,
                      'Install command copied',
                      setInstallCopied,
                    )
                  }
                  label="install command"
                />
              </>
            )}
            {tokenLoaded && (userToken ? (
              <p className="mt-3 text-sm text-sand-600 dark:text-sand-400">
                Your token is baked into the command above, so installs can pull
                source. View or rotate it in your{' '}
                <Link
                  href="/account/settings"
                  className="font-medium text-sand-700 underline underline-offset-2 hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-50"
                >
                  account settings
                </Link>
                .
              </p>
            ) : (
              <p className="mt-3 text-sm text-sand-600 dark:text-sand-400">
                <Link
                  href="/account/settings"
                  className="font-medium text-sand-700 underline underline-offset-2 hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-50"
                >
                  Sign in
                </Link>{' '}
                to bake your token into the command (free or premium account).
                Without it your agent can browse components but can&rsquo;t pull
                their source.
              </p>
            ))}
          </Step>

          <Step number={2}>
            <p className="text-sm text-sand-600 dark:text-sand-400">
              {isCursor ? 'Reload the Cursor window.' : `Restart ${toolLabel}.`}{' '}
              The{' '}
              <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">
                aicanvas
              </code>{' '}
              MCP loads automatically.
            </p>
          </Step>

          <Step number={3} isLast>
            <div className="mb-2.5 flex items-center gap-2">
              <p className="text-sm text-sand-600 dark:text-sand-400">
                Test it. Ask {askLabel}:
              </p>
              <span className="ml-auto shrink-0 rounded-full bg-sand-50 px-2 py-0.5 text-xs font-medium text-sand-600 dark:bg-sand-800 dark:text-sand-500">
                Optional
              </span>
            </div>
            <CodeBlock
              command={TEST_PROMPT}
              copied={testCopied}
              onCopy={() => copy(TEST_PROMPT, 'Test prompt copied', setTestCopied)}
              label="test prompt"
            />
          </Step>
        </div>
      </div>

      <Toast message={message} />
    </section>
  )
}
