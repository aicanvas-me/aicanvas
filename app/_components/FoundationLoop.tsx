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
// (surface.base void, JetBrains Mono, turquoise/orange/red scales), not the
// site's sand/olive tokens — intentional, since this IS a preview of the
// system.

import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { tokens } from '../../design-systems/andromeda/tokens'

const C = tokens.color
const FONT = tokens.typography.fontMono

const rowV: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -18, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
}
const containerV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
  exit: { transition: { staggerChildren: 0.04 } },
}

function FKicker({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={rowV}
      style={{ fontFamily: FONT, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.text.muted, marginBottom: 16 }}
    >
      {children}
    </motion.div>
  )
}

function FSwatchRow({ label, steps }: { label: string; steps: string[] }) {
  return (
    <motion.div variants={rowV} style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.text.faint, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {steps.map((hex) => (
          <div key={hex} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ height: 26, background: hex, border: `1px solid ${C.border.base}` }} />
            <div style={{ fontFamily: FONT, fontSize: 8, color: C.accent[400], marginTop: 4, textAlign: 'center', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{hex}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function FSemRow({ pair }: { pair: string[][] }) {
  return (
    <motion.div variants={rowV} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
      {pair.map(([role, token]) => (
        <div key={role} style={{ padding: '7px 10px', background: C.surface.raised, border: `1px solid ${C.border.subtle}` }}>
          <div style={{ fontFamily: FONT, fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.text.muted, marginBottom: 4 }}>{role}</div>
          <div style={{ fontFamily: FONT, fontSize: 10, color: C.accent[100] }}>{token}</div>
        </div>
      ))}
    </motion.div>
  )
}

function FTypeRow({ token, px }: { token: string; px: string }) {
  return (
    <motion.div variants={rowV} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0', borderBottom: `1px solid ${C.border.subtle}` }}>
      <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text.muted, width: 24, flexShrink: 0 }}>{token}</span>
      <span style={{ fontFamily: FONT, fontSize: 9, color: C.text.faint, width: 30, flexShrink: 0 }}>{px}</span>
      <span style={{ fontFamily: FONT, fontSize: px, color: C.text.primary, letterSpacing: '0.06em', lineHeight: 1, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>ANDROMEDA</span>
    </motion.div>
  )
}

function FSpaceRow({ token, px }: { token: string; px: string }) {
  return (
    <motion.div variants={rowV} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0', borderBottom: `1px solid ${C.border.subtle}` }}>
      <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.text.muted, width: 64, flexShrink: 0 }}>{`spacing.${token}`}</span>
      <span style={{ fontFamily: FONT, fontSize: 9, color: C.text.faint, width: 28, flexShrink: 0 }}>{px}</span>
      <div style={{ width: px, height: 7, background: C.text.primary, flexShrink: 0 }} />
    </motion.div>
  )
}

const F_BLOCKS = [
  // Colors — accent / orange / red scales (showcase: Foundation · Colors)
  () => (
    <>
      <FKicker>Foundation · Colors</FKicker>
      <FSwatchRow label="Accent · Turquoise" steps={[C.accent[100], C.accent[200], C.accent[300], C.accent[400], C.accent[500]]} />
      <FSwatchRow label="Orange · Warning" steps={[C.orange[100], C.orange[200], C.orange[300], C.orange[400], C.orange[500]]} />
      <FSwatchRow label="Red · Fault" steps={[C.red[100], C.red[200], C.red[300], C.red[400], C.red[500]]} />
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
      <FTypeRow token="lg" px="15px" />
      <FTypeRow token="xl" px="18px" />
      <FTypeRow token="2xl" px="22px" />
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
    <div ref={rootRef} aria-hidden style={{ position: 'absolute', inset: 0, background: C.surface.base, overflow: 'hidden', pointerEvents: 'none' }}>
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
