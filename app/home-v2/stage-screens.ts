// The four runs the homepage v2 agent stage replays. Each one is a real
// Andromeda Pro template poster, revealed region by region while the agent
// transcript beside it reads the rules, installs, composes and checks.
//
// Coordinates are percentages of the stage canvas, which shows the poster's
// screen only: every poster frames its screen at (62, 62) of 1200 x 675 and
// lets it bleed off the right and bottom edges, so canvas x = (px - 62) / 1138
// and canvas y = (px - 62) / 613. Light and dark posters share one layout.
//
// Every pin quotes a rule from the Andromeda Pro brain (rules.md and its
// foundations), shortened, never invented. Check one there before rewording it.

export type StageRegion = { x: number; y: number; w: number; h: number; label: string }
export type StagePin = { x: number; y: number; rule: string; side: 'left' | 'right' | 'top' }

export type StageScreen = {
  slug: string
  tab: string
  path: string
  prompt: string
  /** One line from the brain, shown under "Read the rules". */
  quote: string
  components: string[]
  regions: StageRegion[]
  pins: StagePin[]
}

export const STAGE_SCREENS: StageScreen[] = [
  {
    slug: 'andromeda-pro-mission-control',
    tab: 'Dashboard',
    path: '/dashboard',
    prompt: 'Build a mission control dashboard for our satellite fleet.',
    quote: 'Color is reserved for measurement and primary action, never decoration.',
    components: ['Sidebar', 'Nav Item', 'Panel Header', 'Stat Tile', 'Planet', 'Button'],
    regions: [
      { x: 1.1, y: 2.1, w: 14.7, h: 97.9, label: 'Sidebar' },
      { x: 17, y: 2.1, w: 83, h: 7, label: 'PanelHeader' },
      { x: 17, y: 11.1, w: 83, h: 16, label: 'StatTile ×4' },
      { x: 17, y: 29.4, w: 83, h: 56.7, label: 'Card · Planet' },
      { x: 17, y: 88.4, w: 83, h: 11.6, label: 'Card' },
    ],
    pins: [
      { x: 15.4, y: 13.9, rule: 'Active nav: a trailing line, no fill', side: 'right' },
      { x: 18.4, y: 24.8, rule: 'Color only on measurements', side: 'right' },
      { x: 61.1, y: 81.7, rule: 'One primary action per region', side: 'left' },
    ],
  },
  {
    slug: 'andromeda-pro-sign-in',
    tab: 'Sign in',
    path: '/sign-in',
    prompt: 'Add a sign in page with Google and Apple.',
    quote: 'Primary action: one per region, in the brand fill.',
    components: ['Input', 'Button', 'Corner Markers', 'Media Card', 'Section Heading'],
    regions: [
      { x: 14.1, y: 22.8, w: 25.3, h: 13.6, label: 'Heading' },
      { x: 14.1, y: 39.6, w: 25.3, h: 16.7, label: 'Input ×2' },
      { x: 14.1, y: 59.2, w: 25.3, h: 3.9, label: 'Button' },
      { x: 14.1, y: 70.6, w: 25.3, h: 9, label: 'Button · outline' },
      { x: 63, y: 27.1, w: 31.6, h: 36.7, label: 'MediaCard' },
      { x: 55.4, y: 89.4, w: 23, h: 7.3, label: 'SectionHeading' },
    ],
    pins: [
      { x: 20.8, y: 31, rule: 'Titles never take color', side: 'right' },
      { x: 39.4, y: 61.2, rule: 'One primary action per region', side: 'right' },
      { x: 66.4, y: 89.4, rule: 'Both themes from one token set', side: 'top' },
    ],
  },
  {
    slug: 'andromeda-pro-ai-chat',
    tab: 'AI chat',
    path: '/chat',
    prompt: 'Make the home screen for our sales agent.',
    quote: 'Navigation: NavItem, with a 2px trailing-edge line for active.',
    components: ['Sidebar', 'Nav Item', 'Top Bar', 'Search Field', 'Cube', 'Suggestion', 'Prompt Input'],
    regions: [
      { x: 1.1, y: 2.1, w: 14.7, h: 97.9, label: 'Sidebar' },
      { x: 17, y: 2.1, w: 83, h: 7, label: 'TopBar · SearchField' },
      { x: 56, y: 32.5, w: 9.5, h: 16, label: 'Cube' },
      { x: 43.5, y: 53, w: 34.5, h: 9, label: 'SectionHeading' },
      { x: 41.5, y: 64, w: 38.5, h: 4.2, label: 'Suggestion ×4' },
      { x: 29, y: 70.1, w: 63.3, h: 11.1, label: 'PromptInput' },
      { x: 29, y: 83.8, w: 63.3, h: 5.3, label: 'Collapsible' },
    ],
    pins: [
      { x: 15.4, y: 13, rule: 'Active nav: a trailing line, no fill', side: 'right' },
      { x: 91.6, y: 5.7, rule: 'Color means live, never decoration', side: 'left' },
      { x: 60.6, y: 53, rule: 'Titles never take color', side: 'top' },
    ],
  },
  {
    slug: 'andromeda-pro-fintech-landing',
    tab: 'Landing page',
    path: '/',
    prompt: 'Design a landing page for our banking app.',
    quote: 'Page titles, section titles and card titles never take color.',
    components: ['Navbar', 'Badge', 'Section Heading', 'Button', 'Media Card', 'Stat Tile'],
    regions: [
      { x: 0, y: 0, w: 100, h: 7.5, label: 'Navbar' },
      { x: 46.2, y: 15.2, w: 13.1, h: 3.6, label: 'Badge' },
      { x: 32.5, y: 21.7, w: 40.4, h: 25.6, label: 'SectionHeading' },
      { x: 41.3, y: 50.9, w: 22.9, h: 5.1, label: 'Button ×2' },
      { x: 14.3, y: 64.9, w: 29.5, h: 35.1, label: 'MediaCard' },
      { x: 44.9, y: 64.9, w: 46.3, h: 35.1, label: 'Sidebar · StatTile' },
    ],
    pins: [
      { x: 72.9, y: 27, rule: 'Titles never take color', side: 'right' },
      { x: 41.3, y: 53.4, rule: 'One primary action per region', side: 'left' },
      { x: 69.6, y: 96, rule: 'Color only on measurements', side: 'top' },
    ],
  },
]
