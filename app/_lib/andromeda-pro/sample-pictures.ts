// Sample pictures for the Andromeda Pro component previews: astronaut portraits
// and covers, each drawn once for dark and once for light with the same pose
// and crop. A preview passes the dark file as `src` / `image` and the light file
// as `lightSrc` / `lightImage`, and the component shows the one that matches the
// Andromeda theme. The installed examples carry the same links, so a fresh
// install opens on the pictures these pages show.
//
// Hosted on Cloudflare R2 under a versioned prefix whose files are never
// replaced, so a link keeps working for everyone who installed it.
const SAMPLES_BASE = 'https://pub-110c83a6ed20459da515832c8bdb50c7.r2.dev/samples/v1'

const pair = (name: string) => ({
  dark: `${SAMPLES_BASE}/${name}-dark.webp`,
  light: `${SAMPLES_BASE}/${name}-light.webp`,
})

/** Square portraits, 160px, for Avatar, UserCard and UserMenu. */
export const SAMPLE_AVATARS = {
  butterflyVisor: pair('avatar-butterfly-visor'),
  cloudSurfer: pair('avatar-cloud-surfer'),
}

/** 16:10 covers, 960px wide, for MediaCard. */
export const SAMPLE_COVERS = {
  starlightConductor: pair('cover-starlight-conductor'),
  earthOverlook: pair('cover-earth-overlook'),
  lunarGardener: pair('cover-lunar-gardener'),
}
