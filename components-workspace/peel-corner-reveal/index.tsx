'use client'
// npm install framer-motion qrcode.react

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

function useTheme(ref: RefObject<HTMLElement | null>): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    if (typeof document === 'undefined') return
    const el = ref.current
    const update = () => {
      const card = el?.closest('[data-card-theme]') ?? null
      const dark = card
        ? card.classList.contains('dark')
        : document.documentElement.classList.contains('dark')
      setTheme(dark ? 'dark' : 'light')
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el?.closest('[data-card-theme]')
    if (cardWrapper) {
      observer.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    }
    return () => observer.disconnect()
  }, [ref])
  return theme
}








const PEEL_FILL = '#1A9D51'
const PEEL_FILL_DEEP = '#127A3D'
const PEEL_INK = '#FFFFFF'


const VB_W = 500
const VB_H = 620
const CARD_W = 320
const CARD_H = 440
const CARD_X = 90
const CARD_Y = 70
const CARD_RADIUS = 12


const TL = { x: CARD_X, y: CARD_Y }
const TR = { x: CARD_X + CARD_W, y: CARD_Y }
const BR = { x: CARD_X + CARD_W, y: CARD_Y + CARD_H }
const BL = { x: CARD_X, y: CARD_Y + CARD_H }


const REST_W_PCT = 0.22
const REST_H_PCT = 0.18
const OPEN_W_PCT = 0.78
const OPEN_H_PCT = 0.9


const BOB_AMPLITUDE = 2.4

export default function PeelCornerReveal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const theme = useTheme(containerRef)
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const qrGroupRef = useRef<SVGGElement>(null)

  const PAGE_BG = theme === 'dark' ? '#2E2E2C' : '#D0CCC4'
  const CARD_FILL = theme === 'dark' ? '#FFFFFF' : '#121212'
  const CARD_INK = theme === 'dark' ? '#0A0A0A' : '#F5F5F0'
  const FOLD_STROKE = theme === 'dark' ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.22)'
  const DIVIDER_STROKE = theme === 'dark' ? CARD_INK : '#FFFFFF'
  const DROP_SHADOW = theme === 'dark'
    ? '4px 4px 24px rgba(0,0,0,0.55)'
    : '4px 4px 24px rgba(20,15,10,0.28)'

  const target = useMotionValue(0)
  useEffect(() => {
    target.set(isOpen ? 1 : isHovered ? 0.18 : 0)
  }, [isOpen, isHovered, target])
  const progress = useSpring(target, { stiffness: 170, damping: 22, mass: 0.9 })

  const w = useTransform(
    progress,
    [0, 1],
    [REST_W_PCT * CARD_W, OPEN_W_PCT * CARD_W],
  )
  const h = useTransform(
    progress,
    [0, 1],
    [REST_H_PCT * CARD_H, OPEN_H_PCT * CARD_H],
  )

  const Ax = useTransform(w, (v) => BR.x - v)
  const Ay = useMotionValue(BR.y)
  const Bx = useMotionValue(BR.x)
  const By = useTransform(h, (v) => BR.y - v)

  const Cx = useTransform<number, number>([Ax, By], ([ax, by]) => {
    const dx = BR.x - ax
    const dy = by - BR.y
    const len2 = dx * dx + dy * dy
    if (len2 === 0) return BR.x
    const t = (dx * dx) / len2
    const footX = ax + t * dx
    return 2 * footX - BR.x
  })
  const Cy = useTransform<number, number>([Ax, By], ([ax, by]) => {
    const dx = BR.x - ax
    const dy = by - BR.y
    const len2 = dx * dx + dy * dy
    if (len2 === 0) return BR.y
    const t = (dx * dx) / len2
    const footY = BR.y + t * dy
    return 2 * footY - BR.y
  })

  const angle = useTransform<number, number>([Ax, By], ([ax, by]) => {
    const dy = by - BR.y
    const dx = BR.x - ax
    return (Math.atan2(dy, dx) * 180) / Math.PI
  })

  const cardPoints = useMotionTemplate`${TL.x},${TL.y} ${TR.x},${TR.y} ${Bx},${By} ${Ax},${Ay} ${BL.x},${BL.y}`

  const cardPath = useMotionTemplate`M ${TL.x + CARD_RADIUS} ${TL.y} L ${TR.x - CARD_RADIUS} ${TR.y} A ${CARD_RADIUS} ${CARD_RADIUS} 0 0 1 ${TR.x} ${TR.y + CARD_RADIUS} L ${Bx} ${By} L ${Ax} ${Ay} L ${BL.x + CARD_RADIUS} ${BL.y} A ${CARD_RADIUS} ${CARD_RADIUS} 0 0 1 ${BL.x} ${BL.y - CARD_RADIUS} L ${TL.x} ${TL.y + CARD_RADIUS} A ${CARD_RADIUS} ${CARD_RADIUS} 0 0 1 ${TL.x + CARD_RADIUS} ${TL.y} Z`

  const peelPoints = useMotionTemplate`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`

  const foldX1 = Ax
  const foldY1 = Ay
  const foldX2 = Bx
  const foldY2 = By

  const foldMidX = useTransform<number, number>([Ax, Bx], ([ax, bx]) => (ax + bx) / 2)
  const foldMidY = useTransform<number, number>([Ay, By], ([ay, by]) => (ay + by) / 2)

  const bobRaw = useMotionValue(0)
  useEffect(() => {
    let raf = 0
    let alive = true
    const start = performance.now()
    function tick(now: number) {
      if (!alive) return
      const t = (now - start) / 1000
      bobRaw.set(Math.sin(t * 1.2) * BOB_AMPLITUDE)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [bobRaw])
  const bobGate = useTransform(progress, [0, 0.4], [1, 0])
  const bobY = useTransform<number, number>(
    [bobRaw, bobGate],
    ([b, g]) => b * g,
  )


  function handleToggle() {
    setIsOpen((v) => !v)
  }
  function handleKey(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen((v) => !v)
    }
  }

  const revealOpacity = useTransform(progress, [0.35, 0.75], [0, 1])

  const QR_SIZE = 110
  const QR_ALONG_FRAC = 0.3
  const QR_PERP_FRAC = 0.7

  const QR_OFFSET_X = 54
  const QR_OFFSET_Y = 18
  const qrAnchorX = useTransform<number, number>(
    [Ax, Bx, Cx],
    ([ax, bx, cx]) =>
      ax + QR_ALONG_FRAC * (bx - ax) + (QR_PERP_FRAC / 2) * (cx - BR.x) + QR_OFFSET_X,
  )
  const qrAnchorY = useTransform<number, number>(
    [Ay, By, Cy],
    ([ay, by, cy]) =>
      ay + QR_ALONG_FRAC * (by - ay) + (QR_PERP_FRAC / 2) * (cy - BR.y) + QR_OFFSET_Y,
  )

  const qrAngle = useTransform(angle, (a) => a + 31)
  const qrTransform = useMotionTemplate`translate(${qrAnchorX} ${qrAnchorY}) rotate(${qrAngle})`

  useMotionValueEvent(qrTransform, 'change', (latest) => {
    qrGroupRef.current?.setAttribute('transform', latest)
  })

  useEffect(() => {
    const el = qrGroupRef.current
    if (!el) return
    el.setAttribute('transform', qrTransform.get())
  }, [qrTransform])

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-10"
      style={{ background: PAGE_BG }}
    >
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={isOpen ? 'Hide Wi-Fi credentials' : 'Show Wi-Fi credentials'}
        aria-pressed={isOpen}
        onTap={handleToggle}
        onKeyDown={handleKey}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-[440px] cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A9D51] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-[20px]"
        style={{ y: bobY, filter: `drop-shadow(${DROP_SHADOW})` }}
      >

        <motion.svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          xmlns="http://www.w3.org/2000/svg"
          className="block h-auto w-full"
          style={{ rotate: 3, transformOrigin: '50% 50%' }}
          aria-hidden
        >
          <defs>
            <motion.linearGradient
              id="pcr-peel-gradient"
              gradientUnits="userSpaceOnUse"
              x1={foldMidX}
              y1={foldMidY}
              x2={Cx}
              y2={Cy}
            >
              <stop offset="0%" stopColor={PEEL_FILL_DEEP} />
              <stop offset="22%" stopColor={PEEL_FILL} />
              <stop offset="100%" stopColor={PEEL_FILL} />
            </motion.linearGradient>

            <clipPath id="pcr-peel-clip">
              <motion.polygon points={peelPoints} />
            </clipPath>

            <clipPath id="pcr-card-clip">
              <motion.path d={cardPath} />
            </clipPath>
          </defs>

          <motion.g>
            <motion.path d={cardPath} fill={CARD_FILL} />
          </motion.g>

          <g clipPath="url(#pcr-card-clip)">
            <g
              transform={`translate(${CARD_X + 24}, ${CARD_Y + 62}) scale(1.5)`}
              stroke={PEEL_FILL}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <circle cx="8" cy="12.5" r="1.4" fill={PEEL_FILL} />
              <motion.path
                d="M4 9 Q8 5 12 9"
                animate={{ opacity: [0.15, 1, 0.15] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  times: [0, 0.2, 1],
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0,
                }}
              />
              <motion.path
                d="M1 6 Q8 -1 15 6"
                animate={{ opacity: [0.1, 0.9, 0.1] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  times: [0, 0.25, 1],
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.25,
                }}
              />
              <motion.path
                d="M-2 3 Q8 -7 18 3"
                animate={{ opacity: [0.05, 0.6, 0.05] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  times: [0, 0.3, 1],
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.5,
                }}
              />
            </g>

            <text
              x={CARD_X + 24}
              y={CARD_Y + 190}
              fill={CARD_INK}
              fontFamily="var(--font-sans, ui-sans-serif, system-ui, sans-serif)"
              fontSize={96}
              fontWeight={900}
              letterSpacing={-3}
              style={{ lineHeight: 0.9 }}
            >
              Free
            </text>
            <text
              x={CARD_X + 24}
              y={CARD_Y + 276}
              fill={CARD_INK}
              fontFamily="var(--font-sans, ui-sans-serif, system-ui, sans-serif)"
              fontSize={96}
              fontWeight={900}
              letterSpacing={-3}
              style={{ lineHeight: 0.9 }}
            >
              Wi-Fi
            </text>

            <line
              x1={CARD_X + 40}
              y1={CARD_Y + 316}
              x2={CARD_X + 140}
              y2={CARD_Y + 316}
              stroke={DIVIDER_STROKE}
              strokeWidth={1}
              opacity={0.15}
            />

            <text
              x={CARD_X + 24}
              y={CARD_Y + CARD_H - 20}
              fill={PEEL_FILL}
              fontFamily="var(--font-sans, ui-sans-serif, system-ui, sans-serif)"
              fontSize={9}
              fontWeight={900}
              letterSpacing={2.5}
            >
              TAP TO SCAN
            </text>
          </g>

          <motion.g>
            <motion.polygon
              points={peelPoints}
              fill="url(#pcr-peel-gradient)"
            />
          </motion.g>

          <motion.line
            x1={foldX1}
            y1={foldY1}
            x2={foldX2}
            y2={foldY2}
            stroke={FOLD_STROKE}
            strokeWidth={1.1}
            strokeLinecap="round"
          />

          <motion.g
            clipPath="url(#pcr-peel-clip)"
            style={{ opacity: revealOpacity }}
          >
            <g ref={qrGroupRef}>
              <foreignObject
                x={-QR_SIZE / 2}
                y={-QR_SIZE / 2}
                width={QR_SIZE}
                height={QR_SIZE}
              >
                <div
                  style={{
                    width: QR_SIZE,
                    height: QR_SIZE,
                    padding: 6,
                    background: '#FFFFFF',
                    borderRadius: 6,
                    boxSizing: 'border-box',
                  }}
                >
                  <QRCodeSVG
                    // Escape \ ; , : in the Wi-Fi name and password with a backslash, or phones misread them.
                    value="WIFI:S:SlowBrew_4G;T:WPA;P:BREW_ME_BABY!;;"
                    size={QR_SIZE - 12}
                    level="M"
                    bgColor="#FFFFFF"
                    fgColor="#0A0A0A"
                    style={{ display: 'block' }}
                  />
                </div>
              </foreignObject>
            </g>
          </motion.g>

        </motion.svg>
      </motion.div>
    </div>
  )
}
