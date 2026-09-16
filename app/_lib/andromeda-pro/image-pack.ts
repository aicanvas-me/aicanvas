// The Andromeda Pro image pack: 18 astronaut concepts, each drawn once in dark
// and once in light with the same pose, crop and prop, so a pair swaps cleanly
// with a theme.
//
// The images are hosted on Cloudflare R2, never in this repo, and are free to
// download. The two files that explain how the set was made (the style bible
// and the QA manifest) are Pro and are served by
// /api/andromeda-pro/image-pack/[file] after an entitlement check.
//
// The default base is the bucket's public r2.dev address. Cloudflare
// rate-limits r2.dev, which is fine for a download page and not for heavy
// traffic; when the domain's DNS moves to Cloudflare, point this at a custom
// domain. NEXT_PUBLIC_IMAGE_PACK_BASE overrides it (a local folder server in
// development).
export const IMAGE_PACK_BASE =
  process.env.NEXT_PUBLIC_IMAGE_PACK_BASE ?? 'https://pub-image-pack.r2.dev/image-pack/v1'

export type ImagePackMode = 'dark' | 'light'

export type ImagePackConcept = {
  slug: string
  title: string
  alt: string
  // Full-size PNG bytes, shown next to each download link.
  bytes: Record<ImagePackMode, number>
}

export const IMAGE_PACK_ZIP = { file: 'andromeda-image-pack.zip', bytes: 395_223_118 }

// Every image passed all five checks in the QA manifest.
export const IMAGE_PACK_CHECKS = 5

export const IMAGE_PACK_PRO_FILES = [
  {
    file: 'style-bible.md',
    name: 'STYLE-BIBLE.md',
    description:
      'The rules every image follows: the character, rendering, palette, composition, both themes, what never appears, and how a dark image becomes its light pair. It ends with the steps to make your own set.',
  },
  {
    file: 'qa-manifest.json',
    name: 'qa-manifest.json',
    description:
      'One row per image with five checks: size, anatomy, pair alignment, artifacts and branding. An image ships only when all five pass.',
  },
] as const

export type ImagePackProFile = (typeof IMAGE_PACK_PRO_FILES)[number]['file']

export const IMAGE_PACK_CONCEPTS: ImagePackConcept[] = [
  { slug: '01-zero-g-dunk', title: 'Zero-G Dunk', alt: 'An astronaut leaps to dunk a small orange planet like a basketball', bytes: { dark: 7365463, light: 10803367 } },
  { slug: '02-planet-balance', title: 'Planet Balance', alt: 'An astronaut stands on tiptoe, holding a small orange planet overhead', bytes: { dark: 6784121, light: 9770548 } },
  { slug: '03-portal-step', title: 'Portal Step', alt: 'An astronaut steps through a glowing orange ring', bytes: { dark: 8388993, light: 10994266 } },
  { slug: '04-constellation-builder', title: 'Constellation Builder', alt: 'An astronaut joins stars into a constellation with one fingertip', bytes: { dark: 5106113, light: 9352479 } },
  { slug: '05-butterfly-visor', title: 'Butterfly Visor', alt: 'A white butterfly reflected in the black visor of an astronaut helmet', bytes: { dark: 12056339, light: 13040654 } },
  { slug: '06-earth-overlook', title: 'Earth Overlook', alt: 'An astronaut sits at a tall window, looking down at Earth', bytes: { dark: 10477045, light: 12421388 } },
  { slug: '07-lunar-gardener', title: 'Lunar Gardener', alt: 'An astronaut kneels on the Moon, tending a small green sprout', bytes: { dark: 10361265, light: 12406066 } },
  { slug: '08-floating-pages', title: 'Floating Pages', alt: 'An astronaut floats cross-legged, reading while loose pages drift around', bytes: { dark: 6981891, light: 9877112 } },
  { slug: '09-signal-listener', title: 'Signal Listener', alt: 'An astronaut holds a small dish toward a thin orange signal line', bytes: { dark: 5320116, light: 9229630 } },
  { slug: '10-cloud-surfer', title: 'Cloud Surfer', alt: 'An astronaut surfs a white board through towering storm clouds', bytes: { dark: 13681360, light: 14501297 } },
  { slug: '11-ring-snowboarder', title: 'Ring Snowboarder', alt: 'An astronaut snowboards down the ring of a planet', bytes: { dark: 18490259, light: 17741084 } },
  { slug: '12-planetary-reach', title: 'Planetary Reach', alt: 'An astronaut leaps upward to touch a large orange planet', bytes: { dark: 8769409, light: 9849719 } },
  { slug: '13-lunar-skater', title: 'Lunar Skater', alt: 'An astronaut rides a skateboard along a lunar ridge', bytes: { dark: 13040922, light: 14771985 } },
  { slug: '14-starlight-conductor', title: 'Starlight Conductor', alt: 'An astronaut conducts sweeping ribbons of blue and orange light', bytes: { dark: 8823613, light: 10335285 } },
  { slug: '15-mission-architect', title: 'Mission Architect', alt: 'An astronaut sits drawing in front of a large rocket blueprint', bytes: { dark: 15736154, light: 15354514 } },
  { slug: '16-orbital-painter', title: 'Orbital Painter', alt: 'An astronaut paints a wide orange arc across space', bytes: { dark: 8874843, light: 12169995 } },
  { slug: '17-precision-repair', title: 'Precision Repair', alt: 'An astronaut repairs a floating equipment module', bytes: { dark: 8328344, light: 10986124 } },
  { slug: '18-paper-plane-shadow', title: 'Paper Plane Shadow', alt: 'An astronaut launches a paper plane that casts the shadow of a jet', bytes: { dark: 11223592, light: 11807763 } },
]

export function imagePackUrl(path: string): string {
  return `${IMAGE_PACK_BASE}/${path}`
}

export function formatMegabytes(bytes: number): string {
  return `${Math.round(bytes / 1_000_000)} MB`
}
