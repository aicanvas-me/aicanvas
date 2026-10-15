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
 *   - Free: full source (unless REGISTRY_ENFORCEMENT=enforce) and the full
 *     remix prompt, same as the page's server HTML.
 *   - Premium: no source, and only blocks 1 Setup + 2 Constants of the
 *     prompt (splitPromptAtPaywall). No recognisable scaffold = no prompt.
 * Anything the page withholds from a signed-out visitor must be withheld here.
 */
import { splitPromptAtPaywall } from '../registry/prompt-blocks'
import type { PropTable } from '../../app/components/PropsTable'

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

function propsSection(tables: PropTable[]): string | null {
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

  // Agents truncate long fetches, so the way back to the index goes first.
  out.push(
    `> ${isPremium ? 'Premium' : 'Free, MIT-licensed'} ${noun} from AI Canvas. Index of every component and install setup: ${siteUrl}/llms.txt`,
  )
  out.push(`# ${name}`)
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
      `Requires a Premium subscription. Set your AI Canvas token as AICANVAS_TOKEN and register the @aicanvas registry with it, as described in the Install section of ${siteUrl}/llms.txt. Without a Premium token the command writes a placeholder file instead of the ${noun}.`,
    )
  } else if (input.freeAccountGate) {
    install.push(
      `Needs a free AI Canvas account. Signed out, the command exits 0 but writes a placeholder file titled "(free account required)"; check for that title before reporting success. Token setup: the Install section of ${siteUrl}/llms.txt.`,
    )
  }
  install.push(
    `AI agents can also install it through the AI Canvas MCP server (\`npx -y @aicanvas/mcp\`). Setup: ${siteUrl}/mcp`,
  )
  if (npm) install.push(`Peer dependencies:\n\n${fence(`npm install ${npm}`, 'bash')}`)
  if (fonts.length > 0) install.push(`Fonts: ${fonts.join('; ')}`)
  out.push(install.join('\n\n'))

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
    const intro = promptLocked
      ? `The public part of the remix prompt: 1. Setup and 2. Constants. The rest of the build spec (state, markup, how it works) is part of Premium.`
      : `One comprehensive, platform-agnostic prompt for rebuilding or remixing ${name} in any AI coding tool. For the exact ${noun}, install it with the command above.`
    out.push(`## Remix prompt\n\n${intro}\n\n${fence(prompt, 'markdown')}`)
  }

  if (input.related.length > 0) {
    const links = input.related.map(
      (r) => `- [${r.name}](${siteUrl}/components/${r.slug}.md): ${cell(r.description)}`,
    )
    out.push(`## Related\n\n${links.join('\n')}`)
  }

  return out.join('\n\n') + '\n'
}
