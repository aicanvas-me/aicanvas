import { NextRequest, NextResponse } from 'next/server'
import { CONTACT_INBOX, CONTACT_FROM } from '@/app/lib/config'
import { ipFromHeaders } from '@/app/lib/quota'
import { emailShell, emailText, escapeHtml } from '@/app/lib/email/shell'

export const runtime = 'nodejs'

// ─── /api/contact ─────────────────────────────────────────────────────────────
// The contact form's backend. Takes a {name, email, message} payload, validates
// it, then sends a branded email to CONTACT_INBOX via Resend's REST API. The
// aicanvas.me domain is already verified in Resend (DKIM/SPF/DMARC live), so the
// message authenticates cleanly into the Gmail inbox.
//
// reply_to is set to the visitor, so hitting "Reply" in Gmail answers *them*,
// not yourself. That single header is what makes Gmail behave like a help desk.
//
// Abuse posture: a public endpoint that sends email can burn the Resend daily
// quota (shared with the auth emails) if hammered. Defenses here are a honeypot
// + a best-effort per-instance throttle + strict validation. They stop casual
// abuse but are NOT a hard guarantee on serverless (instances are ephemeral and
// not shared). Add Cloudflare Turnstile or a shared KV store before treating
// this as fully hardened.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Best-effort, per-instance rate limit. Soft speed-bump, not a real guarantee.
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

function emailHtml({ name, email, subject, message }: { name: string; email: string; subject: string; message: string }): string {
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeSubject = escapeHtml(subject)
  const safeMessage = escapeHtml(message)
  const label = 'margin:0 0 4px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;'

  const bodyHtml = `<p ${emailText('muted', label)}>From</p>
              <p ${emailText('primary', 'margin:0 0 18px 0;font-size:15px;')}>${safeName} &lt;<a href="mailto:${safeEmail}" style="color:#869631;text-decoration:none;">${safeEmail}</a>&gt;</p>
              <p ${emailText('muted', label)}>Subject</p>
              <p ${emailText('primary', 'margin:0 0 18px 0;font-size:15px;')}>${safeSubject}</p>
              <p ${emailText('muted', label)}>Message</p>
              <div ${emailText('primary', 'font-size:15px;line-height:1.6;white-space:pre-wrap;word-break:break-word;')}>${safeMessage}</div>`

  return emailShell({
    title: `New message from ${safeName}`,
    heading: `New message from ${safeName}`,
    bodyHtml,
    footerNoteHtml: `Reply straight to this email to answer ${safeName}.`,
  })
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Key not wired yet (paste it into .env.local / Vercel). Fail loud, not silent.
    return NextResponse.json({ error: 'Contact form is not configured yet.' }, { status: 503 })
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

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (name.length < 1 || name.length > 100) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (subject.length < 1 || subject.length > 200) {
    return NextResponse.json({ error: 'Please enter a subject.' }, { status: 400 })
  }
  if (message.length < 1 || message.length > 5000) {
    return NextResponse.json({ error: 'Please enter a message (up to 5000 characters).' }, { status: 400 })
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
      reply_to: `${name} <${email}>`,
      subject: `New contact: ${subject}`,
      html: emailHtml({ name, email, subject, message }),
      text: `New contact message from ${name} <${email}>\nSubject: ${subject}\n\n${message}\n\nReply to this email to answer ${name}.`,
    }),
  }).catch(() => null)

  if (!res?.ok) {
    const detail = res ? await res.text().catch(() => '') : 'no response within 10s'
    console.error('[api/contact] Resend send failed:', res?.status ?? 0, detail)
    return NextResponse.json(
      { error: 'Could not send your message right now. Please try again shortly.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
