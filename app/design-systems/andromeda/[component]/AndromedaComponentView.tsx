'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Code,
  Copy,
  CornersIn,
  CornersOut,
  Eye,
  Terminal,
} from '@phosphor-icons/react'
import { Step } from '../../../components/Step'
import { SiteFooter } from '../../../components/SiteFooter'
import { Button } from '../../../components/Button'
import { SaveButton } from '../../../components/SaveButton'
import { HighlightedCodeView } from '../../../components/HighlightedCodeView'
// The preview renders from the component's MATRIX DECLARATION, the same one
// the system page renders, so the two surfaces cannot show different things.
// This replaced a hand-written per-slug demo whose size ramp had no state axis,
// which is why this page could not show Destructive at lg while the system page
// could.
import { MatrixPreview, matrixSectionHeading } from '../../../_lib/andromeda/matrix/Matrix'
import { SPEC_BY_SLUG, matrixId } from '../../../_lib/andromeda/matrix'
import { andromedaRegistrySlug } from '../../../_lib/andromeda/andromeda-meta'
import { tokens } from '../../../lib/andromeda-v2.generated'
import { trackInstall } from '../../../lib/track-install'
import { useSession } from '../../../components/auth/SessionProvider'
import { useAuthModal } from '../../../components/auth/AuthModalProvider'
import { optimizeImageKitUrl } from '../../../lib/imagekit'
import { Paywall, type PaywallReason } from '../../../components/billing/Paywall'
import type { AndromedaPropTable } from '../../../lib/andromeda-props.generated'
import { PropsTable } from '../../../components/PropsTable'

type RelatedItem = { slug: string; name: string; image?: string }

interface Props {
  slug: string
  name: string
  description: string
  related: RelatedItem[]
  // Prop tables parsed from the component's @typedef JSDoc at build time.
  // Empty for the few components without a @typedef block — section is hidden.
  propTables?: AndromedaPropTable[]
  // Account-gated install: when on, a signed-out visitor of this FREE
  // design-system component sees a "create a free account to install" CTA in
  // place of the runnable command. Reading the source (Code tab) stays public.
  freeAccountGate?: boolean
}

// Same chip and panel chrome the sibling system's component pages use, so the
// two read as one site.
const coverageChip =
  'rounded-lg bg-sand-200 px-2.5 py-1.5 text-xs font-semibold text-sand-600 transition-colors hover:bg-sand-300 hover:text-sand-900 dark:bg-sand-800 dark:text-sand-400 dark:hover:bg-sand-700 dark:hover:text-sand-50'

const coveragePanel =
  'rounded-2xl border border-sand-300 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900'

export function AndromedaComponentView({
  slug,
  name,
  description,
  related,
  propTables = [],
  freeAccountGate = false,
}: Props) {
  const { preferences, user } = useSession()
  const { open: openAuthModal } = useAuthModal()
  // The registry slug is normally `andromeda-<metaSlug>`. The lone exception is the
  // slugOverride (scripts/lib/design-systems.config.mjs): Button.tsx ships as the
  // registry item `andromeda-button-system` because the free standalone owns
  // `andromeda-button`. Map the page's meta slug back to the REGISTRY slug so the
  // Code tab, install command, analytics, and Save all target the right item —
  // otherwise the Button page silently serves the standalone.
  const registrySlug = andromedaRegistrySlug(slug)

  // Personalized install: when signed in, the copied command carries the
  // user's API token so the registry attributes the pull to the account.
  // Signed out = plain @aicanvas command. The token route is resilient
  // (returns null on any error), so this is a no-op fallback to the anonymous
  // command rather than a break.
  const [fetchedToken, setFetchedToken] = useState<string | null>(null)
  useEffect(() => {
    if (!user) return
    let cancelled = false
    const refresh = () =>
      fetch('/api/me/token')
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setFetchedToken(d?.token ?? null) })
        .catch(() => {})
    refresh()
    // Re-fetch on focus so a token rotated in another tab isn't left stale here.
    window.addEventListener('focus', refresh)
    return () => { cancelled = true; window.removeEventListener('focus', refresh) }
  }, [user])
  // Signed-out derives to null at render — no setState in the effect body.
  const userToken = user ? fetchedToken : null
  // One lookup for the whole page: the preview, the fullscreen preview and the
  // coverage chips all render from the same declaration.
  const spec = SPEC_BY_SLUG[slug]
  const [tab, setTab] = useState<'preview' | 'code'>('preview')
  const [codeCopied, setCodeCopied] = useState(false)
  const [cliCopied, setCliCopied] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [installTab, setInstallTab] = useState<'cli' | 'manual'>('cli')
  const [pkgManager, setPkgManager] = useState<'pnpm' | 'npm' | 'yarn' | 'bun'>('npm')
  const [darkCopied, setDarkCopied] = useState(false)
  const mainCardRef = useRef<HTMLDivElement>(null)

  // Source is never shipped in this page's HTML. It's fetched on demand from
  // the gated endpoint when the Code tab (or Manual install) opens. Reading a
  // FREE component's source is public; the endpoint only locks PREMIUM content
  // (templates + whole-system). Per-install metering is gone, so a 402 here is
  // always "premium-only". The registry slug carries the system prefix
  // (e.g. `andromeda-checkbox`).
  type CodeState =
    | { status: 'idle' | 'loading' }
    | { status: 'ready'; code: string; highlighted?: string }
    | { status: 'locked'; reason: PaywallReason; limit?: number }
  const [codeState, setCodeState] = useState<CodeState>({ status: 'idle' })
  const openCode = useCallback(async () => {
    setCodeState({ status: 'loading' })
    try {
      const res = await fetch(`/api/component-code?slug=${registrySlug}`)
      if (res.status === 402) {
        const { limit } = await res.json().catch(() => ({}))
        setCodeState({ status: 'locked', reason: 'premium-only', limit })
        return
      }
      if (!res.ok) {
        setCodeState({ status: 'locked', reason: 'premium-only' })
        return
      }
      // The endpoint highlights server-side and returns both; keep `highlighted`
      // so the Code tab matches the standalone pages. Falls back to plain source
      // when Shiki hiccups (the endpoint serves raw code in that case).
      const { code, highlighted } = await res.json()
      setCodeState({ status: 'ready', code: code ?? '', highlighted })
    } catch {
      setCodeState({ status: 'locked', reason: 'premium-only' })
    }
  }, [registrySlug])
  // Fetch the first time the source becomes visible (Code tab or Manual tab).
  useEffect(() => {
    if ((tab === 'code' || installTab === 'manual') && codeState.status === 'idle') void openCode()
  }, [tab, installTab, codeState.status, openCode])
  // Re-fetch when navigating to another component.
  useEffect(() => { setCodeState({ status: 'idle' }) }, [slug])

  // Adopt the user's preferred package manager once preferences load.
  // We don't override an in-progress click — only the initial default.
  useEffect(() => {
    if (preferences.package_manager) setPkgManager(preferences.package_manager)
  }, [preferences.package_manager])

  const RELATED_PAGE_SIZE = 3
  const [relatedStart, setRelatedStart] = useState(0)
  const [relatedDir, setRelatedDir] = useState<1 | -1>(1)
  const visibleRelated = related.slice(
    relatedStart,
    relatedStart + RELATED_PAGE_SIZE,
  )
  const canPaginate = related.length > RELATED_PAGE_SIZE
  const canGoPrev = relatedStart > 0
  const canGoNext = relatedStart < related.length - RELATED_PAGE_SIZE

  function pageRelated(dir: 1 | -1) {
    setRelatedDir(dir)
    setRelatedStart((s) =>
      dir === 1
        ? Math.min(related.length - RELATED_PAGE_SIZE, s + 1)
        : Math.max(0, s - 1),
    )
  }

  useEffect(() => {
    if (!fullscreen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen])

  async function copyCode() {
    if (codeState.status !== 'ready') return
    try {
      await navigator.clipboard.writeText(codeState.code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch {}
  }

  // Rendered wherever source appears (Code tab + Manual install). Locked → the
  // ladder-aware paywall (sign-up / upgrade cards); ready → the source.
  const renderCodePane = () =>
    codeState.status === 'locked' ? (
      <Paywall
        reason={codeState.reason}
        limit={codeState.limit}
        name={name}
        // Remix with AI is deliberately not offered on system components (see
        // the note further down), so the default sub-copy would promise a
        // prompt this page does not have.
        subtitle="The full source ships with Premium."
      />
    ) : codeState.status === 'ready' ? (
      codeState.highlighted ? (
        <HighlightedCodeView html={codeState.highlighted} />
      ) : (
        <pre
          className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed"
          style={{ color: tokens.color.text.secondary }}
        >
          {codeState.code}
        </pre>
      )
    ) : (
      <div
        className="flex min-h-[200px] items-center justify-center text-sm"
        style={{ color: tokens.color.text.faint }}
      >
        Loading source…
      </div>
    )

  // Andromeda ships through the published @aicanvas shadcn registry, so this
  // command installs a real component — it mirrors the standalone pattern for
  // a consistent layout.
  // Signed-in users get a tokenized direct-URL install so the registry can
  // attribute the pull to their account; anonymous users get the plain
  // @aicanvas namespace command. The displayed form masks the token; copy
  // buttons write the REAL token to the clipboard so the install works.
  const installReference = userToken
    ? `"https://aicanvas.me/r/${registrySlug}.json?token=${userToken}"`
    : `@aicanvas/${registrySlug}`
  const installReferenceMasked = userToken
    ? `"https://aicanvas.me/r/${registrySlug}.json?token=aic_••••••••"`
    : `@aicanvas/${registrySlug}`
  const cliCommand = `npx shadcn@latest add ${installReference}`

  // Account-gated install: a FREE design-system component, signed out, with the
  // gate active needs a free account before the one-command install works
  // (unlimited, uncounted). Reading the source stays public. We use `user` from
  // useSession (immediate) rather than userToken (async, would flash the CTA on
  // first paint).
  const needsFreeAccount = !!freeAccountGate && !user

  // Open the Lab-style gate modal (two-button pitch, then sign-in / sign-up),
  // returning the visitor here after they create their free account. The install
  // UI stays fully visible; only the COPY actions route here when signed out.
  function promptFreeAccount() {
    openAuthModal({
      mode: 'gate',
      next: `/design-systems/andromeda/${slug}`,
      title: 'Grab this component.',
      subtitle: 'Sign in or create a free account to install with one command. Free and unlimited.',
    })
  }

  async function copyCli() {
    // Soft gate: signed-out + gated → open the auth modal instead of copying.
    if (needsFreeAccount) {
      promptFreeAccount()
      return
    }
    try {
      trackInstall(registrySlug, 'andromeda', pkgManager)
      await navigator.clipboard.writeText(cliCommand)
      setCliCopied(true)
      setTimeout(() => setCliCopied(false), 2000)
    } catch {}
  }

  return (
    <>
    <main className="mx-auto w-full max-w-4xl px-4 pt-8 pb-8 sm:px-6 sm:pt-14">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
          {name}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-sand-600 dark:text-sand-400">
          {description}
        </p>
      </div>

      {/* ── Main card (Preview / Code) ──────────────────────────────────── */}
      <div ref={mainCardRef} className="overflow-hidden rounded-2xl border border-sand-300 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
        {/* Tab bar */}
        <div className="flex items-center justify-between border-b border-sand-300 px-3 py-3 dark:border-sand-800 sm:px-5 sm:py-4">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setTab('preview')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                tab === 'preview'
                  ? 'bg-sand-200 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                  : 'text-sand-400 hover:text-sand-600 dark:text-sand-500 dark:hover:text-sand-300'
              }`}
            >
              <Eye weight="regular" size={15} />
              Preview
            </button>
            <button
              type="button"
              onClick={() => setTab('code')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                tab === 'code'
                  ? 'bg-sand-200 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                  : 'text-sand-400 hover:text-sand-600 dark:text-sand-500 dark:hover:text-sand-300'
              }`}
            >
              <Code weight="regular" size={15} />
              Code
            </button>
          </div>

          {tab === 'preview' && (
            <div className="group/fullscreen relative">
              <Button variant="accent" size="md" iconOnly aria-label="Full screen" onClick={() => setFullscreen(true)}>
                <CornersOut weight="regular" size={16} />
              </Button>
              <div className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 hidden whitespace-nowrap rounded-lg border border-sand-700 bg-sand-800 px-2.5 py-1.5 text-xs text-sand-300 group-hover/fullscreen:block">
                Full screen
              </div>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="relative min-h-[420px]">
          {tab === 'preview' ? (
            <div
              /* Horizontal inset matches the tab bar above (px-3 sm:px-5) so the
                 case cards line up with the Preview tab and the fullscreen
                 button instead of sitting 28px inside them. Vertical padding
                 stays generous: that is breathing room, not alignment. */
              className="flex min-h-[420px] items-center justify-center overflow-auto px-3 py-8 sm:px-5 sm:py-12"
              style={{ backgroundColor: tokens.color.surface.base }}
            >
              {!fullscreen && spec ? <MatrixPreview spec={spec} /> : null}
            </div>
          ) : (
            <div
              className="min-h-[420px] overflow-auto p-5"
              style={{
                backgroundColor: tokens.color.surface.base,
                maxHeight: '70vh',
                scrollbarWidth: 'thin',
              }}
            >
              {renderCodePane()}
            </div>
          )}
        </div>

        {/* Action bar — Andromeda system components are coherence-oriented;
            Remix with AI deliberately omitted because mutating a system
            component breaks the system contract. Users compose AT the
            system level, not per-component. */}
        <div className="flex items-center justify-end gap-2 border-t border-sand-300 px-3 py-3 dark:border-sand-800 sm:px-5 sm:py-4">
          {/* Save — signed out, opens the same soft-gate modal as Copy CLI.
              Keyed on the REGISTRY slug (not the page slug) so the Button
              override (andromeda-button-system) can't collide with the free
              standalone's own save entry (andromeda-button). */}
          <SaveButton slug={registrySlug} system="andromeda" />

          {/* Copy CLI — the button and command stay visible at all times; when
              the install is account-gated and the visitor is signed out,
              copyCli() opens the auth modal instead of copying. */}
          <Button variant="primary" size="sm" onClick={copyCli}>
            {cliCopied ? (
              <Check weight="regular" size={15} />
            ) : (
              <Terminal weight="regular" size={15} />
            )}
            {cliCopied ? 'Copied!' : 'Copy CLI'}
          </Button>
        </div>
      </div>

      {/* ── Coverage ─────────────────────────────────────────────────────
          Chips jump to the matching case in the preview above and light it,
          which is what makes a 12-card preview navigable. Both lists come from
          the same declaration the preview renders, so a chip can never point at
          a case that is not there. */}
      {spec ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {spec.variants.length > 0 && (
            <section className={coveragePanel}>
              <h2 className="text-sm font-semibold text-sand-900 dark:text-sand-50">{matrixSectionHeading('variant', spec.variants)}</h2>
              <p className="mt-1.5 mb-4 text-xs leading-relaxed text-sand-600 dark:text-sand-400">
                Supported configurations for this component.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {spec.variants.map((c) => (
                  <a key={c.label} href={`#${matrixId(spec.slug, 'variant', c.label)}`} className={coverageChip}>
                    {c.label}
                  </a>
                ))}
              </div>
            </section>
          )}

          {spec.states.length > 0 && (
            <section className={coveragePanel}>
              <h2 className="text-sm font-semibold text-sand-900 dark:text-sand-50">{matrixSectionHeading('state', spec.states)}</h2>
              <p className="mt-1.5 mb-4 text-xs leading-relaxed text-sand-600 dark:text-sand-400">
                Interaction states covered by the API and the style contract.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {spec.states.map((c) => (
                  <a key={c.label} href={`#${matrixId(spec.slug, 'state', c.label)}`} className={coverageChip}>
                    {c.label}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : null}

      {/* ── Installation ─────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="text-base font-bold text-sand-900 dark:text-sand-50">
          Add to your project
        </h2>
        <p className="mb-4 mt-1 text-sm text-sand-500 dark:text-sand-400">
          One command adds this component to your project.
        </p>

        {/* CLI / Manual tabs */}
        <div className="overflow-hidden rounded-xl border border-sand-300 dark:border-sand-800">
          <div className="flex border-b border-sand-300 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
            <button
              type="button"
              onClick={() => setInstallTab('cli')}
              className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                installTab === 'cli'
                  ? 'text-sand-900 dark:text-sand-50'
                  : 'text-sand-400 hover:text-sand-600 dark:text-sand-500 dark:hover:text-sand-300'
              }`}
            >
              CLI
              {installTab === 'cli' && (
                <span className="absolute inset-x-0 -bottom-px h-px bg-sand-900 dark:bg-sand-50" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setInstallTab('manual')}
              className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                installTab === 'manual'
                  ? 'text-sand-900 dark:text-sand-50'
                  : 'text-sand-400 hover:text-sand-600 dark:text-sand-500 dark:hover:text-sand-300'
              }`}
            >
              Manual
              {installTab === 'manual' && (
                <span className="absolute inset-x-0 -bottom-px h-px bg-sand-900 dark:bg-sand-50" />
              )}
            </button>
          </div>

          <div className="bg-sand-100 px-5 py-6 dark:bg-sand-900">
            {installTab === 'cli' ? (
              <div className="space-y-6">
                {/* Step 1 — shadcn add. The command + package-manager row stay
                    visible at all times. When the install is account-gated and
                    the visitor is signed out, the copy button opens the auth
                    modal instead of copying. */}
                <Step number={1}>
                  <p className="mb-2.5 text-sm text-sand-600 dark:text-sand-400">
                    Run the following command. New project? Run{' '}
                    <code className="rounded bg-sand-200 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">
                      npx shadcn@latest init
                    </code>{' '}
                    first to set up Tailwind and path aliases.
                  </p>
                  <div className="overflow-hidden rounded-lg bg-sand-950">
                    <div className="flex items-center gap-1 border-b border-sand-800 px-4 py-2">
                      {(['pnpm', 'npm', 'yarn', 'bun'] as const).map((pm) => (
                        <button
                          key={pm}
                          type="button"
                          onClick={() => { setPkgManager(pm); setCliCopied(false) }}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            pkgManager === pm
                              ? 'bg-sand-800 text-sand-100'
                              : 'text-sand-500 hover:text-sand-300'
                          }`}
                        >
                          {pm}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          // Soft gate: signed-out + gated → open the auth modal
                          // instead of copying.
                          if (needsFreeAccount) { promptFreeAccount(); return }
                          const cmd = pkgManager === 'pnpm'
                            ? `pnpm dlx shadcn@latest add ${installReference}`
                            : pkgManager === 'bun'
                            ? `bunx shadcn@latest add ${installReference}`
                            : pkgManager === 'yarn'
                            ? `yarn dlx shadcn@latest add ${installReference}`
                            : `npx shadcn@latest add ${installReference}`
                          navigator.clipboard.writeText(cmd)
                          trackInstall(registrySlug, 'andromeda', pkgManager)
                          setCliCopied(true)
                          setTimeout(() => setCliCopied(false), 2000)
                        }}
                        className="ml-auto shrink-0 rounded-md p-1.5 text-sand-500 transition-all hover:text-sand-200 active:scale-90"
                      >
                        {cliCopied
                          ? <Check weight="regular" size={14} className="text-olive-500" />
                          : <Copy weight="regular" size={14} />}
                      </button>
                    </div>
                    <div className="px-4 py-3.5">
                      <code className="break-all font-mono text-sm text-sand-300">
                        {pkgManager === 'pnpm'
                          ? `pnpm dlx shadcn@latest add ${installReferenceMasked}`
                          : pkgManager === 'bun'
                          ? `bunx shadcn@latest add ${installReferenceMasked}`
                          : pkgManager === 'yarn'
                          ? `yarn dlx shadcn@latest add ${installReferenceMasked}`
                          : `npx shadcn@latest add ${installReferenceMasked}`}
                      </code>
                    </div>
                  </div>
                </Step>

                {/* Step 2 — dark mode */}
                <Step number={2} isLast>
                  <div className="mb-2.5 flex items-center gap-2">
                    <p className="text-sm text-sand-600 dark:text-sand-400">
                      For dark mode, add the{' '}
                      <code className="rounded bg-sand-200 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">
                        dark
                      </code>{' '}
                      class to your{' '}
                      <code className="rounded bg-sand-200 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">
                        &lt;html&gt;
                      </code>{' '}
                      element:
                    </p>
                    <span className="ml-auto shrink-0 rounded-full bg-sand-200 px-2 py-0.5 text-xs font-medium text-sand-400 dark:bg-sand-800 dark:text-sand-500">
                      Optional
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-sand-950 px-4 py-3">
                    <code className="font-mono text-sm text-sand-300">{'<html class="dark">'}</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('<html class="dark">')
                        setDarkCopied(true)
                        setTimeout(() => setDarkCopied(false), 2000)
                      }}
                      className="shrink-0 rounded-md p-1.5 text-sand-500 transition-all hover:text-sand-200 active:scale-90"
                    >
                      {darkCopied
                        ? <Check weight="regular" size={14} className="text-olive-500" />
                        : <Copy weight="regular" size={14} />}
                    </button>
                  </div>
                </Step>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Manual: copy the source */}
                <Step number={1} isLast>
                  <p className="mb-2.5 text-sm text-sand-600 dark:text-sand-400">
                    Copy and paste the following code into your project:
                  </p>
                  <div className="relative rounded-lg bg-sand-950">
                    <div className="flex items-center justify-between border-b border-sand-800 px-4 py-2">
                      <span className="font-mono text-xs text-sand-500">
                        {name}.tsx
                      </span>
                      <button
                        type="button"
                        onClick={copyCode}
                        className="shrink-0 rounded-md p-1.5 text-sand-500 transition-all hover:text-sand-200 active:scale-90"
                      >
                        {codeCopied
                          ? <Check weight="regular" size={14} className="text-olive-500" />
                          : <Copy weight="regular" size={14} />}
                      </button>
                    </div>
                    <div className="max-h-96 overflow-auto p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4A453F transparent' }}>
                      {renderCodePane()}
                    </div>
                  </div>
                </Step>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Props ──────────────────────────────────────────────────────── */}
      <PropsTable propTables={propTables} />

      {/* ── More Andromeda components ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
              More Andromeda components
            </h2>
            {canPaginate && (
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => pageRelated(-1)}
                  disabled={!canGoPrev}
                  aria-label="Previous components"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-sand-300 bg-sand-100 text-sand-600 transition-all duration-150 hover:border-sand-400 hover:bg-sand-50 hover:text-sand-900 active:scale-95 disabled:pointer-events-none disabled:opacity-30 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-400 dark:hover:border-sand-700 dark:hover:bg-sand-800 dark:hover:text-sand-100"
                >
                  <ArrowLeft weight="regular" size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => pageRelated(1)}
                  disabled={!canGoNext}
                  aria-label="Next components"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-sand-300 bg-sand-100 text-sand-600 transition-all duration-150 hover:border-sand-400 hover:bg-sand-50 hover:text-sand-900 active:scale-95 disabled:pointer-events-none disabled:opacity-30 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-400 dark:hover:border-sand-700 dark:hover:bg-sand-800 dark:hover:text-sand-100"
                >
                  <ArrowRight weight="regular" size={15} />
                </button>
              </div>
            )}
          </div>
          <div className="relative overflow-hidden">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence
                mode="popLayout"
                custom={relatedDir}
                initial={false}
              >
                {visibleRelated.map((c) => (
                  <motion.div
                    key={c.slug}
                    layout
                    custom={relatedDir}
                    variants={{
                      enter: (dir: 1 | -1) => ({
                        x: dir > 0 ? '110%' : '-110%',
                        opacity: 0,
                        zIndex: 10,
                      }),
                      center: { x: 0, opacity: 1, zIndex: 10 },
                      exit: { x: 0, opacity: 0, zIndex: -1 },
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                      layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                    }}
                    className="relative"
                  >
                    <Link
                      href={`/design-systems/andromeda/${c.slug}`}
                      className="group flex flex-col overflow-hidden rounded-xl border border-sand-300 bg-sand-100 transition-colors duration-200 hover:border-sand-400 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700"
                    >
                      <div
                        className="relative aspect-video overflow-hidden"
                        style={{ backgroundColor: tokens.color.surface.base }}
                      >
                        {c.image ? (
                          <img
                            src={optimizeImageKitUrl(c.image, 'card')}
                            alt={c.name}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <>
                            <div
                              className="absolute inset-0"
                              style={{
                                backgroundImage:
                                  'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                backgroundSize: '18px 18px',
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                style={{
                                  fontFamily: tokens.typography.fontMono,
                                  fontSize: tokens.typography.size.xs,
                                  color: tokens.color.text.faint,
                                  textTransform: 'uppercase',
                                  letterSpacing: tokens.typography.tracking.widest,
                                }}
                              >
                                /// {c.slug}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="px-3 py-2.5">
                        <h3 className="truncate text-sm font-semibold text-sand-900 dark:text-sand-50">
                          {c.name}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>

    <AnimatePresence>
      {fullscreen && (
        <motion.div
          key="andromeda-fullscreen-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/75"
          onClick={() => setFullscreen(false)}
        >
          <motion.div
            key="andromeda-fullscreen-panel"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 overflow-auto sm:inset-10 sm:rounded-2xl sm:border sm:border-sand-800 sm:shadow-2xl"
            style={{ backgroundColor: tokens.color.surface.base }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Same inset rule as the inline preview above. */}
            <div className="flex min-h-full items-center justify-center px-3 py-8 sm:px-5 sm:py-12">
              {spec ? <MatrixPreview spec={spec} /> : null}
            </div>

            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-sand-700 bg-sand-900/95 text-sand-400 transition-all duration-150 hover:border-sand-500 hover:bg-sand-800 hover:text-sand-100 active:scale-95"
            >
              <CornersIn weight="regular" size={17} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ── CLI copied toast — matches the standalone component page ────────── */}
    <AnimatePresence>
      {cliCopied && (
        <motion.div
          key="cli-toast"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed bottom-16 z-50 -translate-x-1/2"
          style={{
            left: mainCardRef.current
              ? mainCardRef.current.getBoundingClientRect().left + mainCardRef.current.offsetWidth / 2
              : '50%',
          }}
        >
          <div className="flex items-center gap-3 rounded-xl border border-sand-700 bg-sand-800 px-4 py-3 shadow-lg">
            <Check weight="regular" size={16} className="shrink-0 text-olive-500" />
            <div>
              <p className="text-sm font-semibold text-sand-50">
                Install command copied
              </p>
              <p className="mt-0.5 text-xs text-sand-400">
                Paste into your terminal to add this component.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
