'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { CONTACT_EMAIL } from '../lib/config'
import { SiteFooter } from '../components/SiteFooter'
import { HeaderSocials } from '../components/HeaderSocials'
import { buttonClasses } from '../components/buttonClasses'

// ─── /kuendigen ───────────────────────────────────────────────────────────────
// The §312k Kündigungsschaltfläche confirmation page (Bestätigungsseite). No
// login. The form collects exactly what the statute requires (Art. 312k Abs. 2):
// type of cancellation (+ reason if extraordinary), the consumer's identity,
// the contract, the desired end date, and an email for the confirmation. The
// confirm button is labeled exactly "Jetzt kündigen". On submit the server emails
// the §312k Eingangsbestätigung with an ownership-confirm link that completes it.
// Labels are German (statutory market); helper copy is bilingual.
//
// The post-action state (submitted / confirmed / invalid / error) is driven by
// the `?state` query param, NOT local state — so clicking the footer's
// "Verträge hier kündigen" link (which points at the bare /kuendigen) always
// resets back to a fresh form even when you're already on the page.

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

type Status = 'idle' | 'submitting'

const inputCls =
  'w-full rounded-lg border border-sand-300 bg-sand-50 px-3 py-2 text-sm text-sand-900 placeholder:text-sand-400 focus:border-olive-500 focus:outline-none dark:border-sand-800 dark:bg-sand-900 dark:text-sand-50'
const labelCls = 'block text-sm font-semibold text-sand-900 dark:text-sand-50'
const helpCls = 'mt-1 text-xs text-sand-600 dark:text-sand-500'

function KuendigenForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const state = searchParams.get('state') // 'submitted' | 'confirmed' | 'invalid' | 'error' | null

  const turnstileRef = useRef<HTMLDivElement>(null)

  const [kind, setKind] = useState<'ordentlich' | 'ausserordentlich'>('ordentlich')
  const [reason, setReason] = useState('')
  const [name, setName] = useState('')
  const plan = 'AI Canvas Premium' // the only paid product — named, not chosen
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [token, setToken] = useState<string | null>(null)

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  // Load + render the (invisible) Turnstile widget when a site key is configured.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return
    const SCRIPT_ID = 'cf-turnstile-script'
    function render() {
      const ts = (window as unknown as { turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => void } }).turnstile
      if (ts && turnstileRef.current && !turnstileRef.current.hasChildNodes()) {
        ts.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (t: string) => setToken(t),
          'error-callback': () => setToken(null),
          'expired-callback': () => setToken(null),
        })
      }
    }
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement('script')
      s.id = SCRIPT_ID
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      s.async = true
      s.onload = render
      document.head.appendChild(s)
    } else {
      render()
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus('submitting')
    try {
      const res = await fetch('/api/billing/cancel-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, reason, name, plan, email, website, turnstileToken: token }),
      })
      if (res.ok) {
        setStatus('idle')
        // Drive the success state through the URL so the footer link can reset it.
        router.push('/kuendigen?state=submitted')
      } else {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        setError(j.error ?? 'Etwas ist schiefgelaufen. / Something went wrong. Please try again.')
        setStatus('idle')
      }
    } catch {
      setError('Etwas ist schiefgelaufen. / Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  const needsToken = Boolean(TURNSTILE_SITE_KEY) && !token

  return (
    <div className="min-h-full bg-sand-50 dark:bg-sand-950">
      <header className="sticky top-0 z-50 hidden h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-200 dark:border-sand-800 bg-sand-50 dark:bg-sand-950 px-6 md:grid">
        <div />
        <Link href="/kuendigen" className="text-sm font-semibold text-olive-600 dark:text-olive-500 transition-colors hover:text-olive-800 dark:hover:text-olive-400">
          /Kündigen
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto max-w-2xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        <p className="mb-6 text-sm font-semibold md:hidden">
          <span className="text-olive-600 dark:text-olive-500">/Kündigen</span>
        </p>

        <h1 className="text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">Verträge kündigen</h1>
        <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
          Kündige hier deine AI Canvas Premium-Mitgliedschaft. Kein Login nötig.{' '}
          <span className="text-sand-600 dark:text-sand-500">
            Cancel your AI Canvas Premium subscription here. No login required. You can also{' '}
            <Link href="/account/settings" className="text-olive-600 dark:text-olive-400 hover:underline">
              sign in
            </Link>{' '}
            and cancel from your account.
          </span>
        </p>

        {/* Post-confirm banners (from the email link) */}
        {state === 'confirmed' && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-olive-500/30 bg-olive-500/10 p-4">
            <CheckCircle weight="regular" size={18} className="mt-0.5 shrink-0 text-olive-600 dark:text-olive-400" />
            <p className="text-sm text-sand-700 dark:text-sand-200">
              Deine Kündigung ist bestätigt. Du behältst Premium bis zum Ende deines Abrechnungszeitraums. /
              Your cancellation is confirmed. You keep Premium until the end of your billing period.
            </p>
          </div>
        )}
        {state === 'already' && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-olive-500/30 bg-olive-500/10 p-4">
            <CheckCircle weight="regular" size={18} className="mt-0.5 shrink-0 text-olive-600 dark:text-olive-400" />
            <p className="text-sm text-sand-700 dark:text-sand-200">
              Dein Abo ist bereits zur Kündigung vorgemerkt und endet zum Ende deines Abrechnungszeitraums. Du musst
              nichts weiter tun. / Your subscription is already scheduled to cancel and ends at the end of your
              billing period. Nothing more to do.
            </p>
          </div>
        )}
        {state === 'invalid' && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-sand-300 dark:border-sand-700 bg-sand-100 dark:bg-sand-900 p-4">
            <WarningCircle weight="regular" size={18} className="mt-0.5 shrink-0 text-sand-600 dark:text-sand-400" />
            <p className="text-sm text-sand-700 dark:text-sand-300">
              Dieser Bestätigungslink ist ungültig oder abgelaufen. Bitte sende das Formular erneut. /
              This confirmation link is invalid or expired. Please submit the form again below.
            </p>
          </div>
        )}
        {state === 'error' && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-sand-300 dark:border-sand-700 bg-sand-100 dark:bg-sand-900 p-4">
            <WarningCircle weight="regular" size={18} className="mt-0.5 shrink-0 text-sand-600 dark:text-sand-400" />
            <p className="text-sm text-sand-700 dark:text-sand-300">
              Wir konnten die Kündigung gerade nicht abschließen. Bitte schreib uns an{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-olive-600 dark:text-olive-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
              . / We couldn&apos;t complete the cancellation just now. Please email us.
            </p>
          </div>
        )}

        {state === 'submitted' ? (
          <div className="mt-8 rounded-2xl border border-sand-200 dark:border-sand-800 bg-sand-100 dark:bg-sand-900 p-6">
            <CheckCircle weight="regular" size={24} className="text-olive-600 dark:text-olive-400" />
            <h2 className="mt-3 text-lg font-bold text-sand-900 dark:text-sand-50">Anfrage erhalten / Request received</h2>
            <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
              Falls für diese Adresse ein aktives Premium-Abo besteht, haben wir dir eine E-Mail mit einem
              Bestätigungslink geschickt. Klicke ihn an, um die Kündigung abzuschließen.
            </p>
            <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-500">
              If a matching Premium subscription exists for this address, we&apos;ve emailed you a confirmation
              link. Click it to complete the cancellation.
            </p>
            <Link href="/kuendigen" className={`${buttonClasses({ variant: 'outline', size: 'sm' })} mt-5`}>
              Weitere Kündigung / Cancel another
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-6">
            {/* Art der Kündigung — §312k Abs. 2 Nr. 1 */}
            <div>
              <label className={labelCls}>Art der Kündigung / Type of cancellation</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-sand-200 dark:border-sand-800 bg-sand-100 dark:bg-sand-900 px-3 py-2 text-sm text-sand-700 dark:text-sand-200">
                  <input
                    type="radio"
                    name="kind"
                    checked={kind === 'ordentlich'}
                    onChange={() => setKind('ordentlich')}
                    className="accent-olive-500"
                  />
                  Ordentlich / Ordinary
                </label>
                <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-sand-200 dark:border-sand-800 bg-sand-100 dark:bg-sand-900 px-3 py-2 text-sm text-sand-700 dark:text-sand-200">
                  <input
                    type="radio"
                    name="kind"
                    checked={kind === 'ausserordentlich'}
                    onChange={() => setKind('ausserordentlich')}
                    className="accent-olive-500"
                  />
                  Außerordentlich / Extraordinary
                </label>
              </div>
            </div>

            {/* Reason — only for extraordinary (§312k Abs. 2 Nr. 1) */}
            {kind === 'ausserordentlich' && (
              <div>
                <label htmlFor="reason" className={labelCls}>
                  Kündigungsgrund / Reason
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className={inputCls}
                  placeholder="Grund der außerordentlichen Kündigung"
                />
              </div>
            )}

            {/* Identity — §312k Abs. 2 Nr. 2 */}
            <div>
              <label htmlFor="name" className={labelCls}>
                Name <span className="font-normal text-sand-600 dark:text-sand-500">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className={inputCls}
                placeholder="Dein Name"
              />
            </div>

            {/* Contract — §312k Abs. 2 Nr. 3: Premium is the only paid product,
                so the contract is named, not chosen. The actual plan (monthly/
                yearly) is resolved server-side from Paddle by email. */}
            <div>
              <label className={labelCls}>Vertrag / Subscription</label>
              <p className="mt-1.5 rounded-lg border border-sand-200 dark:border-sand-800 bg-sand-100/60 dark:bg-sand-900/60 px-3 py-2 text-sm text-sand-700 dark:text-sand-300">
                AI Canvas Premium
              </p>
            </div>

            {/* End date — §312k Abs. 2 Nr. 4. Derived from the cancellation type
                above (not a separate choice): an ordinary cancellation ends at
                the end of the paid period; an extraordinary one is processed as
                soon as possible after we review the stated reason. */}
            <div>
              <label className={labelCls}>Beendigungszeitpunkt / When it ends</label>
              <p className="mt-1.5 rounded-lg border border-sand-200 dark:border-sand-800 bg-sand-100/60 dark:bg-sand-900/60 px-3 py-2 text-sm text-sand-700 dark:text-sand-300">
                {kind === 'ordentlich'
                  ? 'Zum Ende des Abrechnungszeitraums / End of billing period'
                  : 'So bald wie möglich, nach Prüfung deines Grundes / As soon as possible, after we review your reason'}
              </p>
              <p className={helpCls}>
                {kind === 'ordentlich'
                  ? 'Du behältst Premium bis zum Ende des bezahlten Zeitraums. / You keep Premium until the end of the period you’ve paid for.'
                  : 'Wir bestätigen den Eingang sofort und prüfen deinen Grund. / We confirm receipt immediately and review your reason.'}
              </p>
            </div>

            {/* Email for the confirmation — §312k Abs. 2 Nr. 5 */}
            <div>
              <label htmlFor="email" className={labelCls}>
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={200}
                className={inputCls}
                placeholder="deine@email.de"
              />
              <p className={helpCls}>
                Die E-Mail-Adresse deines Kontos. Wir senden die Bestätigung dorthin. / Your account email; we send
                the confirmation there.
              </p>
            </div>

            {/* Honeypot — visually hidden, bots fill it */}
            <div aria-hidden className="absolute left-[-9999px] top-[-9999px]">
              <label>
                Website
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </label>
            </div>

            {TURNSTILE_SITE_KEY && <div ref={turnstileRef} className="min-h-[65px]" />}

            {error && (
              <p className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
                <WarningCircle weight="regular" size={16} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting' || needsToken || email.trim().length === 0}
              className={buttonClasses({ variant: 'primary', size: 'lg' })}
            >
              {status === 'submitting' ? 'Wird gesendet…' : 'Jetzt kündigen'}
            </button>
            <p className={helpCls}>
              Mit dem Klick erhältst du eine Eingangsbestätigung per E-Mail. Die Kündigung wird mit dem Link darin
              abgeschlossen. / You&apos;ll get a confirmation email; the link in it completes the cancellation.
            </p>
          </form>
        )}

        <SiteFooter />
      </main>
    </div>
  )
}

export default function KuendigenPage() {
  return (
    <Suspense fallback={null}>
      <KuendigenForm />
    </Suspense>
  )
}
