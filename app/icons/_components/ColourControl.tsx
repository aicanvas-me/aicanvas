'use client'

export function ColourControl({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 text-xs font-semibold text-sand-700 focus-within:ring-2 focus-within:ring-olive-500/40 dark:text-sand-300">
      Colour
      <span className="relative h-5 w-5 overflow-hidden rounded-md border border-sand-300 dark:border-sand-700" style={{ backgroundColor: value }}>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Icon colour"
          className="absolute inset-[-8px] h-10 w-10 cursor-pointer opacity-0"
        />
      </span>
    </label>
  )
}

