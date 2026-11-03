'use client'

import { createContext, useContext, useLayoutEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Breadcrumbs } from './Breadcrumbs'
import { OfferBanner } from './billing/OfferBanner'
import { buildTopBarCrumbs, installSlotId, offerPillMode } from './top-bar-crumbs'

// The crumb row every catalog page draws directly above its own title, in its
// own column: the crumb trail on the left, and on the right the founding-offer
// pill and the page's install slot. It replaced the small overline that used
// to sit above each title, and the slim crumb line that used to run across the
// top of the content column.
//
// What it shows comes from the URL (top-bar-crumbs.ts), so the crumbs are in
// the server HTML. A page that needs something the URL cannot say, like a live
// result count while you type, overrides the trail with useTopBarLeft; the
// override is keyed to the page's own pathname so it can never bleed onto the
// next page. The provider sits in the root layout, so the override and the
// slot outlive the page that set them only until the next navigation.

type LeftOverride = { pathname: string; node: ReactNode } | null

const TopBarContext = createContext<{
  override: LeftOverride
  setOverride: (o: LeftOverride) => void
} | null>(null)

// The install slot: the element a page portals its install control into. It
// sits at the right of the crumb row, and the ROW publishes it, from a ref,
// once the row itself has committed. A page must never look the node up on its
// own: a page that finds a server-rendered copy of the node before it has
// hydrated portals into it, breaks the row's hydration, and React rebuilds the
// row and leaves the page holding a detached node with its control inside.
const TopBarSlotContext = createContext<{
  installSlot: HTMLElement | null
  setInstallSlot: (el: HTMLElement | null) => void
} | null>(null)

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<LeftOverride>(null)
  const [installSlot, setInstallSlot] = useState<HTMLElement | null>(null)
  const value = useMemo(() => ({ override, setOverride }), [override])
  const slotValue = useMemo(() => ({ installSlot, setInstallSlot }), [installSlot])
  return (
    <TopBarContext.Provider value={value}>
      <TopBarSlotContext.Provider value={slotValue}>{children}</TopBarSlotContext.Provider>
    </TopBarContext.Provider>
  )
}

const noop = () => () => {}

// The install slot of the calling page's crumb row, or null while there is
// none: before the row has committed, on a route that has no slot, and during
// the page's own hydration render (the server sent no portal, so the first
// client render must not have one either). It follows the node: if the row is
// rebuilt, callers get the new element.
export function useTopBarInstallSlot(): HTMLElement | null {
  const slot = useContext(TopBarSlotContext)?.installSlot ?? null
  const isClient = useSyncExternalStore(noop, () => true, () => false)
  return isClient ? slot : null
}

// Replaces the crumb row's trail for as long as the calling page is mounted.
// Pass null to fall back to the URL-derived crumbs. Runs as a layout effect so
// the swap lands before the browser paints.
//
// CONTRACT: `node` must keep its identity between renders that did not change
// it, so wrap anything but null in a useMemo keyed on the values it reads.
// Writing the override changes the context this hook subscribes to, which
// re-renders the caller; a fresh element each time would feed the effect its
// own write and never settle. app/components/TopBar.test.tsx guards this.
export function useTopBarLeft(node: ReactNode | null) {
  // The context VALUE is deliberately not a dependency: only the setter, which
  // is stable, plus the inputs that decide what the override should be.
  const setOverride = useContext(TopBarContext)?.setOverride
  const pathname = usePathname() ?? '/'
  useLayoutEffect(() => {
    if (!setOverride) return
    setOverride(node === null ? null : { pathname, node })
  }, [setOverride, pathname, node])
}

// The slot element. Its ref is what publishes it, so the node a page receives
// is always one the row has already committed.
export function TopBarInstallSlot({ id }: { id: string }) {
  const setInstallSlot = useContext(TopBarSlotContext)?.setInstallSlot
  return <div id={id} ref={setInstallSlot} className="flex items-center" />
}

// With the offer pill or an install control present, the row wraps on a
// narrow column: the trail keeps the first line and the right cluster drops
// under it rather than painting over it. ml-auto keeps that cluster on the
// right when it wraps: the install popovers open leftward from their button,
// so a cluster on the left would push them off the column.
export function PageCrumbs({ className = '' }: { className?: string }) {
  const pathname = usePathname() ?? '/'
  const ctx = useContext(TopBarContext)
  const override = ctx?.override && ctx.override.pathname === pathname ? ctx.override.node : undefined
  const crumbs = buildTopBarCrumbs(pathname)
  const slot = installSlotId(pathname)
  const offerMode = offerPillMode(pathname)
  if (override === undefined && !crumbs && !slot && !offerMode) return null

  return (
    <div data-page-crumbs className={`mb-4 flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-2 ${className}`}>
      <div className="min-w-0 max-w-full">
        {override !== undefined ? override : crumbs ? <Breadcrumbs crumbs={crumbs} /> : null}
      </div>
      {(offerMode || slot) && (
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {offerMode && <OfferBanner mode={offerMode} />}
          {slot && <TopBarInstallSlot id={slot} />}
        </div>
      )}
    </div>
  )
}
