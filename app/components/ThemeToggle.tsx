'use client'

import { Moon } from '@/app/_icons/icons/moon'
import { Sun } from '@/app/_icons/icons/sun'
import { buttonClasses } from './buttonClasses'
import { useTheme } from './ThemeProvider'

/**
 * The site's theme control. Flips `<html>` and the cookie through
 * ThemeProvider, which every preview also reads: a component preview's own
 * light/dark switch calls the same setTheme, so the two stay linked.
 *
 * Both icons stay mounted and cross-fade. Swapping the element instead would
 * drop focus off the button mid-press for anyone driving it from the keyboard.
 */
// A 32px outlined circle by default, the height and border of Search beside it.
// The roomier 36px is for touch rows (the mobile menu), which ask for it.
export function ThemeToggle({
  className = '',
  size = 'sm',
}: {
  className?: string
  size?: 'sm' | 'md'
}) {
  const { theme, setTheme } = useTheme()
  const dark = theme === 'dark'
  const glyph = size === 'md' ? 18 : 16

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      className={`${buttonClasses({ variant: 'outline', size, iconOnly: true })} ${className}`}
    >
      <span className="relative block" style={{ height: glyph, width: glyph }} data-theme-keep-transition>
        <Sun
          size={glyph}
          className={`absolute inset-0 transition-all duration-200 ${
            dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'
          }`}
        />
        <Moon
          size={glyph}
          className={`absolute inset-0 transition-all duration-200 ${
            dark ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </span>
    </button>
  )
}
