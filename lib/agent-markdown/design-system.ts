/**
 * Markdown twins of the design-system pages: one per system (overview) and one
 * per system component. Pure builders like ./component.ts; the routes in
 * app/md/design-systems pass the data in.
 *
 * Same rule as every twin: never more than the HTML page shows a SIGNED-OUT
 * visitor. Design-system component pages never ship source in their HTML, so
 * no twin here carries source, Legacy (MIT) included. No twin carries remix
 * prompt text either: a Pro component points to its Remix panel in one line.
 */
import { splitProPromptAtPaywall } from '../registry/prompt-blocks'
import type { PropTable } from '../../app/components/PropsTable'
import { fence, propsSection, usageSection, type Usage } from './component'

export interface SystemComponent {
  /** Page slug, e.g. `alert` (URL: /design-systems/<system>/<slug>). */
  slug: string
  /** Install slug, e.g. `andromeda-alert`. */
  registrySlug: string
  name: string
  description: string
}

export interface SystemTemplate {
  folder: string
  registrySlug: string
  name: string
  description: string
  installTier: string
}

export interface SystemInput {
  slug: string
  name: string
  tagline: string
  description: string
  font: string
  /** Premium to install (the paid system). */
  paid: boolean
  components: SystemComponent[]
  templates: SystemTemplate[]
  /** Install lines, each already labelled with the gate's tier. */
  installs: { tier: string; command: string; note: string }[]
  /** Set when this build ships the system's AI Brain. */
  brain?: { installTier: string }
  /** Extra pages of this system worth naming (path below the system root). */
  pages: { path: string; label: string }[]
  siteUrl: string
}

// The line under every heading: what this is and where it comes from.
function identity(subject: string, what: string, siteUrl: string): string {
  return `${subject} is ${what} from AI Canvas (${siteUrl}). Index of every system, component and install setup: ${siteUrl}/llms.txt`
}

const license = (paid: boolean) => (paid ? 'Premium' : 'free, MIT-licensed')

// String-literal unions ('a'|'b'|'c') are the props that pick a variant.
function unionValues(type: string): string[] | null {
  const parts = type.split('|').map((p) => p.trim()).filter((p) => p && p !== 'undefined')
  if (parts.length < 2 || !parts.every((p) => /^(['"]).*\1$/.test(p))) return null
  return parts.map((p) => p.slice(1, -1))
}

const orList = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} or ${items.at(-1)}`)

/** "## Parts" for a compound component and "## Variants" from its union props. */
export function partsAndVariants(name: string, tables: PropTable[]): string[] {
  const out: string[] = []
  const used = tables.filter((t) => t.props.length > 0)
  if (used.length > 1) {
    out.push(`## Parts\n\n${name} is built from ${orList(used.map((t) => `\`${t.table}\``)).replace(/ or /, ' and ')}. Each part has its own props table below.`)
  }
  const lines = used.flatMap((t) =>
    t.props.flatMap((p) => {
      // `type` is the HTML attribute (button, submit, reset), not a look.
      const values = p.name === 'type' ? null : unionValues(p.type)
      if (!values) return []
      const where = used.length > 1 ? ` on \`${t.table}\`` : ''
      const def = p.default ? ` (default ${p.default})` : ''
      return [`- \`${p.name}\`${where}: ${orList(values)}${def}`]
    }),
  )
  if (lines.length > 0) out.push(`## Variants\n\n${lines.join('\n')}`)
  return out
}

export function systemMarkdown(s: SystemInput): string {
  const root = `${s.siteUrl}/design-systems/${s.slug}`
  const out: string[] = [`# ${s.name}`, identity(s.name, `a ${license(s.paid)} design system`, s.siteUrl), `${s.tagline}. ${s.description}`]

  out.push(
    [
      `- License: ${s.paid ? 'Premium (proprietary): installing needs Premium' : 'MIT'}`,
      `- Components: ${s.components.length}`,
      s.templates.length > 0 && `- Templates: ${s.templates.length}`,
      `- Typeface: ${s.font}`,
      `- Page: ${root}`,
    ]
      .filter(Boolean)
      .join('\n'),
  )

  out.push(
    `## Install\n\n${s.installs.map((i) => `- ${i.note} (${i.tier}): \`${i.command}\``).join('\n')}\n\nToken setup for installs: the Install section of ${s.siteUrl}/llms.txt.`,
  )

  const components = s.components.map(
    (c) => `- [${c.name}](${root}/${c.slug}.md): ${c.description.replace(/\s+/g, ' ').trim()}`,
  )
  out.push(`## Components\n\nEach link is that component's markdown page: install command, import line and props.\n\n${components.join('\n')}`)

  if (s.templates.length > 0) {
    const templates = s.templates.map(
      (t) =>
        `- [${t.name}](${root}/templates/${t.folder}): ${t.description} Built only from ${s.name} components. Install (${t.installTier}): \`npx shadcn@latest add @aicanvas/${t.registrySlug}\``,
    )
    out.push(`## Templates\n\n${templates.join('\n')}`)
  }

  if (s.brain) {
    out.push(
      `## AI Brain\n\nRule files an AI agent reads to build on-brand ${s.name} UI: tokens, layout, motion and per-component rules. Install or update (${s.brain.installTier}): \`npx shadcn@latest add --overwrite @aicanvas/${s.slug}-brain\`. About: ${root}/brain`,
    )
  }

  if (s.pages.length > 0) {
    out.push(`## More pages\n\n${s.pages.map((p) => `- [${p.label}](${root}/${p.path})`).join('\n')}`)
  }

  return out.join('\n\n') + '\n'
}

export interface SystemComponentInput {
  system: { slug: string; name: string; paid: boolean }
  component: SystemComponent
  installTier: string
  propTables: PropTable[]
  /** The full prompt from the bundle, or null. Only Pro pages have one. */
  prompt: string | null
  related: SystemComponent[]
  usage?: Usage | null
  siteUrl: string
}

/**
 * What a signed-out visitor sees of a system component's prompt: the public
 * head only, or nothing when the prompt has no recognisable cut. Only the Pro
 * page has prompts today; it is cut for every system all the same, so a free
 * system that gains prompts later cannot publish more here than the page does
 * without someone changing this on purpose.
 */
export function publicSystemPrompt(prompt: string | null): string | null {
  if (!prompt) return null
  return splitProPromptAtPaywall(prompt)?.head ?? null
}

export function systemComponentMarkdown(input: SystemComponentInput): string {
  const { system, component, siteUrl } = input
  const root = `${siteUrl}/design-systems/${system.slug}`
  const out: string[] = [
    `# ${component.name} (${system.name})`,
    identity(component.name, `a component of the ${license(system.paid)} ${system.name} design system`, siteUrl),
    component.description,
    [
      `- Design system: [${system.name}](${root}.md)`,
      `- License: ${system.paid ? 'Premium (proprietary)' : 'MIT'}`,
      `- Install slug: \`${component.registrySlug}\``,
      `- Page: ${root}/${component.slug}`,
    ].join('\n'),
  ]

  const install = [`## Install`, fence(`npx shadcn@latest add @aicanvas/${component.registrySlug}`, 'bash')]
  // Worded from the gate's own tier for this slug, not from the system label.
  install.push(
    input.installTier === 'free account'
      ? `Needs a free AI Canvas account; signed out, the command writes a placeholder (an \`AccountRequired\` notice) instead.`
      : `Requires Premium. Without a Premium token the command writes a placeholder (a \`PremiumLocked\` notice) instead of the component.`,
  )
  install.push(`Every ${system.name} component at once: \`npx shadcn@latest add @aicanvas/${system.slug}\`.`)
  install.push(`Token setup: the Install section of ${siteUrl}/llms.txt.`)
  out.push(install.join('\n\n'))

  const use = usageSection(input.usage)
  if (use) out.push(use)

  out.push(...partsAndVariants(component.name, input.propTables))

  const props = propsSection(input.propTables)
  if (props) out.push(props)

  if (publicSystemPrompt(input.prompt)) {
    out.push(
      `## Remix prompt\n\nOnly when the user wants ${component.name} rebuilt from scratch instead of installed: the public part of its remix prompt is in the Remix panel at ${root}/${component.slug}.`,
    )
  }

  if (input.related.length > 0) {
    out.push(
      `## More ${system.name} components\n\n${input.related.map((r) => `- [${r.name}](${root}/${r.slug}.md)`).join('\n')}`,
    )
  }

  return out.join('\n\n') + '\n'
}

export interface SystemTemplateInput {
  system: { slug: string; name: string; paid: boolean }
  template: SystemTemplate
  others: SystemTemplate[]
  /** System components the template installs with it, in registry order. */
  uses: SystemComponent[]
  iconCount: number
  withTokens: boolean
  usage?: Usage | null
  siteUrl: string
}

// A template page shows no source either, so its twin is name, install and links only.
export function systemTemplateMarkdown(input: SystemTemplateInput): string {
  const { system, template, siteUrl } = input
  const root = `${siteUrl}/design-systems/${system.slug}`
  const free = template.installTier === 'free account'
  const out: string[] = [
    `# ${template.name} (${system.name} template)`,
    identity(template.name, `a ${license(!free)} page template of the ${system.name} design system`, siteUrl),
    template.description,
    [
      `- Design system: [${system.name}](${root}.md)`,
      `- License: ${free ? 'MIT' : 'Premium (proprietary)'}`,
      `- Install slug: \`${template.registrySlug}\``,
      `- Live preview: ${root}/templates/${template.folder}`,
    ].join('\n'),
  ]
  // What lands in the project goes before the command that puts it there.
  if (input.uses.length > 0) {
    const parts = [
      `## What it installs`,
      `The page itself plus ${input.uses.length} ${system.name} components:`,
      input.uses.map((u) => `- [${u.name}](${root}/${u.slug}.md) (\`${u.registrySlug}\`)`).join('\n'),
    ]
    const extras = [input.withTokens && `the ${system.name} tokens`, input.iconCount > 0 && `${input.iconCount} AI Canvas icons`].filter(Boolean)
    if (extras.length > 0) parts.push(`Also ${extras.join(' and ')}.`)
    out.push(parts.join('\n\n'))
  }
  out.push(
    [
      `## Install`,
      fence(`npx shadcn@latest add @aicanvas/${template.registrySlug}`, 'bash'),
      free
        ? `Needs a free AI Canvas account; signed out, the command writes a placeholder (an \`AccountRequired\` notice) instead.`
        : `Requires Premium. Without a Premium token the command writes a placeholder (a \`PremiumLocked\` notice) instead of the template.`,
      `Token setup: the Install section of ${siteUrl}/llms.txt.`,
    ].join('\n\n'),
  )
  const use = usageSection(input.usage, 'The page')
  if (use) out.push(use)
  out.push(
    `## Source\n\n${free ? 'Install with the command above to get the source.' : `The source is Premium and is not published. Preview it at ${root}/templates/${template.folder}.`}`,
  )
  if (input.others.length > 0) {
    out.push(
      `## More ${system.name} templates\n\n${input.others.map((o) => `- [${o.name}](${root}/templates/${o.folder}.md)`).join('\n')}`,
    )
  }
  return out.join('\n\n') + '\n'
}
