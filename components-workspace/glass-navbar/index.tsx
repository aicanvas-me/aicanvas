'use client'

// npm install @phosphor-icons/react framer-motion

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, X } from '@phosphor-icons/react'

const NAV_ITEMS = ['Products', 'About', 'Blog']

export default function GlassNavbar() {
  const [active, setActive]     = useState<number | null>(null)
  const [hovered, setHovered]   = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  }

  // Used on z-[-1] layers: each parent needs isolate, or the blur falls behind the page.
  const glassBlur = {
    backdropFilter: 'blur(24px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
  }

  const ctaStyle = {
    background: 'linear-gradient(135deg, rgba(255, 160, 50, 0.75), rgba(220, 60, 40, 0.6))',
    border: '1px solid rgba(255, 180, 80, 0.25)',
    boxShadow: '0 2px 16px rgba(220, 80, 30, 0.4)',
  }

  const ctaHoverStyle = {
    background: 'linear-gradient(135deg, rgba(255, 180, 80, 0.9), rgba(235, 75, 45, 0.8))',
    boxShadow: '0 4px 24px rgba(220, 80, 30, 0.6)',
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]">
      <img
        src="https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />

      <div className="relative flex w-[calc(100%-2rem)] max-w-[720px] flex-col">

        <motion.nav
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          className="relative isolate flex w-full items-center gap-1 rounded-full px-2 py-2"
          style={glassStyle}
        >
          <div className="pointer-events-none absolute inset-0 z-[-1] rounded-full" style={glassBlur} />
          <div className="flex cursor-pointer items-center gap-2 px-3" onClick={() => setActive(null)}>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="h-6 w-6 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #FF6BF5, #FFBE0B)' }}
            />
            <span className="text-sm font-semibold text-white/90">Studio</span>
          </div>

          <div className="flex-1" />

          <div className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item, i) => (
              <motion.button
                key={item}
                onClick={() => setActive(i)}
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
                className="relative cursor-pointer rounded-full px-5 py-2 text-sm font-medium"
                style={{ color: active === i || hovered === i ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)' }}
                whileTap={{ scale: 0.97 }}
              >
                {active === i && (
                  <motion.div
                    layoutId="glass-nav-active"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item}</span>
              </motion.button>
            ))}

            <motion.button
              whileHover={{ scale: 1.04, ...ctaHoverStyle }}
              whileTap={{ scale: 0.96 }}
              className="ml-2 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold text-white"
              style={ctaStyle}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              Get Started
            </motion.button>
          </div>

          <motion.button
            className="mr-2 flex cursor-pointer items-center justify-center rounded-full p-2 text-white/70 sm:hidden"
            onClick={() => setMenuOpen(v => !v)}
            whileTap={{ scale: 0.9 }}
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen
                ? <motion.span key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={18} weight="bold" /></motion.span>
                : <motion.span key="menu" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><List size={18} weight="bold" /></motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </motion.nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative isolate mt-2 flex flex-col gap-1 rounded-2xl p-2 sm:hidden"
              style={glassStyle}
            >
              <div className="pointer-events-none absolute inset-0 z-[-1] rounded-2xl" style={glassBlur} />
              {NAV_ITEMS.map((item, i) => (
                <button
                  key={item}
                  onClick={() => { setActive(i); setMenuOpen(false) }}
                  className="cursor-pointer rounded-full px-5 py-2.5 text-left text-sm font-medium transition-colors"
                  style={{
                    color: active === i ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)',
                    background: active === i ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => setMenuOpen(false)}
                className="mt-1 cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                style={ctaStyle}
              >
                Get Started
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
