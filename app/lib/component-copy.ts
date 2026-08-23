// Per-component long-form copy (`about`) and `useCases` chips.
//
// Kept in a separate file (not inlined into component-registry.tsx) for two
// reasons:
//   1. Cleaner diff surface when iterating on copy.
//   2. Lets non-engineers edit copy without touching the registry wiring.
//
// Each entry is keyed by slug. The registry merges it in at module load.
// Missing entries simply omit the About / use-case chips on the page.

export type ComponentCopy = {
  /** Up to 3 short chips shown next to the category in the page header. */
  useCases?: string[]
  /** ~70-110 word paragraph rendered below "Add to your project". */
  about?: string
}

// Accurate stack tags derived by scanning each component's source imports.
// Used by the registry merge to rebuild the per-component `tags` array as
// `[category, ...stack_tags]` — dropping noise tags like "Interactive",
// "Animation", "SVG", "Modal" that were sprinkled in over time.
// `meet-the-crew` aliases the `avatar-picker` source; `traveldeck` aliases
// the `floating-cards` source.
export const ACCURATE_STACKS: Record<string, string[]> = {
  '3d-gem-pricing-section': ['Three.js', 'Canvas', 'Tailwind CSS'],
  '3d-product-card': ['Three.js', 'Tailwind CSS'],
  'ai-job-cards': ['Motion', 'Tailwind CSS'],
  'andromeda-button': ['Tailwind CSS'],
  'blind-pull-toggle': ['Motion', 'Tailwind CSS'],
  'bubble-field': ['Canvas', 'Tailwind CSS'],
  'charging-widget': ['Motion', 'Tailwind CSS'],
  'crypto-swap': ['Motion', 'Tailwind CSS'],
  'cube-carousel': ['Motion', 'Tailwind CSS'],
  'curious-ai': ['Motion', 'Three.js', 'Tailwind CSS'],
  'curved-frame-carousel': ['Motion', 'Tailwind CSS'],
  'danger-stripes': ['Motion', 'Tailwind CSS'],
  'delete-button': ['Motion', 'Tailwind CSS'],
  'diamond-grid': ['Canvas', 'Tailwind CSS'],
  'distortion-grid': ['Canvas', 'Tailwind CSS'],
  'dot-grid': ['Canvas', 'Tailwind CSS'],
  'emoji-burst': ['Motion', 'Tailwind CSS'],
  'expanding-tabs': ['Motion', 'Tailwind CSS'],
  'filter-menu': ['Motion', 'Tailwind CSS'],
  'flip-calendar': ['Motion', 'Tailwind CSS'],
  'fluid-simulation-hero': ['WebGL', 'Tailwind CSS'],
  'glass-ai-compose': ['Motion', 'Tailwind CSS'],
  'glass-card': ['Motion', 'Tailwind CSS'],
  'glass-dock': ['Motion', 'Tailwind CSS'],
  'glass-modal': ['Motion', 'Tailwind CSS'],
  'glass-music-player': ['Motion', 'Tailwind CSS'],
  'glass-navbar': ['Motion', 'Tailwind CSS'],
  'glass-notification': ['Motion', 'Tailwind CSS'],
  'glass-progress': ['Motion', 'Tailwind CSS'],
  'glass-search-bar': ['Motion', 'Tailwind CSS'],
  'glass-sidebar': ['Motion', 'Tailwind CSS'],
  'glass-slider': ['Motion', 'Tailwind CSS'],
  'glass-stepper': ['Motion', 'Tailwind CSS'],
  'glass-tab-bar': ['Motion', 'Tailwind CSS'],
  'glass-tags': ['Motion', 'Tailwind CSS'],
  'glass-toast': ['Motion', 'Tailwind CSS'],
  'glass-toggle': ['Motion', 'Tailwind CSS'],
  'glass-user-menu': ['Motion', 'Tailwind CSS'],
  'glitch-button': ['Motion', 'Tailwind CSS'],
  'good-vibes': ['Motion', 'Tailwind CSS'],
  'grid-lines': ['Canvas', 'Tailwind CSS'],
  'halo-type': ['Motion', 'Tailwind CSS'],
  'interactive-card-stack': ['Motion', 'Tailwind CSS'],
  'jar-of-emotions': ['Motion', 'Matter.js', 'Tailwind CSS'],
  'label-cards': ['Motion', 'Tailwind CSS'],
  'magnetic-dots': ['Canvas', 'Tailwind CSS'],
  'magnetic-logo-cluster': ['Motion', 'Tailwind CSS'],
  'mark-toggle': ['Motion', 'Tailwind CSS'],
  'meet-the-crew': ['Motion', 'Tailwind CSS'],
  'mood-tracker': ['Motion', 'Tailwind CSS'],
  'neon-clock': ['Tailwind CSS'],
  'new-project-modal': ['Motion', 'Tailwind CSS'],
  'noise-bg': ['Canvas', 'Tailwind CSS'],
  'noise-field': ['Canvas', 'Tailwind CSS'],
  'orbit': ['Tailwind CSS'],
  'particle-constellation': ['Canvas', 'Tailwind CSS'],
  'particle-sphere': ['Three.js', 'Canvas', 'Tailwind CSS'],
  'peel-corner-reveal': ['Motion', 'Tailwind CSS'],
  'perspective-showcase-hero': ['Motion', 'Tailwind CSS'],
  'pill-toggle': ['Motion', 'Tailwind CSS'],
  'playful': ['Motion', 'Tailwind CSS'],
  'polaroid-stack': ['Motion', 'Tailwind CSS'],
  'product-card-deck': ['Motion', 'Tailwind CSS'],
  'radial-cards': ['Motion', 'Tailwind CSS'],
  'radial-toolbar': ['Motion', 'Tailwind CSS'],
  'responsive-letters': ['Motion', 'Tailwind CSS'],
  'ripple-type': ['Motion', 'Tailwind CSS'],
  'runway-loader': ['Motion', 'Tailwind CSS'],
  'scramble-text': ['Motion', 'Tailwind CSS'],
  'scroll-wipe-gallery': ['Motion', 'Tailwind CSS'],
  'signature-pad': ['Motion', 'Canvas', 'Tailwind CSS'],
  'slice-type': ['Motion', 'Canvas', 'Tailwind CSS'],
  'slide-deck': ['Motion', 'Tailwind CSS'],
  'sphere-lines': ['Canvas', 'Tailwind CSS'],
  'stack-tower': ['Motion', 'Tailwind CSS'],
  'sticker-wall': ['Motion', 'Matter.js', 'Canvas', 'Tailwind CSS'],
  'taga-toggle': ['Motion', 'Tailwind CSS'],
  'task-cards': ['Motion', 'Tailwind CSS'],
  'text-blur-reveal': ['Motion', 'Tailwind CSS'],
  'tilted-coverflow': ['Motion', 'Tailwind CSS'],
  'traveldeck': ['Motion', 'Tailwind CSS'],
  'upload-progress': ['Motion', 'Tailwind CSS'],
  'voice-chat-pill': ['Motion', 'Tailwind CSS'],
  'wave-lines': ['Canvas', 'Tailwind CSS'],
  'wild-morph': ['Motion', 'Tailwind CSS'],
  'x-grid': ['Canvas', 'Tailwind CSS'],
}

export const COMPONENT_COPY: Record<string, ComponentCopy> = {
  '3d-product-card': {
    useCases: ['Product page', 'Online store', '3D showcase'],
    about:
      '3D Product Card turns a normal shop listing into an interactive turntable. At rest it reads like any product card, with a name, price, wishlist, and add-to-cart button, but hovering tilts the card into a 3D display floor while the product itself lifts and slowly spins, and shoppers can drag to orbit it and study every angle. It loads a real glTF/.glb model so you can drop in your own product, fits any model to frame automatically, and adapts to both light and dark themes. The copy and call-to-action stay flat and readable in 2D while the card leans behind them. Built with raw Three.js.',
  },

  // ─── Backgrounds ─────────────────────────────────────────────────────────
  'wave-lines': {
    useCases: ['Hero section', 'Landing page', 'Section divider'],
    about:
      'Wave Lines is a canvas-driven background of densely packed vertical lines that breathe in two layered sine waves, so the rhythm never repeats. Move your cursor across it and the lines snap into a much wilder distortion that decays as you leave. The drawing loop is a single requestAnimationFrame tick over a 2D canvas with Tailwind for the surrounding chrome, so the component runs cool even on older laptops. It is built to anchor a hero section, sit behind a CTA, or fill an empty section divider without competing with foreground copy.',
  },
  'distortion-grid': {
    useCases: ['Hero section', 'Landing page', 'Editorial'],
    about:
      'Distortion Grid renders a fine grid of thin lines on a 2D canvas and bends the lattice with two slow-moving sine fields, so the surface always looks like a living blueprint. Your cursor acts as a repulsion field: nearby intersections push outward and the deformation propagates softly across the whole canvas. The implementation is pure canvas plus Tailwind classes for the wrapper, no WebGL, which keeps the bundle small and the GPU cost predictable. Drop it behind a hero headline or as the entire backdrop for a long-form editorial page.',
  },
  'grid-lines': {
    useCases: ['Hero section', 'Marketing site', 'Editorial'],
    about:
      'Grid Lines connects a dot grid with thin segments and waits for the cursor to enter. When it does, a radial pulse fires from your pointer and ripples outward, lighting both dots and connecting strokes as it spreads. The whole composition is drawn into a single 2D canvas with Tailwind providing layout for the container around it. It works well as a hero backdrop where a single interaction signals "this site is alive", or as a section break on a long marketing page.',
  },
  'bubble-field': {
    useCases: ['Hero section', 'Landing page', 'Empty state'],
    about:
      'Bubble Field is a grid of outline circles that pop on hover, each one expanding and dissolving like a soap bubble before quietly reforming a moment later. The palette is a soft pastel blue, designed to feel calm even when the entire field is animating. The pop-and-reform cycle is driven by a single canvas loop, so dozens of bubbles can be in motion at once with no DOM cost. Try it as a hero backdrop, a friendly empty state, or a landing-page band where you want playful motion without distracting copy.',
  },
  'noise-bg': {
    useCases: ['Hero section', 'Editorial', 'Landing page'],
    about:
      'Grain Background scatters thousands of tiny dots at random across a 2D canvas, with a subtle Gaussian glow that pools where they cluster. On hover, organic connection lines stretch between the dots near your cursor, briefly turning the noise into a network. It is a quiet, ambient background built for editorial layouts, hero sections, and any long-form page that needs texture without color competition. The whole effect runs in one canvas with Tailwind for the surrounding container.',
  },
  'x-grid': {
    useCases: ['Hero section', 'Marketing site', 'Empty state'],
    about:
      'X Grid is a canvas of small × marks arranged on a regular lattice. On hover, the ones nearest your cursor brighten and reach toward each other with thin constellation lines, briefly stitching the grid into a network. Everything is drawn into a single 2D canvas with Tailwind controlling layout, so the GPU and DOM both stay quiet. It is a strong hero backdrop or marketing-page filler when you want geometric texture that responds to attention without overwhelming foreground content.',
  },
  'dot-grid': {
    useCases: ['Hero section', 'Marketing site', 'Editorial'],
    about:
      'Dot Grid lays down a regular field of points across a 2D canvas. Hovering it lifts the dots inside a soft radial pool around your cursor, with a smooth fade in and out so movement always feels gentle. Because the whole grid lives in one canvas, the cost stays flat no matter how dense the field is. Use it behind a hero, behind a pricing table, or wherever you want a structured pattern that politely tracks the cursor.',
  },
  'particle-sphere': {
    useCases: ['Hero section', 'Marketing site', '404 page'],
    about:
      'Particle Sphere renders 9,000 particles distributed across the surface of a sphere using spherical coordinates and additive blending in Three.js. The top hemisphere fades from warm gold to orange, the bottom from cool white to silver, and the whole structure rotates slowly on a slight tilt. Because each particle is a simple Points instance with a sprite map, the GPU handles thousands of additive draws comfortably even on integrated cards. It is a striking hero element for AI products, landing pages with a cosmic feel, or 404 pages that need something memorable.',
  },
  'sphere-lines': {
    useCases: ['Hero section', 'AI product', 'Marketing site'],
    about:
      'Wireframe Globe is a wireframe globe drawn entirely in a 2D canvas, with a single narrow band of wave-displacement that drifts continuously across its surface so the thing never looks frozen. Move your cursor near it and a localised ripple bows the wireframe at exactly that spot, then settles back. There is no Three.js involved, just trigonometry and one render loop, which keeps the build size tiny. Pair it with an AI hero, a research-style marketing page, or as a quiet centerpiece that signals depth without screaming.',
  },
  'magnetic-dots': {
    useCases: ['Hero section', 'Portfolio', 'Marketing site'],
    about:
      'Magnetic Dots is a dense grid of points that get pulled toward your cursor as if it were a magnet, and snap back with an elastic bounce when you leave. The whole interaction is a single canvas loop applying a falloff function to each dot, so the effect feels physical without any actual physics library. The visual is restrained but unmistakably tactile, which makes it a good fit behind portfolio hero copy, behind a marketing-page headline, or anywhere a page needs to react to attention.',
  },
  'particle-constellation': {
    useCases: ['Hero section', 'Editorial', 'Landing page'],
    about:
      'Spider Web is an organic silk lattice that bows gently on its own, with a slow idle motion so it never looks static. As you move across it, the nodes near your cursor are physically pushed outward and bounce back with internal tension, while the strings closest to you fade slightly so the focal point feels lifted. The whole composition is canvas-rendered with hand-tuned spring constants, no third-party physics required. It is built for editorial heroes, story-driven landing pages, and any layout where the background should feel like a living material.',
  },
  'noise-field': {
    useCases: ['Hero section', 'Editorial', 'Marketing site'],
    about:
      'Noise Field draws a regular grid of small arrows pointing in directions sampled from layered sine-wave noise, so the field looks like wind mapped across a weather chart. The pattern drifts continuously, and bringing your cursor into the canvas creates a swirling vortex centered on it that the surrounding arrows curl around. It is a pure 2D canvas component with Tailwind chrome, so it stays light despite the dense visual texture. Drop it as a hero backdrop, an editorial section break, or behind a marketing-page CTA where you want quiet ambient motion.',
  },
  'diamond-grid': {
    useCases: ['Hero section', 'Landing page', 'Section divider'],
    about:
      'Diamond Grid is a full-bleed canvas background built from a near-invisible square grid, rotated forty-five degrees so it reads as diamonds. Thirty-four seeded ignition points fire in sequence, lighting up as four-point stars and sending light outward along the four grid axes with one continuous ease-out, until opposing fronts meet and reveal the pattern. A broad top-left-to-bottom-right mask keeps the center bright while the other two corners fade away. The 64-second loop is seamless and deterministic from a seed prop, replaying on reload. Built on plain canvas with zero dependencies beyond React, it suits hero sections, landing pages, and section dividers that want ambient motion without competing with foreground copy.',
  },
  'magnetic-logo-cluster': {
    useCases: ['Startup landing page', 'Product launch page', 'Conference website'],
    about:
      'Magnetic Logo Cluster fills the screen with about 150 copies of your own logo, flying in from every direction before settling into an overlapping diamond pack. Once at rest the pack drifts forever on a GPU-driven CSS loop, and the cursor pulls nearby marks toward it with a soft magnetic tug plus a tangential swirl, so the whole field bends and trails as you move. Any artwork works as the icon: inline SVG, an image, or a component, and tints recolor monochrome marks. It suits a startup landing page, a product launch page, or a conference website built entirely around one brand mark.',
  },

  // ─── Buttons & Toggles ───────────────────────────────────────────────────
  'pill-toggle': {
    useCases: ['Settings', 'Forms', 'Dashboard'],
    about:
      'Pill Toggle is the canonical iOS-style switch: a rounded track and a sliding thumb that snaps between grey (off) and green (on). The thumb travel is driven by Motion with a snappy spring, so the interaction feels immediate without overshooting. The whole component is keyboard and screen-reader friendly and adapts cleanly to dark mode through Tailwind tokens. Reach for it any time you would have used a checkbox for a binary on/off preference: settings panels, forms, dashboard rows, and inline feature flags.',
  },
  'mark-toggle': {
    useCases: ['Settings', 'Forms', 'Onboarding'],
    about:
      'Mark Toggle is a warm-toned variation on the iOS pill switch with one extra detail: the thumb carries a tiny mark that morphs from an X into a checkmark as it slides across. The track lives in earthy sand colors, the icon swap is animated with Motion, and the spring settles cleanly without bounce artifacts. Because the moving glyph confirms the new state, it is a more reassuring choice for settings rows, onboarding choices, and consent-style forms where users want to be certain a switch flipped.',
  },
  'taga-toggle': {
    useCases: ['Onboarding', 'Empty state', 'Product tour'],
    about:
      'Taga Toggle is a personality switch built into a pill toggle: the thumb wears a small face that goes from dead-eyed and flat-mouthed (off) to wide-eyed and grinning (on) while the track warms from grey to yellow. The face transitions are Motion-driven so the morph reads as one continuous gesture rather than a swap. It is the right pick when a feature toggle is part of the brand voice rather than a quiet utility: onboarding flows, product tours, marketing demos, and empty-state CTAs.',
  },
  'blind-pull-toggle': {
    useCases: ['Settings', 'Theme switcher', 'Footer'],
    about:
      'Blind Pull Toggle reframes the dark mode switch as a window-blind cord: click to yank it and watch the icon swap through a horizontal slat animation that mimics venetian blinds opening and closing. The pull-and-spring is Motion-driven so the cord weight feels physical, and the slats reveal the destination icon by the time the animation settles. It is a small but memorable replacement for the standard sun/moon button in site headers, footers, and settings drawers.',
  },
  'glitch-button': {
    useCases: ['Hero section', 'Game UI', 'Portfolio'],
    about:
      'Glitch Button is a terminal-aesthetic button that runs a text scramble on hover: each letter cycles through random glyphs before locking back to its intended character. The effect is a short Motion-driven cipher loop, fast enough to feel like signal rather than noise. It pairs naturally with monospace typefaces and dark surfaces, which makes it a good pick for hero CTAs on portfolio sites, game UI, AI products, and any landing page leaning into a hacker or sci-fi tone.',
  },
  'emoji-burst': {
    useCases: ['Reactions', 'Onboarding', 'Empty state'],
    about:
      'Emoji Burst is a button that explodes a cluster of emojis outward in every direction every time you click it, then cycles through five different emoji sets so repeated taps feel rewarding rather than repetitive. Each burst is choreographed with Motion: randomized angles, staggered fade-outs, and a soft bounce so the emojis settle naturally before they fade. Use it for reactions, applause, end-of-flow celebrations, or anywhere an empty state could use a moment of delight.',
  },
  'glass-toggle': {
    useCases: ['Settings', 'Dashboard', 'Theme switcher'],
    about:
      'Glass Toggle is an on/off switch housed in a frosted glass track, with a thumb that glides on a soft Motion spring while the track color transitions smoothly between states. The glass surface picks up the page behind it through backdrop-filter, so it always feels consistent with whatever you put under it. Drop it into glassmorphism dashboards, settings panels, theme switchers, or any UI that already leans on the same visual language for cards and modals.',
  },
  'andromeda-button': {
    useCases: ['Dashboard', 'Admin panel', 'Internal tools'],
    about:
      'Andromeda Button is the canonical button primitive from the Andromeda design system: a sci-fi blueprint aesthetic with five variants (default, outline, ghost, destructive, link), three sizes, optional leading icon, and complete state coverage for hover, focus, active, and disabled. Transparent hairline surfaces sit on a near-black canvas, and the electric-blue accent brightens and glows on interaction so the button always tells you exactly which state it is in. It is the standard control for any dashboard or internal tool built in the Andromeda visual language.',
  },
  'delete-button': {
    useCases: ['Account settings', 'Admin panel', 'Confirmation flow'],
    about:
      'Delete Button turns a destructive action into a single morphing pill instead of a confirm dialog. Click it and the red button reshapes into a soft-red "Cancel Deletion" pill with a live five-second countdown badge that rolls down digit by digit, plus an undo arrow. Let it run out and the pill settles into a muted "Account Deleted" state before resetting; tap undo at any point and it springs straight back to default. Framer Motion drives the shape-morph between all three pills with one shared layout transition. It is a calmer alternative to a browser confirm() for account deletion, removing a project, or any other destructive action.',
  },

  // ─── Navigation ──────────────────────────────────────────────────────────
  'glass-navbar': {
    useCases: ['Marketing site', 'SaaS', 'Portfolio'],
    about:
      'Glass Navbar is a frosted glassmorphism top bar with an animated active-tab pill that slides between sections, ambient color blobs in the background to give the surface depth, and a spring-physics entrance so the bar settles in rather than popping. Everything is built with Motion plus Tailwind, no portal magic required, and the glass effect uses native backdrop-filter so it adapts to whatever content scrolls beneath. It is the right pick for marketing sites, SaaS dashboards, and portfolios that want a modern, transparent header without sacrificing legibility.',
  },
  'glass-tab-bar': {
    useCases: ['Dashboard', 'Settings', 'Mobile app'],
    about:
      'Glass Tab Bar is a frosted pill row with a sliding active indicator that crosses behind the labels as you switch sections. The edge tabs are intentionally snapped flush to the container wall so the rhythm feels intentional rather than centered-with-padding. Motion drives the slider, and the glass surface adapts to whatever sits behind it through backdrop-filter. It works well as a settings switcher, a dashboard segment control, or a mobile-style tab row inside a larger page.',
  },
  'glass-dock': {
    useCases: ['Dashboard', 'Editor', 'Mobile app'],
    about:
      'Glass Dock is a macOS-inspired dock bar where each icon scales up as your cursor approaches, with spring physics that propagate gently to the neighbouring icons. The glassmorphism backdrop, blur, and edge highlight all use native backdrop-filter so the dock picks up the page behind it. Motion handles the proximity-based scaling without re-rendering each icon, which keeps things smooth even with a dozen entries. Use it as the navigation rail for an editor, dashboard, or web-app shell that wants a tactile, desktop-class feel.',
  },
  'glass-sidebar': {
    useCases: ['Dashboard', 'Admin panel', 'SaaS'],
    about:
      'Glass Sidebar is a collapsible glassmorphism rail that animates between an icon-only and a fully-labeled state with a single spring-driven transition. Each row stays touch-friendly in both modes, and the labels fade in with a slight stagger so the expansion feels intentional. The glass surface uses backdrop-filter, so it always picks up the background color of the app beneath. It is the default left rail for SaaS dashboards, admin panels, and any web app where you want a clean primary navigation that gets out of the way on demand.',
  },
  'glass-user-menu': {
    useCases: ['SaaS', 'Dashboard', 'Marketing site'],
    about:
      'Glass User Menu is a frosted-glass avatar button that opens a dropdown with grouped menu items, dividers, and a final Log Out action. The dropdown animates in with a small Motion-driven slide and fade, and the glass surface keeps it visually consistent with the rest of a glassmorphism design system. It slots cleanly into the top-right of any SaaS shell, dashboard chrome, or marketing site that already has an authenticated state.',
  },
  'expanding-tabs': {
    useCases: ['Mail client', 'Dashboard', 'Settings'],
    about:
      'Expanding Tabs is a monochrome tab bar where switching sections is one continuous shape change: the active tab expands into a full icon-and-label pill while the previous tab collapses back into a plain icon-only circle. Every icon sits at a fixed left inset so it never needs its own layout animation, which keeps the morph smooth no matter how fast you click between tabs. A soft drop-shadow elevation plus a crisp inset top-highlight on both the pill and the outer rail give the bar a tactile, skeuomorphic finish in light and dark mode alike. It fits a mail client, a dashboard section switcher, or any compact settings tab strip.',
  },

  // ─── Widgets ─────────────────────────────────────────────────────────────
  'charging-widget': {
    useCases: ['Dashboard', 'Settings', 'Onboarding'],
    about:
      'Charging Widget is a circular battery indicator with liquid waves that rise inside the ring as the percentage counts up, looping continuously once full. The wave layer is a Motion-driven SVG with a couple of phased sine functions, so the surface always looks alive without ever feeling busy. The percent readout counts up alongside the fill. It is a charming way to visualise any progress that has a definite goal: an account setup percentage, a usage cap, a download, or a milestone tracker.',
  },
  'runway-loader': {
    useCases: ['Onboarding', 'Loading state', 'Empty state'],
    about:
      'Runway Loader is a progress bar with an airplane taxiing along it: as the load advances the plane rolls forward, and at 100% the nose lifts and it takes off. Motion handles both the linear taxi and the rotation-on-liftoff so the whole sequence reads as one continuous gesture. It is a lighthearted choice for onboarding flows, file imports, deploy pipelines, or any wait that benefits from a small narrative payoff at the end.',
  },
  'flip-calendar': {
    useCases: ['Marketing site', 'Dashboard', 'Reminder'],
    about:
      'Flip Calendar is a desk-calendar widget showing dates one through thirty-one, each accompanied by a satisfying flip-clock style page-turn animation as the day advances. The flip is implemented with Motion driving a two-half transform so the page hinges through the middle, with a soft easing on the second half that lands like real paper. Use it as a "today is" widget on a marketing page, a date marker inside a dashboard, or a reminder card in a productivity tool.',
  },
  'neon-clock': {
    useCases: ['Dashboard', 'Game UI', 'Portfolio'],
    about:
      'Seven-Segment Clock is a retro clock whose digits are drawn as SVG polygons, one shape per segment, with a faint pixel-grid overlay that gives them a real vintage-display feel. It shows live hours, minutes, and seconds with a blinking colon, plus AM/PM, a row for the day of the week, and the full date underneath. Because there is no external font and no canvas to repaint, the whole thing renders instantly and styles cleanly with Tailwind. It is a strong fit for retro game UI, terminal-themed dashboards, or portfolio sites leaning on a nostalgic palette.',
  },
  'glass-music-player': {
    useCases: ['Marketing site', 'Portfolio', 'Mobile app'],
    about:
      'Glass Music Player is a mini player widget with a frosted-glass surface, a spinning vinyl-art disc beside the track info, an animated progress bar, and a soft ambient glow that picks up the album cover color. Motion handles the spin and the progress fill so they share a single animation timeline. The component is decorative-but-functional: it accepts real metadata for any track you give it, and works well as a portfolio detail, a marketing-site lower-third, or a mobile preview card.',
  },
  'glass-progress': {
    useCases: ['Dashboard', 'Onboarding', 'Settings'],
    about:
      'Glass Progress is a panel of progress bars with glassmorphism surfaces, glowing gradient fills, spring-animated counters that count up as the bars advance, and a staggered reveal so multiple metrics arrive in a satisfying cascade. A replay button restarts the animation, which makes it ideal for demos and showcases. Use it for dashboard metrics, onboarding completion meters, settings completeness indicators, or any UI that needs to show multiple bounded values at once with a sense of arrival.',
  },
  'danger-stripes': {
    useCases: ['Empty state', '404 page', 'Maintenance page'],
    about:
      'Danger Stripes is three crossing strips of caution tape on a high-visibility orange background, the kind of construction-site aesthetic that signals "do not proceed" with a wink. Hovering shakes the stripes lightly, and clicking intensifies the shake into something that feels like the page itself is rattling. It is the right pick for 404 pages, maintenance banners, beta warning callouts, and empty states where you want personality instead of a dry placeholder.',
  },
  'sticker-wall': {
    useCases: ['Brainstorm', 'Mood board', 'Empty state'],
    about:
      'Sticker Wall is a draggable note-and-emoji surface backed by Matter.js, so cards collide, pile up, and settle with real 2D physics rather than scripted ease curves. Drop a note, throw an emoji, give it a flick, and watch it tumble and stack against whatever is already there. Motion drives the grab handles; Matter.js owns the physics simulation. It is a playful canvas for brainstorms, mood boards, retros, and standout empty states where you want users to interact rather than just read.',
  },
  'jar-of-emotions': {
    useCases: ['Reactions', 'Feedback', 'Empty state'],
    about:
      'Emoji Reaction Jar is a glass jar widget with a lid that springs open when you tap one of the reaction buttons below it, sending the matching reaction emoji bouncing down through the jar. The bounce and pile-up are real Matter.js physics, so multiple emojis stack and jostle each other as you keep clicking. Motion drives the lid hinge and the spawning animation. It is a delightful drop-in for feedback widgets, end-of-article reaction bars, and empty states that want users to leave a mark.',
  },
  'upload-progress': {
    useCases: ['Dashboard', 'File manager', 'Onboarding'],
    about:
      'Upload Progress is a collapsible file-upload widget anchored to the corner of a viewport. The top bar shows a shimmer progress bar that runs indigo while uploading and amber when paused, and the expanded state breaks out each file into its own row with per-file progress, time remaining, and controls for pause, resume, refresh, and stop. Motion handles the collapse, the shimmer sweep, and the row-level transitions. It is the right component for file managers, asset upload flows, deploy dashboards, and any UI with long-running background tasks.',
  },
  'signature-pad': {
    useCases: ['Onboarding', 'Forms', 'Contracts'],
    about:
      'Signature Pad starts as a small pill button. Tap it and the pill smoothly morphs into a full canvas pad where you can draw with a mouse, trackpad, or touch. The drawing surface is a 2D canvas with proper pressure-style line interpolation; Motion drives the pill-to-pad transition so the affordance feels like one continuous gesture rather than two separate states. It is the right primitive for contracts, e-signature flows, delivery confirmations, and any form that needs a handwritten input without pulling in a heavy SDK.',
  },

  // ─── Cards & Modals ──────────────────────────────────────────────────────
  'traveldeck': {
    useCases: ['Image gallery', 'Portfolio', 'E-commerce'],
    about:
      'Travel Deck is a swipeable stack of destination cards: flick the front card with a downward drag and it flings off-screen to reveal the next one behind it. As each card comes forward it animates a hotel-count badge that counts up to its destination total. Motion handles both the drag tracking and the fling-away exit of dismissed cards. It is a strong choice for image galleries, travel marketing pages, portfolio sliders, and product showcases that benefit from a tactile, deck-of-cards interaction.',
  },
  'polaroid-stack': {
    useCases: ['Image gallery', 'Portfolio', 'Wedding site'],
    about:
      'Polaroid Stack is five photo cards in the casual pile a friend would leave on a desk, slightly rotated, slightly offset. Click the stack and they fan out in a spring-animated arc; hover individual cards to lift them; click a specific card to bring it forward as the focal point. Motion drives the fan-out, the lift, and the spotlight transitions. It is a warm, personal way to display a small photo set, perfect for portfolios, about pages, wedding sites, and product pages where the photo itself is part of the brand.',
  },
  'glass-card': {
    useCases: ['Marketing site', 'Dashboard', 'Pricing'],
    about:
      'Glass Card is a glassmorphism content card with three Motion-driven flourishes that wake up on hover: a subtle 3D tilt that follows the cursor, a spring physics return when you leave, and a soft glare highlight that tracks your pointer across the surface. The glass effect uses native backdrop-filter so the card always picks up the texture behind it. Reach for it for pricing tiers, marketing-site features, dashboard widgets, or any layout where individual cards deserve a moment of attention.',
  },
  'glass-modal': {
    useCases: ['Dashboard', 'Settings', 'Marketing site'],
    about:
      'Glass Modal is a centered dialog with deep glass blur on the backdrop, a scale-spring entrance for the panel, and a staggered content reveal so the header, body, and actions land in sequence rather than as one block. Motion handles the entrance choreography; the glass surface uses backdrop-filter so the dialog sits convincingly over any background. It is the default modal for SaaS settings, marketing-site confirmations, and any dashboard flow where the interruption needs to feel intentional.',
  },
  'meet-the-crew': {
    useCases: ['About page', 'Team page', 'Onboarding'],
    about:
      'Meet the Crew is a swipeable portrait card stack designed for introducing teams, showcasing crew, or letting a user pick an avatar. Four cards fan out with soft rotation, you drag to browse, and you tap a card to select it. Motion handles the drag, the rotation easing, and the spring-back when a card returns to the deck. Drop in your own photos and names to power an About Us page, a character selector for a game, or an onboarding profile picker that feels personal rather than form-shaped.',
  },
  'task-cards': {
    useCases: ['Dashboard', 'Productivity', 'Onboarding'],
    about:
      'Task Cards is a swipeable project task stack where each card carries a unique accent color, a status badge, and a due date. Drag a card left or right and it spins out of the deck and settles into the back, ready for the next one to come forward. Motion drives both the drag tracking and the springy snap-back, and the colors adapt cleanly between light and dark themes. It is a good fit for productivity dashboards, agile boards, and onboarding flows where each card is a discrete next-action.',
  },
  'slide-deck': {
    useCases: ['Image gallery', 'Editorial', 'Portfolio'],
    about:
      'Slide Deck is a four-slide editorial card stack you navigate by drag or by tapping the side arrows. Each slide springs into place with a Motion transition that hands focus to the new card while easing the previous one back. The cards themselves take rich content (image, headline, subhead, footer), so the same component works for an image gallery, a long-form editorial preview, a portfolio carousel, or a multi-step product story.',
  },
  'label-cards': {
    useCases: ['Mood board', 'Branding showcase', 'Empty state'],
    about:
      'Label Cards is a scatter of color-blocked cards thrown at random angles across the canvas, like sticky notes on a corkboard. Tap any one and it springs to the centre, scales up, and rotates upright; tap again and it returns to the pile. Motion drives the spring-to-centre and the return path so the motion always feels physical. Use it for mood boards, branding showcases, design-system color directories, and empty states that want to feel like a creative workspace.',
  },
  'ai-job-cards': {
    useCases: ['Job board', 'Dashboard', 'Marketing site'],
    about:
      'AI Job Cards is three independent stacks of AI-job cards, each with brand logos, a bookmark toggle, and a swipe-to-cycle interaction so users can browse without leaving the column. Springs deliver each new card from beneath the stack with a slight overshoot, and the bookmark icon scales on tap. Motion drives the swipe, the layered z-order, and the bookmark feedback. It is built for job boards, talent marketplaces, marketing pages introducing an AI tool, and dashboard widgets that want browsable depth in a small footprint.',
  },
  'peel-corner-reveal': {
    useCases: ['Marketing site', 'Onboarding', 'Event'],
    about:
      'Peel to Scan is a portrait card whose bottom-right corner peels back when you tap it, revealing a scannable Wi-Fi QR code underneath. The peel uses Motion to drive both the rotation of the curl and the shadow that follows it, so the gesture feels like real paper rather than a transform. Tap again to seal it. It is a small but memorable detail for event signage, hotel marketing pages, onboarding flows that need to surface a secondary asset, and anywhere a QR code deserves a little theater.',
  },
  'radial-cards': {
    useCases: ['Dashboard', 'Health app', 'Marketing site'],
    about:
      'Radial Cards is a flower of seven health-metric cards arranged around a central hub, slowly rotating so each petal cycles through the foreground. Tap any petal and it pulls forward, scales up, and pauses the rotation so you can read the stats up close; tap again and the bloom resumes. Motion handles both the orbit and the focus-pull. It is a strong fit for health-app dashboards, marketing pages for fitness or wellness products, and any UI where multiple related stats deserve equal billing.',
  },

  // ─── Inputs & Controls ───────────────────────────────────────────────────
  'radial-toolbar': {
    useCases: ['Editor', 'Studio', 'Mobile app'],
    about:
      'Radial Toolbar is a context menu that fans out a ring of formatting tools around a central button when activated, with toggle states for each tool and a small animated label pill that names whichever icon you hover. Motion drives both the fan-out and the toggle feedback, so every tap has a clean visual confirmation. It is the canonical pick for text editors, image-editing studios, mobile-first interaction tools, and any UI where pointer travel matters more than menu length.',
  },
  'glass-slider': {
    useCases: ['Settings', 'Editor', 'Dashboard'],
    about:
      'Glass Slider is a range input with a frosted-glass track, a glowing colored fill that follows the value, and a thumb that scales up with Motion spring physics while you drag. The glass surface uses backdrop-filter so the track stays consistent with the page behind it. It is the right primitive for any setting that takes a continuous value: brightness, volume, opacity, model temperature, gradient stops, or any creative-tool parameter.',
  },
  'glass-search-bar': {
    useCases: ['Marketing site', 'SaaS', 'Dashboard'],
    about:
      'Glass Search Bar is a glassmorphism search field with an animated suggestion dropdown that opens on focus, an active-state glow when typing, and a reduced-motion fallback for users who prefer less animation. Motion handles the dropdown entrance and the focus-state highlight, while the glass surface uses backdrop-filter for the blur. It works well as a global search in SaaS shells, a sticky search header on marketing sites, and a command-palette trigger inside dashboards.',
  },
  'glass-stepper': {
    useCases: ['Settings', 'E-commerce', 'Forms'],
    about:
      'Glass Stepper is a numeric input with a Motion-driven spring flip on the number itself, notification-style tinted plus and minus buttons, and configurable min, max, and step values. The glassmorphism container picks up whatever sits behind it so the stepper integrates into any UI. Use it for cart quantity, attendee counts, room-night pickers, model-parameter inputs, and any setting that takes a small bounded number rather than a free-form value.',
  },
  'glass-ai-compose': {
    useCases: ['AI product', 'SaaS', 'Editor'],
    about:
      'Glass AI Composer is an AI chat input with everything modern conversation interfaces tend to bolt on: an image-upload slot, a web-search toggle that visibly engages, and a segmented pill switcher for picking between fast and frontier models. The whole thing sits inside a glassmorphism surface with Motion-driven focus and toggle states, so the composer feels like part of the product rather than a third-party widget. Drop it into AI products, SaaS support consoles, editor command surfaces, and any chat-style entry point.',
  },

  'filter-menu': {
    useCases: ['Search results', 'Product catalog', 'Job listings'],
    about:
      'Filter Menu is a skeuomorphic pill that expands into a rounded multi-select panel: six labelled rows, each with an icon and a circular checkmark that fills when selected, above an Apply button carrying a live count. Pressing Apply collapses everything back into the pill and slides a badge out from behind it showing how many filters are live, with a small clear button attached. Motion drives the layout morph, the row springs, and the staggered reveal, while a click anywhere outside quietly dismisses the panel. Rows, defaults, and the apply callback are all props, and the control ships with listbox roles, visible focus rings, and a matching dark theme. It suits catalogue pages, search result headers, and job listings that need more than a plain dropdown.',
  },

  // ─── Notifications ───────────────────────────────────────────────────────
  'glass-tags': {
    useCases: ['Forms', 'Settings', 'Onboarding'],
    about:
      'Glass Tags is a row of selectable pill-shaped tags with frosted glass surfaces, unique color accents per tag, and spring-animated checkmarks that scale in when a tag is activated. Motion drives the check animation and the tag-state transition; the glass effect uses backdrop-filter so each pill stays consistent with the background. It is a good fit for filter rows, onboarding interest-pickers, settings selectors, and any UI where users need to select multiple items from a small named set.',
  },
  'glass-notification': {
    useCases: ['SaaS', 'Dashboard', 'Mobile app'],
    about:
      'Glass Notifications is a vertical stack of swipe-to-dismiss notification cards with glassmorphism surfaces and spring-animated layout transitions, so removing one card lets the others reflow rather than jumping. Motion handles both the swipe physics and the layout choreography, and the glass surface adapts to whatever the user has scrolling behind it. It works well for SaaS notification trays, mobile-style alert centres, and dashboard activity feeds where individual items should feel tactile.',
  },
  'glass-toast': {
    useCases: ['SaaS', 'Dashboard', 'Mobile app'],
    about:
      'Glass Toast is a frosted-glass toast notification system with four variants (success, info, warning, error), an auto-dismiss progress bar inside the card itself, and spring-animated stacking when multiple toasts queue up. Motion handles both the entrance/exit timing and the stack reflow when one disappears. It is the canonical toast component for SaaS dashboards, mobile apps, and any product that needs short-lived, low-friction feedback after an action.',
  },

  // ─── Typography ──────────────────────────────────────────────────────────
  'text-blur-reveal': {
    useCases: ['Hero section', 'Editorial', 'Marketing site'],
    about:
      'Text Blur Reveal animates each word into view with a blur-to-sharp entrance, replaying in a loop so the headline keeps refreshing without ever feeling restless. Motion controls both the blur transition and the per-word stagger, which means the effect remains smooth at any text length. It is the right entrance animation for hero headlines, marketing-site lower thirds, editorial cover pages, and any moment where the words themselves are the subject.',
  },
  'scramble-text': {
    useCases: ['Hero section', 'Portfolio', 'AI product'],
    about:
      'Scramble Text is two words running a continuous scramble effect, each letter flickering through a constrained glyph set, until you hover the container, at which point they resolve one letter at a time and settle into the real words. Move away and they scramble back into noise. Motion drives both the scramble loop and the reveal sequencing; the glyph set is intentionally constrained so the noise reads as deliberate. Use it for hero headlines, portfolio splash sections, AI-product tags, and any interaction where the act of reading is part of the experience.',
  },
  'responsive-letters': {
    useCases: ['Hero section', 'Editorial', 'Type specimen'],
    about:
      'Responsive Letters is interactive variable-font typography where each letter responds to cursor proximity by morphing its weight, width, italic angle, letter-spacing, and skew. Together they read as a deformation-under-pressure effect that makes the headline feel like an elastic material. Motion drives the per-letter property animation, and the variable-font axes do the rendering, so the cost stays in CSS rather than canvas. It is built for hero headlines, type specimens, and editorial covers where the typeface itself is the protagonist.',
  },
  'good-vibes': {
    useCases: ['Hero section', 'Portfolio', 'Marketing site'],
    about:
      'Good Vibes is interactive typography where each letter scales up to twice its size and snaps to bold the moment your cursor passes over it. The combination of size and weight together creates a deliberate, friendly emphasis rather than the more chaotic per-letter wobble effects. Motion drives the per-letter transitions with snappy springs. It is a strong pick for hero headlines, portfolio names, friendly marketing-site banners, and any moment that wants warmth without being twee.',
  },
  'playful': {
    useCases: ['Hero section', 'Game UI', 'Children\'s site'],
    about:
      'Playful is kinetic typography that makes letters jump, drop, and rotate as your cursor approaches each one, like the headline is sneezing or hopping out of the way. Motion drives the per-letter physics and the staggered randomness so the effect feels organic rather than mechanical. It is the right pick for children-focused sites, game-UI headlines, festival posters, and any moment where typography should feel like a character with its own mood.',
  },
  'wild-morph': {
    useCases: ['Hero section', 'Type specimen', 'Brand site'],
    about:
      'Wild Morph is an italic SVG word that warps under your cursor, with each path control point pulled and released by a Motion-driven spring so the deformation rebounds rather than smearing. Because the morph is on SVG paths rather than canvas pixels, the word stays infinitely scalable and crisp at any size. It is the right hero element for type specimens, brand sites, and any landing page where the headline should feel like liquid metal under the pointer.',
  },
  'orbit': {
    useCases: ['Hero section', 'About page', 'Type specimen'],
    about:
      'Orbit arranges a phrase into a circular layout that rotates continuously, with each letter pushing outward radially as you hover so the entire ring breathes. The whole effect runs on CSS transforms with no Motion runtime, so the bundle stays tiny and the animation runs cool even on weaker devices. Use it for hero typographic features, about-page sections that want a sense of motion, and type specimens that want to show off rhythm rather than just rendering.',
  },
  'halo-type': {
    useCases: ['Hero section', 'Type specimen', 'Editorial'],
    about:
      'Halo Type is a rotating 3D ring of text where the front arc reads upright and the back arc reads upside-down, with smooth perspective transitions as the ring spins. Motion drives the continuous rotation and the per-letter perspective transforms so the text always looks like it is on a real cylindrical surface. It is a striking pick for hero sections, type specimens, editorial covers, and any moment where the typography deserves to be the entire compositional event.',
  },
  'slice-type': {
    useCases: ['Hero section', 'Editorial', 'Brand site'],
    about:
      'Slice Type is a typographic magic trick: at rest you read one ambiguous word, but as you hover the letters slice horizontally (LIGHT lifting up, NIGHT sinking down) and the shared glyphs resolve into two separate words. The split is driven by Motion handling the vertical translations, with a canvas layer for the gradient masking that makes the cut feel clean. Use it for hero sections, brand sites, and editorial layouts where the headline itself is the surprise.',
  },
  'stack-tower': {
    useCases: ['Hero section', 'Type specimen', 'Portfolio'],
    about:
      'Stack Tower is a column of twelve stacked words that reads as a rotating 3D cylinder, with 2D transforms skewing, scaling, and shifting each row so the rotation visibly travels down the stack. Hover any row and it lights up in warm orange without breaking the rhythm of the rotation. The whole effect is pure Motion plus Tailwind, no real 3D library required, which keeps the bundle small. It is built for hero sections, type specimens, and portfolio splash screens that want depth without WebGL.',
  },
  'ripple-type': {
    useCases: ['Hero section', 'Editorial', 'Brand site'],
    about:
      'Ripple Type is an SVG word warped by an SVG turbulence filter, with a small fan-style toggle that, when activated, sends the letters rippling like silk caught in a draft. Motion controls the animation of the filter parameters so the ripple breathes rather than running at a fixed frequency. It is the right pick for editorial hero sections, brand sites with a poetic tone, and any landing page where the headline should physically respond to the page state.',
  },

  // ─── 3D & Shaders ────────────────────────────────────────────────────────
  'curious-ai': {
    useCases: ['AI product', 'Hero section', 'Marketing site'],
    about:
      'Curious AI is a morphing 3D AI orb built in Three.js with cyan and magenta rim lights, iridescent pink speckles drifting across a wrinkled displacement surface, and a pair of glowing pink robot-eye pills that track your cursor and blink between idle looks. Motion handles the cursor-follow on the eyes and the idle behaviors, while Three.js owns the orb morph and lighting. It is the canonical character mascot for an AI product hero, marketing-site feature card, or onboarding moment.',
  },
  'cube-carousel': {
    useCases: ['Image gallery', 'Portfolio', 'Hero section'],
    about:
      'Cube Carousel is a true 3D photo cube built on CSS transforms with preserve-3d, not a Three.js scene or a perspective trick. Six placeholder images sit on the faces of a cube with a 16:9:9 width-height-depth ratio. The drag interaction uses Motion onPan to apply rotation deltas on both axes simultaneously; releasing the cube lets it coast to a soft spring stop with no snap-back. No buttons, no controls, no UI chrome, just a cube and your cursor. It is well suited to portfolio galleries, product showcases, or hero sections where a tactile, physical-feeling interaction is worth more than another fade-in.',
  },
  'tilted-coverflow': {
    useCases: ['Image gallery', 'Portfolio', 'Hero section'],
    about:
      'Tilted Coverflow is a 3D photo carousel built on CSS perspective and rotateY transforms, not Three.js. Seven cards fan out in a horizontal arc with a size gradient from center to edge; every card breathes on its own slow loop, and the focused caption fades in word by word when it lands in the middle. Drag, click any side card, or use the arrow keys to focus, and the row wraps circularly so three cards always sit on each side of center. Motion handles the springs and breathing; Tailwind covers layout. Suits portfolios, image galleries, or hero bands that want a tactile, image-forward interaction.',
  },
  'interactive-card-stack': {
    useCases: ['Image gallery', 'Moodboard', 'Portfolio'],
    about:
      'Interactive Card Stack is a loose pile of five photo cards scattered around a focused center, each a polaroid-style print that breathes gently on its own slow loop. Click any card to pull it to the front, drag the front card sideways to cycle, or use the arrow keys, and the rest spring into a new arrangement around it. Motion drives the scatter, the breathing, and the focus shuffle; Tailwind covers the layout, and it honours reduced-motion settings. Drop in your own photos and titles, and set an optional link per card. It suits image galleries, moodboards, and portfolio sections where the photo itself is the point.',
  },

  // ─── Blocks ─────────────────────────────────────────────────────────────
  '3d-gem-pricing-section': {
    useCases: ['SaaS pricing page', 'Subscription plans', 'Plan comparison'],
    about:
      '3D Gem Pricing Section is a three-tier plan table where every card carries its own crystal. At rest the gem reads as a flat constellation of dots and lines in the card\'s top corner, and on hover, focus, or a tap it swells into a faceted solid that tilts, turns slowly, and casts a soft contact shadow. A pyramid, a cube, and an octahedron separate the tiers. One shared Three.js layer sits over the section and tracks the cards as they reflow, so the markup underneath stays plain: a monthly-to-yearly billing switch with an animated price swap, a feature checklist, and a seats-and-storage footer. The palette is a warm orange that holds up in both light and dark. It suits a SaaS pricing page, a subscription upgrade screen, or a plan comparison.',
  },
  'curved-frame-carousel': {
    useCases: ['Studio homepage', 'Agency landing page', 'Photo showcase'],
    about:
      'Curved Frame Carousel is a full-bleed hero band where a fixed frame with flared, curving edges masks an endless track of photos drifting quietly behind it. Flick it, throw it with a drag, nudge it with a sideways scroll, or step through with the arrow keys, and the deck carries on with momentum while every panel that reaches the flare hinges away in perspective as though the wall itself were bending. A caption and an index counter sit beneath the frame and update as each photo takes the centre slot. Motion drives the track and the per-panel transforms, Tailwind covers the chrome, and a per-image focal point keeps subjects in view at every width. Swap in your own photos, headline, and call to action for a studio homepage or an agency landing page.',
  },
  'fluid-simulation-hero': {
    useCases: ['Hero section', 'Product launch page', 'Creative studio site'],
    about:
      'Fluid Simulation Hero is a full-bleed landing section running a real-time Navier-Stokes solver on the GPU: velocity and dye advect through curl, vorticity, and Jacobi pressure passes, then a surface-normal pass lays an iridescent thin film along the filaments. It arrives by being born rather than faded in: the surface ignites from a single point and blooms into its resting mass while the type lands on the same clock. Drag or touch anywhere and the pointer stirs the dye directly, and the pointer itself becomes a glass lens that frosts to name whatever it is over. Left alone, a spawner keeps the mass slowly turning, beside the headline on a wide frame and above it on a narrow one. It is raw WebGL2 with a WebGL1 fallback and a painted CSS wash for machines that cannot run either, no shader library and no 3D engine. Headline, nav, wordmark, and call-to-action pill sit above the canvas as real DOM text, the nav folding into a menu on small screens, and reduced-motion visitors get a settled still frame.',
  },
  'perspective-showcase-hero': {
    useCases: ['Photography portfolio', 'Editorial header', 'Lookbook intro'],
    about:
      'Perspective Showcase Hero pairs a split editorial header with an endless row of photo cards that curve away from the centre on CSS 3D perspective, no WebGL involved. The card in the middle sits flat and zooms inside its frame while its neighbours rotate toward the vanishing point and wrap around at the edges. The row drifts on its own until you take over by dragging, scrolling sideways, or pressing the arrow keys, and one velocity loop drives all four inputs so releasing a flick coasts back into the drift. Motion handles the track, Tailwind covers the chrome, and captions, a slot counter, and reduced-motion support are built in. Swap in your own photos for a photography portfolio, an editorial cover, or a lookbook intro.',
  },

  // ─── UI (uncategorized) ──────────────────────────────────────────────────
  'new-project-modal': {
    useCases: ['Dashboard', 'Editor', 'SaaS'],
    about:
      'New Project Modal is a pill-shaped button that morphs into a soft-UI project creation form with a title, a description, a seven-swatch color-label picker, a Private toggle, and a checkmark-confirm Create button. Motion handles the pill-to-form transition so the button visually grows into the dialog rather than swapping for one. It is the right pattern for any dashboard, editor, or SaaS app where creating a new thing is a frequent action and the entry point shouldn\'t feel heavier than a single button.',
  },
  'voice-chat-pill': {
    useCases: ['Collaboration tool', 'SaaS', 'Game UI'],
    about:
      'Live Session Pill is a compact presence indicator with an animated speaking pulse and overlapping participant avatars, that opens into a soft-UI modal when tapped, showing every participant with a Join Now button. Motion drives both the speaking pulse and the pill-to-modal expansion. It slots into collaboration tools, multiplayer game lobbies, design-tool comment threads, and any product where live presence deserves a compact, glanceable affordance with a fast path to joining the conversation.',
  },
  'product-card-deck': {
    useCases: ['Product showcase', 'E-commerce', 'Lookbook'],
    about:
      'Product Card Deck is a draggable stack of product cards you flick through one at a time, built for browsing a small catalogue the way you swipe a deck of cards. Grab the top card and it leans toward your drag like a real card being thrown, then spins off with momentum in whatever direction you flick it, while the card behind rises into its place and a fresh one slides in at the back so the deck never runs out. Each card pairs a full-bleed product image with a clean caption strip holding the name and a pill call-to-action button with hover and press states. Framer Motion drives the drag, tilt, and fly-off physics while Tailwind covers the surrounding chrome, and it is fully touch-friendly for a mobile-first shoppable gallery. Swap in your own images and labels to turn it into a lookbook, a featured-products carousel, or a swipe-to-shop experience.',
  },
  'crypto-swap': {
    useCases: ['DeFi app', 'Crypto dashboard', 'Web3 landing'],
    about:
      'Crypto Swap is a Uniswap-style token-swap card for trading one crypto asset for another, not a fiat exchange. The dollar figures are reference valuations used only to derive the rate. Type a Sell amount, pick two tokens from a contained dropdown of real brand coin icons, and the Buy side recomputes live with an animated number that reflects a pool-depth price-impact model, a separate network-fee estimate, and a slippage-driven minimum received. A flip button swaps the direction and carries the amount across, each token shows its 24h trend, and the periwinkle Swap button runs an idle to swapping to success state machine with a check, glow, and spark burst. Motion drives every transition and Tailwind handles the borderless dual-theme surfaces, with adaptive decimal precision, full listbox keyboard accessibility, and reduced-motion support throughout. It is a polished fit for a DeFi app, a crypto dashboard widget, or a Web3 landing page.',
  },
  'mood-tracker': {
    useCases: ['Wellness app', 'Journaling app', 'Employee check-in'],
    about:
      'Mood Tracker is a "How are you feeling?" check-in card built around six hand-drawn SVG mood characters, each with its own body shape, color, and expression so they read instantly side by side. Drag the segmented slider, tap a face in the legend, or use the arrow keys, and the big focal face springs in while the feeling word crossfades and a soft liquid-gradient panel of drifting blobs retints to the chosen mood. A Save button morphs into a "Recorded" confirmation on click, and every surface tints to follow the mood in both light and dark themes with reduced-motion support. Drop it into a wellness or mood-journaling app, a daily reflection prompt, or a lightweight employee check-in.',
  },
  'scroll-wipe-gallery': {
    useCases: ['Portfolio', 'Agency site', 'Lookbook'],
    about:
      "Scroll Wipe Gallery is a full-bleed editorial section built around one long scroll: five photos, each clipped in from its own edge as you pass it, the previous photo always underneath. Every headline slides in along its wipe's direction and tightens its letter spacing as the frame lands, so the title and the reveal read as one gesture. A frame counter, a series label, and a fading scroll cue orient the viewer, set in a difference blend so they stay legible over any photo. Swap in your own photos and titles for a portfolio, an agency case study, or a lookbook intro.",
  },
}
