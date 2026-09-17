// The two brain looks, one per system, so every brain on the site reads the
// same way wherever it is drawn:
//
// - Andromeda Pro: the four corpus sections in their own colours, blended
//   across the wireframe by which way each vertex faces.
// - Andromeda (the free system): one gray.
//
// Light takes each colour a few stops deeper: a pale hairline on a pale ground
// is no wire at all. Hex values here are sRGB; `new THREE.Color(hex)` converts
// them to the linear channels a vertex colour buffer wants.

import type { Theme } from '../components/ThemeProvider'

export const BRAIN_ZONES: { label: string; dir: [number, number, number]; hex: Record<Theme, string> }[] = [
  { label: 'Index', dir: [0.2, 0.9, 0.35], hex: { dark: '#a78bfa', light: '#7c3aed' } }, // purple
  { label: 'Foundations', dir: [-0.9, 0.05, 0.4], hex: { dark: '#38bdf8', light: '#0284c7' } }, // cyan
  { label: 'Components', dir: [0.9, 0.05, 0.4], hex: { dark: '#fb923c', light: '#ea580c' } }, // orange
  { label: 'Skills', dir: [0.0, -0.7, 0.7], hex: { dark: '#a3e635', light: '#65a30d' } }, // lime
]

export const BRAIN_GRAY: Record<Theme, string> = { dark: '#9B9B9E', light: '#B0B0B4' }

type Rgb = [number, number, number]

// The zone directions, normalised once.
const DIRS: Rgb[] = BRAIN_ZONES.map(({ dir: [x, y, z] }) => {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
})

// Writes the blended zone colour for a unit direction (x, y, z) into `out` at
// `offset`. `cols` are the zone colours as linear RGB, in BRAIN_ZONES order.
// Each zone's weight is its facing cubed, so each section holds its own area,
// plus an epsilon so no wire on the far side goes fully black.
export function blendZones(x: number, y: number, z: number, cols: Rgb[], out: Float32Array, offset: number) {
  let wsum = 0
  let r = 0
  let g = 0
  let b = 0
  for (let k = 0; k < DIRS.length; k++) {
    const dot = Math.max(0, x * DIRS[k][0] + y * DIRS[k][1] + z * DIRS[k][2])
    const w = dot * dot * dot + 0.04
    wsum += w
    r += cols[k][0] * w
    g += cols[k][1] * w
    b += cols[k][2] * w
  }
  out[offset] = r / wsum
  out[offset + 1] = g / wsum
  out[offset + 2] = b / wsum
}
