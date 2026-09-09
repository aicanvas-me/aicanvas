// Light, dependency-free design-system lookups (name + template metadata).
//
// Extracted from component-registry.tsx so CLIENT components can read this
// without importing the full registry — which pulls in every preview
// component (incl. three.js) and would bloat the bundle. The registry
// re-exports these for back-compat, so existing server importers are
// unaffected. Path/file data for the registry generator lives in
// scripts/lib/design-systems.config.mjs.

export type DesignSystemSlug = 'andromeda'

export interface DesignSystemTemplateMeta {
  slug: string
  name: string
  domain?: string
}

export interface DesignSystemMeta {
  slug: DesignSystemSlug
  name: string
  templates: DesignSystemTemplateMeta[]
}

export const DESIGN_SYSTEM_META: Record<DesignSystemSlug, DesignSystemMeta> = {
  andromeda: {
    slug: 'andromeda',
    name: 'Andromeda Legacy',
    templates: [
      { slug: 'andromeda-mission-control',   name: 'Mission Control',   domain: 'Sci-Fi' },
      { slug: 'andromeda-service-order',     name: 'Service Order',     domain: 'Telecom' },
      // exchange-terminal — hidden, source preserved (see design-systems.config.mjs)
      { slug: 'andromeda-resource-planning', name: 'Resource Planning', domain: 'Operations' },
      { slug: 'andromeda-signal-room',       name: 'Signal Room',       domain: 'Audio' },
    ],
  },
}

export function getDesignSystemMeta(slug: DesignSystemSlug): DesignSystemMeta | undefined {
  return DESIGN_SYSTEM_META[slug]
}

export function getDesignSystemTemplateMeta(
  slug: string,
): { system: DesignSystemMeta; template: DesignSystemTemplateMeta } | undefined {
  for (const system of Object.values(DESIGN_SYSTEM_META)) {
    const template = system.templates.find((t) => t.slug === slug)
    if (template) return { system, template }
  }
  return undefined
}
