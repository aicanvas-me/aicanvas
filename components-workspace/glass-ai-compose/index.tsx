'use client'

// npm install @phosphor-icons/react framer-motion

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  PaperPlaneRight,
  ImageSquare,
  GlobeSimple,
  X,
} from '@phosphor-icons/react'


const BACKGROUND =
  'https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133'

// 6-digit hex only: two-digit alpha suffixes are appended to these colors.
const MODELS = [
  { label: 'Claude',     color: '#FF7B54' },
  { label: 'ChatGPT',    color: '#10A37F' },
  { label: 'Perplexity', color: '#3A86FF' },
  { label: 'Gemini',     color: '#FFBE0B' },
] as const

type Model = (typeof MODELS)[number]

const MAX_TEXTAREA_HEIGHT = 160


const glassBlur = {
  backdropFilter: 'blur(24px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
} as const

const glassPanel = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow:
    '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 0 0 rgba(255, 255, 255, 0), 0 0 0 0 rgba(255, 255, 255, 0)',
} as const

const ACTIVE_GLOW =
  '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 0 1.5px rgba(255, 255, 255, 0.25), 0 0 20px rgba(255, 255, 255, 0.06)'


function ModelSwitcher({
  activeModel,
  onSelect,
}: {
  activeModel: Model
  onSelect: (model: Model) => void
}) {
  return (
    <div className="relative flex items-center gap-0.5">
      {MODELS.map((model) => {
        const isActive = model.label === activeModel.label
        return (
          <button
            key={model.label}
            onClick={() => onSelect(model)}
            className="relative z-10 flex cursor-pointer flex-col items-center rounded-lg px-3 py-1.5"
            style={{ background: 'transparent', flex: 1 }}
          >
            {isActive && (
              <motion.div
                layoutId="model-pill"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: `${model.color}18`,
                  border: `1px solid ${model.color}22`,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              />
            )}
            <span
              className="relative z-10 text-[11px] font-semibold"
              style={{
                color: isActive ? model.color : 'rgba(255,255,255,0.50)',
                transition: 'color 0.15s',
              }}
            >
              {model.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}


function ImageThumbnail({
  src,
  onRemove,
}: {
  src: string
  onRemove: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl"
      style={{
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <img
        src={src}
        alt="Upload preview"
        className="h-full w-full object-cover"
      />
      <motion.button
        onClick={onRemove}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <X size={10} weight="regular" className="text-white/80" />
      </motion.button>
    </motion.div>
  )
}


export default function GlassAiCompose() {
  const [isActive, setIsActive] = useState(false)
  const [message, setMessage] = useState('')
  const [activeModel, setActiveModel] = useState<Model>(MODELS[0])
  const [images, setImages] = useState<string[]>([])
  const [webSearch, setWebSearch] = useState(false)
  const [showWebLabel, setShowWebLabel] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const prefersReduced = useReducedMotion()
  const reducedMotion = prefersReduced ?? false

  const canSend = message.trim().length > 0 || images.length > 0

  useEffect(() => {
    if (!webSearch) { setShowWebLabel(false); return }
    setShowWebLabel(true)
    const timer = setTimeout(() => setShowWebLabel(false), 1000)
    return () => clearTimeout(timer)
  }, [webSearch])

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [])

  useEffect(() => {
    if (!isActive) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsActive(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [isActive])

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages((prev) => [...prev, ev.target!.result as string])
        }
      }
      reader.readAsDataURL(files[i])
    }
    // Without this reset, picking the same file again fires no change event.
    e.target.value = ''
  }

  function handleSend() {
    if (!canSend) return
    setMessage('')
    setImages([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const springOrFade = reducedMotion
    ? { duration: 0.15 }
    : { type: 'spring' as const, stiffness: 350, damping: 28 }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]">
      <img
        src={BACKGROUND}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />

      <div
        ref={containerRef}
        className="relative z-10 w-[calc(100%-2rem)] max-w-[420px]"
      >
        <motion.div
          animate={{
            boxShadow: isActive ? ACTIVE_GLOW : glassPanel.boxShadow,
          }}
          transition={springOrFade}
          className="relative isolate overflow-hidden rounded-2xl"
          style={{
            background: glassPanel.background,
            border: glassPanel.border,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 z-[-1] rounded-2xl"
            style={glassBlur}
          />

          <div
            className="absolute left-6 right-6 top-0 z-10 h-[1px]"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
            }}
          />

          <div className="relative z-10 flex flex-col gap-6 p-4 pb-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                resizeTextarea()
              }}
              onFocus={() => setIsActive(true)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="w-full resize-none bg-transparent font-sans text-sm font-medium text-white/90 placeholder-white/40 outline-none"
              style={{
                caretColor: activeModel.color,
                maxHeight: MAX_TEXTAREA_HEIGHT,
              }}
            />

            <AnimatePresence>
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={springOrFade}
                  className="flex gap-2 overflow-hidden"
                >
                  <AnimatePresence>
                    {images.map((src, i) => (
                      <ImageThumbnail
                        key={`${i}-${src.slice(-20)}`}
                        src={src}
                        onRemove={() =>
                          setImages((prev) => prev.filter((_, idx) => idx !== i))
                        }
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={reducedMotion ? undefined : { scale: 1.08, background: 'rgba(255, 255, 255, 0.14)' }}
                  whileTap={reducedMotion ? undefined : { scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  className="flex cursor-pointer items-center justify-center rounded-xl"
                  style={{
                    width: 32,
                    height: 32,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <ImageSquare
                    size={16}
                    weight="regular"
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      transition: 'color 0.15s',
                    }}
                  />
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <motion.button
                  onClick={() => setWebSearch((v) => !v)}
                  whileHover={reducedMotion ? undefined : { scale: 1.08, background: webSearch ? `${activeModel.color}28` : 'rgba(255, 255, 255, 0.14)' }}
                  whileTap={reducedMotion ? undefined : { scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  className="flex cursor-pointer items-center justify-center rounded-xl"
                  style={{
                    width: 32,
                    height: 32,
                    background: webSearch ? `${activeModel.color}18` : 'rgba(255, 255, 255, 0.08)',
                    border: webSearch ? `1px solid ${activeModel.color}22` : '1px solid rgba(255, 255, 255, 0.12)',
                    transition: 'background 0.15s, border 0.15s',
                  }}
                >
                  <GlobeSimple
                    size={16}
                    weight="regular"
                    style={{
                      color: webSearch ? activeModel.color : 'rgba(255, 255, 255, 0.5)',
                      transition: 'color 0.15s',
                    }}
                  />
                </motion.button>

                <AnimatePresence>
                  {showWebLabel && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-[10px] font-semibold"
                      style={{ color: `${activeModel.color}88` }}
                    >
                      Web search on
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                onClick={handleSend}
                disabled={!canSend}
                animate={{
                  background: canSend
                    ? `${activeModel.color}40`
                    : 'rgba(255, 255, 255, 0.06)',
                  border: canSend
                    ? `1px solid ${activeModel.color}66`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                }}
                whileHover={
                  canSend && !reducedMotion ? { scale: 1.08 } : undefined
                }
                whileTap={
                  canSend && !reducedMotion ? { scale: 0.88 } : undefined
                }
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                className="flex cursor-pointer items-center justify-center rounded-xl"
                style={{
                  width: 36,
                  height: 36,
                  opacity: canSend ? 1 : 0.4,
                  pointerEvents: canSend ? 'auto' : 'none',
                }}
              >
                <PaperPlaneRight
                  size={16}
                  weight="regular"
                  style={{
                    color: canSend
                      ? activeModel.color
                      : 'rgba(255, 255, 255, 0.3)',
                    transition: 'color 0.15s',
                  }}
                />
              </motion.button>
            </div>
          </div>

          <div
            className="mx-4 h-[1px]"
            style={{ background: 'rgba(255, 255, 255, 0.07)' }}
          />

          <div className="relative z-10 px-3 py-2.5">
            <ModelSwitcher activeModel={activeModel} onSelect={setActiveModel} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
