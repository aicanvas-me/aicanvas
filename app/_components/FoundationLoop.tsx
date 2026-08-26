// @ts-nocheck — consumes untyped design-system tokens + uses JS-style block
// helpers (no prop types), same posture as its source AndromedaOverview.tsx
// and andromeda-demos.tsx. Strip after a proper typing pass on design-systems/.
'use client'

// A looping window into Andromeda's foundation. Cycles four blocks — Colors →
// Tokens → Type → Spacing — each lifted straight from the showcase's
// foundation sections. Per block: rows slide up from below with a stagger,
// hold ~1s, then exit upward as the next block enters. Decorative
// (pointer-events-none), so it drops into any sized, position:relative
// container. Honors prefers-reduced-motion (freezes on Colors, no transforms).
//
// Shared by the Andromeda overview page's "System" card and the homepage
// Andromeda spotlight — extracted so both render the exact same preview
// instead of drifting copies. Renders in Andromeda's own visual language
// (surface.base void, JetBrains Mono, blue/orange/red scales), not the
// site's sand/olive tokens — intentional, since this IS a preview of the
// system.

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion'
import { tokens } from '../lib/andromeda-v2.generated'
import { useResolvedVars } from '../lib/andromeda-v2-helpers.generated'

const C = tokens.color
const FONT = tokens.typography.fontMono

// Every colour here goes through the theme channel: `var(--at-<name>, <dark>)`.
// With no light ancestor the fallback resolves and this renders exactly as it
// always did (the homepage spotlight has no wrap and never changes); under the
// Andromeda theme wrap on the system landing, the same loop follows the toggle.
const at = (name, value) => `var(--at-${name}, ${value})`

// Module scope: `vars` is a useEffect dep inside useResolvedVars, so a fresh
// object per render would resubscribe the observer every frame.
function swatchRow(label, family) {
  const stops = [100, 200, 300, 400, 500]
  return {
    label,
    items: stops.map((stop) => ({ key: `${family}-${stop}`, value: C[family][stop] })),
    vars: Object.fromEntries(stops.map((stop) => [`${family}-${stop}`, `--at-${family}-${stop}`])),
  }
}

const SWATCH_ROWS = [
  swatchRow('Accent · Blue', 'accent'),
  swatchRow('Warning · Amber', 'warning'),
  swatchRow('Danger · Fault', 'danger'),
]

const rowV = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -18, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
}
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
  exit: { transition: { staggerChildren: 0.04 } },
}

function FKicker({ children }) {
  return (
    <motion.div
      variants={rowV}
      style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: at('text-muted', C.text.muted), marginBottom: 16 }}
    >
      {children}
    </motion.div>
  )
}

// The chip paints the channel and the caption prints what that resolved to, so
// both halves stay the same fact in either theme.
function FSwatchRow({ row }) {
  const hostRef = useRef(null)
  const live = useResolvedVars(hostRef, row.vars)

  return (
    <motion.div ref={hostRef} variants={rowV} style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: at('text-faint', C.text.faint), marginBottom: 6 }}>{row.label}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {row.items.map(({ key, value }) => (
          <div key={key} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ height: 26, background: at(key, value), border: `1px solid ${at('border-base', C.border.base)}` }} />
            <div style={{ fontFamily: FONT, fontSize: 8, color: at('accent-400', C.accent[400]), marginTop: 4, textAlign: 'center', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{live?.[key] ?? value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function FSemRow({ pair }) {
  return (
    <motion.div variants={rowV} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
      {pair.map(([role, token]) => (
        <div key={role} style={{ padding: '7px 10px', background: at('surface-raised', C.surface.raised), border: `1px solid ${at('border-subtle', C.border.subtle)}` }}>
          <div style={{ fontFamily: FONT, fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: at('text-muted', C.text.muted), marginBottom: 4 }}>{role}</div>
          <div style={{ fontFamily: FONT, fontSize: 10, color: at('accent-100', C.accent[100]) }}>{token}</div>
        </div>
      ))}
    </motion.div>
  )
}

function FTypeRow({ token, px }) {
  return (
    <motion.div variants={rowV} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0', borderBottom: `1px solid ${at('border-subtle', C.border.subtle)}` }}>
      <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: at('text-muted', C.text.muted), width: 24, flexShrink: 0 }}>{token}</span>
      <span style={{ fontFamily: FONT, fontSize: 9, color: at('text-faint', C.text.faint), width: 30, flexShrink: 0 }}>{px}</span>
      <span style={{ fontFamily: FONT, fontSize: px, color: at('text-primary', C.text.primary), letterSpacing: '0.06em', lineHeight: 1, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>ANDROMEDA</span>
    </motion.div>
  )
}

function FSpaceRow({ token, px }) {
  return (
    <motion.div variants={rowV} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0', borderBottom: `1px solid ${at('border-subtle', C.border.subtle)}` }}>
      <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: at('text-muted', C.text.muted), width: 64, flexShrink: 0 }}>{`spacing.${token}`}</span>
      <span style={{ fontFamily: FONT, fontSize: 9, color: at('text-faint', C.text.faint), width: 28, flexShrink: 0 }}>{px}</span>
      <div style={{ width: px, height: 7, background: at('text-primary', C.text.primary), flexShrink: 0 }} />
    </motion.div>
  )
}

const F_BLOCKS = [
  // Colors — accent / orange / red scales (showcase: Foundation · Colors)
  () => (
    <>
      <FKicker>Foundation · Colors</FKicker>
      {SWATCH_ROWS.map((row) => (
        <FSwatchRow key={row.label} row={row} />
      ))}
    </>
  ),
  // Semantic tokens (showcase: Usage Reference grid)
  () => (
    <>
      <FKicker>Foundation · Tokens</FKicker>
      <FSemRow pair={[['Page headings', 'text.primary'], ['Body · desc', 'text.secondary']]} />
      <FSemRow pair={[['Kickers · meta', 'text.muted'], ['Card background', 'surface.raised']]} />
      <FSemRow pair={[['Default borders', 'border.base'], ['Focus borders', 'border.bright']]} />
      <FSemRow pair={[['Active · selected', 'accent.300'], ['Accent glow', 'accent.500']]} />
    </>
  ),
  // Type scale (showcase: Foundation · Type)
  () => (
    <>
      <FKicker>Foundation · Type</FKicker>
      <FTypeRow token="xs" px="10px" />
      <FTypeRow token="sm" px="12px" />
      <FTypeRow token="md" px="14px" />
      <FTypeRow token="lg" px="16px" />
      <FTypeRow token="xl" px="18px" />
      <FTypeRow token="2xl" px="20px" />
    </>
  ),
  // Spacing scale (showcase: Foundation · Spacing)
  () => (
    <>
      <FKicker>Foundation · Spacing</FKicker>
      <FSpaceRow token="1" px="4px" />
      <FSpaceRow token="2" px="8px" />
      <FSpaceRow token="3" px="12px" />
      <FSpaceRow token="4" px="16px" />
      <FSpaceRow token="5" px="20px" />
      <FSpaceRow token="6" px="24px" />
      <FSpaceRow token="8" px="32px" />
    </>
  ),
]

const F_HOLD_MS = 3200 // time a block stays before advancing (~2.5s steady after the enter stagger)

export function FoundationLoop() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  // Only cycle while the panel is actually on (or near) screen — the loop lives
  // far down the page, so without this it re-renders forever while the user is
  // up in the hero. Reduced-motion freezes it on the first block.
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { margin: '200px' })

  useEffect(() => {
    if (reduce || !inView) return
    const t = setTimeout(() => setI((p) => (p + 1) % F_BLOCKS.length), F_HOLD_MS)
    return () => clearTimeout(t)
  }, [i, reduce, inView])

  return (
    <div ref={rootRef} aria-hidden style={{ position: 'absolute', inset: 0, background: at('surface-base', C.surface.base), overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, padding: 'clamp(16px, 6%, 28px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div key={i} variants={containerV} initial="hidden" animate="show" exit="exit">
            {F_BLOCKS[i]()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
