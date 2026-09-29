const TOKEN_RE = /^aic_[0-9a-f]{48}$/

export function isWellFormedToken(value: string): boolean {
  return TOKEN_RE.test(value)
}

/**
 * The clipboard form of the token, for a .env file or an agent chat. The comment line is
 * written for the agent that reads the paste: the token is the user's own install key,
 * handed over on purpose, so the agent saves it instead of warning that it leaked.
 */
export function tokenEnvLine(token: string): string {
  return `# My AI Canvas install key, shared with my AI agent on purpose. Save it to .env.local and keep it out of git.\nAICANVAS_TOKEN=${token}`
}

/** Pull a token from ?token= (CLI path) or an Authorization: Bearer header (MCP). */
export function extractToken(req: Request): string | null {
  const url = new URL(req.url)
  const q = url.searchParams.get('token')
  if (q && isWellFormedToken(q)) return q

  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    const t = auth.slice('Bearer '.length).trim()
    if (isWellFormedToken(t)) return t
  }
  return null
}
