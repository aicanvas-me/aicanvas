'use client'

import { Moon, Sun } from '@phosphor-icons/react'
import { buttonClasses } from './buttonClasses'
import { useTheme } from './ThemeProvider'

/**
 * The site's only theme control. Flips `<html>` and the cookie through
 * ThemeProvider and stops there: a component preview's own light/dark switch is
 * a separate, local thing and this must never touch it.
 *
 * Both icons stay mounted and cross-fade. Swapping the element instead would
 * drop focus off the button mid-press for anyone driving it from the keyboard.
 */
// 28px square by default, the height every other control in a top bar has.
// The roomier 36px is for touch rows (the mobile menu), which ask for it.
export function ThemeToggle({
  className = '',
  size = 'xs',
}: {
  className?: string
  size?: 'xs' | 'md'
}) {
  const { theme, setTheme } = useTheme()
  const dark = theme === 'dark'
  const glyph = size === 'xs' ? 16 : 18

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      className={`${buttonClasses({ variant: 'icon', size })} ${className}`}
    >
      <span className="relative block" style={{ height: glyph, width: glyph }} data-theme-keep-transition>
        <Sun
          weight="regular"
          size={glyph}
          className={`absolute inset-0 transition-all duration-200 ${
            dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'
          }`}
        />
        <Moon
          weight="regular"
          size={glyph}
          className={`absolute inset-0 transition-all duration-200 ${
            dark ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </span>
    </button>
  )
}
