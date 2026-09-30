/**
 * bing-api.ts — shared client for the Bing Webmaster API scripts.
 *
 * Every call goes through `bingGet` / `bingPost`, which add the API key,
 * bound each request with the same timeout + retry as the GSC tooling, and
 * back off when Bing answers `ThrottleHost` (it does after roughly ten fast
 * calls in a row). The key rides in the query string, so every error message
 * is scrubbed of it before it can reach a log.
 *
 * Key: BING_WEBMASTER_API_KEY in .env.local (Bing Webmaster > Settings > API access).
 */

import { XMLParser } from 'fast-xml-parser'
import { errMessage, withRetry, withTimeout } from './gsc-net.ts'

try {
  process.loadEnvFile('.env.local')
} catch {}

export const SITE_URL = 'https://aicanvas.me/'
const API_BASE = 'https://ssl.bing.com/webmaster/api.svc/json'
const HARD_TIMEOUT_MS = 45_000
const MAX_ATTEMPTS = 2
// ThrottleHost backoff. Bing gives no Retry-After. Measured 2026-09-23: at one
// call per 7s about 1 in 9 throttles, and the next try a few seconds on passes.
const THROTTLE_WAIT_MS = 15_000
const THROTTLE_ATTEMPTS = 6

function apiKey(): string {
  const key = process.env.BING_WEBMASTER_API_KEY
  if (!key) throw new Error('BING_WEBMASTER_API_KEY is not set. Add it to .env.local.')
  return key
}

/** The message of anything thrown, with the API key removed. */
export function scrubbed(e: unknown): string {
  const msg = errMessage(e)
  const key = process.env.BING_WEBMASTER_API_KEY
  return key ? msg.split(key).join('<key>') : msg
}

type Answer<T> = { throttled: true } | { throttled: false; d: T }

async function call<T>(method: string, init: RequestInit, query: Record<string, string> = {}): Promise<T> {
  const params = new URLSearchParams({ ...query, apikey: apiKey() })
  const url = `${API_BASE}/${method}?${params}`
  // A throttle is an answer, not a failure: returning it keeps withRetry's
  // instant retry for network errors only, and the wait below handles it.
  const once = async (): Promise<Answer<T>> => {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(HARD_TIMEOUT_MS - 5_000) })
    const text = await res.text()
    if (text.includes('ThrottleHost')) return { throttled: true }
    if (!res.ok) throw new Error(`${method}: HTTP ${res.status} ${text.slice(0, 200)}`)
    return { throttled: false, d: (JSON.parse(text) as { d: T }).d }
  }
  for (let attempt = 1; ; attempt++) {
    let answer: Answer<T>
    try {
      answer = await withRetry(() => withTimeout(once(), HARD_TIMEOUT_MS, method), MAX_ATTEMPTS)
    } catch (err) {
      throw new Error(scrubbed(err))
    }
    if (!answer.throttled) return answer.d
    if (attempt >= THROTTLE_ATTEMPTS) throw new Error(`${method}: still throttled after ${attempt} tries`)
    await new Promise((r) => setTimeout(r, THROTTLE_WAIT_MS))
  }
}

export function bingGet<T>(method: string, query: Record<string, string> = {}): Promise<T> {
  return call<T>(method, { method: 'GET' }, { siteUrl: SITE_URL, ...query })
}

export function bingPost<T>(method: string, body: Record<string, unknown>): Promise<T> {
  return call<T>(method, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ siteUrl: SITE_URL, ...body }),
  })
}

/** Bing sends dates as `/Date(1786606898000)/` or `/Date(1786606898000-0700)/`. Null when absent or zero. */
export function bingDate(v: unknown): string | null {
  const m = typeof v === 'string' ? v.match(/\/Date\((-?\d+)/) : null
  if (!m) return null
  const ms = Number(m[1])
  return ms > 0 ? new Date(ms).toISOString() : null
}

export async function fetchSitemapUrls(): Promise<{ sitemapUrl: string; urls: string[] }> {
  const sitemapUrl = `${SITE_URL}sitemap.xml`
  const res = await fetch(sitemapUrl)
  if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status} ${res.statusText} (${sitemapUrl})`)
  const xml = await res.text()
  const entries = new XMLParser({ ignoreAttributes: true }).parse(xml)?.urlset?.url
  if (!entries) throw new Error(`Sitemap missing <urlset><url> entries — got: ${xml.slice(0, 200)}`)
  const list: { loc?: string }[] = Array.isArray(entries) ? entries : [entries]
  return { sitemapUrl, urls: list.map((u) => u.loc).filter((u): u is string => typeof u === 'string') }
}

export interface Quota {
  DailyQuota: number
  MonthlyQuota: number
}

export const getQuota = () => bingGet<Quota>('GetUrlSubmissionQuota')
