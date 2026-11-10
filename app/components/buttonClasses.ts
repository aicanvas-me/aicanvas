// Server-safe class-string builder for the site button system.
// Kept separate from Button.tsx (which is 'use client') so Server Components
// can compute classNames for <a>/<Link> elements that look like buttons.

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'icon' | 'link' | 'destructive'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export type ButtonOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  iconOnly?: boolean
  fullWidth?: boolean
  tone?: 'outline' | 'solid'
}

const BASE = 'inline-flex items-center justify-center font-semibold transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40'

const LABEL_SIZES: Record<ButtonSize, string> = {
  xs: 'gap-1.5 rounded-control px-3 py-1.5 text-xs',
  sm: 'gap-1.5 rounded-control px-3.5 py-1.5 text-sm',
  md: 'gap-2 rounded-control px-4 py-2 text-sm',
  lg: 'gap-2 rounded-control px-5 py-2.5 text-sm',
}

const ICON_SIZES: Record<ButtonSize, string> = {
  xs: 'h-7 w-7 rounded-control',
  sm: 'h-8 w-8 rounded-control',
  md: 'h-9 w-9 rounded-control',
  lg: 'h-10 w-10 rounded-control',
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-foreground hover:bg-accent/85',
  // Soft accent: the "active tag" look (accent hairline + faint accent fill +
  // accent text). Emphasized but lighter than solid primary — for a control you
  // want noticed without shouting.
  accent:
    'border border-accent/40 bg-accent/10 text-accent hover:border-accent/60 hover:bg-accent/20 dark:border-accent/25 dark:hover:border-accent/40',
  outline:
    'border border-sand-300 bg-transparent text-sand-700 hover:border-sand-400 hover:text-sand-900 dark:border-sand-700 dark:text-sand-300 dark:hover:border-sand-600 dark:hover:text-sand-100',
  icon:
    'bg-transparent text-sand-600 hover:bg-sand-200 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-100',
  link:
    'bg-transparent text-sand-700 hover:bg-sand-300/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100',
  destructive: '',
}

const DESTRUCTIVE_TONES = {
  outline:
    'border border-red-500/40 bg-transparent text-red-700 hover:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/15',
  solid:
    'bg-red-600 text-white hover:bg-red-500',
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  fullWidth = false,
  tone = 'solid',
}: ButtonOptions = {}): string {
  const square = iconOnly || variant === 'icon'
  const base = square ? ICON_SIZES[size] : LABEL_SIZES[size]

  const skin = variant === 'destructive' ? DESTRUCTIVE_TONES[tone] : VARIANTS[variant]

  return [
    BASE,
    FOCUS,
    base,
    skin,
    fullWidth ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ')
}
