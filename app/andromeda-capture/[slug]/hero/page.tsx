// Hero capture route (not user-facing): one Andromeda Pro pose, alone and
// centered, on the themed ground. Size comes from the screenshot script's
// device scale factor, so portalled bubbles scale with the component.
import { notFound } from 'next/navigation'
import { HeroFrame } from './HeroFrame'

export default async function AndromedaHeroCapturePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (process.env.NODE_ENV === 'production') notFound()
  return <HeroFrame slug={slug} />
}
