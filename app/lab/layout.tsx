// LAB layout — custom top bar only. No left rail, no search, no global
// component nav. The site's global Sidebar + MobileNav are early-return'd on
// `/lab/*` (see app/components/{Sidebar,MobileNav}.tsx), so this layout owns
// the whole chrome for LAB routes.

import Link from 'next/link'
import { TopAuthPill } from '../components/auth/TopAuthPill'
import { LabLogo } from './_components/LabLogo'
import { LabNavActionsProvider } from './_lib/navActionsContext'
import { LabNavCenterSlot, LabNavRightSlot } from './_components/LabNavActionsSlot'

export default function LabLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LabNavActionsProvider>
    <div className="relative flex h-full w-full flex-col bg-sand-200 dark:bg-sand-950">
      <header className="sticky top-0 z-30 relative flex h-14 shrink-0 items-center justify-between border-b border-sand-300 bg-sand-200/90 px-4 backdrop-blur dark:border-sand-800 dark:bg-sand-950/90">
        <LabNavCenterSlot />
        {/* Left: icon + "AI Canvas" (links home, lighter) + divider + "LAB" badge (darker) */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            aria-label="AI Canvas home"
            className="flex items-center gap-2 font-bold text-sand-900 dark:text-sand-50"
          >
            <img
              src="/ai-canvas-icon.svg"
              alt=""
              aria-hidden="true"
              width={20}
              height={17}
              className="shrink-0"
            />
            <span>AI Canvas</span>
          </Link>
          <span
            aria-hidden="true"
            className="h-4 w-px bg-sand-300 dark:bg-sand-700"
          />
          <span className="inline-flex items-center" aria-label="LAB">
            <LabLogo
              variant="compact"
              pixel={1.5}
              gap={1}
              letterGap={0.8}
              bubbles={false}
              noAssembly
            />
          </span>
        </div>

        {/* Right: page-injected actions (e.g. Export menu) + sign in */}
        <div className="flex items-center gap-2">
          <LabNavRightSlot />
          <TopAuthPill />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
    </LabNavActionsProvider>
  )
}
