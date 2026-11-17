'use client'

import { useEffect, useState } from 'react'
import { track } from '../lib/analytics'

// The Product Hunt launch badge above the hero. Product Hunt forbids asking for
// votes in any wording, so it only links to the launch; the ribbon carries the code.
// It shows only during the launch day; ?ph=1 previews it at any time.

const PH_URL = 'https://www.producthunt.com'
const LIVE_FROM = Date.parse('2026-11-18T09:01:00+01:00')
const LIVE_UNTIL = Date.parse('2026-11-19T09:00:00+01:00')

function ProductHuntLogo() {
  return (
    <svg viewBox="0 0 40 40" width={32} height={32} aria-hidden className="shrink-0">
      <circle cx="20" cy="20" r="20" fill="#FF6154" />
      <path fill="#fff" d="M22.667 20H17v-6h5.667a3 3 0 0 1 0 6m0-10H13v20h4v-6h5.667a7 7 0 1 0 0-14" />
    </svg>
  )
}

export function ProductHuntBadge() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const now = Date.now()
    const preview = new URLSearchParams(window.location.search).get('ph') === '1'
    setShow(preview || (now >= LIVE_FROM && now < LIVE_UNTIL))
  }, [])

  if (!show) return null

  return (
    <a
      href={PH_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('Product Hunt Badge Click', {})}
      className="aic-hero-rise mb-8 inline-flex items-center gap-3 rounded-control border border-sand-300 bg-sand-100 py-2 pl-2.5 pr-4 text-left transition-colors hover:border-sand-400 dark:border-sand-700 dark:bg-sand-900 dark:hover:border-sand-600"
      style={{ animationDelay: '0.05s' }}
    >
      <ProductHuntLogo />
      <span className="flex h-8 flex-col justify-between">
        <span className="text-[10px] font-semibold uppercase leading-[10px] tracking-wider text-sand-600 dark:text-sand-400">
          We launched today
        </span>
        <span className="text-base font-bold leading-4 text-sand-900 dark:text-sand-50">Product Hunt</span>
      </span>
    </a>
  )
}
