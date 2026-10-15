/**
 * Classifies AI traffic for the server-side analytics in proxy.ts, with the
 * same pure-counting posture: every value stored is a fixed name from the
 * lists below, never a raw query string or header.
 *
 * Two kinds of AI traffic:
 *   - a PERSON arriving from an AI assistant (ChatGPT, Claude, Perplexity...),
 *     read from the referrer, or from `utm_source`, which ChatGPT adds to the
 *     links it shows (it often sends no referrer at all);
 *   - an AGENT reading the machine-readable site (llms.txt, the markdown
 *     twins), which is counted as its own event and never as a page view.
 */

// Hostname → assistant. Exact hostnames only, so a look-alike domain never
// counts. Best effort: assistants change their domains.
const ASSISTANT_HOSTS: Record<string, string> = {
  'chatgpt.com': 'chatgpt',
  'chat.openai.com': 'chatgpt',
  'claude.ai': 'claude',
  'perplexity.ai': 'perplexity',
  'www.perplexity.ai': 'perplexity',
  'gemini.google.com': 'gemini',
  'copilot.microsoft.com': 'copilot',
  'grok.com': 'grok',
  'chat.deepseek.com': 'deepseek',
}

// utm_source values the assistants are known to add → assistant.
const ASSISTANT_UTM: Record<string, string> = {
  'chatgpt.com': 'chatgpt',
  chatgpt: 'chatgpt',
  openai: 'chatgpt',
  'claude.ai': 'claude',
  claude: 'claude',
  'perplexity.ai': 'perplexity',
  perplexity: 'perplexity',
  gemini: 'gemini',
  copilot: 'copilot',
  'copilot.com': 'copilot',
}

/** The assistant that sent this visit, or undefined. */
export function aiSourceOf(referringDomain: string, utmSource: string | null): string | undefined {
  return ASSISTANT_HOSTS[referringDomain.toLowerCase()] ?? (utmSource ? ASSISTANT_UTM[utmSource.trim().toLowerCase()] : undefined)
}

/**
 * A request for the machine-readable site: llms.txt, llms-full.txt or a
 * markdown twin (its public `.md` URL, its internal /md/ route, or a page URL
 * asked for in markdown).
 */
export function isAgentDocRequest(pathname: string, accept: string): boolean {
  return (
    pathname === '/llms.txt' ||
    pathname === '/llms-full.txt' ||
    pathname.endsWith('.md') ||
    pathname.startsWith('/md/') ||
    accept.includes('text/markdown')
  )
}

/** Which kind of tool asked, from its user agent. A family name, never the string. */
export function agentFamilyOf(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('claude')) return 'claude'
  if (ua.includes('cursor')) return 'cursor'
  if (ua.includes('copilot') || ua.includes('github')) return 'copilot'
  if (ua.includes('codex') || ua.includes('openai') || ua.includes('chatgpt') || ua.includes('gptbot')) return 'openai'
  if (ua.includes('perplexity')) return 'perplexity'
  if (ua.includes('gemini') || ua.includes('google')) return 'google'
  if (ua.includes('mozilla')) return 'browser'
  return 'other'
}
