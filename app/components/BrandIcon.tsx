// The AI Canvas mark in one colour, drawn in currentColor so it follows the
// text beside it: near-white on dark, ink on light. Same geometry as
// /public/ai-canvas-icon.svg; the upper inner facet keeps a faint tint of the
// same colour so the mark still reads as two planes.
export function BrandIcon({ className = '', width, height }: { className?: string; width?: number; height?: number }) {
  return (
    <svg
      viewBox="36.64 62.29 340 291.43"
      width={width}
      height={height}
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M279.051 62.2856C287.689 62.2856 295.676 66.8735 300.029 74.3345L314.25 98.7142L363.724 183.526C372.546 198.65 372.546 217.35 363.724 232.474L314.25 317.286L300.029 341.665C295.676 349.126 287.689 353.714 279.051 353.714H136.949C128.311 353.714 120.324 349.126 115.972 341.665L45.1382 220.237C40.7272 212.675 40.7272 203.325 45.1382 195.763L115.972 74.3345C120.324 66.8735 128.311 62.2856 136.949 62.2856H279.051ZM86.5714 208L147.286 317.286H259.607L195.857 208L259.607 98.7142H147.286L86.5714 208Z"
      />
      <path fillOpacity={0.2} d="M195.857 208H86.5715L147.286 98.7144H259.607L195.857 208Z" />
    </svg>
  )
}
