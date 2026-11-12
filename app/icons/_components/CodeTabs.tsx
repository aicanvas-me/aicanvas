'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { iconImportLine, iconInstallCommand, iconJsxLine, MASKED_INSTALL_TOKEN, PREMIUM_ICON_INSTALL_NOTE } from '../_lib/constants'
import type { IconWeight } from '../_lib/icon-utils'
import { isPreview } from '../_lib/preview'
import { buildSvg } from '../_lib/svg'
import type { IconStyle } from '../_lib/types'
import { useInstallGate } from './useInstallGate'

type CodeTab = 'React' | 'SVG' | 'Install'
const TABS: CodeTab[] = ['React', 'SVG', 'Install']

const TOKEN_RE = /(import|from)|('[^'\n]*'|"[^"\n]*")|(<\/?[A-Za-z][\w-]*)|([A-Za-z_:][\w:.-]*)(?==)|(\{[\d.]+\})|(\/?>)/g

function Token({ part }: { part: string }) {
  let tone = ''
  if (part === 'import' || part === 'from') tone = 'text-[#7c3aed] dark:text-[#c4a7ff]'
  else if (/^['"]/.test(part)) tone = 'text-accent'
  else if (/^<\/?[A-Za-z]/.test(part)) tone = 'text-[#2563eb] dark:text-[#7dd3fc]'
  else if (/^[A-Za-z_:][\w:.-]*$/.test(part)) tone = 'text-[#a14b0b] dark:text-[#f0ab70]'
  else if (/^\{[\d.]+\}$/.test(part)) tone = 'text-[#c2410c] dark:text-[#f59e8b]'
  else if (/^\/?\>$/.test(part)) tone = 'text-[#2563eb] dark:text-[#7dd3fc]'
  return <span className={tone}>{part}</span>
}

function SyntaxCode({ code, enabled }: { code: string; enabled: boolean }) {
  if (!enabled) return <>{code}</>
  const parts = code.split(TOKEN_RE).filter(Boolean)
  const out: ReactNode[] = []
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index]
    // An attribute keeps its value on its line: on a phone the browser would
    // otherwise wrap between `size=` and `{24}`.
    if (parts[index + 1] === '=' && /^\{[\d.]+\}$/.test(parts[index + 2] ?? '')) {
      out.push(
        <span key={index} className="whitespace-nowrap">
          <Token part={part} />=<Token part={parts[index + 2]} />
        </span>,
      )
      index += 2
    } else {
      out.push(<Token key={index} part={part} />)
    }
  }
  return <>{out}</>
}

export function CodeTabs({
  name,
  markup,
  size,
  weight,
  colour,
  style,
  className = '',
  compact = false,
  installToken,
  exportReady = true,
}: {
  name: string
  markup: string
  size: number
  weight: IconWeight
  // the user's pick, null for none
  colour: string | null
  style: IconStyle
  className?: string
  compact?: boolean
  installToken?: string | null
  exportReady?: boolean
}) {
  const [tab, setTab] = useState<CodeTab>('React')
  const id = useId()
  const gate = useInstallGate(style)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const code =
    tab === 'React'
      ? `${iconImportLine(name, style)}\n\n${iconJsxLine(name, size, weight, style, colour)}`
      : tab === 'SVG'
        ? isPreview(markup)
          ? exportReady
            ? 'The SVG of this style comes with AI Canvas Premium.'
            : 'The SVG of this style has not loaded.'
          : buildSvg(markup, size, weight, colour, style)
        : gate.masked
          ? 'npx shadcn@latest add @aicanvas/'
          : iconInstallCommand(name, style, installToken && MASKED_INSTALL_TOKEN)

  const onKey = (event: KeyboardEvent, index: number) => {
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % TABS.length,
      ArrowLeft: (index - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    }
    if (!(event.key in targets)) return
    event.preventDefault()
    setTab(TABS[targets[event.key]])
    tabRefs.current[targets[event.key]]?.focus()
  }

  return (
    <section className={`overflow-hidden rounded-card border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950 ${className}`}>
      <div role="tablist" aria-label="Code format" className={`flex items-center gap-1 px-2 ${compact ? 'pt-1' : 'pt-2'}`}>
        {TABS.map((option, index) => (
          <button
            key={option}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            id={`${id}-tab-${option}`}
            type="button"
            role="tab"
            aria-selected={tab === option}
            aria-controls={`${id}-panel`}
            tabIndex={tab === option ? 0 : -1}
            onClick={() => setTab(option)}
            onKeyDown={(event) => onKey(event, index)}
            className={`${compact ? 'h-7' : 'h-8'} border-b-2 px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
              tab === option
                ? 'border-accent text-sand-900 dark:text-sand-50'
                : 'border-transparent text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {/* The panel is the scroller and takes focus, so the keyboard can scroll long SVG code. */}
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${tab}`}
        tabIndex={0}
        className={`${compact ? 'max-h-[86px]' : 'max-h-44 sm:max-h-36'} overflow-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40`}
      >
        <pre className={`${compact ? 'px-3 py-2 text-[11px] leading-5' : 'px-4 py-4 text-[12px] leading-6'} whitespace-pre-wrap break-words font-mono text-sand-800 dark:text-sand-200`}>
          <code>
            <SyntaxCode code={code} enabled={tab !== 'Install' && !(tab === 'SVG' && isPreview(markup))} />
            {tab === 'Install' && gate.masked && (
              <>
                <span aria-hidden>{'•'.repeat(12)}</span>
                <span className="sr-only">icon name, shown with Premium</span>
              </>
            )}
          </code>
        </pre>
        {tab === 'Install' && gate.masked && (
          <p className={`${compact ? 'px-3 pb-2' : 'px-4 pb-4'} text-xs text-sand-600 dark:text-sand-400`}>
            {PREMIUM_ICON_INSTALL_NOTE}
          </p>
        )}
      </div>
    </section>
  )
}
