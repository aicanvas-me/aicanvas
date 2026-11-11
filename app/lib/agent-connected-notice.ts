import 'server-only'
import { NOREPLY_FROM } from '@/app/lib/config'
import { agentConnectedEmail } from '@/app/lib/email/messages'
import { createAdminClient } from '@/app/lib/supabase/admin'

// Emails the person after a new AI agent connection is made (the token endpoint redeems
// the code). Non-fatal: the connection stands whether or not the email goes out.

export async function sendAgentConnectedNotice(opts: { userId: string; clientName: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  try {
    const { data } = await createAdminClient().auth.admin.getUserById(opts.userId)
    const email = data.user?.email
    if (!email) return
    const mail = agentConnectedEmail({ agentName: opts.clientName })
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(3_000),
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: NOREPLY_FROM, to: [email], subject: mail.subject, html: mail.html }),
    })
  } catch (err) {
    console.error('[hosted mcp] agent-connected email failed:', err)
  }
}
