'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Check, Copy, Lightning } from '@phosphor-icons/react'
import { useSession } from '../components/auth/SessionProvider'
import { usePremiumStatus } from '../components/billing/usePremiumStatus'
import { INSTALL_CONTENTS } from '../lib/install-contents.generated'

// The two packages, as a toggle (the "two actions"). Everything is the default.
const PACKAGES = [
  { slug: 'andromeda-all', label: 'Everything' },
  { slug: 'andromeda', label: 'All components' },
]

// AI Canvas site tokens as --si-* variables, light by default and dark under
// the site's `dark` class, matching the brain's "Get the brain" card.
const PALETTE = {
  light: {
    'surface-base': '#F4F4FA', 'surface-raised': '#EEEEF3',
    'text-primary': '#1B1B1C', 'text-secondary': '#575759', 'text-faint': '#7B7B7D',
    'accent-400': '#A8B94D', 'accent-300': '#869631', 'accent-on': '#0E0E0F',
    'border-subtle': '#DFDFE3', 'border-base': '#CACACD',
  },
  dark: {
    'surface-base': '#0E0E0F', 'surface-raised': '#1B1B1C',
    'text-primary': '#F4F4FA', 'text-secondary': '#9B9B9E', 'text-faint': '#7B7B7D',
    'accent-400': '#A8B94D', 'accent-300': '#DAE4A0', 'accent-on': '#0E0E0F',
    'border-subtle': '#2D2D2E', 'border-base': '#373738',
  },
} as const
type CardColor = keyof typeof PALETTE.dark
const v = (k: CardColor) => `var(--si-${k})`
const cardVars = (t: 'light' | 'dark') => (Object.keys(PALETTE[t]) as CardColor[]).map((k) => `--si-${k}: ${PALETTE[t][k]};`).join(' ')
const C = {
  surface: { base: v('surface-base'), raised: v('surface-raised') },
  text: { primary: v('text-primary'), secondary: v('text-secondary'), faint: v('text-faint') },
  accent: { 400: v('accent-400'), 300: v('accent-300'), on: v('accent-on') },
  border: { subtle: v('border-subtle'), base: v('border-base') },
}
const SANS = "var(--font-sans), 'Manrope', system-ui, sans-serif"
const MONO = "var(--font-mono, var(--font-jetbrains-mono)), 'Geist Mono', monospace"

// Bottom-of-page install card for the showcase — the same shape as the brain's
// "Get the brain" card, but with the two packages (All components / Everything)
// as a toggle. Premium-gated: a resolved free/anon tier sees an Unlock CTA.
export function ShowcaseInstallCard() {
  const { user } = useSession()
  const status = usePremiumStatus()
  // Premium AND the in-flight 'unknown' window see the command; only a resolved
  // free/anon tier sees the Unlock pitch (never flash upsell at a subscriber).
  const canInstall = status !== 'not-premium'
  const [slug, setSlug] = useState('andromeda-all')
  const [copied, setCopied] = useState(false)

  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    if (!user) return
    let cancelled = false
    const refresh = () =>
      fetch('/api/me/token')
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setToken(d?.token ?? null)
        })
        .catch(() => {})
    refresh()
    window.addEventListener('focus', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('focus', refresh)
    }
  }, [user])
  const userToken = user ? token : null
  const reference = (masked: boolean) =>
    userToken
      ? `"https://aicanvas.me/r/${slug}.json?token=${masked ? 'aic_••••••••' : userToken}"`
      : `@aicanvas/${slug}`
  const cliCommand = `npx shadcn@latest add ${reference(false)}`
  const cliCommandMasked = `npx shadcn@latest add ${reference(true)}`
  const bullets = INSTALL_CONTENTS[slug] ?? []

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cliCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }, [cliCommand])

  return (
    <div
      className="si-card"
      style={{
        margin: '48px 0 0',
        border: `1px solid ${C.border.subtle}`,
        borderRadius: 12,
        background: C.surface.raised,
        padding: '18px 20px',
        fontFamily: SANS,
      }}
    >
      <style>{`.si-card{${cardVars('light')}}.dark .si-card{${cardVars('dark')}}.si-dl{transition:background .12s}.si-dl:hover{background:${C.accent[300]} !important}`}</style>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.text.primary, marginBottom: 12 }}>
        Get the system
      </div>

      {/* Tabs — the CLI/Manual pattern: active is bright + underlined, inactive
          muted; switching changes colour and keeps the underline. */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border.base}`, marginBottom: 16 }}>
        {PACKAGES.map((p) => {
          const active = p.slug === slug
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => {
                setSlug(p.slug)
                setCopied(false)
              }}
              style={{
                position: 'relative',
                padding: '9px 14px',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: SANS,
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                color: active ? C.text.primary : C.text.faint,
                transition: 'color .12s',
              }}
            >
              {p.label}
              {active && (
                <span
                  style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, background: C.text.primary }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Contents — always shown (a preview for non-premium too). */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {bullets.map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Check weight="bold" size={13} color={C.accent[400]} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 13, lineHeight: 1.5, color: C.text.secondary }}>{line}</span>
          </div>
        ))}
      </div>

      {canInstall ? (
        <>
          <div
            style={{
              background: C.surface.base,
              border: `1px solid ${C.border.subtle}`,
              borderRadius: 8,
              padding: '10px 12px',
              overflowX: 'auto',
              marginBottom: 12,
            }}
          >
            <code style={{ fontFamily: MONO, fontSize: 12, color: C.text.secondary, whiteSpace: 'nowrap' }}>
              {cliCommandMasked}
            </code>
          </div>
          <button
            type="button"
            className="si-dl"
            onClick={copy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: C.accent[400],
              color: C.accent.on,
              fontWeight: 600,
              fontSize: 13,
              fontFamily: SANS,
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check weight="regular" size={14} /> : <Copy weight="regular" size={14} />}
            {copied ? 'Copied' : 'Copy CLI'}
          </button>
        </>
      ) : (
        <Link
          href="/pricing"
          className="si-dl"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: C.accent[400],
            color: C.accent.on,
            fontWeight: 600,
            fontSize: 13,
            fontFamily: SANS,
            padding: '8px 14px',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          <Lightning weight="regular" size={14} />
          Unlock with Premium
        </Link>
      )}
    </div>
  )
}
