import { Robot } from '@phosphor-icons/react'

// Shown above the sign-in and sign-up forms when they were opened by an AI agent's
// sign-in (the next step is the consent screen), so the page says why it is here and
// that a new account comes straight back to Allow.
export function isAgentSignIn(next: string): boolean {
  return next.startsWith('/oauth/consent')
}

export function AgentSignInNote({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-sand-200 px-3.5 py-3 dark:border-sand-800">
      <Robot weight="regular" size={18} className="mt-0.5 shrink-0 text-olive-600 dark:text-olive-400" />
      <p className="text-sm text-sand-700 dark:text-sand-300">
        {mode === 'sign-in' ? (
          <>
            <span className="font-semibold text-sand-900 dark:text-sand-50">Your AI agent is waiting.</span> Sign in,
            then click Allow. No account yet? Create a free one below and you come straight back here.
          </>
        ) : (
          <>
            <span className="font-semibold text-sand-900 dark:text-sand-50">Your AI agent is waiting.</span> Create
            your free account and you come straight back to click Allow.
          </>
        )}
        <span className="mt-2 block text-sand-600 dark:text-sand-400">
          A free account installs every free component and design-system component in full, with no daily limit.
        </span>
      </p>
    </div>
  )
}
