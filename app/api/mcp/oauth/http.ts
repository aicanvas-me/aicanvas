// Shared answers for the hosted MCP's sign-in endpoints. No cookie is ever read here, so
// any origin may call them (browser-based agents and inspectors need CORS).

export const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, mcp-protocol-version',
}

export const NO_STORE = { 'cache-control': 'no-store', pragma: 'no-cache' }

export function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { ...CORS, ...NO_STORE, ...headers } })
}

export function notFound(): Response {
  return json(404, { error: 'not found' })
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS })
}
