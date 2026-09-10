import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import {
  ANDROMEDA_COMPONENTS,
  getAndromedaComponent,
} from '../../../_lib/andromeda-pro/andromeda-registry'
import { ANDROMEDA_PROPS } from '../../../lib/andromeda-props.generated'
import { AndromedaComponentView } from './AndromedaComponentView'
import { AndromedaThemeWrap } from '../AndromedaThemeWrap'
import { COMPONENT_COUNTS } from '../system/component-counts'
import { firstSentence } from '../system/first-sentence'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getSessionEntitlement } from '../../../lib/entitlement'
import { splitProPromptAtPaywall } from '../../../../lib/registry/prompt-blocks'

/**
 * The remix prompt for one Andromeda Pro component, or null.
 *
 * Bundled by scripts/inject-premium.mjs from the vault into an underscore-
 * prefixed file the /r route can never serve, and read here at request time.
 * Absent or unreadable means no prompt: the page renders no Remix panel, which
 * is the state every page was in before this lane existed.
 */
function readSystemPrompt(sourceFile: string): string | null {
  try {
    const raw = readFileSync(join(process.cwd(), 'registry-data', '_andromeda-pro-prompts.json'), 'utf8')
    const { prompts } = JSON.parse(raw) as { prompts: Record<string, string> }
    return prompts[sourceFile.replace(/\.tsx?$/, '')] ?? null
  } catch {
    // Absent is the normal state until the prompts land in the vault, so this
    // is not fatal. It IS logged: the same catch also covers a bundle that was
    // built but not traced into the serverless function, which otherwise makes
    // every Remix panel vanish in production with nothing to show for it.
    console.warn('[andromeda-pro] no remix-prompt bundle at registry-data/_andromeda-pro-prompts.json')
    return null
  }
}

export function generateStaticParams() {
  return ANDROMEDA_COMPONENTS.map((c) => ({ component: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ component: string }>
}): Promise<Metadata> {
  const { component } = await params
  const entry = getAndromedaComponent(component)
  if (!entry) return {}
  return {
    title: `${entry.name} · Andromeda Pro Design System`,
    description: entry.description,
    alternates: { canonical: `/design-systems/andromeda-pro/${entry.slug}` },
  }
}

export default async function AndromedaComponentPage({
  params,
}: {
  params: Promise<{ component: string }>
}) {
  const { component } = await params
  const entry = getAndromedaComponent(component)
  if (!entry) notFound()

  // The site rule's seed: this preview opens in whatever the site is set to
  // (same cookie, same read, as app/layout.tsx), and only the preview's own
  // toggle pins it after that — see AndromedaThemeWrap's `initialTheme`.
  const siteTheme = (await cookies()).get('theme')?.value === 'light' ? 'light' : 'dark'

  // Same shape as the Pro components index card (system/AndromedaGallery.tsx):
  // name, one-line description, and the variant/state counts from
  // COMPONENT_COUNTS — the same generated source the index page reads — so a
  // component's chip numbers can never diverge between the two surfaces.
  const related = ANDROMEDA_COMPONENTS.filter((c) => c.slug !== entry.slug).map(
    (c) => ({
      slug: c.slug,
      name: c.name,
      // First sentence only, exactly as the index page cuts it: the card is the
      // same component on both surfaces, so a two-sentence description must not
      // make this one taller than its twin.
      description: firstSentence(c.description),
      variants: COMPONENT_COUNTS[c.slug]?.variants ?? 0,
      states: COMPONENT_COUNTS[c.slug]?.states ?? 0,
    }),
  )

  // Prop tables parsed from the component's @typedef JSDoc at build time, keyed
  // by source-file basename (Button.tsx → "Button"). Empty when the component
  // ships no @typedef block (2 of 33 today) — the view hides the section.
  const propTables = ANDROMEDA_PROPS['andromeda-pro']?.[entry.sourceFile.replace(/\.tsx?$/, '')] ?? []

  // Account-gated install: when on, a signed-out visitor of this FREE
  // design-system component sees a "create a free account to install" CTA
  // instead of the runnable command. Reading the source (Code tab) stays
  // public either way. Threaded to the client so the install CTAs swap.
  const freeAccountGate = process.env.FREE_ACCOUNT_GATE === 'on'

  // ── Prompt gate ──────────────────────────────────────────────────────────
  // Andromeda Pro is free to explore, PAID to install (ruling 2026-08-30, names
  // 2026-09-10), and its remix prompt is paid content like its source. A viewer
  // without a premium entitlement gets the free teaser only — blocks 1-2 for a
  // rewritten scaffold prompt, or the opening paragraphs for one still a prose
  // brief — and everything that actually rebuilds the component is dropped
  // HERE, server side, and never reaches the client. The bytes cannot be
  // recovered from the page. Same fail-closed posture as /r: an entitlement
  // read that throws is treated as not entitled.
  const fullPrompt = readSystemPrompt(entry.sourceFile)
  let promptLocked = false
  let remixPrompt = fullPrompt
  if (fullPrompt) {
    let viewerIsPremium = false
    try {
      viewerIsPremium = (await getSessionEntitlement()).tier === 'premium'
    } catch {
      // Fail CLOSED. Worst case a subscriber sees the public head for one
      // render, never the reverse.
    }
    if (!viewerIsPremium) {
      const split = splitProPromptAtPaywall(fullPrompt)
      // Unredactable is not the same as harmless: with no known seam the prompt
      // is withheld whole, which hides the panel.
      remixPrompt = split ? split.head : null
      promptLocked = true
    }
  }

  // Source is NOT shipped in this page's HTML — the Code tab fetches it on
  // demand from the gated /api/component-code endpoint, so access is decided
  // per user, never by a build-time flag.
  return (
    // The theme provider sits ABOVE the view so the view's own hooks (the
    // portalled full-screen overlay re-spreads the theme set) can read it.
    <AndromedaThemeWrap initialTheme={siteTheme}>
      <AndromedaComponentView
        slug={entry.slug}
        name={entry.name}
        description={entry.description}
        related={related}
        propTables={propTables}
        freeAccountGate={freeAccountGate}
        remixPrompt={remixPrompt}
        promptLocked={promptLocked}
      />
    </AndromedaThemeWrap>
  )
}
