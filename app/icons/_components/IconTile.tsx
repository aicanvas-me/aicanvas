'use client'

import { useState, type MouseEvent } from 'react'
import { Code, Copy } from '@phosphor-icons/react'
import { copyText } from '@/app/components/useCopied'
import { iconJsxLine } from '../_lib/constants'
import { buildSvg } from '../_lib/svg'
import type { IconGridMeta, IconStyle } from '../_lib/types'
import { IconSvg } from './IconSvg'

export function IconTile({
  icon,
  markup,
  size,
  strokeWidth,
  absolute,
  colour,
  style,
  onOpen,
}: {
  icon: IconGridMeta
  markup: string
  size: number
  strokeWidth: number
  absolute: boolean
  colour: string
  style: IconStyle
  onOpen: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const showActions = hovered || focused

  const openPopup = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onOpen()
  }

  return (
    <div
      data-icon-tile=""
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
    >
      {icon.isNew && <i data-icon-new="" role="img" aria-label="New" />}
      <a href={`/icons/${icon.name}`} data-icon-link="" onClick={openPopup} aria-label={`Open ${icon.name} details`}>
        {markup ? (
          <IconSvg markup={markup} size={size} strokeWidth={strokeWidth} absolute={absolute} colour={colour} />
        ) : (
          <span data-icon-placeholder="" aria-hidden />
        )}
        <span data-icon-name="">{icon.name}</span>
      </a>
      {showActions && markup && (
        <div className="absolute right-1.5 top-1.5 z-20 flex gap-1">
          <button
            type="button"
            aria-label={`Copy ${icon.name} SVG`}
            title="Copy SVG"
            onClick={() => void copyText(buildSvg(markup, size, strokeWidth, colour, absolute))}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-sand-300 bg-sand-50 text-sand-700 shadow-sm hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 dark:hover:text-sand-50"
          >
            <Copy weight="regular" size={12} />
          </button>
          <button
            type="button"
            aria-label={`Copy ${icon.name} JSX`}
            title="Copy JSX"
            onClick={() => void copyText(iconJsxLine(icon.name, size, strokeWidth, style, absolute))}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-sand-300 bg-sand-50 text-sand-700 shadow-sm hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 dark:hover:text-sand-50"
          >
            <Code weight="regular" size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
