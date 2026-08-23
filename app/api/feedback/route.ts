import { NextRequest, NextResponse } from 'next/server'
import { CONTACT_INBOX, CONTACT_FROM } from '@/app/lib/config'
import { ipFromHeaders } from '@/app/lib/quota'
import { emailShell, emailText, escapeHtml } from '@/app/lib/email/shell'
import { createClient } from '@/app/lib/supabase/server'

export const runtime = 'nodejs'

// ─── /api/feedback ────────────────────────────────────────────────────────────
// Backend for /feedback. Same delivery path as /api/contact (Resend → the project
// Gmail, aicanvas.me is domain-verified so DKIM/SPF/DMARC authenticate cleanly),
// with three differences that matter:
//
//   1. The subject carries a category prefix — [Bug], [Billing], [Feedback], … —
//      so Gmail filters do the triage. That prefix IS the whole backlog system.
//      There is deliberately no database: add one when the inbox stops being
//      readable, not before.
//   2. Email is required, so reply_to is always set and Gmail's "Reply" always
//      answers the sender. Note this is a reply CHANNEL, not a reply promise:
//      the form deliberately does not tell anyone we will resolve their issue.
//   3. Request context (page, viewport, browser, signed-in user) is attached
//      server-side, so a bug report arrives reproducible instead of arriving as
//      "the button is broken".
//
// Abuse posture is inherited from /api/contact and has the same ceiling: honeypot
// + strict validation + a best-effort per-instance throttle. Serverless instances
// are ephemeral and unshared, so the throttle is a speed bump, not a guarantee.
// This form is linked more widely than /contact, so it will attract more bots.
// Add Cloudflare Turnstile or a shared KV counter if spam actually shows up,
// not before.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Category → email subject prefix. Also the whitelist: anything not a key here
// is rejected, so the prefix can never be attacker-controlled.
const SUBJECT_PREFIX = {
  general: '[Feedback]',
  bug: '[Bug]',
  billing: '[Billing]',
  other: '[Other]',
} as const
type Category = keyof typeof SUBJECT_PREFIX

const CATEGORY_LABEL: Record<Category, string> = {
  general: 'General feedback',
  bug: 'Found a bug',
  billing: 'Payment or subscription',
  other: 'Something else',
}

// Best-effort, per-instance rate limit (mirrors app/api/contact).
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 4
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  // Opportunistic cleanup so the Map doesn't grow without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k)
    }
  }
  return recent.length > MAX_PER_WINDOW
}

/** Trim, coerce to string, and cap length. Guards every free-text field. */
function field(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

/** First line of the message, for a subject that is readable in the inbox list. */
function summarize(message: string): string {
  const line = message.split('\n')[0].trim()
  return line.length > 72 ? `${line.slice(0, 69)}…` : line
}

function emailHtml(f: {
  category: Category
  score: number | null
  message: string
  where: string
  email: string
  context: string[]
}): string {
  const label = 'margin:0 0 4px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;'
  const value = 'margin:0 0 18px 0;font-size:15px;'

  const row = (name: string, html: string) =>
    `<p ${emailText('muted', label)}>${name}</p><p ${emailText('primary', value)}>${html}</p>`

  const parts = [
    row('Category', escapeHtml(CATEGORY_LABEL[f.category])),
    f.score !== null ? row('Rating', `${f.score} / 10`) : '',
    f.where ? row('Where', escapeHtml(f.where)) : '',
    row(
      'Reply to',
      `<a href="mailto:${escapeHtml(f.email)}" style="color:#869631;text-decoration:none;">${escapeHtml(f.email)}</a>`,
    ),
    `<p ${emailText('muted', label)}>Message</p>`,
    `<div ${emailText('primary', 'font-size:15px;line-height:1.6;white-space:pre-wrap;word-break:break-word;margin-bottom:24px;')}>${escapeHtml(f.message)}</div>`,
    `<p ${emailText('muted', label)}>Context</p>`,
    `<p ${emailText('muted', 'margin:0;font-size:12px;line-height:1.7;')}>${f.context.map(escapeHtml).join('<br>')}</p>`,
  ]

  return emailShell({
    title: `${CATEGORY_LABEL[f.category]} via /feedback`,
    heading: CATEGORY_LABEL[f.category],
    bodyHtml: parts.join(''),
    footerNoteHtml: 'Reply straight to this email to answer them.',
  })
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Key not wired yet (paste it into .env.local / Vercel). Fail loud, not silent.
    return NextResponse.json({ error: 'Feedback form is not configured yet.' }, { status: 503 })
  }

  const ip = ipFromHeaders(req.headers) ?? 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many messages from here. Please try again in a few minutes.' },
      { status: 429 },
    )
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
  }

  // Honeypot: humans never see or fill the hidden "website" field; bots fill
  // everything. Return a fake success so the bot can't tell it was filtered.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  // Object.hasOwn, NOT `in`: `in` walks the prototype chain, so 'constructor',
  // 'toString' and friends would pass the whitelist and interpolate a prototype
  // member into the email subject.
  const category = field(body.category, 20) as Category
  if (!Object.hasOwn(SUBJECT_PREFIX, category)) {
    return NextResponse.json({ error: 'Please pick a category.' }, { status: 400 })
  }

  // Optional 0-10 rating. Anything that is not a whole number in range is
  // treated as "not rated" rather than rejected: the slider cannot produce a bad
  // value, so a bad one means a crafted request, and it never reaches output.
  const raw = body.score
  const score =
    typeof raw === 'number' && Number.isInteger(raw) && raw >= 0 && raw <= 10 ? raw : null

  const message = field(body.message, 5000)
  if (message.length < 1) {
    return NextResponse.json({ error: 'Please write your feedback.' }, { status: 400 })
  }

  const where = field(body.where, 200)
  const email = field(body.email, 200)

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  // ── Context, gathered here rather than asked for on the form ────────────────
  const ctx = typeof body.context === 'object' && body.context ? body.context : {}
  const context = [
    `Page: ${field(ctx.referrer, 300) || 'unknown (opened /feedback directly)'}`,
    `Viewport: ${field(ctx.viewport, 30) || 'unknown'}`,
    `Browser: ${req.headers.get('user-agent')?.slice(0, 300) || 'unknown'}`,
  ]

  // Signed-in identity, if any. Best-effort by design: a feedback submission must
  // never fail because the auth lookup hiccuped.
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    context.push(`Account: ${data.user?.email ?? 'not signed in'}`)
  } catch {
    context.push('Account: lookup failed')
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_INBOX],
      reply_to: email,
      subject: `${SUBJECT_PREFIX[category]} ${summarize(message)}`,
      html: emailHtml({ category, score, message, where, email, context }),
      text: [
        CATEGORY_LABEL[category],
        score !== null ? `Rating: ${score} / 10` : '',
        where ? `Where: ${where}` : '',
        `Reply to: ${email}`,
        '',
        message,
        '',
        ...context,
      ]
        .filter(Boolean)
        .join('\n'),
    }),
  }).catch(() => null)

  if (!res?.ok) {
    const detail = res ? await res.text().catch(() => '') : 'no response within 10s'
    console.error('[api/feedback] Resend send failed:', res?.status ?? 0, detail)
    return NextResponse.json(
      { error: 'Could not send your feedback right now. Please try again shortly.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
