// One base for every film and poster on R2; v1 is immutable, a changed file means a v2 prefix.
export const SKILLS_MEDIA_BASE = 'https://pub-110c83a6ed20459da515832c8bdb50c7.r2.dev/skills/whoosh/v1'

const at = (file: string) => `${SKILLS_MEDIA_BASE}/${file}`

export const HERO_FILM = {
  desktop: at('showreel-1080.mp4'),
  mobile: at('showreel-540.mp4'),
  poster: at('showreel-poster.jpg'),
}

const tile = (id: string, label: string, tall = false) => ({
  id,
  src: at(`${id}-540.mp4`),
  poster: at(`${id}-poster.jpg`),
  label,
  tall,
})

// The films that ship inside the skill, in page order. `tall` is the one 9:16 film.
export const TILE_FILMS = [
  tile('product-launch', 'Product launch'),
  tile('product-overview', 'Product overview'),
  tile('feature-tour', 'Feature tour'),
  tile('app-demo', 'App demo'),
  tile('mobile-app-ad', 'Mobile app ad', true),
  tile('showreel', 'Showreel'),
  tile('camera-moves', 'Camera moves'),
  tile('motion-showcase', 'Motion showcase'),
]
