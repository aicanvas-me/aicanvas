'use client'
// npm install framer-motion

import { useRef } from 'react'
import { motion, useMotionValue, animate, type AnimationPlaybackControls, type MotionValue, type PanInfo } from 'framer-motion'

type FaceShape = 'wide' | 'side'

// Photos by Jeremy Bishop, giacomo ambrosini, Luke Paris, Jonny Gios, and Cloris Chou via Unsplash.
const wide = (id: string) => `https://images.unsplash.com/photo-${id}?w=960&h=540&fit=crop&auto=format&q=80`
const square = (id: string) => `https://images.unsplash.com/photo-${id}?w=720&h=720&fit=crop&auto=format&q=80`

const P00 = '1602303832953-05d841ee21f7'
const P01 = '1560841650-fa45ffd48b77'
const P02 = '1568464992136-fae8c7322eee'
const P03 = '1565105337533-d23f47c0fd58'
const P04 = '1661632359984-0954ccc8a149'
const P05 = '1637909837540-80e1b9198ea9'

const FACES: { src: string; shape: FaceShape; transform: string }[] = [
  { src: wide(P00), shape: 'wide', transform: 'translateZ(var(--half-d))' },
  { src: wide(P01), shape: 'wide', transform: 'rotateY(180deg) translateZ(var(--half-d))' },
  { src: wide(P04), shape: 'wide', transform: 'rotateX(90deg) translateZ(var(--half-h))' },
  { src: wide(P05), shape: 'wide', transform: 'rotateX(-90deg) translateZ(var(--half-h))' },
  { src: square(P02), shape: 'side', transform: 'rotateY(90deg) translateZ(var(--half-w))' },
  { src: square(P03), shape: 'side', transform: 'rotateY(-90deg) translateZ(var(--half-w))' },
]

const DRAG_SENSITIVITY = 0.5
const KEY_STEP = 30
const COAST = { type: 'spring' as const, stiffness: 40, damping: 22 }

export default function CubeCarousel() {
  const rotateX = useMotionValue(-14)
  const rotateY = useMotionValue(-22)

  const start = useRef({ rotX: 0, rotY: 0 })
  const xAnim = useRef<AnimationPlaybackControls | null>(null)
  const yAnim = useRef<AnimationPlaybackControls | null>(null)

  const stopAnims = () => {
    xAnim.current?.stop()
    yAnim.current?.stop()
    xAnim.current = null
    yAnim.current = null
  }

  const onPanStart = () => {
    stopAnims()
    start.current = { rotX: rotateX.get(), rotY: rotateY.get() }
  }

  const onPan = (_: PointerEvent, info: PanInfo) => {
    rotateY.set(start.current.rotY + info.offset.x * DRAG_SENSITIVITY)
    rotateX.set(start.current.rotX - info.offset.y * DRAG_SENSITIVITY)
  }

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    const vy = info.velocity.x * DRAG_SENSITIVITY
    const vx = -info.velocity.y * DRAG_SENSITIVITY
    const projectY = rotateY.get() + vy * 0.18
    const projectX = rotateX.get() + vx * 0.18
    yAnim.current = animate(rotateY, projectY, { ...COAST, velocity: vy })
    xAnim.current = animate(rotateX, projectX, { ...COAST, velocity: vx })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let target: MotionValue<number> | null = null
    let delta = 0
    switch (e.key) {
      case 'ArrowLeft':
        target = rotateY
        delta = -KEY_STEP
        break
      case 'ArrowRight':
        target = rotateY
        delta = KEY_STEP
        break
      case 'ArrowUp':
        target = rotateX
        delta = KEY_STEP
        break
      case 'ArrowDown':
        target = rotateX
        delta = -KEY_STEP
        break
      default:
        return
    }
    e.preventDefault()
    stopAnims()
    const anim = animate(target, target.get() + delta, COAST)
    if (target === rotateY) yAnim.current = anim
    else xAnim.current = anim
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]">
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 'clamp(280px, 74vw, 560px)',
          height: 'clamp(220px, 52vw, 400px)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[12%] -z-10 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, rgba(0,0,0,0.18), transparent 75%)',
          }}
        />

        <motion.div
          onPanStart={onPanStart}
          onPan={onPan}
          onPanEnd={onPanEnd}
          onKeyDown={onKeyDown}
          aria-label="Drag or use the arrow keys to rotate the cube"
          role="button"
          tabIndex={0}
          className="absolute inset-0 z-10 cursor-grab select-none active:cursor-grabbing"
          // Keep none: with pan-y or auto, vertical touch drags scroll the page, not tilt the cube.
          style={{ touchAction: 'none' }}
        />

        <div
          style={{ perspective: '1400px' }}
          className="flex h-full w-full items-center justify-center"
        >
          <div
            style={{ transformStyle: 'preserve-3d' }}
            className="relative"
          >
            <motion.div
              style={
                {
                  width: 'var(--w)',
                  height: 'var(--h)',
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d',
                  '--w': 'clamp(210px, 56vw, 420px)',
                  '--h': 'calc(var(--w) * 9 / 16)',
                  '--d': 'var(--h)',
                  '--half-w': 'calc(var(--w) / 2)',
                  '--half-h': 'calc(var(--h) / 2)',
                  '--half-d': 'calc(var(--d) / 2)',
                  pointerEvents: 'none',
                } as React.CSSProperties
              }
              className="relative select-none"
            >
              {FACES.map((face, i) => {
                const isSide = face.shape === 'side'
                return (
                  <div
                    key={i}
                    className="absolute overflow-hidden ring-1 ring-black/10 dark:ring-white/15"
                    style={{
                      width: isSide ? 'var(--d)' : 'var(--w)',
                      height: isSide ? 'var(--h)' : 'var(--h)',
                      top: 0,
                      left: isSide ? 'calc((var(--w) - var(--d)) / 2)' : 0,
                      transform: face.transform,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={face.src}
                      alt={`Cube face ${i + 1}`}
                      className="h-full w-full select-none object-cover"
                      draggable={false}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{ boxShadow: 'inset 0 0 36px 0 rgba(0,0,0,0.32)' }}
                    />
                  </div>
                )
              })}
            </motion.div>

            <div
              aria-hidden
              className="absolute left-1/2 top-full -translate-x-1/2 rounded-full bg-black"
              style={{
                width: '72%',
                height: 28,
                marginTop: 28,
                filter: 'blur(22px)',
                opacity: 0.32,
              }}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
