'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CaretDown,
  Check,
  Code,
  Copy,
  DownloadSimple,
  FileSvg,
  Robot,
  TerminalWindow,
} from '@phosphor-icons/react'
import { buttonClasses } from '@/app/components/buttonClasses'
import { copyText, useCopied } from '@/app/components/useCopied'
import { agentPrompt, iconInstallCommand, iconJsxLine } from '../_lib/constants'
import { buildSvg } from '../_lib/svg'
import type { IconStyle } from '../_lib/types'

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function downloadSvg(name: string, svg: string) {
  saveBlob(new Blob([svg], { type: 'image/svg+xml' }), `${name}.svg`)
}

async function downloadPng(name: string, svg: string, size: number) {
  const source = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try {
    const image = new Image()
    image.src = source
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = size * 2
    canvas.height = size * 2
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (blob) saveBlob(blob, `${name}@2x.png`)
  } finally {
    URL.revokeObjectURL(source)
  }
}

export function ActionBar({
  name,
  markup,
  size,
  strokeWidth,
  absolute,
  colour,
  style,
}: {
  name: string
  markup: string
  size: number
  strokeWidth: number
  absolute: boolean
  // the user's pick, null for none (the icon keeps the text colour)
  colour: string | null
  style: IconStyle
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const prompt = agentPrompt(name, size, strokeWidth, style, absolute, colour)
  const jsx = iconJsxLine(name, size, strokeWidth, style, absolute, colour)
  const svg = buildSvg(markup, size, strokeWidth, colour, absolute)
  const { copied, copy } = useCopied(prompt)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  const items = [
    { label: 'Copy for agent', icon: Robot, action: () => copyText(prompt) },
    { label: 'Copy install command', icon: TerminalWindow, action: () => copyText(iconInstallCommand(name)) },
    { label: 'Copy JSX', icon: Code, action: () => copyText(jsx) },
    { label: 'Copy SVG', icon: Copy, action: () => copyText(svg) },
    { label: 'Download SVG', icon: FileSvg, action: () => downloadSvg(name, svg) },
    { label: 'Download PNG', icon: DownloadSimple, action: () => downloadPng(name, svg, size) },
  ]

  return (
    // On a phone the split button takes the whole first row and the two
    // secondaries share the second, half each, instead of one wrapping alone.
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <div ref={menuRef} className="relative col-span-2 flex sm:inline-flex">
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-l-control sm:flex-none bg-accent px-3 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/85 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {copied ? <Check weight="regular" size={14} /> : <Robot weight="regular" size={14} />}
          {copied ? 'Copied' : 'Copy for agent'}
        </button>
        <button
          type="button"
          aria-label="More copy and download options"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-r-control border-l border-accent-foreground/20 bg-accent text-accent-foreground transition-colors hover:bg-accent/85 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <CaretDown weight="regular" size={13} />
        </button>
        {open && (
          <div className="absolute left-0 top-10 z-50 w-56 rounded-section border border-sand-200 bg-sand-50 p-1.5 shadow-2xl dark:border-sand-700 dark:bg-sand-900">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  void item.action()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-xs font-semibold text-sand-700 hover:bg-sand-200 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-sand-300 dark:hover:bg-sand-800 dark:hover:text-sand-50"
              >
                <item.icon weight="regular" size={15} aria-hidden />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button type="button" onClick={() => void copyText(jsx)} className={`h-8 ${buttonClasses({ variant: 'outline', size: 'xs' })}`}>
        <Code weight="regular" size={14} />
        Copy JSX
      </button>
      <button type="button" onClick={() => downloadSvg(name, svg)} className={`h-8 ${buttonClasses({ variant: 'outline', size: 'xs' })}`}>
        <DownloadSimple weight="regular" size={14} />
        SVG
      </button>
    </div>
  )
}

