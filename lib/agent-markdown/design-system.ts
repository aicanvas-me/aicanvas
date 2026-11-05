/**
 * Markdown twins of the design-system pages: one per system (overview) and one
 * per system component. Pure builders like ./component.ts; the routes in
 * app/md/design-systems pass the data in.
 *
 * Same rule as every twin: never more than the HTML page shows a SIGNED-OUT
 * visitor. Design-system component pages never ship source in their HTML, so
 * no twin here carries source, Legacy (MIT) included. Pro component pages show
 * a signed-out visitor only the public head of the remix prompt
 * (splitProPromptAtPaywall); Legacy pages have no prompt at all.
 */
import { splitProPromptAtPaywall } from '../registry/prompt-blocks'
import type { PropTable } from '../../app/components/PropsTable'
import { fence, propsSection } from './component'

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

function pointer(siteUrl: string, paid: boolean, what: string): string {
  return `> ${what} of ${paid ? 'a Premium' : 'a free, MIT-licensed'} AI Canvas design system. Index of every system, component and install setup: ${siteUrl}/llms.txt`
}

export function systemMarkdown(s: SystemInput): string {
  const root = `${s.siteUrl}/design-systems/${s.slug}`
  const out: string[] = [pointer(s.siteUrl, s.paid, 'Overview'), `# ${s.name}`, `${s.tagline}. ${s.description}`]

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
  out.push(`## Components\n\nEach link is that component's markdown page: install command, props${s.paid ? ' and the public part of its remix prompt' : ''}.\n\n${components.join('\n')}`)

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
    pointer(siteUrl, system.paid, 'A component'),
    `# ${component.name} (${system.name})`,
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
      ? `Needs a free AI Canvas account; signed out, the command writes a placeholder titled "(free account required)".`
      : `Requires Premium. Without a Premium token the command writes a placeholder instead of the component.`,
  )
  install.push(`Every ${system.name} component at once: \`npx shadcn@latest add @aicanvas/${system.slug}\`.`)
  install.push(`Token setup: the Install section of ${siteUrl}/llms.txt.`)
  out.push(install.join('\n\n'))

  const props = propsSection(input.propTables)
  if (props) out.push(props)

  const prompt = publicSystemPrompt(input.prompt)
  if (prompt) {
    out.push(
      `## Remix prompt\n\nThe public part of this component's remix prompt. The rest of the build spec is part of Premium.\n\n${fence(prompt, 'markdown')}`,
    )
  }

  if (input.related.length > 0) {
    out.push(
      `## More ${system.name} components\n\n${input.related.map((r) => `- [${r.name}](${root}/${r.slug}.md)`).join('\n')}`,
    )
  }

  return out.join('\n\n') + '\n'
}
