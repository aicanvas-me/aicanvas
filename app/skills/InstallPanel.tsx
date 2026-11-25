'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock } from '@/app/_icons/icons/lock'
import { LogIn } from '@/app/_icons/icons/log-in'
import { CodeBlock, INLINE_CODE, Toast, useToast } from '../mcp/InstallCards'
import { PENDING_INSTALL_TOKEN, useInstallToken } from '../_lib/useInstallToken'
import { copyText } from '../components/useCopied'
import { buttonClasses } from '../components/buttonClasses'
import { CARD, EYEBROW } from '../components/PageKit'
import { useSession } from '../components/auth/SessionProvider'
import { useAuthModal } from '../components/auth/AuthModalProvider'
import { usePremiumStatus } from '../components/billing/usePremiumStatus'
import type { SkillEntry } from './_lib/entries'

// On-screen mask for the account token: the copy carries the real value.
const MASKED_TOKEN = 'aic_••••••••'
const NO_TOKEN = 'aic_YOUR_TOKEN_FROM_ACCOUNT_SETTINGS'

const NOTE = 'text-[13px] leading-relaxed text-sand-600 dark:text-sand-400'
const NOTE_LINK =
  'font-medium text-sand-700 underline underline-offset-2 hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-50'

// A Premium skill installs with the account token: members get the command, everyone else sees it locked.
export function InstallPanel({ entry, id }: { entry: SkillEntry; id: string }) {
  const { user, loading } = useSession()
  const { open } = useAuthModal()
  const status = usePremiumStatus()
  const token = useInstallToken()
  const [copied, setCopied] = useState<'command' | 'prompt' | null>(null)
  const toast = useToast()

  const cmd = `npx -y @aicanvas/mcp@latest skill add ${entry.slug} --token`
  const masked = `${cmd} ${MASKED_TOKEN}`
  const premium = !!user && status === 'premium'
  // Signed in with the plan still loading: show neither the command nor a pitch.
  const pending = !!user && status === 'unknown'
  const locked = !premium && !pending

  const copy = async (which: 'command' | 'prompt', text: string, done: string, noTokenText?: string) => {
    if (!(await copyText(text, noTokenText))) {
      toast.show('Copy failed, try again')
      return
    }
    setCopied(which)
    toast.show(done)
    setTimeout(() => setCopied((c) => (c === which ? null : c)), 2000)
  }

  return (
    <div id={id} className={`${CARD} scroll-mt-24 p-5 sm:p-6`}>
      <h3 className="text-lg font-bold text-sand-900 dark:text-sand-50">Install</h3>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-sand-600 dark:text-sand-400">
        {premium
          ? 'Run this in any terminal. Your token is in it.'
          : pending
            ? 'One command in any terminal.'
            : `${entry.name} comes with AI Canvas Premium. One command installs it with your account token.`}
      </p>

      <div className="mt-5 min-h-[50px]">
        {premium && (
          <CodeBlock
            command={masked}
            label="install command"
            copied={copied === 'command'}
            onCopy={() =>
              copy(
                'command',
                `${cmd} ${token ?? PENDING_INSTALL_TOKEN}`,
                'Install command copied',
                `${cmd} ${NO_TOKEN}`,
              )
            }
          />
        )}
        {locked && (
          <div className="flex items-center justify-between gap-3 rounded-inset border border-sand-200 bg-sand-100 py-3 pl-4 pr-2.5 dark:border-sand-800 dark:bg-sand-900">
            <code
              className="block min-w-0 flex-1 overflow-x-auto py-0.5 font-mono text-sm text-sand-600 dark:text-sand-400"
              style={{ fontVariantLigatures: 'none', fontFeatureSettings: '"liga" 0, "calt" 0' }}
            >
              {masked}
            </code>
            <span className="shrink-0 p-2 text-sand-600 dark:text-sand-400">
              <Lock size={14} aria-hidden />
              <span className="sr-only">Locked: needs AI Canvas Premium</span>
            </span>
          </div>
        )}
      </div>

      {locked && (
        <div className="mt-4 flex flex-wrap gap-3">
          {!user && (
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                open({
                  next: `/skills/${entry.slug}#${id}`,
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
          <Link
            href="/pricing?ref=skill"
            className={buttonClasses({ variant: user ? 'primary' : 'outline', size: 'lg' })}
          >
            See Premium plans
          </Link>
        </div>
      )}

      <p className={`mt-4 ${NOTE}`}>
        It installs into your user-level skills folder for Claude Code or Codex, never into a project. With both
        installed it asks which one, or pass <code className={INLINE_CODE}>--agent claude|codex|all</code>. Run it
        again to update. It stops before overwriting a file you changed.
      </p>

      {entry.tryPrompt && (
        <>
          <p className={`mt-7 mb-2 ${EYEBROW}`}>Then ask</p>
          <CodeBlock
            command={entry.tryPrompt}
            label="prompt"
            multiline
            copied={copied === 'prompt'}
            onCopy={() => copy('prompt', entry.tryPrompt!, 'Prompt copied')}
          />
        </>
      )}

      <p className={`mt-4 ${NOTE}`}>
        {entry.requirements}{' '}
        Licence:{' '}
        <Link href="/premium-license" className={NOTE_LINK}>
          AI Canvas Premium License
        </Link>
        , Section 12.
      </p>

      <Toast message={toast.message} />
    </div>
  )
}
