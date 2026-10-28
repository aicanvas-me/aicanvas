'use client'

import { useState } from 'react'
import { iconImportLine, iconInstallCommand, iconJsxLine } from '../_lib/constants'
import { buildSvg } from '../_lib/svg'
import type { IconStyle } from '../_lib/types'

type CodeTab = 'React' | 'SVG' | 'Install'

export function CodeTabs({
  name,
  markup,
  size,
  strokeWidth,
  colour,
  style,
  className = '',
}: {
  name: string
  markup: string
  size: number
  strokeWidth: number
  colour: string
  style: IconStyle
  className?: string
}) {
  const [tab, setTab] = useState<CodeTab>('React')
  const code =
    tab === 'React'
      ? `${iconImportLine(name)}\n\n${iconJsxLine(name, size, strokeWidth, style)}`
      : tab === 'SVG'
        ? buildSvg(markup, size, strokeWidth, colour)
        : iconInstallCommand(name)

  return (
    <section className={`overflow-hidden rounded-xl border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950 ${className}`}>
      <div role="tablist" aria-label="Code format" className="flex items-center gap-1 px-2 pt-2">
        {(['React', 'SVG', 'Install'] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={tab === option}
            onClick={() => setTab(option)}
            className={`h-8 border-b-2 px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
              tab === option
                ? 'border-olive-500 text-sand-900 dark:text-sand-50'
                : 'border-transparent text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-words px-4 py-4 font-mono text-[12px] leading-6 text-sand-800 dark:text-sand-200">
        <code>{code}</code>
      </pre>
    </section>
  )
}

