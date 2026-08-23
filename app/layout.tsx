import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Manrope, Geist_Mono } from 'next/font/google'
import { GeistPixelCircle } from 'geist/font/pixel'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { ThemeProvider } from './components/ThemeProvider'
import { Sidebar } from './components/Sidebar'
import { MobileNav } from './components/MobileNav'
import { SessionProvider } from './components/auth/SessionProvider'
import { AuthModalProvider } from './components/auth/AuthModalProvider'
import { PaywallModalProvider } from './components/billing/PaywallModalProvider'
import { AuthModal } from './components/auth/AuthModal'
import { DevBranchBadge } from './components/DevBranchBadge'
import { SiteBeacon } from './components/SiteBeacon'
import { PaddlePaymentLink } from './components/billing/PaddlePaymentLink'
// Registry-free nav counts (generated) — keeps the heavy component-registry,
// and the three.js/matter-js it references, out of the shared client bundle.
import { CATEGORY_COUNTS, TOTAL_COMPONENTS } from './lib/component-nav.generated'
import { GITHUB_URL, SITE_URL } from './lib/config'
import { createClient } from './lib/supabase/server'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  // Weights 200/300 were declared but never used in the app — dropping them
  // removes two font files from the critical path. Used range is 400–800.
  weight: ['400', '500', '600', '700', '800'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const TOTAL = TOTAL_COMPONENTS
const GLOBAL_DESCRIPTION = `Open-core registry of ${TOTAL} animated React components, design systems, and templates. The free library is MIT. Premium unlocks design systems, templates, and new components. Built with Tailwind CSS and Motion.`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AI Canvas - Animated React Components with AI Reproduction Prompts',
    template: '%s | AI Canvas',
  },
  description: GLOBAL_DESCRIPTION,
  keywords: [
    'animated react components',
    'react component library',
    'framer motion components',
    'tailwind css components',
    'shadcn registry',
    'copy paste react components',
    'UI components with AI prompts',
    'react component AI prompt',
    'V0 animated component',
    'vibe coding UI components',
    'free react UI components',
    'open source animated components',
    'animated UI kit',
  ],
  openGraph: {
    type: 'website',
    siteName: 'AI Canvas',
    title: 'AI Canvas - Animated React Components with AI Reproduction Prompts',
    description: GLOBAL_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
    images: [
      {
        url: '/og-aug2026-aicanvas.me.png',
        width: 2400,
        height: 1260,
        alt: 'AI Canvas: AI native components, design systems, blocks, templates and skills',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Canvas - Animated React Components with AI Reproduction Prompts',
    description: GLOBAL_DESCRIPTION,
    images: ['/og-aug2026-aicanvas.me.png'],
  },
  icons: {
    icon: '/ai-canvas-icon-square.svg',
    shortcut: '/ai-canvas-icon-square.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AI Canvas',
  url: SITE_URL,
  logo: `${SITE_URL}/ai-canvas-icon-square.svg`,
  sameAs: [GITHUB_URL],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI Canvas',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/components?q={search_term_string}`,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'query-input': 'required name=search_term_string',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Two documents share this layout: the site, and the previews the site
  // embeds in itself (block previews on a component page, the mobile template
  // previews). An embedded one paints a single composition over the whole
  // viewport, so every piece below — the auth round trip, the four providers,
  // both nav components, the modal, both analytics scripts — is work nobody
  // can see. Sec-Fetch-Dest is the browser's own answer to "is this document
  // being framed", sent on the document request itself; a browser too old to
  // send it just gets the full shell, which is slower but never wrong.
  if ((await headers()).get('sec-fetch-dest') === 'iframe') {
    return (
      <html
        lang="en"
        suppressHydrationWarning
        // The attribute the head script below would otherwise set from
        // ?frame=1. Resolved here instead: this branch only renders for an
        // embedded document, so globals.css pins the preview surface from the
        // first paint with no script to wait for.
        data-frame=""
        className={`${manrope.variable} ${geistMono.variable} ${GeistPixelCircle.variable} h-full antialiased`}
      >
        {/* No overflow-hidden and no scroll column: a framed template preview
            pans its own document, and the site's chrome is what owns that
            scroller on the full page. */}
        <body className="h-full">{children}</body>
      </html>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      // `dark` is in the server-rendered className so SSR HTML already
      // matches what ThemeProvider sets client-side. Without it, the inline
      // <head> script adds `dark` pre-paint, but React's hydration pass
      // reconciles the html className back to JSX → strips `dark` for one
      // frame → ThemeProvider's effect re-adds it. That round-trip is the
      // visible dark → light → dark flash on refresh.
      className={`${manrope.variable} ${geistMono.variable} ${GeistPixelCircle.variable} dark h-full antialiased`}
    >
      <head>
        {/* Defense-in-depth: extension scripts or future theme toggles might
            mutate the class before hydration. Re-asserting `dark` in the
            head script keeps the live DOM correct even if something else
            stripped it. */}
        {/* The frame=1 check tags mobile-preview iframe documents pre-paint.
            The framed template routes are dynamic + streamed, so the forced-dark
            <style> inside FramePayload (TemplatePreviewShell) arrives with the
            LATE page chunk — the browser's first paint of the streamed shell
            happens before it, showing body's var(--background) (#1A1712, a warm
            brown) as a visible flash filling the phone frame for the whole
            server-render window. globals.css keys on [data-frame] so html/body
            are pinned to the preview surface from the very first paint. A data
            attribute, not a class: React reconciles the html className during
            hydration (which strips classes the JSX doesn't know), but leaves
            other attributes alone. */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('dark');if(/[?&]frame=1(?:&|$)/.test(location.search))document.documentElement.setAttribute('data-frame','')` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {process.env.NODE_ENV === 'development' && <script src="/pufi.js" defer />}
        {process.env.NODE_ENV === 'development' && <script src="/koko.js" defer />}
      </head>
      <body className="flex h-full flex-col overflow-hidden bg-sand-200 dark:bg-sand-950 md:flex-row">
        <ThemeProvider>
          <SessionProvider initialUser={user}>
            <AuthModalProvider>
             <PaywallModalProvider>
              {/* Desktop sidebar — hidden on mobile */}
              <Suspense fallback={null}>
                <div className="hidden md:flex">
                  <Sidebar promoteDS counts={CATEGORY_COUNTS} total={TOTAL_COMPONENTS} />
                </div>
              </Suspense>
              {/* Mobile nav — visible only below md */}
              <Suspense fallback={null}>
                <MobileNav promoteDS counts={CATEGORY_COUNTS} total={TOTAL_COMPONENTS} />
              </Suspense>
              {/* Content area scrolls independently of the sidebar.
                  .app-scroll-column (globals.css) reserves the scrollbar
                  gutter so the visible width never shifts between auth
                  states, and releases it on routes that clip themselves and
                  own their own scroller — otherwise this column reserves a
                  full-height strip it can never paint a bar in. In CSS rather
                  than an inline style so the :has() release can out-specify
                  it; an inline declaration would always win. */}
              <div className="app-scroll-column aic-page-scroll flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-sand-200 dark:bg-sand-950">
                {children}
              </div>
              {/* Global auth dialog — toggles between sign-in and sign-up modes */}
              <AuthModal />
             </PaywallModalProvider>
            </AuthModalProvider>
          </SessionProvider>
        </ThemeProvider>
        {/* Two deliberate systems: Vercel Analytics keeps the visitors count
            and dashboard (per-day hash, disclosed in /privacy); SiteBeacon +
            the /api/e relay add what it can't do — funnel events, checkout
            steps, search queries, js_errors — as identifier-free counts. */}
        <Analytics />
        <SpeedInsights />
        <SiteBeacon />
        <DevBranchBadge />
        {/* Resumes checkout when the URL carries a Paddle payment link (?_ptxn=) */}
        <PaddlePaymentLink />
      </body>
    </html>
  )
}
