import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { COMPONENTS, isBlockEntry, type ComponentEntry, type ComponentMeta } from '../../lib/component-registry'
import { STANDALONE_PROPS } from '../../lib/standalone-props.generated'
import ComponentPageView from './ComponentPageView'
import { HighlightedCode } from '../../components/HighlightedCode'
import { GITHUB_URL, SITE_URL } from '../../lib/config'
import { collectionsForComponent } from '../../lib/collections'
import { classifyContent } from '@/lib/registry/content-type'
import { loadContentLookup } from '@/lib/registry/lookup'
import { splitPromptAtPaywall } from '@/lib/registry/prompt-blocks'
import { getSessionEntitlement } from '@/app/lib/entitlement'

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }))
}

// Keys MUST be real accent-tag labels, spelled exactly as the registry spells
// them. They previously read 'Cards', 'Text', 'Buttons', 'Glass' and so on,
// none of which is an accent label ('Cards & Modals', 'Typography',
// 'Buttons & Toggles'; Glass is never the accent tag), so only Backgrounds and
// Navigation ever matched and 65 of 83 titles fell through to the bare
// 'Animated' default. Add a category, add its label here too.
// 'Blocks' is deliberately absent: a block is a page section, so the plain
// 'Animated' default reads better than naming it.
const DESCRIPTOR_PREFIXES: Record<string, string> = {
  Backgrounds: 'Animated Background',
  Typography: 'Animated Text',
  Widgets: 'Animated Widget',
  Notifications: 'Animated Notification',
  Navigation: 'Animated Navigation',
  'Cards & Modals': 'Animated Card',
  'Buttons & Toggles': 'Animated Button',
  'Inputs & Controls': 'Animated Input',
  '3D & Shaders': '3D',
}

function firstSentenceOf(description: string): string {
  const match = description.match(/^(.+?[.!?])\s|$/)
  const first = (match && match[1]) || description
  return first.trim()
}

function computeTitle(entry: ComponentEntry): string {
  const accentTag = entry.tags.find((t) => t.accent)
  const category = accentTag?.label ?? ''
  const descriptor = DESCRIPTOR_PREFIXES[category] ?? 'Animated'
  return `${entry.name} - ${descriptor} React Component`
}

function computeMetaDescription(entry: ComponentEntry, isPremium: boolean): string {
  const max = 150
  const base = entry.description.length > max
    ? entry.description.slice(0, max).replace(/\s+\S*$/, '').trim() + '…'
    : entry.description
  // Free content keeps the open-source tail; premium content must never claim
  // MIT / open source, so it gets a premium-accurate tail instead. The noun
  // follows isBlock so a section-scale block is not called a component.
  const tail = isPremium
    ? `Install via shadcn CLI. Premium AI Canvas ${isBlockEntry(entry) ? 'block' : 'component'}.`
    : 'Install via shadcn CLI. Free and open source.'
  return `${base} | ${tail}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = COMPONENTS.find((c) => c.slug === slug)
  if (!entry) return {}

  const accentTag = entry.tags.find((t) => t.accent)
  const category = accentTag?.label ?? 'Component'
  // Mirror the page-level isPremium classification so the meta never claims
  // "Free and open source" on premium (closed-source) content. A degraded
  // lookup fails closed (treated as premium) so we never overclaim.
  const lookup = loadContentLookup()
  const contentType = classifyContent(slug, lookup)
  const isPremium =
    lookup.degraded === true ||
    contentType === 'premium-standalone' ||
    contentType === 'design-system' ||
    contentType === 'template'
  const title = computeTitle(entry)
  const description = computeMetaDescription(entry, isPremium)
  const url = `${SITE_URL}/components/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [
      `${entry.name.toLowerCase()} react`,
      `${entry.name.toLowerCase()} framer motion`,
      `${entry.name.toLowerCase()} component`,
      `${entry.name.toLowerCase()} ai prompt`,
      `${category.toLowerCase()} react component`,
      'animated react component',
      'react component AI prompt',
      'shadcn registry',
      'copy paste react component',
      'framer motion tailwind',
    ],
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      // Real screenshot when we have one; otherwise inherit the site-wide
      // default OG image from the root layout.
      ...(entry.image
        ? {
            images: [
              {
                url: entry.image,
                alt: `${entry.name}. ${firstSentenceOf(entry.description)}`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(entry.image ? { images: [entry.image] } : {}),
    },
  }
}

// Natural-language list join: "A", "A and B", "A, B, and C" (serial comma).
// Keeps the generated FAQ copy from reading "A and B and C".
function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

// Programmatic per-component FAQ, rendered on the page AND emitted as
// FAQPage JSON-LD. Every answer is derived from registry data so it stays
// true automatically; only questions we can answer accurately are included.
function buildFaq(
  entry: ComponentEntry,
  isPremium: boolean,
): { q: string; a: string }[] {
  const stacks = entry.tags.filter((t) => !t.accent).map((t) => t.label)
  // Section-scale entries are blocks, not components (see isBlockEntry).
  const noun = isBlockEntry(entry) ? 'block' : 'component'
  const faq: { q: string; a: string }[] = [
    {
      q: `Is ${entry.name} free to use?`,
      a: isPremium
        ? `${entry.name} is a Premium AI Canvas ${noun}. Premium unlocks the full source code, the full remix prompt, and one-command installs for every Premium component, block, and template.`
        : `Yes. ${entry.name} is part of the free AI Canvas library and is open source under the MIT license, so you can use it in personal and commercial projects.`,
    },
    {
      q: `How do I install ${entry.name}?`,
      a: isPremium
        ? `Premium unlocks one-command installs: run the shadcn CLI with your AI Canvas token, or connect the AI Canvas MCP server and ask your AI editor to install it for you. Premium also unlocks the full remix prompt in the Remix panel.`
        : `One command: npx shadcn@latest add ${SITE_URL}/r/${entry.slug}.json, free with a free AI Canvas account. Or connect the AI Canvas MCP server and ask your AI editor to install ${entry.name} for you. You can also copy the source straight from the Code tab, no account needed. It works in any React project with Tailwind CSS.`,
    },
    {
      q: `What is ${entry.name} built with?`,
      a:
        `${entry.name} is built with React and TypeScript` +
        (stacks.length > 0 ? `, using ${joinList(stacks)}.` : '.') +
        (entry.dualTheme ? ' It ships with both light and dark styling.' : ''),
    },
  ]
  if (entry.useCases && entry.useCases.length > 0) {
    // Chips are kept verbatim (not lowercased) so acronyms like SaaS, AI, UI,
    // and 3D survive intact in both the visible copy and the FAQPage JSON-LD.
    faq.push({
      q: `Where would I use ${entry.name}?`,
      a: `Common uses include ${joinList(entry.useCases)}. Like every AI Canvas ${noun}, it is self-contained and drops into any React project.`,
    })
  }
  if (Object.keys(entry.prompts).length > 0) {
    faq.push({
      q: `Can I remix ${entry.name} with AI?`,
      a: isPremium
        ? `Yes. Open "Remix with AI" on this page to read the setup and the constants ${entry.name} is built from. The engine, the markup and the notes on how it works are part of Premium. For the exact ${noun}, install it with the one-command CLI.`
        : `Yes. ${entry.name} ships with one comprehensive AI prompt written against the real source code. Open "Remix with AI" on this page to read and copy it into Claude, Cursor, ChatGPT, or any AI tool. Prompts are for remixing your own variation; for the exact component, install it with the one-command CLI.`,
    })
  }
  return faq
}

// Strip a full ComponentEntry down to a serializable ComponentMeta so it
// can be passed across the server → client boundary (PreviewComponent and
// code/prompts are not serializable).
function toMeta(c: (typeof COMPONENTS)[number]): ComponentMeta {
  return {
    slug: c.slug,
    name: c.name,
    description: c.description,
    tags: c.tags,
    image: c.image,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = COMPONENTS.find((c) => c.slug === slug)
  if (!entry) notFound()

  const { PreviewComponent } = entry

  // When the registry gate is enforcing (launch), source must NOT ship in the
  // page HTML — otherwise anyone reads it without a metered pull. The Code tab
  // then fetches it on demand from the gated endpoint. Until enforcement flips
  // on, source stays server-rendered (preserves SEO / GEO indexing).
  const enforcing = process.env.REGISTRY_ENFORCEMENT === 'enforce'

  // Account-gated install: when on, anonymous installs of FREE components are
  // walled behind a free account (the /r route returns a "create a free
  // account" placeholder). Reading the source stays public — only the
  // one-command install needs an account. Threaded to the client so the
  // install CTAs swap to a "create a free account" prompt for signed-out
  // visitors of free components.
  const freeAccountGate = process.env.FREE_ACCOUNT_GATE === 'on'

  // Premium content (closed source) must NEVER appear in the server-rendered
  // page payload — not the source, not the highlighted HTML, and not the
  // verbatim build blocks of the prompt — REGARDLESS of REGISTRY_ENFORCEMENT
  // (the default is permissive). Classify server-side and withhold for
  // premium; free content keeps today's behaviour (everything ships in
  // permissive mode for SEO). A degraded lookup (missing manifest) withholds
  // for everything, to fail closed rather than risk a leak.
  const lookup = loadContentLookup()
  const contentType = classifyContent(slug, lookup)
  const isPremium =
    lookup.degraded === true ||
    contentType === 'premium-standalone' ||
    contentType === 'design-system' ||
    contentType === 'template'
  const withholdSource = isPremium || enforcing

  // ── Prompt gate ──────────────────────────────────────────────────────────
  // Same predicate as the source gate, one seam later. A PREMIUM entry
  // (component OR block — `isPremium` covers both, block-ness is a label only)
  // ships blocks 1 Setup and 2 Constants of the prompt to everyone and
  // withholds EVERYTHING from block 3 State onward (the verbatim build spec
  // plus the prose that would otherwise sit below the wall) unless the viewer's
  // tier is 'premium'. The bytes are dropped HERE, server-side, and
  // never reach the client: this page renders per request because the root
  // layout reads cookies, so it can legitimately vary by viewer. FREE entries
  // are untouched — their whole prompt stays public, no account needed.
  const fullPrompt =
    entry.prompts['Claude Code'] ?? Object.values(entry.prompts).find((p): p is string => !!p)
  let promptLocked = false
  let prompts = entry.prompts
  if (isPremium && fullPrompt) {
    let viewerIsPremium = false
    try {
      viewerIsPremium = (await getSessionEntitlement()).tier === 'premium'
    } catch {
      // Entitlement read failed — fail CLOSED, exactly like /r does. Worst case
      // a subscriber sees the public prompt for one render, never the reverse.
    }
    if (!viewerIsPremium) {
      const split = splitPromptAtPaywall(fullPrompt)
      // No recognisable scaffold, so withhold the prompt whole, which hides
      // the Remix panel entirely. Deliberate: unredactable is not the
      // same as harmless. Add a fallback teaser only if a premium prompt ever
      // legitimately ships without the scaffold.
      prompts = split ? { 'Claude Code': split.head } : {}
      promptLocked = true
    }
  }

  // Extract only the install-directive comment lines so the deps/font install
  // UI works even when the full source is withheld in enforcing mode.
  const codeDirectives = [
    entry.code.match(/^\/\/ font: .+$/m)?.[0],
    entry.code.match(/^\/\/ font-pkg: .+$/m)?.[0],
    entry.code.match(/^\/\/ npm install .+$/m)?.[0],
  ].filter(Boolean).join('\n')

  // ── Related ──────────────────────────────────────────────────────────────
  // Pass the full pool of accent-tag siblings; the client paginates 3 at a
  // time via the inline arrow controls.
  const accentLabels = entry.tags
    .filter((t) => t.accent)
    .map((t) => t.label)
  const related = COMPONENTS.filter(
    (c) =>
      c.slug !== slug &&
      c.tags.some((t) => t.accent && accentLabels.includes(t.label)),
  ).map(toMeta)

  const url = `${SITE_URL}/components/${slug}`
  const firstSentence = firstSentenceOf(entry.description)
  const headingSubtitle = firstSentence

  const faq = buildFaq(entry, isPremium)
  // Collections this component belongs to — cross-links that give crawlers
  // (and people) a path between component pages and the collection pages.
  const collections = collectionsForComponent(toMeta(entry)).map((c) => ({
    slug: c.slug,
    title: c.h1,
  }))

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: entry.name,
    description: entry.description,
    // Premium components are NOT MIT and NOT in the public repo — never claim so.
    ...(isPremium ? {} : { codeRepository: GITHUB_URL }),
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'React',
    ...(isPremium ? {} : { license: 'https://opensource.org/licenses/MIT' }),
    url,
    ...(entry.image ? { image: entry.image } : {}),
    author: {
      '@type': 'Organization',
      name: 'AI Canvas',
      url: SITE_URL,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Components & Blocks', item: `${SITE_URL}/components` },
      { '@type': 'ListItem', position: 3, name: entry.name, item: url },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ComponentPageView
        slug={slug}
        propTables={STANDALONE_PROPS[slug] ?? []}
        name={entry.name}
        description={entry.description}
        headingSubtitle={headingSubtitle}
        tags={entry.tags}
        code={withholdSource ? undefined : entry.code}
        // Prompts: FREE entries ship the whole prompt (Remix is free, SEO). For a
        // PREMIUM entry and a non-premium viewer this is blocks 1 and 2 only —
        // block 3 onward was stripped above and is NOT in this payload. Do not
        // "restore" it to entry.prompts: that re-opens the leak this gate closes.
        prompts={prompts}
        promptLocked={promptLocked}
        dualTheme={entry.dualTheme ?? false}
        designSystem={entry.designSystem}
        premium={contentType === 'premium-standalone'}
        framedPreview={entry.staticPreview}
        isBlock={isBlockEntry(entry)}
        related={related}
        highlightedCode={withholdSource ? undefined : <HighlightedCode code={entry.code} />}
        enforcing={enforcing || isPremium}
        freeAccountGate={freeAccountGate}
        codeDirectives={codeDirectives}
        useCases={entry.useCases}
        about={entry.about}
        faq={faq}
        collections={collections}
      >
        <PreviewComponent />
      </ComponentPageView>
    </>
  )
}
