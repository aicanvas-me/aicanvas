'use client'

import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export type PlanAudience = 'individual' | 'business'

const OPTIONS: { key: PlanAudience; label: string }[] = [
  { key: 'individual', label: 'Individual' },
  { key: 'business', label: 'Business' },
]

export function audiencePanelId(prefix: string, key: PlanAudience) {
  return `${prefix}-${key}-panel`
}

/**
 * The audience switch that sits above the pricing cards. It lives on the page
 * rather than inside PremiumCards, because those cards also render in the home
 * section and in the paywall modal, where there is nothing to switch between.
 *
 * Same sliding-pill mechanic as the billing-cycle toggle inside the Premium
 * card: one olive element travels between the options, so the eye follows the
 * selection instead of watching one box blink off and another blink on.
 */
export function PlanAudienceTabs({
  value,
  onChange,
  idPrefix,
}: {
  value: PlanAudience
  onChange: (next: PlanAudience) => void
  idPrefix: string
}) {
  const reduceMotion = useReducedMotion()
  const pillId = useId()

  return (
    <div className="flex justify-center">
      <div
        role="tablist"
        aria-label="Plans for individuals or for a business"
        className="inline-flex rounded-xl border border-sand-200 bg-sand-100 p-1 dark:border-sand-800 dark:bg-sand-900"
      >
        {OPTIONS.map(({ key, label }) => {
          const selected = value === key
          return (
            <button
              key={key}
              id={`${idPrefix}-${key}-tab`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={audiencePanelId(idPrefix, key)}
              onClick={() => onChange(key)}
              className={`relative rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
                selected
                  ? 'text-sand-950'
                  : 'text-sand-600 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-200'
              }`}
            >
              {selected && (
                <motion.span
                  layoutId={`plan-audience-pill-${pillId}`}
                  className="absolute inset-0 rounded-lg bg-olive-500"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
                  }
                />
              )}
              <span className="relative">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
