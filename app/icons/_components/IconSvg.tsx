import { weightStroke, type IconWeight } from '../_lib/icon-utils'
import { isPreview, previewSrc } from '../_lib/preview'

export function IconSvg({
  markup,
  size,
  weight,
  colour = 'currentColor',
  className = '',
  label,
  large = false,
}: {
  markup: string
  // pixels, or any CSS length when the box decides the size
  size: number | string
  weight: IconWeight
  colour?: string
  className?: string
  label?: string
  // a paid preview drawn big takes the sharp large raster
  large?: boolean
}) {
  if (isPreview(markup)) {
    const mask = `url(${previewSrc(markup, large)}) center / contain no-repeat`
    return (
      <span
        className={`inline-block shrink-0 ${className}`}
        style={{ width: size, height: size, backgroundColor: colour, mask, WebkitMask: mask }}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      />
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width={typeof size === 'number' ? size : undefined}
      height={typeof size === 'number' ? size : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth={weightStroke(weight)}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={typeof size === 'number' ? { color: colour } : { color: colour, width: size, height: size }}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
