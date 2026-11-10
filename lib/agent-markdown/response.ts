import { SITE_URL } from '../../app/lib/config'

/**
 * Response for every markdown twin. `Vary: Accept` because the same public
 * URL answers HTML or markdown by the Accept header (the rewrite lives in
 * next.config.ts). `noindex` keeps search engines on the HTML page: the twin
 * is a duplicate written for agents, not a second page to rank.
 */
export function markdownResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
      'X-Robots-Tag': 'noindex',
      Link: `<${SITE_URL}/llms.txt>; rel="llms-txt"`,
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
