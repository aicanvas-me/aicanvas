import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NextRequest } from 'next/server'

// Mock ONLY getEntitlement — everything else (classifyContent + loadContentLookup
// reading registry-data/_manifest.json, and readFile reading the real
// registry-data/<slug>.json) runs against the REAL local files. That is the
// point: this test locks in the route's per-TIER behaviour end to end, with the
// only stub being the identity/tier resolution.
vi.mock('@/app/lib/entitlement', () => ({ getEntitlement: vi.fn() }))

import { GET } from './route'
import { getEntitlement } from '@/app/lib/entitlement'

const mockedGetEntitlement = vi.mocked(getEntitlement)

// A REAL free standalone that exists in registry-data/ and is NOT listed in the
// manifest's premiumSlugs / designSystemSlugs / templateSlugs / systemSlugs — so
// classifyContent returns 'standalone'. Its real source contains both 'useState'
// and 'export default', which the gate's placeholder stubs deliberately omit.
const SLUG = 'peel-corner-reveal'
const FILE = `${SLUG}.json`

function call() {
  const req = new NextRequest(`http://localhost/r/${FILE}`)
  return GET(req, { params: Promise.resolve({ file: FILE }) })
}

const REAL_SOURCE_MARKERS = ['useState', 'useEffect', 'export default']

beforeEach(() => {
  mockedGetEntitlement.mockReset()
})

afterEach(() => {
  delete process.env.FREE_ACCOUNT_GATE
})

describe('GET /r/<free-standalone>.json — per-tier install gate', () => {
  it('case 1: gate ON + anonymous → free-account stub (no real source)', async () => {
    process.env.FREE_ACCOUNT_GATE = 'on'
    mockedGetEntitlement.mockResolvedValue({ tier: 'anonymous', userId: null })

    const res = await call()
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('X-AICanvas-Content-Type')).toBe('free-account-required')
    // Steers the user to create a free account, and existing accounts to the
    // tokened install command in settings.
    expect(body).toContain('account/sign-up')
    expect(body).toContain('account/settings')
    // ZERO real source: the stub must not leak the component's actual code.
    expect(body).not.toContain('useState')
    expect(body).not.toContain('useEffect')
  })

  it("case 2: gate ON + signed-in 'free' tier → REAL standalone source (the gap this closes)", async () => {
    process.env.FREE_ACCOUNT_GATE = 'on'
    mockedGetEntitlement.mockResolvedValue({ tier: 'free', userId: 'u1' })

    const res = await call()
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('X-AICanvas-Content-Type')).toBe('standalone')
    // A signed-in free account gets the real, unstubbed source.
    expect(body).toContain('useState')
    expect(body).toContain('export default')
  })

  it('case 3: gate ON + premium tier → REAL standalone source', async () => {
    process.env.FREE_ACCOUNT_GATE = 'on'
    mockedGetEntitlement.mockResolvedValue({ tier: 'premium', userId: 'u1' })

    const res = await call()
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('X-AICanvas-Content-Type')).toBe('standalone')
    expect(body).toContain('useState')
    expect(body).toContain('export default')
  })

  it('case 4: gate ON + getEntitlement throws → REAL source (FAIL OPEN)', async () => {
    process.env.FREE_ACCOUNT_GATE = 'on'
    mockedGetEntitlement.mockRejectedValue(new Error('db blip'))

    const res = await call()
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('X-AICanvas-Content-Type')).toBe('standalone')
    // Free standalone source is public anyway → a transient error fails OPEN.
    expect(body).toContain('useState')
    expect(body).toContain('export default')
  })

  it('case 5: gate UNSET (dormant) + anonymous → REAL source', async () => {
    delete process.env.FREE_ACCOUNT_GATE
    mockedGetEntitlement.mockResolvedValue({ tier: 'anonymous', userId: null })

    const res = await call()
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('X-AICanvas-Content-Type')).toBe('standalone')
    // With the kill-switch off, anonymous installs receive the real source,
    // exactly as before the gate shipped.
    for (const marker of REAL_SOURCE_MARKERS) {
      expect(body).toContain(marker)
    }
  })
})

// The servable brain item only exists on vault-reachable builds (inject-premium
// writes it from the private source). Skip cleanly on free-only builds — the
// gate logic itself is still covered by content-type.test.ts.
const BRAIN_FILE = 'andromeda-brain.json'
const brainAvailable = existsSync(join(process.cwd(), 'registry-data', BRAIN_FILE))

function callBrain() {
  const req = new NextRequest(`http://localhost/r/${BRAIN_FILE}`)
  return GET(req, { params: Promise.resolve({ file: BRAIN_FILE }) })
}

describe.skipIf(!brainAvailable)('GET /r/andromeda-brain.json — mode-independent premium gate', () => {
  it('anonymous → 200 locked placeholder, zero rules content', async () => {
    mockedGetEntitlement.mockResolvedValue({ tier: 'anonymous', userId: null })

    const res = await callBrain()
    const item = await res.json()

    expect(res.status).toBe(200)
    expect(res.headers.get('X-AICanvas-Content-Type')).toBe('brain')
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
    // ONE placeholder .md steering to /pricing — never the real corpus.
    expect(item.files).toHaveLength(1)
    expect(item.files[0].target).toContain('BRAIN-LOCKED.md')
    expect(item.files[0].content).toContain('aicanvas.me/pricing')
    // A subscribed-but-untokened CLI must learn where its command lives.
    expect(item.files[0].content).toContain('account/settings')
  })

  it("signed-in 'free' tier → same locked placeholder", async () => {
    mockedGetEntitlement.mockResolvedValue({ tier: 'free', userId: 'u1' })

    const res = await callBrain()
    const item = await res.json()

    expect(res.status).toBe(200)
    expect(item.files).toHaveLength(1)
    expect(item.files[0].content).toContain('aicanvas.me/pricing')
  })

  it('premium tier → the REAL brain: every file, registry:file with ~/ targets', async () => {
    mockedGetEntitlement.mockResolvedValue({ tier: 'premium', userId: 'u1' })

    const res = await callBrain()
    const item = await res.json()

    expect(res.status).toBe(200)
    expect(item.name).toBe('andromeda-brain')
    expect(item.files.length).toBeGreaterThan(10)
    const index = item.files.find((f: { path: string }) => f.path === 'design-systems/andromeda/rules.md')
    expect(index).toBeDefined()
    expect(index.type).toBe('registry:file')
    expect(index.target).toBe('~/design-systems/andromeda/rules.md')
    expect(index.content.length).toBeGreaterThan(100)
  })

  it('entitlement error → 503, fail CLOSED (never premium bytes)', async () => {
    mockedGetEntitlement.mockRejectedValue(new Error('db blip'))

    const res = await callBrain()

    expect(res.status).toBe(503)
    const body = await res.text()
    expect(body).not.toContain('registry:file')
  })
})

// Premium DESIGN-SYSTEM / TEMPLATE content must gate MODE-INDEPENDENTLY (never
// hung off REGISTRY_ENFORCEMENT): a free/anon user gets the friendly stub, never
// the real template source, regardless of the enforcement flag. mission-control
// is generated from the committed examples/, so it is always present.
const TEMPLATE_FILE = 'andromeda-mission-control.json'
const templateAvailable = existsSync(join(process.cwd(), 'registry-data', TEMPLATE_FILE))

function callTemplate() {
  const req = new NextRequest(`http://localhost/r/${TEMPLATE_FILE}`)
  return GET(req, { params: Promise.resolve({ file: TEMPLATE_FILE }) })
}

// Component files get the JSX stub; every other file (tokens, lib) gets a
// plain notice export so a locked install still type-checks.
function isLockedStub(f: { path: string; content: string }) {
  const expected = /\.[jt]sx$/.test(f.path) ? 'PremiumLocked' : 'export const PREMIUM_NOTICE'
  return f.content.includes(expected) && !f.content.includes('import ')
}

describe.skipIf(!templateAvailable)('GET /r/<premium template>.json — mode-independent gate (no enforce flag needed)', () => {
  afterEach(() => {
    delete process.env.REGISTRY_ENFORCEMENT
  })

  it('anon in PERMISSIVE mode → 200 friendly stub, NOT 402, zero real source', async () => {
    // Permissive is the prod default; the template must STILL gate.
    delete process.env.REGISTRY_ENFORCEMENT
    mockedGetEntitlement.mockResolvedValue({ tier: 'anonymous', userId: null })

    const res = await callTemplate()
    const body = await res.text()

    expect(res.status).toBe(200) // never a cryptic 402
    expect(body).toContain('aicanvas.me/pricing')
    // A subscribed-but-untokened CLI must learn where its command lives.
    expect(body).toContain('account/settings')
    // EVERY file's content is the placeholder — zero real component source
    // (the real file paths remain, but their bodies are all stubbed out).
    const item = JSON.parse(body)
    expect(item.files.length).toBeGreaterThan(0)
    expect(item.files.some((f: { path: string }) => !/\.[jt]sx$/.test(f.path))).toBe(true)
    expect(item.files.every(isLockedStub)).toBe(true)
  })

  it('signed-in free tier → same stub (no real source)', async () => {
    mockedGetEntitlement.mockResolvedValue({ tier: 'free', userId: 'u1' })

    const res = await callTemplate()
    const item = await res.json()

    expect(res.status).toBe(200)
    expect(item.files.every(isLockedStub)).toBe(true)
  })

  it('premium → the REAL template (registry deps to the components it uses)', async () => {
    mockedGetEntitlement.mockResolvedValue({ tier: 'premium', userId: 'u1' })

    const res = await callTemplate()
    const item = await res.json()

    expect(res.status).toBe(200)
    expect(item.name).toBe('andromeda-mission-control')
    expect(Array.isArray(item.registryDependencies)).toBe(true)
    expect(item.registryDependencies.length).toBeGreaterThan(1) // tokens + components it uses
    expect(JSON.stringify(item)).not.toContain('PremiumLocked') // real, not stubbed
  })

  it('entitlement error → 503, fail CLOSED', async () => {
    mockedGetEntitlement.mockRejectedValue(new Error('db blip'))

    const res = await callTemplate()

    expect(res.status).toBe(503)
    const body = await res.text()
    expect(body).not.toContain('TelemetryRow')
  })
})

// A whole-system "Everything" bundle has no files of its own, only
// registryDependencies. Refused, it must still write one visible notice, or the
// CLI reports success with nothing on disk. Both bundles are generated from the
// committed system source, so they are present on every build.
const ALL_FILE = 'andromeda-all.json'
const SYSTEM_FILE = 'andromeda.json'
const allPath = join(process.cwd(), 'registry-data', ALL_FILE)
const systemPath = join(process.cwd(), 'registry-data', SYSTEM_FILE)
const bundlesAvailable = existsSync(allPath) && existsSync(systemPath)
const TOKEN = `aic_${'ab'.repeat(24)}`
const NOTICE_TARGET = '~/aicanvas-premium-locked/andromeda-all.md'

function callBundle(file: string, token?: string) {
  const req = new NextRequest(`http://localhost/r/${file}${token ? `?token=${token}` : ''}`)
  return GET(req, { params: Promise.resolve({ file }) })
}

// Mirrors the route's withToken rule: the token is stamped only onto /r URLs on
// a host we own, and never onto a bare name, a foreign registry or a dep that
// already carries one. Deriving the expectation from each dependency's own host
// keeps this true whatever registry base registry-data was generated against.
function expectedDep(dep: string) {
  let u: URL
  try { u = new URL(dep) } catch { return dep }
  if (u.hostname !== 'aicanvas.me') return dep
  if (!u.pathname.startsWith('/r/')) return dep
  if (u.searchParams.has('token')) return dep
  u.searchParams.set('token', TOKEN)
  return u.toString()
}

type RegistryFile = { path: string; type: string; target?: string }
const placement = (f: RegistryFile) => ({ path: f.path, type: f.type, target: f.target })

describe.skipIf(!bundlesAvailable)('GET /r/andromeda-all.json: refused bundle with no files of its own', () => {
  it('anonymous, no token → exactly one markdown notice, no registryDependencies', async () => {
    mockedGetEntitlement.mockResolvedValue({ tier: 'anonymous', userId: null })

    const res = await callBundle(ALL_FILE)
    const item = await res.json()

    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
    expect(item.registryDependencies).toEqual([])
    expect(item.dependencies).toEqual([])
    expect(item.files).toHaveLength(1)
    const [notice] = item.files
    expect(notice.type).toBe('registry:file')
    expect(notice.target).toBe(NOTICE_TARGET)
    expect(notice.content).toContain('(Premium, locked)')
    // The file says exactly what the terminal prints.
    expect(notice.content).toContain(item.docs)
    expect(notice.content).toContain('aicanvas.me/pricing')
    expect(notice.content).toContain('account/settings')
  })

  it("signed-in 'free' tier with a token → the same single notice, token never stamped", async () => {
    mockedGetEntitlement.mockResolvedValue({ tier: 'free', userId: 'u1' })

    const res = await callBundle(ALL_FILE, TOKEN)
    const body = await res.text()
    const item = JSON.parse(body)

    expect(res.status).toBe(200)
    expect(item.registryDependencies).toEqual([])
    expect(item.files).toHaveLength(1)
    expect(item.files[0].target).toBe(NOTICE_TARGET)
    expect(body).not.toContain(TOKEN)
  })

  it('refused bundle WITH files (andromeda) → every real file stubbed in place, no notice added', async () => {
    mockedGetEntitlement.mockResolvedValue({ tier: 'anonymous', userId: null })
    const real = JSON.parse(readFileSync(systemPath, 'utf8'))

    const res = await callBundle(SYSTEM_FILE)
    const item = await res.json()

    expect(res.status).toBe(200)
    expect(item.registryDependencies).toEqual([])
    expect(item.files.map(placement)).toEqual(real.files.map(placement))
    expect(item.files.every(isLockedStub)).toBe(true)
  })

  it('premium → the real bundle, byte for byte, with the token stamped on its dependencies', async () => {
    mockedGetEntitlement.mockResolvedValue({ tier: 'premium', userId: 'u1' })
    const raw = readFileSync(allPath, 'utf8')

    const res = await callBundle(ALL_FILE)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe(raw)

    const tokened = await (await callBundle(ALL_FILE, TOKEN)).json()
    expect(tokened.files).toEqual([])
    expect(tokened.registryDependencies).toEqual(
      JSON.parse(raw).registryDependencies.map(expectedDep),
    )
  })
})
