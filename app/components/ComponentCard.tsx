'use client'

import Link from 'next/link'
import { ArrowRight, ImageSquare, Lightning, SealCheck } from '@phosphor-icons/react'
import { track, type CardSource } from '../lib/analytics'
import { optimizeImageKitUrl } from '../lib/imagekit'
import { buttonClasses } from './Button'

// ─── Types (also used by ComponentPageView + registry) ────────────────────────

export type Platform = 'Claude Code' | 'Lovable' | 'V0'
export const PLATFORMS: Platform[] = ['Claude Code', 'Lovable', 'V0']

export interface Tag {
  label: string
  accent?: boolean
}

export interface ComponentCardProps {
  name: string
  description: string
  tags: Tag[]
  image?: string
  href: string
  badge?: string
  slug: string
  position: number
  source: CardSource
  /** CTA label. Defaults to "View Component"; pass e.g. "View template" for
   *  non-component cards reusing this shell. */
  cta?: string
}

// ─── ComponentCard ─────────────────────────────────────────────────────────────

export function ComponentCard({ name, description, href, image, badge, slug, position, source, cta = 'View Component' }: ComponentCardProps) {
  return (
    <Link
      href={href}
      onClick={() => track('Component Card Click', { component: slug, position, source })}
      className="group relative isolate flex flex-col overflow-hidden rounded-2xl border border-sand-300 bg-sand-950 shadow-sm transition-all duration-200 hover:border-sand-400 hover:shadow-xl hover:shadow-sand-300/60 dark:border-sand-800 dark:bg-sand-950 dark:hover:border-sand-700 dark:hover:shadow-2xl dark:hover:shadow-black/50"
    >
      {/* Image — extends slightly behind the content panel. Save action
          intentionally lives on the component detail page only; keeping it
          off the card keeps the preview surface uncluttered. */}
      <div className="relative aspect-video overflow-hidden bg-sand-900">
        {badge && (
          // Aceternity-style pill: just a filled icon at rest, slides open to
          // the label on card hover. Premium keeps the olive bolt; Free gets a
          // quieter sand seal so the paid tier stays the visual accent.
          <div
            className={`absolute left-3 top-3 z-10 flex items-center rounded-full bg-sand-950/85 p-1.5 ring-1 backdrop-blur-sm ${
              badge === 'Free'
                ? 'text-sand-300 ring-sand-500/40'
                : 'text-olive-400 ring-olive-500/40'
            }`}
          >
            {badge === 'Free' ? (
              <SealCheck weight="fill" size={14} className="shrink-0" />
            ) : (
              <Lightning weight="fill" size={14} className="shrink-0" />
            )}
            <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out group-hover:grid-cols-[1fr]">
              <span className="overflow-hidden">
                {/* Tier only, no type noun: this shell is reused by blocks and
                    Andromeda templates, so "Premium component" mislabeled them.
                    The type word lives on the detail page (see isBlock). */}
                <span className="block whitespace-nowrap pl-1.5 pr-0.5 text-[11px] font-semibold leading-none">
                  {badge}
                </span>
              </span>
            </span>
          </div>
        )}
        {image ? (
          <img src={optimizeImageKitUrl(image, 'card')} alt={name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-125" />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          >
            <ImageSquare weight="regular" size={28} className="text-sand-700" />
          </div>
        )}
      </div>

      {/* Card body — floats over image with rounded top corners */}
      <div className="relative -mt-4 flex flex-1 flex-col gap-3 rounded-t-2xl bg-sand-100 p-5 shadow-[0_-8px_24px_rgba(0,0,0,0.10)] dark:bg-sand-900 dark:shadow-[0_-8px_24px_rgba(0,0,0,0.25)]">
        <div>
          <h3 className="font-bold text-sand-900 dark:text-sand-50">{name}</h3>
          <p className="mt-1 line-clamp-2 text-sm font-normal text-sand-600 dark:text-sand-400">
            {description}
          </p>
        </div>

        {/* CTA — visually mirrors the outline secondary button (md). The
            entire card is the click target, so the CTA isn't a real button;
            we use group-hover so hovering anywhere on the card lights it
            up with the same shift as a real outline button's :hover. */}
        <div className="mt-auto pt-1">
          <span className={`${buttonClasses({ variant: 'outline', size: 'md', fullWidth: true })} text-xs group-hover:border-sand-400 group-hover:text-sand-900 dark:group-hover:border-sand-600 dark:group-hover:text-sand-100`}>
            {cta}
            <ArrowRight weight="regular" size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
