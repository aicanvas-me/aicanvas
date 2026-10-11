import { Robot } from '@phosphor-icons/react'

// The header of the sign-in and sign-up forms when an AI agent's sign-in opened them (the
// next step is the consent screen): it says why the page is here, in place of the mascot.
export function isAgentSignIn(next: string): boolean {
  return next.startsWith('/oauth/consent')
}

export function AgentSignInHeader({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return (
    <div>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950">
        <Robot weight="regular" size={22} className="text-olive-600 dark:text-olive-400" />
      </span>
      <h1 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-sand-900 dark:text-sand-50">
        Your AI agent is waiting.
      </h1>
      <p className="mt-1.5 text-sm text-sand-600 dark:text-sand-400">
        {mode === 'sign-in' ? 'Sign in, then click Allow.' : 'Create your free account, then click Allow.'}
      </p>
    </div>
  )
}
