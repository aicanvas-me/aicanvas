'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown } from '@/app/_icons/icons/chevron-down'
import { Check } from '@/app/_icons/icons/check'
import { Code } from '@/app/_icons/icons/code'
import { Copy } from '@/app/_icons/icons/copy'
import { Download } from '@/app/_icons/icons/download'
import { FileImage } from '@/app/_icons/icons/file-image'
import { Bot } from '@/app/_icons/icons/bot'
import { SquareTerminal } from '@/app/_icons/icons/square-terminal'
import { buttonClasses } from '@/app/components/buttonClasses'
import { copyText, useCopied } from '@/app/components/useCopied'
import { agentPrompt, iconInstallCommand, iconJsxLine } from '../_lib/constants'
import type { IconWeight } from '../_lib/icon-utils'
import { isPreview } from '../_lib/preview'
import { buildSvg } from '../_lib/svg'
import type { IconStyle } from '../_lib/types'

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  // Revoked late: an immediate revoke can cancel the download in Safari and Firefox.
  setTimeout(() => URL.revokeObjectURL(url), 5000)
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
    if (!context) throw new Error('No canvas to draw the PNG on')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('The PNG could not be encoded')
    saveBlob(blob, `${name}@2x.png`)
  } finally {
    URL.revokeObjectURL(source)
  }
}

export function ActionBar({
  name,
  markup,
  size,
  weight,
  colour,
  style,
}: {
  name: string
  markup: string
  size: number
  weight: IconWeight
  // the user's pick, null for none (the icon keeps the text colour)
  colour: string | null
  style: IconStyle
}) {
  const [open, setOpen] = useState(false)
  const [pngFailed, setPngFailed] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()
  const router = useRouter()
  // A preview carries no vector: the SVG and PNG actions become the way to Premium.
  const locked = isPreview(markup)
  const prompt = agentPrompt(name, size, weight, style, colour)
  const jsx = iconJsxLine(name, size, weight, style, colour)
  const svg = locked ? '' : buildSvg(markup, size, weight, colour)
  const { copied, copy } = useCopied(prompt)

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    itemRefs.current[0]?.focus()
    const outside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('mousedown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  const items = [
    { label: 'Copy for agent', icon: Bot, action: () => copyText(prompt) },
    { label: 'Copy install command', icon: SquareTerminal, action: () => copyText(iconInstallCommand(name, style)) },
    { label: 'Copy JSX', icon: Code, action: () => copyText(jsx) },
    ...(locked
      ? [{ label: 'SVG and PNG with Premium', icon: Download, action: () => router.push('/pricing') }]
      : [
          { label: 'Copy SVG', icon: Copy, action: () => copyText(svg) },
          { label: 'Download SVG', icon: FileImage, action: () => downloadSvg(name, svg) },
          {
            label: 'Download PNG',
            icon: Download,
            action: () => downloadPng(name, svg, size).catch(() => setPngFailed(true)),
          },
        ]),
  ]

  // Arrows stop here, natively too: the page's document listener walks icons on them.
  const onMenuKey = (event: KeyboardEvent) => {
    const index = itemRefs.current.indexOf(document.activeElement as HTMLButtonElement)
    const last = items.length - 1
    const targets: Record<string, number> = {
      ArrowDown: index >= last ? 0 : index + 1,
      ArrowUp: index <= 0 ? last : index - 1,
      Home: 0,
      End: last,
    }
    if (event.key in targets) itemRefs.current[targets[event.key]]?.focus()
    else if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
  }

  return (
    // On a phone the split button takes the whole first row and the two
    // secondaries share the second, half each, instead of one wrapping alone.
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <div
        ref={menuRef}
        className="relative col-span-2 flex sm:inline-flex"
        onBlur={(event) => {
          if (open && event.relatedTarget && !menuRef.current?.contains(event.relatedTarget as Node)) setOpen(false)
        }}
      >
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-l-control sm:flex-none bg-accent px-3 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/85 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {copied ? <Check size={14} /> : <Bot size={14} />}
          {copied ? 'Copied' : 'Copy for agent'}
        </button>
        <button
          ref={triggerRef}
          type="button"
          aria-label="More copy and download options"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-r-control border-l border-accent-foreground/20 bg-accent text-accent-foreground transition-colors hover:bg-accent/85 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <ChevronDown size={13} />
        </button>
        {open && (
          <div
            id={menuId}
            role="menu"
            aria-label="Copy and download options"
            onKeyDown={onMenuKey}
            className="absolute left-0 top-10 z-50 w-56 rounded-section border border-sand-200 bg-sand-50 p-1.5 shadow-2xl dark:border-sand-700 dark:bg-sand-900"
          >
            {items.map((item, index) => (
              <button
                key={item.label}
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  setPngFailed(false)
                  void item.action()
                  close()
                }}
                className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-xs font-semibold text-sand-700 hover:bg-sand-200 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-sand-300 dark:hover:bg-sand-800 dark:hover:text-sand-50"
              >
                <item.icon size={15} aria-hidden />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button type="button" onClick={() => void copyText(jsx)} className={`h-8 ${buttonClasses({ variant: 'outline', size: 'xs' })}`}>
        <Code size={14} />
        Copy JSX
      </button>
      {locked ? (
        <Link href="/pricing" className={`h-8 ${buttonClasses({ variant: 'outline', size: 'xs' })}`}>
          <Download size={14} />
          SVG with Premium
        </Link>
      ) : (
        <button type="button" onClick={() => downloadSvg(name, svg)} className={`h-8 ${buttonClasses({ variant: 'outline', size: 'xs' })}`}>
          <Download size={14} />
          SVG
        </button>
      )}
      {pngFailed && (
        <p role="alert" className="col-span-2 text-xs text-sand-700 sm:basis-full dark:text-sand-300">
          PNG download failed, try again
        </p>
      )}
    </div>
  )
}
