'use client'

import { useState, useEffect } from 'react'


const CYAN     = '#55E8E2'
const CYAN_OFF  = 'rgba(85,232,226,0.055)'
const CYAN_IDLE = 'rgba(85,232,226,0.28)'
const CYAN_DIM  = 'rgba(85,232,226,0.65)'
const BG       = '#060a0a'
const GLOW_SVG = `drop-shadow(0 0 3px ${CYAN}) drop-shadow(0 0 8px ${CYAN}99)`
const GLOW_TXT = `0 0 5px ${CYAN}, 0 0 11px ${CYAN}88`


const VW = 42, VH = 80
const T  = 6
const BV = 3
const GP = 2

function hPts(y: number): string {
  const x1 = GP + BV, x2 = VW - GP - BV, cy = y + T / 2
  return `${GP},${cy} ${x1},${y} ${x2},${y} ${VW-GP},${cy} ${x2},${y+T} ${x1},${y+T}`
}

function vPts(x: number, y1: number, y2: number): string {
  const cx = x + T / 2
  return `${cx},${y1} ${x+T},${y1+BV} ${x+T},${y2-BV} ${cx},${y2} ${x},${y2-BV} ${x},${y1+BV}`
}

const aY = GP, gY = VH / 2 - T / 2, dY = VH - GP - T
const lX = GP, rX = VW - GP - T


const aEnd = aY,         gTop = gY - GP
const gEnd = gY + T + GP, dTop = dY + T

const SHAPES = [
  hPts(aY),
  vPts(rX, aEnd, gTop),
  vPts(rX, gEnd, dTop),
  hPts(dY),
  vPts(lX, gEnd, dTop),
  vPts(lX, aEnd, gTop),
  hPts(gY),
]


const SEG: Record<string, boolean[]> = {
  '0': [true,  true,  true,  true,  true,  true,  false],
  '1': [false, true,  true,  false, false, false, false],
  '2': [true,  true,  false, true,  true,  false, true ],
  '3': [true,  true,  true,  true,  false, false, true ],
  '4': [false, true,  true,  false, false, true,  true ],
  '5': [true,  false, true,  true,  false, true,  true ],
  '6': [true,  false, true,  true,  true,  true,  true ],
  '7': [true,  true,  true,  false, false, false, false],
  '8': [true,  true,  true,  true,  true,  true,  true ],
  '9': [true,  true,  true,  true,  false, true,  true ],
}


function Digit({ char, size }: { char: string; size: number }) {
  const segs = SEG[char] ?? SEG['8']
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={size}
      height={Math.round(size * VH / VW)}
      style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
    >
      {SHAPES.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill={segs[i] ? CYAN : CYAN_OFF}
          style={segs[i] ? { filter: GLOW_SVG } : undefined}
        />
      ))}
    </svg>
  )
}


function ColonDots({ dim, size }: { dim: boolean; size: number }) {
  return (
    <svg
      viewBox={`0 0 ${VW * 0.44} ${VH}`}
      width={Math.round(size * 0.44)}
      height={Math.round(size * VH / VW)}
      style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
    >
      {([0.30, 0.68] as const).map((yf, i) => (
        <circle
          key={i}
          cx={VW * 0.22}
          cy={VH * yf}
          r={VW * 0.125}
          fill={dim ? CYAN_OFF : CYAN}
          style={dim ? undefined : { filter: GLOW_SVG }}
        />
      ))}
    </svg>
  )
}


const pad2 = (n: number) => n.toString().padStart(2, '0')
const DAYS  = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const

type Now = {
  h: string
  m: string
  s: string
  isPM: boolean
  dow: number
  date: string
}

function getNow(): Now {
  const d = new Date()
  const h = d.getHours()
  return {
    h:    pad2(h % 12 || 12),
    m:    pad2(d.getMinutes()),
    s:    pad2(d.getSeconds()),
    isPM: h >= 12,
    dow:  d.getDay(),
    date: d.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }).toUpperCase(),
  }
}


const BIG       = 50
const SML       = 24
const GAP       = 3
const COLON_BIG = Math.round(BIG * 0.44)
const COLON_SML = Math.round(SML * 0.44)

const TIME_W    = 4 * BIG + COLON_BIG + COLON_SML + 2 * SML + 7 * GAP



export default function NeonClock() {
  // Start null: reading the clock during render makes server and client HTML differ.
  const [now,     setNow]     = useState<Now | null>(null)
  const [colonOn, setColonOn] = useState(true)

  useEffect(() => {
    setNow(getNow())
    const id = setInterval(() => {
      setNow(getNow())
      setColonOn(c => !c)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  if (now === null) {
    return (
      <div
        className="relative flex h-full w-full select-none items-center justify-center overflow-hidden"
        style={{ background: BG, fontFamily: '"Courier New", Courier, monospace' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.48) 1.3px, transparent 1.3px)',
            backgroundSize: '3.8px 3.8px',
          }}
        />
      </div>
    )
  }

  return (
    <div
      className="relative flex h-full w-full select-none items-center justify-center overflow-hidden"
      style={{ background: BG, fontFamily: '"Courier New", Courier, monospace' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: GAP }}>
          <Digit char={now.h[0]} size={BIG} />
          <Digit char={now.h[1]} size={BIG} />
          <ColonDots dim={false} size={BIG} />
          <Digit char={now.m[0]} size={BIG} />
          <Digit char={now.m[1]} size={BIG} />
          <ColonDots dim={!colonOn} size={SML} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 6, fontSize: 13, letterSpacing: '0.08em', marginBottom: 3 }}>
              <span style={{ color: !now.isPM ? CYAN : CYAN_IDLE, textShadow: !now.isPM ? GLOW_TXT : 'none' }}>AM</span>
              <span style={{ color:  now.isPM ? CYAN : CYAN_IDLE, textShadow:  now.isPM ? GLOW_TXT : 'none' }}>PM</span>
            </div>
            <div style={{ display: 'flex', gap: GAP }}>
              <Digit char={now.s[0]} size={SML} />
              <Digit char={now.s[1]} size={SML} />
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: TIME_W,
            marginTop: 13,
            fontSize: 13,
            letterSpacing: '0.05em',
          }}
        >
          {DAYS.map((d, i) => (
            <span
              key={d}
              style={{
                color:      i === now.dow ? CYAN        : CYAN_IDLE,
                textShadow: i === now.dow ? GLOW_TXT    : 'none',
              }}
            >
              {d}
            </span>
          ))}
        </div>

        <div
          style={{
            width: TIME_W,
            marginTop: 5,
            textAlign: 'center',
            fontSize: 13,
            letterSpacing: '0.1em',
            color: CYAN_DIM,
          }}
        >
          {now.date}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.48) 1.3px, transparent 1.3px)',
          backgroundSize: '3.8px 3.8px',
        }}
      />
    </div>
  )
}
