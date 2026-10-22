'use client'

// npm install framer-motion

import { useState } from 'react'
import { motion } from 'framer-motion'

const BACKGROUND = 'https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%203%20(1).png?updatedAt=1775226815629'

// 6-digit hex only: two-digit alpha suffixes are appended to these colors.
const TAGS = [
  { label: 'Design',       color: '#FF9A3C' },
  { label: 'Development',  color: '#FFBE0B' },
  { label: 'Motion',       color: '#FF6BF5' },
  { label: 'AI',           color: '#FF7B54' },
  { label: '3D',           color: '#DC5A28' },
  { label: 'Typography',   color: '#FFD166' },
  { label: 'Branding',     color: '#FF6680' },
  { label: 'iOS',          color: '#FF9A3C' },
  { label: 'WebGL',        color: '#FFBE0B' },
  { label: 'React',        color: '#FF7B54' },
  { label: 'Figma',        color: '#FF6BF5' },
  { label: 'Prototyping',  color: '#FFD166' },
]

const GLASS_FILTER = 'blur(24px) saturate(1.8)'


function GlassTag({ label, color, index }: { label: string; color: string; index: number }) {
  const [selected, setSelected] = useState(false)
  const [hovered,  setHovered]  = useState(false)

  return (
    <motion.button
      // No opacity in initial: below 1 it hides the blur until the fade ends.
      initial={{ scale: 0.8, y: 12 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.04 }}
      onClick={() => setSelected(s => !s)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      className="relative isolate cursor-pointer rounded-full px-4 py-2 sm:px-5 sm:py-2.5"
      style={{
        background: selected
          ? `linear-gradient(135deg, ${color}33, ${color}18)`
          : hovered ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.08)',
        border: selected
          ? `1px solid ${color}55`
          : hovered ? '1px solid rgba(255,255,255,0.24)' : '1px solid rgba(255,255,255,0.12)',
        boxShadow: selected
          ? `0 4px 24px ${color}30, inset 0 1px 0 rgba(255,255,255,0.12)`
          : hovered
            ? '0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.18)'
            : '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        transition: 'background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* z-[-1] relies on the tag's isolate; without it the blur falls behind the page. */}
      <div
        className="pointer-events-none absolute inset-0 z-[-1] rounded-full"
        style={{ backdropFilter: GLASS_FILTER, WebkitBackdropFilter: GLASS_FILTER }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ opacity: selected ? 0.15 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
      />

      <div className="relative z-10 flex items-center gap-2">
        <div className="relative h-3.5 w-3.5 shrink-0">
          <motion.div
            animate={{ scale: selected ? 0 : 1, opacity: selected ? 0 : hovered ? 0.8 : 0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="absolute inset-0 m-auto h-2 w-2 rounded-full"
            style={{ background: color }}
          />
          {selected && (
            <motion.svg
              width="14" height="14" viewBox="0 0 14 14"
              className="absolute inset-0"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <motion.path
                d="M3 7.5L5.5 10L11 4"
                fill="none" stroke={color} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, delay: 0.1 }}
              />
            </motion.svg>
          )}
        </div>

        <span
          className="text-xs font-semibold sm:text-sm"
          style={{
            color: selected ? 'rgba(255,255,255,0.95)' : hovered ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.2s ease',
          }}
        >
          {label}
        </span>
      </div>
    </motion.button>
  )
}

export default function GlassTags() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]">
      <img
        src={BACKGROUND}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div
        className="relative flex w-full max-w-sm flex-wrap justify-center gap-2 px-4 sm:max-w-md sm:gap-3 sm:px-6"
      >
        {TAGS.map((tag, i) => (
          <GlassTag key={tag.label} label={tag.label} color={tag.color} index={i} />
        ))}
      </div>
    </div>
  )
}
