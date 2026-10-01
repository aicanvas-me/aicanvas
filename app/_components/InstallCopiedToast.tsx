'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'

/**
 * The "Install command copied" toast a Copy Command button shows when it lives
 * outside a component page (templates, design-system installs, the AI Brain).
 * Same card as the component page's toast. Portaled to <body>, because these
 * buttons sit inside animated popovers and a transformed parent would trap a
 * fixed-position child.
 */
export function InstallCopiedToast({ show }: { show: boolean }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="install-copied-toast"
          role="status"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-xl border border-sand-200 bg-sand-100 px-4 py-3 shadow-lg dark:border-sand-700 dark:bg-sand-800">
            <Check weight="regular" size={16} className="shrink-0 text-olive-500" />
            <div>
              <p className="text-sm font-semibold text-sand-900 dark:text-sand-50">
                Install command copied
              </p>
              <p className="mt-0.5 text-xs text-sand-600 dark:text-sand-400">
                Paste it into your terminal or give it to your AI agent.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
