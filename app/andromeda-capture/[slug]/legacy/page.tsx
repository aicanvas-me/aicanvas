// Hero capture route (not user-facing): one Andromeda Legacy pose, alone and
// centered, on the themed ground. Size comes from the screenshot script's
// device scale factor, so portalled bubbles scale with the component.
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { LegacyHeroFrame } from './LegacyHeroFrame'

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
