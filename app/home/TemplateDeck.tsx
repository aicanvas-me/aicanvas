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
import { ArrowUpRight } from '@/app/_icons/icons/arrow-up-right'
import { Broadcast } from '@/app/_icons/icons/broadcast'
import { Buildings } from '@/app/_icons/icons/buildings'
import { MessageCircleDots } from '@/app/_icons/icons/message-circle-dots'
import { Smartphone } from '@/app/_icons/icons/smartphone'
import { Tablet } from '@/app/_icons/icons/tablet'
import { Kanban } from '@/app/_icons/icons/kanban'
import { Monitor } from '@/app/_icons/icons/monitor'
import { RocketLaunch } from '@/app/_icons/icons/rocket-launch'
import { LogIn } from '@/app/_icons/icons/log-in'
import { UserPlus } from '@/app/_icons/icons/user-plus'
import { CircleDollarSign } from '@/app/_icons/icons/circle-dollar-sign'
import { Wrench } from '@/app/_icons/icons/wrench'
import { type SiteIcon as Icon } from '@/app/_icons'
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
  tablet: { w: 820, h: 1180, label: 'Tablet', icon: Tablet },
  mobile: { w: 390, h: 844, label: 'Mobile', icon: Smartphone },
}

const ICONS: Record<string, Icon> = {
  'ai-chat': MessageCircleDots,
  'city-operations': Buildings,
  'fintech-landing': CircleDollarSign,
  'mission-control': RocketLaunch,
  'resource-planning': Kanban,
  'service-order': Wrench,
  'sign-in': LogIn,
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
          <span className="size-2 animate-ping rounded-full bg-sand-400 motion-reduce:animate-none dark:bg-sand-600" />
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
                <DeviceIcon size={14} aria-hidden />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* The stage: a wide panel lit from straight above, the frame set into
          it. Its fill is brightest at the top centre and falls to the page by
          the lower half, so the stage has no bottom edge. The two colours are
          per theme custom properties, read by one inline gradient (commas in
          an arbitrary value escape awkwardly). The light is a radial with
          eased stops, never a blurred disc, so it shows no bands. */}
      <div
        className="relative mt-6 overflow-hidden rounded-section px-3 pt-8 sm:px-8 sm:pt-14 lg:px-16 lg:pt-20 [--stage-light:var(--color-sand-50)] [--stage-tint:var(--color-sand-200)] dark:[--stage-light:color-mix(in_srgb,var(--color-sand-50)_20%,transparent)] dark:[--stage-tint:color-mix(in_srgb,var(--color-sand-50)_5%,transparent)]"
        style={{
          background: [
            'radial-gradient(70% 45% at 50% 0%,var(--stage-light), color-mix(in srgb, var(--stage-light) 70%, transparent) 22%, color-mix(in srgb, var(--stage-light) 38%, transparent) 45%, color-mix(in srgb, var(--stage-light) 14%, transparent) 70%, transparent)',
            'linear-gradient(to bottom, var(--stage-tint), transparent 65%)',
          ].join(', '),
        }}
      >
        {/* The rim: catches the light along the top, gone halfway down the
            sides. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] border border-sand-300 [mask-image:linear-gradient(to_bottom,black,transparent_55%)] dark:border-sand-50/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 hidden h-px dark:block"
          style={{
            background:
              'linear-gradient(90deg, transparent 15%, color-mix(in srgb, var(--color-sand-50) 45%, transparent) 50%, transparent 85%)',
          }}
        />

        {/* The frame. Its lower part dissolves into the stage instead of ending
            on an edge. */}
        <div className="relative mx-auto max-w-5xl rounded-shell border border-sand-200 bg-sand-100 p-2 shadow-[0_2px_6px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(0,0,0,0.18)] [mask-image:linear-gradient(to_bottom,black_60%,transparent)] sm:p-2.5 sm:[mask-image:linear-gradient(to_bottom,black_50%,transparent)] dark:border-sand-800 dark:bg-sand-900 dark:shadow-[0_2px_6px_rgba(0,0,0,0.3),0_32px_64px_-24px_rgba(0,0,0,0.7)]">
          {/* Template row + live link */}
          <div className="flex items-center gap-2 px-1 pt-1 pb-2 sm:pb-2.5">
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
                    className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                      on
                        ? 'bg-sand-200 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                        : 'text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100'
                    }`}
                  >
                    <TabIcon size={15} aria-hidden />
                    {tpl.name}
                  </button>
                )
              })}
            </div>
            <Link
              href={href(t.folder)}
              className="hidden h-8 shrink-0 items-center gap-1 rounded-control border border-sand-300 px-2.5 text-xs font-semibold text-sand-700 transition-colors hover:border-sand-400 hover:text-sand-900 sm:inline-flex dark:border-sand-700 dark:text-sand-300 dark:hover:border-sand-600 dark:hover:text-sand-100"
            >
              Live preview
              <ArrowUpRight size={13} aria-hidden />
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
      </div>

      <div className="mt-3 flex justify-center sm:hidden">
        <Link
          href={href(t.folder)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent/70"
        >
          Open {t.name}
          <ArrowUpRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  )
}
