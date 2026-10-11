import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hostedMcpOAuthEnabled } from '../../../lib/flags'
import { SiteFooter } from '../../components/SiteFooter'
import { SITE_URL } from '../../lib/config'
import { ConnectAgentCard, HOSTED_MCP_URL } from '../ConnectAgentCard'

export const metadata: Metadata = {
  title: 'Hosted MCP docs',
  description: 'Learn how to connect an AI agent to the hosted AI Canvas MCP server and manage its access.',
  alternates: { canonical: `${SITE_URL}/mcp/docs` },
}

const sections = [
  { id: 'address', label: 'Address' },
  { id: 'connect', label: 'Connect' },
  { id: 'tools', label: 'What your agent can do' },
  { id: 'plans', label: 'Free and Premium' },
  { id: 'account', label: 'Your account stays yours' },
  { id: 'ci', label: 'No browser? CI and remote shells' },
  { id: 'stuck', label: 'Stuck signed out?' },
  { id: 'storage', label: 'What we store' },
]

const toolGroups = [
  {
    title: 'Find',
    tools: [
      ['list_categories', 'Lists standalone component categories and the number of components in each.'],
      ['list_components', 'Lists standalone components, with an optional category filter and pagination.'],
      ['search_components', 'Searches components and full-screen templates by keywords and ranks the matches.'],
      ['list_systems', 'Lists coordinated design systems with their shared tokens, utilities and components.'],
      ['list_templates', 'Lists complete example screens, with an optional design-system filter.'],
    ],
  },
  {
    title: 'Read',
    tools: [
      ['get_component', 'Returns one component\'s metadata and complete TSX source.'],
      ['get_system', 'Returns every file in one design system, including shared tokens and utilities.'],
      ['get_template', 'Returns a template with its composition, components and shared tokens.'],
      ['get_component_props', 'Returns a component\'s documented props, types, defaults and descriptions.'],
    ],
  },
  {
    title: 'Plan and check',
    tools: [
      ['compose_page', 'Turns your brief into a component plan with alternatives, install order and uncovered parts.'],
      ['validate_usage', 'Checks component JSX for unknown props, missing required props and invalid string options.'],
      ['get_audit_checklist', 'Returns the final checklist for install completeness, themes, layout, motion and accessibility.'],
    ],
  },
  {
    title: 'Install',
    tools: [
      ['get_install_command', 'Returns the shadcn CLI command for one component, design system or template.'],
    ],
  },
  {
    title: 'Account',
    tools: [
      ['whoami', 'Shows the connected AI Canvas account, its plan and what that plan can install.'],
      ['disconnect', 'Ends this AI agent connection when you ask it to sign out.'],
    ],
  },
] as const

const linkClass =
  'font-medium text-olive-600 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300'
const sectionClass = 'mt-14 sm:mt-16'
const headingClass = 'scroll-mt-24 text-xl font-bold text-sand-900 dark:text-sand-50'
const bodyClass = 'mt-3 text-sand-700 dark:text-sand-300'
const codeClass =
  'overflow-x-auto rounded-lg bg-sand-200 px-4 py-3.5 font-mono text-sm text-sand-700 dark:bg-sand-950 dark:text-sand-300'

export default function HostedMcpDocsPage() {
  if (!hostedMcpOAuthEnabled()) notFound()

  return (
    <>
      <main className="relative mx-auto w-full max-w-4xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        {/* Mobile breadcrumb */}
        <p className="mb-6 text-sm font-semibold md:hidden">
          <span className="text-olive-600 dark:text-olive-500">/MCP / Docs</span>
        </p>

        <header className="mb-10 sm:mb-14">
          <h1 className="max-w-xl text-3xl font-extrabold leading-[1.2] tracking-tight text-sand-900 sm:text-4xl dark:text-sand-50">
            Hosted MCP docs
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-sand-600 dark:text-sand-300">
            Connect any AI agent that supports remote MCP servers with one address, then sign in once in your browser.
            There is nothing to install and no key to paste.
          </p>
        </header>

        <nav
          aria-labelledby="on-this-page"
          className="rounded-xl border border-sand-200 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900"
        >
          <p id="on-this-page" className="font-bold text-sand-900 dark:text-sand-50">
            On this page
          </p>
          <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className={linkClass}>
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section className={sectionClass}>
          <h2 id="address" className={headingClass}>Address</h2>
          <p className={bodyClass}>Use this address. It speaks Streamable HTTP.</p>
          <pre className={`${codeClass} mt-4`}>
            <code>{HOSTED_MCP_URL}</code>
          </pre>
        </section>

        <section className={sectionClass}>
          <h2 id="connect" className={headingClass}>Connect</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sand-700 marker:font-semibold marker:text-sand-900 dark:text-sand-300 dark:marker:text-sand-50">
            <li>Add the address to your AI agent.</li>
            <li>
              The first time it connects, your browser opens. Sign in to AI Canvas or create a free account, then click{' '}
              <span className="font-semibold text-sand-900 dark:text-sand-50">Allow</span>.
            </li>
            <li>Ask for what you want in plain words.</li>
          </ol>
          <div className="mt-8">
            <ConnectAgentCard showDocsLink={false} />
          </div>
        </section>

        <section className={sectionClass}>
          <h2 id="tools" className={headingClass}>What your agent can do</h2>
          <p className={bodyClass}>Your AI agent can use these tools after it connects.</p>
          <div className="mt-5 space-y-5">
            {toolGroups.map((group) => (
              <div
                key={group.title}
                className="overflow-hidden rounded-xl border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900"
              >
                <h3 className="border-b border-sand-200 px-4 py-3 text-sm font-bold text-sand-900 dark:border-sand-800 dark:text-sand-50">
                  {group.title}
                </h3>
                <dl className="divide-y divide-sand-200 dark:divide-sand-800">
                  {group.tools.map(([name, description]) => (
                    <div key={name} className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
                      <dt className="break-all font-mono text-sm font-semibold text-sand-900 dark:text-sand-50">{name}</dt>
                      <dd className="text-sm text-sand-600 dark:text-sand-400">{description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 id="plans" className={headingClass}>Free and Premium</h2>
          <div className="space-y-3 text-sand-700 dark:text-sand-300">
            <p className="mt-3">Free components and design-system components install in full.</p>
            <p>
              Premium items still show up in results, marked as locked, with an{' '}
              <Link href="/pricing" className={linkClass}>
                upgrade
              </Link>{' '}
              link. Your AI agent should tell you instead of writing a placeholder.
            </p>
            <p>Upgrading unlocks them on the same connection, with nothing to reinstall. There is no daily request limit.</p>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 id="account" className={headingClass}>Your account stays yours</h2>
          <div className="space-y-3 text-sand-700 dark:text-sand-300">
            <p className="mt-3">
              Your AI agent gets its own sign-in. It never gets your password or your browser session. It cannot change your
              account, your password or your plan, and it cannot buy anything.
            </p>
            <p>
              Each sign-in lasts an hour and renews itself until you disconnect the AI agent. You get an email when a new AI
              agent connects.
            </p>
            <p>
              See and disconnect every AI agent in{' '}
              <Link href="/account/settings" className={linkClass}>
                Settings, Connected AI agents
              </Link>
              . An AI agent can also disconnect itself with the <code className="font-mono text-sm">disconnect</code> tool.
            </p>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 id="ci" className={headingClass}>No browser? CI and remote shells</h2>
          <p className={bodyClass}>
            Send your API key to the same address as the header{' '}
            <code className="font-mono text-sm">Authorization: Bearer &lt;your key&gt;</code>. Get or rotate the key in{' '}
            <Link href="/account/settings" className={linkClass}>
              account settings
            </Link>
            . Store it as a secret in your CI, never in git.
          </p>
          <p className="mt-4 text-sm font-semibold text-sand-900 dark:text-sand-50">Example for Claude Code</p>
          <pre className={`${codeClass} mt-2`}>
            <code>{`claude mcp add --transport http --scope user aicanvas ${HOSTED_MCP_URL} --header "Authorization: Bearer aic_your_key"`}</code>
          </pre>
        </section>

        <section className={sectionClass}>
          <h2 id="stuck" className={headingClass}>Stuck signed out?</h2>
          <p className={bodyClass}>
            AI Canvas tools may stop answering, or your AI agent may say it is not authorized.
          </p>
          <p className="mt-5 font-semibold text-sand-900 dark:text-sand-50">Possible causes</p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sand-700 marker:text-sand-500 dark:text-sand-300 dark:marker:text-sand-500">
            <li>You disconnected the AI agent in settings.</li>
            <li>The sign-in took longer than your AI agent waits. It usually waits a few minutes, so it gave up.</li>
            <li>The browser says &ldquo;This sign-in request has ended&rdquo; because the request expired or was already answered.</li>
            <li>If you use the header method, you rotated your API key.</li>
          </ul>
          <p className="mt-5 font-semibold text-sand-900 dark:text-sand-50">Fix it</p>
          <p className="mt-2 text-sand-700 dark:text-sand-300">
            Start sign-in again from your AI agent. For Claude Code, run{' '}
            <code className="font-mono text-sm">claude mcp login aicanvas</code>. For Codex, run{' '}
            <code className="font-mono text-sm">codex mcp login aicanvas</code>. In other AI agents, use the reconnect or
            sign-in action, or remove the server and add it again.
          </p>
          <p className="mt-3 text-sand-700 dark:text-sand-300">
            If you are already signed in to aicanvas.me in that browser, it goes straight to Allow. For the header method,
            copy your new key.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 id="storage" className={headingClass}>What we store</h2>
          <p className={bodyClass}>
            For each connected AI agent, we store its name, the address it returns to after sign-in, when it connected, when
            it was last used, and the country of the browser and the AI agent. Sign-in tokens are stored only as hashes.
          </p>
          <p className="mt-3 text-sand-700 dark:text-sand-300">
            Disconnecting deletes the connection. Read the{' '}
            <Link href="/privacy" className={linkClass}>
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <SiteFooter />
      </main>
    </>
  )
}
