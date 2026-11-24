// One base for every film and poster, so moving the files is a one-line change.
export const SKILLS_MEDIA_BASE = '/skills/whoosh'

const at = (file: string) => `${SKILLS_MEDIA_BASE}/${file}`

export const HERO_FILM = {
  desktop: at('reel-1080.mp4'),
  mobile: at('reel-720.mp4'),
  poster: at('reel-poster.webp'),
}

export const TILE_FILMS = [
  { id: 'physics', src: at('physics-540.mp4'), poster: at('physics-poster.webp'), label: 'Physics · reel · 16:9', tall: false },
  { id: 'relay', src: at('relay-540.mp4'), poster: at('relay-poster.webp'), label: 'Relay · product demo · 16:9', tall: false },
  { id: 'lull', src: at('lull-540.mp4'), poster: at('lull-poster.webp'), label: 'Lull · ad · 9:16', tall: true },
] as const
