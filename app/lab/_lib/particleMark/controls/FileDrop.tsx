'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Image as ImageIcon } from '@phosphor-icons/react'

interface FileDropProps {
  accept: string
  onFile: (file: File) => void
  fileName?: string | null
  onClear?: () => void
}

export function FileDrop({ accept, onFile, fileName, onClear }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return
      // Accept-list is informational; we still pass the file through so
      // the caller can decide what to do with mismatched types.
      onFile(file)
    },
    [onFile],
  )

  // Clipboard paste — listen globally so the user can ⌘V anywhere on page.
  useEffect(() => {
    const ACCEPTED_RX = /\.(svg|png|jpe?g|webp)$/i
    const ACCEPTED_TYPES = new Set([
      'image/svg+xml',
      'image/png',
      'image/jpeg',
      'image/webp',
    ])
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file') {
          const f = item.getAsFile()
          if (f && (ACCEPTED_TYPES.has(f.type) || ACCEPTED_RX.test(f.name))) {
            handleFile(f)
            return
          }
        }
        if (item.kind === 'string' && item.type === 'text/plain') {
          item.getAsString((str) => {
            const trimmed = str.trim()
            if (trimmed.startsWith('<svg')) {
              const fakeFile = new File([trimmed], 'pasted.svg', { type: 'image/svg+xml' })
              handleFile(fakeFile)
            }
          })
        }
      }
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [handleFile])

  if (fileName) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-sand-300 bg-sand-100 px-3 py-1.5 dark:border-sand-700 dark:bg-sand-800">
        <span className="truncate text-xs text-sand-700 dark:text-sand-300" title={fileName}>
          {fileName}
        </span>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear file"
          className="rounded-full p-0.5 text-sand-500 hover:bg-sand-200 hover:text-sand-800 dark:hover:bg-sand-700 dark:hover:text-sand-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handleFile(e.dataTransfer.files?.[0])
      }}
      className={`flex w-full items-center gap-2.5 rounded-lg border border-dashed px-3 py-2.5 text-left text-xs transition-colors ${
        dragOver
          ? 'border-olive-500 bg-olive-500/10 text-sand-800 dark:text-sand-100'
          : 'border-sand-400 bg-sand-100/40 text-sand-600 hover:border-sand-500 hover:bg-sand-100 dark:border-sand-700 dark:bg-sand-800/40 dark:text-sand-400 dark:hover:border-sand-600 dark:hover:bg-sand-800/80'
      }`}
    >
      <ImageIcon size={16} weight="regular" className="shrink-0" />
      <span className="flex-1">Pick file or drop on canvas</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </button>
  )
}
