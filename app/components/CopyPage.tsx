'use client'

import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { CaretDown, Check, Copy, FileText, LinkSimple } from '@phosphor-icons/react'
import { useTopBarInstallSlot } from './PageCrumbs'
import { copyText, useCopied } from './useCopied'

export function CopyPage({ markdown, markdownHref }: { markdown: string; markdownHref: string }) {
  const slot = useTopBarInstallSlot()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { copied, copy } = useCopied(markdown)

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

  if (!slot) return null

  return createPortal(
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex h-8 items-center gap-1.5 rounded-l-lg border border-sand-300 px-3 text-xs font-semibold text-sand-800 hover:border-sand-400 hover:text-sand-900 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-700 dark:text-sand-200 dark:hover:border-sand-600 dark:hover:text-sand-50"
      >
        {copied ? <Check weight="regular" size={14} /> : <Copy weight="regular" size={14} />}
        {copied ? 'Copied' : 'Copy page'}
      </button>
      <button
        type="button"
        aria-label="Copy page options"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-r-lg border border-l-0 border-sand-300 text-sand-700 hover:border-sand-400 hover:text-sand-900 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-700 dark:text-sand-300 dark:hover:border-sand-600 dark:hover:text-sand-50"
      >
        <CaretDown weight="regular" size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-sand-200 bg-sand-50 p-1.5 shadow-2xl dark:border-sand-700 dark:bg-sand-900">
          <button
            type="button"
            onClick={() => {
              void copyText(markdown)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-sand-700 hover:bg-sand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:text-sand-300 dark:hover:bg-sand-800"
          >
            <Copy weight="regular" size={15} />
            Copy as Markdown
          </button>
          <Link
            href={markdownHref}
            target="_blank"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-sand-700 hover:bg-sand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:text-sand-300 dark:hover:bg-sand-800"
          >
            <FileText weight="regular" size={15} />
            View as Markdown
          </Link>
          <button
            type="button"
            onClick={() => {
              void copyText(window.location.href)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-sand-700 hover:bg-sand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:text-sand-300 dark:hover:bg-sand-800"
          >
            <LinkSimple weight="regular" size={15} />
            Copy link
          </button>
        </div>
      )}
    </div>,
    slot,
  )
}

