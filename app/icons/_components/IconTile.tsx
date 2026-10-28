'use client'

import { Code, Copy } from '@phosphor-icons/react'
import { copyText } from '@/app/components/useCopied'
import { iconJsxLine } from '../_lib/constants'
import { buildSvg } from '../_lib/svg'
import type { IconMeta, IconStyle } from '../_lib/types'
import { IconSvg } from './IconSvg'

export function IconTile({
  icon,
  markup,
  size,
  strokeWidth,
  colour,
  style,
  onOpen,
}: {
  icon: IconMeta
  markup: string
  size: number
  strokeWidth: number
  colour: string
  style: IconStyle
  onOpen: () => void
}) {
  return (
    <article className="group relative aspect-square min-h-0 overflow-hidden rounded-xl border border-transparent bg-sand-100 transition-colors hover:border-sand-300 dark:bg-sand-900 dark:hover:border-sand-700">
      {icon.isNew && <span aria-label="New" className="absolute left-3 top-3 z-10 h-1.5 w-1.5 rounded-full bg-olive-500" />}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${icon.name} details`}
        className="flex h-full w-full flex-col items-center justify-center gap-3 px-2 pb-2 pt-4 text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-olive-500/40 dark:text-sand-50"
      >
        <span className="flex min-h-10 items-center justify-center">
          <IconSvg markup={markup} size={size} strokeWidth={strokeWidth} colour={colour} />
        </span>
        <span className="line-clamp-2 min-h-7 break-words text-center text-[10px] leading-3.5 text-sand-600 dark:text-sand-400">
          {icon.name}
        </span>
      </button>
      <div className="absolute right-1.5 top-1.5 z-20 flex translate-y-1 gap-1 opacity-0 transition-[opacity,transform] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transition-none">
        <button
          type="button"
          aria-label={`Copy ${icon.name} SVG`}
          title="Copy SVG"
          onClick={() => void copyText(buildSvg(markup, size, strokeWidth, colour))}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-sand-300 bg-sand-50 text-sand-700 shadow-sm hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 dark:hover:text-sand-50"
        >
          <Copy weight="regular" size={12} />
        </button>
        <button
          type="button"
          aria-label={`Copy ${icon.name} JSX`}
          title="Copy JSX"
          onClick={() => void copyText(iconJsxLine(icon.name, size, strokeWidth, style))}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-sand-300 bg-sand-50 text-sand-700 shadow-sm hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 dark:hover:text-sand-50"
        >
          <Code weight="regular" size={12} />
        </button>
      </div>
    </article>
  )
}

