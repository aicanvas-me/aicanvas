'use client'

// npm install @phosphor-icons/react framer-motion

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Gear,
  SignOut,
  Users,
  CreditCard,
  CaretUpDown,
} from '@phosphor-icons/react'


const BACKGROUND = 'https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866'

const USER = {
  name: 'Jennifer Rivera',
  email: 'jennifer@studio.io',
  avatar: 'https://ik.imagekit.io/aitoolkit/Miscellaneous/Avatars/Silhouette%20Profile%20Against%20Gradient%20Background%201.webp',
}

// 6-digit hex only: two-digit alpha suffixes are appended to these colors.
const MENU_GROUPS = [
  {
    label: 'Account',
    items: [
      { icon: User, label: 'Profile',  color: '#3A86FF' },
      { icon: Gear, label: 'Settings', color: '#B388FF' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { icon: Users,      label: 'Team',    color: '#06D6A0' },
      { icon: CreditCard, label: 'Billing', color: '#FFBE0B' },
    ],
  },
]


const glassPanel = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 0 rgba(255,255,255,0), 0 0 0 rgba(255,255,255,0)',
}

const glassPanelBlur = {
  backdropFilter: 'blur(24px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
}

const ACTIVE_GLOW =
  '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1.5px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.08)'


function MenuItem({
  icon: Icon,
  label,
  color,
  index,
}: {
  icon: typeof User
  label: string
  color: string
  index: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, delay: 0.06 + index * 0.04 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5"
      style={{ minHeight: 44, background: 'transparent' }}
    >
      <motion.button
        onClick={() => {}}
        animate={{
          x: hovered ? 3 : 0,
          scale: hovered ? 1.08 : 1,
        }}
        whileTap={{ scale: 0.90 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5"
        style={{ background: 'transparent', transformOrigin: 'left center' }}
      >
        <div
          className="flex shrink-0 items-center justify-center rounded-xl"
          style={{
            width: 32,
            height: 32,
            background: `${color}18`,
            border: `1px solid ${color}22`,
          }}
        >
          <Icon size={16} weight="regular" style={{ color }} />
        </div>
        <span
          className="text-sm font-medium"
          style={{
            color: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.70)',
            transition: 'color 0.15s',
          }}
        >
          {label}
        </span>
      </motion.button>
    </motion.div>
  )
}


export default function GlassUserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [open])

  let itemIndex = 0

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]">
      <img
        src={BACKGROUND}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />

      <div ref={ref} className="relative flex flex-col items-center" style={{ marginTop: -150 }}>

        <motion.button
          onClick={() => setOpen(v => !v)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          animate={{ boxShadow: open ? ACTIVE_GLOW : glassPanel.boxShadow }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="relative isolate flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5"
          style={{
            background: glassPanel.background,
            border: glassPanel.border,
          }}
        >
          {/* z-[-1] relies on the button's isolate; without it the blur falls behind the page. */}
          <div className="pointer-events-none absolute inset-0 z-[-1] rounded-2xl" style={glassPanelBlur} />
          <img
            src={USER.avatar}
            alt={USER.name}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <span className="text-sm font-semibold text-white/80">{USER.name}</span>
          <CaretUpDown size={16} weight="regular" className="text-white/40" />
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: -8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: -8, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="absolute left-1/2 top-full mt-2 w-[min(256px,calc(100vw-32px))] rounded-2xl p-2"
              style={{ ...glassPanel, ...glassPanelBlur, transformOrigin: 'top center' }}
            >
              <div
                className="absolute bottom-6 left-0 top-6 w-[1px]"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.18), transparent)' }}
              />

              {MENU_GROUPS.map((group) => (
                <div key={group.label} className="mb-1">
                  <p className="mb-0.5 px-3 pt-1 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                    {group.label}
                  </p>
                  {group.items.map((item) => (
                    <MenuItem key={item.label} icon={item.icon} label={item.label} color={item.color} index={itemIndex++} />
                  ))}
                </div>
              ))}

              <div className="mx-2 my-1.5 h-[1px]" style={{ background: 'rgba(255,255,255,0.07)' }} />

              <LogOutItem index={itemIndex} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


function LogOutItem({ index }: { index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, delay: 0.06 + index * 0.04 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5"
      style={{ minHeight: 44, background: 'transparent' }}
    >
      <motion.button
        onClick={() => {}}
        animate={{
          x: hovered ? 3 : 0,
          scale: hovered ? 1.08 : 1,
        }}
        whileTap={{ scale: 0.90 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5"
        style={{ background: 'transparent', transformOrigin: 'left center' }}
      >
        <div
          className="flex shrink-0 items-center justify-center rounded-xl"
          style={{
            width: 32,
            height: 32,
            background: '#FF5A5A18',
            border: '1px solid #FF5A5A22',
          }}
        >
          <SignOut size={16} weight="regular" style={{ color: '#FF5A5A' }} />
        </div>
        <span
          className="text-sm font-medium"
          style={{
            color: hovered ? 'rgba(255,90,90,0.95)' : 'rgba(255,90,90,0.70)',
            transition: 'color 0.15s',
          }}
        >
          Log Out
        </span>
      </motion.button>
    </motion.div>
  )
}
