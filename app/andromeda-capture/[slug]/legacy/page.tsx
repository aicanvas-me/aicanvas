// Hero capture route (not user-facing): one Andromeda Legacy pose, alone and
// centered, on the themed ground. Size comes from the screenshot script's
// device scale factor, so portalled bubbles scale with the component.
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ANDROMEDA_COMPONENT_META } from '../../../_lib/andromeda/andromeda-meta'
import { LegacyHeroFrame } from './LegacyHeroFrame'

export function generateStaticParams() {
  return ANDROMEDA_COMPONENT_META.map((c) => ({ slug: c.slug }))
}

export default async function AndromedaLegacyHeroCapturePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <Suspense>
      <LegacyHeroFrame slug={slug} />
    </Suspense>
  )
}
