'use client'

import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export type PlanAudience = 'individual' | 'business'

const OPTIONS: { key: PlanAudience; label: string; badge?: string }[] = [
  { key: 'individual', label: 'Individual' },
  // The badge rides inside the tab rather than beside the whole control,
  // because only one of the two is unreleased and a marker floating next to
  // the pair would read as if both were.
  { key: 'business', label: 'Business', badge: 'Soon' },
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
        {OPTIONS.map(({ key, label, badge }) => {
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
                  ? 'text-sand-900 dark:text-sand-50'
                  : 'text-sand-600 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-200'
              }`}
            >
              {selected && (
                <motion.span
                  layoutId={`plan-audience-pill-${pillId}`}
                  className="absolute inset-0 rounded-lg bg-sand-50 shadow-sm dark:bg-sand-800"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
                  }
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {label}
                {badge && (
                  <span
                    className="rounded-full bg-sand-200 px-1.5 py-px text-[10px] font-bold uppercase tracking-[0.08em] text-sand-700 dark:bg-sand-950 dark:text-sand-300"
                  >
                    {badge}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
