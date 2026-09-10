import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Flask } from '@phosphor-icons/react/dist/ssr'
import { SiteFooter } from '../components/SiteFooter'
import { optimizeImageKitUrl } from '../lib/imagekit'
import { IconCluster } from './_components/IconCluster'

// Hosted preview for the active 60K Particles card. ImageKit transforms
// give us a single asset that scales/format-converts at request time, the
// same way the homepage ComponentCards source their thumbnails.
const PARTICLES_THUMB =
  'https://ik.imagekit.io/aitoolkit/Website/aicanvas-lab.png'

// Outlined AI Canvas mark for placeholder thumbnails on planned tool cards.
// Same two subpaths as /public/ai-canvas-icon.svg (outer hex + inner slash)
// but stroked instead of filled, so the mark reads as a quiet line icon
// behind the dot grid.
function AiCanvasOutlineIcon({
  size = 44,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={(size * 24) / 28}
      viewBox="0 0 28 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.8513 0C20.5626 0 21.2204 0.377823 21.5788 0.992258L22.75 3L27.4122 10.9923C27.7754 11.615 27.7754 12.385 27.4122 13.0077L22.75 21L21.5788 23.0077C21.2204 23.6222 20.5626 24 19.8513 24H8.14874C7.43741 24 6.7796 23.6222 6.42118 23.0077L0.587849 13.0077C0.224593 12.385 0.224593 11.615 0.58785 10.9923L6.42118 0.992257C6.7796 0.377822 7.43741 0 8.14874 0H19.8513Z" />
      <path d="M4 12L9 21H18.25L13 12L18.25 3H9L4 12Z" />
    </svg>
  )
}

export const metadata: Metadata = {
  title: 'LAB — AI Canvas',
  description:
    'A workshop for things you want to keep. Make it yours, fine-tune, export as code, video, or image.',
  alternates: { canonical: 'https://aicanvas.me/lab' },
}

type Status = 'active' | 'planned' | 'live'

const TOOLS: Array<{
  slug: string
  name: string
  description: string
  status: Status
}> = [
  {
    slug: '60k-particles',
    name: '60K Particles',
    description:
      'Drop an SVG or PNG. Move your mouse to animate the scene. Export PNG • Export MP4 • Copy Code',
    status: 'active',
  },
  {
    slug: 'mesh-gradient',
    name: 'Mesh Gradient',
    description:
      'Sample dominant colours from any image and turn them into a soft, animated mesh-gradient background.',
    status: 'planned',
  },
  {
    slug: 'noise-field',
    name: 'Noise Field',
    description:
      'Procedural animated noise patterns in your own palette. Tuned for backgrounds, hero sections, and loading states.',
    status: 'planned',
  },
  {
    slug: 'glow-aura',
    name: 'Glow / Aura',
    description:
      'Wrap a logo or icon in a soft pulsing glow. Useful for hero marks, AI assistant avatars, status indicators.',
    status: 'planned',
  },
]

const STATUS_STYLES: Record<Status, string> = {
  active:
    'border-olive-500/30 bg-olive-500/10 text-olive-600 dark:text-olive-400',
  planned:
    'border-sand-300 bg-sand-200/60 text-sand-600 dark:border-sand-700 dark:bg-sand-800/60 dark:text-sand-400',
  live:
    'border-olive-500/30 bg-olive-500/15 text-olive-600 dark:text-olive-300',
}

// Display label for the status pill. Decoupled from the status key so we can
// say "WIP" without renaming the underlying state machine.
const STATUS_LABELS: Record<Status, string> = {
  active: 'Active',
  planned: 'WIP',
  live: 'Live',
}

export default function LabPage() {
  return (
    <main className="bg-sand-200 dark:bg-sand-950">
      <div className="mx-auto max-w-5xl px-4 pt-10 pb-12 sm:px-6 sm:pt-16">
        {/* ── Hero — icon cluster on the left, description on the right ──
            `isolate` creates a fresh stacking context for the header so the
            cluster's z-30 layer can sit above the description without leaking
            stacking changes to anything outside the hero. */}
        <header className="relative isolate mb-16 grid items-center gap-8 sm:mb-20 sm:grid-cols-2 sm:gap-12">
          <h1 className="relative z-30 mx-auto aspect-square w-full max-w-[240px] sm:max-w-[420px]">
            <span className="sr-only">LAB</span>
            {/* The cluster is absolutely positioned inside the h1 so its
                pointer-handler covers the square but flying icons can spill
                outside the h1's bounds (overflow defaults to visible). */}
            <div className="absolute inset-0">
              <IconCluster />
            </div>
          </h1>
          <div className="relative z-10">
            <p className="mb-3 inline-flex items-center gap-1.5 text-base font-semibold text-olive-500">
              <Flask weight="regular" size={18} />
              Lab
            </p>
            {/* Headline — matches the site's H1 spec (text-3xl sm:text-4xl,
                font-extrabold, tracking-tight). Kept as a <p> because the
                page's semantic <h1> already lives on the cluster wrapper
                above (with an sr-only "LAB" for screen readers). */}
            <p className="text-2xl font-extrabold leading-snug tracking-tight text-sand-900 dark:text-sand-50">
              Make it yours. Fine-tune. Export as code, video, or image.
            </p>
            {/* Subline — Body color split per system: sand-600 light,
                sand-400 dark (was sand-500 in both modes). */}
            <p className="mt-4 text-base leading-relaxed text-sand-600 dark:text-sand-400 sm:text-lg">
              LAB is a workshop for things you want to keep.
            </p>
          </div>
        </header>

        {/* ── Tools — 2×2 grid of horizontal row cards ── */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-sand-900 dark:text-sand-50">
            Tools
          </h2>

          <ul className="grid gap-4 sm:grid-cols-2">
            {TOOLS.map((tool) => {
              const isPlanned = tool.status === 'planned'
              const isActive = tool.status === 'active'
              // Active cards get an olive border at rest so the live tool
              // visually separates from the planned placeholders.
              const cardChromeClasses = isActive
                ? 'border-olive-500/40 hover:border-olive-500/60 dark:border-olive-400/40 dark:hover:border-olive-400/60'
                : 'border-sand-300 hover:border-sand-400 dark:border-sand-800 dark:hover:border-sand-700'
              const card = (
                <article className={`group flex h-full items-stretch overflow-hidden rounded-2xl border bg-sand-50 transition-all duration-200 hover:shadow-md dark:bg-sand-900 dark:hover:shadow-black/30 ${cardChromeClasses}`}>
                  {/* Thumbnail — flush to the card's top, bottom, and left
                      edges. The article's `overflow-hidden` + `rounded-2xl`
                      clip the thumbnail's left corners to follow the card's
                      curve, so the image sits edge-to-edge without any
                      visible padding gap. */}
                  <div className="relative aspect-square w-28 shrink-0 overflow-hidden bg-sand-950 sm:w-32">
                    {tool.slug === '60k-particles' ? (
                      // ImageKit-served thumbnail. Matches ComponentCard's
                      // pattern (plain <img> + optimizeImageKitUrl) so the
                      // homepage grid and the lab grid pull from the same
                      // resize/quality pipeline. Zooms on card hover; the
                      // thumbnail wrapper's `overflow-hidden` keeps the
                      // zoom clipped to the rounded square.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={optimizeImageKitUrl(PARTICLES_THUMB, 'card')}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-125"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                        }}
                      >
                        <AiCanvasOutlineIcon size={44} className="text-sand-700" />
                      </div>
                    )}
                  </div>

                  {/* Body — floats over the right edge of the thumbnail
                      with rounded left corners + leftward shadow. Same
                      "body over image" treatment as the standalone
                      ComponentCard, rotated 90° (left/right instead of
                      top/bottom). Type sizes match the standalone card
                      (16px title, 14px desc, 12px CTA). */}
                  <div className="relative -ml-4 flex flex-1 flex-col gap-1.5 rounded-l-2xl bg-sand-50 py-3.5 pl-7 pr-4 shadow-[-8px_0_24px_rgba(0,0,0,0.10)] dark:bg-sand-900 dark:shadow-[-8px_0_24px_rgba(0,0,0,0.25)] sm:py-4 sm:pl-8 sm:pr-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-sand-900 dark:text-sand-50">
                        {tool.name}
                      </h3>
                      <span
                        className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[tool.status]}`}
                      >
                        {STATUS_LABELS[tool.status]}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm font-normal text-sand-500 dark:text-sand-400">
                      {tool.description}
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-sand-600 transition-colors group-hover:text-sand-900 dark:text-sand-400 dark:group-hover:text-sand-100">
                        {isPlanned ? 'Coming soon' : 'Open tool'}
                        {!isPlanned && (
                          <ArrowRight
                            weight="regular"
                            size={14}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              )
              return (
                <li key={tool.slug}>
                  {isPlanned ? (
                    card
                  ) : (
                    <Link
                      href={`/lab/${tool.slug}`}
                      className="block h-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-olive-500 focus:ring-offset-2 focus:ring-offset-sand-200 dark:focus:ring-offset-sand-950"
                    >
                      {card}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <SiteFooter />
      </div>
    </main>
  )
}
