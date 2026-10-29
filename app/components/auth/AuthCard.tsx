'use client'

import type { ReactNode, Ref } from 'react'
import { X } from '@phosphor-icons/react'
import { Button } from '../Button'
import { AsciiArt } from './AsciiArt'

// ─── AuthCard ────────────────────────────────────────────────────────────────
// The one card every sign-in surface sits in: the in-app AuthModal and the
// standalone /account pages. On a laptop it is two layers, the same as a
// component page's preview frame: the art in its own inset card on the left,
// 8px from the shell so its 16px corners run parallel to the shell's 24, and
// the form on the right. A phone drops the art and keeps the form, which is
// what has to fit above the keyboard.
//
// The art panel is at least 480px tall, so the short gate screen still gives
// the mark room; a longer form grows the card and the art with it.

export function AuthCard({
  children,
  onClose,
  className = '',
  ref,
}: {
  children: ReactNode
  onClose: () => void
  className?: string
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={ref}
      className={`relative w-full max-w-md rounded-section border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900 md:grid md:max-w-[880px] md:grid-cols-2 md:p-2 ${className}`}
    >
      <div className="relative hidden min-h-[480px] overflow-hidden rounded-card border border-sand-200 bg-sand-50 text-sand-900 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-100 md:block">
        <AsciiArt subject="mark" />
      </div>
      <div className="flex flex-col justify-center p-8 sm:p-10 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
      <Button
        variant="icon"
        size="md"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 md:right-4 md:top-4"
      >
        <X weight="regular" size={18} />
      </Button>
    </div>
  )
}

/** The headline every auth screen opens with, in place of an illustration. */
export function AuthHeading({ title, subtitle, as: Tag = 'h1' }: { title: ReactNode; subtitle?: ReactNode; as?: 'h1' | 'h2' }) {
  return (
    <div>
      <Tag className="text-2xl font-bold leading-tight tracking-tight text-sand-900 dark:text-sand-50">{title}</Tag>
      {subtitle && <p className="mt-2 text-sm leading-relaxed text-sand-600 dark:text-sand-400">{subtitle}</p>}
    </div>
  )
}
