'use client'

// The Pro templates inside one device frame: a tab per template, a Desktop /
// Tablet / Mobile switch, and the real template running in an iframe. The
// iframe loads the template's bare `?frame=1` payload (the same one the
// template page's own phone preview uses) at a real device width, then scales
// down to fit, so the composition's own breakpoints pick the layout. The
// framed document mirrors the site theme by itself (AndromedaThemeSync).
//
// Only the active tab's iframe exists, and only once the section is near the
// screen. On desktop the template's poster paints first and the live page
// fades in over it when it has loaded.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import {
  ArrowUpRight,
  Broadcast,
  Buildings,
  ChatCircleDots,
  DeviceMobile,
  DeviceTablet,
  Kanban,
  Monitor,
  RocketLaunch,
  SignIn,
  UserPlus,
  Wallet,
  Wrench,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useMedia } from './useMedia'

export type DeckTemplate = {
  folder: string
  name: string
  image: string | null
  imageLight: string | null
}

type Device = 'desktop' | 'tablet' | 'mobile'

// Native viewport per device. Desktop is wide enough for every template's
// desktop layout; tablet and phone are common portrait sizes.
const DEVICES: Record<Device, { w: number; h: number; label: string; icon: Icon }> = {
  desktop: { w: 1440, h: 900, label: 'Desktop', icon: Monitor },
  tablet: { w: 820, h: 1180, label: 'Tablet', icon: DeviceTablet },
  mobile: { w: 390, h: 844, label: 'Mobile', icon: DeviceMobile },
}

const ICONS: Record<string, Icon> = {
  'ai-chat': ChatCircleDots,
  'city-operations': Buildings,
  'fintech-landing': Wallet,
  'mission-control': RocketLaunch,
  'resource-planning': Kanban,
  'service-order': Wrench,
  'sign-in': SignIn,
  'sign-up': UserPlus,
  'signal-room': Broadcast,
}

const href = (folder: string) => `/design-systems/andromeda-pro/templates/${folder}`

export function TemplateDeck({ templates }: { templates: DeckTemplate[] }) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  // Phones open on the phone view: a 1440px desktop scaled into a 360px
  // screen would be unreadable. A pick by the visitor wins after that.
  const isPhone = useMedia('(max-width: 639px)', false)
  const [picked, setPicked] = useState<Device | null>(null)
  const device: Device = picked ?? (isPhone ? 'mobile' : 'desktop')
  const [loaded, setLoaded] = useState(false)
  const screenRef = useRef<HTMLDivElement>(null)
  const near = useInView(screenRef, { once: true, margin: '300px 0px' })
  const [box, setBox] = useState({ w: 0, h: 0 })

  // The screen keeps one size for all three devices; the device inside it
  // scales to fit, so switching never moves the page.
  useEffect(() => {
    const el = screenRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBox({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const t = templates[active]
  const d = DEVICES[device]
  const framed = device !== 'desktop'
  // Tablet and phone sit in a bezel; it counts toward the size that must fit.
  const bezel = framed ? 10 : 0
  const outerW = d.w + bezel * 2
  const outerH = d.h + bezel * 2
  // Desktop fills the width; tablet and phone fit the screen with a margin.
  const scale =
    box.w === 0
      ? 0
      : framed
        ? Math.min((box.h - 32) / outerH, (box.w - 32) / outerW)
        : box.w / d.w
  const key = `${t.folder}-${device}`

  const pick = (i: number) => {
    if (i === active) return
    setLoaded(false)
    setActive(i)
  }
  const pickDevice = (next: Device) => {
    if (next === device) return
    setLoaded(false)
    setPicked(next)
  }

  return (
    <div>
      {/* Device switch */}
      <div className="flex justify-center">
        <div
          role="radiogroup"
          aria-label="Preview size"
          className="inline-flex items-center gap-1 rounded-xl border border-sand-200 bg-sand-100 p-1 dark:border-sand-800 dark:bg-sand-900"
        >
          {(Object.keys(DEVICES) as Device[]).map((id) => {
            const { label, icon: DeviceIcon } = DEVICES[id]
            const on = id === device
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pickDevice(id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
                  on
                    ? 'bg-sand-50 text-sand-900 shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-sand-800 dark:text-sand-50'
                    : 'text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100'
                }`}
              >
                <DeviceIcon weight="regular" size={14} aria-hidden />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* The frame */}
      <div className="mx-auto mt-6 max-w-5xl rounded-[28px] border border-sand-200 bg-sand-100 p-2 shadow-[0_2px_6px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(0,0,0,0.18)] sm:p-2.5 dark:border-sand-800 dark:bg-sand-900 dark:shadow-[0_2px_6px_rgba(0,0,0,0.3),0_32px_64px_-24px_rgba(0,0,0,0.7)]">
        {/* Tab strip + live link */}
        <div className="flex items-center gap-2 px-1 pb-2 sm:pb-2.5">
          <div
            role="tablist"
            aria-label="Templates"
            className="flex min-w-0 flex-1 gap-1 overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {templates.map((tpl, i) => {
              const TabIcon = ICONS[tpl.folder] ?? Monitor
              const on = i === active
              return (
                <button
                  key={tpl.folder}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="v3-template-screen"
                  onClick={() => pick(i)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
                    on
                      ? 'bg-sand-200 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                      : 'text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100'
                  }`}
                >
                  <TabIcon weight="regular" size={15} aria-hidden />
                  {tpl.name}
                </button>
              )
            })}
          </div>
          <Link
            href={href(t.folder)}
            className="hidden shrink-0 items-center gap-1 rounded-lg border border-sand-300 px-2.5 py-1.5 text-xs font-semibold text-sand-700 transition-colors hover:border-sand-400 hover:text-sand-900 sm:inline-flex dark:border-sand-700 dark:text-sand-300 dark:hover:border-sand-600 dark:hover:text-sand-100"
          >
            Live preview
            <ArrowUpRight weight="regular" size={13} aria-hidden />
          </Link>
        </div>

        {/* Screen */}
        <div
          id="v3-template-screen"
          role="tabpanel"
          aria-label={`${t.name} template, ${d.label.toLowerCase()} view`}
          ref={screenRef}
          className="relative aspect-[4/5] overflow-hidden rounded-[20px] border border-sand-200 bg-sand-50 sm:aspect-[16/10] dark:border-sand-800 dark:bg-sand-950"
        >
          {/* Poster under the desktop view, so the frame is never empty. */}
          {device === 'desktop' && (
            <>
              {t.image ? (
                <img
                  src={t.image}
                  alt=""
                  aria-hidden
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover object-[left_top] ${t.imageLight ? 'hidden dark:block' : ''}`}
                />
              ) : null}
              {t.imageLight ? (
                <img
                  src={t.imageLight}
                  alt=""
                  aria-hidden
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover object-[left_top] ${t.image ? 'dark:hidden' : ''}`}
                />
              ) : null}
            </>
          )}

          {/* Loading pulse for tablet and phone, where no poster fits. */}
          {device !== 'desktop' && !loaded && (
            <div aria-hidden className="absolute inset-0 flex items-center justify-center">
              <span className="size-2 animate-ping rounded-full bg-sand-400 dark:bg-sand-600" />
            </div>
          )}

          <AnimatePresence initial={false}>
            {near && scale > 0 && (
              <motion.div
                key={key}
                className={`absolute ${
                  framed
                    ? 'left-1/2 top-1/2 rounded-[40px] bg-sand-200 shadow-[0_2px_6px_rgba(0,0,0,0.08),0_24px_48px_-16px_rgba(0,0,0,0.3)] dark:bg-sand-800'
                    : 'left-0 top-0'
                }`}
                style={{
                  width: outerW,
                  height: framed ? outerH : box.h / scale,
                  padding: bezel,
                  transformOrigin: framed ? '50% 50%' : '0 0',
                  x: framed ? '-50%' : 0,
                  y: framed ? '-50%' : 0,
                  scale,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: loaded ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.35, ease: 'easeOut' }}
              >
                <iframe
                  title={`${t.name} template, live`}
                  src={`${href(t.folder)}?frame=1`}
                  onLoad={() => setLoaded(true)}
                  className={`block h-full w-full bg-sand-50 dark:bg-sand-950 ${framed ? 'rounded-[30px]' : ''}`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3 flex justify-center sm:hidden">
        <Link
          href={href(t.folder)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-olive-600 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300"
        >
          Open {t.name}
          <ArrowUpRight weight="regular" size={14} aria-hidden />
        </Link>
      </div>
    </div>
  )
}
