import { Bot } from '@/app/_icons/icons/bot'
import { Bolt } from '@/app/_icons/icons/bolt'
import { Download } from '@/app/_icons/icons/download'
import { Plug } from '@/app/_icons/icons/plug'

// The header of the sign-in and sign-up forms when an AI agent's sign-in opened them (the
// next step is the consent screen): it says why the page is here and what signing in gives,
// in place of the mascot.
export function isAgentSignIn(next: string): boolean {
  return next.startsWith('/oauth/consent')
}

export function AgentSignInHeader({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return (
    <div>
      <span className="flex h-11 w-11 items-center justify-center rounded-inset border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
        <Bot size={22} className="text-accent" />
      </span>
      <h1 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-sand-900 dark:text-sand-50">
        Your AI agent is waiting.
      </h1>
      <p className="mt-1.5 text-sm text-sand-600 dark:text-sand-400">
        {mode === 'sign-in' ? 'Sign in, then click Allow.' : 'Create your free account, then click Allow.'}
      </p>
      {/* Why an account: installing needs one, it carries the plan, and it is a one-time step. */}
      <ul className="mt-5 space-y-2.5 border-t border-sand-200 pt-5 text-sm text-sand-700 dark:border-sand-800 dark:text-sand-300">
        {[
          { Icon: Download, line: 'Your agent installs components, design systems and templates, full source, straight into your project.' },
          { Icon: Bolt, line: 'Your plan comes along: everything free, and all of Premium if you have it.' },
          { Icon: Plug, line: 'Sign in once. It stays connected until you disconnect it.' },
        ].map(({ Icon, line }) => (
          <li key={line} className="flex items-start gap-3">
            <Icon size={16} className="mt-0.5 shrink-0 text-accent" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}
