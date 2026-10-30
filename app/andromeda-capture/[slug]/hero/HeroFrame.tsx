'use client'

// Fills the viewport with the Pro ground and centers one pose in it. The theme
// is the site's (the `theme` cookie the script sets), applied by the same wrap
// the component pages use, so light and dark match what visitors see.
import { useEffect, useState } from 'react'
import { JetBrains_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { AndromedaThemeWrap } from '../../../design-systems/andromeda-pro/AndromedaThemeWrap'
import { tokens } from '../../../lib/andromeda-pro.generated'
import { POSES } from './poses'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const GROUND = `var(--at-surface-base, ${tokens.color.surface.base})`
const DOT = `color-mix(in oklab, var(--at-text-primary, ${tokens.color.text.primary}) 6%, transparent)`

export function HeroFrame({ slug }: { slug: string }) {
  const [ready, setReady] = useState(false)
  // The script's device scale factor, so the dot grid lands at one image size on every card.
  const [scale, setScale] = useState(1)
  useEffect(() => {
    setScale(Number(new URLSearchParams(window.location.search).get('scale')) || 1)
    document.fonts.ready.then(() => requestAnimationFrame(() => setReady(true)))
  }, [])
  if (!(slug in POSES)) notFound()

  return (
    <AndromedaThemeWrap>
      <style>{`html,body{margin:0;padding:0;overflow:hidden;background:${GROUND};}[data-dev-overlay],nextjs-portal{display:none!important;}`}</style>
      <div
        data-capture-frame=""
        data-capture-ready={ready ? '' : undefined}
        className={jetbrainsMono.variable}
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
        {POSES[slug]}
      </div>
    </AndromedaThemeWrap>
  )
}
