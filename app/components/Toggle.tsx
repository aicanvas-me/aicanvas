'use client'

import { forwardRef, useId, useState, type ChangeEvent, type CSSProperties, type InputHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from '@phosphor-icons/react'

// Site-chrome Toggle — visual language adapted from the Mark Toggle standalone
// (components-workspace/mark-toggle/index.tsx): iOS-style pill, sliding thumb,
// X→Check icon morph. Re-skinned to the sand/olive site tokens and reshaped
// into a controlled/uncontrolled switch with forwardRef.
//
// API mirrors the Andromeda Toggle so the mental model is consistent across
// the app: `checked` + `onCheckedChange` for controlled use, `defaultChecked`
// for uncontrolled, optional inline `label`.

const TRACK_W = 48
const TRACK_H = 28
const THUMB = 22
const PAD = 3
const OFF_X = PAD
const ON_X = TRACK_W - THUMB - PAD
const ICON = 12

type ToggleOwnProps = {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (next: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
  style?: CSSProperties
  id?: string
}

type ToggleProps = ToggleOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'checked' | 'defaultChecked' | 'disabled' | 'id' | 'style' | 'className'>

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  {
    className = '',
    checked: controlledChecked,
    defaultChecked = false,
    onCheckedChange,
    label,
    disabled = false,
    id: idProp,
    style,
    ...props
  },
  ref,
) {
  const reactId = useId()
  const id = idProp ?? `toggle-${reactId}`
  const isControlled = controlledChecked !== undefined
  const [internal, setInternal] = useState(defaultChecked)
  const checked = isControlled ? controlledChecked : internal

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked
    if (!isControlled) setInternal(next)
    onCheckedChange?.(next)
  }

  return (
    <div className="inline-flex items-center gap-3" style={style}>
      <span className="relative inline-flex">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <motion.span
          aria-hidden="true"
          whileTap={disabled ? undefined : { scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{
            width: TRACK_W,
            height: TRACK_H,
            display: 'block',
            position: 'relative',
          }}
          className={`shrink-0 rounded-lg border transition-colors duration-200 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-olive-500/40 ${
            checked
              ? 'border-olive-500 bg-olive-500/15'
              : 'border-sand-200 bg-sand-100 dark:border-sand-700 dark:bg-sand-800'
          } ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
        >
          <motion.span
            aria-hidden="true"
            animate={{ x: checked ? ON_X : OFF_X }}
            transition={{ type: 'spring', stiffness: 500, damping: 36 }}
            style={{
              position: 'absolute',
              top: PAD - 1,
              width: THUMB,
              height: THUMB,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
            className={`rounded-md ${
              checked
                ? 'bg-olive-500'
                : 'bg-sand-400 dark:bg-sand-600'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {checked ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0, rotate: -45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Check size={ICON} weight="bold" className="text-sand-950" />
                </motion.span>
              ) : (
                <motion.span
                  key="x-icon"
                  initial={{ scale: 0, rotate: 45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={ICON} weight="bold" className="text-sand-50" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.span>
        </motion.span>
      </span>
      {label ? (
        <label
          htmlFor={id}
          className="cursor-pointer select-none text-sm font-semibold text-sand-700 dark:text-sand-300"
        >
          {label}
        </label>
      ) : null}
    </div>
  )
})
