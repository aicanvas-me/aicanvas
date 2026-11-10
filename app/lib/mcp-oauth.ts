import 'server-only'
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { createAdminClient } from '@/app/lib/supabase/admin'

// The hosted MCP's own sign-in (OAuth 2.1 authorization server).
//
// THE RULE: an AI agent's sign-in never grants more than the account's aic_ key already
// grants. The agent holds opaque tokens that only the hosted MCP route can resolve, to
// "this account, use its current API key". They are not Supabase tokens: they cannot reach
// Supabase Auth (password, email, MFA) or the data API. That is why this server exists
// instead of Supabase's OAuth server, whose tokens are full sessions (tested 2026-10-04).
//
// Nothing is stored until a person clicks Allow: a registered client is its own signed
// client_id, and a pending request travels as a signed blob to the consent page. Tokens
// are stored as SHA-256 hashes in mcp_grants.
//
// Kill switches: HOSTED_MCP_OAUTH off stops everything at once; deleting mcp_grants rows
// ends those connections. Rotating MCP_OAUTH_SECRET only voids pending consent requests:
// readClient still reads older registrations, and codes and tokens are stored hashes.

export const MCP_HOST = 'mcp.aicanvas.me'

const CODE_TTL_MS = 2 * 60 * 1000
const REQUEST_TTL_MS = 10 * 60 * 1000
const ACCESS_TTL_S = 60 * 60
const REFRESH_GRACE_MS = 30 * 1000
const LAST_USED_EVERY_MS = 5 * 60 * 1000
const MAX_CLIENT_ID = 2048
const MAX_REDIRECT_URIS = 5
const MAX_REDIRECT_URI = 256
const MAX_NAME = 64
const MAX_STATE = 1024

export const TOKEN_PREFIX = { code: 'aicm_ac_', access: 'aicm_at_', refresh: 'aicm_rt_' } as const

// ─── Addresses ────────────────────────────────────────────────────────────────

/** The request's address. In `next dev`, MCP_PUBLIC_ORIGIN puts a tunnel's origin on it. */
export function publicUrl(req: Request): URL {
  const url = new URL(req.url)
  const origin = process.env.NODE_ENV === 'development' ? process.env.MCP_PUBLIC_ORIGIN : undefined
  return origin ? new URL(url.pathname + url.search, origin) : url
}

/** The address the agent connected to; its tokens are bound to it (RFC 8707 `resource`). */
export function resourceFor(url: URL): string {
  return url.host === MCP_HOST ? `https://${MCP_HOST}` : `${url.origin}/api/mcp`
}

/** Where an agent reads how to sign in (RFC 9728), named in every 401. */
export function resourceMetadataUrl(url: URL): string {
  return url.host === MCP_HOST
    ? `https://${MCP_HOST}/.well-known/oauth-protected-resource`
    : `${url.origin}/.well-known/oauth-protected-resource/api/mcp`
}

/** This server's issuer. Pathless, so agents find its metadata at the root form. */
export function issuerFor(url: URL): string {
  return url.host === MCP_HOST ? `https://${MCP_HOST}` : url.origin
}

type Endpoint = 'authorize' | 'token' | 'register' | 'revoke'

export function endpointFor(url: URL, name: Endpoint): string {
  return url.host === MCP_HOST ? `https://${MCP_HOST}/${name}` : `${url.origin}/api/mcp/oauth/${name}`
}

/** The site behind this address: the consent page (where the session cookie is) and /r. */
export function siteOriginFor(url: URL): string {
  return url.host === MCP_HOST ? 'https://aicanvas.me' : url.origin
}

export function authorizationServerMetadata(url: URL) {
  return {
    issuer: issuerFor(url),
    authorization_endpoint: endpointFor(url, 'authorize'),
    token_endpoint: endpointFor(url, 'token'),
    registration_endpoint: endpointFor(url, 'register'),
    revocation_endpoint: endpointFor(url, 'revoke'),
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    revocation_endpoint_auth_methods_supported: ['none'],
  }
}

/** Resources compare as URLs, a trailing slash aside: an agent may send `https://mcp.aicanvas.me/`. */
export function sameResource(a: string, b: string): boolean {
  try {
    const norm = (u: string) => new URL(u).href.replace(/\/$/, '')
    return norm(a) === norm(b)
  } catch {
    return false
  }
}

// ─── Signing and hashing ──────────────────────────────────────────────────────

function secret(): Buffer {
  const value = process.env.MCP_OAUTH_SECRET
  if (!value || value.length < 32) throw new Error('MCP_OAUTH_SECRET missing or shorter than 32 characters')
  return Buffer.from(value, 'utf8')
}

type Purpose = 'client' | 'request'

// The purpose is part of the MAC, so a client_id can never pass as a request and back.
function sign(purpose: Purpose, payload: object): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const mac = createHmac('sha256', secret()).update(`${purpose}.${body}`).digest('base64url')
  return `${body}.${mac}`
}

function verify<T>(purpose: Purpose, signed: string): T | null {
  const parts = signed.split('.')
  if (parts.length !== 2) return null
  const [body, mac] = parts
  const expected = createHmac('sha256', secret()).update(`${purpose}.${body}`).digest()
  const given = Buffer.from(mac, 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T
  } catch {
    return null
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function newToken(kind: keyof typeof TOKEN_PREFIX): string {
  return TOKEN_PREFIX[kind] + randomBytes(32).toString('base64url')
}

export function isAccessToken(bearer: string): boolean {
  return bearer.startsWith(TOKEN_PREFIX.access)
}

// ─── Client registration (RFC 7591), stateless ────────────────────────────────

export interface Client {
  n: string
  r: string[]
  iat: number
}

const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]'])
const BANNED_SCHEMES = new Set([
  'javascript', 'data', 'file', 'blob', 'about', 'vbscript', 'ftp', 'intent', 'http', 'https',
  // Schemes that hand a web address to a browser: a redirect through one is a website in disguise.
  'microsoft-edge', 'microsoft-edge-http', 'microsoft-edge-https', 'x-safari-http', 'x-safari-https',
  'googlechrome', 'googlechromes', 'firefox', 'opera-http', 'opera-https', 'brave', 'x-web-search',
])
// App schemes of AI agents we know, which need no warning on the consent screen. Any other
// app scheme without a dot (RFC 8252 asks for reverse-DNS, com.example.app) is warned about,
// since no ban list can name every browser-launching scheme.
const KNOWN_APP_SCHEMES = new Set(['cursor', 'vscode', 'vscode-insiders', 'windsurf', 'claude', 'zed', 'codex'])

// Control characters, zero-width and bidi overrides: the ways a name can hide or reverse
// text. Built from code points so the source carries no invisible characters.
const span = (from: number, to: number) => `${String.fromCharCode(from)}-${String.fromCharCode(to)}`
const INVISIBLE = new RegExp(
  `[${span(0x00, 0x1f)}${span(0x7f, 0x9f)}${span(0x200b, 0x200f)}${span(0x202a, 0x202e)}${span(0x2066, 0x2069)}${String.fromCharCode(0xfeff)}]`,
  'g',
)

export function cleanName(raw: unknown): string {
  if (typeof raw !== 'string') return 'An app'
  const clean = raw.normalize('NFKC').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME)
  return clean || 'An app'
}

/** https anywhere, http only to this computer, or an app's own scheme (cursor://, vscode://). */
export function isAllowedRedirect(uri: string): boolean {
  if (uri.length > MAX_REDIRECT_URI || uri.includes('#')) return false
  let url: URL
  try {
    url = new URL(uri)
  } catch {
    return false
  }
  if (url.username || url.password) return false
  const scheme = url.protocol.slice(0, -1)
  if (scheme === 'https') return true
  if (scheme === 'http') return LOOPBACK.has(url.hostname)
  return /^[a-z][a-z0-9+.-]{2,}$/.test(scheme) && !BANNED_SCHEMES.has(scheme)
}

/**
 * True when a sign-in goes to a website or an unknown app, false when it goes back to this
 * computer (loopback) or to a known or reverse-DNS app. The consent screen hides the agent's
 * name for an untrusted redirect, since a website could copy any name.
 */
export function isUntrustedRedirect(uri: string): boolean {
  let url: URL
  try {
    url = new URL(uri)
  } catch {
    return true
  }
  if (LOOPBACK.has(url.hostname)) return false
  const scheme = url.protocol.slice(0, -1)
  if (scheme === 'https' || scheme === 'http') return true
  // A known or reverse-DNS app is trusted only when nothing in the address carries a web
  // address onward (vivaldi:https://..., arc://open?url=...).
  const forwards = /https?:|url=|%3a%2f%2f/i.test(uri.slice(scheme.length + 1))
  return !(KNOWN_APP_SCHEMES.has(scheme) || scheme.includes('.')) || forwards
}

/**
 * RFC 8252: an app on this computer listens on whatever port is free, so a loopback
 * redirect matches on any port. Scheme, host, path and query must still match, and
 * localhost never matches 127.0.0.1. (Same rule as the MCP SDK's redirectUriMatches.)
 */
export function redirectMatches(requested: string, registered: string): boolean {
  if (requested === registered) return true
  let req: URL, reg: URL
  try {
    req = new URL(requested)
    reg = new URL(registered)
  } catch {
    return false
  }
  if (!LOOPBACK.has(req.hostname) || !LOOPBACK.has(reg.hostname)) return false
  return req.protocol === reg.protocol && req.hostname === reg.hostname && req.pathname === reg.pathname && req.search === reg.search
}

type Registration =
  | { ok: true; clientId: string; client: Client }
  | { ok: false; error: 'invalid_redirect_uri' | 'invalid_client_metadata'; description: string }

export function registerClient(meta: unknown): Registration {
  if (!meta || typeof meta !== 'object') return { ok: false, error: 'invalid_client_metadata', description: 'Expected a JSON object.' }
  const m = meta as Record<string, unknown>
  const uris = m.redirect_uris
  if (!Array.isArray(uris) || uris.length === 0 || uris.length > MAX_REDIRECT_URIS || !uris.every((u) => typeof u === 'string')) {
    return { ok: false, error: 'invalid_redirect_uri', description: `Send 1 to ${MAX_REDIRECT_URIS} redirect_uris.` }
  }
  const bad = (uris as string[]).find((u) => !isAllowedRedirect(u))
  if (bad !== undefined) {
    return { ok: false, error: 'invalid_redirect_uri', description: 'Redirect URIs must be https, http to this computer, or an app scheme, with no fragment.' }
  }
  const grants = m.grant_types
  if (grants !== undefined && (!Array.isArray(grants) || !grants.every((g) => g === 'authorization_code' || g === 'refresh_token'))) {
    return { ok: false, error: 'invalid_client_metadata', description: 'Only authorization_code and refresh_token are supported.' }
  }
  const responses = m.response_types
  if (responses !== undefined && (!Array.isArray(responses) || !responses.every((r) => r === 'code'))) {
    return { ok: false, error: 'invalid_client_metadata', description: 'Only the code response type is supported.' }
  }
  const client: Client = { n: cleanName(m.client_name), r: uris as string[], iat: Math.floor(Date.now() / 1000) }
  const clientId = sign('client', client)
  if (clientId.length > MAX_CLIENT_ID) {
    return { ok: false, error: 'invalid_client_metadata', description: 'Registration too large.' }
  }
  return { ok: true, clientId, client }
}

export function readClient(clientId: string | null): Client | null {
  if (!clientId || clientId.length > MAX_CLIENT_ID) return null
  // Registration is open and stateless, so the signature only says which secret signed it.
  // A registration signed under an earlier secret (a rotation, a dev restart) is read by the
  // same rules registerClient applies, instead of stranding every agent that saved it: the
  // agent reuses its stored client_id and "sign in again" alone would never recover.
  const client = verify<Client>('client', clientId) ?? unsignedClient(clientId)
  return client && typeof client.n === 'string' && Array.isArray(client.r) && client.r.length > 0 &&
    client.r.length <= MAX_REDIRECT_URIS && client.r.every((u) => typeof u === 'string' && isAllowedRedirect(u))
    ? { ...client, n: cleanName(client.n) }
    : null
}

function unsignedClient(clientId: string): Client | null {
  const parts = clientId.split('.')
  if (parts.length !== 2) return null
  try {
    const c = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as Client
    return c && typeof c === 'object' ? c : null
  } catch {
    return null
  }
}

// ─── Authorization request → consent page ─────────────────────────────────────

/** A pending request, signed into the consent page URL. Short keys keep the URL short. */
export interface PendingRequest {
  cid: string // client_id
  n: string // client name
  ru: string // redirect_uri
  ch: string // PKCE S256 challenge
  st?: string // state, echoed back
  res: string // resource
  co: string | null // the browser's country at /authorize
  exp: number // ms
  nonce: string
}

function withParams(uri: string, params: Record<string, string | undefined>): string {
  const url = new URL(uri)
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, v)
  return url.href
}

/** Why a sign-in stopped before consent; /oauth/stopped explains each one. */
export type StopReason = 'unregistered' | 'redirect' | 'invalid'

export type AuthorizeOutcome =
  | { kind: 'error-page'; reason: StopReason; message: string } // the redirect target is not trusted: never redirect
  | { kind: 'redirect'; location: string } // an error the agent can read, or the consent page

export function authorize(url: URL, country: string | null): AuthorizeOutcome {
  const p = url.searchParams
  const clientId = p.get('client_id')
  const client = readClient(clientId)
  if (!client || !clientId) return { kind: 'error-page', reason: 'unregistered', message: 'This AI agent is not registered. Start the sign-in again from your AI agent.' }

  const requested = p.get('redirect_uri')
  let redirectUri: string
  if (requested) {
    if (!client.r.some((r) => redirectMatches(requested, r))) {
      return { kind: 'error-page', reason: 'redirect', message: 'This sign-in asked to return somewhere the AI agent never registered.' }
    }
    redirectUri = requested
  } else if (client.r.length === 1) {
    redirectUri = client.r[0]
  } else {
    return { kind: 'error-page', reason: 'redirect', message: 'This sign-in did not say where to return.' }
  }

  // Errors go back to the agent, except to a website: anyone can register one, and a
  // redirect from our domain to it on a bad request is an open redirect (RFC 9700 4.11.2).
  const state = p.get('state') ?? undefined
  const toWebsite = /^https?:$/.test(new URL(redirectUri).protocol) && !LOOPBACK.has(new URL(redirectUri).hostname)
  const fail = (error: string, description: string): AuthorizeOutcome =>
    toWebsite
      ? { kind: 'error-page', reason: 'invalid', message: description }
      : {
          kind: 'redirect',
          location: withParams(redirectUri, { error, error_description: description, state, iss: issuerFor(url) }),
        }
  if (state !== undefined && state.length > MAX_STATE) return fail('invalid_request', 'state is too long.')
  if (p.get('response_type') !== 'code') return fail('unsupported_response_type', 'Only response_type=code is supported.')
  const challenge = p.get('code_challenge') ?? ''
  if (p.get('code_challenge_method') !== 'S256' || !/^[A-Za-z0-9_-]{43}$/.test(challenge)) {
    return fail('invalid_request', 'PKCE with code_challenge_method=S256 is required.')
  }
  const expected = resourceFor(url)
  const resource = p.get('resource')
  if (resource && !sameResource(resource, expected)) return fail('invalid_target', 'Unknown resource.')

  const request: PendingRequest = {
    cid: clientId,
    n: client.n,
    ru: redirectUri,
    ch: challenge,
    st: state,
    res: expected,
    co: country,
    exp: Date.now() + REQUEST_TTL_MS,
    nonce: randomBytes(16).toString('base64url'),
  }
  return { kind: 'redirect', location: `${siteOriginFor(url)}/oauth/consent?request=${encodeURIComponent(sign('request', request))}` }
}

/** The pending request behind a consent page, or null when tampered with or expired. */
export function readRequest(signed: string | null): PendingRequest | null {
  if (!signed) return null
  const request = verify<PendingRequest>('request', signed)
  if (!request || typeof request.exp !== 'number' || request.exp < Date.now()) return null
  return request
}

/**
 * Allow: store the grant with a one-time code and send the browser back to the agent.
 * Null when this request was already answered (the nonce is unique), e.g. a second tab.
 */
export async function approve(request: PendingRequest, userId: string): Promise<string | null> {
  const code = newToken('code')
  const { error } = await createAdminClient()
    .from('mcp_grants')
    .insert({
      user_id: userId,
      client_id: request.cid,
      client_name: request.n,
      redirect_uri: request.ru,
      resource: request.res,
      request_nonce: request.nonce,
      code_hash: hashToken(code),
      code_challenge: request.ch,
      code_expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
      browser_country: request.co,
    })
  if (error) {
    if (error.code === '23505') return null
    throw error
  }
  return withParams(request.ru, { code, state: request.st, iss: issuerFromResource(request.res) })
}

export function deny(request: PendingRequest): string {
  return withParams(request.ru, { error: 'access_denied', state: request.st, iss: issuerFromResource(request.res) })
}

function issuerFromResource(resource: string): string {
  const url = new URL(resource)
  return url.host === MCP_HOST ? `https://${MCP_HOST}` : url.origin
}

// ─── Token endpoint ───────────────────────────────────────────────────────────

export interface TokenResponse {
  status: number
  body: Record<string, unknown>
  /** Set when a new connection was just made, so the route can email the person. */
  connected?: { userId: string; clientName: string; redirectUri: string; browserCountry: string | null; agentCountry: string | null }
}

const oauthError = (status: number, error: string, description: string): TokenResponse => ({
  status,
  body: { error, error_description: description },
})

function issueTokens() {
  const access = newToken('access')
  const refresh = newToken('refresh')
  return {
    access,
    refresh,
    columns: {
      access_hash: hashToken(access),
      access_expires_at: new Date(Date.now() + ACCESS_TTL_S * 1000).toISOString(),
      refresh_hash: hashToken(refresh),
      refresh_rotated_at: new Date().toISOString(),
    },
    body: { access_token: access, token_type: 'Bearer', expires_in: ACCESS_TTL_S, refresh_token: refresh },
  }
}

function pkceMatches(verifier: string, challenge: string): boolean {
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return false
  const computed = Buffer.from(createHash('sha256').update(verifier).digest('base64url'))
  const stored = Buffer.from(challenge)
  return computed.length === stored.length && timingSafeEqual(computed, stored)
}

export async function exchange(form: URLSearchParams, url: URL, agentCountry: string | null): Promise<TokenResponse> {
  const clientId = form.get('client_id')
  if (!readClient(clientId) || !clientId) return oauthError(401, 'invalid_client', 'Unknown client. Register again.')
  const grantType = form.get('grant_type')
  if (grantType === 'authorization_code') return redeemCode(form, clientId, url, agentCountry)
  if (grantType === 'refresh_token') return refresh(form, clientId)
  return oauthError(400, 'unsupported_grant_type', 'Use authorization_code or refresh_token.')
}

async function redeemCode(form: URLSearchParams, clientId: string, url: URL, agentCountry: string | null): Promise<TokenResponse> {
  const code = form.get('code') ?? ''
  const admin = createAdminClient()
  const { data: grant, error } = await admin
    .from('mcp_grants')
    .select('id, user_id, client_id, client_name, redirect_uri, resource, code_challenge, code_expires_at, code_used_at, browser_country')
    .eq('code_hash', hashToken(code))
    .maybeSingle()
  if (error) throw error
  if (!grant) return oauthError(400, 'invalid_grant', 'Unknown code.')

  // A code presented twice means someone else may hold it: end the connection it made.
  if (grant.code_used_at) {
    await admin.from('mcp_grants').delete().eq('id', grant.id)
    return oauthError(400, 'invalid_grant', 'This code was already used.')
  }
  if (new Date(grant.code_expires_at).getTime() < Date.now()) return oauthError(400, 'invalid_grant', 'This code expired.')
  if (grant.client_id !== clientId || grant.redirect_uri !== form.get('redirect_uri')) {
    return oauthError(400, 'invalid_grant', 'This code was issued to another client or redirect.')
  }
  const resource = form.get('resource')
  if (resource && !sameResource(resource, grant.resource)) return oauthError(400, 'invalid_target', 'Unknown resource.')
  if (!sameResource(grant.resource, resourceFor(url))) return oauthError(400, 'invalid_target', 'This code is for another server.')
  if (!pkceMatches(form.get('code_verifier') ?? '', grant.code_challenge)) return oauthError(400, 'invalid_grant', 'PKCE check failed.')

  const tokens = issueTokens()
  const { data: claimed, error: claimError } = await admin
    .from('mcp_grants')
    .update({ code_used_at: new Date().toISOString(), agent_country: agentCountry, ...tokens.columns })
    .eq('id', grant.id)
    .is('code_used_at', null)
    .select('id')
  if (claimError) throw claimError
  if (!claimed?.length) return oauthError(400, 'invalid_grant', 'This code was already used.')

  // Requests nobody answered in time leave rows behind; sweep them here, not on every call.
  void admin
    .from('mcp_grants')
    .delete()
    .is('code_used_at', null)
    .lt('code_expires_at', new Date().toISOString())
    .then(() => {})

  return {
    status: 200,
    body: tokens.body,
    connected: {
      userId: grant.user_id,
      clientName: grant.client_name,
      redirectUri: grant.redirect_uri,
      browserCountry: grant.browser_country,
      agentCountry,
    },
  }
}

/**
 * Refresh rotates the token every time. The previous token still works once for 30 s,
 * because two windows of one agent share a credential store and can refresh together:
 * the possibly-unseen current token becomes the previous one, so neither window is
 * locked out. An older token is refused and noted on the connection; the connection
 * stays, since whoever holds that store already holds the account's API key.
 */
async function refresh(form: URLSearchParams, clientId: string): Promise<TokenResponse> {
  const presented = hashToken(form.get('refresh_token') ?? '')
  const admin = createAdminClient()

  const { data: current, error } = await admin
    .from('mcp_grants')
    .select('id, refresh_hash')
    .eq('refresh_hash', presented)
    .eq('client_id', clientId)
    .maybeSingle()
  if (error) throw error
  if (current) {
    const tokens = issueTokens()
    const { data, error: rotateError } = await admin
      .from('mcp_grants')
      .update({ prev_refresh_hash: presented, ...tokens.columns })
      .eq('id', current.id)
      .eq('refresh_hash', presented)
      .select('id')
    if (rotateError) throw rotateError
    if (data?.length) return { status: 200, body: tokens.body }
    // Lost a race with another window: fall through to the grace path.
  }

  const { data: previous, error: prevError } = await admin
    .from('mcp_grants')
    .select('id, refresh_hash, refresh_rotated_at')
    .eq('prev_refresh_hash', presented)
    .eq('client_id', clientId)
    .maybeSingle()
  if (prevError) throw prevError
  if (!previous) return oauthError(400, 'invalid_grant', 'Unknown refresh token. Sign in again.')

  if (Date.now() - new Date(previous.refresh_rotated_at).getTime() <= REFRESH_GRACE_MS) {
    const tokens = issueTokens()
    const { data, error: graceError } = await admin
      .from('mcp_grants')
      .update({ prev_refresh_hash: previous.refresh_hash, ...tokens.columns })
      .eq('id', previous.id)
      .eq('prev_refresh_hash', presented)
      .eq('refresh_hash', previous.refresh_hash)
      .select('id')
    if (graceError) throw graceError
    if (data?.length) return { status: 200, body: tokens.body }
  }

  await admin.from('mcp_grants').update({ stale_refresh_seen_at: new Date().toISOString() }).eq('id', previous.id)
  return oauthError(400, 'invalid_grant', 'This refresh token was already replaced. Sign in again.')
}

/** RFC 7009: ends the connection an access or refresh token belongs to. Always succeeds. */
export async function revoke(token: string): Promise<void> {
  const hash = hashToken(token)
  const admin = createAdminClient()
  await admin.from('mcp_grants').delete().eq('access_hash', hash)
  await admin.from('mcp_grants').delete().eq('refresh_hash', hash)
}

// ─── The MCP route's side ─────────────────────────────────────────────────────

export interface SignedInAgent {
  grantId: string
  userId: string
  /** The account's current API key, or null when it has none (revoked). */
  key: string | null
}

/**
 * The connection behind an access token, or null when the token is unknown, expired, or
 * for another server. Throws when the database cannot answer, which the route turns into
 * a 503 instead of a sign-in prompt.
 */
export async function agentForAccessToken(token: string, url: URL): Promise<SignedInAgent | null> {
  const admin = createAdminClient()
  const { data: grant, error } = await admin
    .from('mcp_grants')
    .select('id, user_id, resource, access_expires_at, last_used_at')
    .eq('access_hash', hashToken(token))
    .maybeSingle()
  if (error) throw error
  if (!grant || new Date(grant.access_expires_at).getTime() < Date.now()) return null
  if (!sameResource(grant.resource, resourceFor(url))) return null

  if (!grant.last_used_at || Date.now() - new Date(grant.last_used_at).getTime() > LAST_USED_EVERY_MS) {
    void admin.from('mcp_grants').update({ last_used_at: new Date().toISOString() }).eq('id', grant.id).then(() => {})
  }

  const { data: key, error: keyError } = await admin
    .from('user_api_keys')
    .select('token')
    .eq('user_id', grant.user_id)
    .eq('revoked', false)
    .maybeSingle()
  if (keyError) throw keyError
  return { grantId: grant.id, userId: grant.user_id, key: key?.token ?? null }
}

/** The disconnect tool: the agent ends its own connection. */
export async function endConnection(grantId: string): Promise<void> {
  const { error } = await createAdminClient().from('mcp_grants').delete().eq('id', grantId)
  if (error) throw error
}
