'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, Lightning, LockSimple, Terminal, X } from '@phosphor-icons/react'
import { Button } from '../components/Button'
import { track } from '../lib/analytics'
import { copyText } from '../components/useCopied'
import { Paywall } from '../components/billing/Paywall'
import { usePaywallModal } from '../components/billing/PaywallModalProvider'

// Blurred behind the prompt paywall. Prompt-shaped, not TSX-shaped, so the
// blur matches what is actually withheld (the Code tab's default teaser is a
// fake component and would read as the wrong thing here). Decorative only.
// It deliberately omits the literal "## 2." / "## 3." / "## 4." headings, so
// grepping a response for those headings stays a clean leak check.
const LOCKED_PROMPT_TEASER = `State
- every hook, handler, effect and disposal
- the animation loop, frame by frame

Tree
- the JSX, every className and inline style

Why · Remix · Check
- the mechanism, the tuning points, the checks
`

export interface RemixPanelProps {
  /** Whether the panel is slid into view. The panel itself stays mounted
   *  (see below) — this only drives the slide + backdrop + focus/scroll lock. */
  open: boolean
  onClose: () => void
  /** Component display name — used in the heading and the disclaimer copy. */
  name: string
  /** Analytics key: fired as the `component` property on every event this
   *  panel sends (Remix Prompt Copy). Keep it the same value the page's own
   *  Remix Open / CLI Copy events use. */
  slug: string
  /** Full remix prompt. When falsy the panel isn't mounted at all — no Remix
   *  button should be shown on the page either. */
  prompt?: string | null
  /** True when `prompt` is only the free head (the rest was withheld
   *  server-side). Swaps the Copy button for an Unlock button and renders the
   *  paywall band under the prompt. */
  promptLocked?: boolean
  /** Shows the "Premium" pill next to the panel heading. */
  premium?: boolean
  /** Display (already masked, if applicable) install reference — the part of
   *  the CLI command after "npx shadcn@latest add " — shown in the "Want the
   *  exact component?" box. Kept as its own child (not pre-joined into the
   *  full command string) so the box's JSX matches the original text/
   *  expression split exactly: joining it into one string removes the
   *  hydration comment marker React puts between sibling children, which is
   *  an invisible-but-real DOM difference on the standalone page. */
  cliReference: string
  /** Whether the CLI box's button should read "Copied!" right now — owned by
   *  the caller so it can share state/timing with the page's other Copy CLI
   *  action instead of drifting out of sync with it. */
  cliCopied: boolean
  /** Click handler for the CLI box's button. The caller owns the actual
   *  clipboard write, any premium/account gating, and its own tracking, so
   *  this always matches whatever the page's other Copy CLI action does. */
  onCopyCli: () => void
  /** Non-subscriber viewing gated (premium-only) content: swaps the CLI
   *  button to a lock icon + "Unlock to install". */
  needsPremium?: boolean
  /** Signed-out visitor of an account-gated free component: shows the "Free
   *  account required" caption under the CLI box. */
  needsFreeAccount?: boolean
}

// ─── RemixPanel ─────────────────────────────────────────────────────────────
// The "Remix with AI" right-hand drawer, shared by the standalone component
// page and every design-system component page. ONE implementation so the two
// surfaces cannot drift the way the standalone and Andromeda Pro copies did
// (width, spring, backdrop, scroll lock, copy timing, the CLI box, and which
// analytics event a CLI copy fires all diverged before this file existed).
//
// The panel is ALWAYS mounted (once `prompt` exists) and merely slides
// off-canvas when closed, so the full prompt text ships in the server-
// rendered HTML and gets crawled — the single biggest block of unique text on
// the page it's used on. The backdrop is interaction chrome only, so it
// mounts on open.
export function RemixPanel({
  open,
  onClose,
  name,
  slug,
  prompt,
  promptLocked = false,
  premium = false,
  cliReference,
  cliCopied,
  onCopyCli,
  needsPremium = false,
  needsFreeAccount = false,
}: RemixPanelProps) {
  const [remixCopied, setRemixCopied] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { open: openPaywallModal } = usePaywallModal()

  // Escape key closes the panel.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Open: lock body scroll and move focus into the dialog.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  async function copyRemixPrompt() {
    if (!prompt) return
    // Copies exactly what is on screen. Only ever reached when the prompt is
    // NOT paywalled: a locked prompt opens the paywall instead of copying, so
    // nobody walks away with blocks 1-2 believing they have a working prompt.
    const ok = await copyText(prompt)
    track('Remix Prompt Copy', { component: slug, ok })
    if (!ok) return
    setRemixCopied(true)
    setTimeout(() => setRemixCopied(false), 2500)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="remix-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-sand-950/70 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      {prompt && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="remix-panel-title"
          tabIndex={-1}
          inert={!open}
          initial={false}
          animate={{ x: open ? '0%' : '105%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 40 }}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-sand-200 bg-sand-100 shadow-2xl outline-none dark:border-sand-800 dark:bg-sand-900"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-5 px-6 py-5 sm:px-8">
            <div className="pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="remix-panel-title"
                  className="text-base font-bold text-sand-900 dark:text-sand-50"
                >
                  Remix {name} with AI
                </h2>
                {/* Same pill as the tag row on the page behind. Says what the
                    lock further down is about before the reader reaches it. */}
                {premium && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-olive-600/40 bg-olive-500/10 px-2.5 py-0.5 text-xs font-semibold text-olive-600 dark:border-olive-500/25 dark:text-olive-400">
                    <Lightning weight="regular" size={12} />
                    Premium
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
                Written against the real source code. Works in Claude, Cursor,
                ChatGPT, or any AI tool you use.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              iconOnly
              onClick={onClose}
              aria-label="Close Remix panel"
              className="shrink-0"
            >
              <X weight="regular" size={16} />
            </Button>
          </div>

          {/* Divider — inset to match the content padding on both sides */}
          <div className="mx-6 border-t border-sand-200 dark:border-sand-800 sm:mx-8" />

          {/* Body */}
          <div
            className="flex-1 overflow-y-auto px-6 py-6 sm:px-8"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* Remix disclaimer */}
            <p className="text-sm leading-relaxed text-sand-600 dark:text-sand-400">
              <span className="font-semibold text-sand-900 dark:text-sand-50">
                This prompt is for remixing.
              </span>{' '}
              Use it to build your own variation of {name}. Results depend on
              the model you use, and no prompt in the world is 100% exact.
            </p>

            {/* CLI first — the accurate path */}
            <div className="mt-5 rounded-xl border border-olive-500/40 bg-olive-500/10 p-5">
              <p className="text-sm font-semibold text-sand-900 dark:text-sand-50">
                Want the exact component?
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
                One command installs it, pixel-perfect. Copy, paste into your
                project, done.
              </p>
              <div className="mt-4 flex items-start gap-2.5">
                {/* One line, clipped. A signed-in install is a tokenized URL
                    that wraps to two lines and turns a tidy card into a wall of
                    monospace. Nothing is lost by cutting it: the visible form
                    is masked anyway, and the button copies the real command. */}
                <code className="min-w-0 flex-1 truncate rounded-lg bg-sand-200 dark:bg-sand-950 px-3 py-2 font-mono text-xs leading-relaxed text-sand-800 dark:text-sand-200">
                  npx shadcn@latest add {cliReference}
                </code>
                {/* onCopyCli already sends a non-subscriber to the paywall
                    instead of copying, so only the label was lying: it offered
                    a clipboard action beside a command that is already dots.
                    Same treatment as the locked prompt below. */}
                <Button variant="primary" size="sm" onClick={onCopyCli}>
                  {needsPremium
                    ? <LockSimple weight="regular" size={15} />
                    : cliCopied
                    ? <Check weight="regular" size={15} />
                    : <Terminal weight="regular" size={15} />}
                  {needsPremium
                    ? 'Unlock to install'
                    : cliCopied ? 'Copied!' : 'Copy CLI'}
                </Button>
              </div>
              {/* Same warning as the install step: the command above is real
                  and runnable, and signed out it installs a placeholder. */}
              {needsFreeAccount && (
                <p className="mt-2.5 text-xs text-sand-600 dark:text-sand-400">
                  Free account required. Signed out, this installs a placeholder
                  file instead of the component.
                </p>
              )}
            </div>

            {/* The prompt */}
            <div className="mt-8 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-sand-900 dark:text-sand-50">
                AI prompt for {name}
              </h3>
              {promptLocked ? (
                /* Copying a paywalled prompt used to silently hand over blocks 1-2
                   and say "Copied!". That is a broken build waiting to happen and
                   the component gets the blame, so the button sells instead. */
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPaywallModal({ reason: 'premium-only' })}
                >
                  <LockSimple weight="regular" size={15} />
                  Unlock full prompt
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={copyRemixPrompt}>
                  {remixCopied
                    ? <Check weight="regular" size={15} />
                    : <Copy weight="regular" size={15} />}
                  {remixCopied ? 'Copied!' : 'Copy prompt'}
                </Button>
              )}
            </div>
            {/* ONE panel, always. When block 3 onward is withheld the lock is a band
                INSIDE it, sitting exactly where the cut happened, so the prompt
                still reads as a single document. Rendering head, lock and tail as
                three rounded cards made a paywalled prompt look broken rather
                than gated. */}
            <div className="mt-4 overflow-hidden rounded-xl bg-sand-200 dark:bg-sand-950 font-mono text-xs leading-relaxed text-sand-800 dark:text-sand-200">
              <pre
                className={`whitespace-pre-wrap break-words px-5 pt-5 ${
                  promptLocked
                    // Fade the last lines out instead of cutting them off. A hard
                    // edge reads as truncation, a fade reads as "there is more".
                    ? 'pb-0 [mask-image:linear-gradient(to_bottom,#000_calc(100%-5rem),transparent)] [-webkit-mask-image:linear-gradient(to_bottom,#000_calc(100%-5rem),transparent)]'
                    : 'pb-5'
                }`}
              >
                {prompt}
              </pre>
              {promptLocked && (
                <Paywall appearance="themed" teaser={LOCKED_PROMPT_TEASER} name={name} />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}
