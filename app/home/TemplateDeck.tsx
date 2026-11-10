'use client'

// The Pro templates inside one device frame: a tab per template and the real
// template running in an iframe. The iframe loads the template's bare
// `?frame=1` payload at a desktop viewport, then scales to fill the screen, so
// the composition's desktop layout is what shows. The framed document mirrors
// the site theme by itself (AndromedaThemeSync).
//
// Only the active template's iframe exists, and only once the section is near
// the screen. A small spinner holds the screen while it loads, then the live
// page fades in.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from '@/app/_icons/icons/arrow-up-right'
import { Broadcast } from '@/app/_icons/icons/broadcast'
import { Buildings } from '@/app/_icons/icons/buildings'
import { MessageCircleDots } from '@/app/_icons/icons/message-circle-dots'
import { Kanban } from '@/app/_icons/icons/kanban'
import { Monitor } from '@/app/_icons/icons/monitor'
import { RocketLaunch } from '@/app/_icons/icons/rocket-launch'
import { LoaderCircle } from '@/app/_icons/icons/loader-circle'
import { LogIn } from '@/app/_icons/icons/log-in'
import { UserPlus } from '@/app/_icons/icons/user-plus'
import { CircleDollarSign } from '@/app/_icons/icons/circle-dollar-sign'
import { Wrench } from '@/app/_icons/icons/wrench'
import { type SiteIcon as Icon } from '@/app/_icons'
import { StageLight } from '../components/StageLight'

export type DeckTemplate = {
  folder: string
  name: string
}

// The desktop viewport every template renders at: wide enough for each one's
// desktop layout, and the same 16:10 as the screen it fills.
const VIEW = { w: 1440, h: 900 }

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

// One live template. Keyed by template in the parent, so every switch mounts a
// fresh frame with its own `loaded` flag: the old iframe is gone at once (never
// two at a time) and a late load event from it can never reveal the new one
// early.
function LiveFrame({ t, box }: { t: DeckTemplate; box: { w: number; h: number } }) {
  const reduce = useReducedMotion()
  const [loaded, setLoaded] = useState(false)
  // Cover, not contain: the screen's border box is 16:10, so its content box
  // is a hair off, and fitting inside it left a sliver of screen at the sides.
  // Covering clips at most a pixel instead.
  const scale = Math.max(box.w / VIEW.w, box.h / VIEW.h)
  if (box.w === 0 || scale <= 0) return null

  return (
    <>
      {!loaded && (
        <div aria-hidden className="absolute inset-0 flex items-center justify-center">
          <LoaderCircle
            size={20}
            className="animate-spin text-sand-400 motion-reduce:animate-none dark:text-sand-600"
          />
        </div>
      )}
      <motion.div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: VIEW.w, height: VIEW.h, scale }}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.35, ease: 'easeOut' }}
      >
        <iframe
          title={`${t.name} template, live`}
          src={`${href(t.folder)}?frame=1`}
          onLoad={() => setLoaded(true)}
          className="block h-full w-full bg-sand-50 dark:bg-sand-950"
        />
      </motion.div>
    </>
  )
}

export function TemplateDeck({ templates }: { templates: DeckTemplate[] }) {
  const [active, setActive] = useState(0)
  const screenRef = useRef<HTMLDivElement>(null)
  const near = useInView(screenRef, { once: true, margin: '300px 0px' })
  const [box, setBox] = useState({ w: 0, h: 0 })

  // The live page scales with the screen, so it is measured on every resize.
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

  return (
    <div>
      {/* The stage: a wide panel lit from straight above, the frame set into
          it, with no bottom edge. */}
      <div className="relative overflow-hidden rounded-section px-3 pt-8 sm:px-8 sm:pt-14 lg:px-16 lg:pt-20">
        <StageLight />

        {/* The frame. Its lower part dissolves into the stage instead of ending
            on an edge. */}
        <div className="relative mx-auto max-w-5xl rounded-shell border border-sand-200 bg-sand-100 p-2 shadow-[0_2px_6px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(0,0,0,0.18)] [mask-image:linear-gradient(to_bottom,black_60%,transparent)] sm:p-2.5 sm:[mask-image:linear-gradient(to_bottom,black_50%,transparent)] dark:border-sand-800 dark:bg-sand-900 dark:shadow-[0_2px_6px_rgba(0,0,0,0.3),0_32px_64px_-24px_rgba(0,0,0,0.7)]">
          {/* Template row + live link */}
          <div className="flex items-center gap-2 px-1 pt-1 pb-2 sm:pb-2.5">
            {/* Plain toggle buttons (aria-pressed): each is its own tab stop,
                honest for a short row. */}
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
            aria-label={`${t.name} template, desktop view`}
            ref={screenRef}
            className="relative aspect-[16/10] overflow-hidden rounded-[calc(var(--radius-shell)_-_0.5rem)] border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950"
          >
            {near && <LiveFrame key={t.folder} t={t} box={box} />}
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
