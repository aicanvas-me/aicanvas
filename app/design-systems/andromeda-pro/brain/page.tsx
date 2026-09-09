import { preload } from 'react-dom'
import { JetBrains_Mono } from 'next/font/google'
import { BrainStoryV4 } from './BrainStoryV4'

// The Andromeda Brain LANDING — the public marketing story. Anyone can view it
// (it renders only the structure teaser, never brain content). The reader with
// the real rule files lives at the gated child route ./explore/page.tsx.
const jbm = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata = {
  title: 'The Andromeda Brain: Design Rules for On-Brand UI',
  description:
    'Tokens and components are the pieces. The brain is the judgment that assembles them: every foundation, component rule, skill and tool your AI agent reads, so what it builds already matches the system instead of a guess.',
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
