/**
 * Markdown twin of a component page, for AI agents.
 *
 * Coding agents (Claude Code, Cursor, Copilot, OpenCode) ask for
 * `Accept: text/markdown`, and Codex follows the page's
 * `<link rel="alternate" type="text/markdown">`; both land on
 * app/md/components/[slug]. This module turns one registry entry into that
 * document. It is pure (no registry import, no fs) so the gate below is
 * testable without the premium build.
 *
 * The twin is always the SIGNED-OUT view of the page, never more: it is
 * served statically to anonymous agents and never reads an entitlement.
 *   - Free: full source (unless REGISTRY_ENFORCEMENT=enforce).
 *   - Premium: no source.
 * The remix prompt itself never goes in: it is most of the page's length and its
 * "Create ..." steps can push an agent to rebuild instead of install, so the twin
 * points to it in one line. Anything the page withholds from a signed-out visitor
 * must be withheld here.
 */
import { splitPromptAtPaywall } from '../registry/prompt-blocks'
import type { PropTable } from '../../app/components/PropsTable'

/** Where an install lands and how to import it (from the emitted registry item). */
export interface Usage {
  file: string
  importLine: string
  /** Set for a default export that renders with no required props. */
  render?: string
}

export function usageSection(usage: Usage | null | undefined, what = 'It', noProps = false): string | null {
  if (!usage) return null
  const code = usage.render ? `${usage.importLine}\n\n${usage.render}` : usage.importLine
  const tail = noProps && usage.render ? '\n\nIt takes no props.' : ''
  return `## Use it\n\n${what} installs to \`${usage.file}\` (under \`src/\` if your project has one). With the usual \`@/\` alias:\n\n${fence(code, 'tsx')}${tail}`
}

export interface AgentTextInput {
  name: string
  isPremium: boolean
  isBlock: boolean
  /** Set for a design-system component or template; absent for a standalone. */
  system?: { name: string; template?: boolean }
  usage: Usage | null
  /** The exact command the page copies for this viewer. */
  command: string
  withToken: boolean
  hasProps: boolean
  /** The page's Markdown twin, where the props are listed. */
  mdUrl: string
}

/** "Copy for agent": numbered steps to install and use the item, never rebuild it. */
export function componentAgentText(input: AgentTextInput): string {
  const { name, usage } = input
  const tier = input.isPremium ? 'a Premium' : 'a free, MIT-licensed'
  const kind = input.system
    ? `${tier} ${input.system.template ? 'page template' : 'component'} of the ${input.system.name} design system`
    : `${tier} standalone React + Tailwind ${input.isBlock ? 'block' : 'component'}`
  const props = input.system && !input.system.template
    ? `its props and an example are at ${input.mdUrl}`
    : input.hasProps ? `its props are listed at ${input.mdUrl}` : 'it takes no props'
  const steps = [
    usage
      ? `If \`${usage.file}\` (under \`src/\` if the project has one) exists and is the real component, skip to step 3. Never rebuild it from scratch.`
      : `If it is already installed and is the real component, skip to step 3. Never rebuild it from scratch.`,
    `Run \`${input.command}\` (${input.withToken ? 'keep the token out of committed files; ' : ''}add \`--overwrite\` only to replace a placeholder from an earlier try). No \`components.json\`? Run \`npx shadcn@latest init\` first. If the new file is only an \`AccountRequired\` or \`PremiumLocked\` notice, stop and tell me.`,
    usage?.render
      ? `Import it with \`${usage.importLine}\` (use this project's alias if it is not \`@/\`) and render \`${usage.render}\` where I ask; ${props}.`
      : usage
        ? `Import it with \`${usage.importLine}\` (use this project's alias if it is not \`@/\`) and use it where I ask; ${props}.`
        : `Import it and use it where I ask; ${props}.`,
    `Check it type-checks and renders with no console errors, and tell me anything you did differently.`,
  ]
  return `Add ${name} to my project: ${kind} from AI Canvas.\n\n${steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`
}

export interface ComponentMarkdownInput {
  slug: string
  name: string
  description: string
  tags: { label: string; accent?: boolean }[]
  isBlock: boolean
  designSystem?: string
  code: string
  /** The 'Claude Code' lane, or the first prompt present. */
  prompt?: string
  about?: string
  useCases?: string[]
  propTables: PropTable[]
  related: { slug: string; name: string; description: string }[]
  /** From classifyPremium(); a degraded lookup arrives here as true. */
  isPremium: boolean
  /** REGISTRY_ENFORCEMENT === 'enforce': free source leaves the page too. */
  enforcing: boolean
  /** FREE_ACCOUNT_GATE === 'on': free one-command installs need an account. */
  freeAccountGate: boolean
  usage?: Usage | null
  siteUrl: string
}

/** What a signed-out visitor may read. The only place the twin decides it. */
export function publicContent(input: Pick<ComponentMarkdownInput, 'code' | 'prompt' | 'isPremium' | 'enforcing'>): {
  source: string | null
  prompt: string | null
  promptLocked: boolean
} {
  const source = input.isPremium || input.enforcing ? null : input.code
  if (!input.prompt) return { source, prompt: null, promptLocked: false }
  if (!input.isPremium) return { source, prompt: input.prompt, promptLocked: false }
  const split = splitPromptAtPaywall(input.prompt)
  return { source, prompt: split ? split.head : null, promptLocked: true }
}

/** The install-directive comment lines the page shows even when source is withheld. */
export function codeDirectives(code: string): { npm?: string; fonts: string[] } {
  const npm = code.match(/^\/\/ npm install (.+)$/m)?.[1]?.trim()
  const fonts = [
    code.match(/^\/\/ font: (.+)$/m)?.[1]?.trim(),
    code.match(/^\/\/ font-pkg: (.+)$/m)?.[1]?.trim(),
  ].filter((f): f is string => !!f)
  return { npm, fonts }
}

/** A code fence longer than any backtick run inside, so embedded fences survive. */
export function fence(body: string, lang = ''): string {
  const longest = Math.max(0, ...(body.match(/`+/g) ?? []).map((run) => run.length))
  const ticks = '`'.repeat(Math.max(3, longest + 1))
  return `${ticks}${lang}\n${body.trimEnd()}\n${ticks}`
}

function cell(text: string): string {
  return text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim()
}

export function propsSection(tables: PropTable[]): string | null {
  const blocks = tables
    .filter((t) => t.props.length > 0)
    .map((t) => {
      const rows = t.props.map(
        (p) =>
          `| \`${cell(p.name)}${p.optional ? '?' : ''}\` | \`${cell(p.type)}\` | ${p.default ? `\`${cell(p.default)}\`` : ''} | ${cell(p.description)} |`,
      )
      const head = tables.length > 1 ? `### ${t.table}\n\n` : ''
      return `${head}| Prop | Type | Default | Description |\n| --- | --- | --- | --- |\n${rows.join('\n')}`
    })
  return blocks.length > 0 ? `## Props\n\n${blocks.join('\n\n')}` : null
}

export function componentMarkdown(input: ComponentMarkdownInput): string {
  const { slug, name, siteUrl, isPremium } = input
  const pageUrl = `${siteUrl}/components/${slug}`
  const noun = input.isBlock ? 'block' : 'component'
  const category = input.tags.find((t) => t.accent)?.label
  const stack = input.tags.filter((t) => !t.accent).map((t) => t.label)
  const { source, prompt, promptLocked } = publicContent(input)
  const { npm, fonts } = codeDirectives(input.code)

  const out: string[] = []

  // Name, then who it is in one sentence. Agents truncate long fetches, so the
  // way back to the index stays at the top. A standalone belongs to no design system.
  const kind = input.designSystem
    ? `${noun} from AI Canvas (${siteUrl})`
    : `standalone ${noun} from AI Canvas (${siteUrl}): it belongs to no design system and works in any React + Tailwind app`
  out.push(`# ${name}`)
  out.push(
    `${name} is a ${isPremium ? 'Premium' : 'free, MIT-licensed'} ${kind}. Index of every component and install setup: ${siteUrl}/llms.txt`,
  )
  out.push(input.description)

  const facts = [
    category && `- Category: ${category}`,
    stack.length > 0 && `- Built with: ${stack.join(', ')}`,
    `- License: ${isPremium ? 'Premium (proprietary, not in the public repo)' : 'MIT'}`,
    input.designSystem && `- Design system: ${input.designSystem}`,
    `- Page: ${pageUrl}`,
  ].filter(Boolean)
  out.push(facts.join('\n'))

  const install: string[] = ['## Install', fence(`npx shadcn@latest add @aicanvas/${slug}`, 'bash')]
  if (isPremium) {
    install.push(
      `Requires Premium. Set your AI Canvas token as AICANVAS_TOKEN and register the @aicanvas registry with it, as described in the Install section of ${siteUrl}/llms.txt. Without a Premium token the command writes a placeholder (a \`PremiumLocked\` notice) instead of the ${noun}.`,
    )
  } else if (input.freeAccountGate) {
    install.push(
      `Needs a free AI Canvas account. Signed out, the command exits 0 but writes a placeholder (an \`AccountRequired\` notice); check for it before reporting success. Token setup: the Install section of ${siteUrl}/llms.txt.`,
    )
  }
  install.push(
    `AI agents can also get its install command from the read-only AI Canvas MCP server (\`npx -y @aicanvas/mcp\`) and run it. Setup: ${siteUrl}/mcp`,
  )
  if (npm) install.push(`Peer dependencies:\n\n${fence(`npm install ${npm}`, 'bash')}`)
  if (fonts.length > 0) install.push(`Fonts: ${fonts.join('; ')}`)
  out.push(install.join('\n\n'))

  const use = usageSection(input.usage, 'It', !input.propTables.some((t) => t.props.length > 0))
  if (use) out.push(use)

  const props = propsSection(input.propTables)
  if (props) out.push(props)

  if (input.about || input.useCases?.length) {
    const about = ['## About']
    if (input.about) about.push(input.about)
    if (input.useCases?.length) about.push(`Use cases: ${input.useCases.join(', ')}.`)
    out.push(about.join('\n\n'))
  }

  if (source) {
    out.push(`## Source\n\n${fence(source, 'tsx')}`)
  } else if (isPremium) {
    out.push(`## Source\n\nThe source is Premium and is not published. Preview it at ${pageUrl}.`)
  } else {
    out.push(`## Source\n\nInstall with the command above to get the source.`)
  }

  if (prompt) {
    const which = promptLocked ? 'the public part of its remix prompt' : 'its remix prompt'
    out.push(`## Remix prompt\n\nOnly when the user wants ${name} rebuilt from scratch instead of installed: ${which} is in the Remix panel at ${pageUrl}.`)
  }

  if (input.related.length > 0) {
    const links = input.related.map(
      (r) => `- [${r.name}](${siteUrl}/components/${r.slug}.md): ${cell(r.description)}`,
    )
    out.push(`## Related\n\n${links.join('\n')}`)
  }

  return out.join('\n\n') + '\n'
}
