'use client'

// npm install framer-motion matter-js
/**
 * Presents a physics wall where text and emoji stickers can be added and dragged.
 * New stickers fall into the scene and collide with existing bodies and boundaries.
 */

import { useEffect, useLayoutEffect, useRef, useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { Engine, Runner, World, Body, MouseConstraint as MC, Mouse as MatterMouse } from 'matter-js'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect


// tune: raise to make stickers fall faster
const GRAVITY_SCALE = 0.0012
// tune: raise to increase collision bounce
const RESTITUTION   = 0.05
const FRICTION      = 0.6
const FRICTION_AIR  = 0.02
const DENSITY       = 0.0015
// tune: raise to allow more stickers in the scene
const STICKER_CAP   = 60
// tune: raise to slow sticker removal fades
const FADE_MS       = 250

const WALL_THICKNESS = 60

const TEXT_FONT_PX   = 15
// tune: raise to allow wider text stickers
const TEXT_MAX_WIDTH = 180
const TEXT_PAD_X     = 14
const TEXT_PAD_Y     = 10
const TEXT_LINE_H    = 20

// tune: change to resize emoji sticker bodies
const EMOJI_SIZE     = 72
const EMOJI_FONT_PX  = 42

const CARD_RADIUS    = 32
const BORDER_WIDTH   = 2


const PALETTE_DARK = ['#FDE68A', '#BBF7D0', '#FBCFE8', '#C7D2FE', '#BAE6FD', '#FED7AA']
const PALETTE_LIGHT = ['#F59E0B', '#34D399', '#F472B6', '#A78BFA', '#38BDF8', '#FB923C']

const STICKER_TEXT_COLOR_DARK = '#111827'
const STICKER_TEXT_COLOR_LIGHT = '#FFFFFF'
const BG_DARK  = '#0F0F12'
const BG_LIGHT = '#F5F1E8'

// customize: replace the initial text and emoji stickers below
const SEED_QUOTES = [
  'love the new layout',
  'prompts are 🔥',
  'found a tiny bug on hover',
  'please add a search',
  'this saved me hours',
  'fonts feel just right',
  'mobile nav could be bigger',
  'the physics here rules',
  'more components please',
  'onboarding was smooth',
]

const SEED_EMOJIS = ['👏', '💡', '🙌', '👀', '💬', '✅', '🔥', '💯', '🎉', '❤️', '🤔', '⭐']


type StickerKind = 'text' | 'emoji'

interface Sticker {
  body: Body
  kind: StickerKind
  content: string
  w: number
  h: number
  color: string
  lines: string[] 
  createdAt: number
  fadeStart?: number
}

type BodyWithPlugin = Body & { plugin: { sticker?: Sticker } }


function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}



function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    const width = ctx.measureText(candidate).width
    if (width <= maxWidth) {
      current = candidate
    } else if (!current) {
      
      lines.push(word)
      current = ''
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}

function measureTextCard(
  ctx: CanvasRenderingContext2D,
  text: string,
): { lines: string[]; w: number; h: number } {
  ctx.save()
  ctx.font = `600 ${TEXT_FONT_PX}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Manrope, sans-serif`
  const lines = wrapText(ctx, text, TEXT_MAX_WIDTH)
  let maxW = 0
  for (const line of lines) {
    const lw = ctx.measureText(line).width
    if (lw > maxW) maxW = lw
  }
  ctx.restore()
  const w = Math.max(70, Math.round(maxW + TEXT_PAD_X * 2))
  const h = Math.max(40, Math.round(lines.length * TEXT_LINE_H + TEXT_PAD_Y * 2))
  return { lines, w, h }
}

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function pickPalette(isDark: boolean): string[] {
  return isDark ? PALETTE_DARK : PALETTE_LIGHT
}


export default function StickerWall() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)

  
  const engineRef    = useRef<Engine | null>(null)
  const worldRef     = useRef<World | null>(null)
  const stickersRef  = useRef<Sticker[]>([])
  const sizeRef      = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  
  const measureCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const paletteRef   = useRef<string[]>(PALETTE_DARK)
  
  const matterRef    = useRef<typeof import('matter-js') | null>(null)

  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : true,
  )
  const isDarkRef = useRef<boolean>(isDark)

  useIsomorphicLayoutEffect(() => {
    isDarkRef.current = isDark
    paletteRef.current = pickPalette(isDark)
  }, [isDark])

  useEffect(() => {
    const palette = pickPalette(isDark)
    stickersRef.current.forEach((sticker, i) => {
      sticker.color = palette[i % palette.length]
    })
  }, [isDark])

  
  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const check = () => {
      const card = el.closest('[data-card-theme]')
      const dark = card
        ? card.classList.contains('dark')
        : document.documentElement.classList.contains('dark')
      setIsDark(dark)
      isDarkRef.current = dark
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) observer.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  
  useEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    measureCtxRef.current = ctx

    let alive = true
    let rafId = 0

    
    let engine: Engine | null = null
    let runner: Runner | null = null
    let world: World | null = null
    let walls: Body[] = []
    let mouse: MatterMouse | null = null
    let mouseConstraint: MC | null = null
    let ro: ResizeObserver | null = null

    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    function buildWalls(Matter: typeof import('matter-js'), w: number, h: number): Body[] {
      const t = WALL_THICKNESS
      const opts = { isStatic: true, render: { visible: false } }
      return [
        Matter.Bodies.rectangle(w / 2, -t / 2, w + t * 2, t, opts), 
        Matter.Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, opts), 
        Matter.Bodies.rectangle(-t / 2, h / 2, t, h + t * 2, opts), 
        Matter.Bodies.rectangle(w + t / 2, h / 2, t, h + t * 2, opts), 
      ]
    }

    function makeTextSticker(
      Matter: typeof import('matter-js'),
      text: string,
      x: number,
      y: number,
      color: string,
      spawnMotion: boolean,
    ): Sticker {
      const { lines, w, h } = measureTextCard(ctx!, text)
      const body = Matter.Bodies.rectangle(x, y, w, h, {
        restitution: RESTITUTION,
        friction: FRICTION,
        frictionAir: FRICTION_AIR,
        density: DENSITY,
        angle: randBetween(-0.25, 0.25),
        render: { visible: false },
      })
      if (spawnMotion) {
        Matter.Body.setAngularVelocity(body, randBetween(-0.03, 0.03))
        Matter.Body.setVelocity(body, { x: randBetween(-0.3, 0.3), y: 0 })
      }
      const sticker: Sticker = {
        body,
        kind: 'text',
        content: text,
        w,
        h,
        color,
        lines,
        createdAt: performance.now(),
      }
      ;(body as BodyWithPlugin).plugin = { sticker }
      return sticker
    }

    function makeEmojiSticker(
      Matter: typeof import('matter-js'),
      emoji: string,
      x: number,
      y: number,
      color: string,
    ): Sticker {
      const body = Matter.Bodies.rectangle(x, y, EMOJI_SIZE, EMOJI_SIZE, {
        restitution: RESTITUTION,
        friction: FRICTION,
        frictionAir: FRICTION_AIR,
        density: DENSITY,
        angle: randBetween(-0.25, 0.25),
        render: { visible: false },
      })
      const sticker: Sticker = {
        body,
        kind: 'emoji',
        content: emoji,
        w: EMOJI_SIZE,
        h: EMOJI_SIZE,
        color,
        lines: [],
        createdAt: performance.now(),
      }
      ;(body as BodyWithPlugin).plugin = { sticker }
      return sticker
    }

    function seed(Matter: typeof import('matter-js'), w: number, h: number) {
      const palette = paletteRef.current
      
      for (let i = 0; i < SEED_QUOTES.length; i++) {
        const quote = SEED_QUOTES[i]
        const color = palette[i % palette.length]
        const x = randBetween(100, Math.max(120, w - 100))
        const y = randBetween(80, Math.max(120, h - 120))
        const sticker = makeTextSticker(Matter, quote, x, y, color, false)
        Matter.Body.setAngularVelocity(sticker.body, randBetween(-0.05, 0.05))
        Matter.Body.setVelocity(sticker.body, { x: randBetween(-0.5, 0.5), y: randBetween(-0.5, 0.5) })
        Matter.Composite.add(world!, sticker.body)
        stickersRef.current.push(sticker)
      }
      
      for (let i = 0; i < SEED_EMOJIS.length; i++) {
        const emoji = SEED_EMOJIS[i]
        const color = palette[(i + 3) % palette.length]
        const x = randBetween(80, Math.max(100, w - 80))
        const y = randBetween(80, Math.max(120, h - 120))
        const sticker = makeEmojiSticker(Matter, emoji, x, y, color)
        Matter.Body.setAngularVelocity(sticker.body, randBetween(-0.05, 0.05))
        Matter.Body.setVelocity(sticker.body, { x: randBetween(-0.5, 0.5), y: randBetween(-0.5, 0.5) })
        Matter.Composite.add(world!, sticker.body)
        stickersRef.current.push(sticker)
      }
    }

    function resize() {
      const Matter = matterRef.current
      if (!Matter || !world) return
      const w = container!.clientWidth || 480
      const h = container!.clientHeight || 480
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas!.width  = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      canvas!.style.width  = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      
      if (walls.length > 0) {
        for (const wall of walls) Matter.Composite.remove(world, wall)
      }
      walls = buildWalls(Matter, w, h)
      Matter.Composite.add(world, walls)

      
      for (const s of stickersRef.current) {
        const p = s.body.position
        let nx = p.x
        let ny = p.y
        if (nx < 20) nx = 20
        if (nx > w - 20) nx = w - 20
        if (ny > h - 20) ny = h - 20
        if (nx !== p.x || ny !== p.y) Matter.Body.setPosition(s.body, { x: nx, y: ny })
      }

      if (mouse) mouse.pixelRatio = dpr

      sizeRef.current = { w, h }
    }

    function drawFrame(now: number) {
      if (!alive) return
      const dark = isDarkRef.current
      const bg = dark ? BG_DARK : BG_LIGHT
      const { w: W, h: H } = sizeRef.current

      
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.fillStyle = bg
      ctx!.fillRect(0, 0, W, H)

      const stickers = stickersRef.current
      const Matter = matterRef.current

      
      if (Matter && world) {
        for (let i = stickers.length - 1; i >= 0; i--) {
          const s = stickers[i]
          if (s.fadeStart !== undefined) {
            const dt = now - s.fadeStart
            if (dt >= FADE_MS) {
              Matter.Composite.remove(world, s.body)
              stickers.splice(i, 1)
            }
          }
        }
      }

      
      for (const s of stickers) {
        const { body, w, h, color, kind, lines, content } = s

        let alpha = 1
        if (s.fadeStart !== undefined) {
          const dt = now - s.fadeStart
          alpha = Math.max(0, 1 - dt / FADE_MS)
        }

        ctx!.save()
        ctx!.globalAlpha = alpha
        ctx!.translate(body.position.x, body.position.y)
        ctx!.rotate(body.angle)

        
        ctx!.fillStyle = color
        roundedRect(ctx!, -w / 2, -h / 2, w, h, CARD_RADIUS)
        ctx!.fill()

        
        ctx!.strokeStyle = 'rgba(255,255,255,0.7)'
        ctx!.lineWidth = BORDER_WIDTH
        const inset = BORDER_WIDTH
        roundedRect(
          ctx!,
          -w / 2 + inset,
          -h / 2 + inset,
          w - inset * 2,
          h - inset * 2,
          Math.max(1, CARD_RADIUS - inset),
        )
        ctx!.stroke()

        if (kind === 'text') {
          ctx!.fillStyle = isDarkRef.current ? STICKER_TEXT_COLOR_DARK : STICKER_TEXT_COLOR_LIGHT
          ctx!.font = `600 ${TEXT_FONT_PX}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Manrope, sans-serif`
          ctx!.textAlign = 'center'
          ctx!.textBaseline = 'middle'
          const totalH = lines.length * TEXT_LINE_H
          const startY = -totalH / 2 + TEXT_LINE_H / 2
          for (let li = 0; li < lines.length; li++) {
            ctx!.fillText(lines[li], 0, startY + li * TEXT_LINE_H)
          }
        } else {
          ctx!.font = `${EMOJI_FONT_PX}px ui-sans-serif, system-ui, -apple-system, Segoe UI, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`
          ctx!.textAlign = 'center'
          ctx!.textBaseline = 'middle'
          ctx!.fillText(content, 0, 2)
        }

        ctx!.restore()
      }

      rafId = requestAnimationFrame(drawFrame)
    }

    
    import('matter-js').then((Matter) => {
      if (!alive) return
      matterRef.current = Matter

      engine = Matter.Engine.create({ gravity: { x: 0, y: 1, scale: GRAVITY_SCALE } })
      engine.timing.timeScale = 0.6
      world = engine.world
      engineRef.current = engine
      worldRef.current = world

      runner = Matter.Runner.create()
      Matter.Runner.run(runner, engine)

      
      
      resize()
      mouse = Matter.Mouse.create(canvas!)
      mouse.pixelRatio = dpr
      mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.2,
          damping: 0.1,
          render: { visible: false },
        },
      })
      Matter.Composite.add(world, mouseConstraint)

      seed(Matter, sizeRef.current.w, sizeRef.current.h)

      ro = new ResizeObserver(resize)
      ro.observe(container!)

      rafId = requestAnimationFrame(drawFrame)
    })

    return () => {
      alive = false
      cancelAnimationFrame(rafId)
      if (ro) ro.disconnect()
      const Matter = matterRef.current
      if (Matter) {
        if (runner) Matter.Runner.stop(runner)
        if (world) Matter.Composite.clear(world, false, true)
        if (engine) Matter.Engine.clear(engine)
      }
      matterRef.current = null
      engineRef.current = null
      worldRef.current = null
      stickersRef.current = []
      measureCtxRef.current = null
    }
  }, [])

  
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const input = inputRef.current
    if (!input) return
    const value = input.value.trim()
    if (!value) return

    const Matter = matterRef.current
    const world = worldRef.current
    const ctx = measureCtxRef.current
    if (!Matter || !world || !ctx) return

    const { w: W } = sizeRef.current
    if (W === 0) return

    const palette = paletteRef.current
    const color = palette[Math.floor(Math.random() * palette.length)]
    const x = randBetween(80, Math.max(100, W - 80))
    const y = -30

    const { lines, w, h } = measureTextCard(ctx, value)
    const body = Matter.Bodies.rectangle(x, y, w, h, {
      restitution: RESTITUTION,
      friction: FRICTION,
      frictionAir: FRICTION_AIR,
      density: DENSITY,
      angle: randBetween(-0.25, 0.25),
      render: { visible: false },
    })
    Matter.Body.setAngularVelocity(body, randBetween(-0.03, 0.03))
    Matter.Body.setVelocity(body, { x: randBetween(-0.3, 0.3), y: 0 })

    const sticker: Sticker = {
      body,
      kind: 'text',
      content: value,
      w,
      h,
      color,
      lines,
      createdAt: performance.now(),
    }
    ;(body as BodyWithPlugin).plugin = { sticker }

    Matter.Composite.add(world, body)
    stickersRef.current.push(sticker)

    
    if (stickersRef.current.length > STICKER_CAP) {
      for (const s of stickersRef.current) {
        if (s.fadeStart === undefined) {
          s.fadeStart = performance.now()
          break
        }
      }
    }

    input.value = ''
  }

  const bg = isDark ? BG_DARK : BG_LIGHT
  const inputBg = isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)'
  const accentBg = '#8A9CF4'
  const inputText = isDark ? 'rgba(255,255,255,0.95)' : 'rgba(17,24,39,0.95)'
  const accentText = isDark ? '#111827' : '#FFFFFF'
  const stickerBorder = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(17,24,39,0.12)'
  const stickerShadow = isDark
    ? '0 6px 14px rgba(0,0,0,0.25), 0 2px 0 rgba(0,0,0,0.08)'
    : '0 6px 14px rgba(17,24,39,0.12), 0 2px 0 rgba(17,24,39,0.04)'
  const keyShadow = isDark
    ? '0 4px 0 rgba(0,0,0,0.45), 0 8px 16px rgba(0,0,0,0.3)'
    : '0 4px 0 rgba(17,24,39,0.35), 0 8px 16px rgba(17,24,39,0.18)'
  const placeholderColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(17,24,39,0.5)'
  const titleColor = isDark ? 'rgba(255,255,255,0.95)' : 'rgba(17,24,39,0.95)'
  const titleShadow = isDark
    ? '0 2px 20px rgba(0,0,0,0.4)'
    : '0 2px 20px rgba(17,24,39,0.08)'
  const subtitleColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(17,24,39,0.7)'
  const pillHoverBg = isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)'
  const pillFocusBg = isDark ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)'
  const pillHoverBorder = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(17,24,39,0.6)'
  const pillFocusBorder = isDark ? '#FFFFFF' : '#111827'
  const pillFocusShadow = isDark
    ? '0 10px 24px rgba(0,0,0,0.3), 0 0 0 4px rgba(255,255,255,0.12)'
    : '0 10px 24px rgba(17,24,39,0.15), 0 0 0 4px rgba(17,24,39,0.08)'
  const sendHoverShadow = isDark
    ? '0 5px 0 rgba(0,0,0,0.45), 0 10px 20px rgba(0,0,0,0.32)'
    : '0 5px 0 rgba(17,24,39,0.35), 0 10px 20px rgba(17,24,39,0.2)'
  const sendActiveShadow = isDark
    ? '0 1px 0 rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.25)'
    : '0 1px 0 rgba(17,24,39,0.35), 0 2px 4px rgba(17,24,39,0.15)'

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: bg }}
    >
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative h-full w-full overflow-hidden"
        style={{ background: bg, touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        <style>{`
          .sticker-wall-input::placeholder { color: ${placeholderColor}; }
          .sticker-wall-pill {
            transition: background 180ms ease, border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
          }
          .sticker-wall-pill:hover {
            background: ${pillHoverBg} !important;
            border-color: ${pillHoverBorder} !important;
            transform: translateY(-1px);
          }
          .sticker-wall-pill:focus-within {
            background: ${pillFocusBg} !important;
            border-color: ${pillFocusBorder} !important;
            transform: translateY(-1px) scale(1.015);
            box-shadow: ${pillFocusShadow} !important;
          }
          .sticker-wall-pill:active {
            transform: translateY(0) scale(0.99);
          }
          .sticker-wall-send {
            transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
            cursor: pointer;
          }
          .sticker-wall-send:hover {
            transform: translateY(-1px);
            filter: brightness(1.15);
          }
          .sticker-wall-send:active {
            transform: translateY(3px);
            filter: brightness(0.95);
          }
        `}</style>

        <form
          onSubmit={onSubmit}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5"
          style={{
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: '18vh',
          }}
        >
          <div className="pointer-events-none flex flex-col items-center gap-2 text-center">
            <h2
              className="select-none"
              style={{
                color: titleColor,
                fontSize: 'clamp(32px, 6vw, 56px)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                margin: 0,
                textShadow: titleShadow,
              }}
            >
              Feedback Wall
            </h2>
            <p
              className="select-none"
              style={{
                color: subtitleColor,
                fontSize: '16px',
                fontWeight: 500,
                letterSpacing: '-0.005em',
                lineHeight: 1.45,
                margin: 0,
                maxWidth: '46ch',
              }}
            >
              Drop a note, toss an emoji, drag anything around. Real physics, no rules. Just leave your mark on the wall.
            </p>
          </div>
          <div
            className="sticker-wall-pill pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-full p-1"
            style={{
              background: inputBg,
              border: `2px solid ${stickerBorder}`,
              boxShadow: stickerShadow,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Leave feedback…"
              maxLength={80}
              className="sticker-wall-input flex-1 bg-transparent px-4 py-2 text-sm outline-none"
              style={{ color: inputText, fontWeight: 500 }}
            />
            <button
              type="submit"
              className="sticker-wall-send flex items-center rounded-2xl px-5 py-2 text-sm tracking-wide"
              style={{
                background: accentBg,
                color: accentText,
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              Send
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
