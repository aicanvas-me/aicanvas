'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowClockwise,
  CaretUpDown,
  Check,
  Copy,
  DeviceMobile,
  Lightning,
  Monitor,
  Terminal,
} from '@phosphor-icons/react'
import { useSession } from '../components/auth/SessionProvider'
import { usePaywallModal } from '../components/billing/PaywallModalProvider'
import { usePremiumStatus } from '../components/billing/usePremiumStatus'
import { TopAuthPill } from '../components/auth/TopAuthPill'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button, buttonClasses } from '../components/Button'
import { INSTALL_CONTENTS } from '../lib/install-contents.generated'
import { getDesignSystemTemplateMeta } from '../lib/design-system-meta'
import dynamic from 'next/dynamic'
import { useTheme } from '../components/ThemeProvider'
// The dot-grid standalone, reused as the mobile preview backdrop. Loaded
// dynamically (client-only) so it never enters the initial page bundle — it
// ships only when a desktop user opens the Mobile preview. The page an end user
// actually lands on carries none of its weight (JS, canvas, or RAF loop).
const InteractiveDotGrid = dynamic(() => import('../../components-workspace/dot-grid'), { ssr: false })

// ────────────────────────────────────────────────────────────────────────────
// TemplatePreviewShell — the shared top-bar chrome for design-system template
// previews (replaces the old floating TemplateChrome widget on these routes).
//
//   ┌ logo · System / Template ──── ▢ desktop mobile | ↺ ──── Install / Unlock · auth ┐
//
// The device toggle gives a TRUE responsive preview: mobile loads the same
// route inside an <iframe> so the composition's CSS @media queries fire against
// the iframe's own viewport width (Andromeda is desktop-first / max-width).
// Desktop renders the children directly (native, full-bleed — no frame). The
// ↺ button replays the current view's entrance animation (it does not switch
// device).
//
// The iframe payload is this same route with `?frame=1`, which makes the shell
// render ONLY the children (no recursive chrome). Crucially, the `frame` flag is
// read from `searchParams` on the SERVER by each template page and passed in as a
// prop — NOT via client-only useSearchParams under a Suspense boundary. That was
// the old approach, and its fallback rendered the full chrome, so the mobile
// iframe's prerendered HTML briefly showed the top bar before hydration swapped
// it to the bare payload (a visible flash). Resolving `frame` server-side means
// the iframe's very first HTML is already the bare payload — no flash.
// ────────────────────────────────────────────────────────────────────────────

type Device = 'desktop' | 'phone'

// Honest device viewport width. Desktop is frameless (width doesn't matter —
// it fills); mobile ≈ iPhone 14.
const DEVICES: Record<
  Exclude<Device, 'desktop'>,
  { label: string; width: number }
> = {
  phone: { label: 'Mobile', width: 390 },
}

const DEVICE_ORDER: { key: Device; label: string; icon: ComponentType<{ weight?: 'regular'; size?: number }> }[] = [
  { key: 'desktop', label: 'Desktop', icon: Monitor },
  { key: 'phone', label: 'Mobile', icon: DeviceMobile },
]

interface TemplatePreviewShellProps {
  templateSlug: string // registry slug, e.g. 'andromeda-mission-control'
  templateName: string // e.g. 'Mission Control'
  systemName: string // e.g. 'Andromeda'
  systemHref: string // where the system-name crumb links, e.g. the showcase
  frame?: boolean // true when this render is the iframe payload (?frame=1); resolved from searchParams on the server by the page and passed in, so the framed HTML is bare from the very first paint (no chrome flash)
  description?: string[] // overrides the install-popover bullet copy
  children: ReactNode // the template composition
}

export function TemplatePreviewShell({
  frame = false,
  children,
  ...chrome
}: TemplatePreviewShellProps) {
  // Inside the iframe (frame): render the composition bare, no chrome, no
  // recursion — wrapped in FramePayload, which makes the framed view behave like
  // a real touch device (hidden overlay-style scrollbars, no reserved gutter, and
  // click-drag panning instead of text selection). See FramePayload below.
  if (frame) {
    return <FramePayload>{children}</FramePayload>
  }

  return <PreviewChrome {...chrome}>{children}</PreviewChrome>
}

// ── Frame payload (renders INSIDE the preview iframe) ────────────────────────
// Makes the framed composition behave like a real touch device viewed on a
// desktop:
//   • Hidden, overlay-style scrollbars with no reserved gutter. The site's own
//     custom scrollbar is gone now (globals.css → "Page scrollbar: NATIVE"),
//     but scrollers inside a composition can still reserve a gutter of their
//     own (AndromedaContentColumn, and any component that sets one), and on a
//     desktop OS that draws classic bars the frame would show one. Inside a
//     mobile frame both read as dead space, so we cancel them for every
//     element regardless of what the page outside is doing.
//   • Text isn't selectable, so a click-drag PANS instead of highlighting the
//     telemetry numbers.
//   • Click-drag scrolls the nearest scrollable ancestor (x and/or y) the way a
//     finger-swipe would — the horizontal telemetry strip and the vertical
//     dashboard both respond. Wheel/trackpad are unchanged; real touch input is
//     left to the browser's native momentum scrolling (mouse-only hijack).
// This only ever renders inside the preview iframe, so it can't touch the rest
// of the app or the desktop full-bleed view.
function FramePayload({ children }: { children: ReactNode }) {
  useEffect(() => {
    const doc = document
    let dragging = false
    let startX = 0
    let startY = 0
    let baseLeft = 0
    let baseTop = 0
    let sx: Element | null = null
    let sy: Element | null = null

    const scrollableX = (el: Element) => {
      const o = getComputedStyle(el).overflowX
      return (o === 'auto' || o === 'scroll') && el.scrollWidth > el.clientWidth + 1
    }
    const scrollableY = (el: Element) => {
      const o = getComputedStyle(el).overflowY
      return (o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight + 1
    }
    const findScrollers = (target: Element | null) => {
      let x: Element | null = null
      let y: Element | null = null
      let el: Element | null = target
      while (el && el !== doc.body) {
        if (!x && scrollableX(el)) x = el
        if (!y && scrollableY(el)) y = el
        if (x && y) break
        el = el.parentElement
      }
      // Below md the whole dashboard scrolls the document, not an inner box.
      if (!y) y = doc.scrollingElement ?? doc.documentElement
      return { x, y }
    }

    let moved = 0

    // Swallow the click that the browser synthesizes right after a real pan —
    // without this, panning a clickable row (e.g. the requests table's
    // <tr onClick>) would ALSO toggle it on release. Capture-phase, one-shot,
    // with a timeout fallback in case no click follows (released off-target).
    const squelchClick = (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
    }
    const armSquelch = () => {
      doc.addEventListener('click', squelchClick, { capture: true, once: true })
      setTimeout(() => doc.removeEventListener('click', squelchClick, { capture: true } as EventListenerOptions), 150)
    }

    const onDown = (e: PointerEvent) => {
      // Mouse only — touch devices keep native momentum scrolling. Ignore drags
      // that begin on a real control so clicks/taps still land. role="slider"
      // covers Andromeda's Slider (scrub/volume): it runs its own pointer-drag,
      // and panning underneath it would fight the scrub.
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      const t = e.target as Element | null
      if (t?.closest('a, button, input, textarea, select, [role="button"], [role="slider"], [contenteditable="true"]')) return
      const found = findScrollers(t)
      sx = found.x
      sy = found.y
      if (!sx && !sy) return
      dragging = true
      moved = 0
      startX = e.clientX
      startY = e.clientY
      baseLeft = sx ? sx.scrollLeft : 0
      baseTop = sy ? sy.scrollTop : 0
      doc.documentElement.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      // Button released outside the iframe: without pointer capture we never
      // get that pointerup, so the first re-entry move with no button held is
      // the end-of-drag signal (prevents a "stuck" pan).
      if ((e.buttons & 1) === 0) {
        onUp()
        return
      }
      moved = Math.max(moved, Math.abs(e.clientX - startX), Math.abs(e.clientY - startY))
      if (sx) sx.scrollLeft = baseLeft - (e.clientX - startX)
      if (sy) sy.scrollTop = baseTop - (e.clientY - startY)
      e.preventDefault()
    }
    const onUp = () => {
      if (dragging && moved > 6) armSquelch()
      dragging = false
      sx = null
      sy = null
      doc.documentElement.style.cursor = ''
    }

    doc.addEventListener('pointerdown', onDown)
    doc.addEventListener('pointermove', onMove)
    doc.addEventListener('pointerup', onUp)
    doc.addEventListener('pointercancel', onUp)
    // Fires when the mouse leaves the iframe's document mid-drag — end the pan
    // there instead of leaving it half-engaged.
    doc.addEventListener('pointerleave', onUp)
    window.addEventListener('blur', onUp)
    return () => {
      doc.removeEventListener('pointerdown', onDown)
      doc.removeEventListener('pointermove', onMove)
      doc.removeEventListener('pointerup', onUp)
      doc.removeEventListener('pointercancel', onUp)
      doc.removeEventListener('pointerleave', onUp)
      window.removeEventListener('blur', onUp)
      doc.removeEventListener('click', squelchClick, { capture: true } as EventListenerOptions)
    }
  }, [])

  return (
    <div className="aic-tpl-host mc-frame-viewport relative h-full w-full">
      <style>{`
        /* Kill the light flash: the framed document is ALWAYS the dark
           Andromeda surface, whatever theme the visitor has chosen. The app
           paints body via background:var(--background) with a 0.2s transition,
           and this document's own <html> carries no theme class at all (the
           root layout's iframe branch ships none), so without this the phone
           screen fades through the light page colour before the dashboard
           covers it. Force html/body to the surface with NO transition, and set
           color-scheme:dark so the browser's default canvas is dark while the
           document is still loading. Scoped to the iframe — the site's own
           theme transition is untouched. */
        html:not([data-frame-light]) { color-scheme: dark; }
        html:not([data-frame-light]), html:not([data-frame-light]) body {
          background: #0E0E0F !important;
          transition: none !important;
        }
        html[data-frame-light], html[data-frame-light] body {
          background: #F4F4F5 !important;
          transition: none !important;
        }
        /* html/body alone is NOT enough on the fallback path. A browser that
           does not send Sec-Fetch-Dest gets the full site shell instead of the
           iframe branch, and that shell paints theme backgrounds on inner
           wrapper divs (body's flex column, the content column's
           bg-sand-200 dark:bg-sand-950). For a light-theme visitor those
           wrappers are light sand while the composition's entrance animation is
           still fading in, which reads as a flash filling the phone screen.
           Force every ancestor of the frame viewport to the dark surface too;
           :has() matches ancestors only, so the composition's own surfaces are
           untouched. */
        html:not([data-frame-light]) body *:has(.mc-frame-viewport) {
          background: #0E0E0F !important;
          transition: none !important;
        }
        html[data-frame-light] body *:has(.mc-frame-viewport) {
          background: #F4F4F5 !important;
          transition: none !important;
        }
        /* Overlay-style scrollbars: hide the bar AND drop the reserved 18px
           gutter for every element, so the frame matches a real phone. */
        * {
          scrollbar-width: none !important;
          scrollbar-gutter: auto !important;
          -ms-overflow-style: none !important;
        }
        *::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
        /* Device preview = touch surface: text isn't selectable, so a
           click-drag pans (see the effect above) instead of highlighting the
           telemetry numbers. Real form fields stay selectable; real controls
           keep a pointer cursor; everything else shows the grab affordance. */
        .mc-frame-viewport, .mc-frame-viewport * { -webkit-user-select: none !important; user-select: none !important; }
        .mc-frame-viewport input,
        .mc-frame-viewport textarea,
        .mc-frame-viewport [contenteditable="true"] { -webkit-user-select: text !important; user-select: text !important; }
        .mc-frame-viewport { cursor: grab; }
        .mc-frame-viewport a,
        .mc-frame-viewport button,
        .mc-frame-viewport [role="button"] { cursor: pointer; }
      `}</style>
      {children}
    </div>
  )
}

function PreviewChrome({
  templateSlug,
  templateName,
  systemName,
  systemHref,
  description,
  children,
}: Omit<TemplatePreviewShellProps, 'children'> & { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const [device, setDevice] = useState<Device>('desktop')
  // Replay nonces — bumping one remounts the matching view so the composition's
  // entrance animation runs from the top again. Desktop and mobile keep
  // separate nonces so Refresh reloads ONLY the view you're looking at (never
  // the hidden one) and never changes the device.
  const [desktopNonce, setDesktopNonce] = useState(0)
  const [frameNonce, setFrameNonce] = useState(0)
  // Honour the OS "reduce motion" setting — the device-toggle crossfade/scale
  // below collapses to an instant swap when it's on.
  const reduce = useReducedMotion()
  // The phone stage follows the site theme: light ground behind a light frame.
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const reload = () =>
    device === 'desktop'
      ? setDesktopNonce((n) => n + 1)
      : setFrameNonce((n) => n + 1)

  return (
    // CONTRACT: template compositions must FILL the preview region and scroll
    // internally (height:100% + an inner overflow-y:auto). The root here is
    // h-full, so a composition that instead GROWS past the region would (a)
    // get clipped by the Andromeda column's md:overflow-y-hidden and (b)
    // escape the sticky header's range. All four Andromeda templates follow
    // the pinned pattern; keep new ones on it too.
    <div className="flex h-full min-h-full w-full flex-col">
      <TopBar
        templateSlug={templateSlug}
        templateName={templateName}
        systemName={systemName}
        systemHref={systemHref}
        description={description}
        device={device}
        onDevice={setDevice}
        onReload={reload}
      />

      {/* Preview region */}
      <div className="relative min-h-0 flex-1">
        {/* Desktop: native, full-bleed. Kept mounted AND visible so the mobile
            overlay crossfades over/off it on the device toggle (below); once the
            mobile frame is fully in, its opaque backdrop covers this. `isolate`
            flattens the composition into ONE stacking context, so template
            elements that carry their own z-index (SegmentedControl tabs and
            chart labels use zIndex:1, panel menus 1000) can never paint over
            the mobile overlay — without it they float on top of the phone
            frame. Keyed by desktopNonce so Refresh remounts the composition and
            replays its entrance animation; aria-hidden + inert while the mobile
            frame is on top (inert also blocks tabbing into the covered view). */}
        <div
          key={desktopNonce}
          aria-hidden={device !== 'desktop'}
          inert={device !== 'desktop'}
          className="aic-tpl-host isolate h-full w-full"
        >
          {children}
        </div>

        {/* Mobile: real viewport via iframe on a device backdrop. AnimatePresence
            gives the device toggle a small motion — the backdrop crossfades and
            the phone frame scales in (and back out) instead of snapping. Keyed by
            frameNonce so Refresh reloads the iframe (fresh animation) without
            leaving the mobile view. z-10 pairs with the desktop layer's
            `isolate` above: the overlay always paints on top of the
            composition, whatever z-indexes it uses internally. */}
        <AnimatePresence>
          {device !== 'desktop' && (
            <motion.div
              key="mobile-frame"
              className="absolute inset-0 z-10 flex items-stretch justify-center overflow-hidden bg-sand-50 p-4 md:p-6 dark:bg-sand-950"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2, ease: 'easeOut' }}
            >
              {/* Dotted-grid backdrop (the dot-grid standalone) behind the device
                  frame. pointer-events off so it never steals a click/drag from
                  the frame; it tracks the cursor at the window level regardless,
                  so dots in the margin still light up as you move the mouse. */}
              <div className="pointer-events-none absolute inset-0">
                {/* Themed to match the page: a seamless page-ground backdrop,
                    faint sand-neutral dots that light up to the olive accent
                    near the cursor. Raw rgb values (a canvas can't read
                    Tailwind tokens); the token each value maps to is noted
                    inline below. The grid reads these live, so a toggle
                    repaints it. */}
                <InteractiveDotGrid
                  showLabel={false}
                  colors={{
                    background: isDark ? '#0E0E0F' : '#F4F4FA', // sand-950 / sand-50 — matches the backdrop
                    dot: '123,123,125', //     sand-500 — faint neutral grid
                    highlight: isDark ? '218,228,160' : '134,150,49', // olive-400 / olive-600 — accent, lit near the cursor
                    baseAlpha: 0.22,
                    peakAlpha: 0.95,
                  }}
                />
              </div>
              <motion.iframe
                key={frameNonce}
                title={`${templateName} responsive preview`}
                src={`${pathname}?frame=1`}
                // Only the phone frame exists, so its width is constant. Read
                // DEVICES.phone directly (not DEVICES[device]) — the exit render
                // still runs while `device` is already 'desktop', which would
                // otherwise index DEVICES with a non-frame key. colorScheme
                // keeps the browser's own pre-load iframe canvas dark, so the
                // network round-trip can't blink white before the document
                // paints. It follows the site theme, as the frame's own
                // document does (AndromedaThemeSync mirrors the parent).
                style={{ width: DEVICES.phone.width, colorScheme: theme }}
                className="relative h-full max-w-full shrink-0 rounded-2xl border border-sand-300 bg-sand-50 shadow-2xl dark:border-sand-800 dark:bg-sand-950"
                initial={{ scale: reduce ? 1 : 0.985 }}
                animate={{ scale: 1 }}
                transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Top bar ─────────────────────────────────────────────────────────────────

function TopBar({
  templateSlug,
  templateName,
  systemName,
  systemHref,
  description,
  device,
  onDevice,
  onReload,
}: Omit<TemplatePreviewShellProps, 'children'> & {
  device: Device
  onDevice: (d: Device) => void
  onReload: () => void
}) {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-sand-200 bg-sand-50/90 backdrop-blur dark:border-sand-800 dark:bg-sand-950/90">
      {/* Logo block — mirrors the site Sidebar rail exactly (w-60, px-4, gap-2,
          wordmark always shown) and carries the SAME full-height border-r the
          sidebar draws. Keeps the logo in the identical spot and makes the
          divider read as one continuous line with the rest of the site. */}
      <div className="flex h-full w-auto shrink-0 items-center border-r border-sand-200 px-4 md:w-60 dark:border-sand-800">
        <Link
          href="/"
          aria-label="AI Canvas home"
          className="flex items-center gap-2 font-bold text-sand-900 dark:text-sand-50"
        >
          <img src="/ai-canvas-icon.svg" alt="" width={20} height={17} className="shrink-0" />
          {/* Icon-only below md so the narrow bar leaves room for the breadcrumb
              (otherwise the template name truncates to "An…"); wordmark returns
              at md, matching the site sidebar rail. */}
          <span className="hidden md:inline">AI Canvas</span>
        </Link>
      </div>

      {/* Content region — breadcrumb · device toggles (centered) · CTA cluster.
          On mobile it's [breadcrumb 1fr | CTA auto] so the breadcrumb takes all
          the leftover width; from md it becomes [1fr_auto_1fr] + px-6, mirroring
          the site's content top bar (HomeClient) with the toggles centered. */}
      <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto] items-center gap-4 px-4 md:grid-cols-[1fr_auto_1fr] md:px-6">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center text-sm font-semibold">
          <Link
            href={systemHref}
            className="shrink-0 text-sand-600 transition-colors hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100"
          >
            {systemName}
          </Link>
          <span className="mx-1 shrink-0 text-sand-600 dark:text-sand-600">/</span>
          <TemplateSwitcher templateSlug={templateSlug} templateName={templateName} />
        </nav>

        {/* Device toggles (Desktop / Mobile) + Replay — sized to match the
            right-side buttons (~32px). Shown from md up; the cluster hides on a
            real phone, where you already see the responsive layout. */}
        <div className="hidden items-center gap-0.5 justify-self-center rounded-lg border border-sand-200 bg-sand-100 p-0.5 md:flex dark:border-sand-800 dark:bg-sand-900">
          {DEVICE_ORDER.map(({ key, label, icon: Icon }) => {
            const active = device === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onDevice(key)}
                aria-label={`${label} preview`}
                aria-pressed={active}
                className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                  active
                    ? 'bg-sand-100 text-sand-900 shadow-sm dark:bg-sand-800 dark:text-sand-50'
                    : 'text-sand-600 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-100'
                }`}
              >
                <Icon weight="regular" size={16} />
              </button>
            )
          })}
          <span className="mx-0.5 h-4 w-px bg-sand-200 dark:bg-sand-700" aria-hidden />
          <button
            type="button"
            onClick={onReload}
            aria-label="Replay animation"
            title="Replay animation"
            className="flex h-7 w-7 items-center justify-center rounded-md text-sand-600 transition-colors hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-100"
          >
            <ArrowClockwise weight="regular" size={15} />
          </button>
        </div>

        {/* Right — theme toggle + entitlement CTA + auth */}
        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          <RightCluster
            templateSlug={templateSlug}
            systemName={systemName}
            description={description}
          />
        </div>
      </div>
    </header>
  )
}

// ── Template switcher: the olive template crumb becomes a dropdown that jumps
// to any sibling template of the same design system (the current one checked).
// The full list comes from DESIGN_SYSTEM_META — client-safe, no registry pull.
// Falls back to the plain olive label when the system has no other template.
// ─────────────────────────────────────────────────────────────────────────────

function TemplateSwitcher({
  templateSlug,
  templateName,
}: {
  templateSlug: string
  templateName: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const meta = getDesignSystemTemplateMeta(templateSlug)
  const siblings = meta?.system.templates ?? []
  const systemSlug = meta?.system.slug

  // Same dismiss wiring as the Install popover: click-away + Escape.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Nothing to switch to → keep the original static olive crumb.
  if (!systemSlug || siblings.length < 2) {
    return <span className="text-olive-600 dark:text-olive-500">{templateName}</span>
  }

  return (
    <div className="relative flex min-w-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Switch template"
        className="flex min-w-0 items-center gap-1 rounded-md text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-500 dark:hover:text-olive-300"
      >
        <span className="truncate">{templateName}</span>
        <CaretUpDown weight="regular" size={14} className="shrink-0 opacity-70" />
      </button>

      {/* Menu: left-anchored to the trigger, which sits ~150px in on mobile
          (logo + "Andromeda /"). The width cap subtracts that inset so a
          phone-width menu never runs off the right edge; desktop viewports keep
          the full 260px (100vw-170px is >260 there, so min() picks 260). */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[min(260px,calc(100vw-170px))] overflow-hidden rounded-xl border border-sand-200 bg-sand-100 shadow-2xl dark:border-sand-800 dark:bg-sand-900">
          {siblings.map((t) => {
            const active = t.slug === templateSlug
            const folder = t.slug.startsWith(`${systemSlug}-`)
              ? t.slug.slice(systemSlug.length + 1)
              : t.slug
            return (
              <Link
                key={t.slug}
                href={`/design-systems/${systemSlug}/templates/${folder}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'font-semibold text-olive-600 dark:text-olive-400'
                    : 'text-sand-700 hover:bg-sand-50/70 dark:text-sand-300 dark:hover:bg-sand-800/70'
                }`}
              >
                <span className="truncate">{t.name}</span>
                {active && (
                  <Check weight="bold" size={14} className="shrink-0 text-olive-600 dark:text-olive-400" />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Right cluster: Install (premium) / Unlock (free-anon) + auth ─────────────

function RightCluster({
  templateSlug,
  systemName,
  description,
}: {
  templateSlug: string
  systemName: string
  description?: string[]
}) {
  const status = usePremiumStatus()
  // premium / in-flight 'unknown' → Install; resolved free/anon → the small
  // "Unlock with Premium" CTA. Keeping Install up during 'unknown' avoids
  // flashing an upgrade at a paying customer mid-load; anon derives to
  // 'not-premium' synchronously.
  const canInstall = status !== 'not-premium'

  return (
    <>
      {canInstall ? (
        <InstallButton templateSlug={templateSlug} systemName={systemName} description={description} />
      ) : (
        <Link href="/pricing" className={buttonClasses({ variant: 'primary', size: 'xs' })}>
          <Lightning weight="regular" size={13} />
          <span className="hidden sm:inline">Unlock with Premium</span>
          <span className="sm:hidden">Unlock</span>
        </Link>
      )}

      {/* The site-wide auth control (HeaderSocials → TopAuthPill): the
          avatar-with-chevron dropdown, or "Sign in" when signed out — identical
          to every other page header. */}
      <TopAuthPill />
    </>
  )
}

// ── Install button + CLI popover (ported from TemplateChrome, opens downward) ─

function InstallButton({
  templateSlug,
  systemName,
  description,
}: {
  templateSlug: string
  systemName: string
  description?: string[]
}) {
  const { user } = useSession()
  const { open: openPaywall } = usePaywallModal()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Tokenized install for signed-in users so the registry attributes the pull
  // to the account (templates are premium — a plain command would 402). The
  // token is masked on screen; copy writes the real one.
  const [fetchedToken, setFetchedToken] = useState<string | null>(null)
  useEffect(() => {
    if (!user) return
    let cancelled = false
    const refresh = () =>
      fetch('/api/me/token')
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setFetchedToken(d?.token ?? null)
        })
        .catch(() => {})
    refresh()
    window.addEventListener('focus', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('focus', refresh)
    }
  }, [user])

  const userToken = user ? fetchedToken : null
  const installReference = userToken
    ? `"https://aicanvas.me/r/${templateSlug}.json?token=${userToken}"`
    : `@aicanvas/${templateSlug}`
  const installReferenceMasked = userToken
    ? `"https://aicanvas.me/r/${templateSlug}.json?token=aic_••••••••"`
    : `@aicanvas/${templateSlug}`
  const cliCommand = `npx shadcn@latest add ${installReference}`
  const cliCommandMasked = `npx shadcn@latest add ${installReferenceMasked}`

  // Explicit override → generated install-contents (what the command actually
  // delivers, derived from the emitted registry) → generic fallback.
  const bullets = description ??
    INSTALL_CONTENTS[templateSlug] ?? [
      `Installs this template plus the full ${systemName} system.`,
      `Subsequent templates reuse what's already there.`,
    ]

  // Non-premium hitting Install sees the paywall instead of the popover. Fails
  // open (opens the popover) so a hiccup never dead-ends the button.
  async function handleInstall() {
    try {
      const res = await fetch(`/api/me/install-check?slug=${templateSlug}`)
      const d = await res.json().catch(() => null)
      if (d?.blocked) {
        openPaywall({ reason: 'premium-only', limit: d.limit, resetAt: d.resetAt })
        return
      }
    } catch {}
    setOpen((o) => !o)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cliCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <Button variant="primary" size="xs" onClick={handleInstall}>
        <Terminal weight="regular" size={13} />
        Install
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(480px,calc(100vw-24px))] overflow-hidden rounded-xl border border-sand-200 bg-sand-100 shadow-2xl dark:border-sand-800 dark:bg-sand-900">
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                  CLI install
                </span>
                <span className="rounded-md border border-olive-500/30 bg-olive-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-olive-600 dark:text-olive-400">
                  One command
                </span>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={handleCopy}
                aria-label="Copy CLI command"
              >
                {copied ? (
                  <>
                    <Check weight="regular" size={13} className="text-olive-600 dark:text-olive-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy weight="regular" size={13} />
                    Copy CLI
                  </>
                )}
              </Button>
            </div>
            <div className="rounded-lg bg-sand-200 dark:bg-sand-950 px-4 py-3">
              <code className="block break-all font-mono text-xs text-sand-700 dark:text-sand-300">{cliCommandMasked}</code>
            </div>
            <div className="space-y-1.5">
              {bullets.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check weight="bold" size={12} className="shrink-0 text-olive-600 dark:text-olive-400" />
                  <p className="text-xs leading-relaxed text-sand-600 dark:text-sand-400">{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
