import { preload } from 'react-dom'
import { JetBrains_Mono } from 'next/font/google'
import { BRAIN_TEASER } from '@/app/lib/andromeda-pro-brain-teaser.generated'
import { BrainStoryV4 } from './BrainStoryV4'

// The Andromeda Pro Brain landing: the public marketing story. Anyone can view
// it (it renders only the structure teaser, never brain content). The reader
// with the real rule files lives at the gated child route ./explore/page.tsx.
const jbm = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

const total = BRAIN_TEASER.totalFiles

export const metadata = {
  title: 'Andromeda Pro Brain: Design Rules Your AI Agent Reads',
  description: `${total} files your AI agent reads before it builds with Andromeda Pro: foundations, a rule file per component, skills and a done-gate. Every file name is open.`,
}

export default function AndromedaBrainLandingPage() {
  // Kick off the GLB byte-fetch at HTML-parse time, before client JS hydrates
  // or Three.js even loads — see BrainStoryV4 for the loader that consumes it.
  preload('/models/brain.glb', { as: 'fetch', crossOrigin: 'anonymous' })

  return (
    <div className={jbm.variable}>
      <BrainStoryV4 />
    </div>
  )
}
