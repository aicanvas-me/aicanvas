import { AI_CANVAS_DEFINITION, GITHUB_URL } from './config'
import { BRAIN_TEASER } from './andromeda-pro-brain-teaser.generated'
import type { FaqRow } from '../components/FaqRows'
import { lifetimeEnabled } from '../../lib/flags'
import { HOSTED_MCP_URL } from './hosted-mcp'

// Every FAQ answer on the site, in one place. A question that appears on more
// than one page (homepage, /faq, pricing, the AI Brain page) is ONE entry here,
// so the same question always carries the same answer. Answers are plain text:
// the same strings render the visible rows and the FAQPage structured data.
// Prices mirror PremiumCards.tsx; update them in lockstep.
const BRAIN_FILES = BRAIN_TEASER.totalFiles
const LIFETIME = lifetimeEnabled()

export type FaqEntry = FaqRow & { id: string; category: string }

export const FAQ_CATEGORY_META: { slug: string; category: string; blurb: string }[] = [
  { slug: 'getting-started', category: 'Getting started', blurb: 'Start here. Learn what the design layer for AI coding agents provides and what you can use for free.' },
  { slug: 'installing', category: 'Installing components', blurb: 'Install through one CLI command, give the command to your agent, or copy the source by hand. The result is real, editable code in your project.' },
  { slug: 'mcp', category: 'AI Canvas MCP', blurb: 'Connect your coding agent to AI Canvas. It can search, inspect, and install components from the chat.' },
  { slug: 'design-systems', category: 'Design systems', blurb: 'Design systems your agent builds with and you reshape. Change the tokens and every component follows.' },
  { slug: 'ai-design-skills', category: 'AI design skills', blurb: 'Give Claude Code, Cursor, and Codex the whole system, so what they build next fits it.' },
  { slug: 'standalone', category: 'Standalone components', blurb: 'Effects, motion and blocks that belong to no design system and drop into any of them.' },
  { slug: 'icons', category: 'Icons', blurb: 'An in-house icon set in four styles, with the size and weight yours to set. Line is free to use, the other three come with Premium.' },
  { slug: 'plans', category: 'Plans and Premium', blurb: 'Start free with unlimited installs. Upgrade for Andromeda Pro, its templates, the AI Brain, complete systems, and premium standalone components and blocks.' },
  { slug: 'billing', category: 'Payments and billing', blurb: 'Paddle handles checkout, taxes, and payment details. Cancel Premium at any time and keep access through the paid period.' },
  { slug: 'about', category: 'About AI Canvas', blurb: 'Understand the code, licences, compatibility, and people it serves. One designer builds the project one component at a time.' },
]

const PRO = '/design-systems/andromeda-pro'
const BRAIN = '/design-systems/andromeda-pro/brain'

export const SITE_FAQ: FaqEntry[] = [
  {
    id: 'what-is-ai-canvas',
    category: 'getting-started',
    q: 'What is AI Canvas?',
    a: `${AI_CANVAS_DEFINITION} Free components come with full source and remix prompts under MIT, and a free account adds unlimited one-command installs. Premium adds Andromeda Pro, its templates, the AI Brain, every icon style and every premium standalone component and block.`,
    links: [
      { label: 'MCP', href: '/mcp' },
      { label: 'Andromeda Pro', href: PRO },
      { label: 'AI Brain', href: BRAIN },
    ],
  },
  {
    id: 'need-to-code',
    category: 'getting-started',
    q: 'Do I need to know how to code to use it?',
    a: 'No. Copy and paste the source or install command yourself, or give the command to your AI agent and let it pull the component, design system, or template into your project. With the AI Canvas MCP connected, you can simply ask your agent for what you need.',
    links: [{ label: 'AI Canvas MCP', href: '/mcp' }],
  },
  {
    id: 'what-is-a-cli',
    category: 'getting-started',
    q: 'What is a CLI?',
    a: 'A command-line interface, or CLI, is a text box where you type a command to make your computer do something. With AI Canvas, one command places a finished component in your project as editable code. The installation guide walks through it step by step.',
    links: [{ label: 'installation guide', href: '/docs/installation' }],
  },
  {
    id: 'what-is-a-design-system',
    category: 'getting-started',
    q: 'What is a design system?',
    a: 'A complete visual language where every color, spacing value, font, and style comes from one shared source, so every screen belongs to the same product. Explore Andromeda Pro, or the free Andromeda Legacy, to see one in action.',
    links: [
      { label: 'Andromeda Pro', href: PRO },
      { label: 'Andromeda Legacy', href: '/design-systems/andromeda' },
    ],
  },
  {
    id: 'what-is-mcp',
    category: 'getting-started',
    q: 'What is MCP?',
    a: 'Model Context Protocol, or MCP, is the open standard AI tools use to connect to outside services. It connects Claude Code, Claude, ChatGPT, Codex, VS Code, and Cursor to the AI Canvas MCP, so they can browse and install components from the chat.',
    links: [{ label: 'AI Canvas MCP', href: '/mcp' }],
  },
  {
    id: 'is-ai-canvas-free',
    category: 'getting-started',
    q: 'Is AI Canvas free?',
    a: 'Yes. Browsing, previews, the MCP, the Line icons, saving favorites, and full remix prompts for free components cost nothing; public browsing, previews, prompts and Line icon installs need no account. A free account adds unlimited one-command installs forever, while Premium adds proprietary source and full prompts for premium items, Andromeda Pro, its templates, the AI Brain, the other three icon styles, and premium standalone components and blocks.',
    links: [
      { label: 'MCP', href: '/mcp' },
      { label: 'Line icons', href: '/icons' },
      { label: 'Premium', href: '/pricing' },
    ],
  },
  {
    id: 'install-a-component',
    category: 'installing',
    q: 'How do I install a component?',
    a: 'Open its page and click Copy Command, then run the command in your terminal or give it to your AI agent. The shadcn CLI installs the component and its dependencies as real, editable source. You can also copy the source by hand. The installation guide covers the setup.',
    links: [{ label: 'installation guide', href: '/docs/installation' }],
  },
  {
    id: 'give-command-to-agent',
    category: 'installing',
    q: 'Can I paste the install command into my AI agent?',
    a: 'Yes. Give the command to Claude Code, Codex, Cursor, or another AI coding tool and it can run the installation. Connect the AI Canvas MCP to let your agent browse, inspect, and install components without leaving the chat.',
    links: [{ label: 'AI Canvas MCP', href: '/mcp' }],
  },
  {
    id: 'copy-source-code',
    category: 'installing',
    q: 'Can I copy the source code instead of using the CLI?',
    a: 'Yes. Every free component page has a Manual tab with its packages and full source; the free library is MIT and its source is never hidden. Premium members see premium source and full remix prompts under a durable proprietary licence to use and ship, not redistribute.',
    links: [
      { label: 'MIT', href: '/docs/licensing' },
      { label: 'durable proprietary licence', href: '/premium-license' },
    ],
  },
  {
    id: 'supported-frameworks',
    category: 'installing',
    q: 'Which frameworks and stacks do the components work in?',
    a: 'Components use React with TypeScript, Tailwind CSS, and Framer Motion; some 3D components also use Three.js. They are built for the Next.js App Router and work in any modern React setup.',
  },
  {
    id: 'shadcn-registry',
    category: 'installing',
    q: 'What is the shadcn registry, and how does AI Canvas use it?',
    a: 'A shadcn registry gives the shadcn CLI a URL where it can fetch components. AI Canvas serves components in that format, so one command installs real source code instead of giving you a screenshot to rebuild. Add the @aicanvas registry to your components.json once and install by name.',
    links: [{ label: 'components.json', href: '/docs/components-json' }],
  },
  {
    id: 'works-with-shadcn',
    category: 'installing',
    q: 'Does AI Canvas work with shadcn?',
    a: 'Yes. The shadcn CLI installs AI Canvas components from its registry as editable source. Standalone components also sit beside shadcn, Andromeda, or your own design system in any React project.',
    links: [{ label: 'Standalone components', href: '/components' }],
  },
  {
    id: 'why-use-cli',
    category: 'installing',
    q: 'Why install with the CLI?',
    a: 'One command installs a finished, fully typed component with its dependencies and places the editable source in your project. Your agent starts by adapting finished work instead of generating from scratch, which uses fewer tokens and fewer back-and-forth rounds.',
  },
  {
    id: 'free-install-count',
    category: 'installing',
    q: 'How many components can I install for free?',
    a: 'Unlimited. A free account unlocks uncounted one-command installs and free remix prompts for every free component, forever. Premium adds Andromeda Pro, its templates, the AI Brain and the premium standalones, with full prompts.',
    links: [{ label: 'Premium', href: '/pricing' }],
  },
  {
    id: 'ai-canvas-mcp-server',
    category: 'mcp',
    q: 'What is the AI Canvas MCP server?',
    a: 'A free server that lets your agent find and install AI Canvas components without leaving the chat. It uses the open Model Context Protocol and works with Claude Code, Claude, ChatGPT, Codex, VS Code, and Cursor. Connect it on the MCP page: add it to your agent and sign in once in the browser, or run it locally with npm.',
    links: [{ label: 'MCP page', href: '/mcp' }],
  },
  {
    id: 'set-up-mcp',
    category: 'mcp',
    q: 'How do I set up the AI Canvas MCP?',
    a: `Add ${HOSTED_MCP_URL} to your agent as a remote MCP server and sign in once in the browser; there is no key to copy. The MCP page has the exact step for Claude Code, Claude, ChatGPT, Codex, VS Code, and Cursor, and the MCP docs cover sign-in fixes and running it locally.`,
    links: [
      { label: 'MCP page', href: '/mcp' },
      { label: 'MCP docs', href: '/docs/mcp' },
    ],
  },
  {
    id: 'mcp-supported-agents',
    category: 'mcp',
    q: 'Which AI agents and tools support it?',
    a: 'Claude Code, Claude, ChatGPT, Codex, VS Code with Copilot, and Cursor work with the AI Canvas MCP. Any other tool that supports remote MCP servers can connect through the same address.',
    links: [{ label: 'AI Canvas MCP', href: '/mcp' }],
  },
  {
    id: 'mcp-agent-tools',
    category: 'mcp',
    q: 'What can my agent do once it is connected?',
    a: 'It gets tools to browse categories, search components and icons, inspect details, props and source, list design systems and templates, check a page, and retrieve exact install commands. They only read, so nothing on AI Canvas changes; the one exception, disconnect, ends your own sign-in. The MCP docs list every tool.',
    links: [{ label: 'MCP docs', href: '/docs/mcp' }],
  },
  {
    id: 'mcp-versus-shadcn-cli',
    category: 'mcp',
    q: 'How is the MCP different from the shadcn CLI?',
    a: 'The shadcn CLI runs a command you choose, while the MCP lets your agent search, inspect, and install from the chat. Both deliver real, editable source. Free source is open under MIT, while premium source uses the AI Canvas Premium License.',
    links: [
      { label: 'MIT', href: '/docs/licensing' },
      { label: 'AI Canvas Premium License', href: '/premium-license' },
    ],
  },
  {
    id: 'new-components-in-mcp',
    category: 'mcp',
    q: 'Will brand-new components show up in my agent right away?',
    a: 'New components reach connected agents within about five minutes of release, because the MCP reads from the live AI Canvas registry through a short cache. Your agent can then browse and install them like every other component.',
  },
  {
    id: 'is-mcp-free',
    category: 'mcp',
    q: 'Is the AI Canvas MCP free?',
    a: `Yes. MCP access and browsing component details are free and never metered. Pulling source requires a free account for free items, while premium standalone components, Andromeda Pro, its templates and the AI Brain require Premium at ${LIFETIME ? '$8.99 per month, or $125 once for Lifetime' : '$8.99 per month or $49.99 per year'}.`,
    links: [{ label: 'Premium', href: '/pricing' }],
  },
  {
    id: 'design-system-contents',
    category: 'design-systems',
    q: 'What do I get in an AI Canvas design system?',
    a: 'A shared token file defines every color, spacing value, and font, and every included React component follows it, so changing a token restyles the whole set. It installs as real, editable code you can reshape to your project. See it in Andromeda Pro, or start free with Andromeda Legacy.',
    links: [
      { label: 'Andromeda Pro', href: PRO },
      { label: 'Andromeda Legacy', href: '/design-systems/andromeda' },
    ],
  },
  {
    id: 'why-use-design-system',
    category: 'design-systems',
    q: 'Why use a design system instead of single components?',
    a: 'Every piece already shares the same colors, spacing, and type, so screens look like one product instead of mismatched parts. Your agent adapts a finished, consistent system instead of generating from scratch, using fewer tokens and fewer rounds.',
  },
  {
    id: 'design-systems-free-or-premium',
    category: 'design-systems',
    q: 'Are design systems free or Premium?',
    a: 'Andromeda Legacy components and templates install with a free account, with unlimited one-command installs. Premium installs a complete system in one command and unlocks Andromeda Pro, its components and templates.',
    links: [
      { label: 'Andromeda Legacy', href: '/design-systems/andromeda' },
      { label: 'Premium', href: '/pricing' },
      { label: 'Andromeda Pro', href: PRO },
    ],
  },
  {
    id: 'premium-design-systems',
    category: 'design-systems',
    q: 'What does Premium add for design systems?',
    a: `Andromeda Legacy components and templates stay free with an account. Premium installs the entire design system in one command and unlocks Andromeda Pro, its components and templates, for ${LIFETIME ? '$8.99 per month, or $125 once for Lifetime' : '$8.99 per month or $49.99 per year'}.`,
    links: [{ label: 'Andromeda Pro', href: PRO }],
  },
  {
    id: 'design-system-for-ai-agents',
    category: 'design-systems',
    q: 'What is a design system for AI agents?',
    a: 'A complete system your agent builds with: components, tokens for color, type, and spacing, and written decisions about how the parts fit together. The agent carries those decisions into every new screen and component, and because it all lives in your project, you can change any of it. In Andromeda Pro, those decisions ship as the AI Brain.',
    links: [{ label: 'AI Brain', href: BRAIN }],
  },
  {
    id: 'reshape-design-system',
    category: 'design-systems',
    q: 'Can I change a design system to fit my project?',
    a: 'Yes. It installs as editable source in your project. Change the tokens for color, type, and spacing and every component follows. Edit or replace any component, or ask your agent for new ones, and the system\'s AI Brain keeps them consistent with the rest.',
    links: [{ label: 'AI Brain', href: BRAIN }],
  },
  {
    id: 'what-are-standalone-components',
    category: 'standalone',
    q: 'What are standalone components?',
    a: 'React components and blocks that belong to no design system: backgrounds, glass, 3D and shaders, typography and motion effects, AI agent UI, plus cards, buttons, navigation and widgets. Each one drops into any project as editable source, so you can recolor, retime, or rebuild it. Browse them all in the component library.',
    links: [
      { label: 'AI agent UI', href: '/components/category/ai-agent-ui' },
      { label: 'component library', href: '/components' },
    ],
  },
  {
    id: 'standalone-components',
    category: 'standalone',
    q: 'Do standalone components need a design system?',
    a: 'No. Standalone components belong to no design system. Each uses React and Tailwind, so it drops into any React project beside Andromeda, shadcn, or your own system.',
  },
  {
    id: 'standalone-match-my-design',
    category: 'standalone',
    q: 'Can a standalone component match my design?',
    a: 'Yes. It is plain React and Tailwind source in your project, so you or your agent can swap its colors, fonts, and timing for your own tokens. Free ones also ship a remix prompt that describes the change in plain language.',
    links: [{ label: 'remix prompt', href: '/docs/remix-prompts' }],
  },
  {
    id: 'ai-canvas-icons',
    category: 'icons',
    q: 'Does AI Canvas have icons?',
    a: 'Yes. AI Canvas has its own icon set, drawn in house on one 24-pixel grid, in four styles: line, duotone, solid, and solid duotone. You set the size and pick one of five weights, thin, light, regular, bold or extra bold, and the line scales with the icon.',
    links: [{ label: 'icon set', href: '/icons' }],
  },
  {
    id: 'are-icons-free',
    category: 'icons',
    q: 'Are the icons free?',
    a: 'The Line style is. Every Line icon is free to use, to install, copy or download one at a time, under the AI Canvas Premium License with a one-line credit kept in the code and AI Canvas named in your credits when you publish your source; no visible credit is needed, and Premium members need none. Duotone, Solid and Solid duotone come with Premium, and so does the download of the whole set. The icons are not MIT, and there is no public icon repository.',
    links: [
      { label: 'Line style', href: '/icons' },
      { label: 'AI Canvas Premium License', href: '/premium-license' },
    ],
  },
  {
    id: 'design-skill-for-claude-code',
    category: 'ai-design-skills',
    q: 'What is a design skill for Claude Code?',
    a: 'Files that teach a coding agent how to build and how to check its own work, in the SKILL.md format Claude Code uses. The AI Brain ships two: one builds with Andromeda Pro, one reviews a finished build against every must rule.',
    links: [{ label: 'AI Brain', href: BRAIN }],
  },
  {
    id: 'andromeda-pro-ai-brain',
    category: 'ai-design-skills',
    q: 'What is the Andromeda Pro AI Brain?',
    a: `The design skill for Andromeda Pro: ${BRAIN_FILES} files your agent reads before it builds. The system rules, the foundations, one rule file per component, a building skill, a review skill and the tools that check finished work.`,
    links: [{ label: 'Andromeda Pro', href: PRO }],
  },
  {
    id: 'ai-brain-cursor-codex',
    category: 'ai-design-skills',
    q: 'Does the AI Brain work with Cursor and Codex?',
    a: 'Yes. The files live in your project as plain Markdown and scripts, so any agent that reads files follows them, Claude Code, Cursor and Codex included. The AI Brain docs cover the setup.',
    links: [{ label: 'AI Brain docs', href: '/docs/ai-brain' }],
  },
  {
    id: 'install-ai-brain',
    category: 'ai-design-skills',
    q: 'How do I install the AI Brain?',
    a: `One command installs all ${BRAIN_FILES} files; run it again to update them. The AI Brain comes with Premium, which also opens the reader with every rule a click away.`,
    links: [
      { label: 'Premium', href: '/pricing' },
      { label: 'reader', href: BRAIN },
    ],
  },
  {
    id: 'stop-ai-slop',
    category: 'ai-design-skills',
    q: 'How do I stop AI slop in Claude Code or Cursor?',
    a: 'Give the agent a finished system instead of a blank page. The Andromeda Pro AI Brain tells Claude Code, Cursor, or Codex which tokens and layout patterns to use, and its done-gate fails work that drifts off the system, such as a raw color instead of a token. Change the tokens and the agent builds with yours.',
    links: [{ label: 'Andromeda Pro AI Brain', href: BRAIN }],
  },
  {
    id: 'what-install-means',
    category: 'plans',
    q: 'What does install mean here?',
    a: 'It means pulling a component\'s real source code into your project, usually with one command. You get editable code to change and ship, not a screenshot to rebuild.',
  },
  {
    id: 'account-required-to-install',
    category: 'plans',
    q: 'Do I need an account to install?',
    a: 'Yes, but the account is free and unlocks unlimited installs. Browsing, previews, and full remix prompts for free components remain public without an account. An anonymous CLI request returns a friendly prompt to create an account instead of an error.',
  },
  {
    id: 'is-remixing-free',
    category: 'plans',
    q: 'Is remixing with AI free?',
    a: 'Yes, for every free component and block: its entire remix prompt is public without an account. Premium items show their setup and constants for free, while the rest of each prompt comes with Premium.',
    links: [
      { label: 'remix prompt', href: '/docs/remix-prompts' },
      { label: 'Premium', href: '/pricing' },
    ],
  },
  {
    id: 'premium-includes',
    category: 'plans',
    q: 'What does Premium include?',
    a: 'Your free account keeps unlimited installs. Premium includes Andromeda Pro and its templates, the AI Brain, every premium standalone component and block with full source and remix prompt, the Duotone, Solid and Solid duotone icons, and complete design systems installed in one command. New premium pieces are included as they ship.',
    links: [
      { label: 'Andromeda Pro', href: PRO },
      { label: 'AI Brain', href: BRAIN },
      { label: 'icons', href: '/icons' },
    ],
  },
  {
    id: 'premium-price',
    category: 'plans',
    q: 'How much does Premium cost?',
    a: LIFETIME
      ? 'A free account stays $0 forever. Premium costs $8.99 per month, or $125 once for Lifetime, which keeps Premium for as long as AI Canvas exists with nothing to renew. Prices are before tax, which Paddle adds at checkout where it applies.'
      : 'A free account stays $0 forever. Premium costs $8.99 per month or $49.99 per year, and the yearly plan saves money compared with paying monthly. Prices are before tax, which Paddle adds at checkout where it applies.',
    links: [{ label: 'Premium', href: '/pricing' }],
  },
  ...(LIFETIME
    ? [{
        id: 'lifetime-meaning',
        category: 'plans',
        q: 'What does Lifetime mean?',
        a: 'One payment of $125, plus VAT where applicable, gives you Premium for as long as AI Canvas exists: every premium component, design system and template, including every one we release later, with nothing to renew. Components you install stay yours. A full refund or a chargeback ends it, along with the licence to what you installed. The full terms are in the Premium License.',
        links: [{ label: 'Premium License', href: '/premium-license#lifetime' }],
      }]
    : []),
  {
    id: 'premium-for-beginners',
    category: 'plans',
    q: 'Is Premium worth it for someone just starting out?',
    a: 'Start free. Unlimited installs and complete remix prompts for the free library cover early projects. Upgrade when you want Andromeda Pro, its templates, the AI Brain, proprietary premium standalone components and blocks, or complete design systems.',
    links: [{ label: 'free library', href: '/components' }],
  },
  {
    id: 'payments-and-paddle',
    category: 'billing',
    q: 'How are payments handled, and what is Paddle?',
    a: 'Payments run through Paddle, the seller of record that sells Premium and processes payment on our behalf. Checkout happens in its secure popup on the page.',
    links: [{ label: 'Paddle', href: 'https://www.paddle.com/' }],
  },
  {
    id: 'payment-security',
    category: 'billing',
    q: 'Is paying secure?',
    a: 'Yes. Paddle handles payment details directly, so they never sit with AI Canvas. Your account unlocks Premium only after Paddle confirms the payment.',
  },
  {
    id: 'taxes',
    category: 'billing',
    q: 'Do you handle taxes?',
    a: 'Yes. Prices on the pricing page are before tax. As the seller of record, Paddle adds the tax that applies in your country at checkout, and you see the full total before you confirm, with nothing to file yourself.',
    links: [{ label: 'pricing page', href: '/pricing' }],
  },
  {
    id: 'payment-methods',
    category: 'billing',
    q: 'What payment methods can I use?',
    a: 'Paddle\'s secure checkout shows the payment options available in your region. You see every available method before confirming.',
  },
  {
    id: 'cancel-premium',
    category: 'billing',
    q: 'Can I cancel anytime?',
    a: `Yes. A Premium subscription renews automatically, and you can cancel at any time from Manage subscription in your account settings, or without signing in on the cancellation page. Your access continues until the end of the period you already paid for.${LIFETIME ? ' Lifetime has nothing to cancel.' : ''}`,
    links: [
      { label: 'account settings', href: '/account/settings' },
      { label: 'cancellation page', href: '/kuendigen' },
    ],
  },
  {
    id: 'refunds',
    category: 'billing',
    q: 'Can I get a refund?',
    a: `Purchases are non-refundable, except where the law requires a refund. Consumers in the EU and the UK have the 14-day right of withdrawal for a new purchase, which can end once access has begun. Paddle handles refund and withdrawal requests, and a full refund ends Premium${LIFETIME ? ', Lifetime included' : ''}. The refund policy has the details.`,
    links: [{ label: 'refund policy', href: '/refund' }],
  },
  {
    id: 'open-source',
    category: 'about',
    q: 'Is AI Canvas open source?',
    a: 'The free library is open source under MIT, its full source and remix prompts stay public, and the public repository lets you read, use, and change that code. Premium source is proprietary under a durable licence to use and ship, not redistribute, and full premium remix prompts require Premium.',
    links: [
      { label: 'MIT', href: '/docs/licensing' },
      { label: 'public repository', href: GITHUB_URL },
    ],
  },
  {
    id: 'commercial-use',
    category: 'about',
    q: 'Can I use the components in commercial projects?',
    a: 'Yes. Free components and Andromeda Legacy use the permissive MIT licence, so you can change them and ship them in personal or commercial projects. Keep the MIT licence notice in the source; no visible credit is needed. The Line icons they use are not MIT: they are free under the AI Canvas Premium License, with a one-line credit kept in the code. Premium components, Andromeda Pro, its templates and the AI Brain use the AI Canvas Premium License, a durable licence to use and ship but not redistribute. Third-party assets, fonts, and images follow their own terms when specified.',
    links: [
      { label: 'MIT licence', href: '/docs/licensing' },
      { label: 'AI Canvas Premium License', href: '/premium-license' },
    ],
  },
  {
    id: 'component-tech-stack',
    category: 'about',
    q: 'What tech stack do the components use?',
    a: 'React with TypeScript, Tailwind CSS, and Framer Motion, with Three.js in some 3D components. TypeScript adds type safety, Tailwind handles styling, and Framer Motion handles animation. Components target the Next.js App Router and work in any modern React setup.',
  },
  {
    id: 'different-from-component-libraries',
    category: 'about',
    q: 'How is AI Canvas different from other component libraries?',
    a: 'Most libraries hand you one system as it is. AI Canvas gives you design systems your agent builds with and you reshape, standalone components that fit any of them, and an icon set, all as real source in your project. Install with the shadcn CLI, let your agent do it, or remix a free component with its prompt.',
    links: [
      { label: 'standalone components', href: '/components' },
      { label: 'icon set', href: '/icons' },
    ],
  },
  {
    id: 'different-from-v0-lovable',
    category: 'about',
    q: 'How is AI Canvas different from v0 or Lovable?',
    a: 'Keep v0 or Lovable in your workflow. AI Canvas supplies finished React components, remix prompts, design systems, and templates as editable source for your agent to adapt. It is independent and has no sponsorship, partnership, or endorsement from either tool.',
  },
  {
    id: 'who-is-ai-canvas-for',
    category: 'about',
    q: 'Who is AI Canvas for?',
    a: 'Designers get a polished starting point they can shape. Developers install editable components with one command. AI agents such as Claude Code, Codex, and Cursor browse and install components for you.',
  },
  {
    id: 'tool-affiliations',
    category: 'about',
    q: 'Is AI Canvas affiliated with Claude Code, Codex, or Cursor?',
    a: 'No. It is an independent, solo-built project with no sponsorship, partnership, or endorsement from those tools. It works beside them to give your existing AI workflow finished components.',
  },
  {
    id: 'why-ai-canvas-exists',
    category: 'about',
    q: 'Why does AI Canvas exist?',
    a: 'The blank screen is the hardest part, and AI agents keep rebuilding the same button worse. Finished, honest components give them a strong starting point you can trust and make your own. Spend your energy on what makes the product yours, not the boring eighty percent everyone rebuilds.',
  },
  {
    id: 'who-is-behind-ai-canvas',
    category: 'about',
    q: 'Who is behind AI Canvas?',
    a: 'One designer builds and cares for it, one component at a time, with more attention to easing curves than is strictly reasonable. Going Premium directly supports that work and keeps new components, systems, and tools coming.',
    links: [{ label: 'Going Premium', href: '/pricing' }],
  },
]

// `page` drops the links that point to the page the list sits on.
function pick(ids: string[], page?: string): FaqEntry[] {
  return ids.map((id) => {
    const entry = SITE_FAQ.find((f) => f.id === id)
    if (!entry) throw new Error(`FAQ entry missing: ${id}`)
    return page && entry.links ? { ...entry, links: entry.links.filter((l) => l.href !== page) } : entry
  })
}

export const HOME_FAQ = pick(['what-is-ai-canvas', 'is-ai-canvas-free', 'stop-ai-slop', 'reshape-design-system', 'install-a-component', 'ai-canvas-mcp-server', 'what-are-standalone-components', 'ai-canvas-icons', 'premium-includes', 'commercial-use'])
export const PRICING_FAQ = pick([...(LIFETIME ? ['lifetime-meaning'] : []), 'payments-and-paddle', 'payment-security', 'taxes', 'refunds', 'who-is-ai-canvas-for', 'tool-affiliations'], '/pricing')
export const BRAIN_FAQ = pick(['andromeda-pro-ai-brain', 'design-skill-for-claude-code', 'ai-brain-cursor-codex', 'stop-ai-slop', 'install-ai-brain'], BRAIN)
export const MCP_FAQ = pick(['ai-canvas-mcp-server', 'mcp-supported-agents', 'mcp-agent-tools', 'works-with-shadcn', 'mcp-versus-shadcn-cli', 'is-mcp-free'], '/mcp')

/** /faq: the categories in order, each with its questions. */
export const FAQ_PAGE_CATEGORIES = FAQ_CATEGORY_META.map((c) => ({
  ...c,
  items: SITE_FAQ.filter((f) => f.category === c.slug),
}))

export function faqJsonLd(items: FaqRow[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }
}
