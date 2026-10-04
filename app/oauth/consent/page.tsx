import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { buttonClasses } from '../../components/buttonClasses'
import { hostedMcpOAuthEnabled } from '../../../lib/flags'

// ─── /oauth/consent ──────────────────────────────────────────────────────────
// Supabase's OAuth server sends the browser here when an agent asks to sign in to the
// hosted MCP (?authorization_id=…). Signed out: sign in first and come back. An agent the
// person already allowed goes straight back without asking again. The choice is a plain
// form POST to ./decision, so it works before any JavaScript loads.

export const metadata: Metadata = {
  title: 'Connect your agent',
  robots: { index: false, follow: false },
}

// Where the browser goes after the choice, said plainly: a look-alike app name is the one
// trick this screen invites, and the destination is the part it cannot fake.
function destination(redirectUri: string): string {
  try {
    const url = new URL(redirectUri)
    if (['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) return 'an app on this computer'
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.host
    return `the ${url.protocol.slice(0, -1)} app`
  } catch {
    return redirectUri
  }
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-xl border border-sand-200 bg-sand-100 p-8 dark:border-sand-800 dark:bg-sand-900">
        {children}
      </div>
    </div>
  )
}

function Ended() {
  return (
    <Card>
      <h1 className="text-xl font-bold leading-tight tracking-tight text-sand-900 dark:text-sand-50">
        This sign-in request has ended
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-sand-700 dark:text-sand-300">
        It expired or was already answered. Start the sign-in again from your agent.
      </p>
    </Card>
  )
}

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ authorization_id?: string }>
}) {
  if (!hostedMcpOAuthEnabled()) notFound()

  const { authorization_id: id } = await searchParams
  if (!id) return <Ended />

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/account/sign-in?next=${encodeURIComponent(`/oauth/consent?authorization_id=${encodeURIComponent(id)}`)}`)
  }

  const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id)
  if (error || !data) return <Ended />
  if ('redirect_url' in data) redirect(data.redirect_url)

  const name = data.client.name?.trim() || 'This app'

  return (
    <Card>
      <h1 className="text-xl font-bold leading-tight tracking-tight text-sand-900 dark:text-sand-50">
        Allow {name} to use your AI Canvas account?
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-sand-700 dark:text-sand-300">
        It can search AI Canvas and install the components your plan includes, signed in as{' '}
        <span className="font-semibold text-sand-900 dark:text-sand-50">{data.user.email}</span>.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
        Only allow it if you just connected it yourself. After you choose, you go back to{' '}
        {destination(data.redirect_uri)}.
      </p>
      <form action="/oauth/consent/decision" method="post" className="mt-6 flex gap-3">
        <input type="hidden" name="authorization_id" value={data.authorization_id} />
        <button type="submit" name="decision" value="deny" className={buttonClasses({ variant: 'outline', size: 'md', fullWidth: true })}>
          Cancel
        </button>
        <button type="submit" name="decision" value="allow" className={buttonClasses({ variant: 'primary', size: 'md', fullWidth: true })}>
          Allow
        </button>
      </form>
    </Card>
  )
}
