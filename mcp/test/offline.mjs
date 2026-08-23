#!/usr/bin/env node
/**
 * Offline / network-failure test + local-registry coverage.
 *
 * Phase A — server pointed at a deliberately unreachable URL, verifies that:
 *   1. The server starts and responds to initialize (no startup network)
 *   2. tools/list works (schemas are local; no network)
 *   3. Tool calls that NEED the registry return a graceful isError (not
 *      a crash, not a swallowed exception)
 *   4. The process stays alive (one bad call doesn't kill the server)
 *
 * Phase B — server pointed at a LOCAL static file server rooted at
 * registry-data/ (the exact files the generator emits, including the new
 * systemComponents bucket). No network. Verifies the design-system parity:
 *   - list_systems returns andromeda
 *   - get_system('andromeda') returns files AND surfaces tokensInstallCommand
 *     + componentSlugs
 *   - get_template resolves a real template
 *   - get_component / get_install_command resolve a DS component slug
 *     ('andromeda-heat-grid') via the systemComponents fallback
 *   - search_components surfaces a DS component
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { McpClient } from './client.mjs'

const BAD_URL = 'http://127.0.0.1:1/r' // Port 1 — guaranteed unreachable
// registry-data/ lives at the repo root, two levels up from mcp/test/.
const REGISTRY_DATA_DIR = new URL('../../registry-data/', import.meta.url).pathname

let pass = 0
let fail = 0
const failures = []

function record(name, ok, detail) {
  if (ok) {
    pass++
    console.log(`  ✓ ${name}`)
  } else {
    fail++
    failures.push(`${name}: ${detail}`)
    console.log(`  ✗ ${name}  — ${detail}`)
  }
}

// ── Local static registry server ───────────────────────────────────────────────
// Serves registry-data/<file> over HTTP so the MCP can fetch real, locally
// generated metadata (aicanvas-mcp.json) and per-slug source — no network, no
// production dependency. The MCP requests `${base}/<name>.json`, so the base
// must point at this server's root.
function startLocalRegistry() {
  return new Promise((resolve) => {
    const srv = createServer(async (req, res) => {
      try {
        // Strip query string and leading slash; reject path traversal.
        const name = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '')
        if (!name || name.includes('..')) {
          res.writeHead(404).end('not found')
          return
        }
        const body = await readFile(join(REGISTRY_DATA_DIR, name))
        res.writeHead(200, { 'Content-Type': 'application/json' }).end(body)
      } catch {
        res.writeHead(404, { 'Content-Type': 'application/json' }).end('{}')
      }
    })
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      resolve({ srv, base: `http://127.0.0.1:${port}` })
    })
  })
}

// ── Version literal ──────────────────────────────────────────────────────────
// The version lives in four places (package.json, server.json twice, and the
// MCP_VERSION literal the server reports); a release that bumps only some of
// them ships a server that announces the wrong version.
{
  const here = new URL('.', import.meta.url)
  const pkg = JSON.parse(readFileSync(new URL('../package.json', here), 'utf-8')).version
  const srv = JSON.parse(readFileSync(new URL('../server.json', here), 'utf-8'))
  const literal = readFileSync(new URL('../src/index.ts', here), 'utf-8').match(/const MCP_VERSION = '([^']+)'/)?.[1]
  const all = [pkg, srv.version, srv.packages?.[0]?.version, literal]
  record('version literal matches package.json and server.json', all.every((v) => v === pkg), all.join(' / '))
}

const client = new McpClient({ registryBase: BAD_URL, timeoutMs: 30000 })
let local = null
let localClient = null
let tokenClient = null

try {
  console.log(`── Phase A: server pointed at unreachable ${BAD_URL} ─────────`)

  const initRes = await client.request('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'offline-test', version: '0.0.1' },
  })
  record(
    'initialize succeeds with bad registry URL (no startup network)',
    initRes?.result?.serverInfo?.name === 'aicanvas-mcp',
    `got ${JSON.stringify(initRes?.result)?.slice(0, 100)}`,
  )

  client.notify('notifications/initialized')

  const toolsRes = await client.request('tools/list')
  record(
    'tools/list works without registry (schemas are local)',
    Array.isArray(toolsRes?.result?.tools) && toolsRes.result.tools.length === 9,
    `got ${toolsRes?.result?.tools?.length} tools`,
  )

  // First tool call should fail gracefully — fetch will fail to connect
  const lcRes = await client.request('tools/call', {
    name: 'list_categories',
    arguments: {},
  })
  record(
    'list_categories returns isError when registry unreachable',
    lcRes?.result?.isError === true,
    `got ${JSON.stringify(lcRes?.result)?.slice(0, 120)}`,
  )

  // Second call — server should still be alive
  record(
    'server still alive after first failed tool call',
    client.isAlive(),
    'server died after one network failure',
  )

  const sRes = await client.request('tools/call', {
    name: 'search_components',
    arguments: { query: 'card' },
  })
  record(
    'search_components returns isError when registry unreachable',
    sRes?.result?.isError === true,
    `got ${JSON.stringify(sRes?.result)?.slice(0, 120)}`,
  )

  const gicRes = await client.request('tools/call', {
    name: 'get_install_command',
    arguments: { slug: 'wave-lines' },
  })
  record(
    'get_install_command returns isError when registry unreachable',
    gicRes?.result?.isError === true,
    `got ${JSON.stringify(gicRes?.result)?.slice(0, 120)}`,
  )

  record(
    'server still alive after multiple failed tool calls',
    client.isAlive(),
    'server died',
  )

  // ── Phase B: server pointed at a local registry-data/ file server ──────────
  // registry-data/ is GENERATED, not tracked, so a fresh clone has none of it.
  // Without this guard every Phase B assertion fails on a 404 and reads like the
  // tools are broken. Fail once, with the command that fixes it.
  if (!existsSync(join(REGISTRY_DATA_DIR, '_manifest.json'))) {
    console.error(
      `\n✗ registry-data/ is empty or missing (looked in ${REGISTRY_DATA_DIR}).\n` +
        '  Phase B serves those generated files as fixtures. From the repo root run:\n' +
        '      node scripts/generate-registry.mjs\n' +
        '  then re-run this suite. Phase A results above are still valid.\n',
    )
    process.exit(1)
  }

  local = await startLocalRegistry()
  console.log(`\n── Phase B: server pointed at local registry ${local.base} ──`)
  localClient = new McpClient({ registryBase: local.base, timeoutMs: 30000 })

  const initB = await localClient.request('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'offline-test-local', version: '0.0.1' },
  })
  record(
    'local: initialize succeeds',
    initB?.result?.serverInfo?.name === 'aicanvas-mcp',
    `got ${JSON.stringify(initB?.result)?.slice(0, 100)}`,
  )
  localClient.notify('notifications/initialized')

  const call = (name, args) =>
    localClient.request('tools/call', { name, arguments: args ?? {} })
  const sc = (res) => res?.result?.structuredContent

  // list_systems → andromeda
  const lsRes = await call('list_systems')
  const lsSystems = sc(lsRes)?.systems ?? []
  record(
    'local: list_systems returns andromeda',
    !lsRes?.result?.isError && lsSystems.some((s) => s.slug === 'andromeda'),
    `got ${JSON.stringify(lsSystems.map((s) => s.slug))}`,
  )

  // get_system('andromeda') → files + tokensInstallCommand + componentSlugs
  const gsRes = await call('get_system', { slug: 'andromeda' })
  const gsSc = sc(gsRes)
  record(
    'local: get_system(andromeda) returns files',
    !gsRes?.result?.isError && Array.isArray(gsSc?.files) && gsSc.files.length > 0,
    `isError=${gsRes?.result?.isError}, files=${gsSc?.files?.length}`,
  )
  record(
    'local: get_system surfaces tokensInstallCommand',
    typeof gsSc?.tokensInstallCommand === 'string' &&
      gsSc.tokensInstallCommand.includes('andromeda-tokens'),
    `got ${gsSc?.tokensInstallCommand}`,
  )
  record(
    'local: get_system surfaces componentSlugs (incl. andromeda-heat-grid)',
    Array.isArray(gsSc?.componentSlugs) &&
      gsSc.componentSlugs.includes('andromeda-heat-grid'),
    `got ${gsSc?.componentSlugs?.length} slugs`,
  )
  record(
    'local: get_system summary notes the shared tokens must also be installed',
    /tokens/i.test(
      gsRes?.result?.content?.[0]?.type === 'text'
        ? gsRes.result.content[0].text
        : '',
    ),
    'tokens note missing from summary',
  )

  // list_templates → discovery for templates (no filter, then filtered)
  const ltRes = await call('list_templates', {})
  const ltSc = sc(ltRes)
  record(
    'local: list_templates returns templates',
    Array.isArray(ltSc?.templates) && ltSc.templates.length > 0,
    `got ${JSON.stringify(ltSc?.templates?.length)}`,
  )
  record(
    'local: list_templates surfaces andromeda-mission-control',
    (ltSc?.templates ?? []).some((t) => t.slug === 'andromeda-mission-control'),
    `slugs: ${(ltSc?.templates ?? []).map((t) => t.slug).join(', ').slice(0, 90)}`,
  )
  const ltFiltered = sc(await call('list_templates', { system: 'ANDROMEDA' }))
  record(
    'local: list_templates system filter is case-insensitive',
    Array.isArray(ltFiltered?.templates) &&
      ltFiltered.templates.length === ltSc.templates.length &&
      ltFiltered.templates.every((t) => t.system === 'andromeda'),
    `got ${ltFiltered?.templates?.length} of ${ltSc?.templates?.length}`,
  )
  const ltNone = await call('list_templates', { system: 'no-such-system' })
  record(
    'local: list_templates on an unknown system is empty, not an error',
    !ltNone?.result?.isError && (sc(ltNone)?.templates ?? null)?.length === 0,
    `isError=${ltNone?.result?.isError}, templates=${JSON.stringify(sc(ltNone)?.templates)}`,
  )

  // get_template → a real template
  const gtRes = await call('get_template', { slug: 'andromeda-mission-control' })
  const gtSc = sc(gtRes)
  record(
    'local: get_template(andromeda-mission-control) returns files',
    !gtRes?.result?.isError && Array.isArray(gtSc?.files) && gtSc.files.length > 0,
    `isError=${gtRes?.result?.isError}, files=${gtSc?.files?.length}`,
  )
  record(
    'local: get_template surfaces registryDependencies',
    Array.isArray(gtSc?.registryDependencies) &&
      gtSc.registryDependencies.length > 0,
    `got ${JSON.stringify(gtSc?.registryDependencies)?.slice(0, 80)}`,
  )

  // get_component → DS slug via systemComponents fallback
  const gcRes = await call('get_component', { slug: 'andromeda-heat-grid' })
  const gcSc = sc(gcRes)
  record(
    'local: get_component(andromeda-heat-grid) resolves via systemComponents fallback',
    !gcRes?.result?.isError &&
      gcSc?.slug === 'andromeda-heat-grid' &&
      gcSc?.system === 'andromeda',
    `isError=${gcRes?.result?.isError}, slug=${gcSc?.slug}, system=${gcSc?.system}`,
  )
  record(
    'local: get_component(andromeda-heat-grid) returns non-empty source code',
    typeof gcSc?.code === 'string' && gcSc.code.length > 100,
    `code length ${gcSc?.code?.length}`,
  )

  // get_install_command → DS slug via systemComponents fallback
  const gicB = await call('get_install_command', { slug: 'andromeda-heat-grid' })
  const gicBSc = sc(gicB)
  record(
    'local: get_install_command(andromeda-heat-grid) resolves via fallback',
    !gicB?.result?.isError &&
      gicBSc?.installCommand === 'npx shadcn@latest add @aicanvas/andromeda-heat-grid',
    `got ${gicBSc?.installCommand}`,
  )

  // get_install_command with AICANVAS_TOKEN set → the tokenized URL form (the
  // bare @aicanvas form would run anonymously in the user's shell and install
  // a placeholder).
  const TOKEN = 'aic_' + '0123456789abcdef'.repeat(3)
  tokenClient = new McpClient({ registryBase: local.base, extraEnv: { AICANVAS_TOKEN: TOKEN }, timeoutMs: 30000 })
  const initT = await tokenClient.request('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'offline-test', version: '0.0.1' },
  })
  record('local+token: initialize succeeds', !!initT?.result, JSON.stringify(initT)?.slice(0, 120))
  tokenClient.notify('notifications/initialized')
  const gicT = await tokenClient.request('tools/call', {
    name: 'get_install_command',
    arguments: { slug: 'andromeda-heat-grid' },
  })
  const gicTSc = sc(gicT)
  record(
    'local+token: get_install_command returns the tokenized URL form',
    !gicT?.result?.isError &&
      gicTSc?.installCommand ===
        `npx shadcn@latest add "${local.base}/andromeda-heat-grid.json?token=${TOKEN}"`,
    `got ${gicTSc?.installCommand}`,
  )

  // search_components → a DS component surfaces
  const srB = await call('search_components', { query: 'heat grid', limit: 10 })
  const srBSc = sc(srB)
  record(
    'local: search_components surfaces the DS component andromeda-heat-grid',
    !srB?.result?.isError &&
      (srBSc?.components ?? []).some((c) => c.slug === 'andromeda-heat-grid'),
    `got ${JSON.stringify((srBSc?.components ?? []).map((c) => c.slug))?.slice(0, 120)}`,
  )

  // search_components → templates rank too, tagged so the agent picks the right
  // fetch tool. Before this, "dashboard" matched nothing in the whole registry.
  const srT = sc(await call('search_components', { query: 'dashboard', limit: 10 }))
  const srTHits = (srT?.components ?? []).filter((c) => c.kind === 'template')
  record(
    'local: search_components surfaces templates for "dashboard"',
    srTHits.length > 0,
    `got ${JSON.stringify((srT?.components ?? []).map((c) => c.slug))?.slice(0, 120)}`,
  )
  record(
    'local: template search hits are tagged kind=template',
    srTHits.length > 0 && srTHits.every((c) => c.kind === 'template' && c.slug && c.installCommand),
    `tagged ${srTHits.length} of ${srT?.components?.length}`,
  )
  const srMC = sc(await call('search_components', { query: 'mission control', limit: 5 }))
  record(
    'local: search_components ranks andromeda-mission-control first for its own name',
    (srMC?.components ?? [])[0]?.slug === 'andromeda-mission-control',
    `top hit ${JSON.stringify((srMC?.components ?? [])[0]?.slug)}`,
  )
  const srReg = sc(await call('search_components', { query: 'card stack', limit: 5 }))
  record(
    'local: adding templates does not displace standalone matches',
    (srReg?.components ?? []).length > 0 &&
      (srReg?.components ?? []).every((c) => c.kind !== 'template'),
    `got ${JSON.stringify((srReg?.components ?? []).map((c) => c.slug))?.slice(0, 120)}`,
  )

  // list_components must NOT leak DS components into the standalone catalog.
  // (Note: `andromeda-button` is a genuine standalone wrapper in
  // components-workspace/ and legitimately appears here; the DS Button ships as
  // `andromeda-button-system`. So compare against the real systemComponents set,
  // not a name prefix.)
  const dsSlugs = new Set((gsSc?.componentSlugs ?? []))
  const lcB = await call('list_components', { limit: 200 })
  const lcBSlugs = (sc(lcB)?.components ?? []).map((c) => c.slug)
  record(
    'local: list_components excludes design-system components',
    !lcBSlugs.some((s) => dsSlugs.has(s)),
    `leaked: ${lcBSlugs.filter((s) => dsSlugs.has(s)).join(', ')}`,
  )
} catch (err) {
  console.log(`!! HARNESS ERROR: ${err.message}`)
  fail++
  failures.push(`harness: ${err.message}`)
} finally {
  await client.close()
  if (localClient) await localClient.close()
  if (tokenClient) await tokenClient.close()
  if (local) await new Promise((r) => local.srv.close(r))
}

console.log(`\n══ ${pass} passed, ${fail} failed ════════════════════════════════`)
if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
process.exit(0)
