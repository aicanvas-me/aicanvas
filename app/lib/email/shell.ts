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

// Brand mark, hosted on ImageKit (email clients strip SVG; PNG is required). Two
// variants swap by `prefers-color-scheme`: the light-bg version has dark facets,
// the dark-bg version has light facets. The olive "AI Canvas" wordmark sits beside
// them so branding survives if a client blocks images.
const MARK_LIGHT = 'https://ik.imagekit.io/aitoolkit/email/mark-light.png'
const MARK_DARK = 'https://ik.imagekit.io/aitoolkit/email/mark-dark.png'

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
  /** Optional fine-print line shown above the constant "AI Canvas · aicanvas.me". */
  footerNoteHtml?: string
}): string {
  const { title, heading, bodyHtml, button, footerNoteHtml } = opts

  const buttonRow = button
    ? `<tr>
            <td style="padding-bottom:48px;">
              <a href="${button.url}" style="display:inline-block;background-color:#A8B94D;color:#1A1A19;font-size:14px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:8px;">${button.label}</a>
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
      .ac-bg       { background-color:#1A1A19 !important; }
      .ac-wordmark { color:#FAFAF0 !important; }
      .ac-heading  { color:#FAFAF0 !important; }
      .ac-body     { color:#9E9E98 !important; }
      .ac-divider  { border-color:#383836 !important; }
      .ac-footer, .ac-footer a { color:#7D7D78 !important; }
      .ac-mark-light { display:none !important; }
      .ac-mark-dark  { display:inline-block !important; }
      .ac-accent { color:#DAE4A0 !important; }
    }
  </style>
</head>
<body class="ac-bg" style="margin:0;padding:0;background-color:#FFFFFF;font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${title}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="ac-bg" style="background-color:#FFFFFF;">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:480px;">
          <tr>
            <td style="padding-bottom:28px;">
              <img class="ac-mark-light" src="${MARK_LIGHT}" width="33" height="28" alt="AI Canvas" style="vertical-align:middle;border:0;outline:none;display:inline-block;" />
              <img class="ac-mark-dark" src="${MARK_DARK}" width="33" height="28" alt="" style="vertical-align:middle;border:0;outline:none;display:none;" />
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
          <tr>
            <td class="ac-divider" style="border-top:1px solid #E6E6E1;padding-top:24px;">
              ${footerNote}
              <p ${emailText('muted', 'margin:8px 0 0 0;font-size:12px;line-height:1.6;')}>AI Canvas &middot; <a href="https://aicanvas.me" ${emailText('muted', 'text-decoration:underline;')}>aicanvas.me</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
