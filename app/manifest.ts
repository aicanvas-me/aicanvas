import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Canvas',
    short_name: 'AI Canvas',
    description:
      'Design systems, design rules, and React components for AI coding agents.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0E0E0F',
    theme_color: '#0E0E0F',
    icons: [
      {
        src: '/ai-canvas-icon-square.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
