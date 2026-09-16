import Link from 'next/link'
import { buttonClasses } from '../../components/buttonClasses'

// Placeholder for /ideation/components. The Components pole exists in the
// sidebar so the hierarchy is visible, but for this ideation pass we only
// build out the Design Systems flow. The production /components grid stays
// canonical for now — link out for the live experience.
export default function IdeationComponentsPlaceholder() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
        Components
      </h1>
      <p className="mt-3 text-base text-sand-600 dark:text-sand-400">
        Standalone components live in the production catalog — this pole is
        preserved here so the new sidebar's mutual-exclusion behaviour is
        visible. Open Design Systems → Andromeda for the new flow.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/design-systems/andromeda-pro/components"
          className={buttonClasses({ variant: 'primary', size: 'md' })}
        >
          Open Andromeda Pro
        </Link>
        <Link
          href="/components"
          className={buttonClasses({ variant: 'outline', size: 'md' })}
        >
          Production /components
        </Link>
      </div>
    </main>
  )
}
