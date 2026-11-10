import { weightStroke, type IconWeight } from '../_lib/icon-utils'
import { isPreview, previewSrc } from '../_lib/preview'

export function IconSvg({
  markup,
  size,
  weight,
  colour = 'currentColor',
  className = '',
  label,
}: {
  markup: string
  size: number
  weight: IconWeight
  colour?: string
  className?: string
  label?: string
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
      strokeWidth={weightStroke(weight)}
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
