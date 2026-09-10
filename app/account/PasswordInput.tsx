'use client'

import { forwardRef, useState } from 'react'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { Button } from '../components/Button'

// ─── PasswordInput ────────────────────────────────────────────────────────────
// Shared password input with a built-in show/hide toggle. Used on sign-in,
// sign-up, and reset-password. The toggle is a button inside the right-padding
// area; the input itself uses pr-10 to leave room for it.

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string
}

export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { id, className = '', ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type={visible ? 'text' : 'password'}
        className={`w-full rounded-lg border border-sand-200 bg-sand-100 px-3 py-2 pr-10 text-base text-sand-900 outline-none transition-colors placeholder:text-sand-600 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 md:text-sm dark:border-sand-800 dark:bg-sand-950 dark:text-sand-50 dark:placeholder:text-sand-500 ${className}`}
        {...rest}
      />
      <Button
        variant="icon"
        size="xs"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        {visible ? <EyeSlash weight="regular" size={16} /> : <Eye weight="regular" size={16} />}
      </Button>
    </div>
  )
})
