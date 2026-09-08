// Closed list of tech stack values for components.
// Each component can list multiple. Used to:
//   1. Render a "Built with" row above the About section
//   2. Filter noise from the header chips so only category + use-cases show
//
// Order matters — controls left-to-right rendering order.

const STACK_VOCABULARY = [
  'Tailwind CSS',
  'Motion',
  'Three.js',
  'WebGL',
  'Canvas',
  'Matter.js',
  'CSS-only',
] as const

export type Stack = (typeof STACK_VOCABULARY)[number]

const STACK_SET = new Set<string>(STACK_VOCABULARY)

export function isStackLabel(label: string): label is Stack {
  return STACK_SET.has(label)
}

// Brand-mark SVGs. Each entry carries its own viewBox because the Motion
// wordmark is a wide rectangle while the others are square. Paths are
// rendered with fill="currentColor" so they inherit the surrounding text
// color, and an explicit height/width pair derived from the viewBox keeps
// optical sizing consistent across icons. `pixelHeight` overrides the
// default rendered height for icons whose ink fills the viewBox edge-to-
// edge (like the Motion wordmark) so they don't visually swamp the
// padded square icons.
export type StackIcon = { viewBox: string; path: string; pixelHeight?: number }

export const STACK_ICONS: Record<Stack, StackIcon> = {
  // Official Motion wordmark, sourced from motion.dev (the rebranded name
  // for what was previously Framer Motion). Renders at a shorter pixel
  // height than the square icons because the wordmark ink fills its full
  // viewBox edge-to-edge, with no internal padding.
  Motion: {
    viewBox: '0 0 25.364 9',
    pixelHeight: 10,
    path:
      'M 9.587 0 L 4.57 9 L 0 9 L 3.917 1.972 C 4.524 0.883 6.039 0 7.301 0 Z M 20.794 2.25 C 20.794 1.007 21.817 0 23.079 0 C 24.341 0 25.364 1.007 25.364 2.25 C 25.364 3.493 24.341 4.5 23.079 4.5 C 21.817 4.5 20.794 3.493 20.794 2.25 Z M 10.443 0 L 15.013 0 L 9.997 9 L 5.427 9 Z M 15.841 0 L 20.411 0 L 16.494 7.028 C 15.887 8.117 14.372 9 13.11 9 L 10.825 9 Z',
  },
  'Three.js': {
    viewBox: '0 0 24 24',
    path:
      'M.38 0a.268.268 0 0 0-.256.332l2.894 11.716a.268.268 0 0 0 .01.04l2.91 11.708a.268.268 0 0 0 .447.128L23.802 7.15a.268.268 0 0 0-.118-.45L11.85 3.83a.268.268 0 0 0-.034-.007L.413.005A.268.268 0 0 0 .38 0zm.52.643l10.682 3.41-8.095 8.197L.9.643zm11.302 3.847l10.685 2.764-13.55 13.55 2.865-16.314zm-.475.508L8.866 21.337 3.482 12.92l8.245-7.922z',
  },
  'Tailwind CSS': {
    viewBox: '0 0 24 24',
    path:
      'M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zM6.001 12c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C7.666 17.818 9.027 19.2 12.001 19.2c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z',
  },
  WebGL: {
    viewBox: '0 0 24 24',
    path:
      'M11.998 0C5.366 0 0 5.367 0 12c0 6.634 5.366 12 11.998 12C18.633 24 24 18.634 24 12c0-6.633-5.367-12-12.002-12zm0 1.5c5.798 0 10.502 4.703 10.502 10.5 0 5.798-4.704 10.5-10.502 10.5C6.202 22.5 1.5 17.798 1.5 12c0-5.797 4.702-10.5 10.498-10.5zM7 7v10h2v-4h2.5v4h2V7h-2v3.5H9V7H7zm8 0v10h2V7h-2z',
  },
  Canvas: {
    viewBox: '0 0 24 24',
    path:
      'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7z',
  },
  'Matter.js': {
    viewBox: '0 0 24 24',
    path:
      'M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19.5 8 12 11.5 4.5 8 12 4.5zM4 9.5l7 3.5v7l-7-3.5v-7zm9 10.5v-7l7-3.5v7L13 20z',
  },
  'CSS-only': {
    viewBox: '0 0 24 24',
    path:
      'M1.5 0h21l-1.91 21.563L11.977 24 3.42 21.566 1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716H8.59l.255 2.716h6.625l-.255 2.717-3.215.795-3.214-.795-.205-2.205H5.81l.34 4.376 5.825 1.561 5.824-1.561.736-7.892H10.4l-.255-2.717h8.45z',
  },
}

// Helper: compute pixel width for a fixed pixel height while preserving the
// icon's native aspect ratio.
export function stackIconWidthForHeight(icon: StackIcon, height: number): number {
  const parts = icon.viewBox.trim().split(/\s+/).map(Number)
  const vbW = parts[2] ?? 24
  const vbH = parts[3] ?? 24
  return Math.round((height * vbW) / vbH)
}
