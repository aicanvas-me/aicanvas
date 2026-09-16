'use client'

// Lazy doors to the Andromeda Pro demos and the Brain. The homepage shell is a
// server component and cannot use ssr:false itself, so this client file holds
// the dynamic imports: the Pro components and three.js load only when the
// homepage hydrates, never in its server HTML or first-load chunk. Each
// placeholder paints the same dark ground, so nothing jumps when a demo lands.

import dynamic from 'next/dynamic'

const Ground = () => <div className="h-full w-full bg-[#0E0E0F]" />

export const TokenDemo = dynamic(() => import('./andromeda-pro-demos').then((m) => m.TokenDemo), {
  ssr: false,
  loading: Ground,
})

export const ThemeDemo = dynamic(() => import('./andromeda-pro-demos').then((m) => m.ThemeDemo), {
  ssr: false,
  loading: Ground,
})

export const InteractionDemo = dynamic(() => import('./andromeda-pro-demos').then((m) => m.InteractionDemo), {
  ssr: false,
  loading: Ground,
})

export const BrainWireframe = dynamic(
  () => import('../design-systems/andromeda-pro/overview-b/BrainWireframe').then((m) => m.BrainWireframe),
  { ssr: false, loading: Ground },
)
