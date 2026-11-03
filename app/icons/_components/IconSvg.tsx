import { effectiveStrokeWidth } from '../_lib/icon-utils'
import { isPreview, previewSrc } from '../_lib/preview'

export function IconSvg({
  markup,
  size,
  strokeWidth,
  colour = 'currentColor',
  className = '',
  label,
  apiSize,
  absolute = true,
}: {
  markup: string
  size: number
  strokeWidth: number
  colour?: string
  className?: string
  label?: string
  apiSize?: number
  absolute?: boolean
}) {
  if (isPreview(markup)) {
    const mask = `url(${previewSrc(markup)}) center / contain no-repeat`
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
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={effectiveStrokeWidth(apiSize ?? size, strokeWidth, absolute)}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: colour }}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
