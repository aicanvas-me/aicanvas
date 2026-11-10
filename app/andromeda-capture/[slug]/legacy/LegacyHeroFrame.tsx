'use client'

// Fills the viewport with the Legacy ground and centers one pose in it. The
// frame carries the Legacy theme scope, so the site `theme` cookie (set by the
// script) picks light or dark exactly as on the component pages.
import { useEffect, useState } from 'react'
import { JetBrains_Mono } from 'next/font/google'
import { notFound, useSearchParams } from 'next/navigation'
import { themeColor } from '@/design-systems/andromeda/components/lib/utils'
import { Pose, hasPose } from './legacy-poses'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const GROUND = themeColor.surface.base
const SCREEN = `body{transform:scale(0.72);border-radius:12px;outline:1px solid ${themeColor.border.base};}`
const DOT = `color-mix(in oklab, ${themeColor.text.primary} 6%, transparent)`

export function LegacyHeroFrame({ slug }: { slug: string }) {
  const [ready, setReady] = useState(false)
  const q = useSearchParams()
  const scale = Number(q.get('scale')) || 1
  const shift = { dx: Number(q.get('dx')) || 0, dy: Number(q.get('dy')) || 0 }
  useEffect(() => {
    document.fonts.ready.then(() => requestAnimationFrame(() => setReady(true)))
  }, [])
  if (!hasPose(slug)) notFound()

  return (
    <>
      <style>{`html,body{margin:0;padding:0;overflow:hidden;}[data-dev-overlay],nextjs-portal{display:none!important;}`}</style>
      {/* A drawer covers the whole viewport, so it is shown inside a framed
          screen: a transformed body becomes the box its fixed panel fills. */}
      {slug === 'drawer' ? <style>{SCREEN}</style> : null}
      <div
        data-capture-frame=""
        data-capture-ready={ready ? '' : undefined}
        className={`andromeda-theme-scope ${jetbrainsMono.variable}`}
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: GROUND,
          backgroundImage: `radial-gradient(circle, ${DOT} ${2 / scale}px, transparent ${2 / scale}px)`,
          backgroundSize: `${40 / scale}px ${40 / scale}px`,
          backgroundPosition: 'center',
        }}
      >
        <div style={{ transform: `translate(${shift.dx}px, ${shift.dy}px)` }}>
          <Pose slug={slug} />
        </div>
      </div>
    </>
  )
}
