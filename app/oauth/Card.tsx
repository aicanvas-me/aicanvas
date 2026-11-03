import Link from 'next/link'

// A focus page: the site rail and top bar step aside (FOCUS_ROUTE_RE), so the card is the
// whole screen. The logo is the only way out.
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-sand-50 px-4 py-10 dark:bg-sand-950">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-sand-900 dark:text-sand-50">
        <img src="/ai-canvas-icon.svg" alt="" width={20} height={17} className="shrink-0" />
        AI Canvas
      </Link>
      <div className="aic-hero-rise w-full max-w-md rounded-section border border-sand-200 bg-sand-100 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_40px_-16px_rgba(0,0,0,0.14)] sm:p-10 dark:border-sand-800 dark:bg-sand-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_24px_56px_-20px_rgba(0,0,0,0.7)]">
        {children}
      </div>
    </div>
  )
}
