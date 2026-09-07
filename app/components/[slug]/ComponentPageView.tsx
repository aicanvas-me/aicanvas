'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Eye,
  EyeSlash,
  Code,
  Check,
  Copy,
  ArrowLeft,
  ArrowRight,
  Tag as TagIcon,
  Sun,
  Moon,
  CornersOut,
  CornersIn,
  ArrowClockwise,
  Terminal,
  Sparkle,
  Lightning,
  X,
  LockSimple,
} from '@phosphor-icons/react'
import type { Tag, Platform } from '../ComponentCard'
import { isStackLabel, STACK_ICONS, stackIconWidthForHeight, type Stack } from '../../lib/stack'
import { HeaderSocials } from '../HeaderSocials'
import { Breadcrumbs } from '../Breadcrumbs'
import { SiteFooter } from '../SiteFooter'
import { PropsTable, type PropTable } from '../PropsTable'
import { Step } from '../Step'
import type { ComponentMeta } from '../../lib/component-registry'
// Runtime + type from the light module so this client component never imports
// the heavy registry (which would pull every preview component, incl. three.js,
// into the bundle).
import { getDesignSystemMeta, type DesignSystemSlug } from '../../lib/design-system-meta'
import { track } from '../../lib/analytics'
import { copyText } from '../useCopied'
import { trackInstall } from '../../lib/track-install'
import { BlockPreviewFrame } from './BlockPreviewFrame'
import { useSession } from '../auth/SessionProvider'
import { useAuthModal } from '../auth/AuthModalProvider'
import { Button } from '../Button'
import { useTheme } from '../ThemeProvider'
import { buttonClasses } from '../buttonClasses'
import { SaveButton } from '../SaveButton'
import { HighlightedCodeView } from '../HighlightedCodeView'
import { premiumEnabled } from '../../../lib/flags'
import { useEntitlement } from '../billing/useEntitlement'
import { usePremiumStatus } from '../billing/usePremiumStatus'
import { PremiumBadge } from '../billing/PremiumBadge'
import { Paywall, type PaywallReason } from '../billing/Paywall'
import { usePaywallModal } from '../billing/PaywallModalProvider'

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

// ─── Platform icons (inlined SVGs — no external dependency) ───────────────────

// ─── ComponentPageView ────────────────────────────────────────────────────────

interface ComponentPageViewProps {
  slug: string
  name: string
  description: string
  headingSubtitle?: string
  tags: Tag[]
  // code + highlightedCode are omitted when `enforcing` (source is fetched
  // on demand from the gated endpoint instead of shipped in the HTML).
  code?: string
  prompts: Partial<Record<Platform, string>>
  // Set ONLY when the prompt is paywalled (premium entry, non-premium viewer).
  // Then `prompts` holds blocks 1 and 2 only; block 3 onward was dropped
  // server-side and is not on the client at all. False = nothing withheld.
  promptLocked?: boolean
  dualTheme: boolean
  designSystem?: DesignSystemSlug
  /** Premium standalone component — shows a "Premium component" label by the title. */
  premium?: boolean
  // Opt-in for section-scale blocks: instead of live-mounting `children` in the
  // preview box, load the block's own /preview route in an iframe pinned to a
  // desktop viewport and scale it down to fit. See BlockPreviewFrame.
  // Fed from the registry's `staticPreview` field, which kept its name from the
  // screenshot era; the mechanism behind it is live now. Rename the field when
  // the vault's meta.json files are next touched anyway, so the two repos don't
  // have to ship in lockstep for it.
  framedPreview?: boolean
  // Label-only: names the type above the install section, "Premium block"
  // rather than "Premium component". The chip row by the title states the tier
  // alone, so the category chip beside it carries the type there instead.
  // See ComponentEntry.isBlock.
  isBlock?: boolean
  // Prop tables parsed from the component's @typedef JSDoc at build time. Empty
  // for self-contained (propless) components, in which case the section hides.
  propTables?: PropTable[]
  related: ComponentMeta[]
  highlightedCode?: ReactNode
  enforcing?: boolean
  // Account-gated install: when on, a signed-out visitor of a FREE component
  // sees a "create a free account to install" CTA instead of the runnable
  // command. Reading the source (Code tab) stays public either way.
  freeAccountGate?: boolean
  // The `// font:` / `// font-pkg:` / `// npm install` directive lines, always
  // provided so the install UI (deps + font setup) survives even when the full
  // `code` is withheld in enforcing mode.
  codeDirectives?: string
  children: ReactNode
  // Per-component copy slots. Render when the slot is filled; components
  // without `about` simply omit that section. Sourced from the registry
  // (which merges them in from app/lib/component-copy.ts).
  about?: string                                    // ~70-110 word paragraph below the install section
  useCases?: string[]                               // up to 3 chips shown next to the category in the header
  // Programmatic FAQ built server-side from registry data (page.tsx also
  // emits it as FAQPage JSON-LD); rendered above the related section.
  faq?: { q: string; a: string }[]
  // Collections this component belongs to — cross-links to
  // /components/collection/<slug> pages.
  collections?: { slug: string; title: string }[]
}

const RELATED_PAGE_SIZE = 3

export default function ComponentPageView({
  slug,
  propTables = [],
  name,
  description,
  headingSubtitle,
  tags,
  code,
  prompts,
  promptLocked,
  dualTheme,
  designSystem,
  premium = false,
  framedPreview = false,
  isBlock = false,
  related,
  highlightedCode,
  enforcing = false,
  freeAccountGate = false,
  codeDirectives,
  children,
  about,
  useCases,
  faq,
  collections,
}: ComponentPageViewProps) {
  const systemMeta = designSystem ? getDesignSystemMeta(designSystem) : undefined
  // Plan 0 stub paywall — DEV-ONLY preview tooling. The stub returns a fixed
  // entitlement (see useEntitlement) so premium UI states can be eyeballed in
  // development; in production this branch is always null. Per-install metering
  // is gone, so the only locked state the Code tab can preview is premium
  // content (design systems). Real gating is the `enforcing` path below; the
  // stub never ships.
  const entitlement = useEntitlement()
  const paywallReason: PaywallReason | null =
    process.env.NODE_ENV === 'production' || !premiumEnabled() || enforcing || entitlement.tier === 'premium'
      ? null
      : designSystem
        ? 'premium-only'
        : null
  const [installTier, setInstallTier] = useState<'component' | 'system'>('component')
  // Reset to component tier on mount per slug — switching pages shouldn't carry tier
  // selection across components.
  useEffect(() => { setInstallTier('component') }, [slug])
  const installSlug = installTier === 'system' && systemMeta ? systemMeta.slug : slug
  const router = useRouter()
  const { preferences, user } = useSession()
  // Personalized install: when signed in, the copied command carries the
  // user's API token so the registry can attribute the pull to the account
  // (Plan 2). Signed out = today's plain @aicanvas/<slug> command, unchanged.
  // The token route is resilient (returns null pre-migration), so this stays
  // a no-op until the backend lands.
  const [userToken, setUserToken] = useState<string | null>(null)
  useEffect(() => {
    if (!user) { setUserToken(null); return }
    let cancelled = false
    const refresh = () =>
      fetch('/api/me/token')
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setUserToken(d?.token ?? null) })
        .catch(() => {})
    refresh()
    // Re-fetch on focus so a token rotated in another tab (settings) doesn't
    // leave this page embedding a dead credential in the copied commands.
    window.addEventListener('focus', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('focus', refresh)
    }
  }, [user])
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  // Enforcing mode (Plan 3): source isn't in the HTML — fetch it on demand from
  // the gated endpoint when the Code tab opens. 200 -> source; 402 -> paywall.
  type CodeState =
    | { status: 'idle' | 'loading' }
    | { status: 'ready'; code: string; highlighted?: string }
    | { status: 'locked'; reason: PaywallReason; limit?: number }
  const [codeState, setCodeState] = useState<CodeState>({ status: 'idle' })
  // Always fetch the PAGE's component source (`slug`), never `installSlug` —
  // the Code tab shows this component regardless of the install-tier toggle,
  // and a system slug would 404 (no entry in the code map) and mis-meter.
  const openCode = useCallback(async () => {
    setCodeState({ status: 'loading' })
    try {
      const res = await fetch(`/api/component-code?slug=${slug}`)
      if (res.status === 402) {
        // The Code tab can now only lock for PREMIUM content — per-install
        // metering is gone, so a 402 here is always "premium-only".
        const { limit } = await res.json().catch(() => ({}))
        setCodeState({ status: 'locked', reason: 'premium-only', limit })
        return
      }
      if (!res.ok) {
        // Unexpected (404/5xx): show the lock rather than a blank pane.
        setCodeState({ status: 'locked', reason: 'premium-only' })
        return
      }
      const { code: fetched, highlighted } = await res.json()
      setCodeState({ status: 'ready', code: fetched ?? '', highlighted })
    } catch {
      setCodeState({ status: 'locked', reason: 'premium-only' })
    }
  }, [slug])
  // Fetch on first Code-tab open.
  useEffect(() => {
    if (enforcing && activeTab === 'code' && codeState.status === 'idle') void openCode()
  }, [enforcing, activeTab, codeState.status, openCode])
  // Reset when switching components — or when the VIEWER changes — so the next
  // open re-fetches. The user id is load-bearing: signing in from the auth
  // modal calls router.refresh(), which merges the new RSC payload but
  // deliberately keeps client state (Next docs: "without losing unaffected
  // client-side React"), so a subscriber who signs in on this page would keep
  // the logged-out 402 lock until they navigated away and back. Sign-out is the
  // same bug in reverse. Safe on mount: `user` starts from the server-provided
  // initialUser, so a normal load never fires a second fetch.
  useEffect(() => { if (enforcing) setCodeState({ status: 'idle' }) }, [enforcing, slug, user?.id])
  // The preview starts on whatever the site is set to, so a visitor browsing in
  // light does not get slapped with a dark box, then pins to their own choice
  // the moment they touch the toggle. Derived rather than synced with an
  // effect: the site theme is already correct during SSR (ThemeProvider is
  // seeded from the cookie), so there is nothing to reconcile and no frame of
  // the wrong theme. It reads the site and never writes it, which is the whole
  // point — the previous version of this toggle wrote <html> and dragged the
  // entire site dark with it.
  //
  // A dark-only component ignores both: it has no light rendering to show.
  const { theme: siteTheme } = useTheme()
  const [themeOverride, setThemeOverride] = useState<'dark' | 'light' | null>(null)
  const cardTheme: 'dark' | 'light' = dualTheme ? (themeOverride ?? siteTheme) : 'dark'
  const [cliCopied, setCliCopied] = useState(false)
  const [mcpTokenCopied, setMcpTokenCopied] = useState(false)
  const [mcpTokenRevealed, setMcpTokenRevealed] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [depsCopied, setDepsCopied] = useState(false)
  const [installTab, setInstallTab] = useState<'cli' | 'manual'>('cli')
  const [pkgManager, setPkgManager] = useState<'pnpm' | 'npm' | 'yarn' | 'bun'>('npm')

  // Adopt the user's preferred package manager once preferences load.
  // We only set the initial default — manual clicks aren't overridden.
  useEffect(() => {
    if (preferences.package_manager) setPkgManager(preferences.package_manager)
  }, [preferences.package_manager])
  const [darkCopied, setDarkCopied] = useState(false)
  const [fontCopied, setFontCopied] = useState(false)
  const [fontFramework, setFontFramework] = useState<'html' | 'nextjs'>('html')
  const [fontPkgInstallCopied, setFontPkgInstallCopied] = useState(false)
  const [fontPkgSnippetCopied, setFontPkgSnippetCopied] = useState(false)

  // Directive lines live in the source; when enforcing withholds `code`, the
  // server still passes them via `codeDirectives` so the install UI is intact.
  const directiveSource = code ?? codeDirectives ?? ''

  // Extract font name from code comment (e.g. "// font: Manrope") — Google Fonts
  const fontMatch = directiveSource.match(/^\/\/ font: (.+)$/m)
  const fontName = fontMatch ? fontMatch[1].trim() : null
  const fontGoogleId = fontName ? fontName.replace(/ /g, '+') : null
  const fontImportId = fontName ? fontName.replace(/ /g, '_') : null
  const FONT_SNIPPETS = fontName ? {
    html: `<link href="https://fonts.googleapis.com/css2?family=${fontGoogleId}:wght@400;500;600;700;800&display=swap" rel="stylesheet">`,
    nextjs: `import { ${fontImportId} } from 'next/font/google'\nconst font = ${fontImportId}({ subsets: ['latin'] })`,
  } : null

  // Extract package font from code comment (e.g. "// font-pkg: geist/font/pixel|GeistPixelCircle|--font-geist-pixel-circle")
  const fontPkgMatch = directiveSource.match(/^\/\/ font-pkg: (.+)$/m)
  const fontPkgInfo = fontPkgMatch ? fontPkgMatch[1].trim().split('|') : null
  const fontPkgPath = fontPkgInfo?.[0] ?? null        // e.g. "geist/font/pixel"
  const fontPkgClass = fontPkgInfo?.[1] ?? null       // e.g. "GeistPixelCircle"
  const fontPkgVar = fontPkgInfo?.[2] ?? null         // e.g. "--font-geist-pixel-circle"
  const fontPkgName = fontPkgPath ? fontPkgPath.split('/')[0] : null  // e.g. "geist"
  const FONT_PKG_INSTALL = fontPkgName ? `npm install ${fontPkgName}` : null
  // If CSS var is provided → needs layout.tsx registration; otherwise self-contained in component
  const FONT_PKG_SNIPPET = fontPkgPath && fontPkgClass && fontPkgVar
    ? `import { ${fontPkgClass} } from '${fontPkgPath}'\n\nconst font = ${fontPkgClass}({ variable: '${fontPkgVar}' })\n\n// Add font.variable to your <html> className`
    : null
  const fontPkgSelfContained = fontPkgName && !fontPkgVar // font used via .className, no layout setup needed
  const [fullscreen, setFullscreen] = useState(false)

  // Extract npm install command from code comment (e.g. "// npm install framer-motion")
  // Extract package names from the "// npm install ..." comment
  const depsMatch = directiveSource.match(/^\/\/ npm install (.+)$/m)
  const depsPackages = depsMatch ? depsMatch[1] : null

  const PKG_COMMANDS: Record<typeof pkgManager, string> = {
    pnpm: `pnpm add ${depsPackages}`,
    npm: `npm install ${depsPackages}`,
    yarn: `yarn add ${depsPackages}`,
    bun: `bun add ${depsPackages}`,
  }
  const depsCommand = depsPackages ? PKG_COMMANDS[pkgManager] : null

  async function copyDeps() {
    if (!depsCommand) return
    if (!(await copyText(depsCommand))) return
    setDepsCopied(true)
    setTimeout(() => setDepsCopied(false), 2000)
  }

  // Refresh button — incrementing this key remounts the preview wrapper,
  // which restarts any animations / effects / canvas inits inside the
  // children component.
  const [previewKey, setPreviewKey] = useState(0)

  // Remix panel — ONE general prompt per component. The Claude Code lane is
  // the comprehensive one and doubles as the platform-agnostic prompt; other
  // lanes are legacy data we no longer surface. The panel content is always
  // mounted (slid off-screen when closed) so the prompt text ships in the
  // server-rendered HTML for SEO.
  const [remixOpen, setRemixOpen] = useState(false)
  const [remixCopied, setRemixCopied] = useState(false)
  const remixPanelRef = useRef<HTMLDivElement>(null)
  const mainCardRef = useRef<HTMLDivElement>(null)
  const remixPrompt =
    prompts['Claude Code'] ?? Object.values(prompts).find((p): p is string => !!p)

  // Related pagination — sliding window of RELATED_PAGE_SIZE cards advancing
  // ONE card at a time. The exiting card stays in place but drops behind the
  // others (zIndex -1) and fades out, so the next card visually slides ON TOP
  // of it as the layout animation runs. `relatedDir` tracks which arrow was
  // last pressed so the entering card slides in from the correct edge.
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

  // Escape key closes fullscreen and the Remix panel
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (fullscreen) setFullscreen(false)
      if (remixOpen) setRemixOpen(false)
    }
    if (fullscreen || remixOpen) {
      document.addEventListener('keydown', onKey)
    }
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen, remixOpen])

  // Remix panel open: lock body scroll and move focus into the dialog.
  useEffect(() => {
    if (!remixOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    remixPanelRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [remixOpen])

  function refreshPreview() {
    setPreviewKey((k) => k + 1)
  }

  // Signed-in users get a tokenized direct-URL install; anonymous users get
  // the plain registry-namespace command. One reference, reused everywhere the
  // install command is built or shown.
  const installReference = userToken
    ? `"https://aicanvas.me/r/${installSlug}.json?token=${userToken}"`
    : `@aicanvas/${installSlug}`
  const cliCommand = `npx shadcn@latest add ${installReference}`
  // The displayed form is built further down, once the install gates it has to
  // answer to are in scope.

  async function copyCode() {
    // When enforcing, source only exists after the gated fetch resolves.
    const source = enforcing
      ? (codeState.status === 'ready' ? codeState.code : null)
      : code
    if (source == null) return
    if (!(await copyText(source))) return
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const { open: openAuthModal } = useAuthModal()

  // Account-gated install: a free component, signed out, with the gate active
  // needs a free account before the one-command install works. We use `user`
  // from useSession (immediate) rather than userToken (async, would flash the
  // CTA on first paint). Premium content keeps its own (unchanged) gating.
  const needsFreeAccount = !!freeAccountGate && !user && !premium

  // Premium component + confirmed non-premium visitor: the install copy
  // actions open the paywall modal instead of copying. UX only — the real
  // gate is server-side at /r. 'unknown' (entitlement still loading) does NOT
  // gate so a premium subscriber is never blocked by a fast click.
  const premiumStatus = usePremiumStatus()
  const needsPremium = premium && premiumStatus === 'not-premium'
  const { open: openPaywallModal } = usePaywallModal()

  // Displayed form of the install reference. Masks the token so it never
  // appears on screen or in screenshots; the copy actions still write the REAL
  // command to the clipboard, so a permitted install works when pasted.
  //
  // It also masks the SLUG for anyone this command would not actually serve.
  // /r never refuses: signed out, or premium content without a subscription,
  // it answers 200 with a placeholder file titled "(free account required)" or
  // "(Premium, locked)". A visitor who reads the command off the screen and
  // types it themselves therefore gets a SUCCESSFUL install of a stub, sitting
  // in their project with no error to explain it. Dots are the honest thing to
  // show: there is a real command here and it is not yours yet. Nothing is
  // secret — the slug is in the address bar — so this is an affordance, not a
  // gate. The gate is server-side at /r, and llms.txt still publishes the real
  // command for agents, along with what the placeholder response means.
  //
  // Deliberately stricter than `needsPremium`, which stays open while
  // entitlement loads so a subscriber's click is never swallowed. That is right
  // for an action and wrong for text on screen: it would print the real command
  // and mask it a moment later, flashing an install that may not work. Dots
  // first, revealed once the viewer is known to be entitled.
  //
  // PREMIUM ONLY. The account gate on free components hits the same placeholder
  // response, but masking there costs more than it saves: the command is the
  // page's most searched string and a crawler is always signed out, so every
  // free component page would lose it from its indexed HTML, and a first-time
  // visitor would meet dots on MIT content. Free says so in words instead, just
  // below, which warns the hand-typer without hiding anything.
  const installMasked = premium && premiumStatus !== 'premium'
  const installReferenceMasked = installMasked
    ? `@aicanvas/${'•'.repeat(12)}`
    : userToken
    ? `"https://aicanvas.me/r/${installSlug}.json?token=aic_••••••••"`
    : `@aicanvas/${installSlug}`

  // Open the Lab-style gate modal (two-button pitch, then sign-in / sign-up),
  // returning the visitor here after they create their free account. The install
  // UI stays fully visible; only the COPY actions route here when signed out.
  function promptFreeAccount() {
    // Anonymous count — the beacon's path property names the component.
    track('Install Gate Shown', {})
    openAuthModal({
      mode: 'gate',
      next: '/components/' + slug,
      title: 'Grab this component.',
      subtitle: 'Sign in or create a free account to install with one command. Free and unlimited.',
    })
  }

  async function copyCli() {
    // Premium gate: non-premium visitors get the upgrade modal, not a copy.
    if (needsPremium) {
      openPaywallModal({ reason: 'premium-only' })
      return
    }
    // Soft gate: signed-out + gated → open the auth modal instead of copying.
    if (needsFreeAccount) {
      promptFreeAccount()
      return
    }
    trackInstall(installSlug, designSystem ?? null, pkgManager)
    // The event is sent either way, so the total still counts everyone who
    // asked for the command; `ok` separates the ones who actually got it.
    const ok = await copyText(cliCommand)
    track('CLI Copy', { component: slug, ok })
    if (!ok) return
    setCliCopied(true)
    setTimeout(() => setCliCopied(false), 4000)
  }

  async function copyRemixPrompt() {
    if (!remixPrompt) return
    // Copies exactly what is on screen. Only ever reached when the prompt is
    // NOT paywalled: a locked prompt opens the paywall instead of copying, so
    // nobody walks away with blocks 1-2 believing they have a working prompt.
    const ok = await copyText(remixPrompt)
    track('Remix Prompt Copy', { component: slug, ok })
    if (!ok) return
    setRemixCopied(true)
    setTimeout(() => setRemixCopied(false), 2500)
  }

  return (
    <>
      {/* Top stripe — sticky (desktop only; mobile uses MobileNav) */}
      <div className="sticky top-0 z-10 hidden h-14 shrink-0 items-center justify-between gap-4 border-b border-sand-200 bg-sand-50 px-6 dark:border-sand-800 dark:bg-sand-950 md:flex">
        <Breadcrumbs crumbs={[{ label: 'Components & Blocks', href: '/components' }, { label: name }]} />
        <HeaderSocials />
      </div>

      <main className="bg-sand-50 dark:bg-sand-950">
        <div className="relative mx-auto max-w-4xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">

          {/* Mobile back button */}
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-sand-700 transition-colors hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-200 md:hidden"
          >
            <ArrowLeft weight="regular" size={15} />
            Back
          </button>

          {/* Header */}
          <div className="mb-8">
            {/* Page heading — bold (700). Subtitle is an answer-block for GEO:
                the first 200 tokens on each page carry a definitional answer. */}
            <h1 className="text-3xl font-bold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
              <span className="block">{name}</span>
              {headingSubtitle && (
                <span className="mt-2 block text-base font-normal leading-relaxed tracking-normal text-sand-600 dark:text-sand-400 sm:text-lg">
                  {headingSubtitle}
                </span>
              )}
            </h1>
            {/* Description — normal (400). Hidden when subtitle already covers it. */}
            {!headingSubtitle && (
              <p className="mt-3 font-normal text-sand-600 dark:text-sand-400">{description}</p>
            )}
            {(() => {
              // Header chip row: category chip + up to 3 use-case chips.
              // Use cases (e.g. "Hero section", "Portfolio") capture the
              // intent queries users actually type. Stack tags live in the
              // "Built with" row further down the page, next to About.
              // Every component keeps its category chip, premium blocks included.
              // They used to lose it, because the pill beside it read "Premium
              // block" and the Blocks chip repeated the noun. Dropping the chip
              // was the wrong half to cut: it left premium blocks as the only
              // things on the site with no category at all, while the noun they
              // were losing it to is repeated again above the install section.
              // The pill states the TIER here and the type noun lives further
              // down, so the two chips now read "Premium" then "Blocks".
              const categoryTags = tags.filter((t) => t.accent)
              const useCaseChips = (useCases ?? []).slice(0, 3)
              return (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <TagIcon weight="regular" size={14} className="shrink-0 text-sand-600 dark:text-sand-500" />
                  {designSystem && <PremiumBadge />}
                  {premium && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-olive-600/40 bg-olive-500/10 px-2.5 py-0.5 text-xs font-semibold text-olive-600 dark:border-olive-500/25 dark:text-olive-400">
                      <Lightning weight="regular" size={12} />
                      Premium
                    </span>
                  )}
                  {categoryTags.map((tag) => (
                    <span
                      key={tag.label}
                      className={
                        premium
                          ? 'rounded-full border border-sand-300 bg-sand-200 px-2.5 py-0.5 text-xs font-semibold text-sand-600 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-400'
                          : 'rounded-full border border-olive-600/40 bg-olive-500/10 px-2.5 py-0.5 text-xs font-semibold text-olive-600 dark:border-olive-500/25 dark:text-olive-400'
                      }
                    >
                      {tag.label}
                    </span>
                  ))}
                  {useCaseChips.map((label) => (
                    <span key={label} className="rounded-full border border-sand-200 bg-sand-50 px-2.5 py-0.5 text-xs font-semibold text-sand-600 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-400">
                      {label}
                    </span>
                  ))}
                </div>
              )
            })()}
            {systemMeta && (
              <Link
                href={`/design-systems/${systemMeta.slug}`}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sand-600 transition-colors hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100"
              >
                Part of {systemMeta.name} design system
                <ArrowRight weight="regular" size={12} />
              </Link>
            )}
          </div>

          {/* Main card */}
          <div ref={mainCardRef} className="overflow-hidden rounded-2xl border border-sand-200 bg-sand-100 shadow-sm dark:border-sand-800 dark:bg-sand-900 dark:shadow-none">

            {/* Tab bar — tabs left, card theme toggle right */}
            <div className="flex items-center justify-between border-b border-sand-200 px-3 py-3 dark:border-sand-800 sm:px-5 sm:py-4">

              {/* Preview / Code tabs */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-sand-50 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                      : 'text-sand-600 hover:text-sand-600 dark:text-sand-500 dark:hover:text-sand-300'
                  }`}
                >
                  <Eye weight="regular" size={15} />
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                    activeTab === 'code'
                      ? 'bg-sand-50 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                      : 'text-sand-600 hover:text-sand-600 dark:text-sand-500 dark:hover:text-sand-300'
                  }`}
                >
                  <Code weight="regular" size={15} />
                  Code
                </button>
              </div>

              {/* Right-side controls */}
              <div className="flex items-center gap-0.5 sm:gap-2">

                {/* Theme toggle — hidden on code tab */}
                <div className="group/toggle relative" style={{ cursor: !dualTheme ? 'not-allowed' : undefined, display: activeTab === 'code' ? 'none' : undefined }}>
                  <Button
                    variant="outline"
                    size="md"
                    iconOnly
                    disabled={!dualTheme}
                    onClick={() => {
                      if (!dualTheme) return
                      setThemeOverride(cardTheme === 'dark' ? 'light' : 'dark')
                    }}
                    className="overflow-hidden"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {cardTheme === 'dark' ? (
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
                  <div className="pointer-events-none absolute top-full right-0 z-10 mt-1.5 hidden whitespace-nowrap rounded-lg border border-sand-300 bg-sand-100 px-2.5 py-1.5 text-xs text-sand-700 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 group-hover/toggle:block">
                    {dualTheme
                      ? cardTheme === 'dark' ? 'Switch to light' : 'Switch to dark'
                      : 'Dark mode only'}
                  </div>
                </div>

                {/* Refresh — preview only */}
                {activeTab === 'preview' && (
                  <div className="group/refresh relative">
                    <Button
                      variant="outline"
                      size="md"
                      iconOnly
                      onClick={refreshPreview}
                      aria-label="Restart animation"
                    >
                      <ArrowClockwise weight="regular" size={16} />
                    </Button>
                    <div className="pointer-events-none absolute top-full right-0 z-10 mt-1.5 hidden whitespace-nowrap rounded-lg border border-sand-300 bg-sand-100 px-2.5 py-1.5 text-xs text-sand-700 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 group-hover/refresh:block">
                      Refresh
                    </div>
                  </div>
                )}

                {/* Fullscreen — preview only */}
                {activeTab === 'preview' && (
                  <div className="group/fullscreen relative">
                    {/* Soft-olive accent (the active-tag look) so the fullscreen
                        action stands out from the outline theme/refresh buttons
                        beside it without shouting like a solid primary. */}
                    <Button
                      variant="accent"
                      size="md"
                      iconOnly
                      aria-label="Full screen"
                      onClick={() => {
                        track('Fullscreen Open', { component: slug })
                        setFullscreen(true)
                      }}
                    >
                      <CornersOut weight="regular" size={16} />
                    </Button>
                    <div className="pointer-events-none absolute top-full right-0 z-10 mt-1.5 hidden whitespace-nowrap rounded-lg border border-sand-300 bg-sand-100 px-2.5 py-1.5 text-xs text-sand-700 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 group-hover/fullscreen:block">
                      Full screen
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Content area — background controlled by cardTheme, isolated from global theme */}
            <div
              data-card-theme={cardTheme}
              // overflow-hidden boxes are still programmatically scrollable, so
              // tabbing into a live block that is deliberately cropped makes the
              // browser scroll the offscreen control into view and leaves the
              // composition permanently shifted. Snap it back.
              onScroll={(e) => {
                e.currentTarget.scrollLeft = 0
                e.currentTarget.scrollTop = 0
              }}
              className={`relative isolate h-[320px] overflow-hidden transition-colors duration-300 sm:h-[480px] ${
                cardTheme === 'dark' ? 'dark bg-sand-950' : 'bg-sand-100'
              }`}
            >
              {/* Both tabs stay mounted so the syntax-highlighted code is in the
                  server-rendered HTML — Google indexes it even while the Preview
                  tab is active. Visibility toggled via opacity + pointer-events. */}
              <motion.div
                initial={false}
                animate={{ opacity: activeTab === 'preview' ? 1 : 0 }}
                transition={{ duration: 0.18 }}
                className="group/preview absolute inset-0 flex items-center justify-center"
                style={{ pointerEvents: activeTab === 'preview' ? 'auto' : 'none' }}
                aria-hidden={activeTab !== 'preview'}
              >
                {/* Keyed wrapper so the refresh button can force a remount.
                    Skipped while fullscreen is open so the preview component
                    only mounts ONCE — otherwise it runs in parallel with the
                    fullscreen instance and tanks framerate (especially for
                    canvas / three.js / heavy framer-motion components). */}
                {!fullscreen && (
                  framedPreview ? (
                    <>
                      <BlockPreviewFrame
                        slug={slug}
                        name={name}
                        theme={cardTheme}
                        reloadKey={previewKey}
                      />
                      {/* The frame shows the whole block, but at a fraction of
                          its real size, so the way through to full size has to
                          stay on the box.

                          A pointer device keeps the block itself live: the
                          layer takes no pointer events, only the pill does, and
                          the pill waits for hover. Touch has neither hover nor
                          a live block underneath, so the pill is always up and
                          the whole box is the target. */}
                      <button
                        type="button"
                        onClick={() => {
                          track('Fullscreen Open', { component: slug })
                          setFullscreen(true)
                        }}
                        className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-150 focus-visible:opacity-100 group-hover/preview:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100"
                      >
                        <span className="pointer-events-auto flex items-center gap-2 rounded-lg border border-sand-100/0 bg-sand-950/90 px-3 py-2 text-xs font-semibold text-sand-100 shadow-lg transition-colors duration-150 hover:bg-sand-900">
                          <CornersOut weight="regular" size={14} />
                          <span className="[@media(hover:none)]:hidden">Click for full view</span>
                          <span className="[@media(hover:hover)]:hidden">Tap for full view</span>
                        </span>
                      </button>
                    </>
                  ) : (
                    <div key={previewKey} className="contents">
                      {children}
                    </div>
                  )
                )}
              </motion.div>
              <motion.div
                initial={false}
                animate={{ opacity: activeTab === 'code' ? 1 : 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-sand-950 p-5"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#4A453F transparent',
                  pointerEvents: activeTab === 'code' ? 'auto' : 'none',
                }}
                aria-hidden={activeTab !== 'code'}
              >
                {enforcing ? (
                  // Real gating (Plan 3): source fetched on demand from the
                  // gated endpoint. 402 -> paywall; otherwise plain source.
                  codeState.status === 'locked' ? (
                    <Paywall reason={codeState.reason} limit={codeState.limit} name={name} />
                  ) : codeState.status === 'ready' ? (
                    codeState.highlighted ? (
                      <HighlightedCodeView html={codeState.highlighted} />
                    ) : (
                      <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-sand-200">
                        {codeState.code}
                      </pre>
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-sand-500">
                      Loading source…
                    </div>
                  )
                ) : (
                  // Not enforcing: source is server-rendered (SEO preserved).
                  // Plan 0's stub paywall previews states in dev when the
                  // premium flag is on; otherwise it is always null.
                  paywallReason ? <Paywall reason={paywallReason} name={name} /> : highlightedCode
                )}
              </motion.div>
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-end gap-2 border-t border-sand-200 px-3 py-3 dark:border-sand-800 sm:px-5 sm:py-4">

              {/* Save — signed out, opens the same soft-gate modal as Copy CLI. */}
              <SaveButton slug={slug} system={designSystem ?? null} />

              {/* Remix with AI — secondary action; opens the side panel with
                  the full platform-agnostic prompt. Hidden entirely when the
                  component has no prompt. Sits left of the primary Copy CLI
                  action. */}
              {remixPrompt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    track('Remix Open', { component: slug })
                    setRemixOpen(true)
                  }}
                >
                  <Sparkle weight="regular" size={15} />
                  Remix with AI
                </Button>
              )}

              {/* Copy CLI — primary install action; copies the npx shadcn
                  command. The button and command stay visible at all times;
                  when the install is account-gated and the visitor is signed
                  out, copyCli() opens the auth modal instead of copying. */}
              <Button variant="primary" size="sm" onClick={copyCli}>
                {cliCopied
                  ? <Check weight="regular" size={15} />
                  : <Terminal weight="regular" size={15} />}
                {cliCopied ? 'Copied!' : 'Copy CLI'}
              </Button>

            </div>
          </div>

          {/* ── Installation ─────────────────────────────────────────────── */}
          {(() => {
            // Dynamic step numbers for Manual tab — deps step is optional
            const manualStep = {
              deps: depsCommand ? 1 : null,
              code: depsCommand ? 2 : 1,
              dark: depsCommand ? 3 : 2,
              font: depsCommand ? 4 : 3,
            }
            return (
            <section className="mt-12">
              <h2 className="flex items-center gap-2.5 text-base font-bold text-sand-900 dark:text-sand-50">
                Add to your project
                {premium && (
                  // Same Aceternity-style pill as the card overview: filled
                  // bolt at rest, slides open to the label on hover — a
                  // reminder that the install below is premium-gated.
                  <span className="group/premium flex items-center rounded-full bg-sand-950/85 p-1.5 text-olive-400 ring-1 ring-olive-500/40 backdrop-blur-sm">
                    <Lightning weight="fill" size={14} className="shrink-0" />
                    <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out group-hover/premium:grid-cols-[1fr]">
                      <span className="overflow-hidden">
                        <span className="block whitespace-nowrap pl-1.5 pr-0.5 text-[11px] font-semibold leading-none">
                          {isBlock ? 'Premium block' : 'Premium component'}
                        </span>
                      </span>
                    </span>
                  </span>
                )}
              </h2>
              <p className="mb-4 mt-1 text-sm text-sand-600 dark:text-sand-400">
                One command adds this component to your project.
              </p>

              {/* CLI / Manual tabs */}
              <div className="overflow-hidden rounded-xl border border-sand-200 dark:border-sand-800">
                <div className="flex border-b border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
                  <button
                    onClick={() => {
                      if (installTab !== 'cli') track('Install Tab Switch', { component: slug, tab: 'cli' })
                      setInstallTab('cli')
                    }}
                    className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                      installTab === 'cli'
                        ? 'text-sand-900 dark:text-sand-50'
                        : 'text-sand-600 hover:text-sand-600 dark:text-sand-500 dark:hover:text-sand-300'
                    }`}
                  >
                    CLI
                    {installTab === 'cli' && (
                      <span className="absolute inset-x-0 -bottom-px h-px bg-sand-900 dark:bg-sand-50" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (installTab !== 'manual') track('Install Tab Switch', { component: slug, tab: 'manual' })
                      setInstallTab('manual')
                    }}
                    className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                      installTab === 'manual'
                        ? 'text-sand-900 dark:text-sand-50'
                        : 'text-sand-600 hover:text-sand-600 dark:text-sand-500 dark:hover:text-sand-300'
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
                      {/* Step 1 — shadcn add. The command + package-manager row
                          stay visible at all times. When the install is
                          account-gated and the visitor is signed out, the copy
                          button opens the auth modal instead of copying. */}
                      <Step number={1}>
                          <p className="mb-2.5 text-sm text-sand-600 dark:text-sand-400">
                            Run the following command. New project? Run <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">npx shadcn@latest init</code> first to set up Tailwind and path aliases.
                          </p>
                          <div className="overflow-hidden rounded-lg bg-sand-200 dark:bg-sand-950">
                            {/* Package manager switcher */}
                            <div className="flex items-center gap-1 border-b border-sand-200 dark:border-sand-800 px-4 py-2">
                              {(['pnpm', 'npm', 'yarn', 'bun'] as const).map((pm) => (
                                <button
                                  key={pm}
                                  onClick={() => { setPkgManager(pm); setDepsCopied(false) }}
                                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                    pkgManager === pm
                                      ? 'bg-sand-200 dark:bg-sand-800 text-sand-900 dark:text-sand-100'
                                      : 'text-sand-600 dark:text-sand-500 hover:text-sand-700 dark:hover:text-sand-300'
                                  }`}
                                >
                                  {pm}
                                </button>
                              ))}
                              <button
                                onClick={() => {
                                  // Premium gate: non-premium visitors get the
                                  // upgrade modal, not a copy.
                                  if (needsPremium) { openPaywallModal({ reason: 'premium-only' }); return }
                                  // Soft gate: signed-out + gated → open the auth
                                  // modal instead of copying.
                                  if (needsFreeAccount) { promptFreeAccount(); return }
                                  const cmd = pkgManager === 'npm'
                                    ? `npx shadcn@latest add ${installReference}`
                                    : pkgManager === 'pnpm'
                                    ? `pnpm dlx shadcn@latest add ${installReference}`
                                    : pkgManager === 'yarn'
                                    ? `yarn dlx shadcn@latest add ${installReference}`
                                    : `bunx shadcn@latest add ${installReference}`
                                  void copyText(cmd)
                                  trackInstall(installSlug, designSystem ?? null, pkgManager)
                                  setDepsCopied(true)
                                  setTimeout(() => setDepsCopied(false), 2000)
                                }}
                                aria-label="Copy install command"
                                className="ml-auto shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                              >
                                {depsCopied
                                  ? <Check weight="regular" size={14} className="text-olive-500" />
                                  : <Copy weight="regular" size={14} />}
                              </button>
                            </div>

                            {/* Tier toggle — only for components belonging to a design system */}
                            {systemMeta && (
                              <div className="flex items-center gap-1 border-b border-sand-200 dark:border-sand-800 px-4 py-2">
                                <button
                                  onClick={() => setInstallTier('component')}
                                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                    installTier === 'component'
                                      ? 'bg-sand-200 dark:bg-sand-800 text-sand-900 dark:text-sand-100'
                                      : 'text-sand-600 dark:text-sand-500 hover:text-sand-700 dark:hover:text-sand-300'
                                  }`}
                                >
                                  Just this component
                                </button>
                                <button
                                  onClick={() => {
                                    setInstallTier('system')
                                    track('System Install Tier Click', { component: slug, system: systemMeta.slug })
                                  }}
                                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                    installTier === 'system'
                                      ? 'bg-sand-200 dark:bg-sand-800 text-sand-900 dark:text-sand-100'
                                      : 'text-sand-600 dark:text-sand-500 hover:text-sand-700 dark:hover:text-sand-300'
                                  }`}
                                >
                                  Whole {systemMeta.name}
                                </button>
                              </div>
                            )}

                            {/* Command */}
                            <div className="px-4 py-3.5">
                              <code className="font-mono text-sm text-sand-700 dark:text-sand-300 break-all">
                                {pkgManager === 'pnpm'
                                  ? `pnpm dlx shadcn@latest add ${installReferenceMasked}`
                                  : pkgManager === 'bun'
                                  ? `bunx shadcn@latest add ${installReferenceMasked}`
                                  : pkgManager === 'yarn'
                                  ? `yarn dlx shadcn@latest add ${installReferenceMasked}`
                                  : `npx shadcn@latest add ${installReferenceMasked}`}
                              </code>
                              {/* The command stays readable for free content,
                                  so the warning has to be in words: run it
                                  signed out and it succeeds, writing a
                                  placeholder rather than the component. */}
                              {needsFreeAccount && (
                                <p className="mt-2 text-xs text-sand-600 dark:text-sand-500">
                                  Free account required. Signed out, this
                                  installs a placeholder file instead of the
                                  component.
                                </p>
                              )}
                            </div>
                          </div>
                      </Step>

                      {/* Step 2 — Dark mode (optional) */}
                      <Step
                        number={2}
                        isLast={!FONT_SNIPPETS && !FONT_PKG_SNIPPET && !fontPkgSelfContained}
                      >
                          <div className="mb-2.5 flex items-center gap-2">
                            <p className="text-sm text-sand-600 dark:text-sand-400">
                              For dark mode, add the <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">dark</code> class to your <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">&lt;html&gt;</code> element:
                            </p>
                            <span className="ml-auto shrink-0 rounded-full bg-sand-50 px-2 py-0.5 text-xs font-medium text-sand-600 dark:bg-sand-800 dark:text-sand-500">Optional</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-sand-200 dark:bg-sand-950 px-4 py-3">
                            <code className="font-mono text-sm text-sand-700 dark:text-sand-300">{'<html class="dark">'}</code>
                            <button
                              onClick={() => {
                                void copyText('<html class="dark">')
                                setDarkCopied(true)
                                setTimeout(() => setDarkCopied(false), 2000)
                              }}
                              aria-label="Copy dark mode snippet"
                              className="shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                            >
                              {darkCopied
                                ? <Check weight="regular" size={14} className="text-olive-500" />
                                : <Copy weight="regular" size={14} />}
                            </button>
                          </div>
                      </Step>

                      {/* Step 3 — Font (optional, only when component specifies a font) */}
                      {FONT_SNIPPETS && (
                        <Step number={3} isLast={!FONT_PKG_SNIPPET && !fontPkgSelfContained}>
                            <div className="mb-2.5 flex items-center gap-2">
                              <p className="text-sm text-sand-600 dark:text-sand-400">
                                This component uses <span className="font-semibold text-sand-700 dark:text-sand-300">{fontName}</span>. Add it to your project:
                              </p>
                              <span className="ml-auto shrink-0 rounded-full bg-sand-50 px-2 py-0.5 text-xs font-medium text-sand-600 dark:bg-sand-800 dark:text-sand-500">Optional</span>
                            </div>
                            <div className="overflow-hidden rounded-lg bg-sand-200 dark:bg-sand-950">
                              <div className="flex items-center gap-1 border-b border-sand-200 dark:border-sand-800 px-4 py-2">
                                {(['html', 'nextjs'] as const).map((fw) => (
                                  <button
                                    key={fw}
                                    onClick={() => { setFontFramework(fw); setFontCopied(false) }}
                                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${fontFramework === fw ? 'bg-sand-200 dark:bg-sand-800 text-sand-900 dark:text-sand-100' : 'text-sand-600 dark:text-sand-500 hover:text-sand-700 dark:hover:text-sand-300'}`}
                                  >
                                    {fw === 'html' ? 'HTML' : 'Next.js'}
                                  </button>
                                ))}
                                <button
                                  onClick={() => {
                                    void copyText(FONT_SNIPPETS[fontFramework])
                                    setFontCopied(true)
                                    setTimeout(() => setFontCopied(false), 2000)
                                  }}
                                  aria-label="Copy font snippet"
                                  className="ml-auto shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                                >
                                  {fontCopied
                                    ? <Check weight="regular" size={14} className="text-olive-500" />
                                    : <Copy weight="regular" size={14} />}
                                </button>
                              </div>
                              <div className="px-4 py-3.5">
                                <code className="whitespace-pre font-mono text-sm text-sand-700 dark:text-sand-300">{FONT_SNIPPETS[fontFramework]}</code>
                              </div>
                            </div>
                        </Step>
                      )}

                      {/* Step 3 — Package font (optional, only when component specifies a font-pkg) */}
                      {(FONT_PKG_SNIPPET || fontPkgSelfContained) && (
                        <Step number={3} isLast>
                            <div className="mb-2.5 flex items-center gap-2">
                              <p className="text-sm text-sand-600 dark:text-sand-400">
                                This component uses <span className="font-semibold text-sand-700 dark:text-sand-300">{fontPkgClass}</span> from <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">{fontPkgName}</code>.{fontPkgSelfContained ? ' Install the package:' : ' Install and register it:'}
                              </p>
                              <span className="ml-auto shrink-0 rounded-full bg-sand-50 px-2 py-0.5 text-xs font-medium text-sand-600 dark:bg-sand-800 dark:text-sand-500">Optional</span>
                            </div>
                            <div className={`flex items-center justify-between rounded-lg bg-sand-200 dark:bg-sand-950 px-4 py-3 ${FONT_PKG_SNIPPET ? 'mb-2' : ''}`}>
                              <code className="font-mono text-sm text-sand-700 dark:text-sand-300">{FONT_PKG_INSTALL}</code>
                              <button
                                onClick={() => { void copyText(FONT_PKG_INSTALL!); setFontPkgInstallCopied(true); setTimeout(() => setFontPkgInstallCopied(false), 2000) }}
                                aria-label="Copy install command"
                                className="shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                              >
                                {fontPkgInstallCopied ? <Check weight="regular" size={14} className="text-olive-500" /> : <Copy weight="regular" size={14} />}
                              </button>
                            </div>
                            {FONT_PKG_SNIPPET && (
                              <div className="overflow-hidden rounded-lg bg-sand-200 dark:bg-sand-950">
                                <div className="flex items-center justify-between border-b border-sand-200 dark:border-sand-800 px-4 py-2">
                                  <span className="font-mono text-xs text-sand-600 dark:text-sand-500">layout.tsx</span>
                                  <button
                                    onClick={() => { void copyText(FONT_PKG_SNIPPET!); setFontPkgSnippetCopied(true); setTimeout(() => setFontPkgSnippetCopied(false), 2000) }}
                                    aria-label="Copy font setup snippet"
                                    className="shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                                  >
                                    {fontPkgSnippetCopied ? <Check weight="regular" size={14} className="text-olive-500" /> : <Copy weight="regular" size={14} />}
                                  </button>
                                </div>
                                <div className="px-4 py-3.5">
                                  <code className="whitespace-pre font-mono text-sm text-sand-700 dark:text-sand-300">{FONT_PKG_SNIPPET}</code>
                                </div>
                              </div>
                            )}
                        </Step>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Step 1 — Install deps (only when component has deps) */}
                      {depsCommand && (
                      <Step number={1}>
                          <p className="mb-2.5 text-sm text-sand-600 dark:text-sand-400">
                            Install the following dependencies:
                          </p>
                          <div className="flex items-center justify-between rounded-lg bg-sand-200 dark:bg-sand-950 px-4 py-3">
                            <code className="font-mono text-sm text-sand-700 dark:text-sand-300">
                              {depsCommand}
                            </code>
                            <button
                              onClick={copyDeps}
                              aria-label="Copy install command"
                              className="shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                            >
                              {depsCopied
                                ? <Check weight="regular" size={14} className="text-olive-500" />
                                : <Copy weight="regular" size={14} />}
                            </button>
                          </div>
                      </Step>
                      )}

                      {/* Step — Copy the code. In enforcing mode this mirrors
                          the Code tab's gated state machine: source only
                          renders once the gated fetch succeeded, the paywall
                          shows when locked, and copy is disabled until ready
                          (same pull — re-access is free, so no double count). */}
                      <Step number={manualStep.code}>
                          <p className="mb-2.5 text-sm text-sand-600 dark:text-sand-400">
                            Copy and paste the following code into your project:
                          </p>
                          <div className="relative rounded-lg bg-sand-200 dark:bg-sand-950">
                            <div className="flex items-center justify-between border-b border-sand-200 dark:border-sand-800 px-4 py-2">
                              <span className="font-mono text-xs text-sand-600 dark:text-sand-500">
                                {slug}.tsx
                              </span>
                              <button
                                onClick={copyCode}
                                aria-label="Copy code"
                                disabled={enforcing && codeState.status !== 'ready'}
                                className="shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {codeCopied
                                  ? <Check weight="regular" size={14} className="text-olive-500" />
                                  : <Copy weight="regular" size={14} />}
                              </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto p-4 [scrollbar-color:#C4BFB7_transparent] dark:[scrollbar-color:#4A453F_transparent]" style={{ scrollbarWidth: 'thin' }}>
                              {enforcing ? (
                                codeState.status === 'locked' ? (
                                  <Paywall reason={codeState.reason} limit={codeState.limit} name={name} />
                                ) : codeState.status === 'ready' ? (
                                  codeState.highlighted ? (
                                    <HighlightedCodeView html={codeState.highlighted} />
                                  ) : (
                                    <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-sand-800 dark:text-sand-200">
                                      {codeState.code}
                                    </pre>
                                  )
                                ) : (
                                  <button
                                    type="button"
                                    onClick={openCode}
                                    className="w-full py-6 text-center text-sm text-sand-600 dark:text-sand-500 transition-colors hover:text-sand-700 dark:hover:text-sand-300"
                                  >
                                    {codeState.status === 'loading' ? 'Loading source…' : 'Load the source'}
                                  </button>
                                )
                              ) : (
                                highlightedCode
                              )}
                            </div>
                          </div>
                      </Step>

                      {/* Step — Dark mode (optional) */}
                      <Step
                        number={manualStep.dark}
                        isLast={!FONT_SNIPPETS && !FONT_PKG_SNIPPET}
                      >
                          <div className="mb-2.5 flex items-center gap-2">
                            <p className="text-sm text-sand-600 dark:text-sand-400">
                              For dark mode, add the <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">dark</code> class to your <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">&lt;html&gt;</code> element:
                            </p>
                            <span className="ml-auto shrink-0 rounded-full bg-sand-50 px-2 py-0.5 text-xs font-medium text-sand-600 dark:bg-sand-800 dark:text-sand-500">Optional</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-sand-200 dark:bg-sand-950 px-4 py-3">
                            <code className="font-mono text-sm text-sand-700 dark:text-sand-300">{'<html class="dark">'}</code>
                            <button
                              onClick={() => {
                                void copyText('<html class="dark">')
                                setDarkCopied(true)
                                setTimeout(() => setDarkCopied(false), 2000)
                              }}
                              aria-label="Copy dark mode snippet"
                              className="shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                            >
                              {darkCopied
                                ? <Check weight="regular" size={14} className="text-olive-500" />
                                : <Copy weight="regular" size={14} />}
                            </button>
                          </div>
                      </Step>

                      {/* Step — Font (optional, only when component specifies a font) */}
                      {FONT_SNIPPETS && (
                        <Step number={manualStep.font} isLast={!FONT_PKG_SNIPPET}>
                            <div className="mb-2.5 flex items-center gap-2">
                              <p className="text-sm text-sand-600 dark:text-sand-400">
                                This component uses <span className="font-semibold text-sand-700 dark:text-sand-300">{fontName}</span>. Add it to your project:
                              </p>
                              <span className="ml-auto shrink-0 rounded-full bg-sand-50 px-2 py-0.5 text-xs font-medium text-sand-600 dark:bg-sand-800 dark:text-sand-500">Optional</span>
                            </div>
                            <div className="overflow-hidden rounded-lg bg-sand-200 dark:bg-sand-950">
                              <div className="flex items-center gap-1 border-b border-sand-200 dark:border-sand-800 px-4 py-2">
                                {(['html', 'nextjs'] as const).map((fw) => (
                                  <button
                                    key={fw}
                                    onClick={() => { setFontFramework(fw); setFontCopied(false) }}
                                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${fontFramework === fw ? 'bg-sand-200 dark:bg-sand-800 text-sand-900 dark:text-sand-100' : 'text-sand-600 dark:text-sand-500 hover:text-sand-700 dark:hover:text-sand-300'}`}
                                  >
                                    {fw === 'html' ? 'HTML' : 'Next.js'}
                                  </button>
                                ))}
                                <button
                                  onClick={() => {
                                    void copyText(FONT_SNIPPETS[fontFramework])
                                    setFontCopied(true)
                                    setTimeout(() => setFontCopied(false), 2000)
                                  }}
                                  aria-label="Copy font snippet"
                                  className="ml-auto shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                                >
                                  {fontCopied
                                    ? <Check weight="regular" size={14} className="text-olive-500" />
                                    : <Copy weight="regular" size={14} />}
                                </button>
                              </div>
                              <div className="px-4 py-3.5">
                                <code className="whitespace-pre font-mono text-sm text-sand-700 dark:text-sand-300">{FONT_SNIPPETS[fontFramework]}</code>
                              </div>
                            </div>
                        </Step>
                      )}

                      {/* Step — Package font (optional, only when component specifies a font-pkg) */}
                      {FONT_PKG_SNIPPET && (
                        <Step number={manualStep.font} isLast>
                            <div className="mb-2.5 flex items-center gap-2">
                              <p className="text-sm text-sand-600 dark:text-sand-400">
                                This component uses <span className="font-semibold text-sand-700 dark:text-sand-300">{fontPkgClass}</span> from <code className="rounded bg-sand-50 px-1 py-0.5 font-mono text-xs text-sand-800 dark:bg-sand-800 dark:text-sand-200">{fontPkgName}</code>. Install and register it:
                              </p>
                              <span className="ml-auto shrink-0 rounded-full bg-sand-50 px-2 py-0.5 text-xs font-medium text-sand-600 dark:bg-sand-800 dark:text-sand-500">Optional</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-sand-200 dark:bg-sand-950 px-4 py-3 mb-2">
                              <code className="font-mono text-sm text-sand-700 dark:text-sand-300">{FONT_PKG_INSTALL}</code>
                              <button
                                onClick={() => { void copyText(FONT_PKG_INSTALL!); setFontPkgInstallCopied(true); setTimeout(() => setFontPkgInstallCopied(false), 2000) }}
                                aria-label="Copy install command"
                                className="shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                              >
                                {fontPkgInstallCopied ? <Check weight="regular" size={14} className="text-olive-500" /> : <Copy weight="regular" size={14} />}
                              </button>
                            </div>
                            <div className="overflow-hidden rounded-lg bg-sand-200 dark:bg-sand-950">
                              <div className="flex items-center justify-between border-b border-sand-200 dark:border-sand-800 px-4 py-2">
                                <span className="font-mono text-xs text-sand-600 dark:text-sand-500">layout.tsx</span>
                                <button
                                  onClick={() => { void copyText(FONT_PKG_SNIPPET!); setFontPkgSnippetCopied(true); setTimeout(() => setFontPkgSnippetCopied(false), 2000) }}
                                  aria-label="Copy font setup snippet"
                                  className="shrink-0 rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                                >
                                  {fontPkgSnippetCopied ? <Check weight="regular" size={14} className="text-olive-500" /> : <Copy weight="regular" size={14} />}
                                </button>
                              </div>
                              <div className="px-4 py-3.5">
                                <code className="whitespace-pre font-mono text-sm text-sand-700 dark:text-sand-300">{FONT_PKG_SNIPPET}</code>
                              </div>
                            </div>
                        </Step>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )})()}

          {/* MCP install section — sits immediately below the shadcn CLI
              install section so the two install paths read as siblings.
              Same heading + description + button rhythm. */}
          <section className="mt-12">
              <h2 className="text-base font-bold text-sand-900 dark:text-sand-50">
                Install with AI Canvas MCP
              </h2>
              <p className="mb-4 mt-1 text-sm text-sand-600 dark:text-sand-400">
                With AI Canvas MCP, your AI knows every component we ship. Ask
                for one inside Claude Code, Codex, or Cursor and it installs the
                component you pick. Works with any AI Canvas account, free or
                premium.
              </p>
              <div className="flex items-center gap-1.5">
                <Link
                  href="/mcp"
                  className={buttonClasses({ variant: 'outline', size: 'sm' })}
                >
                  Get MCP
                  <ArrowRight weight="regular" size={13} />
                </Link>
              </div>

              {/* MCP token — so AI-agent / MCP installs authenticate as your
                  account. Always visible. Signed out: nothing (the token is
                  account-scoped). Signed in: the real value behind an eye
                  reveal + copy; a skeleton mirrors the row while it fetches. */}
              {user && (
                userToken ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-sand-200 dark:bg-sand-950 px-4 py-3">
                      <code className="font-mono text-sm text-sand-700 dark:text-sand-300 break-all">
                        AICANVAS_TOKEN={mcpTokenRevealed ? userToken : 'aic_••••••••'}
                      </code>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          onClick={() => setMcpTokenRevealed((v) => !v)}
                          className="rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                          aria-label={mcpTokenRevealed ? 'Hide MCP token' : 'Reveal MCP token'}
                          aria-pressed={mcpTokenRevealed}
                        >
                          {mcpTokenRevealed
                            ? <EyeSlash weight="regular" size={14} />
                            : <Eye weight="regular" size={14} />}
                        </button>
                        <button
                          onClick={() => {
                            void copyText(`AICANVAS_TOKEN=${userToken}`)
                            setMcpTokenCopied(true)
                            setTimeout(() => setMcpTokenCopied(false), 2000)
                          }}
                          className="rounded-md p-1.5 text-sand-600 dark:text-sand-500 transition-all hover:text-sand-800 dark:hover:text-sand-200 active:scale-90"
                          aria-label="Copy MCP token"
                        >
                          {mcpTokenCopied
                            ? <Check weight="regular" size={14} className="text-olive-500" />
                            : <Copy weight="regular" size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Token still loading — placeholder mirrors the token row so
                     nothing jumps when it lands. */
                  <div className="mt-4" aria-hidden>
                    <div className="flex items-center justify-between rounded-lg bg-sand-200 dark:bg-sand-950 px-4 py-3">
                      <div className="h-4 w-40 animate-pulse rounded bg-sand-200 dark:bg-sand-800" />
                      <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-sand-200 dark:bg-sand-800" />
                    </div>
                  </div>
                )
              )}
            </section>

          {/* Props — generated from the component's @typedef JSDoc; hides itself
              for self-contained (propless) components. */}
          <PropsTable propTables={propTables} />

          {/* About this component — long-form body copy that gives Google a
              substantial chunk of original, on-topic text per component.
              Placed below the install section so the install CTA stays the
              first action visible after the preview. The Built-with stack
              row sits immediately below About so the technical detail lives
              next to the long-form explanation, not in the header. */}
          {about && (
            <>
              <section className="mt-16">
                <h2 className="text-base font-bold text-sand-900 dark:text-sand-50">
                  About {name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-sand-600 dark:text-sand-400 sm:text-base">
                  {about}
                </p>
              </section>
              {/* Built with — brand-icon row, styled at the same heading
                  weight as About so the two sections read as paired. */}
              {(() => {
                const stackTags = tags.filter(
                  (t) => !t.accent && isStackLabel(t.label),
                ) as Array<{ label: Stack }>
                if (stackTags.length === 0) return null
                return (
                  <section className="mt-8">
                    <h2 className="text-base font-bold text-sand-900 dark:text-sand-50">
                      Built with
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-sand-700 dark:text-sand-300">
                      {stackTags.map((tag, i) => {
                        const icon = STACK_ICONS[tag.label]
                        const iconHeight = icon.pixelHeight ?? 14
                        const iconWidth = stackIconWidthForHeight(icon, iconHeight)
                        return (
                          <span key={tag.label} className="flex items-center gap-x-3">
                            {i > 0 && (
                              <span
                                aria-hidden="true"
                                className="h-3 w-px bg-sand-200 dark:bg-sand-700"
                              />
                            )}
                            <span className="flex items-center gap-1.5">
                              <svg
                                viewBox={icon.viewBox}
                                width={iconWidth}
                                height={iconHeight}
                                fill="currentColor"
                                aria-hidden="true"
                                className="shrink-0 text-sand-600 dark:text-sand-400"
                              >
                                <path d={icon.path} />
                              </svg>
                              <span className="font-medium">{tag.label}</span>
                            </span>
                          </span>
                        )
                      })}
                    </div>
                  </section>
                )
              })()}
            </>
          )}

          {/* ── FAQ — programmatic Q&A mirrored as FAQPage JSON-LD by the
              server page. Plain stacked list (no accordion) so every answer
              is visible text in the crawled HTML. ── */}
          {faq && faq.length > 0 && (
            <section className="mt-16">
              <h2 className="text-base font-bold text-sand-900 dark:text-sand-50">
                Frequently asked questions
              </h2>
              <dl className="mt-4 space-y-5">
                {faq.map((item) => (
                  <div key={item.q}>
                    <dt className="text-sm font-semibold text-sand-900 dark:text-sand-50 sm:text-base">
                      {item.q}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-sand-600 dark:text-sand-400 sm:text-base">
                      {item.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* ── Collections — cross-links to the curated collection pages
              this component appears in. ── */}
          {collections && collections.length > 0 && (
            <section className="mt-8">
              <h2 className="text-base font-bold text-sand-900 dark:text-sand-50">
                Featured in collections
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {collections.map((col) => (
                  <Link
                    key={col.slug}
                    href={`/components/collection/${col.slug}`}
                    className="rounded-full border border-sand-200 px-3.5 py-1.5 text-sm font-semibold text-sand-700 transition-colors hover:border-sand-300 hover:text-sand-900 dark:border-sand-800 dark:text-sand-300 dark:hover:border-sand-700 dark:hover:text-sand-50"
                  >
                    {col.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Related components ─────────────────────────────────────────── */}
          {related.length > 0 && (
            <section className="mt-16">
              <div className="mb-5 flex items-end justify-between gap-4">
                <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
                  More like this
                </h2>
                {canPaginate && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      iconOnly
                      onClick={() => pageRelated(-1)}
                      disabled={!canGoPrev}
                      aria-label="Previous related components"
                    >
                      <ArrowLeft weight="regular" size={15} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      iconOnly
                      onClick={() => pageRelated(1)}
                      disabled={!canGoNext}
                      aria-label="Next related components"
                    >
                      <ArrowRight weight="regular" size={15} />
                    </Button>
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
                    {visibleRelated.map((c, i) => (
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
                          layout: {
                            duration: 0.6,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }}
                        className="relative"
                      >
                        <Link
                          href={`/components/${c.slug}`}
                          onClick={() => track('Component Card Click', { component: c.slug, position: relatedStart + i, source: 'related' })}
                          className="group flex flex-col overflow-hidden rounded-xl border border-sand-200 bg-sand-100 transition-colors duration-200 hover:border-sand-300 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700"
                        >
                          <div className="relative aspect-video overflow-hidden bg-sand-950">
                            {c.image ? (
                              <img
                                src={c.image}
                                alt={c.name}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                              />
                            ) : (
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundImage:
                                    'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                  backgroundSize: '18px 18px',
                                }}
                              />
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
        </div>
      </main>

      {/* ── Fullscreen overlay ───────────────────────────────────────────────
          The panel scrolls its own overflow: it is fixed, so a component taller
          than the panel (a scroll-driven block) would otherwise have no
          scrollable ancestor and sit frozen at its first frame. The page behind
          is NOT locked (that lock is the Remix panel's), so the panel keeps its
          scroll to itself with overscroll-contain, and hides the scrollbar it
          now technically has: every min-h-screen component overflows this
          panel by the inset, and a visible gutter would shift each one. */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            key="fullscreen-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/75"
            onClick={() => setFullscreen(false)}
          >
            <motion.div
              key="fullscreen-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              data-card-theme={cardTheme}
              // Collapses each min-h-screen child to the panel's own height —
              // see [data-preview-fullscreen] in globals.css. Without it every
              // component overflows this panel by the sm:inset-10 (80px) and
              // drifts under the wheel while visibly fitting.
              data-preview-fullscreen
              className={`absolute inset-0 isolate overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none] transition-colors duration-300 sm:inset-10 sm:rounded-2xl sm:border sm:shadow-2xl [&::-webkit-scrollbar]:hidden ${
                cardTheme === 'dark'
                  ? 'dark bg-sand-950 sm:border-sand-800'
                  : 'bg-sand-100 sm:border-sand-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>

            {/* Close button, outside the panel on purpose: the panel scrolls its
                own overflow, so a button inside it scrolls away with a tall
                block. Out here on the fixed backdrop it stays put, and the
                offsets line up with the panel's own top right corner. */}
            <button
              onClick={() => setFullscreen(false)}
              aria-label="Close fullscreen preview"
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-sand-700 bg-sand-900/95 text-sand-400 transition-all duration-150 hover:border-sand-500 hover:bg-sand-800 hover:text-sand-100 active:scale-95 sm:top-14 sm:right-14"
            >
              <CornersIn weight="regular" size={17} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CLI copied toast ──────────────────────────────────────────────── */}
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
            <div className="flex items-center gap-3 rounded-xl border border-sand-200 bg-sand-100 px-4 py-3 shadow-lg dark:border-sand-700 dark:bg-sand-800">
              <Check weight="regular" size={16} className="shrink-0 text-olive-500" />
              <div>
                <p className="text-sm font-semibold text-sand-900 dark:text-sand-50">
                  Install command copied
                </p>
                <p className="mt-0.5 text-xs text-sand-600 dark:text-sand-400">
                  Paste into your terminal to install this component.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Remix panel ─────────────────────────────────────────────────────
          The panel is ALWAYS mounted and merely slides off-canvas when
          closed, so the full prompt text ships in the server-rendered HTML
          and gets crawled — the single biggest block of unique text on the
          page. Backdrop is interaction chrome only, so it mounts on open. */}
      <AnimatePresence>
        {remixOpen && (
          <motion.div
            key="remix-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-sand-950/70 backdrop-blur-[2px]"
            onClick={() => setRemixOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      {remixPrompt && (
        <motion.div
          ref={remixPanelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="remix-panel-title"
          tabIndex={-1}
          inert={!remixOpen}
          initial={false}
          animate={{ x: remixOpen ? '0%' : '105%' }}
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
              onClick={() => setRemixOpen(false)}
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
                  npx shadcn@latest add {installReferenceMasked}
                </code>
                {/* copyCli already sends a non-subscriber to the paywall
                    instead of copying, so only the label was lying: it offered
                    a clipboard action beside a command that is already dots.
                    Same treatment as the locked prompt below. */}
                <Button variant="primary" size="sm" onClick={copyCli}>
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
                {remixPrompt}
              </pre>
              {promptLocked && (
                <Paywall reason="premium-only" appearance="themed" teaser={LOCKED_PROMPT_TEASER} name={name} />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}
