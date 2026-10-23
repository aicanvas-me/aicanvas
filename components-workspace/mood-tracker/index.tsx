'use client'

// npm install framer-motion
// font: Manrope

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useId,
  useCallback,
} from 'react'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect










type Theme = 'light' | 'dark'

function readTheme(el: HTMLElement | null): Theme {
  if (typeof document === 'undefined') return 'dark'
  const card = el?.closest('[data-card-theme]')
  if (card) return card.classList.contains('dark') ? 'dark' : 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function useTheme(rootRef: React.RefObject<HTMLElement | null>): Theme {
  const [theme, setTheme] = useState<Theme>(() => readTheme(rootRef.current))
  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current
    setTheme(readTheme(el))
    if (typeof document === 'undefined') return
    const update = () => setTheme(readTheme(el))
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    const card = el?.closest('[data-card-theme]')
    if (card) {
      observer.observe(card, {
        attributes: true,
        attributeFilter: ['class', 'data-card-theme'],
      })
    }
    return () => observer.disconnect()
  }, [rootRef])
  return theme
}



function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) =>
    Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function lerpHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return rgbToHex([
    ca[0] + (cb[0] - ca[0]) * t,
    ca[1] + (cb[1] - ca[1]) * t,
    ca[2] + (cb[2] - ca[2]) * t,
  ])
}


function tintHex(hex: string, t: number): string {
  return lerpHex(hex, '#FFFFFF', t)
}


const DARK_NEUTRAL = '#1B1B22'


function shadeHex(hex: string, t: number): string {
  return lerpHex(hex, DARK_NEUTRAL, t)
}


function inkHex(hex: string): string {
  return lerpHex(hex, '#14140F', 0.82)
}








interface FaceProps {
  size: number | string
}

const STROKE_W = 2.6

function eyeWhite() {
  return '#FFFFFF'
}


function FrustratedFace({ size }: FaceProps) {
  const ink = '#5A1E0E'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <rect x="8" y="8" width="48" height="48" rx="16" fill="#CB5E3E" />
      <rect x="8" y="8" width="48" height="48" rx="16" fill="url(#fr-sheen)" opacity="0.18" />
      <defs>
        <linearGradient id="fr-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M17 24 L27 28" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" />
      <path d="M47 24 L37 28" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" />
      <circle cx="24" cy="33" r="3.4" fill={ink} />
      <circle cx="40" cy="33" r="3.4" fill={ink} />
      <path d="M23 45 H41" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" />
    </svg>
  )
}


function SurprisedFace({ size }: FaceProps) {
  const body = '#E5A85E'
  const ink = '#6B3F12'
  const lobes = 9
  let d = ''
  for (let i = 0; i < lobes; i++) {
    const a0 = (i / lobes) * Math.PI * 2
    const a1 = ((i + 1) / lobes) * Math.PI * 2
    const am = (a0 + a1) / 2
    const rIn = 21
    const rOut = 26
    const x0 = 32 + Math.cos(a0) * rIn
    const y0 = 32 + Math.sin(a0) * rIn
    const xm = 32 + Math.cos(am) * rOut
    const ym = 32 + Math.sin(am) * rOut
    const x1 = 32 + Math.cos(a1) * rIn
    const y1 = 32 + Math.sin(a1) * rIn
    if (i === 0) d += `M ${x0.toFixed(1)} ${y0.toFixed(1)} `
    d += `Q ${xm.toFixed(1)} ${ym.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)} `
  }
  d += 'Z'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <path d={d} fill={body} />
      <circle cx="25" cy="30" r="5" fill={eyeWhite()} />
      <circle cx="39" cy="30" r="5" fill={eyeWhite()} />
      <circle cx="25" cy="30" r="2.4" fill={ink} />
      <circle cx="39" cy="30" r="2.4" fill={ink} />
      <ellipse cx="32" cy="42" rx="3.4" ry="4.4" fill={ink} />
    </svg>
  )
}


function HappyFace({ size }: FaceProps) {
  const ink = '#6E5806'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <circle cx="32" cy="32" r="25" fill="#F2D44E" />
      <circle cx="20" cy="38" r="4" fill="#F0926B" opacity="0.7" />
      <circle cx="44" cy="38" r="4" fill="#F0926B" opacity="0.7" />
      <path d="M19 30 Q24 25 29 30" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" fill="none" />
      <path d="M35 30 Q40 25 45 30" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" fill="none" />
      <path d="M22 39 Q32 51 42 39 Z" fill={ink} />
    </svg>
  )
}


function UneasyFace({ size }: FaceProps) {
  const ink = '#3F551A'
  const d =
    'M32 8 C45 8 52 16 53 27 C54 37 50 44 53 50 C49 56 40 55 32 56 ' +
    'C24 57 14 56 11 49 C13 43 10 36 11 27 C13 16 19 8 32 8 Z'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <path d={d} fill="#A9C95E" />
      <circle cx="24" cy="31" r="3.4" fill={ink} />
      <circle cx="40" cy="31" r="3.4" fill={ink} />
      <path d="M20 26 Q24 24 28 26" stroke={ink} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M36 26 Q40 24 44 26" stroke={ink} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path
        d="M22 44 Q26 41 29 44 T35 44 T42 44"
        stroke={ink}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}


function SadFace({ size }: FaceProps) {
  const ink = '#1E5663'
  const d = 'M9 40 C9 21 22 8 32 8 C42 8 55 21 55 40 L55 50 Q55 56 49 56 L15 56 Q9 56 9 50 Z'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <path d={d} fill="#8AC7D8" />
      <path d="M19 30 Q24 34 29 30" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" fill="none" />
      <path d="M35 30 Q40 34 45 30" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" fill="none" />
      <path d="M40 33 C40 33 43 38 43 40 A2.6 2.6 0 0 1 37 40 C37 38 40 33 40 33 Z" fill="#E6F4F8" />
      <path d="M24 48 Q32 42 40 48" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" fill="none" />
    </svg>
  )
}


function AnxiousFace({ size }: FaceProps) {
  const ink = '#4A2A66'
  const d =
    'M32 7 Q39 7 43 13 L51 21 Q57 25 57 32 Q57 39 51 43 L43 51 Q39 57 32 57 ' +
    'Q25 57 21 51 L13 43 Q7 39 7 32 Q7 25 13 21 L21 13 Q25 7 32 7 Z'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <path d={d} fill="#BA8FD4" />
      <path d="M19 25 L28 28" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M45 25 L36 28" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="25" cy="33" r="3.2" fill={ink} />
      <circle cx="39" cy="33" r="3.2" fill={ink} />
      <path d="M27 46 Q32 42 37 46" stroke={ink} strokeWidth={STROKE_W} strokeLinecap="round" fill="none" />
    </svg>
  )
}





interface Mood {
  id: string
  label: string
  color: string
  Svg: (props: FaceProps) => React.ReactElement
}

// 6-digit hex only: two-digit alpha suffixes are appended to these colors.
const MOODS: readonly Mood[] = [
  { id: 'frustrated', label: 'Frustrated', color: '#CB5E3E', Svg: FrustratedFace },
  { id: 'surprised', label: 'Surprised', color: '#E5A85E', Svg: SurprisedFace },
  { id: 'happy', label: 'Happy', color: '#F2D44E', Svg: HappyFace },
  { id: 'uneasy', label: 'Uneasy', color: '#A9C95E', Svg: UneasyFace },
  { id: 'sad', label: 'Sad', color: '#8AC7D8', Svg: SadFace },
  { id: 'anxious', label: 'Anxious', color: '#BA8FD4', Svg: AnxiousFace },
]

const INITIAL_INDEX = 2






interface Blob {
  x: number
  y: number
  size: number
  tint: 'base' | 'soft'
  dx: number
  dy: number
  dur: number
}

const BLOBS: readonly Blob[] = [
  { x: 24, y: 30, size: 72, tint: 'base', dx: 8, dy: 6, dur: 11 },
  { x: 76, y: 26, size: 66, tint: 'soft', dx: 7, dy: 8, dur: 13 },
  { x: 34, y: 76, size: 78, tint: 'soft', dx: 9, dy: 5, dur: 15 },
  { x: 80, y: 74, size: 60, tint: 'base', dx: 6, dy: 9, dur: 12 },
  { x: 52, y: 50, size: 54, tint: 'base', dx: 10, dy: 7, dur: 17 },
]



export default function MoodTracker() {
  const rootRef = useRef<HTMLDivElement>(null)
  const theme = useTheme(rootRef)
  const isDark = theme === 'dark'
  const reduced = useReducedMotion() ?? false

  const uid = useId()
  const sliderId = `${uid}-mood`
  const labelId = `${uid}-label`

  const [index, setIndex] = useState(INITIAL_INDEX)
  const mood = MOODS[index]

  const CONFIRM_GREEN = '#3FA66A'
  const [saved, setSaved] = useState(false)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current)
    },
    [],
  )
  const onSave = useCallback(() => {
    if (saved) return
    setSaved(true)
    savedTimer.current = setTimeout(() => setSaved(false), 1600)
  }, [saved])

  const baseTint = useMemo(
    () => (isDark ? shadeHex(mood.color, 0.5) : tintHex(mood.color, 0.5)),
    [mood.color, isDark],
  )
  const softTint = useMemo(
    () => (isDark ? shadeHex(mood.color, 0.44) : tintHex(mood.color, 0.66)),
    [mood.color, isDark],
  )
  const panelWash = useMemo(
    () => (isDark ? shadeHex(mood.color, 0.56) : tintHex(mood.color, 0.62)),
    [mood.color, isDark],
  )
  const panelInk = useMemo(
    () => (isDark ? tintHex(mood.color, 0.88) : inkHex(mood.color)),
    [mood.color, isDark],
  )
  const cardTint = useMemo(
    () =>
      isDark
        ? lerpHex('#1A1A1E', mood.color, 0.1)
        : lerpHex('#FFFFFF', mood.color, 0.06),
    [mood.color, isDark],
  )
  const deepAccent = useMemo(() => lerpHex(mood.color, '#000000', 0.18), [mood.color])

  const setMood = useCallback((i: number) => {
    setIndex((prev) => {
      const next = clamp(i, 0, MOODS.length - 1)
      return next === prev ? prev : next
    })
  }, [])

  const onSliderKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      let next = index
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          next = index - 1
          break
        case 'ArrowRight':
        case 'ArrowUp':
          next = index + 1
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = MOODS.length - 1
          break
        default:
          return
      }
      e.preventDefault()
      setMood(next)
    },
    [index, setMood],
  )

  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const indexFromClientX = useCallback((clientX: number): number => {
    const el = trackRef.current
    if (!el) return index
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) return index
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    return clamp(Math.round(ratio * MOODS.length - 0.5), 0, MOODS.length - 1)
  }, [index])

  const onTrackPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      draggingRef.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      setMood(indexFromClientX(e.clientX))
    },
    [indexFromClientX, setMood],
  )

  const onTrackPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return
      setMood(indexFromClientX(e.clientX))
    },
    [indexFromClientX, setMood],
  )

  const onTrackPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      draggingRef.current = false
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    },
    [],
  )

  const handlePct = ((index + 0.5) / MOODS.length) * 100

  const titleColor = isDark ? '#F2F2F0' : '#16160F'
  const subColor = isDark ? '#8A8A86' : '#6B6B62'
  const legendIdle = isDark ? '#26262C' : '#F1F1EC'
  const cardShadow = isDark
    ? '0 24px 60px rgba(0,0,0,0.5)'
    : '0 24px 60px rgba(20,20,18,0.12)'
  const panelEdge = isDark
    ? `inset 0 0 0 1px ${tintHex(mood.color, 0.4)}33`
    : `inset 0 0 0 1px ${inkHex(mood.color)}1F`

  const enter = reduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
      }

  const facePop = reduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.78, y: 8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.78, y: -8 },
      }

  const BigSvg = mood.Svg

  return (
    <div
      ref={rootRef}
      className="flex min-h-screen w-full items-center justify-center p-4"
      style={{ background: isDark ? '#0E0E10' : '#EDEDE7' }}
    >
      <motion.div
        initial={enter.initial}
        animate={enter.animate}
        transition={
          reduced
            ? { duration: 0 }
            : { type: 'spring', stiffness: 220, damping: 26 }
        }
        className="relative w-full overflow-hidden rounded-3xl p-5"
        style={{
          maxWidth: 380,
          background: cardTint,
          boxShadow: cardShadow,
          transition: reduced ? undefined : 'background 0.5s ease',
          fontFamily:
            'Manrope, ui-sans-serif, system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 0,
            background: `radial-gradient(120% 70% at 50% 28%, ${mood.color}${
              isDark ? '24' : '1F'
            } 0%, ${mood.color}00 60%)`,
            transition: reduced ? undefined : 'background 0.5s ease',
          }}
        />

        <div className="relative flex flex-col gap-4" style={{ zIndex: 1 }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span
              className="text-[16px] font-bold leading-tight"
              style={{ color: titleColor }}
            >
              How are you feeling?
            </span>
            <span
              className="text-[12px] leading-tight"
              style={{ color: subColor, marginTop: 6 }}
            >
              Today · 6-day streak
            </span>
          </div>
          <motion.button
            type="button"
            onClick={onSave}
            disabled={saved}
            aria-label={saved ? 'Mood recorded' : 'Save mood'}
            aria-live="polite"
            className="relative inline-flex shrink-0 items-center justify-center [@media(hover:hover)]:hover:brightness-110"
            style={{
              minWidth: 44,
              minHeight: 44,
              padding: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              cursor: saved ? 'default' : 'pointer',
            }}
            whileHover={reduced || saved ? undefined : { scale: 1.04 }}
            whileTap={reduced || saved ? undefined : { scale: 0.94 }}
            transition={
              reduced
                ? { duration: 0 }
                : { type: 'spring', stiffness: 480, damping: 28 }
            }
          >
            <motion.span
              className="inline-flex items-center gap-1 rounded-full font-semibold leading-none"
              style={{
                paddingTop: 6,
                paddingBottom: 6,
                paddingLeft: 10,
                paddingRight: 10,
                fontSize: 12,
                background: saved
                  ? `${CONFIRM_GREEN}${isDark ? '33' : '24'}`
                  : isDark
                    ? `${mood.color}26`
                    : `${mood.color}1F`,
                color: saved
                  ? CONFIRM_GREEN
                  : isDark
                    ? '#F2F2F0'
                    : inkHex(mood.color),
                boxShadow: saved
                  ? `inset 0 0 0 1px ${CONFIRM_GREEN}55`
                  : `inset 0 0 0 1px ${mood.color}${isDark ? '40' : '33'}`,
                transition: reduced
                  ? undefined
                  : 'background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
              }}
              animate={
                reduced ? { scale: 1 } : { scale: saved ? [1, 1.12, 1] : 1 }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.36, times: [0, 0.5, 1], ease: 'easeOut' }
              }
            >
              {saved ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  focusable="false"
                >
                  <path
                    d="M5 12.5 L10 17.5 L19 7"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  focusable="false"
                >
                  <path
                    d="M6 3.5 H18 A1.5 1.5 0 0 1 19.5 5 V21 L12 16 L4.5 21 V5 A1.5 1.5 0 0 1 6 3.5 Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {saved ? 'Recorded' : 'Save'}
            </motion.span>
          </motion.button>
        </div>

        <div
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl"
          style={{
            background: panelWash,
            boxShadow: panelEdge,
            minHeight: 200,
            paddingTop: 20,
            paddingBottom: 20,
            transition: reduced ? undefined : 'background 0.5s ease',
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ filter: 'blur(26px)' }}
          >
            {BLOBS.map((blob, i) => {
              const color = blob.tint === 'base' ? baseTint : softTint
              const driftAnim = reduced
                ? { x: 0, y: 0 }
                : {
                    x: [0, blob.dx, -blob.dx * 0.6, 0],
                    y: [0, -blob.dy, blob.dy * 0.7, 0],
                  }
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${blob.x}%`,
                    top: `${blob.y}%`,
                    width: `${blob.size}%`,
                    aspectRatio: '1 / 1',
                    translateX: '-50%',
                    translateY: '-50%',
                    background: `radial-gradient(circle at 50% 50%, ${color}, ${color}00 70%)`,
                    opacity: isDark ? 0.85 : 0.7,
                    transition: 'background 0.45s ease',
                    willChange: 'transform',
                  }}
                  animate={driftAnim}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: blob.dur,
                          ease: 'easeInOut',
                          repeat: Infinity,
                          repeatType: 'loop',
                        }
                  }
                />
              )
            })}
          </div>

          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: isDark
                ? 'radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)'
                : 'radial-gradient(120% 90% at 50% 42%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 62%)',
            }}
          />

          <div className="relative flex flex-col items-center gap-3">
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 'clamp(96px, 30vw, 140px)',
                height: 'clamp(96px, 30vw, 140px)',
              }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={mood.id}
                  initial={facePop.initial}
                  animate={facePop.animate}
                  exit={facePop.exit}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 360, damping: 22 }
                  }
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    filter: isDark
                      ? 'drop-shadow(0 8px 18px rgba(0,0,0,0.30))'
                      : 'drop-shadow(0 8px 16px rgba(20,20,15,0.16))',
                  }}
                >
                  <BigSvg size={140} />
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={mood.label}
                id={labelId}
                initial={
                  reduced
                    ? { opacity: 1 }
                    : { opacity: 0, y: 8, filter: 'blur(4px)' }
                }
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={
                  reduced
                    ? { opacity: 0 }
                    : { opacity: 0, y: -8, filter: 'blur(4px)' }
                }
                transition={
                  reduced ? { duration: 0 } : { duration: 0.26, ease: 'easeOut' }
                }
                className="text-[24px] font-extrabold leading-none"
                style={{
                  color: panelInk,
                  letterSpacing: '-0.01em',
                  textShadow: isDark
                    ? '0 2px 12px rgba(0,0,0,0.30)'
                    : '0 1px 6px rgba(255,255,255,0.45)',
                }}
              >
                {mood.label}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium" style={{ color: subColor }}>
            Drag to set your mood
          </span>
          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Mood"
            aria-valuemin={1}
            aria-valuemax={MOODS.length}
            aria-valuenow={index + 1}
            aria-valuetext={mood.label}
            aria-describedby={labelId}
            onKeyDown={onSliderKey}
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
            onPointerUp={onTrackPointerUp}
            onPointerCancel={onTrackPointerUp}
            className="relative w-full cursor-pointer touch-none select-none"
            style={{ height: 44 }}
          >
            <div
              aria-hidden
              className="absolute left-0 right-0 flex overflow-hidden rounded-full"
              style={{ top: 16, height: 12 }}
            >
              {MOODS.map((m) => (
                <span
                  key={m.id}
                  className="h-full flex-1"
                  style={{ background: m.color }}
                />
              ))}
            </div>
            <motion.span
              aria-hidden
              className="absolute rounded-full"
              style={{
                top: 4,
                width: 36,
                height: 36,
                marginLeft: -18,
                background: '#FFFFFF',
                border: `4px solid ${deepAccent}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.28)',
              }}
              animate={{ left: `${handlePct}%` }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 480, damping: 34 }
              }
            >
              <span
                className="absolute inset-0 m-auto rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  background: mood.color,
                  transition: 'background 0.35s ease',
                }}
              />
            </motion.span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1.5" style={{ marginTop: 4 }}>
          {MOODS.map((m, i) => {
            const active = i === index
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(i)}
                aria-label={m.label}
                aria-pressed={active}
                className="flex items-center justify-center rounded-xl transition-colors"
                style={{
                  minHeight: 44,
                  padding: 8,
                  background: active ? `${m.color}22` : 'transparent',
                  outline: 'none',
                }}
              >
                <motion.span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: '100%',
                    maxWidth: 36,
                    aspectRatio: '1 / 1',
                    flexShrink: 0,
                    background: active ? legendIdle : 'transparent',
                    boxShadow: active ? `0 0 0 2px ${m.color}` : 'none',
                  }}
                  animate={
                    reduced ? { scale: 1 } : { scale: active ? 1.08 : 1 }
                  }
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 24 }
                  }
                >
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: '77.7777777778%',
                      maxWidth: 28,
                      aspectRatio: '1 / 1',
                    }}
                  >
                    <m.Svg size="100%" />
                  </span>
                </motion.span>
              </button>
            )
          })}
        </div>
        </div>
      </motion.div>
    </div>
  )
}
