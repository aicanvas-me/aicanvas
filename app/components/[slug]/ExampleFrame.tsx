'use client'

import type { ReactNode } from 'react'

export function ExampleFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 text-sm font-semibold text-sand-900 dark:text-sand-50">{title}</figcaption>
      <div data-preview-fullscreen className="flex min-h-40 items-center justify-center overflow-hidden rounded-card border border-sand-200 bg-sand-50 p-4 sm:p-8 dark:border-sand-800 dark:bg-sand-950">
        {children}
      </div>
    </figure>
  )
}
