'use client'

// npm install framer-motion geist
// font-pkg: geist/font/pixel|GeistPixelGrid

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GeistPixelGrid } from 'geist/font/pixel'






const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!'
const WORDS = ['DECRYPT', 'ACCESS']

function randomChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)] ?? 'X'
}

interface CharState {
  display: string
  resolved: boolean
}

const makeScrambled = (word: string): CharState[] =>
  word.split('').map(() => ({ display: randomChar(), resolved: false }))

function useScramble(word: string, isHovered: boolean) {
  const [chars, setChars] = useState<CharState[]>(() => makeScrambled(word))

  useEffect(() => {
    let cancelled = false
    const timeouts: ReturnType<typeof setTimeout>[] = []
    let scrambleInterval: ReturnType<typeof setInterval> | null = null

    function startScrambleInterval(resolvedSet: Set<number>) {
      if (scrambleInterval) clearInterval(scrambleInterval)
      scrambleInterval = setInterval(() => {
        if (cancelled) return
        setChars(prev =>
          prev.map((ch, i) => resolvedSet.has(i) ? ch : { display: randomChar(), resolved: false })
        )
      }, 60)
    }

    if (isHovered) {
      const resolvedSet = new Set<number>()
      startScrambleInterval(resolvedSet)
      word.split('').forEach((letter, i) => {
        const t = setTimeout(() => {
          if (cancelled) return
          resolvedSet.add(i)
          setChars(prev =>
            prev.map((ch, idx) => idx === i ? { display: letter, resolved: true } : ch)
          )
          if (resolvedSet.size === word.length && scrambleInterval) {
            clearInterval(scrambleInterval)
            scrambleInterval = null
          }
        }, 80 + i * 100)
        timeouts.push(t)
      })
    } else {
      setChars(makeScrambled(word))
      startScrambleInterval(new Set<number>())
    }

    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
      if (scrambleInterval) clearInterval(scrambleInterval)
    }
  }, [isHovered, word])

  return chars
}

function Crosshair({ style }: { style: React.CSSProperties }) {
  const color = 'rgba(190,207,93,0.35)'
  const arm = 14
  const gap = 3
  const thick = 1
  return (
    <div className="pointer-events-none absolute" style={{ width: arm * 2 + gap * 2, height: arm * 2 + gap * 2, ...style }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${arm * 2 + gap * 2} ${arm * 2 + gap * 2}`} fill="none">
        <line x1={arm + gap} y1={0} x2={arm + gap} y2={arm} stroke={color} strokeWidth={thick} />
        <line x1={arm + gap} y1={arm + gap * 2} x2={arm + gap} y2={arm * 2 + gap * 2} stroke={color} strokeWidth={thick} />
        <line x1={0} y1={arm + gap} x2={arm} y2={arm + gap} stroke={color} strokeWidth={thick} />
        <line x1={arm + gap * 2} y1={arm + gap} x2={arm * 2 + gap * 2} y2={arm + gap} stroke={color} strokeWidth={thick} />
        <circle cx={arm + gap} cy={arm + gap} r={1.5} fill={color} />
      </svg>
    </div>
  )
}

export default function ScrambleText() {
  const [isHovered, setIsHovered] = useState(false)
  const chars0 = useScramble(WORDS[0]!, isHovered)
  const chars1 = useScramble(WORDS[1]!, isHovered)
  const rows = [chars0, chars1]

  const charStyle: React.CSSProperties = {
    color: '#BECF5D',
    fontSize: 'clamp(1.75rem, 9vw, 3.75rem)',
  }

  return (
    <div
      className="relative flex h-full w-full cursor-default items-center justify-center"
      style={{ background: '#292929' }}
    >
      <Crosshair style={{ top: '10%', right: '8%' }} />
      <Crosshair style={{ bottom: '10%', left: '8%' }} />
      <div
        className="flex select-none flex-col items-center gap-4"
        style={{ padding: 'clamp(1.5rem, 8vw, 60px) clamp(1rem, 10vw, 80px)' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPointerDown={e => {
          // Touch has no hover, so non-mouse pointers reveal on press.
          if (e.pointerType !== 'mouse') setIsHovered(true)
        }}
        onPointerUp={e => {
          if (e.pointerType !== 'mouse') setIsHovered(false)
        }}
        onPointerCancel={e => {
          if (e.pointerType !== 'mouse') setIsHovered(false)
        }}
      >
        {rows.map((chars, rowIdx) => (
          <div key={rowIdx} className={`flex flex-wrap items-center justify-center gap-1 ${GeistPixelGrid.className}`}>
            {rowIdx === 0 && (
              <span className="leading-none tracking-widest" style={charStyle}>/</span>
            )}
            {chars.map((ch, i) => (
              <span
                key={i}
                className="leading-none tracking-widest"
                style={charStyle}
              >
                {ch.display}
              </span>
            ))}
            {rowIdx === rows.length - 1 && (
              <span className="leading-none tracking-widest" style={charStyle}>_</span>
            )}
          </div>
        ))}

        <motion.p
          className={`mt-2 text-xs font-medium uppercase tracking-[0.2em] ${GeistPixelGrid.className}`}
          style={{ color: 'rgba(190,207,93,0.45)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.8 }}
        >
          hover to decrypt
        </motion.p>
      </div>
    </div>
  )
}
