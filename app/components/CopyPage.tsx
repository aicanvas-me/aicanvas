'use client'

import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from '@/app/_icons/icons/chevron-down'
import { Check } from '@/app/_icons/icons/check'
import { Copy } from '@/app/_icons/icons/copy'
import { FileText } from '@/app/_icons/icons/file-text'
import { LinkSimple } from '@/app/_icons/icons/link-simple'
import { useTopBarInstallSlot } from './PageCrumbs'
import { copyText } from './useCopied'

// The page's Markdown, or a function that builds it at the moment of the click
// (the docs read their own rendered article, so the copy is never stale).
type MarkdownSource = string | (() => string)
const read = (source: MarkdownSource) => (typeof source === 'function' ? source() : source)

const ITEM =
  'flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-xs font-semibold text-sand-700 hover:bg-sand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-sand-300 dark:hover:bg-sand-800'

// The split "Copy page" button, drawn where it is placed. Without a
// `markdownHref`, "View as Markdown" opens the copied text in a new tab.
export function CopyPageButton({ markdown, markdownHref }: { markdown: MarkdownSource; markdownHref?: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  const copy = async () => {
    if (!(await copyText(read(markdown)))) return
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const viewText = () => {
    const url = URL.createObjectURL(new Blob([read(markdown)], { type: 'text/plain;charset=utf-8' }))
    window.open(url, '_blank', 'noopener')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
    setOpen(false)
  }

  return (
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex h-8 items-center gap-1.5 rounded-l-control border border-sand-300 px-3 text-xs font-semibold text-sand-800 hover:border-sand-400 hover:text-sand-900 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-sand-700 dark:text-sand-200 dark:hover:border-sand-600 dark:hover:text-sand-50"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy page'}
      </button>
      <button
        type="button"
        aria-label="Copy page options"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-r-control border border-l-0 border-sand-300 text-sand-700 hover:border-sand-400 hover:text-sand-900 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-sand-700 dark:text-sand-300 dark:hover:border-sand-600 dark:hover:text-sand-50"
      >
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-52 rounded-section border border-sand-200 bg-sand-50 p-1.5 shadow-2xl dark:border-sand-700 dark:bg-sand-900">
          <button
            type="button"
            onClick={() => {
              void copyText(read(markdown))
              setOpen(false)
            }}
            className={ITEM}
          >
            <Copy size={15} />
            Copy as Markdown
          </button>
          {markdownHref ? (
            <Link href={markdownHref} target="_blank" onClick={() => setOpen(false)} className={ITEM}>
              <FileText size={15} />
              View as Markdown
            </Link>
          ) : (
            <button type="button" onClick={viewText} className={ITEM}>
              <FileText size={15} />
              View as Markdown
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              void copyText(window.location.href)
              setOpen(false)
            }}
            className={ITEM}
          >
            <LinkSimple size={15} />
            Copy link
          </button>
        </div>
      )}
    </div>
  )
}

// The catalog pages' placement: the right end of the crumb line above the title.
export function CopyPage({ markdown, markdownHref }: { markdown: string; markdownHref: string }) {
  const slot = useTopBarInstallSlot()
  if (!slot) return null
  return createPortal(<CopyPageButton markdown={markdown} markdownHref={markdownHref} />, slot)
}
