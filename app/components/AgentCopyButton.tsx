'use client'

import { useEffect, useId, useRef, useState, type ComponentType, type KeyboardEvent } from 'react'
import { Bot } from '@/app/_icons/icons/bot'
import { Check } from '@/app/_icons/icons/check'
import { ChevronDown } from '@/app/_icons/icons/chevron-down'

export interface AgentCopyItem {
  label: string
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
  /** Resolves true once the text is on the clipboard; false when a gate opened instead. */
  run: () => Promise<boolean>
}

// The split "Copy for agent" button: the main half copies the agent steps, the
// caret lists the pieces (install command, import line). Same look as the icon pages.
export function AgentCopyButton({ onCopy, items }: { onCopy: () => Promise<boolean>; items: AgentCopyItem[] }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()
  const all: AgentCopyItem[] = [{ label: 'Copy for agent', icon: Bot, run: onCopy }, ...items]

  const flash = (ok: boolean) => {
    if (!ok) return
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  const onMenuKey = (event: KeyboardEvent) => {
    const index = itemRefs.current.indexOf(document.activeElement as HTMLButtonElement)
    const last = all.length - 1
    const targets: Record<string, number> = {
      ArrowDown: index >= last ? 0 : index + 1,
      ArrowUp: index <= 0 ? last : index - 1,
      Home: 0,
      End: last,
    }
    if (!(event.key in targets)) return
    itemRefs.current[targets[event.key]]?.focus()
    event.preventDefault()
  }

  return (
    <div
      ref={menuRef}
      className="relative inline-flex"
      onBlur={(event) => {
        if (open && event.relatedTarget && !menuRef.current?.contains(event.relatedTarget as Node)) setOpen(false)
      }}
    >
      <button
        type="button"
        onClick={() => void onCopy().then(flash)}
        className="inline-flex h-8 items-center gap-1.5 rounded-l-control bg-accent px-3 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/85 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {copied ? <Check size={14} /> : <Bot size={14} />}
        {copied ? 'Copied' : 'Copy for agent'}
      </button>
      <button
        ref={triggerRef}
        type="button"
        aria-label="More copy options"
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
          aria-label="Copy options"
          onKeyDown={onMenuKey}
          className="absolute right-0 top-10 z-50 w-56 rounded-section border border-sand-200 bg-sand-50 p-1.5 shadow-2xl dark:border-sand-700 dark:bg-sand-900"
        >
          {all.map((item, index) => (
            <button
              key={item.label}
              ref={(node) => {
                itemRefs.current[index] = node
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                setOpen(false)
                void item.run().then((ok) => index === 0 && flash(ok))
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
  )
}
