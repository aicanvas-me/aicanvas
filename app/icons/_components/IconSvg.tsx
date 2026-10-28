import { effectiveStrokeWidth } from '../_lib/icon-utils'

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
