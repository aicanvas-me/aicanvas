'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  Check,
  Code,
  Copy,
  CornersIn,
  CornersOut,
  Eye,
  Moon,
  Sparkle,
  Sun,
  Terminal,
} from '@phosphor-icons/react'
import { Step } from '../../../components/Step'
import { useAndromedaPreviewTheme } from '../AndromedaThemeWrap'
import { andromedaLightVars } from '../../../lib/andromeda-pro-helpers.generated'
import { SiteFooter } from '../../../components/SiteFooter'
import { Button } from '../../../components/Button'
import { SaveButton } from '../../../components/SaveButton'
import { HighlightedCodeView } from '../../../components/HighlightedCodeView'
// The preview renders from the component's MATRIX DECLARATION, the same one
// the system page renders, so the two surfaces cannot show different things.
// This replaced a hand-written per-slug demo whose size ramp had no state axis,
// which is why this page could not show Destructive at lg while the system page
// could.
import { MatrixPreview, MatrixSolo, matrixSectionHeading } from '../../../_lib/andromeda-pro/matrix/Matrix'
import { SPEC_BY_SLUG, matrixId } from '../../../_lib/andromeda-pro/matrix'
import { andromedaRegistrySlug } from '../../../_lib/andromeda-pro/andromeda-meta'
import { tokens } from '../../../lib/andromeda-pro.generated'
import { trackInstall } from '../../../lib/track-install'
import { track } from '../../../lib/analytics'
import { copyText } from '../../../components/useCopied'
import { useSession } from '../../../components/auth/SessionProvider'
import { AndromedaComponentCard } from '../system/AndromedaComponentCard'
import { Paywall, type PaywallReason } from '../../../components/billing/Paywall'
import { usePremiumStatus } from '../../../components/billing/usePremiumStatus'
import { usePaywallModal } from '../../../components/billing/PaywallModalProvider'
import type { AndromedaPropTable } from '../../../lib/andromeda-props.generated'
import { PropsTable } from '../../../components/PropsTable'
import { RemixPanel } from '../../../_components/RemixPanel'

// Matches the Pro components index card's data shape (system/AndromedaGallery
// GalleryItem) so [component]/page.tsx and this view share one contract.
type RelatedItem = { slug: string; name: string; description: string; variants: number; states: number }

interface Props {
  slug: string
  name: string
  description: string
  related: RelatedItem[]
  // Prop tables parsed from the component's @typedef JSDoc at build time.
  // Empty for the few components without a @typedef block — section is hidden.
  propTables?: AndromedaPropTable[]
  // Unused by Andromeda Pro: this tier is paid-to-install for every component
  // (ruling 2026-08-30) — there is no free-account gate here, only the
  // premium gate below. Kept only so this view's prop shape matches the
  // shared page contract; the page still passes it.
  freeAccountGate?: boolean
  /**
   * The component's remix prompt, already cut at the paywall server-side. Null
   * when the vault ships none for this component, or when the prompt had no
   * seam to cut at — either way the Remix affordance is not offered at all.
   */
  remixPrompt?: string | null
  /** True when what arrived is the free head, not the whole prompt. */
  promptLocked?: boolean
}

// Same chip and panel chrome the sibling system's component pages use, so the
// two read as one site.
const coverageChip =
  'rounded-lg bg-sand-200 px-2.5 py-1.5 text-xs font-semibold text-sand-600 transition-colors hover:bg-sand-300 hover:text-sand-900 dark:bg-sand-800 dark:text-sand-400 dark:hover:bg-sand-700 dark:hover:text-sand-50'

const coveragePanel =
  'rounded-2xl border border-sand-300 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900'

// The case the top frame leads with. Ruled 2026-08-28 for EVERY v2 component,
// after the pilot on date-range-picker: the frame shows ONE live instance and
// the full set sits below the coverage chips, instead of the frame carrying the
// whole contact sheet.
//
// 'Live' is the reserved label for a case that is genuinely interactive
// (matrix/types.ts), which is exactly what a hero wants. Only four specs
// declare one; MatrixSolo falls back to the first case for the rest, and that
// case is the component at rest in all 46 of them (Default, Initials, Playing).
// A spec that later opens with something unrepresentative fixes it by ORDERING
// its cases, not by a list of exceptions here.
const SOLO_HERO_CASE = 'Live'

export function AndromedaComponentView({
  slug,
  name,
  description,
  related,
  propTables = [],
  remixPrompt = null,
  promptLocked = false,
}: Props) {
  const { preferences, user } = useSession()
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
  const [remixOpen, setRemixOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  // Bumped by the refresh control to force a remount of the previewed
  // instance (key={previewKey} below), the same replay-the-animation trick
  // as the standalone component page's refreshPreview().
  const [previewKey, setPreviewKey] = useState(0)
  // Portalled overlay: React context crosses the portal, CSS inheritance does
  // not, so the panel re-spreads the theme set itself (see the overlay style).
  const previewTheme = useAndromedaPreviewTheme()
  // The full-screen preview is portalled to <body>, and document.body does not
  // exist during the server render — so the portal waits for mount.
  const [portalReady, setPortalReady] = useState(false)
  useEffect(() => setPortalReady(true), [])
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
      const res = await fetch(`/api/component-code?slug=${registrySlug}&system=andromeda-pro`)
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

  // Escape closes the fullscreen preview. The Remix panel closes itself on
  // Escape (RemixPanel owns that, plus its own scroll lock and focus move).
  useEffect(() => {
    if (!fullscreen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen])

  function refreshPreview() {
    setPreviewKey((k) => k + 1)
  }

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
          style={{ color: `var(--at-text-secondary, ${tokens.color.text.secondary})` }}
        >
          {codeState.code}
        </pre>
      )
    ) : (
      <div
        className="flex min-h-[200px] items-center justify-center text-sm"
        style={{ color: `var(--at-text-faint, ${tokens.color.text.faint})` }}
      >
        Loading source…
      </div>
    )

  // Paid-to-install (ruling 2026-08-30, names 2026-09-10): every Andromeda Pro
  // component is premium content, so the install command is gated on the
  // viewer's subscription, never on a free account. 'unknown' (entitlement
  // still loading) does NOT gate, so a subscriber's click is never swallowed
  // while /api/me/entitlement resolves — mirrors the standalone component
  // page's premium gate exactly (app/components/[slug]/ComponentPageView.tsx).
  const premiumStatus = usePremiumStatus()
  const needsPremium = premiumStatus === 'not-premium'
  const { open: openPaywallModal } = usePaywallModal()

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
  // Deliberately stricter than `needsPremium`, which stays open while
  // entitlement loads so a subscriber's click is never swallowed. That is
  // right for an action and wrong for text on screen — masking the SLUG here
  // whenever status isn't confirmed 'premium' matches the standalone page's
  // `installMasked` split exactly.
  const installMasked = premiumStatus !== 'premium'
  const installReferenceMasked = installMasked
    ? `@aicanvas/${'•'.repeat(12)}`
    : userToken
    ? `"https://aicanvas.me/r/${registrySlug}.json?token=aic_••••••••"`
    : `@aicanvas/${registrySlug}`
  const cliCommand = `npx shadcn@latest add ${installReference}`

  async function copyCli() {
    // Premium gate: non-premium visitors get the upgrade modal, not a copy.
    if (needsPremium) {
      openPaywallModal({ reason: 'premium-only' })
      return
    }
    trackInstall(registrySlug, 'andromeda-pro', pkgManager)
    // The event is sent either way, so the total still counts everyone who
    // asked for the command; `ok` separates the ones who actually got it —
    // matches the standalone component page's copyCli.
    const ok = await copyText(cliCommand)
    track('CLI Copy', { component: registrySlug, ok })
    if (!ok) return
    setCliCopied(true)
    setTimeout(() => setCliCopied(false), 2000)
  }

  return (
    <>
    <main className="mx-auto w-full max-w-4xl px-4 pt-8 pb-8 sm:px-6 sm:pt-14">
      {/* ── Header ───────────────────────────────────────────────────────
          Site-chrome styled (sand), not the Andromeda channel: this heading
          sits on the content column's own page ground, which follows the
          SITE toggle (bg-sand-50 dark:bg-sand-950 — see
          AndromedaContentColumn), not the per-preview Andromeda theme. An
          --at- text colour here was authored for the system's dark void and
          read as invisible ink the moment the page ground went light. */}
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
            <div className="flex items-center gap-0.5 sm:gap-2">
              {/* Theme toggle — one icon-only button whose icon and tooltip
                  swap with the current preview theme, matching the standalone
                  component page's control (app/components/[slug]/ComponentPageView.tsx).
                  Replaces the old sun+moon segmented pair (AndromedaThemeToggle):
                  the maintainer's ruling 2026-09-10 is that Pro's preview card
                  shows the same three top-right controls the standalone does. */}
              <div className="group/toggle relative">
                <Button
                  variant="outline"
                  size="md"
                  iconOnly
                  onClick={() => previewTheme?.setTheme(previewTheme.theme === 'dark' ? 'light' : 'dark')}
                  className="overflow-hidden"
                  // Named for the PREVIEW, not the site: the nav's own toggle already
                  // carries "Switch to light theme", and two controls answering to the
                  // same name is the one thing a screen-reader user cannot tell apart.
                  aria-label={
                    previewTheme?.theme === 'dark'
                      ? 'Switch the preview to light theme'
                      : 'Switch the preview to dark theme'
                  }
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {previewTheme?.theme === 'dark' ? (
                      <motion.span
                        key="moon"
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -12, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Moon weight="regular" size={16} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="sun"
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -12, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Sun weight="regular" size={16} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
                <div className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 hidden whitespace-nowrap rounded-lg border border-sand-300 bg-sand-100 px-2.5 py-1.5 text-xs text-sand-700 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 group-hover/toggle:block">
                  {previewTheme?.theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                </div>
              </div>

              {/* Refresh — remounts the previewed instance via previewKey so
                  an animated component replays, mirroring the standalone's
                  refreshPreview(). */}
              <div className="group/refresh relative">
                <Button variant="outline" size="md" iconOnly onClick={refreshPreview} aria-label="Restart animation">
                  <ArrowClockwise weight="regular" size={16} />
                </Button>
                <div className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 hidden whitespace-nowrap rounded-lg border border-sand-300 bg-sand-100 px-2.5 py-1.5 text-xs text-sand-700 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 group-hover/refresh:block">
                  Refresh
                </div>
              </div>

              <div className="group/fullscreen relative">
                <Button variant="accent" size="md" iconOnly aria-label="Full screen" onClick={() => setFullscreen(true)}>
                  <CornersOut weight="regular" size={16} />
                </Button>
                <div className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 hidden whitespace-nowrap rounded-lg border border-sand-300 bg-sand-100 px-2.5 py-1.5 text-xs text-sand-700 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 group-hover/fullscreen:block">
                  Full screen
                </div>
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
              // The theme channel: light sets --at-surface-base on the wrap.
              style={{ backgroundColor: `var(--at-surface-base, ${tokens.color.surface.base})` }}
            >
              {!fullscreen && spec ? <MatrixSolo key={previewKey} spec={spec} label={SOLO_HERO_CASE} /> : null}
            </div>
          ) : (
            <div
              className="min-h-[420px] overflow-auto p-5"
              style={{
                backgroundColor: `var(--at-surface-base, ${tokens.color.surface.base})`,
                maxHeight: '70vh',
                scrollbarWidth: 'thin',
              }}
            >
              {renderCodePane()}
            </div>
          )}
        </div>

        {/* Action bar. Remix with AI was omitted here for a long time on the
            reasoning that mutating a system component breaks the system
            contract and that people compose AT the system level. The maintainer
            reversed that on 2026-09-10 for Andromeda Pro: the prompt is part of
            what the tier sells, so it is offered per component, behind the same
            paywall as the source. Andromeda Legacy keeps the original
            behaviour and has no Remix button. */}
        <div className="flex items-center justify-end gap-2 border-t border-sand-300 px-3 py-3 dark:border-sand-800 sm:px-5 sm:py-4">
          {/* Save — signed out, opens the same soft-gate modal as Copy CLI.
              Keyed on the REGISTRY slug (not the page slug) so the Button
              override (andromeda-button-system) can't collide with the free
              standalone's own save entry (andromeda-button). */}
          <SaveButton slug={registrySlug} system="andromeda-pro" />

          {/* Remix with AI — only when a prompt actually exists for this
              component. No prompt, no button: an affordance that opens an
              empty panel is worse than none. */}
          {remixPrompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                track('Remix Open', { component: registrySlug })
                setRemixOpen(true)
              }}
            >
              <Sparkle weight="regular" size={15} />
              Remix with AI
            </Button>
          )}

          {/* Copy CLI — the button and command stay visible at all times; when
              the visitor isn't a confirmed subscriber, copyCli() opens the
              premium paywall modal instead of copying. */}
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

      {/* ── Examples (solo-hero pilot) ───────────────────────────────────
          When the frame above leads with one live instance, the full set has
          to land somewhere: here, below the chips that jump into it. The
          anchor ids come from the same matrixId() the chips call, so a chip
          still targets a real card and :target still lights it.

          NO wrapper heading and NO panel around it (ruled 2026-08-28): the
          matrix already prints "Configurations" and "States" over its own
          sections, so an "Examples" heading above them was a third name for
          the same thing, and a bordered box inset the cards from a column
          they should sit directly in. The section is a bare margin now — the
          cards carry their own frames. */}
      {spec ? (
        <section className="mt-12">
          <MatrixPreview spec={spec} />
        </section>
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
                    visible at all times. When the visitor isn't a confirmed
                    subscriber, the copy button opens the premium paywall
                    modal instead of copying. */}
                <Step number={1}>
                  <p className="mb-2.5 text-sm text-sand-600 dark:text-sand-400">
                    Run the following command. New project? Run{' '}
                    <code className="rounded bg-sand-200 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">
                      npx shadcn@latest init
                    </code>{' '}
                    first to set up Tailwind and path aliases.
                  </p>
                  <div className="overflow-hidden rounded-lg bg-sand-200 dark:bg-sand-950">
                    <div className="flex items-center gap-1 border-b border-sand-300 px-4 py-2 dark:border-sand-800">
                      {(['pnpm', 'npm', 'yarn', 'bun'] as const).map((pm) => (
                        <button
                          key={pm}
                          type="button"
                          onClick={() => { setPkgManager(pm); setCliCopied(false) }}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            pkgManager === pm
                              ? 'bg-sand-300 text-sand-900 dark:bg-sand-800 dark:text-sand-100'
                              : 'text-sand-600 hover:text-sand-800 dark:text-sand-500 dark:hover:text-sand-300'
                          }`}
                        >
                          {pm}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          // Premium gate: non-premium visitors get the upgrade
                          // modal, not a copy.
                          if (needsPremium) { openPaywallModal({ reason: 'premium-only' }); return }
                          const cmd = pkgManager === 'pnpm'
                            ? `pnpm dlx shadcn@latest add ${installReference}`
                            : pkgManager === 'bun'
                            ? `bunx shadcn@latest add ${installReference}`
                            : pkgManager === 'yarn'
                            ? `yarn dlx shadcn@latest add ${installReference}`
                            : `npx shadcn@latest add ${installReference}`
                          navigator.clipboard.writeText(cmd)
                          trackInstall(registrySlug, 'andromeda-pro', pkgManager)
                          setCliCopied(true)
                          setTimeout(() => setCliCopied(false), 2000)
                        }}
                        className="ml-auto shrink-0 rounded-md p-1.5 text-sand-600 transition-all hover:text-sand-800 active:scale-90 dark:text-sand-500 dark:hover:text-sand-200"
                      >
                        {cliCopied
                          ? <Check weight="regular" size={14} className="text-olive-500" />
                          : <Copy weight="regular" size={14} />}
                      </button>
                    </div>
                    <div className="px-4 py-3.5">
                      <code className="break-all font-mono text-sm text-sand-800 dark:text-sand-300">
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
                    <span className="ml-auto shrink-0 rounded-full bg-sand-200 px-2 py-0.5 text-xs font-medium text-sand-600 dark:bg-sand-800 dark:text-sand-500">
                      Optional
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-sand-200 px-4 py-3 dark:bg-sand-950">
                    <code className="font-mono text-sm text-sand-800 dark:text-sand-300">{'<html class="dark">'}</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('<html class="dark">')
                        setDarkCopied(true)
                        setTimeout(() => setDarkCopied(false), 2000)
                      }}
                      className="shrink-0 rounded-md p-1.5 text-sand-600 transition-all hover:text-sand-800 active:scale-90 dark:text-sand-500 dark:hover:text-sand-200"
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
                  <div className="relative rounded-lg bg-sand-200 [--paywall-surface:var(--color-sand-200)] dark:bg-sand-950 dark:[--paywall-surface:var(--color-sand-950)]">
                    <div className="flex items-center justify-between border-b border-sand-300 px-4 py-2 dark:border-sand-800">
                      <span className="font-mono text-xs text-sand-600 dark:text-sand-500">
                        {name}.tsx
                      </span>
                      <button
                        type="button"
                        onClick={copyCode}
                        className="shrink-0 rounded-md p-1.5 text-sand-600 transition-all hover:text-sand-800 active:scale-90 dark:text-sand-500 dark:hover:text-sand-200"
                      >
                        {codeCopied
                          ? <Check weight="regular" size={14} className="text-olive-500" />
                          : <Copy weight="regular" size={14} />}
                      </button>
                    </div>
                    <div className="max-h-96 overflow-auto p-4 [scrollbar-color:#C4BFB7_transparent] dark:[scrollbar-color:#4A453F_transparent]" style={{ scrollbarWidth: 'thin' }}>
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

      {/* ── More Andromeda Pro components ─────────────────────────────────
          Cards are the exact ones the components index page renders
          (system/AndromedaComponentCard), not a captured image — see that
          file's header comment for why the two can't drift apart. */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
              More Andromeda Pro components
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
                    <AndromedaComponentCard
                      slug={c.slug}
                      name={c.name}
                      description={c.description}
                      variants={c.variants}
                      states={c.states}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>

    {/* Portalled to <body>. The page content sits inside an `isolate` wrapper
        (AndromedaContentColumn) that keeps component menus from climbing over
        the sticky top bar — but a stacking context contains a `fixed` child
        too, so the whole isolated unit competes with the bar as ONE layer and
        this overlay could never win on its own z-index. Leaving the context
        entirely is the fix; raising numbers inside it can only ever be a
        stalemate. */}
    {portalReady && createPortal(
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
              data-andromeda-theme={previewTheme?.theme ?? 'dark'}
              className="absolute inset-0 overflow-auto sm:inset-10 sm:rounded-2xl sm:border sm:border-sand-800 sm:shadow-2xl"
              // React context crosses the portal, CSS inheritance does not,
              // so the panel re-spreads the theme set itself.
              style={{
                ...(previewTheme?.theme === 'light' ? (andromedaLightVars() as React.CSSProperties) : null),
                backgroundColor: `var(--at-surface-base, ${tokens.color.surface.base})`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Same inset rule as the inline preview above. */}
              <div className="flex min-h-full items-center justify-center px-3 py-8 sm:px-5 sm:py-12">
                {spec ? <MatrixPreview spec={spec} /> : null}
              </div>

              <button
                type="button"
                onClick={() => setFullscreen(false)}
                aria-label="Close fullscreen preview"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-sand-700 bg-sand-900/95 text-sand-400 transition-all duration-150 hover:border-sand-500 hover:bg-sand-800 hover:text-sand-100 active:scale-95"
              >
                <CornersIn weight="regular" size={17} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    )}

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

    {/* Remix panel — the prompt that rebuilds this component in any AI tool.
        What arrived is already cut server-side, so a locked viewer literally
        does not have the withheld bytes on the page. Shared with the
        standalone component page's Remix drawer (app/_components/RemixPanel)
        so the two can't drift apart again.

        Portalled to <body> once mounted, same reason as the fullscreen
        preview above: this page's content sits inside the `isolate` wrapper
        in AndromedaContentColumn, which traps a `fixed` descendant's
        stacking under the sticky top bar no matter how high its own z-index
        climbs — the standalone component page has no such ancestor, which is
        why the identical RemixPanel isn't trapped there. Unlike the
        fullscreen preview, this panel's prompt is SEO content and must stay
        in the server-rendered HTML, and document.body doesn't exist during
        SSR — so it renders INLINE for that first paint (byte-identical to
        the server markup, so hydration never sees a mismatch) and hands off
        to the portal on the very next tick, before hydration finishes wiring
        the "Remix with AI" button that could ever open it. */}
    {(() => {
      const panel = (
        <RemixPanel
          open={remixOpen}
          onClose={() => setRemixOpen(false)}
          name={name}
          slug={registrySlug}
          prompt={remixPrompt}
          promptLocked={promptLocked}
          premium
          cliReference={installReferenceMasked}
          cliCopied={cliCopied}
          onCopyCli={copyCli}
          needsPremium={needsPremium}
        />
      )
      return portalReady ? createPortal(panel, document.body) : panel
    })()}
    </>
  )
}
