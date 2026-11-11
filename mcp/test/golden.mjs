/**
 * Golden transcript: the published package against the candidate build.
 *
 * Both servers run the same script of tool calls against the same local mock
 * registry, once per token state (none, free, premium, a token that matches no
 * account). Every response and every registry request they make must be
 * byte-identical, except the version string. This is what proves a refactor or
 * a hosted-only addition changed nothing for people running the npm package.
 *
 *   node test/golden.mjs                         # baseline: @aicanvas/mcp@latest from npm
 *   node test/golden.mjs --baseline <file.tgz>   # baseline: a packed tarball
 *   node test/golden.mjs --baseline @aicanvas/mcp@0.3.1
 *
 * Needs a built candidate (npx tsc) and registry-data/ from
 * `node scripts/generate-registry.mjs` at the repo root.
 */

import { createServer } from 'node:http'
import { readFile, rm, mkdir } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { McpClient } from './client.mjs'

const REGISTRY_DATA_DIR = new URL('../../registry-data/', import.meta.url).pathname
const CANDIDATE = new URL('../dist/index.js', import.meta.url).pathname
// Unpacked under mcp/node_modules so the baseline resolves the same installed
// SDK and zod as the candidate: the comparison is of our code, not of theirs.
const BASELINE_DIR = new URL('../node_modules/.golden-baseline/', import.meta.url).pathname

const argIdx = process.argv.indexOf('--baseline')
const baselineSpec = argIdx > -1 ? process.argv[argIdx + 1] : '@aicanvas/mcp@latest'

if (!existsSync(CANDIDATE)) {
  console.error('✗ no candidate build at dist/index.js: run `npx tsc` in mcp/ first.')
  process.exit(1)
}
if (!existsSync(join(REGISTRY_DATA_DIR, 'aicanvas-mcp.json'))) {
  console.error('✗ registry-data/ is empty: run `node scripts/generate-registry.mjs` at the repo root.')
  process.exit(1)
}

// ── Baseline package ─────────────────────────────────────────────────────────

async function unpackBaseline(spec) {
  await rm(BASELINE_DIR, { recursive: true, force: true })
  await mkdir(BASELINE_DIR, { recursive: true })
  const tgz = spec.endsWith('.tgz')
    ? resolve(spec)
    : join(
        BASELINE_DIR,
        execFileSync('npm', ['pack', spec, '--pack-destination', BASELINE_DIR, '--silent'], { encoding: 'utf-8' })
          .trim()
          .split('\n')
          .pop(),
      )
  execFileSync('tar', ['-xzf', tgz, '-C', BASELINE_DIR])
  const version = JSON.parse(readFileSync(join(BASELINE_DIR, 'package', 'package.json'), 'utf-8')).version
  return { server: join(BASELINE_DIR, 'package', 'dist', 'index.js'), version }
}

// ── Mock registry ────────────────────────────────────────────────────────────
// Answers the way /r does for each caller, from the real generated files, and
// logs every request the server makes (path, token, probe mark, headers).

const TOKENS = {
  none: '',
  free: 'aic_' + 'a'.repeat(48),
  premium: 'aic_' + 'b'.repeat(48),
  unknown: 'aic_' + '0'.repeat(48),
}
const manifest = JSON.parse(readFileSync(join(REGISTRY_DATA_DIR, '_manifest.json'), 'utf-8'))
const PREMIUM = new Set([
  ...manifest.premiumSlugs,
  ...manifest.templateSlugs,
  ...manifest.paidSystemSlugs,
  ...manifest.brainSlugs,
])
const isPremium = (slug) => PREMIUM.has(slug) || slug.startsWith('andromeda-pro-')
const META = new Set(['aicanvas-mcp', 'aicanvas-props', 'registry'])
// One slug answers 402, so the legacy upgrade branch is compared too.
const PAYMENT_REQUIRED = 'danger-stripes'

function placeholder(slug, contentType, extra = {}) {
  return {
    status: 200,
    headers: { 'X-AICanvas-Content-Type': contentType, ...extra },
    body: JSON.stringify({
      name: slug,
      type: 'registry:ui',
      title: contentType === 'free-account-required' ? `${slug} (free account required)` : `${slug} (Premium, locked)`,
      description: 'placeholder',
      dependencies: [],
      files: [{ path: `components/aicanvas/${slug}.tsx`, type: 'registry:ui', content: `// placeholder for ${slug}\n` }],
    }),
  }
}

function answer(slug, body, auth) {
  if (META.has(slug)) return { status: 200, headers: { 'X-AICanvas-Content-Type': 'meta' }, body }
  if (slug === PAYMENT_REQUIRED) return { status: 402, headers: {}, body: JSON.stringify({ message: 'Pay up (mock).' }) }
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : ''
  const tier =
    token === TOKENS.premium ? 'premium' : token === TOKENS.free ? 'free' : 'anonymous'
  const unknown = token === TOKENS.unknown ? { 'X-AICanvas-Token': 'unknown' } : {}
  if (isPremium(slug)) {
    if (tier !== 'premium') return placeholder(slug, 'premium-standalone', unknown)
    return { status: 200, headers: { 'X-AICanvas-Content-Type': 'premium-standalone' }, body }
  }
  if (tier === 'anonymous') return placeholder(slug, 'free-account-required', unknown)
  return { status: 200, headers: { 'X-AICanvas-Content-Type': 'standalone' }, body }
}

function startMock(log) {
  return new Promise((done) => {
    const srv = createServer(async (req, res) => {
      const name = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '')
      log.push(
        [
          req.method,
          req.url,
          `auth=${req.headers.authorization ?? '-'}`,
          `probe=${req.headers['x-aicanvas-probe'] ?? '-'}`,
          `accept=${req.headers.accept ?? '-'}`,
          `ua=${req.headers['user-agent'] ?? '-'}`,
        ].join(' '),
      )
      if (!/^[a-z0-9-]+\.json$/.test(name)) {
        res.writeHead(404, { 'Content-Type': 'application/json' }).end('{"error":"not found"}')
        return
      }
      let body
      try {
        body = await readFile(join(REGISTRY_DATA_DIR, name), 'utf-8')
      } catch {
        res.writeHead(404, { 'Content-Type': 'application/json' }).end('{"error":"not found"}')
        return
      }
      const a = answer(name.replace(/\.json$/, ''), body, req.headers.authorization)
      res.writeHead(a.status, { 'Content-Type': 'application/json', ...a.headers }).end(a.body)
    })
    srv.listen(0, '127.0.0.1', () => done({ srv, base: `http://127.0.0.1:${srv.address().port}` }))
  })
}

// ── The script ───────────────────────────────────────────────────────────────

const meta = JSON.parse(readFileSync(join(REGISTRY_DATA_DIR, 'aicanvas-mcp.json'), 'utf-8'))
const freeSlug = meta.components.find((c) => !isPremium(c.slug) && c.slug !== PAYMENT_REQUIRED).slug
const premiumSlug = meta.components.find((c) => isPremium(c.slug)).slug
const dsSlug = (meta.systemComponents ?? []).find((c) => c.system === 'andromeda').slug
const proSlug = (meta.systemComponents ?? []).find((c) => c.system === 'andromeda-pro')?.slug ?? dsSlug
const templateSlug = (meta.templates ?? [])[0]?.slug ?? 'none'

const CALLS = [
  ['list_categories', {}],
  ['list_components', { limit: 5 }],
  ['list_components', { category: meta.categories[0]?.label ?? 'x', limit: 3, offset: 1 }],
  ['search_components', { query: 'navbar' }],
  ['search_components', { query: 'mission control dashboard', limit: 5 }],
  ['search_components', { query: 'zzqqxx' }],
  ['get_component', { slug: freeSlug }],
  ['get_component', { slug: premiumSlug }],
  ['get_component', { slug: dsSlug }],
  ['get_component', { slug: proSlug }],
  ['get_component', { slug: PAYMENT_REQUIRED }],
  ['get_component', { slug: 'no-such-slug' }],
  ['get_install_command', { slug: freeSlug }],
  ['get_install_command', { slug: premiumSlug }],
  ['get_install_command', { slug: dsSlug }],
  ['get_install_command', { slug: templateSlug }],
  ['list_systems', {}],
  ['get_system', { slug: 'andromeda' }],
  ['get_system', { slug: 'andromeda-pro' }],
  ['get_system', { slug: 'no-such-system' }],
  ['list_templates', {}],
  ['list_templates', { system: 'andromeda' }],
  ['get_template', { slug: templateSlug }],
  ['get_template', { slug: 'no-such-template' }],
  ['get_component_props', { slug: 'andromeda-button-system' }],
  ['get_component_props', { slug: freeSlug }],
  [
    'validate_usage',
    {
      path: 'app/page.tsx',
      code: [
        "import { Button } from '@/components/aicanvas/andromeda/button'",
        "import Thing from '@/components/aicanvas/" + freeSlug + "'",
        'export default function Page() {',
        '  return <main><Button variant="nope" size>Go</Button><Thing madeUp={1} /></main>',
        '}',
      ].join('\n'),
    },
  ],
  ['get_audit_checklist', {}],
  ['get_audit_checklist', { scope: 'component' }],
]

async function transcript(server, token) {
  const log = []
  const { srv, base } = await startMock(log)
  const client = new McpClient({
    server,
    registryBase: base,
    extraEnv: { AICANVAS_TOKEN: token },
    timeoutMs: 30000,
  })
  const out = []
  try {
    out.push(
      await client.request('initialize', {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'golden', version: '0.0.1' },
      }),
    )
    client.notify('notifications/initialized')
    out.push(await client.request('tools/list', {}))
    for (const [name, args] of CALLS) {
      out.push({ call: name, args, res: await client.request('tools/call', { name, arguments: args }) })
    }
  } finally {
    await client.close()
    srv.close()
  }
  return { responses: out, requests: log, stderr: client.stderr }
}

function normalize(text, version) {
  // The only difference allowed: the version the server reports and sends.
  return text.split(version).join('<VERSION>')
}

// ── Run ──────────────────────────────────────────────────────────────────────

const baseline = await unpackBaseline(baselineSpec)
const candidateVersion = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8')).version
console.log(`golden: baseline ${baseline.version} (${baselineSpec}) vs candidate ${candidateVersion} (dist/)`)

let failed = 0
for (const [state, token] of Object.entries(TOKENS)) {
  const a = await transcript(baseline.server, token)
  const b = await transcript(CANDIDATE, token)
  // Mock ports differ per run; the registry base appears in commands and URLs.
  const portless = (s) => s.replace(/http:\/\/127\.0\.0\.1:\d+/g, '<REGISTRY>')
  const A = portless(normalize(JSON.stringify(a, null, 2), baseline.version))
  const B = portless(normalize(JSON.stringify(b, null, 2), candidateVersion))
  if (A === B) {
    console.log(`  ✓ token ${state}: ${a.responses.length} responses, ${a.requests.length} registry requests, identical`)
    continue
  }
  failed++
  const al = A.split('\n')
  const bl = B.split('\n')
  const i = al.findIndex((l, k) => l !== bl[k])
  console.log(`  ✗ token ${state}: first difference at line ${i + 1}`)
  console.log(`      baseline:  ${al[i]?.slice(0, 200)}`)
  console.log(`      candidate: ${bl[i]?.slice(0, 200)}`)
}

await rm(BASELINE_DIR, { recursive: true, force: true })
console.log(failed ? `\n══ ${failed} of 4 token states differ ══` : '\n══ all 4 token states identical ══')
process.exit(failed ? 1 : 0)
