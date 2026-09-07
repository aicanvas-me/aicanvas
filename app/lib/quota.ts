import 'server-only'

/**
 * Read the client IP from request headers, for the stateless throttles in
 * login-hint and cancel-request. Prefer x-real-ip (set by Vercel's proxy, not
 * client-forgeable there) over the x-forwarded-for chain, whose leftmost entry
 * can be attacker-supplied on other hosts.
 */
export function ipFromHeaders(headers: Headers): string | null {
  const real = headers.get('x-real-ip')
  if (real) return real.trim()
  const xff = headers.get('x-forwarded-for')
  return xff ? xff.split(',')[0].trim() : null
}
