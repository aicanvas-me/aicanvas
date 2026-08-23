import type { ComponentType } from 'react'
import type { Tag, Platform } from '../components/ComponentCard'
import { COMPONENT_COPY, ACCURATE_STACKS } from './component-copy'
import type { DesignSystemSlug } from './design-system-meta'
import FloatingCards from '../../components-workspace/floating-cards'
import { prompts as floatingCardsPrompts } from '../../components-workspace/floating-cards/prompts'
import TextBlurReveal from '../../components-workspace/text-blur-reveal'
import { prompts as textBlurRevealPrompts } from '../../components-workspace/text-blur-reveal/prompts'
import ParticleSphere from '../../components-workspace/particle-sphere'
import PolaroidStack from '../../components-workspace/polaroid-stack'
import { prompts as polaroidStackPrompts } from '../../components-workspace/polaroid-stack/prompts'
import GlitchButton from '../../components-workspace/glitch-button'
import { prompts as glitchButtonPrompts } from '../../components-workspace/glitch-button/prompts'
import FlipCalendar from '../../components-workspace/flip-calendar'
import { prompts as flipCalendarPrompts } from '../../components-workspace/flip-calendar/prompts'
import RunwayLoader from '../../components-workspace/runway-loader'
import { prompts as runwayLoaderPrompts } from '../../components-workspace/runway-loader/prompts'
import ChargingWidget from '../../components-workspace/charging-widget'
import { prompts as chargingWidgetPrompts } from '../../components-workspace/charging-widget/prompts'
import InteractiveDotGrid from '../../components-workspace/dot-grid'
import { prompts as dotGridPrompts } from '../../components-workspace/dot-grid/prompts'
import RadialToolbar from '../../components-workspace/radial-toolbar'
import { prompts as radialToolbarPrompts } from '../../components-workspace/radial-toolbar/prompts'
import XGrid from '../../components-workspace/x-grid'
import { prompts as xGridPrompts } from '../../components-workspace/x-grid/prompts'
import BlindPullToggle from '../../components-workspace/blind-pull-toggle'
import { prompts as blindPullTogglePrompts } from '../../components-workspace/blind-pull-toggle/prompts'
import PillToggle from '../../components-workspace/pill-toggle'
import { prompts as pillTogglePrompts } from '../../components-workspace/pill-toggle/prompts'
import MarkToggle from '../../components-workspace/mark-toggle'
import { prompts as markTogglePrompts } from '../../components-workspace/mark-toggle/prompts'
import TagaToggle from '../../components-workspace/taga-toggle'
import { prompts as tagaTogglePrompts } from '../../components-workspace/taga-toggle/prompts'
import NoiseBg from '../../components-workspace/noise-bg'
import { prompts as noiseBgPrompts } from '../../components-workspace/noise-bg/prompts'
import BubbleField from '../../components-workspace/bubble-field'
import { prompts as bubbleFieldPrompts } from '../../components-workspace/bubble-field/prompts'
import GridLines from '../../components-workspace/grid-lines'
import { prompts as gridLinesPrompts } from '../../components-workspace/grid-lines/prompts'
import DistortionGrid from '../../components-workspace/distortion-grid'
import { prompts as distortionGridPrompts } from '../../components-workspace/distortion-grid/prompts'
import WaveLines from '../../components-workspace/wave-lines'
import { prompts as waveLinesPrompts } from '../../components-workspace/wave-lines/prompts'
import SphereLines from '../../components-workspace/sphere-lines'
import { prompts as sphereLinesPrompts } from '../../components-workspace/sphere-lines/prompts'
import MagneticDots from '../../components-workspace/magnetic-dots'
import { prompts as magneticDotsPrompts } from '../../components-workspace/magnetic-dots/prompts'
import MagneticLogoCluster from '../../components-workspace/magnetic-logo-cluster'
import { prompts as magneticLogoClusterPrompts } from '../../components-workspace/magnetic-logo-cluster/prompts'
import ParticleConstellation from '../../components-workspace/particle-constellation'
import { prompts as particleConstellationPrompts } from '../../components-workspace/particle-constellation/prompts'
import ScrambleText from '../../components-workspace/scramble-text'
import { prompts as scrambleTextPrompts } from '../../components-workspace/scramble-text/prompts'
import NeonClock from '../../components-workspace/neon-clock'
import { prompts as neonClockPrompts } from '../../components-workspace/neon-clock/prompts'
import NoiseField from '../../components-workspace/noise-field'
import { prompts as noiseFieldPrompts } from '../../components-workspace/noise-field/prompts'
import EmojiBurst from '../../components-workspace/emoji-burst'
import { prompts as emojiBurstPrompts } from '../../components-workspace/emoji-burst/prompts'
import GlassNavbar from '../../components-workspace/glass-navbar'
import { prompts as glassNavbarPrompts } from '../../components-workspace/glass-navbar/prompts'
import GlassTabBar from '../../components-workspace/glass-tab-bar'
import { prompts as glassTabBarPrompts } from '../../components-workspace/glass-tab-bar/prompts'
import GlassTags from '../../components-workspace/glass-tags'
import { prompts as glassTagsPrompts } from '../../components-workspace/glass-tags/prompts'
import GlassCard from '../../components-workspace/glass-card'
import { prompts as glassCardPrompts } from '../../components-workspace/glass-card/prompts'
import GlassModal from '../../components-workspace/glass-modal'
import { prompts as glassModalPrompts } from '../../components-workspace/glass-modal/prompts'
import GlassDock from '../../components-workspace/glass-dock'
import { prompts as glassDockPrompts } from '../../components-workspace/glass-dock/prompts'
import GlassSlider from '../../components-workspace/glass-slider'
import { prompts as glassSliderPrompts } from '../../components-workspace/glass-slider/prompts'
import GlassToggle from '../../components-workspace/glass-toggle'
import { prompts as glassTogglePrompts } from '../../components-workspace/glass-toggle/prompts'
import GlassMusicPlayer from '../../components-workspace/glass-music-player'
import { prompts as glassMusicPlayerPrompts } from '../../components-workspace/glass-music-player/prompts'
import GlassNotification from '../../components-workspace/glass-notification'
import { prompts as glassNotificationPrompts } from '../../components-workspace/glass-notification/prompts'
import GlassSidebar from '../../components-workspace/glass-sidebar'
import { prompts as glassSidebarPrompts } from '../../components-workspace/glass-sidebar/prompts'
import GlassUserMenu from '../../components-workspace/glass-user-menu'
import { prompts as glassUserMenuPrompts } from '../../components-workspace/glass-user-menu/prompts'
import GlassToast from '../../components-workspace/glass-toast'
import { prompts as glassToastPrompts } from '../../components-workspace/glass-toast/prompts'
import GlassSearchBar from '../../components-workspace/glass-search-bar'
import { prompts as glassSearchBarPrompts } from '../../components-workspace/glass-search-bar/prompts'
import GlassStepper from '../../components-workspace/glass-stepper'
import { prompts as glassStepperPrompts } from '../../components-workspace/glass-stepper/prompts'
import GlassProgress from '../../components-workspace/glass-progress'
import { prompts as glassProgressPrompts } from '../../components-workspace/glass-progress/prompts'
import GlassAiCompose from '../../components-workspace/glass-ai-compose'
import { prompts as glassAiComposePrompts } from '../../components-workspace/glass-ai-compose/prompts'
import AndromedaButton from '../../components-workspace/andromeda-button'
import { prompts as andromedaButtonPrompts } from '../../components-workspace/andromeda-button/prompts'
import AvatarPicker from '../../components-workspace/avatar-picker'
import { prompts as avatarPickerPrompts } from '../../components-workspace/avatar-picker/prompts'
import TaskCards from '../../components-workspace/task-cards'
import { prompts as taskCardsPrompts } from '../../components-workspace/task-cards/prompts'
import SlideDeck from '../../components-workspace/slide-deck'
import { prompts as slideDeckPrompts } from '../../components-workspace/slide-deck/prompts'
import LabelCards from '../../components-workspace/label-cards'
import { prompts as labelCardsPrompts } from '../../components-workspace/label-cards/prompts'
import AiJobCards from '../../components-workspace/ai-job-cards'
import { prompts as aiJobCardsPrompts } from '../../components-workspace/ai-job-cards/prompts'
import DangerStripes from '../../components-workspace/danger-stripes'
import { prompts as dangerStripesPrompts } from '../../components-workspace/danger-stripes/prompts'
import StickerWall from '../../components-workspace/sticker-wall'
import { prompts as stickerWallPrompts } from '../../components-workspace/sticker-wall/prompts'
import PeelCornerReveal from '../../components-workspace/peel-corner-reveal'
import { prompts as peelCornerRevealPrompts } from '../../components-workspace/peel-corner-reveal/prompts'
import JarOfEmotions from '../../components-workspace/jar-of-emotions'
import { prompts as jarOfEmotionsPrompts } from '../../components-workspace/jar-of-emotions/prompts'
import ResponsiveLetters from '../../components-workspace/responsive-letters'
import { prompts as responsiveLettersPrompts } from '../../components-workspace/responsive-letters/prompts'
import GoodVibes from '../../components-workspace/good-vibes'
import { prompts as goodVibesPrompts } from '../../components-workspace/good-vibes/prompts'
import Playful from '../../components-workspace/playful'
import { prompts as playfulPrompts } from '../../components-workspace/playful/prompts'
import WildMorph from '../../components-workspace/wild-morph'
import { prompts as wildMorphPrompts } from '../../components-workspace/wild-morph/prompts'
import Orbit from '../../components-workspace/orbit'
import { prompts as orbitPrompts } from '../../components-workspace/orbit/prompts'
import HaloType from '../../components-workspace/halo-type'
import { prompts as haloTypePrompts } from '../../components-workspace/halo-type/prompts'
import SliceType from '../../components-workspace/slice-type'
import { prompts as sliceTypePrompts } from '../../components-workspace/slice-type/prompts'
import StackTower from '../../components-workspace/stack-tower'
import { prompts as stackTowerPrompts } from '../../components-workspace/stack-tower/prompts'
import RippleType from '../../components-workspace/ripple-type'
import { prompts as rippleTypePrompts } from '../../components-workspace/ripple-type/prompts'
import RadialCards from '../../components-workspace/radial-cards'
import { prompts as radialCardsPrompts } from '../../components-workspace/radial-cards/prompts'
import NewProjectModal from '../../components-workspace/new-project-modal'
import { prompts as newProjectModalPrompts } from '../../components-workspace/new-project-modal/prompts'
import VoiceChatPill from '../../components-workspace/voice-chat-pill'
import { prompts as voiceChatPillPrompts } from '../../components-workspace/voice-chat-pill/prompts'
import UploadProgress from '../../components-workspace/upload-progress'
import { prompts as uploadProgressPrompts } from '../../components-workspace/upload-progress/prompts'
import SignaturePad from '../../components-workspace/signature-pad'
import { prompts as signaturePadPrompts } from '../../components-workspace/signature-pad/prompts'
import CuriousAi from '../../components-workspace/curious-ai'
import { prompts as curiousAiPrompts } from '../../components-workspace/curious-ai/prompts'
import CubeCarousel from '../../components-workspace/cube-carousel'
import { prompts as cubeCarouselPrompts } from '../../components-workspace/cube-carousel/prompts'
import TiltedCoverflow from '../../components-workspace/tilted-coverflow'
import { prompts as tiltedCoverflowPrompts } from '../../components-workspace/tilted-coverflow/prompts'
import InteractiveCardStack from '../../components-workspace/interactive-card-stack'
import { prompts as interactiveCardStackPrompts } from '../../components-workspace/interactive-card-stack/prompts'
import ProductCardDeck from '../../components-workspace/product-card-deck'
import { prompts as productCardDeckPrompts } from '../../components-workspace/product-card-deck/prompts'
import CryptoSwap from '../../components-workspace/crypto-swap'
import { prompts as cryptoSwapPrompts } from '../../components-workspace/crypto-swap/prompts'
import MoodTracker from '../../components-workspace/mood-tracker'
import { prompts as moodTrackerPrompts } from '../../components-workspace/mood-tracker/prompts'
import ExpandingTabs from '../../components-workspace/expanding-tabs'
import { prompts as expandingTabsPrompts } from '../../components-workspace/expanding-tabs/prompts'
import DeleteButton from '../../components-workspace/delete-button'
import { prompts as deleteButtonPrompts } from '../../components-workspace/delete-button/prompts'
import ScrollWipeGallery from '../../components-workspace/scroll-wipe-gallery'
import { prompts as scrollWipeGalleryPrompts } from '../../components-workspace/scroll-wipe-gallery/prompts'
import DiamondGrid from '../../components-workspace/diamond-grid'
import { prompts as diamondGridPrompts } from '../../components-workspace/diamond-grid/prompts'
import { componentCodes } from './component-codes.generated'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComponentEntry {
  slug: string
  name: string
  description: string
  tags: Tag[]
  image?: string
  badge?: string
  dualTheme?: boolean
  // Opt-in for section-scale blocks that a preview box cannot fit: the detail
  // page loads this component's own /preview route in an iframe pinned to a
  // desktop viewport and scales it down, rather than mounting it inline where
  // it would squeeze to min-content. Off by default (inline live preview).
  // The name is historical — this used to serve `image` as a still — and is
  // kept only because renaming it means shipping the public repo and the vault
  // in lockstep. `image` is still the grid card and OG shot for every entry.
  staticPreview?: boolean
  // Label-only: shows "Premium block" instead of "Premium component" on the
  // detail page. Does not change `badge` (other surfaces key off badge ===
  // 'Premium' for real classification logic) or the grid/registry treatment —
  // blocks and components still share one grid (see project_components_blocks_unified).
  // Comes from premium meta.json. Free blocks carry only the Blocks category
  // tag, so read block-ness through isBlockEntry(), never this field directly.
  isBlock?: boolean
  // When set, this component is part of a design system. Drives the
  // "Part of <system>" affordance on the per-component page and the
  // tier toggle in the install drawer.
  designSystem?: DesignSystemSlug
  PreviewComponent: ComponentType
  code: string
  prompts: Partial<Record<Platform, string>>
  // Long-form copy + use-case chips for the per-component page. Lives in
  // app/lib/component-copy.ts and is merged in at the bottom of this file.
  useCases?: string[]
  about?: string
}

// One source of truth for "is this a block", because there are two signals and
// they don't overlap: premium blocks set isBlock in their meta.json, free blocks
// only carry the Blocks category tag. Keying labels off isBlock alone left every
// free block being called a component.
export function isBlockEntry(entry: { isBlock?: boolean; tags: Tag[] }): boolean {
  return entry.isBlock === true || entry.tags.some((t) => t.label === 'Blocks')
}

// Serializable subset of ComponentEntry — pass this across the
// server/client boundary when you don't need PreviewComponent / code / prompts
// (related grid, prev/next nav, etc).
export type ComponentMeta = Pick<
  ComponentEntry,
  'slug' | 'name' | 'description' | 'tags' | 'image' | 'badge'
>

// ─── Design systems (site-side lookups) ───────────────────────────────────────
// Moved to a light, dependency-free module (./design-system-meta) so CLIENT
// components can read these without importing this heavy registry. Re-exported
// here so existing server importers are unaffected.
export { DESIGN_SYSTEM_META, getDesignSystemMeta, getDesignSystemTemplateMeta } from './design-system-meta'
export type { DesignSystemSlug, DesignSystemMeta, DesignSystemTemplateMeta } from './design-system-meta'


// Code strings are now auto-generated from source files — see component-codes.generated.ts

const COMPONENTS_RAW: ComponentEntry[] = [
  {
    slug: 'wave-lines',
    image: 'https://ik.imagekit.io/aitoolkit/wave-lines.png',
    name: 'Wave Lines',
    description: 'An animated line background. Dense vertical lines ripple with two layered sine waves, bunching and breathing. Hover to send waves across the canvas.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: WaveLines,
    code: componentCodes['wave-lines'],
    prompts: waveLinesPrompts,
  },
  {
    slug: 'distortion-grid',
    image: 'https://ik.imagekit.io/aitoolkit/distortion-grid.png',
    name: 'Distortion Grid',
    description: 'An animated grid background. Thin lines undulate in slow sweeping waves, and hovering repels the grid fabric outward from your cursor.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: DistortionGrid,
    code: componentCodes['distortion-grid'],
    prompts: distortionGridPrompts,
  },
  {
    slug: 'grid-lines',
    image: 'https://ik.imagekit.io/aitoolkit/grid-lines.png?v=3',
    name: 'Grid Lines',
    description: 'A grid background of dots connected by thin lines. The cursor lights a radial glow and bulges the grid outward like a lens as it moves.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: GridLines,
    code: componentCodes['grid-lines'],
    prompts: gridLinesPrompts,
  },
  {
    slug: 'bubble-field',
    image: 'https://ik.imagekit.io/aitoolkit/bubble-field.png?v=2',
    name: 'Bubble Field',
    description: 'An animated bubble background. A monochrome grid of outline circles bursts near the cursor, expanding and fading, then reforming.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: BubbleField,
    code: componentCodes['bubble-field'],
    prompts: bubbleFieldPrompts,
  },
  {
    slug: 'noise-bg',
    image: 'https://ik.imagekit.io/aitoolkit/noise-bg.png',
    name: 'Grain Background',
    description: 'A grain background of randomly scattered dots. Hover to illuminate them with a soft Gaussian glow and organic connection lines.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: NoiseBg,
    code: componentCodes['noise-bg'],
    prompts: noiseBgPrompts,
  },
  {
    slug: 'pill-toggle',
    image: 'https://ik.imagekit.io/aitoolkit/pill-toggle.png',
    name: 'Pill Toggle',
    description: 'A minimal iOS-style slider toggle: thumb glides between off (grey) and on (green) with a snappy spring. Fully responsive.',
    tags: [
      { label: 'Buttons & Toggles', accent: true },
      { label: 'Motion' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: PillToggle,
    code: componentCodes['pill-toggle'],
    prompts: pillTogglePrompts,
  },
  {
    slug: 'mark-toggle',
    image: 'https://ik.imagekit.io/aitoolkit/mark-toggle.png',
    name: 'Mark Toggle',
    description: 'An iOS-style pill toggle in warm earth and sand tones: the thumb carries a small icon that morphs from X to checkmark as it slides across.',
    tags: [
      { label: 'Buttons & Toggles', accent: true },
      { label: 'Motion' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: MarkToggle,
    code: componentCodes['mark-toggle'],
    prompts: markTogglePrompts,
  },
  {
    slug: 'taga-toggle',
    image: 'https://ik.imagekit.io/aitoolkit/taga-toggle.png',
    name: 'Taga Toggle',
    description: 'A playful pill toggle with an expressive face on the thumb: dead (×× eyes, flat mouth) when off, happy (arc eyes, big smile) when on. Track warms from grey to yellow.',
    tags: [
      { label: 'Buttons & Toggles', accent: true },
      { label: 'Motion' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: TagaToggle,
    code: componentCodes['taga-toggle'],
    prompts: tagaTogglePrompts,
  },
  {
    slug: 'blind-pull-toggle',
    image: 'https://ik.imagekit.io/aitoolkit/blind-pull-toggle.png',
    name: 'Blind Pull Toggle',
    description: 'A dark/light mode toggle styled as a window-blind pull cord. Click to yank the cord and watch the icon swap through a venetian-blind slat animation.',
    tags: [
      { label: 'Buttons & Toggles', accent: true },
      { label: 'Motion' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: BlindPullToggle,
    code: componentCodes['blind-pull-toggle'],
    prompts: blindPullTogglePrompts,
  },
  {
    slug: 'x-grid',
    image: 'https://ik.imagekit.io/aitoolkit/x-grid.png',
    name: 'X Grid',
    description: 'An animated X grid background. Marks illuminate and connect to their neighbors with constellation lines as your cursor passes.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: XGrid,
    code: componentCodes['x-grid'],
    prompts: xGridPrompts,
  },
  {
    slug: 'radial-toolbar',
    image: 'https://ik.imagekit.io/aitoolkit/radial-toolbar.png',
    name: 'Radial Toolbar',
    description: 'A radial context menu that fans out formatting tools around a centre button, with active toggle states and an animated label pill.',
    tags: [
      { label: 'Inputs & Controls', accent: true },
      { label: 'Motion' },
      { label: 'SVG' },
    ],
    dualTheme: true,
    PreviewComponent: RadialToolbar,
    code: componentCodes['radial-toolbar'],
    prompts: radialToolbarPrompts,
  },
  {
    slug: 'dot-grid',
    image: 'https://ik.imagekit.io/aitoolkit/dot-grid.png',
    name: 'Dot Grid',
    description:
      'An animated dot grid background. Hovering lights up nearby dots with a smooth glow and an organic fade.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: InteractiveDotGrid,
    code: componentCodes['dot-grid'],
    prompts: dotGridPrompts,
  },
  {
    slug: 'charging-widget',
    image: 'https://ik.imagekit.io/aitoolkit/charging-widget.png',
    name: 'Charging Widget',
    description:
      'Circular battery indicator with animated liquid waves that rise as the percentage counts up, looping continuously.',
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Motion' },
      { label: 'SVG' },
    ],
    dualTheme: true,
    PreviewComponent: ChargingWidget,
    code: componentCodes['charging-widget'],
    prompts: chargingWidgetPrompts,
  },
  {
    slug: 'runway-loader',
    image: 'https://ik.imagekit.io/aitoolkit/runway-loader.png',
    name: 'Runway Loader',
    description: 'An airplane taxis down a runway progress bar, nose tilting up and taking off at 100%.',
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Motion' },
      { label: 'Animation' },
    ],
    dualTheme: true,
    PreviewComponent: RunwayLoader,
    code: componentCodes['runway-loader'],
    prompts: runwayLoaderPrompts,
  },
  {
    slug: 'flip-calendar',
    image: 'https://ik.imagekit.io/aitoolkit/flip-calendar.png',
    name: 'Flip Calendar',
    description: 'A desk-calendar widget showing dates 1–31 with a satisfying flip-clock page-turn animation.',
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Motion' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: FlipCalendar,
    code: componentCodes['flip-calendar'],
    prompts: flipCalendarPrompts,
  },
  {
    slug: 'glitch-button',
    image: 'https://ik.imagekit.io/aitoolkit/glitch-button.png',
    name: 'Glitch Button',
    description: 'A terminal-inspired button with a text scramble glitch effect on hover.',
    tags: [
      { label: 'Buttons & Toggles', accent: true },
      { label: 'Motion' },
      { label: 'Terminal' },
    ],
    dualTheme: true,
    PreviewComponent: GlitchButton,
    code: componentCodes['glitch-button'],
    prompts: glitchButtonPrompts,
  },
  {
    slug: 'traveldeck',
    image: 'https://ik.imagekit.io/aitoolkit/floating-cards.png?v=3',
    name: 'Travel Deck',
    description:
      'A swipeable deck of destination cards. Drag the front card down to fling it off-screen and reveal the next. Each card reveals an animated hotels counter as it comes forward.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Blocks', accent: true },
      { label: 'Motion' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: FloatingCards,
    code: componentCodes['floating-cards'],
    prompts: floatingCardsPrompts,
  },
  {
    slug: 'text-blur-reveal',
    image: 'https://ik.imagekit.io/aitoolkit/text-blur-reveal.png',
    name: 'Text Blur Reveal',
    description:
      'Words animate into view one by one with a satisfying blur-to-sharp entrance, auto-replaying in a loop.',
    tags: [
      { label: 'Typography', accent: true },
      { label: 'Motion' },
    ],
    PreviewComponent: TextBlurReveal,
    code: componentCodes['text-blur-reveal'],
    prompts: textBlurRevealPrompts,
  },
  {
    slug: 'particle-sphere',
    image: 'https://ik.imagekit.io/aitoolkit/particle-sphere.png',
    name: 'Particle Sphere',
    description:
      'A 3D particle background built with Three.js. 9,000 particles sit on a slowly spinning sphere in warm gold and cool silver.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: '3D & Shaders', accent: true },
      { label: 'Three.js' },
    ],
    PreviewComponent: ParticleSphere,
    code: componentCodes['particle-sphere'],
    prompts: {
      'Claude Code': `Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a new file called ParticleSphere.tsx. It should export a React client component that renders an animated 3D particle sphere using Three.js.

Requirements:
- 'use client' at the top
- Import useEffect, useRef from react; import * as THREE from 'three'
- PARTICLE_COUNT = 9000
- makeSprite(): creates a 64×64 canvas with radial white→transparent gradient, returns THREE.CanvasTexture
- colorFromY(ny): returns [r,g,b]. For ny≥0: warm gold [1, 0.55+ny*0.37, ny*0.63]; ny<0: silver [v,v,v+...] where v=0.38+(-ny)*0.62
- useEffect: create scene, PerspectiveCamera(52, W/H, 0.1, 100), camera.position.z=2.9
- WebGLRenderer, setClearColor(0x000000), appendChild to container div
- Fill positions/colors Float32Arrays using spherical coords (acos(2*rand-1), 2π*rand) with r±0.07 jitter
- BufferGeometry with position + color attributes
- PointsMaterial: size 0.032, map=sprite, vertexColors, transparent, depthWrite false, blending THREE.AdditiveBlending
- mesh.rotation.x=0.28, mesh.rotation.z=0.08 (tilt)
- RAF loop: t+=0.004/frame, mesh.rotation.y=t, z wobble via sin
- Cleanup: cancelAnimationFrame, dispose geo/mat/sprite/renderer, removeChild
- Return: <div ref={containerRef} className="h-full w-full" />`,
      'Lovable': `Create a new file called ParticleSphere.tsx. It should export a React client component that renders an animated 3D particle sphere using Three.js.

Requirements:
- 'use client' at the top
- Import useEffect, useRef from react; import * as THREE from 'three'
- PARTICLE_COUNT = 9000
- makeSprite(): creates a 64×64 canvas with radial white→transparent gradient, returns THREE.CanvasTexture
- colorFromY(ny): returns [r,g,b]. For ny≥0: warm gold [1, 0.55+ny*0.37, ny*0.63]; ny<0: silver [v,v,v+...] where v=0.38+(-ny)*0.62
- useEffect: create scene, PerspectiveCamera(52, W/H, 0.1, 100), camera.position.z=2.9
- WebGLRenderer, setClearColor(0x000000), appendChild to container div
- Fill positions/colors Float32Arrays using spherical coords (acos(2*rand-1), 2π*rand) with r±0.07 jitter
- BufferGeometry with position + color attributes
- PointsMaterial: size 0.032, map=sprite, vertexColors, transparent, depthWrite false, blending THREE.AdditiveBlending
- mesh.rotation.x=0.28, mesh.rotation.z=0.08 (tilt)
- RAF loop: t+=0.004/frame, mesh.rotation.y=t, z wobble via sin
- Cleanup: cancelAnimationFrame, dispose geo/mat/sprite/renderer, removeChild
- Return: <div ref={containerRef} className="h-full w-full" />`,
      'V0': `Create a ParticleSphere component using React and Three.js. Render 9,000 particles distributed uniformly across a sphere surface using spherical coordinates (theta = acos(2*rand-1), phi = 2π*rand). Add slight radial jitter (r = 1 ± 0.07) for volumetric depth. Color each particle by its normalised Y position: upper hemisphere → warm gold-to-orange (rgb 1.0, 0.55+t*0.37, t*0.63), lower hemisphere → cool white-to-silver (v = 0.38+t*0.62). Use THREE.PointsMaterial with AdditiveBlending, a soft radial glow sprite as the map, and depthWrite: false. Tilt the mesh (rotation.x=0.28, rotation.z=0.08) and animate rotation.y continuously. Black background. TypeScript + 'use client'.`,
    },
  },
  {
    slug: 'polaroid-stack',
    image: 'https://ik.imagekit.io/aitoolkit/polaroid-stack.png',
    name: 'Polaroid Stack',
    description:
      'Five polaroid photo cards stacked in a casual pile. Click to fan them out in a spring-animated arc, hover to lift, click a card to spotlight it.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Motion' },
    ],
    PreviewComponent: PolaroidStack,
    code: componentCodes['polaroid-stack'],
    prompts: polaroidStackPrompts,
  },
  {
    slug: 'sphere-lines',
    image: 'https://ik.imagekit.io/aitoolkit/sphere-lines.png',
    name: 'Wireframe Globe',
    description: 'An animated wireframe globe background. A narrow wave band drifts slowly across the surface, and hovering ripples the lines under your cursor.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: SphereLines,
    code: componentCodes['sphere-lines'],
    prompts: sphereLinesPrompts,
  },
  {
    slug: 'magnetic-dots',
    image: 'https://ik.imagekit.io/aitoolkit/magnetic-dots.png',
    name: 'Magnetic Dots',
    description: 'An interactive dot background. A dense grid of dots is magnetically pulled toward your cursor, snapping back with an elastic bounce.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: MagneticDots,
    code: componentCodes['magnetic-dots'],
    prompts: magneticDotsPrompts,
  },
  {
    slug: 'magnetic-logo-cluster',
    image: 'https://ik.imagekit.io/aitoolkit/magnetic-logo-cluster.png',
    name: 'Magnetic Logo Cluster',
    description:
      'An interactive swarm of your logo. Marks fly in from off-screen, drift endlessly, and bend toward the cursor.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Interactive' },
      { label: 'Motion' },
    ],
    dualTheme: true,
    PreviewComponent: MagneticLogoCluster,
    code: componentCodes['magnetic-logo-cluster'],
    prompts: magneticLogoClusterPrompts,
  },
  {
    slug: 'particle-constellation',
    image: 'https://ik.imagekit.io/aitoolkit/particle-constellation.png?v=2',
    name: 'Spider Web',
    description: 'An animated spider web background. Silk strands bow slowly at rest, and hovering pushes each node so it bounces back under tension.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: ParticleConstellation,
    code: componentCodes['particle-constellation'],
    prompts: particleConstellationPrompts,
  },
  {
    slug: 'scramble-text',
    image: 'https://ik.imagekit.io/aitoolkit/scramble-text.png?v=3',
    name: 'Scramble Text',
    description: 'Two words scramble continuously in a pixel cipher. Hover the container to decrypt them one by one. Mouse out and they snap back to noise.',
    tags: [
      { label: 'Typography', accent: true },
      { label: 'Interactive' },
    ],
    dualTheme: false,
    PreviewComponent: ScrambleText,
    code: componentCodes['scramble-text'],
    prompts: scrambleTextPrompts,
  },
  {
    slug: 'neon-clock',
    image: 'https://ik.imagekit.io/aitoolkit/neon-clock.png?v=9',
    name: 'Seven-Segment Clock',
    description: 'A retro 7-segment LCD clock with pixel-grid overlay. Shows live HH:MM:SS with blinking colon, AM/PM indicator, day of week row, and full date.',
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Clock' },
      { label: 'Interactive' },
    ],
    PreviewComponent: NeonClock,
    code: componentCodes['neon-clock'],
    prompts: neonClockPrompts,
  },
  {
    slug: 'noise-field',
    image: 'https://ik.imagekit.io/aitoolkit/noise-field.png',
    name: 'Noise Field',
    description: 'An animated flow field background. A grid of arrows driven by layered sine-wave noise drifts like wind. Hover and they turn to point at your cursor.',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: NoiseField,
    code: componentCodes['noise-field'],
    prompts: noiseFieldPrompts,
  },
  {
    slug: 'emoji-burst',
    image: 'https://ik.imagekit.io/aitoolkit/emoji-burst.png',
    name: 'Emoji Burst',
    description: 'A button that explodes emojis outward in all directions. Five emoji sets cycle on each click.',
    tags: [{ label: 'Buttons & Toggles', accent: true }, { label: 'Interactive' }, { label: 'Animation' }],
    dualTheme: true,
    PreviewComponent: EmojiBurst,
    code: componentCodes['emoji-burst'],
    prompts: emojiBurstPrompts,
  },
  {
    slug: 'glass-navbar',
    image: 'https://ik.imagekit.io/aitoolkit/glass-navbar.png',
    name: 'Glass Navbar',
    description: "Frosted glass navigation bar with animated active tab indicator, ambient color blobs, and spring-physics entrance.",
    tags: [
      { label: 'Navigation', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassNavbar,
    code: componentCodes['glass-navbar'],
    prompts: glassNavbarPrompts,
  },
  {
    slug: 'glass-tab-bar',
    image: 'https://ik.imagekit.io/aitoolkit/glass-tab-bar.png?updatedAt=1775974874535',
    name: 'Glass Tab Bar',
    description: "Frosted glass pill tab bar with a sliding active indicator. Edge tabs snap flush to the container wall.",
    tags: [
      { label: 'Navigation', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Mobile' },
    ],
    PreviewComponent: GlassTabBar,
    code: componentCodes['glass-tab-bar'],
    prompts: glassTabBarPrompts,
  },
  {
    slug: 'glass-tags',
    image: 'https://ik.imagekit.io/aitoolkit/glass-tags.png',
    name: 'Glass Tags',
    description: "Selectable pill-shaped tags with glass surfaces, unique color accents, and spring-animated check marks.",
    tags: [
      { label: 'Notifications', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassTags,
    code: componentCodes['glass-tags'],
    prompts: glassTagsPrompts,
  },
  {
    slug: 'glass-card',
    image: 'https://ik.imagekit.io/aitoolkit/glass-card.png?updatedAt=1775460137',
    name: 'Glass Card',
    description: "Glassmorphism content cards with 3D tilt-on-hover, spring physics, and a cursor-following glare highlight.",
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Glass', accent: true },
      { label: '3D' },
    ],
    PreviewComponent: GlassCard,
    code: componentCodes['glass-card'],
    prompts: glassCardPrompts,
  },
  {
    slug: 'glass-modal',
    image: 'https://ik.imagekit.io/aitoolkit/glass-modal.png',
    name: 'Glass Modal',
    description: "Centered dialog with deep glass blur, scale-spring entrance, and staggered content reveal.",
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassModal,
    code: componentCodes['glass-modal'],
    prompts: glassModalPrompts,
  },
  {
    slug: 'glass-dock',
    name: 'Glass Dock',
    description: "Glassmorphism macOS-style dock with cursor-proximity magnification. Icons scale with spring physics as the mouse approaches.",
    image: 'https://ik.imagekit.io/aitoolkit/glass-dock.png?updatedAt=1775599200',
    tags: [
      { label: 'Navigation', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassDock,
    code: componentCodes['glass-dock'],
    prompts: glassDockPrompts,
  },
  {
    slug: 'glass-slider',
    name: 'Glass Slider',
    description: "Range sliders with glass tracks, glowing colored fills, and spring-animated thumbs that scale on drag.",
    image: 'https://ik.imagekit.io/aitoolkit/glass-slider.png',
    tags: [
      { label: 'Inputs & Controls', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassSlider,
    code: componentCodes['glass-slider'],
    prompts: glassSliderPrompts,
  },
  {
    slug: 'glass-toggle',
    name: 'Glass Toggle',
    description: "On/off toggles with glass housing and liquid-feel spring animation. Track color transitions smoothly.",
    tags: [
      { label: 'Buttons & Toggles', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    image: 'https://ik.imagekit.io/aitoolkit/glass-toggle.png',
    PreviewComponent: GlassToggle,
    code: componentCodes['glass-toggle'],
    prompts: glassTogglePrompts,
  },
  {
    slug: 'glass-music-player',
    image: 'https://ik.imagekit.io/aitoolkit/glass-music-player.png',
    name: 'Glass Music Player',
    description: "Mini music player with glass surface, spinning vinyl art, animated progress bar, and ambient glow.",
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassMusicPlayer,
    code: componentCodes['glass-music-player'],
    prompts: glassMusicPlayerPrompts,
  },
  {
    slug: 'glass-notification',
    image: 'https://ik.imagekit.io/aitoolkit/glass-notification.png',
    name: 'Glass Notifications',
    description: "Swipe-to-dismiss notification stack with glass cards and spring-animated layout transitions.",
    tags: [
      { label: 'Notifications', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassNotification,
    code: componentCodes['glass-notification'],
    prompts: glassNotificationPrompts,
  },
  {
    slug: 'glass-sidebar',
    image: 'https://ik.imagekit.io/aitoolkit/glass-sidebar.png?updatedAt=1775460137',
    name: 'Glass Sidebar',
    description: 'Collapsible glassmorphism sidebar with icon-only and full label states, spring-animated expand and collapse.',
    tags: [
      { label: 'Navigation', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Motion' },
    ],
    PreviewComponent: GlassSidebar,
    code: componentCodes['glass-sidebar'],
    prompts: glassSidebarPrompts,
  },
  {
    slug: 'glass-user-menu',
    name: 'Glass User Menu',
    description: 'Frosted glass user avatar trigger with animated dropdown, grouped menu items, and Log Out.',
    image: 'https://ik.imagekit.io/aitoolkit/glass-user-menu.png?updatedAt=1775834492638',
    tags: [
      { label: 'Navigation', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassUserMenu,
    code: componentCodes['glass-user-menu'],
    prompts: glassUserMenuPrompts,
  },
  {
    slug: 'glass-toast',
    name: 'Glass Toast',
    description: 'Frosted glassmorphism toast notification stack with 4 variants, auto-dismiss progress bar, and spring-animated stacking.',
    image: 'https://ik.imagekit.io/aitoolkit/glass-toast.png?updatedAt=1775460137',
    tags: [
      { label: 'Notifications', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassToast,
    code: componentCodes['glass-toast'],
    prompts: glassToastPrompts,
  },
  {
    slug: 'glass-search-bar',
    name: 'Glass Search Bar',
    description: 'Glassmorphism search bar with animated suggestion dropdown, active state glow, and reduced-motion support.',
    image: 'https://ik.imagekit.io/aitoolkit/glass-search-bar.png',
    tags: [
      { label: 'Inputs & Controls', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassSearchBar,
    code: componentCodes['glass-search-bar'],
    prompts: glassSearchBarPrompts,
  },
  {
    slug: 'glass-stepper',
    name: 'Glass Stepper',
    description: 'Glassmorphism numeric stepper with spring number flip, notification-style tinted buttons, and configurable min/max/step.',
    image: 'https://ik.imagekit.io/aitoolkit/glass-stepper.png',
    tags: [
      { label: 'Inputs & Controls', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassStepper,
    code: componentCodes['glass-stepper'],
    prompts: glassStepperPrompts,
  },
  {
    slug: 'glass-progress',
    name: 'Glass Progress',
    description: 'Glassmorphism progress bar panel with glowing gradient fills, spring-animated counters, staggered reveal, and replay button.',
    image: 'https://ik.imagekit.io/aitoolkit/glass-progress.png',
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassProgress,
    code: componentCodes['glass-progress'],
    prompts: glassProgressPrompts,
  },
  {
    slug: 'glass-ai-compose',
    name: 'Glass AI Composer',
    description: 'Glassmorphism AI chat input with image upload, web search toggle, and model switcher.',
    image: 'https://ik.imagekit.io/aitoolkit/glass-ai-compose.png',
    tags: [
      { label: 'Inputs & Controls', accent: true },
      { label: 'Glass', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: GlassAiCompose,
    code: componentCodes['glass-ai-compose'],
    prompts: glassAiComposePrompts,
  },
  {
    slug: 'andromeda-button',
    name: 'Andromeda Button',
    description: 'A sci-fi / blueprint-aesthetic button with five variants (default, outline, ghost, destructive, link), three sizes (small, medium, large), optional leading icon, and full hover / focus / active / disabled state coverage. Transparent hairline surfaces sit on a near-black canvas, with an electric-blue accent that brightens and glows on interaction.',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda-button.png?updatedAt=1775998697243',
    tags: [
      { label: 'Buttons & Toggles', accent: true },
      { label: 'Andromeda' },
    ],
    PreviewComponent: AndromedaButton,
    code: componentCodes['andromeda-button'],
    prompts: andromedaButtonPrompts,
  },
  {
    slug: 'meet-the-crew',
    name: 'Meet the Crew',
    description: 'A swipeable portrait card stack perfect for introducing a team, showcasing crew members, or picking an avatar. Four stacked cards fan out with soft rotations: drag to browse, tap to choose. Drop in your own photos and names for an About Us section, a character selector, or an onboarding profile picker.',
    image: 'https://ik.imagekit.io/aitoolkit/meet-the-crew.png',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Blocks', accent: true },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: AvatarPicker,
    code: componentCodes['avatar-picker'],
    prompts: avatarPickerPrompts,
  },
  {
    slug: 'task-cards',
    image: 'https://ik.imagekit.io/aitoolkit/task-cards.png',
    name: 'Task Cards',
    description: 'A swipeable project task card stack where each card has a unique accent colour, status badge, and due date. Drag left or right to cycle through tasks. The dismissed card springs back to the bottom of the deck.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Blocks', accent: true },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: TaskCards,
    code: componentCodes['task-cards'],
    prompts: taskCardsPrompts,
  },
  {
    slug: 'slide-deck',
    name: 'Slide Deck',
    description: 'Swipeable card deck with four editorial slides. Navigate forward and back by drag or tap.',
    image: 'https://ik.imagekit.io/aitoolkit/slide-deck.png',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Blocks', accent: true },
      { label: 'Interactive' },
      { label: 'Typography' },
    ],
    dualTheme: true,
    PreviewComponent: SlideDeck,
    code: componentCodes['slide-deck'],
    prompts: slideDeckPrompts,
  },
  {
    slug: 'label-cards',
    name: 'Label Cards',
    description: 'Colour-blocked label cards scattered at random angles. Tap one to spring it to centre.',
    image: 'https://ik.imagekit.io/aitoolkit/label-cards.png',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: LabelCards,
    code: componentCodes['label-cards'],
    prompts: labelCardsPrompts,
  },
  {
    slug: 'ai-job-cards',
    name: 'AI Job Cards',
    image: 'https://ik.imagekit.io/aitoolkit/ai-job-cards.png',
    description: 'Three AI job card stacks with swipe-to-cycle. Brand logos, bookmark toggle, springs.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Blocks', accent: true },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: AiJobCards,
    code: componentCodes['ai-job-cards'],
    prompts: aiJobCardsPrompts,
  },
  {
    slug: 'danger-stripes',
    name: 'Danger Stripes',
    image: 'https://ik.imagekit.io/aitoolkit/danger-stripes.png?v=2',
    description: 'Three crossing caution-tape stripes on orange. Hover to shake, click to intensify.',
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Interactive' },
    ],
    PreviewComponent: DangerStripes,
    code: componentCodes['danger-stripes'],
    prompts: dangerStripesPrompts,
  },
  {
    slug: 'sticker-wall',
    name: 'Sticker Wall',
    image: 'https://ik.imagekit.io/aitoolkit/sticker-wall.png',
    description: 'A draggable sticker card wall. Drop notes, toss emoji, pile them up with real 2D physics.',
    dualTheme: true,
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Motion' },
      { label: 'Matter.js' },
    ],
    PreviewComponent: StickerWall,
    code: componentCodes['sticker-wall'],
    prompts: stickerWallPrompts,
  },
  {
    slug: 'peel-corner-reveal',
    name: 'Peel to Scan',
    image: 'https://ik.imagekit.io/aitoolkit/peel-corner-reveal.png',
    description: 'A portrait card whose corner peels on tap, revealing a scannable Wi-Fi QR code.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Motion' },
      { label: 'SVG' },
    ],
    dualTheme: true,
    PreviewComponent: PeelCornerReveal,
    code: componentCodes['peel-corner-reveal'],
    prompts: peelCornerRevealPrompts,
  },
  {
    slug: 'jar-of-emotions',
    name: 'Emoji Reaction Jar',
    image: 'https://ik.imagekit.io/aitoolkit/jar-of-emotions.png',
    description: 'Glass jar widget. Click a reaction to spring the lid and watch the emoji bounce down.',
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Matter.js' },
    ],
    dualTheme: true,
    PreviewComponent: JarOfEmotions,
    code: componentCodes['jar-of-emotions'],
    prompts: jarOfEmotionsPrompts,
  },
  {
    slug: 'responsive-letters',
    name: 'Responsive Letters',
    description: 'Interactive text where each letter responds to cursor proximity, animating variable font properties (weight, stretch, italic, letter-spacing, skew) to create a deformation-under-pressure effect.',
    tags: [
      { label: 'Typography', accent: true },
      { label: 'Interactive' },
      { label: 'Animation' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/responsive-letters.png',
    PreviewComponent: ResponsiveLetters,
    code: componentCodes['responsive-letters'],
    prompts: responsiveLettersPrompts,
  },
  {
    slug: 'good-vibes',
    name: 'Good Vibes',
    description: 'Interactive typography where letters scale 2x and become bold on hover.',
    tags: [
      { label: 'Typography', accent: true },
      { label: 'Interactive' },
      { label: 'Animation' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/good-vibes.png?v=2',
    PreviewComponent: GoodVibes,
    code: componentCodes['good-vibes'],
    prompts: goodVibesPrompts,
  },
  {
    slug: 'playful',
    name: 'Playful',
    description: 'Kinetic typography where letters jump, drop, and rotate on cursor proximity.',
    tags: [
      { label: 'Typography', accent: true },
      { label: 'Interactive' },
      { label: 'Animation' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/playful.png',
    PreviewComponent: Playful,
    code: componentCodes['playful'],
    prompts: playfulPrompts,
  },
  {
    slug: 'wild-morph',
    name: 'Wild Morph',
    description: 'Italic SVG word that warps under the cursor, a spring-physics text animation.',
    tags: [
      { label: 'Typography', accent: true },
      { label: 'Interactive' },
      { label: 'Animation' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/wild-morph.png',
    PreviewComponent: WildMorph,
    code: componentCodes['wild-morph'],
    prompts: wildMorphPrompts,
  },
  {
    slug: 'orbit',
    name: 'Orbit',
    description: 'Kinetic text animation arranged in a circle. Hover slows the spin; letters push outward.',
    tags: [
      { label: 'Typography', accent: true },
      { label: 'Interactive' },
      { label: 'Animation' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/orbit.png',
    PreviewComponent: Orbit,
    code: componentCodes['orbit'],
    prompts: orbitPrompts,
  },
  {
    slug: 'halo-type',
    name: 'Halo Type',
    description: 'Rotating 3D ring text animation: the front arc reads upright, the back arc upside-down.',
    tags: [
      { label: 'Typography', accent: true },
      { label: '3D & Shaders', accent: true },
      { label: 'Animation' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/halo-type.png',
    PreviewComponent: HaloType,
    code: componentCodes['halo-type'],
    prompts: haloTypePrompts,
  },
  {
    slug: 'slice-type',
    name: 'Slice Type',
    description: 'A typographic magic trick. At rest you read one ambiguous word; hover and it splits into two: LIGHT lifting up, NIGHT sinking down, the shared letters resolving into separate glyphs.',
    tags: [
      { label: 'Typography', accent: true },
      { label: 'Animation' },
      { label: 'Interactive' },
    ],
    dualTheme: false,
    image: 'https://ik.imagekit.io/aitoolkit/slice-type.png?v=1',
    PreviewComponent: SliceType,
    code: componentCodes['slice-type'],
    prompts: sliceTypePrompts,
  },
  {
    slug: 'stack-tower',
    name: 'Stack Tower',
    description: 'A column of 12 stacked words that reads as a rotating 3D cylinder. 2D transforms skew, scale and shift each row so the rotation travels down the stack. Hover lights one row in warm orange without breaking the rhythm.',
    tags: [
      { label: 'Typography', accent: true },
      { label: 'Animation' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/stack-tower.png?v=1',
    PreviewComponent: StackTower,
    code: componentCodes['stack-tower'],
    prompts: stackTowerPrompts,
  },
  {
    slug: 'ripple-type',
    name: 'Ripple Type',
    description: 'SVG text animation warped by a turbulence filter. Toggle the fan and letters ripple.',
    tags: [
      { label: 'Typography', accent: true },
      { label: 'Animation' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/ripple-type.png?v=1',
    PreviewComponent: RippleType,
    code: componentCodes['ripple-type'],
    prompts: rippleTypePrompts,
  },
  {
    slug: 'radial-cards',
    name: 'Radial Cards',
    description: 'Seven health-metric cards bloom into a slowly rotating flower. Tap any petal to pull it forward and read your stats up close.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Animation' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/radial-cards.png',
    PreviewComponent: RadialCards,
    code: componentCodes['radial-cards'],
    prompts: radialCardsPrompts,
  },
  {
    slug: 'new-project-modal',
    name: 'New Project Modal',
    description: 'A pill button that morphs into a soft-UI project creation form: title, description, 7-swatch color label picker, Private toggle, and a checkmark-confirm Create button.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Modal' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/new-projectmodal.png',
    PreviewComponent: NewProjectModal,
    code: componentCodes['new-project-modal'],
    prompts: newProjectModalPrompts,
  },
  {
    slug: 'voice-chat-pill',
    name: 'Live Session Pill',
    description: 'A compact live-session presence pill with an animated speaking indicator and overlapping avatars. Clicks open a soft-UI modal showing all participants with a Join Now button.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Modal' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/voice-chat-pill.png?v=2026050501',
    PreviewComponent: VoiceChatPill,
    code: componentCodes['voice-chat-pill'],
    prompts: voiceChatPillPrompts,
  },
  {
    slug: 'upload-progress',
    name: 'Upload Progress',
    description: 'A collapsible file upload widget with a shimmer progress bar (indigo while uploading, amber on pause). Expand to see per-file rows with live progress, time remaining, and pause, resume, refresh, and stop controls.',
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Interactive' },
      { label: 'Animation' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/upload-progress.png?v=3',
    PreviewComponent: UploadProgress,
    code: componentCodes['upload-progress'],
    prompts: uploadProgressPrompts,
  },
  {
    slug: 'signature-pad',
    name: 'Signature Pad',
    description: 'A signature pad widget: pill button morphs into a canvas to draw with mouse or touch.',
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Modal' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/signature-pad.png?v=2',
    PreviewComponent: SignaturePad,
    code: componentCodes['signature-pad'],
    prompts: signaturePadPrompts,
  },
  {
    slug: 'curious-ai',
    name: 'Curious AI',
    description: 'A morphing 3D AI orb in Three.js with cyan and magenta rim lights, iridescent pink speckles on a wrinkled surface, and glowing pink robot-eye pills that follow your cursor and blink between idle looks.',
    tags: [
      { label: '3D & Shaders', accent: true },
      { label: 'Three.js' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/curious-ai.png',
    PreviewComponent: CuriousAi,
    code: componentCodes['curious-ai'],
    prompts: curiousAiPrompts,
  },
  {
    slug: 'cube-carousel',
    name: 'Cube Carousel',
    description: 'An interactive 3D photo cube with six placeholder images on its faces. Drag with your cursor to spin it freely on both axes; release and it coasts naturally to a stop. No buttons, no snap, no controls, just the cube and your hand.',
    tags: [
      { label: '3D & Shaders', accent: true },
      { label: 'Interactive' },
      { label: 'Motion' },
    ],
    dualTheme: true,
    image: 'https://ik.imagekit.io/aitoolkit/cube-carousel.png?v=2',
    PreviewComponent: CubeCarousel,
    code: componentCodes['cube-carousel'],
    prompts: cubeCarouselPrompts,
  },
  {
    slug: 'tilted-coverflow',
    image: 'https://ik.imagekit.io/aitoolkit/tilted-coverflow.png',
    name: 'Tilted Coverflow',
    description:
      '3D coverflow card carousel of seven tilted photos. Drag or arrows to focus any card.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Motion' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: TiltedCoverflow,
    code: componentCodes['tilted-coverflow'],
    prompts: tiltedCoverflowPrompts,
  },
  {
    slug: 'interactive-card-stack',
    image: 'https://ik.imagekit.io/aitoolkit/interactive-card-stack.png?v=1',
    name: 'Interactive Card Stack',
    description:
      'A scattered stack of photo cards. Drag, click, or arrow keys to focus any card.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Motion' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: InteractiveCardStack,
    code: componentCodes['interactive-card-stack'],
    prompts: interactiveCardStackPrompts,
  },
  {
    slug: 'product-card-deck',
    image: 'https://ik.imagekit.io/aitoolkit/product-card-deck.png?v=1',
    name: 'Product Card Deck',
    description:
      'A draggable card deck you flick through one card at a time. The top card leans toward your drag, then spins away with momentum to reveal the next, and the deck loops endlessly. Every card pairs a picture with a title and a pill action button with hover and press states.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Blocks', accent: true },
      { label: 'Motion' },
      { label: 'Interactive' },
    ],
    dualTheme: true,
    PreviewComponent: ProductCardDeck,
    code: componentCodes['product-card-deck'],
    prompts: productCardDeckPrompts,
  },
  {
    slug: 'crypto-swap',
    image: 'https://ik.imagekit.io/aitoolkit/crypto-swap.png?v=2',
    name: 'Crypto Swap',
    description: 'A crypto token-swap widget with live exchange rates, price impact, and an animated swap button.',
    tags: [
      { label: 'Widgets', accent: true },
      { label: 'Interactive' },
      { label: 'Motion' },
    ],
    dualTheme: true,
    PreviewComponent: CryptoSwap,
    code: componentCodes['crypto-swap'],
    prompts: cryptoSwapPrompts,
  },
  {
    slug: 'mood-tracker',
    image: 'https://ik.imagekit.io/aitoolkit/mood-tracker.png?v=1',
    name: 'Mood Tracker',
    description: 'A feelings check-in card with six expressive faces. Drag the segmented slider and the face, label, and liquid color wash shift with your mood.',
    tags: [
      { label: 'Cards & Modals', accent: true },
      { label: 'Interactive' },
      { label: 'Motion' },
    ],
    dualTheme: true,
    PreviewComponent: MoodTracker,
    code: componentCodes['mood-tracker'],
    prompts: moodTrackerPrompts,
  },
  {
    slug: 'delete-button',
    image: 'https://ik.imagekit.io/aitoolkit/delete-button.png',
    name: 'Delete Button',
    description: 'A red button that starts a five-second delete countdown, with a one-tap undo.',
    tags: [
      { label: 'Buttons & Toggles', accent: true },
      { label: 'Interactive' },
      { label: 'Motion' },
    ],
    dualTheme: true,
    PreviewComponent: DeleteButton,
    code: componentCodes['delete-button'],
    prompts: deleteButtonPrompts,
  },
  {
    slug: 'expanding-tabs',
    image: 'https://ik.imagekit.io/aitoolkit/expanding-tabs.png',
    name: 'Expanding Tabs',
    description: 'A monochrome tab bar of icon circles. Click one and it expands into a labeled pill.',
    tags: [
      { label: 'Navigation', accent: true },
      { label: 'Interactive' },
      { label: 'Motion' },
    ],
    dualTheme: true,
    PreviewComponent: ExpandingTabs,
    code: componentCodes['expanding-tabs'],
    prompts: expandingTabsPrompts,
  },
  {
    slug: 'scroll-wipe-gallery',
    name: 'Scroll Wipe Gallery',
    description: 'A full-bleed, scroll-driven photo gallery. Each photo wipes in from a different edge.',
    // ?v=2 — the poster was re-shot and re-uploaded under the same filename,
    // and ImageKit serves max-age=1y, so anyone who loaded the page before the
    // re-shoot kept the old mid-sequence frame until the URL changed.
    image: 'https://ik.imagekit.io/aitoolkit/scroll-wipe-gallery.png?v=2',
    tags: [
      { label: 'Blocks', accent: true },
      { label: 'Motion' },
      { label: 'Interactive' },
    ],
    dualTheme: false,
    staticPreview: true,
    PreviewComponent: ScrollWipeGallery,
    code: componentCodes['scroll-wipe-gallery'],
    prompts: scrollWipeGalleryPrompts,
  },
  {
    slug: 'diamond-grid',
    name: 'Diamond Grid',
    description: 'A faint canvas grid of diamonds. Seeded sparks send light outward until fronts meet.',
    image: 'https://ik.imagekit.io/aitoolkit/diamond-grid.png',
    tags: [
      { label: 'Backgrounds', accent: true },
      { label: 'Canvas' },
      { label: 'Motion' },
      { label: 'Generative' },
    ],
    dualTheme: true,
    PreviewComponent: DiamondGrid,
    code: componentCodes['diamond-grid'],
    prompts: diamondGridPrompts,
  },
]

// Newest first — append new components at the bottom of COMPONENTS_RAW.
// At export time we merge in two pieces of curated data from component-copy.ts:
//   1. Accurate stack tags from ACCURATE_STACKS — rebuilds each entry's `tags`
//      array as `[category, ...stack_tags]`, dropping noise tags like
//      "Interactive", "Animation", "SVG", and "Modal" that crept in over time.
//   2. Per-component `useCases` + `about` copy from COMPONENT_COPY — drives the
//      use-case chips in the header and the "About <name>" body section.
// Anything not in either map keeps its original tags / omits the copy slots.
// Injected premium components live in a GITIGNORED generated shim, present only
// when the premium source was injected at build (scripts/inject-premium.mjs).
// Guarded require — NOT a static import — so a public fork with no shim still
// compiles. inject always leaves at least an empty stub, so this resolves.
let PREMIUM_COMPONENTS: ComponentEntry[] = []
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  PREMIUM_COMPONENTS = (require('./premium-registry.generated') as {
    PREMIUM_COMPONENTS: ComponentEntry[]
  }).PREMIUM_COMPONENTS
} catch {
  /* no premium injected — free-only build */
}

// Merge per-component copy (about/useCases) and the accurate "Built with" stack
// onto a registry entry. Applied to free AND premium components alike, so a
// premium component's page also gets its use-case chips + About paragraph.
function withCopyAndStack(entry: ComponentEntry): ComponentEntry {
  const copy = COMPONENT_COPY[entry.slug]
  const stack = ACCURATE_STACKS[entry.slug]
  let tags: Tag[] = entry.tags
  if (stack) {
    // Preserve every accent tag, not just the first — Glass components
    // carry two (their UI category + "Glass") so the sidebar can list
    // them under both, and dropping the second was emptying the Glass
    // category landing page.
    const categories = entry.tags.filter((t) => t.accent)
    tags = [...categories, ...stack.map((label) => ({ label }))]
  }
  return { ...entry, tags, ...(copy ?? {}) }
}

// Slugs temporarily hidden from every runtime website surface that reads the
// registry (detail page + generateStaticParams, sitemap, related lists) by
// filtering them out of COMPONENTS. The gated CLI/MCP install path is governed
// separately by the premium injection, so a hidden component stays installable.
// Keep in sync with HIDDEN_SLUGS in scripts/generate-registry.mjs, which hides
// it from the generated grid/homepage/nav/MCP metadata. Add a slug to hide it.
const HIDDEN_SLUGS = new Set<string>([])

export const COMPONENTS: ComponentEntry[] = [
  ...[...COMPONENTS_RAW].reverse().map(withCopyAndStack),
  ...PREMIUM_COMPONENTS.map(withCopyAndStack),
].filter((c) => !HIDDEN_SLUGS.has(c.slug))

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getComponent(slug: string): ComponentEntry | undefined {
  return COMPONENTS.find((c) => c.slug === slug)
}

// Strip a full ComponentEntry to a serializable ComponentMeta — pass THIS
// across the server/client boundary (grid cards, nav) so the heavy registry
// (code strings, prompts, preview components incl. three.js) never reaches the
// client bundle or the RSC payload.
export function toMeta(c: ComponentEntry): ComponentMeta {
  return {
    slug: c.slug,
    name: c.name,
    description: c.description,
    tags: c.tags,
    image: c.image,
    badge: c.badge,
  }
}
