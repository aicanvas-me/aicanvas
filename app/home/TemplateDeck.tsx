'use client'

// The Pro templates inside one device frame: a tab per template, a Desktop /
// Tablet / Mobile switch, and the real template running in an iframe. The
// iframe loads the template's bare `?frame=1` payload (the same one the
// template page's own phone preview uses) at a real device width, then scales
// down to fit, so the composition's own breakpoints pick the layout. The
// framed document mirrors the site theme by itself (AndromedaThemeSync).
//
// Only the active template's iframe exists, and only once the section is near
// the screen. On desktop the template's poster paints first and the live page
// fades in over it when it has loaded.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
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

// One live template at one size. Keyed by template + device in the parent, so
// every switch mounts a fresh frame with its own `loaded` flag: the old iframe
// is gone at once (never two at a time) and a late load event from it can
// never reveal the new one early.
function LiveFrame({ t, device, box }: { t: DeckTemplate; device: Device; box: { w: number; h: number } }) {
  const reduce = useReducedMotion()
  const [loaded, setLoaded] = useState(false)
  const d = DEVICES[device]
  const framed = device !== 'desktop'
  // Tablet and phone sit in a bezel; it counts toward the size that must fit.
  const bezel = framed ? 10 : 0
  const outerW = d.w + bezel * 2
  const outerH = d.h + bezel * 2
  // Fit and centre. Desktop fills a 16:10 screen exactly (no margin); on a
  // phone-shaped screen it letterboxes instead of stretching the viewport.
  const margin = framed ? 32 : 0
  const scale = Math.min((box.w - margin) / outerW, (box.h - margin) / outerH)
  if (box.w === 0 || scale <= 0) return null

  return (
    <>
      {/* Loading pulse for tablet and phone, where no poster fits. */}
      {framed && !loaded && (
        <div aria-hidden className="absolute inset-0 flex items-center justify-center">
          <span className="size-2 animate-ping rounded-full bg-sand-400 dark:bg-sand-600" />
        </div>
      )}
      <motion.div
        className={`absolute left-1/2 top-1/2 ${
          framed
            ? 'rounded-[40px] bg-sand-200 shadow-[0_2px_6px_rgba(0,0,0,0.08),0_24px_48px_-16px_rgba(0,0,0,0.3)] dark:bg-sand-800'
            : ''
        }`}
        style={{ width: outerW, height: outerH, padding: bezel, x: '-50%', y: '-50%', scale }}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.35, ease: 'easeOut' }}
      >
        <iframe
          title={`${t.name} template, live`}
          src={`${href(t.folder)}?frame=1`}
          onLoad={() => setLoaded(true)}
          className={`block h-full w-full bg-sand-50 dark:bg-sand-950 ${framed ? 'rounded-[30px]' : ''}`}
        />
      </motion.div>
    </>
  )
}

export function TemplateDeck({ templates }: { templates: DeckTemplate[] }) {
  const [active, setActive] = useState(0)
  // Phones open on the phone view: a 1440px desktop scaled into a 360px
  // screen would be unreadable. A pick by the visitor wins after that.
  const isPhone = useMedia('(max-width: 639px)', false)
  const [picked, setPicked] = useState<Device | null>(null)
  const device: Device = picked ?? (isPhone ? 'mobile' : 'desktop')
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

  // Plain toggle buttons (aria-pressed): each is its own tab stop, which is
  // honest for a short row, instead of tab/radio roles without their arrow-key
  // model.
  const pressedClass = (on: boolean) =>
    on
      ? 'bg-sand-50 text-sand-900 shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-sand-800 dark:text-sand-50'
      : 'text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100'

  return (
    <div>
      {/* Device switch */}
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Preview size"
          className="inline-flex items-center gap-1 rounded-full border border-sand-200 bg-sand-100 p-1 dark:border-sand-800 dark:bg-sand-900"
        >
          {(Object.keys(DEVICES) as Device[]).map((id) => {
            const { label, icon: DeviceIcon } = DEVICES[id]
            const on = id === device
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked(id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${pressedClass(on)}`}
              >
                <DeviceIcon weight="regular" size={14} aria-hidden />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* The frame */}
      <div className="mx-auto mt-6 max-w-5xl rounded-shell border border-sand-200 bg-sand-100 p-2 shadow-[0_2px_6px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(0,0,0,0.18)] sm:p-2.5 dark:border-sand-800 dark:bg-sand-900 dark:shadow-[0_2px_6px_rgba(0,0,0,0.3),0_32px_64px_-24px_rgba(0,0,0,0.7)]">
        {/* Template row + live link */}
        <div className="flex items-center gap-2 px-1 pb-2 sm:pb-2.5">
          <div
            role="group"
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
                  aria-pressed={on}
                  aria-controls="v3-template-screen"
                  onClick={() => setActive(i)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
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
            className="hidden shrink-0 items-center gap-1 rounded-control border border-sand-300 px-2.5 py-1.5 text-xs font-semibold text-sand-700 transition-colors hover:border-sand-400 hover:text-sand-900 sm:inline-flex dark:border-sand-700 dark:text-sand-300 dark:hover:border-sand-600 dark:hover:text-sand-100"
          >
            Live preview
            <ArrowUpRight weight="regular" size={13} aria-hidden />
          </Link>
        </div>

        {/* Screen */}
        <div
          id="v3-template-screen"
          role="region"
          aria-label={`${t.name} template, ${d.label.toLowerCase()} view`}
          ref={screenRef}
          className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-shell)_-_0.5rem)] border border-sand-200 bg-sand-50 sm:aspect-[16/10] dark:border-sand-800 dark:bg-sand-950"
        >
          {/* Poster under the desktop view, so the frame is never empty while
              the live page loads. Only once the section is near: before that
              neither theme's poster downloads. */}
          {near && device === 'desktop' && (
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

          {near && <LiveFrame key={`${t.folder}-${device}`} t={t} device={device} box={box} />}
        </div>
      </div>

      <div className="mt-3 flex justify-center sm:hidden">
        <Link
          href={href(t.folder)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent/70"
        >
          Open {t.name}
          <ArrowUpRight weight="regular" size={14} aria-hidden />
        </Link>
      </div>
    </div>
  )
}
