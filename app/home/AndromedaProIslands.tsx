'use client'

// Lazy door to the Brain wireframe. The homepage shell is a server component
// and cannot use ssr:false itself, so this client file holds the dynamic
// import: three.js loads only when the homepage hydrates, never in its server
// HTML or first-load chunk.

import dynamic from 'next/dynamic'

const Ground = () => <div className="h-full w-full" />

export const BrainWireframe = dynamic(
  () => import('../design-systems/andromeda-pro/overview-b/BrainWireframe').then((m) => m.BrainWireframe),
  { ssr: false, loading: Ground },
)
