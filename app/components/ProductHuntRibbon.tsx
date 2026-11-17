import Link from 'next/link'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { RibbonReveal } from './RibbonReveal'

// The Product Hunt launch offer, a thin ribbon above the top bar on every page.
// It runs from the launch until the ProductHunt code expires in Paddle, and is
// checked per request, so it appears and leaves without a deploy. Development
// always shows it. It leads to /pricing, where the code is entered at checkout.
// It slides away on scroll down and back on scroll up (RibbonReveal).

const LIVE_FROM = Date.parse('2026-11-18T09:01:00+01:00')
const LIVE_UNTIL = Date.parse('2026-11-30T23:59:59Z')

export function ProductHuntRibbon() {
  const now = Date.now()
  const live = process.env.NODE_ENV === 'development' || (now >= LIVE_FROM && now <= LIVE_UNTIL)
  if (!live) return null

  return (
    <RibbonReveal>
    <Link
      href="/pricing"
      className="flex shrink-0 items-center justify-center gap-2 bg-accent px-4 py-2 text-center text-xs font-semibold leading-4 text-accent-foreground transition-colors hover:bg-accent/90"
    >
      <svg viewBox="0 0 40 40" width={16} height={16} aria-hidden className="shrink-0">
        <circle cx="20" cy="20" r="20" fill="#FF6154" />
        <path fill="#fff" d="M22.667 20H17v-6h5.667a3 3 0 0 1 0 6m0-10H13v20h4v-6h5.667a7 7 0 1 0 0-14" />
      </svg>
      <span>
        Product Hunt launch special: 40% off Lifetime with code <span className="rounded-sm bg-accent-foreground/10 px-1.5 font-extrabold">ProductHunt</span>
      </span>
      <ArrowRight size={14} aria-hidden className="shrink-0" />
    </Link>
    </RibbonReveal>
  )
}
