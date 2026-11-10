import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { Manrope, Geist_Mono } from 'next/font/google'
import { GeistPixelCircle } from 'geist/font/pixel'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { ThemeProvider } from './components/ThemeProvider'
import { Sidebar } from './components/Sidebar'
import { ScrollMemory } from './components/ScrollMemory'
import { MobileNav } from './components/MobileNav'
import { TopBar } from './components/TopBar'
import { TopBarProvider } from './components/PageCrumbs'
import { SessionProvider } from './components/auth/SessionProvider'
import { AuthModalProvider } from './components/auth/AuthModalProvider'
import { PaywallModalProvider } from './components/billing/PaywallModalProvider'
import { AuthModal } from './components/auth/AuthModal'
import { DevBranchBadge } from './components/DevBranchBadge'
import { SiteBeacon } from './components/SiteBeacon'
import { PaddlePaymentLink } from './components/billing/PaddlePaymentLink'
import { TOTAL_COMPONENTS } from './lib/component-nav.generated'
import { AI_CANVAS_DEFINITION, GITHUB_URL, SITE_URL } from './lib/config'
import { createClient } from './lib/supabase/server'
import { isFramedPayloadRequest } from './lib/frame'
import { hostedMcpOAuthEnabled } from '../lib/flags'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  // 400 to 800 set the site itself. 200 is the thin display weight of the
  // Andromeda Pro stat readout: without it the browser draws that number at
  // 400, wider and heavier than the component a buyer installs. Nothing uses 300.
  weight: ['200', '400', '500', '600', '700', '800'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const TOTAL = TOTAL_COMPONENTS
const GLOBAL_TITLE = 'AI Canvas: No More AI Slop. Design Systems for AI Agents'
const GLOBAL_DESCRIPTION = `AI Canvas gives your AI agent design systems to build with and reshape, plus ${TOTAL} standalone React components that fit any of them. The free library is MIT; install with shadcn or MCP.`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: GLOBAL_TITLE,
    template: '%s | AI Canvas',
  },
  description: GLOBAL_DESCRIPTION,
  keywords: [
    'react component library',
    'shadcn components',
    'shadcn mcp',
    'shadcn registry',
    'claude code ui',
    'claude design skill',
    'ai slop',
    'standalone react components',
    'design systems for AI agents',
    'design rules for AI agents',
    'react components for AI agents',
  ],
  openGraph: {
    type: 'website',
    siteName: 'AI Canvas',
    title: GLOBAL_TITLE,
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
    title: GLOBAL_TITLE,
    description: GLOBAL_DESCRIPTION,
    images: ['/og-aug2026-aicanvas.me.png'],
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
  description: AI_CANVAS_DEFINITION,
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
  // can see. Only a same-origin frame of a route that renders bare gets this
  // branch: any other page draws chrome that reads the session and throws
  // without the providers (app/lib/frame.ts decides).
  if (isFramedPayloadRequest(await headers())) {
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
        <head>
          {/* A framed document carries no theme of its own, and this branch
              cannot know the visitor's: it renders for the iframe request,
              which arrives before the embedding page has told anyone anything.
              The parent document is same-origin (the branch is gated on it),
              so the frame can simply read the theme off the page embedding it,
              synchronously, before the first paint. [data-frame-light] is what
              globals.css keys the light preview surface AND the Andromeda light
              channel on, so a light visitor's phone preview is light from the
              first paint instead of flashing dark until AndromedaThemeSync's
              effect lands after hydration. AndromedaThemeSync still owns every
              LATER change (the visitor toggling the site theme with the preview
              open). Only design-system routes: a block preview frame takes its
              theme from its own ?theme= param (the parent sets it from the
              linked theme) and does not mirror the parent's class. An
              attribute, not a class, so hydration leaves it alone. */}
          <script dangerouslySetInnerHTML={{ __html: `try{if(location.pathname.indexOf('/design-systems/')===0&&parent!==self&&!parent.document.documentElement.classList.contains('dark'))document.documentElement.setAttribute('data-frame-light','')}catch(e){}` }} />
        </head>
        {/* No overflow-hidden and no scroll column: a framed template preview
            pans its own document, and the site's chrome is what owns that
            scroller on the full page. */}
        <body className="h-full">
          {children}
        </body>
      </html>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // The visitor's site theme, read server-side so the very first byte already
  // carries the right class. Dark is the default: no cookie means dark, which
  // is what every visitor before the toggle existed will keep getting.
  //
  // A cookie rather than localStorage precisely so this can happen here. The
  // server cannot read localStorage, so that route would paint dark and then
  // correct itself, and a light visitor would eat a dark flash on every single
  // navigation. This layout already awaits headers() and the Supabase user, so
  // reading one more request value costs nothing that was not already dynamic.
  const theme = (await cookies()).get('theme')?.value === 'light' ? 'light' : 'dark'

  return (
    <html
      lang="en"
      suppressHydrationWarning
      // The theme class is server-rendered so SSR HTML already matches what the
      // client will have. It cannot be left to a script in <head>: React's
      // hydration pass reconciles the html className back to this JSX, so a
      // class only the script knows about is stripped for a frame, which is
      // exactly the visible flash on refresh.
      className={`${manrope.variable} ${geistMono.variable} ${GeistPixelCircle.variable} ${theme === 'dark' ? 'dark ' : ''}h-full antialiased`}
    >
      <head>
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
        {/* The light marker rides along for the same reason it is set in the
            iframe branch above: a light visitor must not eat a dark flash in
            the phone preview. Only design-system routes — a block preview
            frames /preview/<slug>?frame=1 and takes its theme from ?theme=.
            This branch only runs when the browser withheld Sec-Fetch (the
            branch above handles every modern one), and here the theme is
            already known server-side, so it is baked into the script. */}
        <script dangerouslySetInnerHTML={{ __html: `if(/[?&]frame=1(?:&|$)/.test(location.search)){document.documentElement.setAttribute('data-frame','')${theme === 'light' ? `;if(location.pathname.indexOf('/design-systems/')===0)document.documentElement.setAttribute('data-frame-light','')` : ''}}` }} />
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
      <body className="flex h-full flex-col overflow-hidden bg-sand-50 dark:bg-sand-950">
        {/* First stop for keyboard users: the rail can carry over a hundred
            links before the page itself. Hidden until focused. */}
        <a
          href="#page-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-control focus:bg-sand-50 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-sand-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/60 dark:focus:bg-sand-900 dark:focus:text-sand-50"
        >
          Skip to content
        </a>
        <ThemeProvider initial={theme}>
         <SessionProvider initialUser={user} showConnect={hostedMcpOAuthEnabled()}>
           <AuthModalProvider>
            <PaywallModalProvider>
            <TopBarProvider>
             {/* The one top bar, across the whole window above the rail and
                 the content, drawn from md up and never remounted: a
                 navigation swaps only what is below it. It reads the URL, so
                 it sits inside a Suspense like the rail. */}
             <Suspense fallback={null}>
               <TopBar />
             </Suspense>
             {/* Mobile nav — visible only below md */}
             <Suspense fallback={null}>
               <MobileNav />
             </Suspense>
             {/* The rail and the content sit side by side under the bar.
                 min-h-0 lets the row take the height the bar leaves and no
                 more, so each of the two scrolls on its own. */}
             <div className="flex min-h-0 flex-1">
             {/* Desktop sidebar — hidden on mobile */}
             <Suspense fallback={null}>
               <div className="hidden md:flex">
                 <Sidebar />
               </div>
             </Suspense>
             {/* Content area scrolls independently of the sidebar.
                 .app-scroll-column (globals.css) reserves the scrollbar
                 gutter so the visible width never shifts between auth
                 states, and releases it on routes that clip themselves and
                 own their own scroller — otherwise this column reserves a
                 full-height strip it can never paint a bar in. In CSS rather
                 than an inline style so the :has() release can out-specify
                 it; an inline declaration would always win. */}
             <div className="app-scroll-column aic-page-scroll flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-sand-50 dark:bg-sand-950">
               {/* The page slot. Page roots ask for min-h-full, and this
                   wrapper is what that 100% resolves against.
                   min-h-0 is load-bearing: a flex item's automatic minimum is
                   its content, which would grow this slot to the full page
                   height, stop every overflow-hidden layout root below from
                   clipping, and hand the scroll to this column instead of to
                   the page that declares data-owns-scroll. A long page still
                   scrolls: its overflow is visible and this column is the
                   scroller. */}
               <div id="page-content" tabIndex={-1} className="flex min-h-0 flex-1 flex-col">{children}</div>
             </div>
             </div>
             {/* Owns this column's scroll across navigations: a new page
                 starts at its top, Back returns to where you were. */}
             <ScrollMemory />
             {/* Global auth dialog — toggles between sign-in and sign-up modes */}
             <AuthModal />
            </TopBarProvider>
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
