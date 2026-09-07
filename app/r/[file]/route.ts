import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { classifyContent } from '@/lib/registry/content-type'
import { loadContentLookup } from '@/lib/registry/lookup'
import { getEntitlement } from '@/app/lib/entitlement'
import { premiumEnabled } from '@/lib/flags'
import { extractToken } from '@/lib/identity/token'

export const runtime = 'nodejs'

const DATA_DIR = join(process.cwd(), 'registry-data')

// 'meta' content (catalog/index files + the free token foundation) is never
// gated or metered — see classifyContent. The gate below skips it via the
// contentType check, so there's no slug list to maintain here.

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params
  // Only allow simple `<slug>.json` names — no path traversal.
  if (!/^[a-z0-9-]+\.json$/.test(file)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  let body: string
  try {
    body = await readFile(join(DATA_DIR, file), 'utf8')
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const lookup = loadContentLookup()
  const contentType = classifyContent(file, lookup)
  const slug = file.replace(/\.json$/, '')
  const mode = effectiveMode()
  // premium-standalone and brain gate exactly like a design system / template:
  // binary, fail-closed, never free-metered, never shared-cached.
  const premiumContent =
    contentType === 'design-system' ||
    contentType === 'template' ||
    contentType === 'premium-standalone' ||
    contentType === 'brain'

  // Cache policy: meta is truly public; premium content is never shared-cached
  // in ANY mode (a permissive-mode CDN entry must not survive an enforce flip);
  // standalones are per-caller once enforcing. 402/503 are always no-store.
  // When the free-account gate is active, standalone / DS-component installs are
  // per-caller (anon → stub, signed-in → source), so they must NEVER be shared-
  // cached: a public CDN entry would let an anon request reuse a signed-in user's
  // real-source response and bypass the gate.
  const cacheControl =
    contentType === 'meta'
      ? 'public, max-age=300'
      : premiumContent
        ? 'private, no-store'
        : mode === 'enforce' || freeAccountGateActive()
          ? 'private, no-store'
          : 'public, max-age=300'

  // ── Mode-INDEPENDENT gating for closed content ────────────────────────────
  // Premium gating must NOT hang off REGISTRY_ENFORCEMENT: closed-source bytes
  // can never be served free just because the flag is permissive (the prod
  // default). Both branches below are inert until a premium slug exists or the
  // manifest goes missing, so current free / DS / template / meta behaviour is
  // byte-for-byte unchanged.
  if (contentType !== 'meta' && lookup.degraded) {
    // Missing _manifest.json → cannot tell a premium standalone from a free one
    // → fail CLOSED for all non-meta, in ANY mode. Loud + temporary, never a leak.
    console.error('[registry gate] degraded lookup (manifest missing) — failing closed on', slug)
    return paymentJson({ error: 'temporarily-unavailable', message: 'Please retry shortly.' }, 503)
  }
  if (premiumContent) {
    // ALL premium content (standalone, brain, whole-system aggregate, template)
    // requires premium entitlement in ANY mode — NEVER hung off
    // REGISTRY_ENFORCEMENT. A permissive flag (or premium-disabled) must not turn
    // closed-source templates/systems into a free download; the enforce flag is a
    // UI/metering switch, not the thing standing between a free user and premium
    // bytes. Fail CLOSED on any entitlement error.
    let tier
    try {
      tier = (await getEntitlement(req)).tier
    } catch (err) {
      console.error('[registry gate] entitlement error on premium content — failing closed:', err)
      return paymentJson({ error: 'temporarily-unavailable', message: 'Please retry shortly.' }, 503)
    }
    if (tier !== 'premium') {
      // Free / anon: don't 402 (shadcn renders that as a cryptic, misleading
      // error). Serve a 200 PLACEHOLDER item — the install succeeds and drops a
      // single clearly-labelled file pointing to /pricing. ZERO real source.
      return contentType === 'brain' ? brainStub(body, slug) : premiumStub(body, slug)
    }
  }

  // ── Mode-INDEPENDENT free-account install gate (behind a kill-switch flag) ──
  // Free standalone / DS-component SOURCE is public to read (Code tab, page); the
  // one-command INSTALL requires a free account. Anonymous → a 200 placeholder
  // steering to sign-up (never a 402). Any signed-in account → real source,
  // unlimited, never counted. FAIL OPEN: an entitlement/infra error serves the
  // real (public) source. Gated behind FREE_ACCOUNT_GATE so it ships dormant and
  // flips on/off via a Vercel env var without a redeploy (one-step kill switch).
  if (
    freeAccountGateActive() &&
    (contentType === 'standalone' || contentType === 'design-system-component')
  ) {
    let tier
    try {
      tier = (await getEntitlement(req)).tier
    } catch (err) {
      console.error('[registry gate] entitlement error on free content — failing open:', err)
      tier = 'free' // fail OPEN — free source is public anyway
    }
    if (tier === 'anonymous') return freeAccountStub(body, slug)
  }

  // Token propagation: the shadcn CLI fetches each registryDependency URL
  // VERBATIM (no auth header, no query token). They ship as bare aicanvas.me /r
  // URLs, so a premium/gated dependency would 402 on that follow-up fetch and
  // abort the whole install. If THIS request carried a token the gate already
  // honored, stamp it onto every aicanvas.me /r dependency so the CLI's next
  // fetch is authorized too. It propagates the whole chain automatically: each
  // rewritten dep URL carries the token, so when the CLI fetches it, this route
  // re-runs and rewrites that file's deps in turn (resource-planning ->
  // andromeda -> andromeda-tokens). Anon requests (no token) are untouched —
  // deps stay bare and 402 correctly.
  const token = extractToken(req)
  let outBody = body
  let outCache = cacheControl
  if (token) {
    try {
      const parsed = JSON.parse(body)
      const deps = parsed?.registryDependencies
      if (Array.isArray(deps)) {
        const stamped = deps.map((d: unknown) => (typeof d === 'string' ? withToken(d, token) : d))
        if (stamped.some((d, i) => d !== deps[i])) {
          parsed.registryDependencies = stamped
          outBody = JSON.stringify(parsed)
          outCache = 'private, no-store' // a token-bearing body must never be shared-cached
        }
      }
    } catch {
      // Non-JSON / malformed body: serve as-is (defensive; registry files are JSON).
    }
  }

  return new NextResponse(outBody, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-AICanvas-Content-Type': contentType,
      'Cache-Control': outCache,
    },
  })
}

/**
 * Free/anon request for a premium standalone → a 200 PLACEHOLDER registry item.
 * The CLI install SUCCEEDS and writes ONE clearly-labelled file pointing to
 * /pricing (far clearer than shadcn's cryptic 402 rendering), and it carries
 * ZERO real source — the placeholder replaces every file's content and drops
 * the npm deps.
 */
function premiumStub(realBody: string, slug: string): NextResponse {
  let title = slug
  let parsed: Record<string, unknown> = {}
  try {
    parsed = JSON.parse(realBody)
    if (typeof parsed.title === 'string') title = parsed.title
  } catch {
    /* defaults below */
  }
  // The message must be RENDERABLE, not a comment — shadcn's add transform
  // strips comments. A string const + JSX text both survive and show the upgrade
  // path when the placeholder is used.
  // No type noun: this path serves premium standalones, blocks and templates
  // alike, and the stub only has the raw registry JSON (no isBlock) in scope.
  const msg =
    `"${title}" is premium AI Canvas content. ` +
    `This is a placeholder. Unlock the real source with an AI Canvas Premium ` +
    `account at https://aicanvas.me/pricing. Already subscribed? Sign in and copy ` +
    `your personal install command from https://aicanvas.me/account/settings`
  const stub =
    `const PREMIUM_NOTICE =\n` +
    `  ${JSON.stringify(msg)}\n\n` +
    `export default function PremiumLocked() {\n` +
    `  return (\n` +
    `    <div style={{ padding: 24, fontFamily: 'ui-monospace, monospace', fontSize: 13, lineHeight: 1.6, color: '#9aa3af' }}>\n` +
    `      {PREMIUM_NOTICE}\n` +
    `    </div>\n` +
    `  )\n` +
    `}\n`
  const files = Array.isArray(parsed.files)
    ? (parsed.files as Array<Record<string, unknown>>).map((f) => ({ ...f, content: stub }))
    : [{ path: `components/aicanvas/${slug}.tsx`, type: 'registry:ui', target: `components/aicanvas/${slug}.tsx`, content: stub }]
  const item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: slug,
    type: 'registry:ui',
    title: `${title} (Premium, locked)`,
    description: 'Premium AI Canvas content. Upgrade to install the real source: https://aicanvas.me/pricing',
    // The shadcn CLI prints `docs` in the terminal after `add` (verified on the
    // free-account stub) — without it this install ends silently on a placeholder.
    docs: msg,
    dependencies: [],
    registryDependencies: [],
    files,
  }
  return NextResponse.json(item, {
    status: 200,
    headers: { 'Cache-Control': 'private, no-store', 'X-AICanvas-Content-Type': 'premium-standalone' },
  })
}

/**
 * Free/anon request for a gated BRAIN item → a 200 PLACEHOLDER with ONE
 * markdown file pointing to /pricing (mirrors premiumStub — shadcn renders
 * non-2xx badly). ZERO real rules content.
 */
function brainStub(realBody: string, slug: string): NextResponse {
  let title = slug
  try {
    const parsed = JSON.parse(realBody)
    if (typeof parsed.title === 'string') title = parsed.title
  } catch {
    /* default above */
  }
  const system = slug.replace(/-brain$/, '')
  const md = [
    `# ${title} (Premium, locked)`,
    '',
    `This is a placeholder. The ${title} is the full set of design rules your AI agent`,
    'reads to build on-brand UI. Unlock it with an AI Canvas Premium account, then',
    're-run the same install command.',
    '',
    '- Upgrade: https://aicanvas.me/pricing',
    `- See what is inside: https://aicanvas.me/design-systems/${system}/brain`,
    '- Already subscribed? Your personal install command: https://aicanvas.me/account/settings',
    '',
  ].join('\n')
  const target = `~/design-systems/${system}/BRAIN-LOCKED.md`
  const item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: slug,
    type: 'registry:item',
    title: `${title} (Premium, locked)`,
    description: 'Premium AI Canvas content. Upgrade to install the real rules: https://aicanvas.me/pricing',
    // Printed by the CLI after `add` — the terminal must say this wrote a
    // placeholder, not the real rules.
    docs:
      `"${title}" is premium AI Canvas content. This install wrote a locked ` +
      `placeholder, not the real rules. Unlock it with Premium at ` +
      `https://aicanvas.me/pricing, then re-run the same command. Already ` +
      `subscribed? Sign in and copy your personal install command from ` +
      `https://aicanvas.me/account/settings`,
    dependencies: [],
    registryDependencies: [],
    files: [{ path: `design-systems/${system}/BRAIN-LOCKED.md`, type: 'registry:file', target, content: md }],
  }
  return NextResponse.json(item, {
    status: 200,
    headers: { 'Cache-Control': 'private, no-store', 'X-AICanvas-Content-Type': 'brain' },
  })
}

/**
 * Anonymous request for a FREE standalone / DS component while the free-account
 * gate is active → a 200 PLACEHOLDER registry item. The CLI install SUCCEEDS and
 * writes ONE clearly-labelled file telling the user to create a free account and
 * re-run (never a 402 — shadcn renders that cryptically). ZERO counting. The
 * source stays public to READ (Code tab / page); only the one-command install is
 * account-gated.
 */
function freeAccountStub(realBody: string, slug: string): NextResponse {
  let title = slug
  let parsed: Record<string, unknown> = {}
  try {
    parsed = JSON.parse(realBody)
    if (typeof parsed.title === 'string') title = parsed.title
  } catch {
    /* defaults below */
  }
  const msg =
    `Almost there! "${title}" is free with an AI Canvas account (free, unlimited installs). ` +
    `Sign up at https://aicanvas.me/account/sign-up, then copy your personal install command ` +
    `from the component page. Already have an account? Sign in and copy it from ` +
    `https://aicanvas.me/account/settings`
  const stub =
    `const ACCOUNT_NOTICE =\n` +
    `  ${JSON.stringify(msg)}\n\n` +
    `export default function AccountRequired() {\n` +
    `  return (\n` +
    `    <div style={{ padding: 24, fontFamily: 'ui-monospace, monospace', fontSize: 13, lineHeight: 1.6, color: '#9aa3af' }}>\n` +
    `      {ACCOUNT_NOTICE}\n` +
    `    </div>\n` +
    `  )\n` +
    `}\n`
  const files = Array.isArray(parsed.files)
    ? (parsed.files as Array<Record<string, unknown>>).map((f) => ({ ...f, content: stub }))
    : [{ path: `components/aicanvas/${slug}.tsx`, type: 'registry:ui', target: `components/aicanvas/${slug}.tsx`, content: stub }]
  const item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: slug,
    type: 'registry:ui',
    title: `${title} (free account required)`,
    description:
      'Create a free AI Canvas account for unlimited one-command installs: https://aicanvas.me/account/sign-up',
    // `docs` is printed by the shadcn CLI in the terminal after `add`, so the
    // warm sign-up CTA is visible even though the install mechanically writes a
    // placeholder file. (Verified: the CLI prints this field.)
    docs: msg,
    dependencies: [],
    registryDependencies: [],
    files,
  }
  return NextResponse.json(item, {
    status: 200,
    headers: { 'Cache-Control': 'private, no-store', 'X-AICanvas-Content-Type': 'free-account-required' },
  })
}

/**
 * The free-account install gate ships behind an env flag so it can be flipped on
 * — and instantly off — via a Vercel env var without a redeploy (one-step kill
 * switch). Default OFF: until FREE_ACCOUNT_GATE=on, anonymous installs receive
 * the real (public) source exactly as before, just no longer counted.
 */
function freeAccountGateActive(): boolean {
  return process.env.FREE_ACCOUNT_GATE === 'on'
}

/** Enforce requires the premium UI flag, else blocked users would have no
 *  upgrade path (no pricing, no paywall CTAs). Refuse to enforce without it. */
function effectiveMode(): string {
  const mode = process.env.REGISTRY_ENFORCEMENT ?? 'permissive'
  if (mode === 'enforce' && !premiumEnabled()) {
    console.error('[registry gate] REGISTRY_ENFORCEMENT=enforce but NEXT_PUBLIC_PREMIUM_ENABLED is off — falling back to permissive')
    return 'permissive'
  }
  return mode
}

function paymentJson(bodyObj: Record<string, unknown>, status: number) {
  return NextResponse.json(bodyObj, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

/**
 * Append a token to our OWN /r registry-dependency URLs so the shadcn CLI's
 * verbatim follow-up fetch of a dependency is authorized. Leaves non-aicanvas
 * URLs, bare component names, and already-tokened URLs untouched. URLSearchParams
 * handles the `?` vs `&` separator automatically.
 */
function withToken(dep: string, token: string): string {
  let u: URL
  try {
    u = new URL(dep)
  } catch {
    return dep // bare component name, not a URL
  }
  if (u.hostname !== 'aicanvas.me') return dep // foreign registry — never stamp our token on it
  if (!u.pathname.startsWith('/r/')) return dep // non-/r aicanvas URL
  if (u.searchParams.has('token')) return dep // already carries a token
  u.searchParams.set('token', token)
  return u.toString()
}
