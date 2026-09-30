'use client'

// Snapshot the WebGL canvas to a downloadable PNG at a fixed canonical size
// (matches the video recorder's resolution lock). Source pixels are drawn
// into an offscreen 2D canvas of the requested size, letterboxed to preserve
// aspect — so 1x and 2x always produce predictable 16:9 dimensions
// regardless of the live preview pane's size or the user's display DPR.
//
// PNG is always lossless, so no quality knob is exposed.

import { computeFit } from './fit'

export type ImageScale = '1x' | '2x'

const SCALE_DIMENSIONS: Record<ImageScale, { width: number; height: number }> = {
  '1x': { width: 1920, height: 1080 },
  '2x': { width: 3840, height: 2160 },
}

export async function exportCanvasImage(
  canvas: HTMLCanvasElement,
  scale: ImageScale,
  filename: string,
): Promise<void> {
  const { width, height } = SCALE_DIMENSIONS[scale]

  // Settle the WebGL pipeline before reading. Same fix the recorder uses —
  // prevents the compositor from handing us a stale GPU texture (which can
  // bleed in a neighbouring DOM element's content as a single-frame ghost).
  // Browsers return the original context type only; once a canvas was
  // created as webgl, asking for webgl2 returns null (and vice versa).
  // Probe both — whichever was originally created hands us back the live ctx.
  const gl =
    (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
    (canvas.getContext('webgl') as WebGLRenderingContext | null)
  gl?.finish()

  const target = document.createElement('canvas')
  target.width = width
  target.height = height
  const ctx = target.getContext('2d', {
    alpha: false,
    colorSpace: 'srgb',
    desynchronized: true,
  })
  if (!ctx) throw new Error('Failed to create offscreen 2D context for image export')

  const fit = computeFit(canvas.width, canvas.height, width, height)
  // alpha:false means clearRect paints opaque black — that's the letterbox.
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(canvas, fit.x, fit.y, fit.w, fit.h)

  const blob = await new Promise<Blob | null>((resolve) => {
    target.toBlob(resolve, 'image/png')
  })
  if (!blob) throw new Error('Failed to export PNG from canvas')

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
