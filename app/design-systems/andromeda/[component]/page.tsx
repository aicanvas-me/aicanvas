import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  ANDROMEDA_COMPONENTS,
  getAndromedaComponent,
} from '../../../_lib/andromeda/andromeda-registry'
import { ANDROMEDA_PROPS } from '../../../lib/andromeda-props.generated'
import { AndromedaComponentView } from './AndromedaComponentView'

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
    title: `${entry.name} · Andromeda Design System`,
    description: entry.description,
    alternates: { canonical: `/design-systems/andromeda/${entry.slug}` },
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

  const related = ANDROMEDA_COMPONENTS.filter((c) => c.slug !== entry.slug).map(
    (c) => ({ slug: c.slug, name: c.name, image: c.image }),
  )

  // Prop tables parsed from the component's @typedef JSDoc at build time, keyed
  // by source-file basename (Button.tsx → "Button"). Empty when the component
  // ships no @typedef block (2 of 33 today) — the view hides the section.
  const propTables = ANDROMEDA_PROPS[entry.sourceFile.replace(/\.tsx?$/, '')] ?? []

  // Account-gated install: when on, a signed-out visitor of this FREE
  // design-system component sees a "create a free account to install" CTA
  // instead of the runnable command. Reading the source (Code tab) stays
  // public either way. Threaded to the client so the install CTAs swap.
  const freeAccountGate = process.env.FREE_ACCOUNT_GATE === 'on'

  // Source is NOT shipped in this page's HTML — the Code tab fetches it on
  // demand from the gated /api/component-code endpoint, so access is decided
  // per user, never by a build-time flag.
  return (
    <AndromedaComponentView
      slug={entry.slug}
      name={entry.name}
      description={entry.description}
      related={related}
      propTables={propTables}
      freeAccountGate={freeAccountGate}
    />
  )
}
