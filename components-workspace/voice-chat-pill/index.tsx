'use client'
// npm install @phosphor-icons/react framer-motion

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaretDown, X, Check } from '@phosphor-icons/react'

const MORPH = { type: 'spring' as const, stiffness: 320, damping: 30, mass: 1 }

const PEOPLE = [
  { id: 0, name: 'David',   avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&h=240&fit=crop&q=80' },
  { id: 1, name: 'Kira',    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=240&h=240&fit=crop&q=80' },
  { id: 2, name: 'Marina',  avatar: 'https://images.unsplash.com/photo-1554780336-390462301acf?w=240&h=240&fit=crop&q=80' },
  { id: 3, name: 'Razvan',  avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=240&h=240&fit=crop&q=80' },
  { id: 4, name: 'Ana',     avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop&q=80' },
  { id: 5, name: 'Daniel',  avatar: 'https://images.unsplash.com/photo-1654110455429-cf322b40a906?w=240&h=240&fit=crop&q=80' },
  { id: 6, name: 'Afshin',  avatar: 'https://images.unsplash.com/photo-1639747280804-dd2d6b3d88ac?w=240&h=240&fit=crop&q=80' },
  { id: 7, name: 'Lina',    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop&q=80' },
] as const

type ButtonRect = { x: number; y: number; w: number; h: number } | null

function SpeakingBars({ size = 14 }: { size?: number }) {
  return (
    <span
      className="flex items-center justify-center gap-[1.5px]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={{ scaleY: 0.35 }}
          animate={{ scaleY: [0.35, 1, 0.55, 0.9, 0.35] }}
          transition={{
            duration: 1.05,
            repeat: Infinity,
            delay: i * 0.13,
            ease: 'easeInOut',
          }}
          className="origin-center rounded-full bg-current"
          style={{ width: 2, height: size * 0.85 }}
        />
      ))}
    </span>
  )
}

export default function VoiceChatPill() {
  const [open, setOpen] = useState(false)
  const [origin, setOrigin] = useState<ButtonRect>(null)
  const [speakerId, setSpeakerId] = useState(0)
  const pillRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeakerId((id) => (id + 1) % PEOPLE.length)
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  function handleOpen() {
    if (pillRef.current) {
      const r = pillRef.current.getBoundingClientRect()
      setOrigin({ x: r.left, y: r.top, w: r.width, h: r.height })
    }
    setOpen(true)
  }

  function close() {
    setOpen(false)
  }

  const collapsedSpeaker = PEOPLE.find((p) => p.id === speakerId) ?? PEOPLE[0]
  const visiblePeople = PEOPLE.slice(0, 4)
  const hiddenCount = PEOPLE.length - visiblePeople.length

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]">

      <motion.button
        ref={pillRef}
        onClick={handleOpen}
        aria-label="Open live session"
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.85 : 1 }}
        transition={open ? { duration: 0.18 } : { type: 'spring', stiffness: 400, damping: 28 }}
        whileHover={open ? {} : { scale: 1.04 }}
        whileTap={open ? {} : { scale: 0.96 }}
        style={{
          borderRadius: 9999,
          boxShadow:
            '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
          pointerEvents: open ? 'none' : 'auto',
        }}
        className="flex items-center gap-3 rounded-full bg-[#1a1a18] px-2 py-2 pr-4 transition-colors duration-150 hover:bg-[#2d2d2b] dark:bg-[#e0dfd8] dark:hover:bg-[#d4d3cc]"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f1f1f0] text-[#1a1a18] dark:bg-[#1a1a18] dark:text-[#f1f1f0]">
          <SpeakingBars size={14} />
        </span>

        <div className="flex">
          {visiblePeople.map((p, i) => (
            <motion.span
              key={p.id}
              animate={
                p.id === collapsedSpeaker.id
                  ? { y: -1.5, scale: 1.06 }
                  : { y: 0, scale: 1 }
              }
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              className="overflow-hidden rounded-full ring-2 ring-[#1a1a18] dark:ring-[#e0dfd8]"
              style={{
                width: 32,
                height: 32,
                marginLeft: i === 0 ? 0 : -10,
                zIndex: visiblePeople.length - i,
              }}
            >
              <img
                src={p.avatar}
                alt={p.name}
                className="size-full object-cover"
                draggable={false}
              />
            </motion.span>
          ))}
        </div>

        <span className="flex items-center gap-0.5 font-sans text-[14px] font-semibold text-[#f1f1f0] dark:text-[#1a1a18]">
          +{hiddenCount}
          <CaretDown weight="bold" size={13} />
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[3px]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && origin && (
          <ModalCard origin={origin} onClose={close} speakerId={speakerId} />
        )}
      </AnimatePresence>
    </div>
  )
}

function ModalCard({
  origin,
  onClose,
  speakerId,
}: {
  origin: { x: number; y: number; w: number; h: number }
  onClose: () => void
  speakerId: number
}) {
  const [joining, setJoining] = useState(false)
  // Must match max-w-[440px] and px-4 below, or the morph starts at the wrong width.
  const targetW = typeof window !== 'undefined' ? Math.min(440, window.innerWidth - 32) : 440

  const initialOffsetX = origin.x + origin.w / 2 - window.innerWidth / 2
  const initialOffsetY = origin.y + origin.h / 2 - window.innerHeight / 2
  const initialScaleX = origin.w / targetW

  const shadowBase = '0px 16px 56px rgba(0,0,0,0.14)'
  const boxShadow = shadowBase

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{
          x: initialOffsetX, y: initialOffsetY,
          scaleX: initialScaleX, scaleY: 0.18,
          borderRadius: 9999, opacity: 0.85,
          boxShadow: shadowBase,
        }}
        animate={{
          x: 0, y: 0, scaleX: 1, scaleY: 1,
          borderRadius: 28, opacity: 1,
          boxShadow,
        }}
        exit={{
          x: initialOffsetX, y: initialOffsetY,
          scaleX: initialScaleX, scaleY: 0.18,
          borderRadius: 9999, opacity: 0,
          boxShadow: shadowBase,
        }}
        transition={{
          default: MORPH,
          borderRadius: { duration: 0.32, ease: [0.32, 0.72, 0.34, 1] },
          opacity: { duration: 0.18 },
          boxShadow: { duration: 0.35, ease: 'easeInOut' },
        }}
        style={{ borderRadius: 28, willChange: 'transform, border-radius' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-[28px] bg-[#f1f1f0] px-6 pb-6 pt-6"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { delay: 0.18, staggerChildren: 0.05 } },
            exit: { opacity: 0, transition: { duration: 0.08 } },
          }}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -6 },
              show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
            }}
            className="relative mb-5 flex items-center justify-center"
          >
            <span className="font-sans text-[18px] font-bold text-[#1a1a18]">Live Session</span>
            <motion.button
              onClick={onClose}
              aria-label="Close live session"
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.1, backgroundColor: '#ececec' }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className="absolute right-0 flex size-9 items-center justify-center rounded-full text-[#6c6c6c]"
              style={{ backgroundColor: '#f8f8f8' }}
            >
              <X size={16} weight="bold" />
            </motion.button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
            }}
            className="grid grid-cols-4 gap-x-3 gap-y-4"
          >
            {PEOPLE.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <motion.div
                    animate={p.id === speakerId ? { scale: 1.04 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                    className="overflow-hidden rounded-full"
                    style={{ width: 60, height: 60 }}
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="size-full object-cover"
                      draggable={false}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {p.id === speakerId && (
                      <motion.span
                        key="badge"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                        className="absolute -right-1 -top-0.5 flex size-[22px] items-center justify-center rounded-full bg-[#f1f1f0] ring-2 ring-[#f1f1f0]"
                      >
                        <span className="flex size-[22px] items-center justify-center rounded-full bg-[#1a1a18] text-[#f1f1f0]">
                          <SpeakingBars size={10} />
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="font-sans text-[13px] font-medium text-[#1a1a18]">
                  {p.name}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.button
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
            }}
            onClick={() => {
              if (joining) return
              setJoining(true)
              setTimeout(() => { setJoining(false); onClose() }, 700)
            }}
            disabled={joining}
            animate={{ scale: joining ? 0.96 : 1, backgroundColor: joining ? '#3a3a38' : '#1a1a18' }}
            whileHover={joining ? {} : { scale: 1.02, backgroundColor: '#2d2d2b' }}
            whileTap={joining ? {} : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className="mt-6 w-full rounded-full py-3.5 font-sans text-[15px] font-bold text-[#f2f1ec]"
            style={{ backgroundColor: '#1a1a18' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {joining ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="flex items-center justify-center"
                >
                  <Check size={18} weight="bold" />
                </motion.span>
              ) : (
                <motion.span
                  key="label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  Join Now
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
