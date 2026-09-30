/**
 * Letterbox the source canvas into a fixed-aspect destination. Returns the draw
 * rectangle for ctx.drawImage; the bars are filled by the caller.
 */
export function computeFit(srcW: number, srcH: number, dstW: number, dstH: number) {
  if (srcW <= 0 || srcH <= 0) return { x: 0, y: 0, w: dstW, h: dstH }
  const srcAspect = srcW / srcH
  const dstAspect = dstW / dstH
  if (srcAspect > dstAspect) {
    const w = dstW
    const h = Math.round(dstW / srcAspect)
    return { x: 0, y: Math.round((dstH - h) / 2), w, h }
  }
  const h = dstH
  const w = Math.round(dstH * srcAspect)
  return { x: Math.round((dstW - w) / 2), y: 0, w, h }
}
