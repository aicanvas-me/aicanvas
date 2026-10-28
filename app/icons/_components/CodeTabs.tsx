'use client'

import { useState } from 'react'
import { iconImportLine, iconInstallCommand, iconJsxLine } from '../_lib/constants'
import { buildSvg } from '../_lib/svg'
import type { IconStyle } from '../_lib/types'

type CodeTab = 'React' | 'SVG' | 'Install'

const TOKEN_RE = /(import|from)|('[^'\n]*'|"[^"\n]*")|(<\/?[A-Za-z][\w-]*)|([A-Za-z_:][\w:.-]*)(?==)|(\{[\d.]+\})|(\/?>)/g

function SyntaxCode({ code, enabled }: { code: string; enabled: boolean }) {
  if (!enabled) return <>{code}</>
  const parts = code.split(TOKEN_RE)
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null
        let tone = ''
        if (part === 'import' || part === 'from') tone = 'text-[#7c3aed] dark:text-[#c4a7ff]'
        else if (/^['"]/.test(part)) tone = 'text-olive-700 dark:text-olive-300'
        else if (/^<\/?[A-Za-z]/.test(part)) tone = 'text-[#2563eb] dark:text-[#7dd3fc]'
        else if (/^[A-Za-z_:][\w:.-]*$/.test(part)) tone = 'text-[#a14b0b] dark:text-[#f0ab70]'
        else if (/^\{[\d.]+\}$/.test(part)) tone = 'text-[#c2410c] dark:text-[#f59e8b]'
        else if (/^\/?\>$/.test(part)) tone = 'text-[#2563eb] dark:text-[#7dd3fc]'
        return <span key={`${index}-${part}`} className={tone}>{part}</span>
      })}
    </>
  )
}

export function CodeTabs({
  name,
  markup,
  size,
  strokeWidth,
  colour,
  style,
  className = '',
  compact = false,
}: {
  name: string
  markup: string
  size: number
  strokeWidth: number
  colour: string
  style: IconStyle
  className?: string
  compact?: boolean
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
      <div role="tablist" aria-label="Code format" className={`flex items-center gap-1 px-2 ${compact ? 'pt-1' : 'pt-2'}`}>
        {(['React', 'SVG', 'Install'] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={tab === option}
            onClick={() => setTab(option)}
            className={`${compact ? 'h-7' : 'h-8'} border-b-2 px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
              tab === option
                ? 'border-olive-500 text-sand-900 dark:text-sand-50'
                : 'border-transparent text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <pre className={`${compact ? 'max-h-[86px] px-3 py-2 text-[11px] leading-5' : 'max-h-36 px-4 py-4 text-[12px] leading-6'} overflow-auto whitespace-pre-wrap break-words font-mono text-sand-800 dark:text-sand-200`}>
        <code><SyntaxCode code={code} enabled={tab !== 'Install'} /></code>
      </pre>
    </section>
  )
}
