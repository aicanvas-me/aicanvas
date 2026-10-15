import { describe, it, expect } from 'vitest'
import { agentFamilyOf, aiSourceOf, isAgentDocRequest } from './ai-traffic'

describe('aiSourceOf', () => {
  it('names the assistant from the referring domain', () => {
    expect(aiSourceOf('chatgpt.com', null)).toBe('chatgpt')
    expect(aiSourceOf('www.perplexity.ai', null)).toBe('perplexity')
    expect(aiSourceOf('claude.ai', null)).toBe('claude')
  })

  it('falls back to utm_source, which ChatGPT adds when it sends no referrer', () => {
    expect(aiSourceOf('$direct', 'chatgpt.com')).toBe('chatgpt')
    expect(aiSourceOf('$direct', ' Perplexity ')).toBe('perplexity')
  })

  it('stores nothing for ordinary or look-alike traffic', () => {
    expect(aiSourceOf('google.com', null)).toBeUndefined()
    expect(aiSourceOf('chatgpt.com.evil.example', null)).toBeUndefined()
    expect(aiSourceOf('$direct', 'newsletter')).toBeUndefined()
  })
})

describe('isAgentDocRequest', () => {
  it('matches llms files, .md twins and markdown content negotiation', () => {
    expect(isAgentDocRequest('/llms.txt', '*/*')).toBe(true)
    expect(isAgentDocRequest('/llms-full.txt', '*/*')).toBe(true)
    expect(isAgentDocRequest('/components/wave-lines.md', '*/*')).toBe(true)
    expect(isAgentDocRequest('/md/components/wave-lines', '*/*')).toBe(true)
    expect(isAgentDocRequest('/components/wave-lines', 'text/markdown, text/html, */*')).toBe(true)
  })

  it('leaves a browser page load alone', () => {
    expect(isAgentDocRequest('/components/wave-lines', 'text/html,application/xhtml+xml,*/*;q=0.8')).toBe(false)
    expect(isAgentDocRequest('/robots.txt', '*/*')).toBe(false)
  })
})

describe('agentFamilyOf', () => {
  it('maps a user agent to a family name only', () => {
    expect(agentFamilyOf('claude-code/2.1.0')).toBe('claude')
    expect(agentFamilyOf('Mozilla/5.0 (compatible; ClaudeBot/1.0)')).toBe('claude')
    expect(agentFamilyOf('Cursor/1.4')).toBe('cursor')
    expect(agentFamilyOf('Mozilla/5.0 (Macintosh) Safari/605')).toBe('browser')
    expect(agentFamilyOf('python-requests/2.31')).toBe('other')
  })
})
