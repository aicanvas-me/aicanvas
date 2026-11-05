import { registerClient } from '@/app/lib/mcp-oauth'
import { ipFromHeaders } from '@/app/lib/quota'
import { rateLimiter } from '@/app/lib/rate-limit'
import { hostedMcpOAuthEnabled } from '@/lib/flags'
import { json, notFound, preflight } from '../http'

export const runtime = 'nodejs'

// Dynamic client registration (RFC 7591). Stateless: the client_id IS the signed
// registration, so a flood of registrations stores nothing. The limiter is a speed bump.
const limited = rateLimiter(30)
const MAX_BODY = 8 * 1024

export async function POST(req: Request): Promise<Response> {
  if (!hostedMcpOAuthEnabled()) return notFound()
  if (limited(ipFromHeaders(req.headers) ?? 'unknown')) return json(429, { error: 'slow_down', error_description: 'Too many registrations. Retry later.' })

  const text = await req.text()
  if (text.length > MAX_BODY) return json(400, { error: 'invalid_client_metadata', error_description: 'Registration too large.' })
  let meta: unknown
  try {
    meta = JSON.parse(text)
  } catch {
    return json(400, { error: 'invalid_client_metadata', error_description: 'Expected a JSON body.' })
  }

  const result = registerClient(meta)
  if (!result.ok) return json(400, { error: result.error, error_description: result.description })
  return json(201, {
    client_id: result.clientId,
    client_id_issued_at: result.client.iat,
    client_name: result.client.n,
    redirect_uris: result.client.r,
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  })
}

export const OPTIONS = preflight
