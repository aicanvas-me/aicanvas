'use client'

// npm install @phosphor-icons/react framer-motion
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check } from '@phosphor-icons/react'

const MORPH = { type: 'spring' as const, stiffness: 320, damping: 30, mass: 1 }

const COLORS = [
  { value: '#E05C50', label: 'Rose' },
  { value: '#E09A3A', label: 'Amber' },
  { value: '#48B068', label: 'Sage' },
  { value: '#30AACC', label: 'Teal' },
  { value: '#5878D8', label: 'Slate' },
  { value: '#8F54D8', label: 'Lavender' },
] as const

type ButtonRect = { x: number; y: number; w: number; h: number } | null

export default function NewProjectModal() {
  const [open, setOpen] = useState(false)
  const [origin, setOrigin] = useState<ButtonRect>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [titleError, setTitleError] = useState(false)
  const [color, setColor] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  function close() {
    setOpen(false)
    setTitle('')
    setDescription('')
    setIsPrivate(false)
    setTitleError(false)
    setColor(null)
  }

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => titleRef.current?.focus(), 320)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  function handleOpen() {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect()
      setOrigin({ x: r.left, y: r.top, w: r.width, h: r.height })
    }
    setOpen(true)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]">
      <motion.button
        ref={buttonRef}
        onClick={handleOpen}
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.85 : 1 }}
        transition={open ? { duration: 0.18 } : { type: 'spring', stiffness: 400, damping: 28 }}
        whileHover={open ? {} : { scale: 1.04 }}
        whileTap={open ? {} : { scale: 0.96 }}
        style={{
          borderRadius: 9999,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
          pointerEvents: open ? 'none' : 'auto',
        }}
        className="flex items-center gap-2 rounded-full bg-[#1a1a18] px-5 py-3 font-sans text-[16px] font-semibold text-[#f1f1f0] dark:bg-[#f1f1f0] dark:text-[#1a1a18]"
      >
        <Plus size={18} weight="bold" />
        New Project
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
          <ModalCard
            origin={origin}
            onClose={close}
            title={title}
            setTitle={(v) => { setTitle(v); if (v) setTitleError(false) }}
            description={description}
            setDescription={setDescription}
            isPrivate={isPrivate}
            setIsPrivate={setIsPrivate}
            titleError={titleError}
            titleRef={titleRef}
            onValidate={() => { if (!title.trim()) { setTitleError(true); return false } return true }}
            color={color}
            setColor={setColor}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ModalCard({
  origin, onClose, title, setTitle, description, setDescription,
  isPrivate, setIsPrivate, titleError, titleRef, onValidate, color, setColor,
}: {
  origin: { x: number; y: number; w: number; h: number }
  onClose: () => void
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  isPrivate: boolean
  setIsPrivate: (fn: (p: boolean) => boolean) => void
  titleError: boolean
  titleRef: React.RefObject<HTMLInputElement | null>
  onValidate: () => boolean
  color: string | null
  setColor: (c: string | null) => void
}) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768
  const targetW = Math.min(480, vw - 32)

  const initialOffsetX = origin.x + origin.w / 2 - vw / 2
  const initialOffsetY = origin.y + origin.h / 2 - vh / 2
  const initialScaleX = origin.w / targetW

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
          boxShadow: '0px 16px 56px rgba(0,0,0,0.14)',
        }}
        animate={{
          x: 0, y: 0, scaleX: 1, scaleY: 1,
          borderRadius: 28, opacity: 1,
          boxShadow: '0px 16px 56px rgba(0,0,0,0.14)',
        }}
        exit={{
          x: initialOffsetX, y: initialOffsetY,
          scaleX: initialScaleX, scaleY: 0.18,
          borderRadius: 9999, opacity: 0,
          boxShadow: '0px 16px 56px rgba(0,0,0,0.14)',
        }}
        transition={{
          default: MORPH,
          borderRadius: { duration: 0.32, ease: [0.32, 0.72, 0.34, 1] },
          opacity: { duration: 0.18 },
        }}
        style={{ borderRadius: 28, willChange: 'transform, border-radius' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="New Project"
        className="w-full max-w-[480px] rounded-[28px] bg-[#f1f1f0] px-6 pb-6 pt-6"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { delay: 0.18, staggerChildren: 0.055 } },
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
            <span className="font-sans text-[18px] font-bold text-[#1a1a18]">New Project</span>
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.1, backgroundColor: '#ececec' }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className="absolute right-0 flex size-9 items-center justify-center rounded-full text-[#6c6c6c]"
              style={{ backgroundColor: '#f8f8f8' }}
            >
              <X size={16} weight="bold" />
            </motion.button>
          </motion.div>

          <div className="flex flex-col gap-3">
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
              }}
              className="flex flex-col gap-1"
            >
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className={`h-[52px] w-full rounded-full border-2 bg-[#f8f8f8] px-5 font-sans text-[15px] font-medium text-[#1a1a18] placeholder-[#a0a09a] outline-none transition-[border-color] focus:border-[#1a1a18] ${
                  titleError ? 'border-red-400' : 'border-transparent'
                }`}
                style={{ caretColor: '#1a1a18' }}
              />
              <AnimatePresence>
                {titleError && (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="pl-5 font-sans text-[12px] font-medium text-red-400"
                  >
                    Title is required
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.input
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="h-[52px] w-full rounded-full border-2 border-transparent bg-[#f8f8f8] px-5 font-sans text-[15px] font-medium text-[#1a1a18] placeholder-[#a0a09a] outline-none transition-[border-color] focus:border-[#1a1a18]"
              style={{ caretColor: '#1a1a18' }}
            />
          </div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
            }}
            className="mt-4 flex items-center gap-2"
          >
            <Swatch
              label="None"
              selected={color === null}
              onClick={() => setColor(null)}
              ringColor="#6c6c6c"
              style={{
                background: 'linear-gradient(135deg, #e0dfd8 0%, #e0dfd8 45%, #c8c7c0 45%, #c8c7c0 55%, #e0dfd8 55%, #e0dfd8 100%)',
              }}
            />
            {COLORS.map((c) => (
              <Swatch
                key={c.value}
                label={c.label}
                selected={color === c.value}
                onClick={() => setColor(c.value)}
                ringColor={c.value}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
            }}
            className="mt-4 flex items-center justify-between"
          >
            <button
              onClick={() => setIsPrivate((p) => !p)}
              className="flex items-center gap-2.5"
            >
              <motion.div
                animate={{ backgroundColor: isPrivate ? '#6c6c6c' : '#f8f8f8' }}
                transition={{ duration: 0.15 }}
                className="flex size-7 items-center justify-center rounded-lg border border-[#1a1a18]"
              >
                <AnimatePresence initial={false} mode="wait">
                  {isPrivate && (
                    <motion.span
                      key="check"
                      initial={{ opacity: 0, scale: 0.4, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.4, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                      className="flex"
                    >
                      <Check size={14} weight="bold" color="#f1f1f0" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className="font-sans text-[15px] font-semibold text-[#1a1a18]">Private</span>
            </button>

            <CreateButton onValidate={onValidate} onConfirm={onClose} />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function Swatch({
  label, selected, onClick, ringColor, style,
}: {
  label: string
  selected: boolean
  onClick: () => void
  ringColor: string
  style: React.CSSProperties
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1a1a18] px-2 py-1 font-sans text-[11px] font-semibold text-[#f1f1f0]"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onClick}
        aria-label={label}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.88 }}
        animate={{
          scale: selected ? 1.1 : 1,
          boxShadow: selected
            ? `0 0 0 2px #f1f1f0, 0 0 0 3.5px ${ringColor}`
            : '0 0 0 0px transparent',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        className="size-[22px] shrink-0 rounded-full"
        style={style}
      />
    </div>
  )
}

function CreateButton({ onValidate, onConfirm }: { onValidate: () => boolean; onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false)

  function handleClick() {
    if (!onValidate()) return
    setConfirming(true)
    setTimeout(() => { setConfirming(false); onConfirm() }, 600)
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={confirming}
      animate={{ scale: confirming ? 0.96 : 1, backgroundColor: confirming ? '#3a3a38' : '#1a1a18' }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      whileHover={confirming ? {} : { scale: 1.05, backgroundColor: '#2d2d2b' }}
      whileTap={confirming ? {} : { scale: 0.96 }}
      className="rounded-full px-7 py-3 font-sans text-[15px] font-bold text-[#f2f1ec]"
      style={{ backgroundColor: '#1a1a18' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {confirming ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="flex items-center justify-center"
          >
            <Check size={16} weight="bold" />
          </motion.span>
        ) : (
          <motion.span
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            Create
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
