// The Andromeda Pro image pack: 18 astronaut concepts in light and dark, free to
// download, plus the two Pro files that explain how the set stays consistent.
// Site chrome (sand/olive, Manrope) like the components index: no Andromeda
// component renders here.
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr'
import { SiteFooter } from '../../../components/SiteFooter'
import { buttonClasses } from '../../../components/buttonClasses'
import {
  IMAGE_PACK_CHECKS,
  IMAGE_PACK_CONCEPTS,
  IMAGE_PACK_ZIP,
  formatMegabytes,
  imagePackUrl,
  type ImagePackConcept,
  type ImagePackMode,
} from '../../../_lib/andromeda-pro/image-pack'
import { ImagePackProFiles } from './ImagePackProFiles'

export const metadata = {
  title: 'Image Pack · Andromeda Pro',
  description:
    '18 astronaut illustrations, each in a light and a dark version with the same pose and crop, free to download at 4096 × 5120. Pro members also get the style bible and QA manifest behind the set.',
  alternates: { canonical: '/design-systems/andromeda-pro/image-pack' },
}

const RECIPE = [
  {
    title: 'Change the character',
    body: 'Rewrite the character section of STYLE-BIBLE.md: body, materials, one accent colour, and what never appears on it.',
  },
  {
    title: 'Keep the method',
    body: 'Leave the exclusions and the pair workflow as they are. They are what keeps every image consistent.',
  },
  {
    title: 'Generate and check',
    body: 'Give both files to your image agent, one concept per request. Make the dark image first, edit it into light, and log each image in the manifest.',
  },
]

export default function ImagePackPage() {
  const imageCount = IMAGE_PACK_CONCEPTS.length * 2

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16 sm:px-6 sm:pt-14">
        <header className="border-b border-sand-300 pb-10 dark:border-sand-800">
          <p className="text-xxs font-semibold uppercase tracking-[0.18em] text-olive-600 dark:text-olive-400">
            Andromeda Pro · Image pack
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-tight text-sand-900 dark:text-sand-50 sm:text-5xl lg:text-6xl">
            {IMAGE_PACK_CONCEPTS.length} astronauts.
            <br />
            Each in light and dark.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-sand-600 dark:text-sand-400">
            One character in {IMAGE_PACK_CONCEPTS.length} scenes, each drawn twice with the same pose,
            crop and prop, so an image follows your theme without moving. Free to download.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
            <a
              href={imagePackUrl(IMAGE_PACK_ZIP.file)}
              download
              className={buttonClasses({ variant: 'primary', size: 'lg' })}
            >
              <DownloadSimple weight="regular" size={16} />
              Download all {imageCount} images
            </a>
            <span className="text-xs font-semibold text-sand-600 dark:text-sand-400">
              ZIP · {formatMegabytes(IMAGE_PACK_ZIP.bytes)}
            </span>
          </div>

          <p className="mt-5 text-xxs font-semibold uppercase tracking-[0.1em] text-sand-600 dark:text-sand-400">
            {IMAGE_PACK_CONCEPTS.length} concepts · {imageCount} PNG images · 4096 × 5120 · every image
            passed {IMAGE_PACK_CHECKS} checks
          </p>
        </header>

        <section className="mt-12" aria-labelledby="image-pack-images">
          <h2 id="image-pack-images" className="text-lg font-bold text-sand-900 dark:text-sand-50">
            The images
          </h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {IMAGE_PACK_CONCEPTS.map((concept) => (
              <ConceptCard key={concept.slug} concept={concept} />
            ))}
          </div>
        </section>

        <section className="mt-16" aria-labelledby="image-pack-consistency">
          <h2 id="image-pack-consistency" className="text-lg font-bold text-sand-900 dark:text-sand-50">
            How the set stays consistent
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sand-600 dark:text-sand-400">
            Every image was generated against one written style bible and checked against one manifest.
            Pro members can download both and use them to make a set of their own.
          </p>
          <ImagePackProFiles />
        </section>

        <section className="mt-16" aria-labelledby="image-pack-recipe">
          <h2 id="image-pack-recipe" className="text-lg font-bold text-sand-900 dark:text-sand-50">
            Make your own set
          </h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            {RECIPE.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-sand-300 bg-sand-100 p-4 dark:border-sand-800 dark:bg-sand-900"
              >
                <span className="text-xs font-semibold tabular-nums text-sand-600 dark:text-sand-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 text-base font-bold text-sand-900 dark:text-sand-50">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-sand-600 dark:text-sand-400">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
        <SiteFooter />
      </div>
    </>
  )
}

function ConceptCard({ concept }: { concept: ImagePackConcept }) {
  const [number] = concept.slug.split('-')
  return (
    <article className="rounded-2xl border border-sand-300 bg-sand-100 p-3 dark:border-sand-800 dark:bg-sand-900">
      <div className="grid grid-cols-2 gap-2">
        {(['dark', 'light'] as const).map((mode) => (
          <ImageVersion key={mode} concept={concept} mode={mode} />
        ))}
      </div>
      <h3 className="mt-3 flex items-baseline gap-2 px-1 text-base font-bold text-sand-900 dark:text-sand-50">
        <span className="text-xs font-semibold tabular-nums text-sand-600 dark:text-sand-400">{number}</span>
        {concept.title}
      </h3>
    </article>
  )
}

function ImageVersion({ concept, mode }: { concept: ImagePackConcept; mode: ImagePackMode }) {
  const label = mode === 'dark' ? 'Dark' : 'Light'
  return (
    <figure className="min-w-0">
      {/* A plain img: the previews are already sized WebP on R2, so there is
          nothing for an image optimizer to do. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagePackUrl(`${concept.slug}-${mode}.webp`)}
        alt={`${concept.alt}, ${mode} version`}
        width={960}
        height={1200}
        loading="lazy"
        decoding="async"
        className="aspect-[4/5] w-full rounded-xl bg-sand-200 object-cover dark:bg-sand-800"
      />
      <figcaption className="mt-2 flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-semibold text-sand-700 dark:text-sand-300">{label}</span>
        <a
          href={imagePackUrl(`${concept.slug}-${mode}.png`)}
          download
          aria-label={`Download ${concept.title}, ${mode} version, PNG`}
          className={buttonClasses({ variant: 'link', size: 'xs' })}
        >
          <DownloadSimple weight="regular" size={14} />
          PNG · {formatMegabytes(concept.bytes[mode])}
        </a>
      </figcaption>
    </figure>
  )
}
