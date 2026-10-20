'use client'
// npm install framer-motion @phosphor-icons/react

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  CalendarBlank,
  EnvelopeSimple,
  MagnifyingGlass,
} from '@phosphor-icons/react'

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 30, mass: 0.7 }

const tabs = [
  { label: 'Inbox', icon: EnvelopeSimple },
  { label: 'Calendar', icon: CalendarBlank },
  { label: 'Alerts', icon: Bell },
  { label: 'Search', icon: MagnifyingGlass },
]

export default function ExpandingTabs() {
  const [activeTab, setActiveTab] = useState('Inbox')

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-[#E3E3E8] dark:bg-[#0E0E0F]'>
      <motion.div
        layout
        transition={SPRING}
        role="tablist"
        aria-label="Mail navigation"
        className="flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-black/[0.035] bg-white/35 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98)] dark:border-white/[0.055] dark:bg-white/[0.025] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.label

          return (
            <motion.button
              key={tab.label}
              layout
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => setActiveTab(tab.label)}
              whileHover={isActive ? undefined : { scale: 1.045 }}
              whileTap={{ scale: 0.94 }}
              transition={SPRING}
              className={`relative flex h-10 shrink-0 cursor-pointer items-center justify-start overflow-hidden rounded-full pl-2.5 outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#E3E3E8] dark:focus-visible:ring-white/80 dark:focus-visible:ring-offset-[#0E0E0F] ${
                isActive
                  ? 'gap-2 bg-[#FCFCFD] pr-4 shadow-[0_7px_18px_rgba(32,32,36,0.14),0_1px_2px_rgba(32,32,36,0.08),inset_0_2px_0_rgba(255,255,255,0.98)] dark:bg-[#29292C] dark:shadow-[0_7px_18px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_2px_0_rgba(255,255,255,0.18)]'
                  : 'w-10 bg-[#F8F8FA] shadow-[0_3px_9px_rgba(32,32,36,0.09),0_1px_1px_rgba(32,32,36,0.06),inset_0_2px_0_rgba(255,255,255,0.92)] dark:bg-[#202023] dark:shadow-[0_3px_9px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.035),inset_0_2px_0_rgba(255,255,255,0.15)]'
              }`}
            >
              <motion.span
                animate={{ scale: isActive ? 1.03 : 1, opacity: isActive ? 1 : 0.78 }}
                transition={SPRING}
                className="flex shrink-0 items-center justify-center text-[#161618] dark:text-[#F3F3F4]"
              >
                <Icon size="1.18em" weight="regular" aria-hidden="true" />
              </motion.span>

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    layout
                    initial={{ opacity: 0, x: -7 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -7 }}
                    transition={SPRING}
                    className="whitespace-nowrap text-sm font-semibold tracking-[0.01em] text-[#161618] dark:text-[#F3F3F4]"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
