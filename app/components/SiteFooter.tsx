import Link from 'next/link'

// ─── SiteFooter ───────────────────────────────────────────────────────────────
// Shared page footer: a single flat, wrapped row of text links. Order is
// internal nav first (sitewide internal-linking helps SEO), then the legal
// links (Impressum and "Verträge hier kündigen" must be easily and directly
// available per § 5 DDG / § 312k BGB), then external (the shadcn registry
// directory and the @aicanvas/mcp npm package). Text only by design — no logo
// or images. External links open in a new tab.

const linkCls = 'transition-colors hover:text-sand-700 dark:hover:text-sand-200'

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-sand-200 pt-8 dark:border-sand-800">
      <p className="text-xs text-sand-600 dark:text-sand-500">© 2026 AI Canvas - AI Native Components, Design Systems and Templates</p>
      <nav
        aria-label="Footer"
        className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-sand-600 dark:text-sand-500"
      >
        <Link href="/components" className={linkCls}>
          Components
        </Link>
        <Link href="/design-systems/andromeda" className={linkCls}>
          Andromeda Design System
        </Link>
        <Link href="/lab" className={linkCls}>
          Lab
        </Link>
        <Link href="/pricing" className={linkCls}>
          Pricing
        </Link>
        <Link href="/contact" className={linkCls}>
          Contact
        </Link>
        <Link href="/feedback" className={linkCls}>
          Feedback
        </Link>
        <Link href="/faq" className={linkCls}>
          FAQ
        </Link>
        <Link href="/privacy" className={linkCls}>
          Privacy Policy
        </Link>
        <Link href="/terms" className={linkCls}>
          Terms
        </Link>
        <Link href="/refund" className={linkCls}>
          Refund
        </Link>
        <Link href="/premium-license" className={linkCls}>
          Premium License
        </Link>
        <Link href="/kuendigen" className={linkCls}>
          Verträge hier kündigen
        </Link>
        <Link href="/impressum" className={linkCls}>
          Impressum
        </Link>
        <Link href="/credits" className={linkCls}>
          Credits
        </Link>
        <a
          href="https://ui.shadcn.com/docs/directory"
          target="_blank"
          rel="noopener noreferrer"
          className={linkCls}
        >
          shadcn registry
        </a>
        <a
          href="https://www.npmjs.com/package/@aicanvas/mcp"
          target="_blank"
          rel="noopener noreferrer"
          className={linkCls}
        >
          @aicanvas/mcp
        </a>
      </nav>
    </footer>
  )
}
