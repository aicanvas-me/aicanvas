import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { RibbonReveal } from './RibbonReveal'

// The Black Friday to Cyber Monday offer (the ProductHunt code), a thin ribbon
// above the top bar on every page. It runs until the code expires in Paddle and
// is checked per request, so it leaves without a deploy. Development always
// shows it. It leads to /pricing, where the code is entered at checkout. It
// slides away on scroll down and back on scroll up, and its X hides it for good
// through a cookie read here, so a closed ribbon never flashes back on load.

const LIVE_FROM = Date.parse('2026-11-18T09:01:00+01:00')
const LIVE_UNTIL = Date.parse('2026-11-30T23:59:59Z')
const CLOSED_COOKIE = 'ribbon-bf-2026-closed'

function offerLive() {
  const now = Date.now()
  return process.env.NODE_ENV === 'development' || (now >= LIVE_FROM && now <= LIVE_UNTIL)
}

export async function ProductHuntRibbon() {
  if (!offerLive() || (await cookies()).has(CLOSED_COOKIE)) return null

  return (
    <RibbonReveal closeCookie={CLOSED_COOKIE}>
    <Link
      href="/pricing"
      className="flex shrink-0 items-center justify-center gap-2 bg-accent px-10 py-2 text-center text-xs font-semibold leading-4 text-accent-foreground transition-colors hover:bg-accent/90"
    >
      <span aria-hidden className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#FF6154] text-[10px] font-extrabold leading-none text-white">%</span>
      <span>
        Black Friday to Cyber Monday: 40% off Lifetime with code <span className="rounded-sm bg-accent-foreground/10 px-1.5 font-extrabold">ProductHunt</span>
      </span>
      <ArrowRight size={14} aria-hidden className="shrink-0" />
    </Link>
    </RibbonReveal>
  )
}
