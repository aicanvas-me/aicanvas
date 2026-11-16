// ─── cancellation-email ───────────────────────────────────────────────────────
// Builds the §312k Abs. 3 "Eingangsbestätigung": the durable-medium confirmation
// that a cancellation was received. By statute it must state three things —
// the CONTENT of the cancellation, the DATE/TIME it was received, and the TIME
// the contract will end. This email also carries the ownership-confirm link that
// actually completes the cancellation (clicking proves control of the account
// email). Bilingual: German first (statutory market), English alongside.

import { emailShell, emailText } from '../email/shell'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Stable, locale-independent timestamp (UTC) for the legal record. */
function fmt(d: Date): string {
  return d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
}

export type CancelReceipt = {
  plan: string
  receivedAt: Date
  endsAt: Date | null
  confirmUrl: string
  /** Extraordinary cancellation (for cause): processed asap after we review the reason. */
  extraordinary?: boolean
}

export function cancellationReceiptEmail(r: CancelReceipt): { subject: string; html: string; text: string } {
  const received = fmt(r.receivedAt)
  const periodEndDe = r.endsAt ? fmt(r.endsAt) : 'dem Ende deines aktuellen Abrechnungszeitraums'
  const periodEndEn = r.endsAt ? fmt(r.endsAt) : 'the end of your current billing period'
  const endsDe = r.extraordinary
    ? `so bald wie möglich, nach Prüfung deines Grundes (spätestens ${periodEndDe})`
    : periodEndDe
  const endsEn = r.extraordinary
    ? `as soon as possible after we review your reason (at the latest ${periodEndEn})`
    : periodEndEn
  const endsBoth = endsDe === endsEn ? endsDe : `${endsDe} / ${endsEn}`
  const plan = esc(r.plan)
  const label = 'margin:0 0 4px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;'

  const bodyHtml = `<p ${emailText('secondary', 'margin:0 0 20px 0;font-size:15px;line-height:1.6;')}>Wir haben deine Kündigung für <strong ${emailText('primary')}>${plan}</strong> erhalten. Bestätige unten, um sie abzuschließen.<br/><span ${emailText('muted')}>We received your cancellation for ${plan}. Confirm below to complete it.</span></p>
              <p ${emailText('muted', label)}>Eingang / Received</p>
              <p ${emailText('primary', 'margin:0 0 16px 0;font-size:15px;')}>${received}</p>
              <p ${emailText('muted', label)}>Vertrag endet / Subscription ends</p>
              ${endsDe === endsEn
                ? `<p ${emailText('primary', 'margin:0 0 18px 0;font-size:15px;')}>${esc(endsDe)}</p>`
                : `<p ${emailText('primary', 'margin:0 0 4px 0;font-size:15px;')}>${esc(endsDe)}</p>
              <p ${emailText('muted', 'margin:0 0 18px 0;font-size:13px;line-height:1.5;')}>${esc(endsEn)}</p>`}
              <p ${emailText('secondary', 'margin:0;font-size:14px;line-height:1.6;')}>Du behältst bis dahin vollen Zugang. / You keep full access until then.</p>`

  const html = emailShell({
    title: 'Kündigung erhalten / Cancellation received',
    heading: 'Kündigung erhalten / Cancellation received',
    bodyHtml,
    button: { label: 'Kündigung bestätigen / Confirm', url: r.confirmUrl },
    footerNoteHtml:
      "Wenn du das nicht warst, ignoriere diese E-Mail, es passiert nichts. / If this wasn't you, just ignore this email; nothing happens. Der Link ist 24 Stunden gültig.",
  })

  const text = `Kündigung erhalten / Cancellation received

Wir haben deine Kündigung für ${r.plan} erhalten. / We received your cancellation for ${r.plan}.

Eingang / Received: ${received}
Vertrag endet / Subscription ends: ${endsBoth}

Bestätige deine Kündigung / Confirm your cancellation:
${r.confirmUrl}

Du behältst bis dahin vollen Zugang. / You keep full access until then.
Wenn du das nicht warst, ignoriere diese E-Mail. Der Link ist 24 Stunden gültig.`

  return { subject: 'Bestätige deine Kündigung / Confirm your cancellation', html, text }
}
