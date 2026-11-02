'use client'

import Link from 'next/link'
import { ImageSquare } from '@/app/_icons/icons/image-square'
import { BoltSolid } from '@/app/_icons/icons/bolt-solid'
import { BadgeCheckSolid } from '@/app/_icons/icons/badge-check-solid'
import { track, type CardSource } from '../lib/analytics'
import { optimizeImageKitUrl } from '../lib/imagekit'

// ─── Types (also used by ComponentPageView + registry) ────────────────────────

export type Platform = 'Claude Code' | 'Lovable' | 'V0'

export interface Tag {
  label: string
  accent?: boolean
}

export interface ComponentCardProps {
  name: string
  description: string
  tags: Tag[]
  image?: string
  /** The light-theme shot, for a component that ships both themes; the card
   *  shows it on a light site and `image` on a dark one. */
  imageLight?: string
  href: string
  badge?: string
  slug: string
  position: number
  source: CardSource
  /** 'pro' marks the badge as Andromeda Pro's. */
  badgeTone?: 'pro'
}

// ─── ComponentCard ─────────────────────────────────────────────────────────────

const IMG = 'absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.04] group-hover:brightness-110'

// One rounded card, one link. The preview fills the top and fades into the
// card's own surface, and the title and description sit straight on that
// surface: no panel behind the text and no button, because the whole card is
// the target. Hover steps the border up one and lifts the preview a touch.
export function ComponentCard({ name, description, href, image, imageLight, badge, badgeTone, slug, position, source }: ComponentCardProps) {
  return (
    <Link
      href={href}
      onClick={() => track('Component Card Click', { component: slug, position, source })}
      className="group relative isolate flex flex-col overflow-hidden rounded-shell border border-sand-200 bg-sand-100 transition-colors duration-200 hover:border-sand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-sand-50 dark:border-sand-800 dark:bg-sand-950 dark:hover:border-sand-700 dark:focus-visible:ring-offset-sand-950"
    >
      {/* Preview. Save action intentionally lives on the component detail
          page only; keeping it off the card keeps the preview uncluttered. */}
      {/* Light fill on a light site: the rounded clip anti-aliases this ground into the edge. */}
      <div className="relative aspect-video overflow-hidden bg-sand-100 dark:bg-sand-900">
        {badge && (
          // Aceternity-style pill: just a filled icon at rest, slides open to
          // the label on card hover. Only the icon takes the tier hue: a cyan
          // bolt for Premium, an orange seal for Free. The pill is dark in both
          // themes, so the icons use the fixed dark steps.
          // No backdrop blur: over a lazy image Chrome painted it as a bare square.
          <div
            className={`absolute left-4 top-4 z-10 flex items-center rounded-full bg-sand-950/90 p-1.5 ring-1 ${
              badge === 'Free'
                ? 'text-sand-300 ring-sand-500/40'
                : badgeTone === 'pro'
                  ? 'text-sand-50 ring-sand-50/30'
                  : 'text-sand-50 ring-sand-50/30'
            }`}
          >
            {badge === 'Free' ? (
              <BadgeCheckSolid size={14} className="shrink-0 text-ember-400" />
            ) : (
              <BoltSolid size={14} className="shrink-0 text-cyan-400" />
            )}
            <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out group-hover:grid-cols-[1fr]">
              <span className="overflow-hidden">
                {/* Tier only, no type noun: this shell is reused by blocks and
                    Andromeda templates, so "Premium component" mislabeled them.
                    The type word lives on the detail page (see isBlock).
                    Line height matches the 14px icon: leading-none let the
                    overflow-hidden wrapper cut the descenders of g, y and p. */}
                <span className="block whitespace-nowrap pl-1.5 pr-0.5 text-[11px] font-semibold leading-3.5">
                  {badge}
                </span>
              </span>
            </span>
          </div>
        )}
        {image ? (
          <>
            <img src={optimizeImageKitUrl(image, 'card')} alt={name} loading="lazy" decoding="async" className={`${IMG} ${imageLight ? 'hidden dark:block' : ''}`} />
            {/* display:none keeps a lazy image from loading, so each theme
                fetches only its own shot. */}
            {imageLight && (
              <img src={optimizeImageKitUrl(imageLight, 'card')} alt={name} loading="lazy" decoding="async" className={`${IMG} dark:hidden`} />
            )}
          </>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          >
            <ImageSquare size={28} className="text-sand-700" />
          </div>
        )}
        {/* The fade: the preview's lower edge melts into the card's surface,
            so the image and the text read as one piece. Every card, a
            dark-only shot on a light site included. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-transparent to-sand-100 dark:to-sand-950" />
      </div>

      <div className="relative -mt-3 flex flex-1 flex-col px-5 pb-5">
        <h3 className="font-semibold text-sand-900 dark:text-sand-50">{name}</h3>
        <p className="mt-1 line-clamp-2 text-sm font-normal text-sand-600 dark:text-sand-400">
          {description}
        </p>
      </div>
    </Link>
  )
}
