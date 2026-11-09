'use client'

import { useState } from 'react'
import { Check } from '@/app/_icons/icons/check'
import { CopyIcon } from '@/app/_icons/icons/copy'
import { copyText } from '@/app/components/useCopied'

const RUNNERS = { pnpm: 'pnpm dlx', npm: 'npx', yarn: 'yarn dlx', bun: 'bunx' }

export function ManualIconsCommand({
  items,
  pkgManager,
  token,
  onBlocked,
}: {
  items: string[]
  pkgManager: keyof typeof RUNNERS
  token: string | null
  onBlocked?: () => void
}) {
  const [copied, setCopied] = useState(false)
  if (!items.length) return null

  const command = (t: string | null) =>
    `${RUNNERS[pkgManager]} shadcn@latest add ${items
      .map((item) => (t ? `"https://aicanvas.me/r/${item}.json?token=${t}"` : `@aicanvas/${item}`))
      .join(' ')}`

  async function copy() {
    if (onBlocked) { onBlocked(); return }
    if (!(await copyText(command(token)))) return
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <p className="mb-2.5 mt-4 text-sm text-sand-600 dark:text-sand-400">Add the icons it uses:</p>
      <div className="flex items-center justify-between gap-3 rounded-inset bg-sand-200 px-4 py-3 dark:bg-sand-950">
        <code className="min-w-0 break-all font-mono text-sm text-sand-700 dark:text-sand-300">
          {command(token && 'aic_••••••••')}
        </code>
        <button
          onClick={copy}
          aria-label="Copy icons install command"
          className="shrink-0 rounded-control p-1.5 text-sand-600 transition-all hover:text-sand-800 active:scale-90 dark:text-sand-500 dark:hover:text-sand-200"
        >
          {copied ? <Check size={14} className="text-success" /> : <CopyIcon size={14} />}
        </button>
      </div>
    </>
  )
}
