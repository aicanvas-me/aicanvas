// Single source of truth for component categories.
// `label` matches the `accent: true` tag string used on every component in
// the registry. `slug` becomes the URL segment under /components/category/.
// `title` and `description` drive per-category SEO metadata.
// `h1` and `intro` are the on-page copy that appears above the grid.

export type Category = {
  label: string
  slug: string
  title: string
  description: string
  h1: string
  intro: string
}

export const CATEGORIES: readonly Category[] = [
  {
    label: 'Cards & Modals',
    slug: 'cards-modals',
    title: 'Animated React Cards and Modals: Free + Tailwind',
    description:
      'Free animated React cards and modal dialogs. Tailwind CSS and Motion. Copy-paste ready, installable via the shadcn CLI.',
    h1: 'Animated React Cards and Modals',
    intro:
      'Animated card and modal dialog components for React. Built with Tailwind CSS and Motion, ready to copy and paste or install via the shadcn CLI.',
  },
  {
    label: 'Widgets',
    slug: 'widgets',
    title: 'Animated React Widgets: Copy and Paste UI Elements',
    description:
      'Free animated React widgets and UI elements. Built with Tailwind CSS and Motion. Copy-paste ready, installable via the shadcn CLI.',
    h1: 'Animated React Widgets',
    intro:
      'Animated widgets and small UI elements for React. Built with Tailwind CSS and Motion, copy-paste ready or installable via the shadcn CLI.',
  },
  {
    label: 'Backgrounds',
    slug: 'backgrounds',
    title: 'Animated React Backgrounds: Tailwind + Motion',
    description:
      'Free animated React backgrounds built with Tailwind CSS and Motion. Copy-paste ready, installable via the shadcn CLI.',
    h1: 'Animated React Backgrounds',
    intro:
      'Animated background components for React. Built with Tailwind CSS and Motion, ready to copy and paste or install with the shadcn CLI.',
  },
  {
    label: 'Blocks',
    slug: 'blocks',
    title: 'React UI Blocks: Composed Page Sections',
    description:
      'React UI blocks: composed, multi-component page sections like pricing tables and hero banners. Tailwind CSS and Motion, free and premium.',
    h1: 'React UI Blocks',
    intro:
      'Composed, multi-component page sections for React: pricing tables, hero banners, and more. Built with Tailwind CSS and Motion, some free and some premium.',
  },
  {
    label: 'Buttons & Toggles',
    slug: 'buttons-toggles',
    title: 'Animated React Buttons and Toggles: Free + Tailwind',
    description:
      'Free animated React buttons and toggles built with Tailwind CSS and Motion. Copy-paste ready, installable via the shadcn CLI.',
    h1: 'Animated React Buttons and Toggles',
    intro:
      'Animated buttons and toggle switches for React. Built with Tailwind CSS and Motion, ready to copy and paste or install via the shadcn CLI.',
  },
  {
    label: 'Navigation',
    slug: 'navigation',
    title: 'React Navigation Components: Navbars, Sidebars, Tabs',
    description:
      'Free React navigation components: navbars, sidebars, tab bars, and docks. Tailwind CSS and Motion, installable via the shadcn CLI.',
    h1: 'React Navigation Components',
    intro:
      'Navigation components for React: navbars, sidebars, tab bars, and docks. Built with Tailwind CSS and Motion, copy-paste ready or installable via the shadcn CLI.',
  },
  {
    label: 'Inputs & Controls',
    slug: 'inputs-controls',
    title: 'Animated React Inputs and Controls: Free + Motion',
    description:
      'Free animated React input and control components. Tailwind CSS and Motion. Copy-paste ready, installable via the shadcn CLI.',
    h1: 'Animated React Inputs and Controls',
    intro:
      'Animated input and control components for React. Built with Tailwind CSS and Motion, ready to copy and paste or install via the shadcn CLI.',
  },
  {
    label: 'Notifications',
    slug: 'notifications',
    title: 'Animated React Notifications and Toasts: Free',
    description:
      'Free animated React notification and toast components. Tailwind CSS and Motion. Copy-paste ready, installable via the shadcn CLI.',
    h1: 'Animated React Notifications and Toasts',
    intro:
      'Animated notification and toast components for React. Built with Tailwind CSS and Motion, ready to copy and paste or install via the shadcn CLI.',
  },
  {
    label: 'Typography',
    slug: 'typography',
    title: 'Animated React Typography Components: Free + Tailwind',
    description:
      'Free animated React typography components: scramble text, blur reveal, ripple text, and more. Tailwind CSS and Motion.',
    h1: 'Animated React Typography Components',
    intro:
      'Animated typography components for React: scramble text, blur reveal, ripple text, and more. Built with Tailwind CSS and Motion.',
  },
  {
    label: 'Glass',
    slug: 'glass',
    title: 'Glassmorphism React Components: Free + Motion',
    description:
      'Free glassmorphism React components: navbars, cards, modals, sliders, toggles, and more. Tailwind CSS and Motion.',
    h1: 'Glassmorphism React Components',
    intro:
      'Glassmorphism components for React: navbars, cards, modals, sliders, toggles, and more. Built with Tailwind CSS and Motion, ready to copy and paste.',
  },
  {
    label: '3D & Shaders',
    slug: '3d-shaders',
    title: '3D and Shader React Components: Three.js + WebGL',
    description:
      'Free 3D and shader React components built with Three.js and WebGL. Copy-paste ready, installable via the shadcn CLI.',
    h1: '3D and Shader React Components',
    intro:
      '3D and shader components for React. Built with Three.js and WebGL, ready to copy and paste or install via the shadcn CLI.',
  },
] as const

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function getCategoryByLabel(label: string): Category | undefined {
  return CATEGORIES.find((c) => c.label === label)
}
