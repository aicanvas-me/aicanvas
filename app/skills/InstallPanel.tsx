'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from '@/app/_icons/icons/external-link'
import { CodeBlock, Toast, useToast } from '../mcp/InstallCards'
import { copyText } from '../components/useCopied'
import { buttonClasses } from '../components/buttonClasses'
import { CARD, EYEBROW } from '../components/PageKit'
import { Step } from '../components/Step'
import type { SkillEntry } from './_lib/entries'

export function InstallPanel({ entry, id }: { entry: SkillEntry; id: string }) {
  const [tab, setTab] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)
  const toast = useToast()

  const copy = async (text: string, message: string) => {
    if (!(await copyText(text))) return
    setCopied(text)
    toast.show(message)
    setTimeout(() => setCopied((c) => (c === text ? null : c)), 2000)
  }

  const commands = entry.install[tab]?.commands ?? []

  return (
    <div id={id} className={`${CARD} scroll-mt-24 p-5 sm:p-6`}>
      <h3 className="text-lg font-bold text-sand-900 dark:text-sand-50">Install</h3>

      <div role="tablist" aria-label="Where to install" className="isolate mt-4 flex gap-1.5 rounded-control bg-sand-50/70 p-1 dark:bg-sand-950">
        {entry.install.map((t, i) => {
          const active = i === tab
          return (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(i)}
              className={`relative min-w-0 flex-1 rounded-control px-2 py-2 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:text-sm ${
                active
                  ? 'text-sand-900 dark:text-sand-50'
                  : 'text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100'
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`${id}-tab`}
                  className="absolute inset-0 rounded-control bg-sand-100 shadow-sm ring-1 ring-sand-300 dark:bg-sand-800 dark:ring-sand-700"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          )
        })}
      </div>

      <div role="tabpanel" className="mt-4">
        {commands.length > 1 ? (
          <div className="space-y-6">
            {commands.map((c, i) => (
              <Step key={c} number={i + 1} isLast={i === commands.length - 1}>
                <CodeBlock command={c} label="command" copied={copied === c} onCopy={() => copy(c, 'Command copied')} />
              </Step>
            ))}
          </div>
        ) : (
          commands.map((c) => (
            <CodeBlock key={c} command={c} label="command" copied={copied === c} onCopy={() => copy(c, 'Command copied')} />
          ))
        )}
      </div>

      {entry.tryPrompt && (
        <>
          <p className={`mt-6 mb-2 ${EYEBROW}`}>Then ask</p>
          <CodeBlock
            command={entry.tryPrompt}
            label="prompt"
            multiline
            copied={copied === entry.tryPrompt}
            onCopy={() => copy(entry.tryPrompt!, 'Prompt copied')}
          />
        </>
      )}

      {entry.requirements && (
        <p className="mt-4 text-[13px] leading-relaxed text-sand-600 dark:text-sand-400">{entry.requirements}</p>
      )}

      {entry.repo && (
        <a
          href={entry.repo}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-5 w-full ${buttonClasses({ variant: 'outline', size: 'md' })}`}
        >
          View on GitHub
          <ExternalLink size={14} />
        </a>
      )}

      <Toast message={toast.message} />
    </div>
  )
}
