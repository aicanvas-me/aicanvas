// Screenshot-capture utility route (not user-facing) for Andromeda PRO.
// Renders a single Pro demo fit-scaled inside a 1280×720 void frame so the
// screenshot
// script (scripts/screenshot-andromeda.mjs) can grab uniform 16:9 card art
// for the design-system overview. Lives at the app root so it escapes the
// Andromeda layout's sidebar + topbar chrome.
import { notFound } from 'next/navigation'
import { ANDROMEDA_COMPONENT_META } from '../../_lib/andromeda-pro/andromeda-meta'
import { CaptureFrame } from './CaptureFrame'

export function generateStaticParams() {
  return ANDROMEDA_COMPONENT_META.map((c) => ({ slug: c.slug }))
}

export default async function AndromedaCapturePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // Dev-only screenshot helper — never expose the bare capture frame in prod.
  if (process.env.NODE_ENV === 'production') notFound()
  return <CaptureFrame slug={slug} />
}
