'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogIn } from '@/app/_icons/icons/log-in'
import { CodeBlock, Toast, useToast } from '../mcp/InstallCards'
import { copyText } from '../components/useCopied'
import { buttonClasses } from '../components/buttonClasses'
import { CARD, EYEBROW } from '../components/PageKit'
import { useSession } from '../components/auth/SessionProvider'
import { useAuthModal } from '../components/auth/AuthModalProvider'
import type { SkillEntry } from './_lib/entries'

// Premium skills install from the account, so the card asks for a sign-in first.
export function InstallPanel({ entry, id }: { entry: SkillEntry; id: string }) {
  const { user, loading } = useSession()
  const { open } = useAuthModal()
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  const copyPrompt = async () => {
    if (!entry.tryPrompt || !(await copyText(entry.tryPrompt))) return
    setCopied(true)
    toast.show('Prompt copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div id={id} className={`${CARD} scroll-mt-24 p-5 sm:p-6`}>
      <h3 className="text-lg font-bold text-sand-900 dark:text-sand-50">Install</h3>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-sand-600 dark:text-sand-400">
        {user
          ? `You are signed in. ${entry.name} installs from your account with AI Canvas Premium.`
          : `${entry.name} comes with AI Canvas Premium. Sign in and it installs in your agent from your account.`}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        {!user && (
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              open({
                next: `/skills#${id}`,
                title: `Install ${entry.name}.`,
                subtitle: `Sign in to install ${entry.name} in your agent.`,
              })
            }
            className={buttonClasses({ variant: 'primary', size: 'lg' })}
          >
            <LogIn size={14} />
            Sign in to install
          </button>
        )}
        <Link href="/pricing" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
          See Premium plans
        </Link>
      </div>

      {entry.tryPrompt && (
        <>
          <p className={`mt-7 mb-2 ${EYEBROW}`}>Then ask</p>
          <CodeBlock command={entry.tryPrompt} label="prompt" multiline copied={copied} onCopy={copyPrompt} />
        </>
      )}

      {entry.requirements && (
        <p className="mt-4 text-[13px] leading-relaxed text-sand-600 dark:text-sand-400">{entry.requirements}</p>
      )}

      <Toast message={toast.message} />
    </div>
  )
}
