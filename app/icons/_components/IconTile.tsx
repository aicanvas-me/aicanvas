'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Code } from '@/app/_icons/icons/code'
import { Copy } from '@/app/_icons/icons/copy'
import { copyText } from '@/app/components/useCopied'
import { iconJsxLine } from '../_lib/constants'
import type { IconWeight } from '../_lib/icon-utils'
import { isPreview } from '../_lib/preview'
import { buildSvg } from '../_lib/svg'
import type { IconGridMeta, IconStyle } from '../_lib/types'
import { IconSvg } from './IconSvg'

export function IconTile({
  icon,
  markup,
  size,
  weight,
  colour,
  exportColour,
  exportSize = size,
  style,
  href = `/icons/${icon.name}`,
}: {
  icon: IconGridMeta
  markup: string
  size: number
  weight: IconWeight
  colour: string
  // what Copy SVG and Copy JSX carry: the user's pick, null for none
  exportColour: string | null
  // the size copies carry when the tile is drawn smaller (a capped suggestion)
  exportSize?: number
  style: IconStyle
  href?: string
}) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const showActions = hovered || focused

  return (
    <div
      data-icon-tile=""
      // Only a mouse reveals the copy buttons, so a touch tap opens the icon instead.
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true)
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={(event) => {
        if (event.target.matches(':focus-visible')) setFocused(true)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
    >
      {icon.isNew && <i data-icon-new="" role="img" aria-label="New" />}
      {/* In-app navigation keeps the section's look (lib/settings-store) and
          opens the icon page already in it; no prefetch for 800 tiles. */}
      <Link href={href} prefetch={false} data-icon-link="" aria-label={`Open ${icon.name} details`}>
        {markup ? (
          <IconSvg markup={markup} size={size} weight={weight} colour={colour} />
        ) : (
          <span data-icon-placeholder="" aria-hidden />
        )}
        <span data-icon-name="">{icon.name}</span>
      </Link>
      {showActions && markup && (
        <div className="absolute right-1.5 top-1.5 z-20 flex gap-1">
          {/* A raster preview has no SVG to copy; JSX stays, its install is gated on /r. */}
          {!isPreview(markup) && <button
            type="button"
            aria-label={`Copy ${icon.name} SVG`}
            title="Copy SVG"
            onClick={() => void copyText(buildSvg(markup, exportSize, weight, exportColour, style))}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-sand-300 bg-sand-50 text-sand-700 shadow-sm hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 dark:hover:text-sand-50"
          >
            <Copy size={12} />
          </button>}
          <button
            type="button"
            aria-label={`Copy ${icon.name} JSX`}
            title="Copy JSX"
            onClick={() => void copyText(iconJsxLine(icon.name, exportSize, weight, style, exportColour))}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-sand-300 bg-sand-50 text-sand-700 shadow-sm hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 dark:hover:text-sand-50"
          >
            <Code size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
