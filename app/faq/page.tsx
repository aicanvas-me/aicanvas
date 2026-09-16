import type { Metadata } from 'next'
import { SITE_URL } from '../lib/config'
import { FaqView, type FaqCategory } from './FaqView'

// ─── FAQ content ──────────────────────────────────────────────────────────────
// Researched and fact-checked against the codebase. Answers are PLAIN TEXT so the
// same strings power both the rendered accordion and the FAQPage JSON-LD below.
// Premium is written as a live, available tier (owner's direction). NOTE: the
// on-site upgrade button still renders "Coming soon" (NEXT_PUBLIC_CHECKOUT_COMING_SOON)
// and the customer portal / cancel flow is not wired yet, so flip the checkout
// flag and wire cancel before this copy fully matches the live site.
// Model: browsing is free and public; FREE entries publish their whole remix
// prompt; PREMIUM entries publish only the setup and constants blocks unless
// the viewer is Premium; the one-command install needs a free account
// (unlimited, uncounted); Premium adds the closed-source premium components,
// blocks, design systems, and templates plus their full remix prompts.
// Prices ($8.99/mo, $49.99/yr)
// mirror PremiumCards.tsx — update in lockstep.
const FAQ_CATEGORIES: FaqCategory[] = [
  {
    category: 'Getting started',
    slug: 'getting-started',
    blurb:
      'New here? Start with these. Learn what AI Canvas is, who it is for, and how to get your first component into your project in under a minute.',
    items: [
      {
        q: 'What is AI Canvas?',
        a: 'AI Canvas is a registry of animated React components, design systems, and templates you can install straight into your project. Open source and free to start: every free component ships with its full source code, so you use it as is or rebuild it your way. Premium adds more components, complete design systems, and templates. React is a popular tool for building modern products’ user interfaces.',
      },
      {
        q: 'Do I need to know how to code to use it?',
        a: 'No. If you can copy and paste, you can use AI Canvas. And if you do not write code, paste the install command into your AI agent and it will pull the component, design system, or template into your project for you.',
      },
      {
        q: 'How do I get my first component in under a minute?',
        a: 'Open any component page, click Copy CLI to grab its install command, paste it into your terminal, and run it. The component drops into your project as real, editable code, and a free account unlocks unlimited one-command installs, free forever.',
      },
      {
        q: 'What is a CLI?',
        a: 'A CLI, or command-line interface, is a text box where you type one short command to make your computer do something. With AI Canvas you run one command and a finished component lands in your project, ready to use.',
      },
      {
        q: 'What is a design system?',
        a: 'A design system is a complete visual language where every color, spacing, and style comes from one shared source, so everything looks like it belongs together. Explore Andromeda, our live design system, to see one in action.',
        link: { label: 'Andromeda Legacy', href: '/design-systems/andromeda' },
      },
      {
        q: 'What is MCP?',
        a: 'MCP is a standard that connects an AI coding tool like Claude Code, Codex, or Cursor directly to AI Canvas, so it can browse and install components for you inside the chat. See the AI Canvas MCP section for setup.',
      },
      {
        q: 'Is AI Canvas free to use?',
        a: 'Yes. Browsing, previewing, and copying the full prompt of any free component are always free, and a free account unlocks unlimited one-command installs, free forever. Premium adds the closed-source premium components and blocks with their full remix prompts, design systems, and templates at $8.99 per month or $49.99 per year when you want more.',
      },
    ],
  },
  {
    category: 'Installing components',
    slug: 'installing',
    blurb:
      'Three easy ways to get a component into your project: one CLI command, your AI agent, or a copy and paste of the source. Free components are open source and copy-paste ready. Premium source and its full remix prompt need a subscription.',
    items: [
      {
        q: 'How do I install a component?',
        a: 'Open any component page and copy its install command, then run it in your terminal. The command uses the shadcn CLI to drop the real, editable source straight into your project. You can also have your AI coding agent run it for you, or copy the source by hand.',
      },
      {
        q: 'Can I just paste the command into my AI agent?',
        a: 'Yes. Paste the install command into Claude Code, Codex, Cursor, or any AI coding tool and it can run it for you. For an even smoother flow, connect the AI Canvas MCP and your agent can browse, inspect, and install components without leaving the chat.',
      },
      {
        q: 'Can I copy the source code instead of using the CLI?',
        a: 'Yes, for free components: every free component page has a Manual tab that lists the packages to install and the full source to paste in. The free library is open source under MIT, and that source is never hidden. Premium components and blocks show their source once you subscribe. Premium is proprietary: a durable licence to use and ship, not to redistribute.',
      },
      {
        q: 'Which frameworks and stacks do the components work in?',
        a: 'Components are React with TypeScript, styled with Tailwind CSS and animated with Framer Motion, and some 3D ones use Three.js. They are built for the Next.js App Router and work in any modern React setup, so you can drop them into most React projects.',
      },
      {
        q: 'What is the shadcn registry, and how does AI Canvas use it?',
        a: 'A registry is a place the shadcn CLI can pull components from by URL. AI Canvas serves its components in this format, which is why one command installs any of them as real source code, not a screenshot to rebuild.',
      },
      {
        q: 'Why install with the CLI?',
        a: 'One command pulls in a finished, fully typed component plus its dependencies and places the editable source right in your project. Starting from a finished component turns the job from generate into adapt, which means fewer AI tokens and fewer back and forth rounds on every build.',
      },
      {
        q: 'How many components can I install for free?',
        a: 'A free account unlocks unlimited one-command installs, uncounted, and remix with AI on every free component is free forever. When you want more, Premium adds the closed-source premium components and blocks with their full remix prompts, full design systems, and templates, the natural next step once AI Canvas is already paying off.',
      },
    ],
  },
  {
    category: 'AI Canvas MCP',
    slug: 'mcp',
    blurb:
      'Connect your AI coding agent to AI Canvas so it can browse and install finished components for you, right inside the chat.',
    items: [
      {
        q: 'What is the AI Canvas MCP server?',
        a: 'MCP, short for Model Context Protocol, is a standard way for AI tools to plug into outside services. The AI Canvas MCP is a small server that connects your AI coding agent to AI Canvas, so it can find and install components without you leaving the chat. It is free to use.',
      },
      {
        q: 'How do I set up the AI Canvas MCP?',
        a: 'Setup is one command. Grab the exact command for Claude Code, Codex, or Cursor on the MCP page.',
        link: { label: 'MCP page', href: '/mcp' },
      },
      {
        q: 'Which AI agents and tools support it?',
        a: 'It works with Claude Code, Codex, and Cursor, the three coding agents shown on the AI Canvas MCP page. Any other tool that supports MCP can connect by running the same command.',
      },
      {
        q: 'What can my agent do once it is connected?',
        a: "Your agent gets eight read-only tools to browse categories, search components, inspect a component's details and source, list design systems and templates, and get the exact install command. The right code lands in your project from inside the chat, with nothing changed on our side.",
      },
      {
        q: 'How is the MCP different from the shadcn CLI?',
        a: 'The shadcn CLI is a single command you run yourself to add a component, while the MCP lets your AI agent search, inspect, and install components for you inside the chat. Both deliver the same real, open-source code, so you pick whichever fits how you build.',
      },
      {
        q: 'Will brand-new components show up in my agent right away?',
        a: 'New components reach your connected agent about five minutes after they ship, since the MCP reads from the live AI Canvas registry with a short cache. After that your agent can browse and install them like any other component.',
      },
      {
        q: 'Is the AI Canvas MCP free?',
        a: 'Yes, the MCP is free and browsing component details is never metered. Pulling actual component, design system, or template source needs a free account, which gives you unlimited one-command installs. Premium adds the closed-source premium components, design systems, and templates at $8.99 per month or $49.99 per year.',
      },
    ],
  },
  {
    category: 'Design systems',
    slug: 'design-systems',
    blurb:
      'What AI Canvas design systems give you, how they save build time, and how to install a whole system at once.',
    items: [
      {
        q: 'What do I get in an AI Canvas design system?',
        a: 'A design system is a full, matching visual language built around one shared token file, a single place that defines every color, spacing, and font so the whole set looks consistent. You get that token file plus all the React components that follow it, ready to install as real code.',
      },
      {
        q: 'Why use a design system instead of single components?',
        a: 'Every piece already shares the same colors, spacing, and type, so your screens look like one coherent product instead of mismatched parts. Starting from a finished, consistent set means your AI agent adapts rather than generates from scratch, which uses fewer tokens and fewer rounds to ship.',
      },
      {
        q: 'Are design systems Free or Premium?',
        a: 'Individual components from a system install with a free account just like any standalone component, with unlimited one-command installs. Installing a whole system in one command, plus the premium components and templates, is part of Premium.',
      },
      {
        q: 'What does Premium add for design systems?',
        a: 'Premium turns a design system into a one-command install for the entire set and unlocks the closed-source premium components and templates built on top of it. It is the natural next step once a system is already saving you time, priced at $8.99 per month or $49.99 per year.',
      },
    ],
  },
  {
    category: 'Plans and Premium',
    slug: 'plans',
    blurb: 'What you get with a free account, and what Premium unlocks.',
    items: [
      {
        q: 'What can I do on AI Canvas for free?',
        a: 'A lot. Browsing components, previewing them, copying the full AI prompt of any free component, using the MCP, the Lab, and saving favorites are all free. A free account also unlocks unlimited one-command installs. On premium components and blocks you still read part of the prompt for free, and Premium unlocks the rest.',
      },
      {
        q: 'What does install mean here?',
        a: 'Install means pulling a component’s real source code into your own project, usually with one command. You get the actual code to edit and ship, not a screenshot to copy by hand.',
      },
      {
        q: 'Do I need an account to install?',
        a: 'Yes, a free account. Browsing, previewing, and remixing free components with AI are public and need no account, but the one-command install runs against your account, which unlocks unlimited installs at no cost. Run the install anonymously and the CLI returns a friendly placeholder asking you to create a free account, not an error.',
      },
      {
        q: 'Is remixing with AI free?',
        a: 'On every free component and block, yes: the whole prompt is public and needs no account. On premium ones you read the setup and the constants for free, and the rest of the prompt is part of Premium.',
      },
      {
        q: 'What does Premium unlock?',
        a: 'Premium unlocks the closed-source premium components and blocks, their full remix prompts, full design systems you can install as a whole system in one command, and premium templates.',
      },
      {
        q: 'How much does Premium cost?',
        a: 'Premium is $8.99 per month or $49.99 per year, and the yearly plan is a big saving. A free account stays $0 forever, so you only upgrade once AI Canvas is already paying off for you.',
      },
      {
        q: 'Is Premium worth it for someone just starting out?',
        a: 'Start with a free account, since unlimited installs and the free library’s remix prompts cover most early projects. When you want the closed-source premium components, full design systems, and templates, Premium is the natural next step.',
      },
    ],
  },
  {
    category: 'Payments and billing',
    slug: 'billing',
    blurb:
      'Honest answers about secure payments, taxes, and how easy it is to upgrade to Premium when you are ready.',
    items: [
      {
        q: 'How are payments handled, and what is Paddle?',
        a: 'Payments run through Paddle, a trusted billing company that acts as the seller of record, meaning it sells Premium and processes the payment on our behalf. Checkout happens in a secure Paddle popup right on the page, so it stays simple and quick.',
      },
      {
        q: 'Is paying secure?',
        a: 'Yes. Payment is handled entirely by Paddle, a professional billing company and seller of record, so your payment details go straight to them and never sit with us. Your account only unlocks Premium after Paddle confirms the payment, keeping everything verified and safe.',
      },
      {
        q: 'Do you handle taxes?',
        a: 'Yes. As the seller of record, Paddle calculates and handles any applicable taxes for your country at checkout, so the right amount is included automatically. You see the full total before you confirm, with nothing to file yourself.',
      },
      {
        q: 'What payment methods can I use?',
        a: "Checkout uses Paddle's secure popup, which offers the payment options available in your region at the time you pay. You will see exactly which methods you can use right there before you confirm.",
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes. Premium renews automatically, and you can cancel whenever you like from your account settings. You keep full Premium access until the end of the period you already paid for.',
      },
    ],
  },
  {
    category: 'About AI Canvas',
    slug: 'about',
    blurb:
      'What AI Canvas is built with, how it is licensed, who it is for, and why it fits the way you actually build.',
    items: [
      {
        q: 'Is AI Canvas open source?',
        a: 'The free library is open source under MIT, that source is never hidden, and its remix prompts are public in full. Premium is proprietary: a durable licence to use and ship, not to redistribute, and its full remix prompts are part of the subscription. The public repository keeps the free source openly available to read, use, and change.',
      },
      {
        q: 'What licence are the components under, and can I use them commercially?',
        a: 'Free components are MIT, one of the most permissive open-source licences, so you can use them in personal and commercial projects, modify them freely, and ship them without giving credit. Premium is proprietary: a durable licence to use and ship, not to redistribute. Any third-party assets, fonts, or images a component references may carry their own terms, so check those before shipping.',
      },
      {
        q: 'What tech stack do the components use?',
        a: 'Components are React with TypeScript, styled with Tailwind CSS and animated with Framer Motion, and some 3D ones use Three.js. TypeScript is JavaScript with type safety, Tailwind is a styling toolkit, and Framer Motion handles animation. They are built for the Next.js App Router but work in any modern React setup.',
      },
      {
        q: 'How is AI Canvas different from other component libraries?',
        a: 'Most libraries serve one audience, but AI Canvas fits however you build: copy a free component’s AI prompt, run one command with the shadcn CLI, or hand it to an AI agent. The code lands as real code in your project, not a screenshot to chase, so you can restyle, extend, or ship it as is.',
      },
      {
        q: 'Who is AI Canvas for?',
        a: 'It is built for three ways of working. Designers get a polished starting point and shape it toward their own goals. Developers install a component with one command. And AI agents like Claude Code, Codex, or Cursor browse and install components for you. Pick whichever fits how you work.',
      },
      {
        q: 'Is AI Canvas affiliated with Claude, Cursor, Lovable, or V0?',
        a: 'No. AI Canvas is an independent, solo-built project and is not sponsored by, partnered with, or endorsed by any of those tools. It simply works alongside them so your existing AI workflow gets finished components.',
      },
      {
        q: 'Why does AI Canvas exist?',
        a: 'Because the blank screen is the hardest part, and I got tired of watching AI rebuild the same button worse every time. I wanted a starting point that is already good, finished and honest components you can trust and make your own. AI Canvas exists so you spend your energy on what makes your product yours, not on the boring eighty percent everyone redoes.',
      },
      {
        q: 'Who is behind AI Canvas?',
        a: 'One person. AI Canvas is a solo project, built and cared for one component at a time by someone who worries about the easing curve more than is strictly reasonable. It is still early and still growing, and if it makes your work easier, going Premium is the most direct way to help one maker keep building it with the same care.',
      },
    ],
  },
]

const FAQ_DESCRIPTION =
  'Answers about AI Canvas: installing components with the shadcn CLI, the MCP server for AI agents, design systems, plans and Premium pricing, secure payments through Paddle, and remixing with AI. Free to start and open source.'

export const metadata: Metadata = {
  title: 'FAQ',
  description: FAQ_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: 'AI Canvas FAQ',
    description: FAQ_DESCRIPTION,
    url: `${SITE_URL}/faq`,
    type: 'website',
  },
}

// FAQPage structured data: flatten every category's items so the whole page is
// eligible for FAQ rich results. Text mirrors the rendered answers exactly.
const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_CATEGORIES.flatMap((c) =>
    c.items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  ),
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <FaqView categories={FAQ_CATEGORIES} />
    </>
  )
}
