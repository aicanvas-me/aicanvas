#!/usr/bin/env node
/**
 * Comprehensive smoke test for @aicanvas/mcp.
 *
 * Spawns the built server, drives it via JSON-RPC over stdio, and
 * exercises every tool plus error paths.
 *
 * Usage:
 *   node test/smoke.mjs                               # against production
 *   AICANVAS_REGISTRY_BASE=http://localhost:3000/r \
 *     node test/smoke.mjs                             # against dev server
 */

import { setTimeout as sleep } from 'node:timers/promises'
import { McpClient } from './client.mjs'

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

function section(title) {
  console.log(`\n── ${title} ─────────────────────────────────────────────`)
}

async function callTool(client, name, args) {
  const res = await client.request('tools/call', { name, arguments: args ?? {} })
  return res
}

function getStructured(res) {
  return res?.result?.structuredContent
}

function getText(res) {
  const c = res?.result?.content?.[0]
  return c?.type === 'text' ? c.text : ''
}

// ── Run ──────────────────────────────────────────────────────────────────────

const client = new McpClient()

try {
  // ── Protocol handshake ────────────────────────────────────────────────────

  section('Protocol handshake')

  const initRes = await client.request('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'smoke', version: '0.0.1' },
  })
  record(
    'initialize returns serverInfo',
    initRes?.result?.serverInfo?.name === 'aicanvas-mcp',
    `got ${JSON.stringify(initRes?.result?.serverInfo)}`,
  )
  record(
    'initialize advertises tools capability',
    !!initRes?.result?.capabilities?.tools,
    `caps: ${JSON.stringify(initRes?.result?.capabilities)}`,
  )

  client.notify('notifications/initialized')

  // ── Tools discovery ──────────────────────────────────────────────────────

  section('Tools discovery')

  const toolsRes = await client.request('tools/list')
  const tools = toolsRes?.result?.tools ?? []
  const toolNames = new Set(tools.map((t) => t.name))
  const expected = [
    'list_categories',
    'list_components',
    'search_components',
    'get_component',
    'get_install_command',
  ]
  for (const t of expected) {
    record(`tools/list contains ${t}`, toolNames.has(t), `got [${[...toolNames].join(', ')}]`)
  }
  record(
    'every tool has a description',
    tools.every((t) => typeof t.description === 'string' && t.description.length > 0),
    'some tool missing description',
  )
  record(
    'read-only tools are annotated readOnlyHint',
    tools.every((t) => t.annotations?.readOnlyHint === true),
    'some tool missing readOnlyHint annotation',
  )

  // ── list_categories ──────────────────────────────────────────────────────

  section('list_categories')

  const lc = await callTool(client, 'list_categories')
  const lcs = getStructured(lc)
  record('returns structuredContent', !!lcs, 'no structuredContent')
  record(
    'componentCount > 0',
    typeof lcs?.componentCount === 'number' && lcs.componentCount > 0,
    `got ${lcs?.componentCount}`,
  )
  record(
    'categories is non-empty array',
    Array.isArray(lcs?.categories) && lcs.categories.length > 0,
    `got ${JSON.stringify(lcs?.categories)?.slice(0, 80)}`,
  )
  record(
    'each category has label + count',
    (lcs?.categories ?? []).every(
      (c) => typeof c.label === 'string' && typeof c.count === 'number',
    ),
    'category schema mismatch',
  )
  const lcText = getText(lc)
  record('text body is non-empty + readable', lcText.length > 50, `got "${lcText.slice(0, 80)}"`)

  // ── list_components ──────────────────────────────────────────────────────

  section('list_components')

  // No filter
  const lcAll = await callTool(client, 'list_components', { limit: 10 })
  const lcAllSc = getStructured(lcAll)
  record('returns up to limit components', lcAllSc?.returned === 10, `got ${lcAllSc?.returned}`)
  record('total ≥ returned', lcAllSc?.total >= lcAllSc?.returned, `total=${lcAllSc?.total}`)
  record(
    'each component has slug + name + categories',
    (lcAllSc?.components ?? []).every(
      (c) =>
        typeof c.slug === 'string' &&
        typeof c.name === 'string' &&
        Array.isArray(c.categories),
    ),
    'component schema mismatch',
  )
  record(
    'each component has installCommand starting with npx shadcn',
    (lcAllSc?.components ?? []).every((c) =>
      c.installCommand?.startsWith('npx shadcn'),
    ),
    'install command malformed',
  )

  // With category filter (use one we know exists)
  const lcCat = await callTool(client, 'list_components', {
    category: 'Backgrounds',
    limit: 50,
  })
  const lcCatSc = getStructured(lcCat)
  record(
    'category filter returns only matching components',
    (lcCatSc?.components ?? []).every((c) => c.categories.includes('Backgrounds')),
    'filter leaked',
  )
  record('Backgrounds count > 0', lcCatSc?.total > 0, `got ${lcCatSc?.total}`)

  // Case-insensitive category
  const lcCatLower = await callTool(client, 'list_components', {
    category: 'backgrounds',
    limit: 5,
  })
  record(
    'category filter is case-insensitive',
    getStructured(lcCatLower)?.total === lcCatSc?.total,
    `got ${getStructured(lcCatLower)?.total} vs ${lcCatSc?.total}`,
  )

  // Pagination
  const page1 = await callTool(client, 'list_components', { limit: 5, offset: 0 })
  const page2 = await callTool(client, 'list_components', { limit: 5, offset: 5 })
  const page1Slugs = getStructured(page1)?.components?.map((c) => c.slug) ?? []
  const page2Slugs = getStructured(page2)?.components?.map((c) => c.slug) ?? []
  record(
    'pagination yields disjoint pages',
    page1Slugs.length > 0 &&
      page2Slugs.length > 0 &&
      !page1Slugs.some((s) => page2Slugs.includes(s)),
    'page overlap detected',
  )

  // Unknown category
  const lcUnknown = await callTool(client, 'list_components', {
    category: 'NoSuchCategory123',
  })
  record(
    'unknown category returns total=0 (no error)',
    getStructured(lcUnknown)?.total === 0,
    `got ${getStructured(lcUnknown)?.total}`,
  )

  // ── search_components ────────────────────────────────────────────────────

  section('search_components')

  const searchExact = await callTool(client, 'search_components', {
    query: 'wave-lines',
    limit: 5,
  })
  const searchExactSc = getStructured(searchExact)
  record(
    'exact slug query ranks the matching component first',
    searchExactSc?.components?.[0]?.slug === 'wave-lines',
    `got ${searchExactSc?.components?.[0]?.slug}`,
  )

  const searchPhrase = await callTool(client, 'search_components', {
    query: 'animated card stack',
    limit: 5,
  })
  const searchPhraseSc = getStructured(searchPhrase)
  record(
    'multi-word query returns ranked results',
    Array.isArray(searchPhraseSc?.components) && searchPhraseSc.components.length > 0,
    `got ${searchPhraseSc?.count}`,
  )

  const searchEmpty = await callTool(client, 'search_components', {
    query: 'qqqzzzxyz wwwvvvuuu',
  })
  const searchEmptySc = getStructured(searchEmpty)
  record(
    'no-match query returns empty list (not an error)',
    searchEmptySc?.count === 0 && Array.isArray(searchEmptySc.components),
    `got count=${searchEmptySc?.count}, sample=${JSON.stringify(
      searchEmptySc?.components?.[0],
    )?.slice(0, 80)}`,
  )

  // Short-token noise (the original failure mode): a query whose only
  // useful token is gibberish should not return matches.
  const searchShortTokens = await callTool(client, 'search_components', {
    query: 'no to a qqqzzzxyz',
  })
  record(
    'short tokens (<=2 chars) ignored — only meaningful tokens scored',
    getStructured(searchShortTokens)?.count === 0,
    `got count=${getStructured(searchShortTokens)?.count}`,
  )

  // Special characters — make sure regex injection doesn't crash
  const searchSpecial = await callTool(client, 'search_components', {
    query: '.*[^a]+(card)?',
    limit: 3,
  })
  record(
    'regex-special chars in query handled safely',
    !searchSpecial?.result?.isError,
    `error: ${getText(searchSpecial)?.slice(0, 80)}`,
  )

  // Limit caps
  const searchLimit = await callTool(client, 'search_components', {
    query: 'card',
    limit: 50,
  })
  record(
    'large limit honored without crash',
    !searchLimit?.result?.isError,
    'crash on large limit',
  )

  // Validation: missing required `query`
  const searchInvalid = await callTool(client, 'search_components', {})
  record(
    'missing required `query` returns an error response',
    searchInvalid?.result?.isError === true || searchInvalid?.error != null,
    `got ${JSON.stringify(searchInvalid)?.slice(0, 100)}`,
  )

  // ── get_component ────────────────────────────────────────────────────────

  section('get_component')

  // Pick a slug we know exists (from earlier list)
  const realSlug = lcAllSc?.components?.[0]?.slug
  const gc = await callTool(client, 'get_component', { slug: realSlug })
  // The correct invariant, independent of the FREE_ACCOUNT_GATE kill-switch state:
  // get_component returns EITHER real source (token present, or gate off) OR a warm
  // sign-up CTA (anonymous + gate on) — but NEVER a raw create-account placeholder
  // handed back as if it were the component. Asserting both valid outcomes keeps the
  // test honest whichever way the gate is flipped, and still covers the happy path.
  const gcText = gc?.result?.content?.[0]?.text ?? ''
  const gcSc = getStructured(gc)
  const isGatedCta =
    gc?.result?.isError === true &&
    /free with an AI Canvas account/i.test(gcText) &&
    /sign-up/i.test(gcText)
  const isRealSource =
    !gc?.result?.isError &&
    typeof gcSc?.code === 'string' &&
    gcSc.code.length > 100 &&
    (gcSc.code.includes("'use client'") ||
      gcSc.code.includes('"use client"') ||
      gcSc.code.startsWith('import'))
  record(
    `get_component("${realSlug}") returns real source OR a warm gate CTA (never a raw placeholder)`,
    isGatedCta || isRealSource,
    `isError=${gc?.result?.isError}, codeLen=${gcSc?.code?.length}, text: ${gcText.slice(0, 90)}`,
  )

  const gcBad = await callTool(client, 'get_component', {
    slug: 'definitely-does-not-exist-xyz',
  })
  record(
    'unknown slug returns isError',
    gcBad?.result?.isError === true,
    `got ${JSON.stringify(gcBad?.result)?.slice(0, 100)}`,
  )

  // ── get_install_command ──────────────────────────────────────────────────

  section('get_install_command')

  const gic = await callTool(client, 'get_install_command', { slug: realSlug })
  const gicSc = getStructured(gic)
  record(
    'returns the canonical npx shadcn add command for the slug',
    gicSc?.installCommand === `npx shadcn@latest add @aicanvas/${realSlug}`,
    `got ${gicSc?.installCommand}`,
  )
  record(
    'includes sourceUrl and homepageUrl',
    typeof gicSc?.sourceUrl === 'string' &&
      typeof gicSc?.homepageUrl === 'string' &&
      gicSc.sourceUrl.endsWith(`${realSlug}.json`),
    `got ${JSON.stringify({ sourceUrl: gicSc?.sourceUrl, homepageUrl: gicSc?.homepageUrl })}`,
  )

  const gicBad = await callTool(client, 'get_install_command', {
    slug: 'no-such-slug-xyz',
  })
  record(
    'unknown slug returns isError',
    gicBad?.result?.isError === true,
    `got ${JSON.stringify(gicBad?.result)?.slice(0, 100)}`,
  )

  // ── Cache behavior ───────────────────────────────────────────────────────

  section('Caching')

  // Two list_categories calls back-to-back — both should be near-instant
  // (cached after first fetch). We just sanity-check both complete fast.
  const t1 = Date.now()
  await callTool(client, 'list_categories')
  const t2 = Date.now()
  await callTool(client, 'list_categories')
  const t3 = Date.now()
  const firstMs = t2 - t1
  const secondMs = t3 - t2
  record(
    'cached list_categories calls complete under 500ms',
    firstMs < 500 && secondMs < 500,
    `first ${firstMs}ms, second ${secondMs}ms`,
  )
  record(
    'second call is not slower than 2× the first (cache holds)',
    secondMs <= Math.max(firstMs * 2, 5),
    `first ${firstMs}ms, second ${secondMs}ms`,
  )

  // ── Concurrency ──────────────────────────────────────────────────────────

  section('Concurrency')

  // Fire 5 tool calls in parallel — all should resolve correctly without
  // interleaving / corrupting JSON-RPC frames.
  const concurrent = await Promise.all([
    callTool(client, 'list_categories'),
    callTool(client, 'list_components', { limit: 3 }),
    callTool(client, 'search_components', { query: 'wave', limit: 3 }),
    callTool(client, 'get_install_command', { slug: realSlug }),
    callTool(client, 'list_categories'),
  ])
  record(
    'all 5 concurrent calls return a result (no dropped responses)',
    concurrent.every((r) => r?.result != null),
    `got ${concurrent.filter((r) => r?.result != null).length}/5`,
  )
  record(
    'no concurrent call surfaced isError',
    concurrent.every((r) => !r?.result?.isError),
    'one of the parallel calls errored',
  )

  // ── stderr cleanliness ───────────────────────────────────────────────────

  section('stderr')

  // Allow Next.js dev-server logs only if they're noise about font loading.
  // What we DO NOT want: aicanvas-mcp errors or unhandled promise rejections.
  const ourErrors = client.stderr
    .split('\n')
    .filter((l) => /aicanvas-mcp|UnhandledPromiseRejection|Error:/.test(l))
  record(
    'no MCP errors or unhandled rejections on stderr',
    ourErrors.length === 0,
    `saw: ${ourErrors.slice(0, 3).join(' | ')}`,
  )
} catch (err) {
  console.log(`\n!! HARNESS ERROR: ${err.message}`)
  fail++
  failures.push(`harness: ${err.message}`)
} finally {
  await client.close()
}

console.log(
  `\n══ ${pass} passed, ${fail} failed ══════════════════════════════════════════`,
)
if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
process.exit(0)
