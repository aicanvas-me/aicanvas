'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode, useRef } from 'react'
import { X } from '@phosphor-icons/react'
import { PremiumCards } from './PremiumCards'
import { PaymentMethods } from './PaymentMethods'
import { track } from '../../lib/analytics'
import { useDialogFocus } from '../useDialogFocus'

// ─── PaywallModalProvider ───────────────────────────────────────────────────
// Global, full-screen upgrade modal — the paywall equivalent of AuthModal.
// Mounted once at the root layout so it overlays the WHOLE viewport (a modal
// rendered inside a component card would be clipped by the card's transforms).
// Any locked surface calls usePaywallModal().open({ reason }); calling it from
// several locked panes at once is harmless — there is only ever one modal.

// Per-install metering is gone, so nothing produces a quota reason any more.
// The only locked state is premium content; 'upgrade' is the same pitch opened
// from a generic upgrade affordance rather than a specific locked component.
export type PaywallReason = 'premium-only' | 'upgrade'

type PaywallState = { reason: PaywallReason; limit?: number; resetAt?: string | null }

type PaywallModalContextValue = {
  open: (state: PaywallState) => void
  close: () => void
}

const PaywallModalContext = createContext<PaywallModalContextValue | null>(null)

export function usePaywallModal(): PaywallModalContextValue {
  const ctx = useContext(PaywallModalContext)
  if (!ctx) throw new Error('usePaywallModal must be used within PaywallModalProvider')
  return ctx
}

export function PaywallModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PaywallState | null>(null)
  const open = useCallback((next: PaywallState) => {
    // Anonymous count; the beacon carries the current path, which names the
    // component whose lock triggered the modal.
    track('Paywall Shown', { reason: next.reason })
    setState(next)
  }, [])
  const close = useCallback(() => setState(null), [])

  return (
    <PaywallModalContext.Provider value={{ open, close }}>
      {children}
      {state && (
        <PaywallModalView
          reason={state.reason}
          onClose={close}
        />
      )}
    </PaywallModalContext.Provider>
  )
}

function PaywallModalView({
  reason,
  onClose,
}: PaywallState & { onClose: () => void }) {
  // Metering is gone, so the modal only ever pitches Premium content now.
  // Both 'premium-only' and 'upgrade' resolve to a single Premium card; the
  // reason just tunes the heading and subtitle.
  const title = reason === 'upgrade' ? 'Upgrade to Premium' : 'Premium content'
  const subtitle =
    reason === 'upgrade'
      ? null
      : 'Unlock this with a Premium subscription.'

  // Keyboard: Tab stays inside the card, focus returns on close, and the card
  // itself takes focus on open so screen readers land in the dialog.
  const panelRef = useRef<HTMLDivElement>(null)
  useDialogFocus(panelRef, true)
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  // Lock body scroll + close on Escape while open. Backdrop clicks also close
  // (this is a soft upgrade pitch, not a flow you must complete).
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to Premium"
      className="dark fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto px-4 py-8 sm:items-center"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-sand-950/85 backdrop-blur-sm"
      />

      {/* Width hugs the content: just the single Premium card + padding. */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 my-auto w-full max-w-lg rounded-2xl bg-sand-950 p-6 shadow-2xl outline-none sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-sand-400 transition-colors hover:bg-sand-800 hover:text-sand-100"
        >
          <X weight="regular" size={18} />
        </button>

        <div className="text-center">
          <h3 className="text-xl font-bold text-sand-50">{title}</h3>
          {subtitle && (
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-sand-400">{subtitle}</p>
          )}
        </div>

        <div className="mt-5">
          <PremiumCards show="premium-only" compact />
        </div>

        {/* Accepted payment methods — a card-width container matching the
            Premium card so it reads as the bottom of the same column. */}
        <div className="mx-auto mt-5 max-w-md rounded-2xl border border-sand-800 bg-sand-900/50 px-4 py-3">
          <PaymentMethods />
        </div>
      </div>
    </div>
  )
}
