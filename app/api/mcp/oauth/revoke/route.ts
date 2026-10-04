import { revoke } from '@/app/lib/mcp-oauth'
import { hostedMcpOAuthEnabled } from '@/lib/flags'
import { json, notFound, preflight } from '../http'

export const runtime = 'nodejs'

// RFC 7009: an access or refresh token ends its connection. Always 200, so the answer
// says nothing about whether the token existed.
export async function POST(req: Request): Promise<Response> {
  if (!hostedMcpOAuthEnabled()) return notFound()
  const token = new URLSearchParams(await req.text()).get('token')
  if (token) {
    try {
      await revoke(token)
    } catch (err) {
      console.error('[hosted mcp] revoke failed:', err)
      return json(503, { error: 'temporarily_unavailable', error_description: 'Please retry shortly.' })
    }
  }
  return json(200, {})
}

export const OPTIONS = preflight
