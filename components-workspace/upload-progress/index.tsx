'use client'
// npm install @phosphor-icons/react framer-motion
/**
 * Presents simulated file uploads in a collapsible progress card.
 * Each transfer can be paused, resumed, canceled, or restarted after completion.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pause,
  Play,
  ArrowCounterClockwise,
  X,
  ArrowsOutSimple,
  ArrowsInSimple,
} from '@phosphor-icons/react'

// customize: replace the simulated files and durations below
const FILES = [
  { name: 'Brand reel.mp4', durationMs: 8000 },
  { name: 'Product demo.mp4', durationMs: 12500 },
  { name: 'Hero animation.mp4', durationMs: 16000 },
]

type Status = 'uploading' | 'paused' | 'complete' | 'idle'

const SPRING = { type: 'spring' as const, stiffness: 380, damping: 30 }
const CARD_SHADOW = '0px 16px 56px rgba(0,0,0,0.14)'

function useDarkMode(ref: React.RefObject<HTMLElement | null>) {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const scope = el.closest('[data-card-theme]') as HTMLElement | null
      if (scope) { setIsDark(scope.dataset.cardTheme === 'dark'); return }
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    // Watch the card wrapper too. Its own light/dark switch changes only the
    // wrapper, never <html>, so observing the document alone leaves this stuck
    // on whatever it read first.
    const scope = el.closest('[data-card-theme]')
    if (scope) obs.observe(scope, { attributes: true, attributeFilter: ['class', 'data-card-theme'] })
    return () => obs.disconnect()
  }, [ref])
  return isDark
}

export default function UploadProgress() {
  const rootRef = useRef<HTMLDivElement>(null)
  const isDark = useDarkMode(rootRef)

  const [status, setStatus] = useState<Status>('uploading')
  const [expanded, setExpanded] = useState(false)
  const [progress, setProgress] = useState([0, 0, 0])
  const progressRef = useRef([0, 0, 0])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status !== 'uploading') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    intervalRef.current = setInterval(() => {
      const next = progressRef.current.map((p, i) =>
        Math.min(100, p + (100 / FILES[i].durationMs) * 80)
      )
      progressRef.current = next
      setProgress([...next])
      if (next.every(p => p >= 100)) setStatus('complete')
    }, 80)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [status])

  useEffect(() => {
    if (status !== 'complete') return
    const t = setTimeout(() => {
      progressRef.current = [0, 0, 0]
      setProgress([0, 0, 0])
      setStatus('idle')
    }, 2000)
    return () => clearTimeout(t)
  }, [status])

  const overallPct = Math.round(progress.reduce((a, b) => a + b, 0) / FILES.length)
  const secondsLeft = Math.max(
    0,
    Math.round(((100 - progress[2]) / 100) * FILES[2].durationMs / 1000)
  )

  function togglePause() {
    setStatus(s => (s === 'uploading' ? 'paused' : 'uploading'))
  }

  function handleStop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    progressRef.current = [0, 0, 0]
    setProgress([0, 0, 0])
    setStatus('idle')
  }

  function handleRefresh() {
    progressRef.current = [0, 0, 0]
    setProgress([0, 0, 0])
    setStatus('uploading')
  }

  function startUpload() {
    progressRef.current = [0, 0, 0]
    setProgress([0, 0, 0])
    setStatus('uploading')
  }

  const isDone = status === 'complete'
  const isPaused = status === 'paused'

  const cardBg = isDark ? '#262623' : '#f1f1f0'
  const titleColor = isDark ? '#f1f1ec' : '#1a1a18'
  const mutedColor = isDark ? '#9a9a94' : '#6c6c6c'
  const btnBg = isDark ? '#34342f' : '#ededea'
  const btnColor = isDark ? '#b8b8b0' : '#6c6c6c'
  const dividerColor = isDark ? '#34342f' : '#e4e4dc'
  const trackColor = isDark ? '#34342f' : '#e4e4dc'

  const subtitle = isDone
    ? 'Upload complete'
    : isPaused
    ? `${overallPct}% · Paused`
    : `${overallPct}% · ${secondsLeft}s left`

  return (
    <div ref={rootRef} className="flex min-h-screen w-full items-center justify-center bg-[#E8E8DF] px-4 dark:bg-[#1A1A19]">
      <div className="w-full max-w-[480px]">
        <AnimatePresence mode="wait">
          {status === 'idle' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={SPRING}
              className="flex justify-center"
            >
              <motion.button
                onClick={startUpload}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={SPRING}
                style={{
                  backgroundColor: isDark ? '#f1f1f0' : '#1a1a18',
                  color: isDark ? '#1a1a18' : '#f1f1f0',
                  borderRadius: 9999,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                }}
                className="px-7 py-3.5 font-sans text-[15px] font-bold"
              >
                Upload Files
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={SPRING}
              style={{
                backgroundColor: cardBg,
                borderRadius: 28,
                boxShadow: CARD_SHADOW,
                overflow: 'hidden',
                position: 'relative',
              }}
            >

              {}
              <div className="flex items-start justify-between px-6 pt-5 pb-4">
                <div className="min-w-0 flex-1 pr-3">
                  <h2
                    style={{ color: titleColor }}
                    className="font-sans text-[18px] font-bold leading-tight"
                  >
                    {isDone ? 'Upload complete' : `Uploading ${FILES.length} files`}
                  </h2>
                  <AnimatePresence mode="wait" initial={false}>
                    {!expanded && (
                      <motion.p
                        key={status}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.15 }}
                        style={{ color: mutedColor }}
                        className="mt-0.5 whitespace-nowrap font-sans text-[14px] font-medium"
                      >
                        {isDone ? 'Upload complete' : (
                          <>
                            <span className="inline-block min-w-[2.5rem] tabular-nums">
                              {overallPct}%
                            </span>
                            {' · '}
                            {isPaused ? 'Paused' : `${secondsLeft}s left`}
                          </>
                        )}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {}
                <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
                  {}
                  <AnimatePresence initial={false}>
                    {!isDone && (
                      <motion.div
                        key="upload-controls-left"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={SPRING}
                        className="flex items-center gap-1.5"
                      >
                        {}
                        <IconBtn onClick={togglePause} bg={btnBg} color={btnColor}>
                          <AnimatePresence mode="wait" initial={false}>
                            {isPaused ? (
                              <motion.span
                                key="play-icon"
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={SPRING}
                                className="flex"
                              >
                                <Play size={15} weight="regular" />
                              </motion.span>
                            ) : (
                              <motion.span
                                key="pause-icon"
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={SPRING}
                                className="flex"
                              >
                                <Pause size={15} weight="regular" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </IconBtn>

                        {}
                        <IconBtn onClick={handleRefresh} bg={btnBg} color={btnColor}>
                          <ArrowCounterClockwise size={15} weight="regular" />
                        </IconBtn>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {}
                  <IconBtn
                    onClick={() => setExpanded(e => !e)}
                    bg={btnBg}
                    color={btnColor}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {expanded ? (
                        <motion.span
                          key="collapse-icon"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={SPRING}
                          className="flex"
                        >
                          <ArrowsInSimple size={15} weight="regular" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="expand-icon"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={SPRING}
                          className="flex"
                        >
                          <ArrowsOutSimple size={15} weight="regular" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </IconBtn>

                  {}
                  <AnimatePresence initial={false}>
                    {!isDone && (
                      <motion.div
                        key="close-control"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={SPRING}
                        className="flex items-center"
                      >
                        {}
                        <IconBtn onClick={handleStop} bg={btnBg} color={btnColor}>
                          <X size={15} weight="regular" />
                        </IconBtn>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    key="file-list"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      height: { type: 'spring', stiffness: 380, damping: 38 },
                      opacity: { duration: 0.16 },
                    }}
                  >
                    <div
                      style={{
                        height: 1,
                        backgroundColor: dividerColor,
                        marginLeft: 24,
                        marginRight: 24,
                      }}
                    />
                    {FILES.map((f, i) => {
                      const pct = Math.round(progress[i])
                      const secs = Math.max(
                        0,
                        Math.round(((100 - progress[i]) / 100) * f.durationMs / 1000)
                      )
                      const fsub = isDone
                        ? 'Complete'
                        : isPaused
                        ? `${pct}% · Paused`
                        : `${pct}% · ${secs}s left`

                      return (
                        <div key={f.name} className="px-6 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <span
                              style={{ color: titleColor }}
                              className="min-w-0 truncate font-sans text-[15px] font-bold"
                            >
                              {f.name}
                            </span>
                            <span
                              style={{ color: mutedColor }}
                              className="shrink-0 whitespace-nowrap font-sans text-[13px] font-medium"
                            >
                              {fsub}
                            </span>
                          </div>
                          <div
                            style={{ backgroundColor: trackColor }}
                            className="mt-2 h-[3px] overflow-hidden rounded-full"
                          >
                            <motion.div
                              className="h-full rounded-full"
                              animate={{
                                width: `${progress[i]}%`,
                                backgroundColor: isPaused ? '#f59e0b' : '#6366f1',
                              }}
                              transition={{
                                width: { duration: 0.08, ease: 'linear' },
                                backgroundColor: { duration: 0.35, ease: 'easeOut' },
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                    <div className="h-2" />
                  </motion.div>
                )}
              </AnimatePresence>

              {}
              <AnimatePresence initial={false}>
                {!expanded && (
                  <motion.div
                    key="bottom-bar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div style={{ backgroundColor: trackColor, height: 6, overflow: 'hidden' }}>
                      <motion.div
                        className="h-full relative overflow-hidden"
                        animate={{
                          width: `${overallPct}%`,
                          backgroundColor: isPaused ? '#f59e0b' : '#6366f1',
                        }}
                        transition={{
                          width: { duration: 0.08, ease: 'linear' },
                          backgroundColor: { duration: 0.35, ease: 'easeOut' },
                        }}
                      >
                        <motion.div
                          className="absolute inset-y-0 w-1/2"
                          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.35), transparent)' }}
                          animate={{ x: isPaused ? '-100%' : ['-100%', '250%'] }}
                          transition={isPaused
                            ? { duration: 0 }
                            : { duration: 1.6, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }
                          }
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function IconBtn({
  onClick,
  bg,
  color,
  children,
}: {
  onClick: () => void
  bg: string
  color: string
  children: React.ReactNode
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      style={{ backgroundColor: bg, color }}
      className="flex size-9 items-center justify-center rounded-full"
    >
      {children}
    </motion.button>
  )
}
