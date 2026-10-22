'use client'

// npm install @phosphor-icons/react framer-motion react-dom

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  useId,
  forwardRef,
} from 'react'
import { createPortal } from 'react-dom'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
} from 'framer-motion'
import {
  CaretDown,
  CaretUp,
  ArrowsDownUp,
  ArrowsLeftRight,
  CheckCircle,
  GearSix,
} from '@phosphor-icons/react'

type Theme = 'light' | 'dark'

function readTheme(el: HTMLElement | null): Theme {
  if (typeof document === 'undefined') return 'dark'
  const card = el?.closest('[data-card-theme]')
  if (card) return card.classList.contains('dark') ? 'dark' : 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function useTheme(rootRef: React.RefObject<HTMLElement | null>): { theme: Theme } {
  const [theme, setTheme] = useState<Theme>(() => readTheme(rootRef.current))
  useEffect(() => {
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
  return { theme }
}


interface Token {
  symbol: string
  name: string
  usdPrice: number
  basePrice: number
  balance: number
  change24h: number
  gradient: [string, string]
}

type SwapStatus = 'idle' | 'swapping' | 'success'
type Side = 'sell' | 'buy'

const INITIAL_TOKENS: Token[] = [
  { symbol: 'ETH',   name: 'Ethereum',   usdPrice: 3412.55,  basePrice: 3412.55,  balance: 52.32,    change24h:  2.41, gradient: ['#627EEA', '#8FA7FF'] },
  { symbol: 'BTC',   name: 'Bitcoin',    usdPrice: 67840.12, basePrice: 67840.12, balance: 1.284,    change24h:  1.07, gradient: ['#F7931A', '#FFC56E'] },
  { symbol: 'USDC',  name: 'USD Coin',   usdPrice: 1.0,      basePrice: 1.0,      balance: 12480.5,  change24h:  0.01, gradient: ['#2775CA', '#4FA3FF'] },
  { symbol: 'USDT',  name: 'Tether',     usdPrice: 1.0,      basePrice: 1.0,      balance: 8920.0,   change24h: -0.02, gradient: ['#26A17B', '#54D6A8'] },
  { symbol: 'SOL',   name: 'Solana',     usdPrice: 168.42,   basePrice: 168.42,   balance: 312.7,    change24h:  5.83, gradient: ['#9945FF', '#19FB9B'] },
  { symbol: 'AAVE',  name: 'Aave',       usdPrice: 102.18,   basePrice: 102.18,   balance: 47.9,     change24h: -1.64, gradient: ['#B6509E', '#2EBAC6'] },
  { symbol: 'MATIC', name: 'Polygon',    usdPrice: 0.7234,   basePrice: 0.7234,   balance: 9430.2,   change24h: -3.12, gradient: ['#8247E5', '#A77BFF'] },
  { symbol: 'LINK',  name: 'Chainlink',  usdPrice: 14.86,    basePrice: 14.86,    balance: 880.4,    change24h:  0.42, gradient: ['#2A5ADA', '#6E97FF'] },
]

const PRICE_DRIFT_MS = 3000
const SWAP_SWAPPING_MS = 900
const SWAP_SUCCESS_MS = 1600

const POOL_DEPTH_USD = 25_000_000
const IMPACT_FLOOR = 0.0005
const IMPACT_CAP = 0.05
const NETWORK_FEE_BASE_USD = 2.4

interface SlippageOption {
  label: string
  value: number
}
const SLIPPAGE_OPTIONS: SlippageOption[] = [
  { label: 'Auto', value: 0.005 },
  { label: '0.1%', value: 0.001 },
  { label: '0.5%', value: 0.005 },
  { label: '1.0%', value: 0.01 },
]
const DEFAULT_SLIPPAGE = SLIPPAGE_OPTIONS[0].value

const DEFAULT_SELL_INPUT = '1'

const SUCCESS_SPARKS: number[] = Array.from(
  { length: 6 },
  (_, i) => (i / 6) * Math.PI * 2,
)

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}


interface TrendColors {
  up: string
  down: string
  flat: string
}
function trendColors(isDark: boolean): TrendColors {
  return isDark
    ? { up: '#16C784', down: '#EA3943', flat: '#8E8E84' }
    : { up: '#0FA968', down: '#E5484D', flat: '#6E6E66' }
}


function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '$0.00'
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function adaptiveFractionDigits(abs: number): number {
  if (abs >= 1) return 2
  if (abs >= 0.01) return 4
  return 8
}

function formatTokenAmount(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: adaptiveFractionDigits(Math.abs(value)),
  })
}

function capForInput(value: number): string {
  if (!Number.isFinite(value) || value === 0) return ''
  const digits = adaptiveFractionDigits(Math.abs(value))
  const factor = 10 ** digits
  const truncated = Math.trunc(value * factor) / factor
  if (truncated === 0) {
    return String(Number(value.toPrecision(4)))
  }
  return String(truncated)
}

function formatRate(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0'
  const abs = Math.abs(value)
  let maxFrac: number
  if (abs >= 1000) maxFrac = 2
  else if (abs >= 1) maxFrac = 4
  else if (abs >= 0.01) maxFrac = 6
  else maxFrac = 8
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFrac,
  })
}

function formatChange(value: number): string {
  return `${Math.abs(value).toFixed(2)}%`
}

function sanitizeDecimal(raw: string): string {
  let cleaned = raw.replace(/[^0-9.]/g, '')
  const firstDot = cleaned.indexOf('.')
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) +
      cleaned.slice(firstDot + 1).replace(/\./g, '')
  }
  const dot = cleaned.indexOf('.')
  if (dot !== -1) {
    cleaned = cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1, dot + 9)
  }
  if (cleaned.length > 1 && cleaned[0] === '0' && cleaned[1] !== '.') {
    cleaned = cleaned.replace(/^0+/, '')
    if (cleaned === '' || cleaned[0] === '.') cleaned = '0' + cleaned
  }
  return cleaned
}

const TREND_FLAT_EPS = 0.05
function classifyTrend(change: number): 'up' | 'down' | 'flat' {
  if (change > TREND_FLAT_EPS) return 'up'
  if (change < -TREND_FLAT_EPS) return 'down'
  return 'flat'
}

// Coin marks are adapted from spothq/cryptocurrency-icons under CC0-1.0.
// Trademarks belong to their respective projects.

const COIN_SVGS: Record<string, React.ReactNode> = {
  ETH: (
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <g fill="#FFF" fillRule="nonzero">
        <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
        <path d="M16.498 4L9 16.22l7.498-3.35z" />
        <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
        <path d="M16.498 27.995v-6.028L9 17.616z" />
        <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z" />
        <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
      </g>
    </g>
  ),
  BTC: (
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path
        fill="#FFF"
        fillRule="nonzero"
        d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
      />
    </g>
  ),
  USDC: (
    <g fill="none">
      <circle fill="#3E73C4" cx="16" cy="16" r="16" />
      <g fill="#FFF">
        <path d="M20.022 18.124c0-2.124-1.28-2.852-3.84-3.156-1.828-.243-2.193-.728-2.193-1.578 0-.85.61-1.396 1.828-1.396 1.097 0 1.707.364 2.011 1.275a.458.458 0 00.427.303h.975a.416.416 0 00.427-.425v-.06a3.04 3.04 0 00-2.743-2.489V9.142c0-.243-.183-.425-.487-.486h-.915c-.243 0-.426.182-.487.486v1.396c-1.829.242-2.986 1.456-2.986 2.974 0 2.002 1.218 2.791 3.778 3.095 1.707.303 2.255.668 2.255 1.639 0 .97-.853 1.638-2.011 1.638-1.585 0-2.133-.667-2.316-1.578-.06-.242-.244-.364-.427-.364h-1.036a.416.416 0 00-.426.425v.06c.243 1.518 1.219 2.61 3.23 2.914v1.457c0 .242.183.425.487.485h.915c.243 0 .426-.182.487-.485V21.34c1.829-.303 3.047-1.578 3.047-3.217z" />
        <path d="M12.892 24.497c-4.754-1.7-7.192-6.98-5.424-11.653.914-2.55 2.925-4.491 5.424-5.402.244-.121.365-.303.365-.607v-.85c0-.242-.121-.424-.365-.485-.061 0-.183 0-.244.06a10.895 10.895 0 00-7.13 13.717c1.096 3.4 3.717 6.01 7.13 7.102.244.121.488 0 .548-.243.061-.06.061-.122.061-.243v-.85c0-.182-.182-.424-.365-.546zm6.46-18.936c-.244-.122-.488 0-.548.242-.061.061-.061.122-.061.243v.85c0 .243.182.485.365.607 4.754 1.7 7.192 6.98 5.424 11.653-.914 2.55-2.925 4.491-5.424 5.402-.244.121-.365.303-.365.607v.85c0 .242.121.424.365.485.061 0 .183 0 .244-.06a10.895 10.895 0 007.13-13.717c-1.096-3.46-3.778-6.07-7.13-7.162z" />
      </g>
    </g>
  ),
  USDT: (
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path
        fill="#FFF"
        d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117"
      />
    </g>
  ),
  SOL: (
    <g fill="none">
      <circle fill="#66F9A1" cx="16" cy="16" r="16" />
      <path
        d="M9.925 19.687a.59.59 0 01.415-.17h14.366a.29.29 0 01.207.497l-2.838 2.815a.59.59 0 01-.415.171H7.294a.291.291 0 01-.207-.498l2.838-2.815zm0-10.517A.59.59 0 0110.34 9h14.366c.261 0 .392.314.207.498l-2.838 2.815a.59.59 0 01-.415.17H7.294a.291.291 0 01-.207-.497L9.925 9.17zm12.15 5.225a.59.59 0 00-.415-.17H7.294a.291.291 0 00-.207.498l2.838 2.815c.11.109.26.17.415.17h14.366a.291.291 0 00.207-.498l-2.838-2.815z"
        fill="#FFF"
      />
    </g>
  ),
  AAVE: (
    <g fill="none">
      <circle fill="#2EBAC6" cx="16" cy="16" r="16" />
      <path
        d="M22.934 21.574l-5.35-13.532C17.28 7.342 16.834 7 16.243 7h-.473c-.592 0-1.039.343-1.341 1.042l-2.327 5.896h-1.761c-.528.002-.956.448-.96 1v.014c.004.553.432.999.96 1.001h.946l-2.221 5.621a1.235 1.235 0 00-.066.384c0 .315.092.562.263.754.17.192.407.288.71.288a.933.933 0 00.552-.192c.17-.123.289-.302.38-.507l2.446-6.348h1.696c.527-.002.955-.449.96-1.001v-.027c-.005-.553-.433-1-.96-1.001h-.907l1.866-4.867L21.093 22.3c.092.205.21.384.381.507.161.122.354.19.553.192.302 0 .539-.096.71-.288.17-.192.262-.439.262-.754a.944.944 0 00-.065-.384z"
        fill="#FFF"
      />
    </g>
  ),
  MATIC: (
    <g fill="none">
      <circle fill="#6F41D8" cx="16" cy="16" r="16" />
      <path
        d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.25-1.258c.37-.216.85-.216 1.256 0l2.25 1.258c.37.216.628.611.628 1.042v1.654l1.955-1.115v-1.653a1.16 1.16 0 00-.627-1.042l-4.17-2.372c-.369-.216-.848-.216-1.254 0l-4.244 2.372A1.16 1.16 0 006 11.076v4.78c0 .432.221.827.627 1.043l4.244 2.372c.369.215.849.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.617c.369-.216.848-.216 1.254 0l2.251 1.258c.37.215.627.61.627 1.042v2.552c0 .431-.22.826-.627 1.042l-2.25 1.294c-.37.216-.85.216-1.255 0l-2.251-1.258c-.37-.216-.628-.611-.628-1.042v-1.654l-1.955 1.115v1.653c0 .431.221.827.627 1.042l4.244 2.372c.369.216.848.216 1.254 0l4.244-2.372c.369-.215.627-.61.627-1.042v-4.78a1.16 1.16 0 00-.627-1.042l-4.28-2.409z"
        fill="#FFF"
      />
    </g>
  ),
  LINK: (
    <g fill="none">
      <circle fill="#2A5ADA" cx="16" cy="16" r="16" />
      <path
        d="M16 6l-1.799 1.055L9.3 9.945 7.5 11v10l1.799 1.055 4.947 2.89L16.045 26l1.799-1.055 4.857-2.89L24.5 21V11l-1.799-1.055-4.902-2.89L16 6zm-4.902 12.89v-5.78L16 10.22l4.902 2.89v5.78L16 21.78l-4.902-2.89z"
        fill="#FFF"
      />
    </g>
  ),
}

function CoinIcon({ token, size }: { token: Token; size: number }) {
  const mark = COIN_SVGS[token.symbol]
  if (!mark) return <CoinDisc token={token} size={size} />
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role="img"
      aria-hidden
      className="block shrink-0"
      style={{ borderRadius: '50%' }}
    >
      {mark}
    </svg>
  )
}


function CoinDisc({ token, size }: { token: Token; size: number }) {
  const letters = token.symbol.slice(0, token.symbol.length <= 3 ? 1 : 2)
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        letterSpacing: '-0.02em',
        background: `linear-gradient(135deg, ${token.gradient[0]}, ${token.gradient[1]})`,
        boxShadow: `0 2px 8px ${token.gradient[0]}55`,
      }}
    >
      {letters}
    </span>
  )
}

function TrendChip({ token, isDark }: { token: Token; isDark: boolean }) {
  const dir = classifyTrend(token.change24h)
  const colors = trendColors(isDark)
  const color = dir === 'up' ? colors.up : dir === 'down' ? colors.down : colors.flat
  return (
    <span
      className="inline-flex items-center gap-0.5 tabular-nums"
      style={{ color, fontSize: 12, fontWeight: 600, lineHeight: 1 }}
    >
      {dir === 'up' && <CaretUp size={12} weight="fill" />}
      {dir === 'down' && <CaretDown size={12} weight="fill" />}
      {formatChange(token.change24h)}
    </span>
  )
}


function AnimatedNumber({
  value,
  format,
  className,
  style,
  reduced,
}: {
  value: number
  format: (n: number) => string
  className?: string
  style?: React.CSSProperties
  reduced: boolean
}) {
  const mv = useMotionValue(value)
  const display = useTransform(mv, (n) => format(n))
  const last = useRef(value)

  useEffect(() => {
    if (reduced) {
      mv.set(value)
      last.current = value
      return
    }
    const rel = Math.abs(value - last.current) / (Math.abs(last.current) || 1)
    if (rel < 0.001) {
      mv.set(value)
      last.current = value
      return
    }
    last.current = value
    const controls = animate(mv, value, {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    })
    return () => controls.stop()
  }, [value, mv, reduced])

  return (
    <motion.span className={className} style={style}>
      {display}
    </motion.span>
  )
}

const ROW_HEIGHT = 48
const VISIBLE_ROWS = 3
const ROW_GAP = 4
const PANEL_PAD_Y = 12
const LIST_DEFAULT_HEIGHT =
  ROW_HEIGHT * VISIBLE_ROWS + ROW_GAP * (VISIBLE_ROWS - 1)
const PANEL_DEFAULT_HEIGHT = LIST_DEFAULT_HEIGHT + PANEL_PAD_Y
const DROPDOWN_GAP = 8

type Placement = 'down' | 'up'

interface PopoverPosition {
  top: number
  left: number
  width: number
  maxHeight: number
  placement: Placement
}

function usePopoverPosition(
  triggerRef: React.RefObject<HTMLElement | null> | undefined,
  boundRef: React.RefObject<HTMLElement | null> | undefined,
  open: boolean,
): PopoverPosition | null {
  const [pos, setPos] = useState<PopoverPosition | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return
    }

    let last: PopoverPosition | null = null
    const EPS = 0.5

    const measure = (): PopoverPosition | null => {
      const pill = triggerRef?.current
      const card = boundRef?.current
      if (!pill || !card || typeof window === 'undefined') return null
      const pillRect = pill.getBoundingClientRect()
      const cardRect = card.getBoundingClientRect()

      const width = cardRect.width
      const left = cardRect.left

      const spaceBelow = cardRect.bottom - pillRect.bottom - DROPDOWN_GAP
      const spaceAbove = pillRect.top - cardRect.top - DROPDOWN_GAP

      const cardHeight = cardRect.height
      const desired = Math.min(PANEL_DEFAULT_HEIGHT, cardHeight)

      let placement: Placement
      if (desired <= spaceBelow) placement = 'down'
      else if (desired <= spaceAbove) placement = 'up'
      else placement = spaceBelow >= spaceAbove ? 'down' : 'up'

      let top: number
      let maxHeight: number
      if (placement === 'down') {
        top = pillRect.bottom + DROPDOWN_GAP
        maxHeight = Math.min(desired, Math.max(0, spaceBelow))
      } else {
        maxHeight = Math.min(desired, Math.max(0, spaceAbove))
        top = pillRect.top - DROPDOWN_GAP - maxHeight
      }

      maxHeight = Math.min(maxHeight, cardHeight)

      return { top, left, width, maxHeight, placement }
    }

    const changed = (
      prev: PopoverPosition | null,
      next: PopoverPosition,
    ): boolean => {
      if (!prev) return true
      if (prev.placement !== next.placement) return true
      return (
        Math.abs(prev.top - next.top) > EPS ||
        Math.abs(prev.left - next.left) > EPS ||
        Math.abs(prev.width - next.width) > EPS ||
        Math.abs(prev.maxHeight - next.maxHeight) > EPS
      )
    }

    const compute = () => {
      const next = measure()
      if (!next) return
      if (changed(last, next)) {
        last = next
        setPos(next)
      }
    }

    compute()

    const card = boundRef?.current ?? null
    const pill = triggerRef?.current ?? null
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => compute())
      if (card) ro.observe(card)
      if (pill) ro.observe(pill)
    }

    window.addEventListener('scroll', compute, true)
    window.addEventListener('resize', compute)
    return () => {
      ro?.disconnect()
      window.removeEventListener('scroll', compute, true)
      window.removeEventListener('resize', compute)
    }
  }, [triggerRef, boundRef, open])

  return pos
}


function TokenPicker({
  tokens,
  activeSymbol,
  isDark,
  reduced,
  listId,
  optionId,
  triggerRef,
  boundRef,
  onSelect,
}: {
  tokens: Token[]
  activeSymbol: string
  isDark: boolean
  reduced: boolean
  listId: string
  optionId: (symbol: string) => string
  triggerRef?: React.RefObject<HTMLButtonElement | null>
  boundRef?: React.RefObject<HTMLElement | null>
  onSelect: (symbol: string) => void
}) {
  const position = usePopoverPosition(triggerRef, boundRef, true)

  const activeStart = Math.max(
    0,
    tokens.findIndex((t) => t.symbol === activeSymbol),
  )
  const [activeIndex, setActiveIndex] = useState(activeStart)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const panelRef = useRef<HTMLDivElement>(null)

  const safeIndex = Math.min(activeIndex, tokens.length - 1)

  useEffect(() => {
    if (!position) return
    optionRefs.current[safeIndex]?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position !== null])

  useEffect(() => {
    const trigger = triggerRef?.current
    const panel = panelRef.current
    return () => {
      if (panel && panel.contains(document.activeElement)) {
        trigger?.focus({ preventScroll: true })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const focusIndex = useCallback(
    (i: number) => {
      const clamped = clamp(i, 0, tokens.length - 1)
      setActiveIndex(clamped)
      optionRefs.current[clamped]?.focus({ preventScroll: true })
    },
    [tokens.length],
  )

  const onPanelKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          focusIndex(safeIndex + 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          focusIndex(safeIndex - 1)
          break
        case 'Home':
          e.preventDefault()
          focusIndex(0)
          break
        case 'End':
          e.preventDefault()
          focusIndex(tokens.length - 1)
          break
        case 'Enter':
        case ' ':
        case 'Spacebar':
          e.preventDefault()
          onSelect(tokens[safeIndex].symbol)
          break
        case 'Tab': {
          const last = tokens.length - 1
          if (e.shiftKey && safeIndex === 0) {
            e.preventDefault()
            focusIndex(last)
          } else if (!e.shiftKey && safeIndex === last) {
            e.preventDefault()
            focusIndex(0)
          } else {
            e.preventDefault()
            focusIndex(safeIndex + (e.shiftKey ? -1 : 1))
          }
          break
        }
        default:
          break
      }
    },
    [focusIndex, onSelect, safeIndex, tokens],
  )

  const surface = isDark ? '#26262A' : '#FFFFFF'
  const titleColor = isDark ? '#ECECEC' : '#16160F'
  const subColor = isDark ? '#8A8A86' : '#6B6B62'
  const rowHover = isDark ? '#2F2F34' : '#F2F2EF'
  const activeFill = isDark ? 'rgba(174,182,236,0.16)' : 'rgba(154,166,234,0.16)'

  const scrollThumb = isDark ? '#46464C' : '#C9C9BC'
  const SCROLL_BASE =
    'overflow-y-auto [scrollbar-gutter:stable] ' +
    '[&::-webkit-scrollbar]:w-2 ' +
    '[&::-webkit-scrollbar-track]:bg-transparent ' +
    '[&::-webkit-scrollbar-thumb]:rounded-full'
  const scrollClass = isDark
    ? `${SCROLL_BASE} [&::-webkit-scrollbar-thumb]:bg-[#46464C] [&::-webkit-scrollbar-thumb:hover]:bg-[#5A5A62]`
    : `${SCROLL_BASE} [&::-webkit-scrollbar-thumb]:bg-[#C9C9BC] [&::-webkit-scrollbar-thumb:hover]:bg-[#B5B5A6]`
  const scrollStyle: React.CSSProperties = {
    scrollbarWidth: 'thin',
    scrollbarColor: `${scrollThumb} transparent`,
  }

  const panelTransition = reduced
    ? { duration: 0.15 }
    : ({ type: 'spring', stiffness: 360, damping: 30 } as const)

  const renderList = (listStyle: React.CSSProperties, className: string) => (
    <div
      className={`flex flex-col gap-1 ${scrollClass} ${className}`}
      style={{ ...scrollStyle, ...listStyle }}
    >
      {tokens.map((t, i) => {
        const isActive = t.symbol === activeSymbol
        const isCurrent = i === safeIndex
        return (
          <button
            key={t.symbol}
            id={optionId(t.symbol)}
            ref={(el) => {
              optionRefs.current[i] = el
            }}
            type="button"
            role="option"
            aria-selected={isActive}
            tabIndex={isCurrent ? 0 : -1}
            onClick={() => onSelect(t.symbol)}
            onFocus={() => setActiveIndex(i)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 text-left transition-colors outline-none"
            style={{
              minHeight: ROW_HEIGHT,
              background: isActive ? activeFill : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = rowHover
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent'
            }}
          >
            <CoinIcon token={t} size={32} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[14px] font-semibold" style={{ color: titleColor }}>
                {t.name}
              </span>
              <span className="truncate text-[12px]" style={{ color: subColor }}>
                {t.symbol}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-0.5">
              <span className="text-[14px] font-semibold tabular-nums" style={{ color: titleColor }}>
                {formatTokenAmount(t.balance)}
              </span>
              <TrendChip token={t} isDark={isDark} />
            </span>
          </button>
        )
      })}
    </div>
  )

  if (typeof document === 'undefined' || !position) return null

  const listMaxHeight = Math.max(0, position.maxHeight - PANEL_PAD_Y)

  return createPortal(
    <motion.div
      ref={panelRef}
      // Portaled outside cardRef: the outside-click handler finds the list by this attribute.
      data-token-dropdown
      id={listId}
      role="listbox"
      aria-label="Select a token"
      aria-activedescendant={optionId(tokens[safeIndex]?.symbol ?? activeSymbol)}
      onKeyDown={onPanelKeyDown}
      className="fixed z-50 flex flex-col rounded-3xl p-1.5 outline-none"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
        background: surface,
        boxShadow: isDark
          ? '0 24px 60px rgba(0,0,0,0.55)'
          : '0 24px 60px rgba(20,20,18,0.16)',
        transformOrigin: position.placement === 'up' ? 'bottom center' : 'top center',
      }}
      initial={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.96, y: position.placement === 'up' ? 6 : -6 }
      }
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      exit={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.96, y: position.placement === 'up' ? 6 : -6 }
      }
      transition={panelTransition}
    >
      {renderList({ maxHeight: listMaxHeight }, 'min-h-0 flex-1')}
    </motion.div>,
    document.body,
  )
}


function SwapCard({
  side,
  token,
  sellInput,
  buyAmount,
  hasAmount,
  isDark,
  reduced,
  locked,
  pickerOpen,
  tokens,
  cardRef,
  onInputChange,
  onMax,
  onTogglePicker,
  onSelect,
}: {
  side: Side
  token: Token
  sellInput: string
  buyAmount: number
  hasAmount: boolean
  isDark: boolean
  reduced: boolean
  locked: boolean
  pickerOpen: boolean
  tokens: Token[]
  cardRef: React.RefObject<HTMLDivElement | null>
  onInputChange?: (value: string) => void
  onMax?: () => void
  onTogglePicker: () => void
  onSelect: (symbol: string) => void
}) {
  const isSell = side === 'sell'
  const pillRef = useRef<HTMLButtonElement>(null)

  const idBase = useId()
  const listId = `${idBase}-list`
  const optionId = useCallback(
    (symbol: string) => `${idBase}-opt-${symbol}`,
    [idBase],
  )

  const cardBg = isDark ? '#1D1D20' : '#F2F2EF'
  const labelColor = isDark ? '#8A8A86' : '#6B6B62'
  const amountColor = isDark ? '#ECECEC' : '#16160F'
  const usdColor = isDark ? '#8A8A86' : '#6E6E66'

  return (
    <div
      className="relative rounded-3xl px-4 py-3"
      style={{ background: cardBg }}
    >
      <span className="text-[12px] font-medium" style={{ color: labelColor }}>
        {isSell ? 'Sell' : 'Buy'}
      </span>

      <div className="mt-1 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {isSell ? (
            <input
              value={sellInput}
              onChange={(e) => onInputChange?.(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              disabled={locked}
              className="w-full min-w-0 bg-transparent font-bold tabular-nums outline-none disabled:cursor-not-allowed"
              style={{
                color: amountColor,
                fontSize: 'clamp(20px, 6vw, 28px)',
                lineHeight: 1.1,
              }}
              aria-label="Sell amount"
            />
          ) : (
            <div
              role="status"
              aria-live="polite"
              aria-label={`Buy amount ${formatTokenAmount(buyAmount)} ${token.symbol}`}
            >
              <AnimatedNumber
                value={buyAmount}
                format={formatTokenAmount}
                reduced={reduced}
                className="block w-full truncate font-bold tabular-nums"
                style={{
                  color: hasAmount ? amountColor : usdColor,
                  fontSize: 'clamp(20px, 6vw, 28px)',
                  lineHeight: 1.1,
                }}
              />
            </div>
          )}
        </div>

        <TokenPill
          ref={pillRef}
          token={token}
          isDark={isDark}
          open={pickerOpen}
          reduced={reduced}
          disabled={locked}
          listId={listId}
          onClick={onTogglePicker}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <TrendChip token={token} isDark={isDark} />

        {isSell && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] tabular-nums" style={{ color: usdColor }}>
              {formatTokenAmount(token.balance)} {token.symbol}
            </span>
            <button
              type="button"
              onClick={onMax}
              disabled={locked}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed [@media(hover:hover)]:hover:[&>span]:bg-[var(--max-hover)]"
              style={{ opacity: locked ? 0.5 : 1 }}
            >
              <span
                className="rounded-full px-2.5 py-1 text-[12px] font-bold transition-colors"
                style={
                  {
                    color: isDark ? '#C7CDF2' : '#4A57B8',
                    background: isDark
                      ? 'rgba(174,182,236,0.16)'
                      : 'rgba(154,166,234,0.16)',
                    '--max-hover': locked
                      ? isDark
                        ? 'rgba(174,182,236,0.16)'
                        : 'rgba(154,166,234,0.16)'
                      : isDark
                        ? 'rgba(174,182,236,0.28)'
                        : 'rgba(154,166,234,0.28)',
                  } as React.CSSProperties
                }
              >
                Max
              </span>
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {pickerOpen && (
          <TokenPicker
            tokens={tokens}
            activeSymbol={token.symbol}
            isDark={isDark}
            reduced={reduced}
            listId={listId}
            optionId={optionId}
            triggerRef={pillRef}
            boundRef={cardRef}
            onSelect={onSelect}
          />
        )}
      </AnimatePresence>
    </div>
  )
}


const TokenPill = forwardRef<
  HTMLButtonElement,
  {
    token: Token
    isDark: boolean
    open: boolean
    reduced: boolean
    disabled: boolean
    listId: string
    onClick: () => void
  }
>(function TokenPill({ token, isDark, open, reduced, disabled, listId, onClick }, ref) {
  const pillBg = isDark ? '#2A2A2E' : '#FFFFFF'
  const pillHoverBg = isDark ? '#34343A' : '#F4F4F1'
  const caretColor = isDark ? '#8A8A86' : '#6B6B62'
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={
        disabled
          ? undefined
          : reduced
            ? { background: pillHoverBg }
            : { scale: 1.03, background: pillHoverBg }
      }
      whileTap={disabled || reduced ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="flex shrink-0 items-center gap-2 rounded-full pl-1.5 pr-3 disabled:cursor-not-allowed"
      style={{
        minHeight: 44,
        background: pillBg,
        opacity: disabled ? 0.6 : 1,
        boxShadow: isDark
          ? '0 1px 2px rgba(0,0,0,0.3)'
          : '0 1px 3px rgba(20,20,18,0.1)',
      }}
      aria-label={`Change token, currently ${token.symbol}`}
      aria-haspopup="listbox"
      aria-controls={listId}
      aria-expanded={open}
    >
      <CoinIcon token={token} size={28} />
      <span
        className="text-[16px] font-bold"
        style={{ color: isDark ? '#ECECEC' : '#16160F' }}
      >
        {token.symbol}
      </span>
      <motion.span
        animate={{ rotate: open ? 180 : 0 }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: 'spring', stiffness: 360, damping: 26 }
        }
        style={{ display: 'inline-flex' }}
      >
        <CaretDown size={14} weight="regular" style={{ color: caretColor }} />
      </motion.span>
    </motion.button>
  )
})


interface SwapQuote {
  sellToken: Token
  buyToken: Token
  midRate: number
  priceImpact: number
  networkFeeUsd: number
  buyAmount: number
  minReceived: number
  slippage: number
}

function DetailsPanel({
  quote,
  hasAmount,
  isDark,
  reduced,
  slippageOptions,
  slippage,
  onSlippageChange,
}: {
  quote: SwapQuote
  hasAmount: boolean
  isDark: boolean
  reduced: boolean
  slippageOptions: SlippageOption[]
  slippage: number
  onSlippageChange: (value: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [inverted, setInverted] = useState(false)
  const [slipOpen, setSlipOpen] = useState(false)
  const slipRef = useRef<HTMLDivElement>(null)

  const labelColor = isDark ? '#8A8A86' : '#6B6B62'
  const valueColor = isDark ? '#ECECEC' : '#16160F'
  const panelBg = isDark ? '#1D1D20' : '#F2F2EF'
  const rowHoverFill = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(20,20,18,0.045)'
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(20,20,18,0.08)'
  const chipBg = isDark ? '#26262A' : '#FFFFFF'
  const chipHoverBg = isDark ? '#303036' : '#F4F4F1'
  const chipShadow = isDark
    ? '0 1px 2px rgba(0,0,0,0.3)'
    : '0 1px 2px rgba(20,20,18,0.08)'
  const chipActiveBg = isDark
    ? 'rgba(174,182,236,0.16)'
    : 'rgba(154,166,234,0.16)'
  const chipActiveText = isDark ? '#C7CDF2' : '#4A57B8'
  const colors = trendColors(isDark)

  const impactPct = quote.priceImpact * 100
  const amber = isDark ? '#F5A524' : '#C77700'
  const impactColor =
    impactPct > 2 ? colors.down : impactPct >= 0.5 ? amber : colors.up

  const fromTok = inverted ? quote.buyToken : quote.sellToken
  const toTok = inverted ? quote.sellToken : quote.buyToken
  const rate = inverted ? 1 / quote.midRate : quote.midRate

  useEffect(() => {
    if (!slipOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSlipOpen(false)
    }
    function onPointer(e: MouseEvent | TouchEvent) {
      if (slipRef.current && !slipRef.current.contains(e.target as Node)) {
        setSlipOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
    }
  }, [slipOpen])

  const activeSlipLabel =
    slippageOptions.find((o) => o.value === slippage)?.label ?? '0.5%'
  const slipDisplay =
    activeSlipLabel === 'Auto'
      ? `Auto (${(slippage * 100).toFixed(1)}%)`
      : `${(slippage * 100).toFixed(1)}%`

  const rateTransition = reduced
    ? { duration: 0 }
    : { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div
      className="overflow-hidden rounded-3xl px-4"
      style={{ background: panelBg }}
    >
      <div
        className="flex items-center justify-between gap-2 -mx-4 px-4 transition-colors [@media(hover:hover)]:hover:bg-[var(--row-hover)]"
        style={
          { minHeight: 48, '--row-hover': rowHoverFill } as React.CSSProperties
        }
      >
        <button
          type="button"
          onClick={() => setInverted((v) => !v)}
          className="group flex min-w-0 items-center gap-1.5 self-stretch transition-colors"
          aria-label="Invert exchange rate"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={inverted ? 'inv' : 'std'}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={rateTransition}
              className="truncate text-[14px] font-semibold tabular-nums"
              style={{ color: valueColor }}
            >
              1 {fromTok.symbol} = {formatRate(rate)} {toTok.symbol}
            </motion.span>
          </AnimatePresence>
          <ArrowsLeftRight
            size={14}
            weight="regular"
            className="shrink-0 transition-colors [@media(hover:hover)]:group-hover:text-[var(--invert-hover)]"
            style={
              { color: labelColor, '--invert-hover': valueColor } as React.CSSProperties
            }
          />
        </button>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="-my-[9px] -mr-[9px] inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center transition-colors [@media(hover:hover)]:hover:[&>span]:bg-[var(--toggle-hover)]"
          style={{ '--toggle-hover': rowHoverFill } as React.CSSProperties}
          aria-label={expanded ? 'Hide swap details' : 'Show swap details'}
          aria-expanded={expanded}
        >
          <span
            className="flex items-center justify-center rounded-full transition-colors"
            style={{ width: 26, height: 26 }}
          >
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 26 }}
              style={{ display: 'inline-flex' }}
            >
              <CaretDown size={14} weight="regular" style={{ color: labelColor }} />
            </motion.span>
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="breakdown"
            initial={reduced ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'visible' }}
          >
            <div
              className="mt-3 flex flex-col gap-1.5 pt-3 pb-3"
              style={{ boxShadow: `inset 0 1px 0 0 ${dividerColor}` }}
            >
              <div className="flex items-center justify-between gap-2" style={{ minHeight: 24 }}>
                <span className="text-[12px]" style={{ color: labelColor }}>
                  Price impact
                </span>
                <span
                  className="text-[12px] font-semibold tabular-nums"
                  style={{ color: impactColor }}
                >
                  {hasAmount ? `-${impactPct.toFixed(2)}%` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2" style={{ minHeight: 24 }}>
                <span className="text-[12px]" style={{ color: labelColor }}>
                  Network fee
                </span>
                <AnimatedNumber
                  value={quote.networkFeeUsd}
                  format={(n) => `~${formatUsd(n)}`}
                  reduced={reduced}
                  className="text-[12px] font-semibold tabular-nums"
                  style={{ color: valueColor }}
                />
              </div>

              <div
                className="relative flex items-center justify-between gap-2"
                style={{ minHeight: 28 }}
                ref={slipRef}
              >
                <span className="text-[12px]" style={{ color: labelColor }}>
                  Max slippage
                </span>
                <button
                  type="button"
                  onClick={() => setSlipOpen((v) => !v)}
                  className="-my-2 inline-flex min-h-[44px] items-center justify-center transition-colors [@media(hover:hover)]:hover:[&>span]:bg-[var(--chip-hover)]"
                  style={{ '--chip-hover': chipHoverBg } as React.CSSProperties}
                  aria-label="Change slippage tolerance"
                  aria-expanded={slipOpen}
                >
                  <span
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors"
                    style={{ background: chipBg, boxShadow: chipShadow }}
                  >
                    <GearSix size={14} weight="regular" style={{ color: labelColor }} />
                    <span className="text-[12px] font-semibold tabular-nums" style={{ color: valueColor }}>
                      {slipDisplay}
                    </span>
                  </span>
                </button>

                <AnimatePresence>
                  {slipOpen && (
                    <motion.div
                      key="slip-pop"
                      className="absolute right-0 z-30 flex gap-1 rounded-2xl p-1.5"
                      style={{
                        bottom: 'calc(100% + 6px)',
                        background: chipBg,
                        boxShadow: isDark
                          ? '0 16px 40px rgba(0,0,0,0.5)'
                          : '0 16px 40px rgba(20,20,18,0.14)',
                      }}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 6 }}
                      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 6 }}
                      transition={reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 420, damping: 30 }}
                    >
                      {slippageOptions.map((o) => {
                        const active = o.value === slippage
                        return (
                          <button
                            key={o.label}
                            type="button"
                            onClick={() => {
                              onSlippageChange(o.value)
                              setSlipOpen(false)
                            }}
                            className="inline-flex min-h-[44px] items-center justify-center transition-colors [@media(hover:hover)]:hover:[&>span]:bg-[var(--opt-hover)]"
                            style={
                              {
                                '--opt-hover': active
                                  ? chipActiveBg
                                  : rowHoverFill,
                              } as React.CSSProperties
                            }
                          >
                            <span
                              className="rounded-xl px-2.5 py-1.5 text-[12px] font-semibold tabular-nums transition-colors"
                              style={{
                                background: active ? chipActiveBg : 'transparent',
                                color: active ? chipActiveText : valueColor,
                              }}
                            >
                              {o.label}
                            </span>
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between gap-2" style={{ minHeight: 24 }}>
                <span className="text-[12px]" style={{ color: labelColor }}>
                  Min received
                </span>
                <span
                  className="text-[12px] font-semibold tabular-nums"
                  style={{ color: valueColor }}
                >
                  {hasAmount
                    ? `${formatTokenAmount(quote.minReceived)} ${quote.buyToken.symbol}`
                    : '—'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


export default function CryptoSwap() {
  const rootRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme(rootRef)
  const isDark = theme === 'dark'
  const prefersReduced = useReducedMotion()
  const reduced = prefersReduced ?? false

  const [tokens, setTokens] = useState<Token[]>(INITIAL_TOKENS)
  const [sellSymbol, setSellSymbol] = useState('ETH')
  const [buySymbol, setBuySymbol] = useState('BTC')
  const [sellInput, setSellInput] = useState(DEFAULT_SELL_INPUT)
  const [picker, setPicker] = useState<Side | null>(null)
  const [status, setStatus] = useState<SwapStatus>('idle')
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)
  const [networkFeeUsd, setNetworkFeeUsd] = useState(NETWORK_FEE_BASE_USD)

  const cardRef = useRef<HTMLDivElement>(null)
  const flipAngle = useMotionValue(0)
  const flipCount = useRef(0)
  const flipControls = useRef<ReturnType<typeof animate> | null>(null)
  useEffect(() => () => flipControls.current?.stop(), [])

  const sellToken = useMemo(
    () => tokens.find((t) => t.symbol === sellSymbol) ?? tokens[0],
    [tokens, sellSymbol],
  )
  const buyToken = useMemo(
    () => tokens.find((t) => t.symbol === buySymbol) ?? tokens[1],
    [tokens, buySymbol],
  )

  const sellAmount = parseFloat(sellInput) || 0
  const sellUsd = sellAmount * sellToken.usdPrice
  const midRate = buyToken.usdPrice > 0 ? sellToken.usdPrice / buyToken.usdPrice : 0
  const idealBuy = sellAmount * midRate
  const priceImpact = sellAmount > 0
    ? clamp(sellUsd / POOL_DEPTH_USD, IMPACT_FLOOR, IMPACT_CAP)
    : 0
  const buyAmount = idealBuy * (1 - priceImpact)
  const minReceived = buyAmount * (1 - slippage)

  const hasAmount = sellAmount > 0

  const locked = status !== 'idle'

  const quote: SwapQuote = useMemo(
    () => ({
      sellToken,
      buyToken,
      midRate,
      priceImpact,
      networkFeeUsd,
      buyAmount,
      minReceived,
      slippage,
    }),
    [sellToken, buyToken, midRate, priceImpact, networkFeeUsd, buyAmount, minReceived, slippage],
  )

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => {
      setTokens((prev) =>
        prev.map((t) => {
          if (t.symbol === 'USDC' || t.symbol === 'USDT') return t
          const drift = 1 + (Math.random() - 0.5) * 0.006
          const next = t.usdPrice * drift
          return {
            ...t,
            usdPrice: next,
            change24h: ((next - t.basePrice) / t.basePrice) * 100,
          }
        }),
      )
      setNetworkFeeUsd(
        clamp(NETWORK_FEE_BASE_USD + (Math.random() - 0.5) * 1.6, 1.6, 3.2),
      )
    }, PRICE_DRIFT_MS)
    return () => window.clearInterval(id)
  }, [reduced])

  useEffect(() => {
    if (!picker) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPicker(null)
    }
    function onPointer(e: MouseEvent | TouchEvent) {
      const target = e.target as Node | null
      const inCard = cardRef.current?.contains(target ?? null) ?? false
      const inDropdown =
        target instanceof Element &&
        target.closest('[data-token-dropdown]') !== null
      if (!inCard && !inDropdown) {
        setPicker(null)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
    }
  }, [picker])

  const handleFlip = useCallback(() => {
    if (locked) return
    setSellSymbol(buySymbol)
    setBuySymbol(sellSymbol)
    setSellInput(buyAmount > 0 ? capForInput(buyAmount) : '')
    flipCount.current += 1
    const target = flipCount.current * 180
    flipControls.current?.stop()
    if (reduced) {
      flipAngle.set(target)
      flipControls.current = null
    } else {
      flipControls.current = animate(flipAngle, target, {
        type: 'spring',
        stiffness: 320,
        damping: 22,
      })
    }
  }, [locked, buySymbol, sellSymbol, buyAmount, flipAngle, reduced])

  const handleSelect = useCallback(
    (side: Side, symbol: string) => {
      if (locked) return
      setPicker(null)
      if (side === 'sell') {
        if (symbol === buySymbol) {
          handleFlip()
        } else if (symbol !== sellSymbol) {
          setSellSymbol(symbol)
          setSellInput(DEFAULT_SELL_INPUT)
        }
      } else {
        if (symbol === sellSymbol) {
          handleFlip()
        } else {
          setBuySymbol(symbol)
        }
      }
    },
    [locked, buySymbol, sellSymbol, handleFlip],
  )

  useEffect(() => {
    if (status === 'swapping') {
      const t = window.setTimeout(() => setStatus('success'), SWAP_SWAPPING_MS)
      return () => window.clearTimeout(t)
    }
    if (status === 'success') {
      const t = window.setTimeout(() => setStatus('idle'), SWAP_SUCCESS_MS)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [status])

  const handleSwap = useCallback(() => {
    if (!hasAmount || status !== 'idle') return
    setStatus('swapping')
  }, [hasAmount, status])

  const handleMax = useCallback(() => {
    if (locked) return
    setSellInput(capForInput(sellToken.balance))
  }, [locked, sellToken.balance])

  const pageBg = isDark ? '#0A0A0A' : '#E6E6E3'
  const trayBg = isDark ? '#141416' : '#FFFFFF'
  const trayShadow = isDark
    ? '0 24px 60px rgba(0,0,0,0.6)'
    : '0 20px 50px rgba(20,20,18,0.12)'
  const flipBtnBg = isDark ? '#2A2A2E' : '#0A0A0A'
  const flipBtnHoverBg = isDark ? '#34343A' : '#1F1F1F'
  const flipIconColor = isDark ? '#ECECEC' : '#FFFFFF'

  const swapBg = isDark ? '#AEB6EC' : '#9AA6EA'
  const swapHoverBg = isDark ? '#C2C8F2' : '#AEB8F0'
  const swapText = '#0A0A0A'
  const swapDisabledBg = isDark ? '#26262A' : '#DCDCD8'
  const swapDisabledText = isDark ? '#9A9A95' : '#5F5F58'

  const swapSuccessBg = isDark ? '#22C55E' : '#0FA968'
  const swapSuccessText = '#0A0A0A'
  const swapSuccessGlow = isDark
    ? 'rgba(34,197,94,0.55)'
    : 'rgba(15,169,104,0.45)'

  const buttonEnabled = hasAmount && status === 'idle'

  let buttonBg = swapBg
  let buttonText = swapText
  let buttonCursor: React.CSSProperties['cursor'] = 'pointer'
  if (status === 'success') {
    buttonBg = swapSuccessBg
    buttonText = swapSuccessText
    buttonCursor = 'default'
  } else if (status === 'swapping') {
    buttonBg = swapBg
    buttonText = swapText
    buttonCursor = 'progress'
  } else if (!hasAmount) {
    buttonBg = swapDisabledBg
    buttonText = swapDisabledText
    buttonCursor = 'not-allowed'
  }

  return (
    <div
      ref={rootRef}
      className="flex min-h-screen w-full items-center justify-center px-4 py-10"
      style={{ background: pageBg }}
    >
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[360px]"
      >
        <div
          ref={cardRef}
          className="flex flex-col gap-2 rounded-[28px] p-2"
          style={{ background: trayBg, boxShadow: trayShadow }}
        >
          <div className="flex flex-col gap-2">
            <div className="relative">
              <SwapCard
                side="sell"
                token={sellToken}
                sellInput={sellInput}
                buyAmount={buyAmount}
                hasAmount={hasAmount}
                isDark={isDark}
                reduced={reduced}
                locked={locked}
                pickerOpen={picker === 'sell'}
                tokens={tokens}
                cardRef={cardRef}
                onInputChange={(v) => setSellInput(sanitizeDecimal(v))}
                onMax={handleMax}
                onTogglePicker={() => {
                  if (locked) return
                  setPicker((prev) => (prev === 'sell' ? null : 'sell'))
                }}
                onSelect={(symbol) => handleSelect('sell', symbol)}
              />

              <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 translate-x-[-50%] translate-y-[calc(50%+4px)]">
                <motion.button
                  type="button"
                  onClick={handleFlip}
                  disabled={locked}
                  whileHover={
                    locked
                      ? undefined
                      : reduced
                        ? { background: flipBtnHoverBg }
                        : { scale: 1.08, background: flipBtnHoverBg }
                  }
                  whileTap={locked || reduced ? undefined : { scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  className="pointer-events-auto flex items-center justify-center rounded-full disabled:cursor-not-allowed"
                  style={{
                    width: 44,
                    height: 44,
                    background: flipBtnBg,
                    opacity: locked ? 0.6 : 1,
                    boxShadow: isDark
                      ? `0 0 0 4px ${trayBg}, 0 4px 14px rgba(0,0,0,0.5)`
                      : `0 0 0 4px ${trayBg}, 0 4px 14px rgba(20,20,18,0.18)`,
                  }}
                  aria-label="Flip swap direction"
                >
                  <motion.span
                    style={{
                      rotate: flipAngle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 0,
                      transformOrigin: 'center',
                    }}
                  >
                    <ArrowsDownUp size={18} weight="regular" style={{ color: flipIconColor }} />
                  </motion.span>
                </motion.button>
              </div>
            </div>

            <SwapCard
              side="buy"
              token={buyToken}
              sellInput={sellInput}
              buyAmount={buyAmount}
              hasAmount={hasAmount}
              isDark={isDark}
              reduced={reduced}
              locked={locked}
              pickerOpen={picker === 'buy'}
              tokens={tokens}
              cardRef={cardRef}
              onTogglePicker={() => {
                if (locked) return
                setPicker((prev) => (prev === 'buy' ? null : 'buy'))
              }}
              onSelect={(symbol) => handleSelect('buy', symbol)}
            />
          </div>

          <DetailsPanel
            quote={quote}
            hasAmount={hasAmount}
            isDark={isDark}
            reduced={reduced}
            slippageOptions={SLIPPAGE_OPTIONS}
            slippage={slippage}
            onSlippageChange={setSlippage}
          />

          <motion.button
            type="button"
            onClick={handleSwap}
            disabled={!buttonEnabled}
            whileHover={buttonEnabled ? { background: swapHoverBg } : undefined}
            whileTap={buttonEnabled && !reduced ? { scale: 0.98 } : undefined}
            animate={{
              background: buttonBg,
              scale: status === 'success' && !reduced ? [1, 1.04, 1] : 1,
          }}
          transition={{
            background: { duration: reduced ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] },
            scale: reduced
              ? { duration: 0 }
              : { duration: 0.42, times: [0, 0.45, 1], ease: [0.22, 1, 0.36, 1] },
          }}
          className="relative flex w-full items-center justify-center gap-2 rounded-3xl text-[16px] font-bold"
          style={{
            height: 48,
            background: buttonBg,
            color: buttonText,
            cursor: buttonCursor,
            overflow: 'visible',
          }}
        >
          <AnimatePresence>
            {status === 'success' && !reduced && (
              <motion.span
                key="bloom"
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl"
                initial={{ opacity: 0.85, boxShadow: `0 0 0 0px ${swapSuccessGlow}` }}
                animate={{ opacity: 0, boxShadow: `0 0 0 14px ${swapSuccessGlow}` }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            {status === 'idle' && (
              <motion.span
                key="idle"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {hasAmount ? 'Swap' : 'Enter an amount'}
              </motion.span>
            )}

            {status === 'swapping' && (
              <motion.span
                key="swapping"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  className="inline-block rounded-full"
                  style={{
                    width: 18,
                    height: 18,
                    border: `2px solid ${swapText}`,
                    borderTopColor: 'transparent',
                  }}
                  animate={reduced ? {} : { rotate: 360 }}
                  transition={
                    reduced
                      ? undefined
                      : { repeat: Infinity, ease: 'linear', duration: 0.8 }
                  }
                />
                Swapping…
              </motion.span>
            )}

            {status === 'success' && (
              <motion.span
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="relative flex items-center gap-2"
              >
                <span className="relative inline-flex items-center justify-center">
                  <motion.span
                    className="inline-flex"
                    initial={reduced ? { scale: 1 } : { scale: 0, rotate: -18 }}
                    animate={reduced ? { scale: 1 } : { scale: 1, rotate: 0 }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 520, damping: 16, delay: 0.04 }
                    }
                  >
                    <CheckCircle size={22} weight="fill" style={{ color: swapSuccessText }} />
                  </motion.span>

                  {!reduced &&
                    SUCCESS_SPARKS.map((s, i) => (
                      <motion.span
                        key={i}
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
                        style={{ width: 4, height: 4, background: swapSuccessText }}
                        initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                        animate={{
                          opacity: [0, 1, 0],
                          x: Math.cos(s) * 22,
                          y: Math.sin(s) * 22,
                          scale: [0.4, 1, 0.2],
                        }}
                        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.06 }}
                      />
                    ))}
                </span>
                Swapped!
              </motion.span>
            )}
          </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
