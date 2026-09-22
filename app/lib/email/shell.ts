// ─── email/layout ─────────────────────────────────────────────────────────────
// The single shared shell for every HTML email AI Canvas sends from the app
// (cancellation receipt, contact form, …). It is "native" / adaptive: it sets a
// LIGHT palette by default and overrides to DARK via `prefers-color-scheme`, and
// it declares `color-scheme: light dark` so Apple Mail / iOS Mail render the dark
// palette exactly while Gmail applies its own dark treatment. Net effect: the
// recipient sees the email in whatever mode their mail client is set to, instead
// of a forced dark card. The olive accent + wordmark stay constant in both modes.
//
// ⚠️ The Supabase Auth templates (confirm signup / reset password / change email /
// magic link) live in the Supabase dashboard, NOT in this repo, but they share
// this exact design. If you change the shell here, mirror it there (Auth → Email
// Templates) so the two stay in sync.

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Manrope,Roboto,'Helvetica Neue',Arial,sans-serif"

// Brand mark, hosted on ImageKit (email clients strip SVG; PNG is required).
// ONE mark in both themes, matching the site: public/ai-canvas-icon.svg is
// theme-agnostic, an olive gradient ring around two near-black faces. On a dark
// card the faces recede and the ring reads as a hollow hexagon, exactly as in
// the site's dark sidebar. An earlier light-faced variant for dark mode put
// white inside the hexagon, which is not the mark. The "AI CANVAS" wordmark
// sits beside it so branding survives if a client blocks images.
const MARK = 'https://ik.imagekit.io/aitoolkit/email/mark-light.png'

// Light = inline default (also what color-blind clients like Outlook show).
// Dark = applied via the `.ac-*` classes in the <style> media query below.
const LIGHT = {
  primary: 'color:#1A1A19;', // headings, field values
  secondary: 'color:#575759;', // body copy
  muted: 'color:#7B7B7D;', // fine print, labels, footer
}
const CLS = { primary: 'ac-heading', secondary: 'ac-body', muted: 'ac-footer' } as const

/** HTML-escape a dynamic value before it lands inside an email body. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Returns `class="…" style="…"` attributes for an adaptive text element.
 *  Pair the semantic kind with any extra inline style (size, margin, weight). */
export function emailText(kind: keyof typeof LIGHT, extra = ''): string {
  return `class="${CLS[kind]}" style="${LIGHT[kind]}${extra}"`
}

export type EmailButton = { label: string; url: string }

export function emailShell(opts: {
  /** Goes in <title> and the hidden preview line. */
  title: string
  /** The H1 (plain text — pre-escape any dynamic value). */
  heading: string
  /** Main content HTML. Build rows/paragraphs with emailText() so they adapt. */
  bodyHtml: string
  /** Optional olive call-to-action. */
  button?: EmailButton
  /** Optional one-time code, shown in a bordered box instead of a button.
   *  A code is read and retyped, so it gets a container of its own rather
   *  than sitting loose in the body like ordinary text. */
  code?: string
  /** Optional fine-print line shown above the constant "AI Canvas · aicanvas.me". */
  footerNoteHtml?: string
}): string {
  const { title, heading, bodyHtml, button, code, footerNoteHtml } = opts

  // min-width keeps a short label ("Sign in") from shrinking to a stub next to
  // the long ones; Outlook ignores it and falls back to the padding.
  const buttonRow = button
    ? `<tr>
            <td style="padding-bottom:40px;">
              <a href="${button.url}" style="display:inline-block;min-width:150px;text-align:center;background-color:#A8B94D;color:#1A1A19;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">${button.label}</a>
            </td>
          </tr>`
    : ''

  const codeRow = code
    ? `<tr>
            <td style="padding-bottom:40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td class="ac-code" style="background-color:#F4F4F1;border:1px solid #E6E6E1;border-radius:8px;padding:16px 24px;">
                  <span class="ac-heading" style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:30px;font-weight:700;letter-spacing:0.22em;color:#1A1A19;">${code}</span>
                </td>
              </tr></table>
            </td>
          </tr>`
    : ''

  const footerNote = footerNoteHtml
    ? `<p ${emailText('muted', 'margin:0;font-size:12px;line-height:1.6;')}>${footerNoteHtml}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${title}</title>
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body { margin:0; padding:0; }
    @media (prefers-color-scheme: dark) {
      .ac-bg       { background-color:#121211 !important; }
      .ac-card     { background-color:#1A1A19 !important; border-color:#2F2F2D !important; }
      .ac-code     { background-color:#232322 !important; border-color:#383836 !important; }
      .ac-wordmark { color:#FAFAF0 !important; }
      .ac-heading  { color:#FAFAF0 !important; }
      .ac-body     { color:#9E9E98 !important; }
      .ac-divider  { border-color:#383836 !important; }
      .ac-footer, .ac-footer a { color:#7D7D78 !important; }
      .ac-accent { color:#DAE4A0 !important; }
    }
  </style>
</head>
<body class="ac-bg" style="margin:0;padding:0;background-color:#F4F4F1;font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${title}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="ac-bg" style="background-color:#F4F4F1;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="ac-card" style="max-width:544px;background-color:#FFFFFF;border:1px solid #E6E6E1;border-radius:14px;padding:40px 32px;">
          <tr>
            <td style="padding-bottom:28px;">
              <img src="${MARK}" width="33" height="28" alt="AI Canvas" style="vertical-align:middle;border:0;outline:none;display:inline-block;" />
              <span class="ac-wordmark" style="margin:0 0 0 10px;font-size:15px;font-weight:600;letter-spacing:0.08em;color:#1A1A19;text-transform:uppercase;vertical-align:middle;">AI Canvas</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 ${emailText('primary', 'margin:0;font-size:28px;font-weight:700;line-height:1.2;')}>${heading}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;">
              ${bodyHtml}
            </td>
          </tr>
          ${buttonRow}
          ${codeRow}
          <tr>
            <td class="ac-divider" style="border-top:1px solid #E6E6E1;padding-top:24px;">
              ${footerNote}
              <p ${emailText('muted', 'margin:8px 0 0 0;font-size:12px;line-height:1.6;')}>AI Canvas, Inhaber Alexandru Daniel Tatu &middot; c/o flexdienst &ndash; #21685 &middot; Kurt-Schumacher-Stra&szlig;e 74 &middot; 67663 Kaiserslautern &middot; Deutschland &middot; <a href="https://aicanvas.me" ${emailText('muted', 'text-decoration:underline;')}>aicanvas.me</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
