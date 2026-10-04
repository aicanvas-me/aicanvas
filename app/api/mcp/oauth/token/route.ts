import { after } from 'next/server'
import { sendAgentConnectedNotice } from '@/app/lib/agent-connected-notice'
import { exchange } from '@/app/lib/mcp-oauth'
import { ipFromHeaders } from '@/app/lib/quota'
import { rateLimiter } from '@/app/lib/rate-limit'
import { hostedMcpOAuthEnabled } from '@/lib/flags'
import { country, json, notFound, preflight } from '../http'

export const runtime = 'nodejs'

// Code and refresh-token exchange. Public clients only (PKCE, no secret). A new
// connection emails the person after the response is sent.
const limited = rateLimiter(60)

export async function POST(req: Request): Promise<Response> {
  if (!hostedMcpOAuthEnabled()) return notFound()
  if (limited(ipFromHeaders(req.headers) ?? 'unknown')) return json(429, { error: 'slow_down', error_description: 'Too many requests. Retry later.' })

  let form: URLSearchParams
  try {
    form = new URLSearchParams(await req.text())
  } catch {
    return json(400, { error: 'invalid_request', error_description: 'Expected a form body.' })
  }

  try {
    const result = await exchange(form, new URL(req.url), country(req))
    const connected = result.connected
    if (connected) after(() => sendAgentConnectedNotice(connected))
    return json(result.status, result.body)
  } catch (err) {
    console.error('[hosted mcp] token exchange failed:', err)
    return json(503, { error: 'temporarily_unavailable', error_description: 'Please retry shortly.' })
  }
}

export const OPTIONS = preflight
