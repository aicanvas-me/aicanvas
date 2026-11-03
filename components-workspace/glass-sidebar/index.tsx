'use client'

// npm install @phosphor-icons/react framer-motion

import { useState, useEffect } from 'react'
import { motion, useSpring, AnimatePresence } from 'framer-motion'
import {
  House,
  MagnifyingGlass,
  Folders,
  Bell,
  ChartLine,
  Gear,
  User,
  ArrowRight,
  ArrowLeft,
} from '@phosphor-icons/react'


const COLLAPSED_WIDTH = 64
const EXPANDED_WIDTH = 220

const ICON_TILE_SIZE = 44
const TOGGLE_BUTTON_HEIGHT = 36

// 6-digit hex only: two-digit alpha suffixes are appended to these colors.
const NAV_ITEMS = [
  { icon: House,           label: 'Home',          color: '#3A86FF' },
  { icon: MagnifyingGlass, label: 'Search',        color: '#B388FF' },
  { icon: Folders,         label: 'Projects',      color: '#FFBE0B' },
  { icon: Bell,            label: 'Notifications', color: '#FF5C8A' },
  { icon: ChartLine,       label: 'Analytics',     color: '#06D6A0' },
  { icon: Gear,            label: 'Settings',      color: '#C9A96E' },
  { icon: User,            label: 'Profile',       color: '#FF7B54' },
] as const

type NavItem = (typeof NAV_ITEMS)[number]

const GLASS_BLUR_STYLE = {
  backdropFilter: 'blur(24px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
} as const

const GLASS_STYLE = {
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
} as const


function NavItemRow({
  item,
  index,
  isActive,
  isOpen,
  onActivate,
}: {
  item: NavItem
  index: number
  isActive: boolean
  isOpen: boolean
  onActivate: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const Icon = item.icon

  useEffect(() => { setHovered(false) }, [isOpen])

  return (
    <div className="relative flex w-full items-center">
      <AnimatePresence>
        {!isOpen && hovered && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute left-[calc(100%+10px)] z-50 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-white/90 font-sans"
            style={{ ...GLASS_STYLE, ...GLASS_BLUR_STYLE }}
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onActivate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{
          scale: hovered ? (isOpen ? 1.08 : 1.15) : 1,
          x: hovered ? (isOpen ? 0 : 3) : 0,
        }}
        whileTap={{ scale: 0.90 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        className="flex w-full items-center gap-3 rounded-xl cursor-pointer justify-start"
        style={{ background: 'transparent', border: 'none', outline: 'none' }}
        aria-label={item.label}
      >
        <motion.div
          className="flex shrink-0 items-center justify-center rounded-xl"
          style={{
            width: ICON_TILE_SIZE,
            height: ICON_TILE_SIZE,
            background: isActive ? `${item.color}28` : `${item.color}18`,
            border: `1px solid ${isActive ? `${item.color}44` : `${item.color}22`}`,
            transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          <Icon size={20} weight="regular" style={{ color: item.color }} />
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.span
              key="label"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.18, ease: 'easeOut', delay: 0.18 + index * 0.03 } }}
              exit={{ opacity: 0, x: -6, transition: { duration: 0.08, ease: 'easeIn', delay: 0 } }}
              className="whitespace-nowrap text-sm font-semibold font-sans"
              style={{
                color: isActive ? item.color : 'rgba(255,255,255,0.75)',
              }}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}


export default function GlassSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [toggleHovered, setToggleHovered] = useState(false)

  const widthSpring = useSpring(COLLAPSED_WIDTH, { stiffness: 280, damping: 26 })

  function toggle() {
    const next = !isOpen
    setIsOpen(next)
    widthSpring.set(next ? EXPANDED_WIDTH : COLLAPSED_WIDTH)
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]">
      <img
        src="https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20pink%20Flower%20%20(1).png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />

      <div style={{ width: EXPANDED_WIDTH }} className="flex items-center justify-start">
        <motion.div
          style={{
            width: widthSpring,
            ...GLASS_STYLE,
          }}
          // No opacity in initial: below 1 it hides the blur until the fade ends.
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
          className="relative isolate flex h-auto flex-col items-center gap-2 overflow-visible rounded-3xl px-2.5 py-3"
        >
          {/* z-[-1] relies on the panel's isolate; without it the blur falls behind the page. */}
          <div
            className="pointer-events-none absolute inset-0 z-[-1] rounded-3xl"
            style={GLASS_BLUR_STYLE}
          />

          <div className="flex w-full flex-col gap-1.5">
            {NAV_ITEMS.map((item, i) => (
              <NavItemRow
                key={item.label}
                item={item}
                index={i}
                isActive={activeIndex === i}
                isOpen={isOpen}
                onActivate={() => setActiveIndex(i)}
              />
            ))}
          </div>

          <div
            className="my-1 w-full"
            style={{ height: 1, background: 'rgba(255,255,255,0.1)' }}
          />

          <div className={`flex w-full items-center ${isOpen ? 'justify-start px-1' : 'justify-center'}`}>
            <motion.button
              onClick={toggle}
              onMouseEnter={() => setToggleHovered(true)}
              onMouseLeave={() => setToggleHovered(false)}
              animate={{ scale: toggleHovered ? 1.08 : 1 }}
              whileTap={{ scale: 0.90 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex items-center justify-center rounded-2xl cursor-pointer"
              style={{
                width: ICON_TILE_SIZE,
                height: TOGGLE_BUTTON_HEIGHT,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                outline: 'none',
              }}
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.span
                    key="left"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.18 }}
                  >
                    <ArrowLeft size={18} weight="regular" className="text-white/70" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="right"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.18 }}
                  >
                    <ArrowRight size={18} weight="regular" className="text-white/70" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
