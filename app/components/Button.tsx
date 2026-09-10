'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { buttonClasses } from './buttonClasses'
import type { ButtonOptions } from './buttonClasses'

// ─── Button ───────────────────────────────────────────────────────────────────
// The one button. Five variants × four sizes. If a new use site doesn't fit
// these, push back before adding a variant — most "new" buttons are an existing
// variant in disguise.
//
// Use the <Button> component for <button> elements. For <a> / next/link / etc.
// that should *look* like a button, use buttonClasses() to grab the same class
// string and apply it to the element directly. buttonClasses lives in
// ./buttonClasses (no 'use client') so Server Components can use it too.
//
//   <Button variant="primary" size="md" onClick={...}>Save</Button>
//   <Link href="/x" className={buttonClasses({ variant: 'primary', size: 'lg' })}>Browse</Link>

type ButtonProps = ButtonOptions & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, iconOnly, fullWidth, tone, className = '', type = 'button', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${buttonClasses({ variant, size, iconOnly, fullWidth, tone })} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  )
})
