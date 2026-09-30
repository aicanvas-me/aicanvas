// @vitest-environment jsdom
//
// RemixPanel is the "Remix with AI" drawer shared by the standalone component
// page and the Andromeda Pro component page. The one behaviour a screenshot
// can't prove — and the one a previous drift actually broke on the Pro page —
// is that the prompt ships in the DOM even while the panel is closed, so it
// gets crawled. That's the load-bearing assertion here.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act, createElement as h } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { RemixPanel } from './RemixPanel'
import { PaywallModalProvider } from '../components/billing/PaywallModalProvider'

// The locked-prompt case renders <Paywall>, which reaches for the auth modal
// and the session — real providers for those pull in the Supabase client and
// network calls neither of which this panel test needs. Stub the two hooks
// instead of standing up the whole provider tree.
vi.mock('@/app/components/auth/AuthModalProvider', () => ({
  useAuthModal: () => ({ open: () => {}, close: () => {}, isOpen: false, mode: 'sign-in', next: null, title: null, subtitle: null, setMode: () => {} }),
}))
vi.mock('@/app/components/auth/SessionProvider', () => ({
  useSession: () => ({
    user: null,
    savedSlugs: new Set<string>(),
    preferences: { package_manager: null, ai_platform: null, newsletter_opt_in: false },
    loading: false,
    refreshSaved: async () => {},
    toggleSaved: async () => {},
    updatePreferences: async () => {},
  }),
}))

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  // jsdom has no matchMedia; framer's reduced-motion hook reads it on mount.
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() { return false },
    })) as typeof window.matchMedia
  }
})

let root: Root | null = null
let host: HTMLDivElement | null = null

const PROMPT = 'Build a button component with a hover state.'

function mount(props: Partial<React.ComponentProps<typeof RemixPanel>> = {}) {
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  act(() => {
    root!.render(
      h(
        PaywallModalProvider,
        null,
        h(RemixPanel, {
          open: true,
          onClose: () => {},
          name: 'Button',
          slug: 'button',
          prompt: PROMPT,
          cliReference: '@aicanvas/button',
          cliCopied: false,
          onCopyCli: vi.fn(),
          ...props,
        }),
      ),
    )
  })
  return host
}

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

describe('RemixPanel', () => {
  it('renders the prompt, the Copy prompt button and the CLI box when open', () => {
    const el = mount({ open: true })
    expect(el.textContent).toContain(PROMPT)
    expect(el.textContent).toContain('Copy prompt')
    // The "Want the exact component?" CLI box.
    expect(el.textContent).toContain('Want the exact component?')
    expect(el.textContent).toContain('npx shadcn@latest add @aicanvas/button')
  })

  it('keeps the prompt in the DOM when closed — the SEO contract', () => {
    const el = mount({ open: false })
    expect(el.textContent).toContain(PROMPT)
  })

  it('is not mounted at all when there is no prompt', () => {
    const el = mount({ prompt: null })
    expect(el.textContent).toBe('')
  })

  it('swaps the Copy prompt button for Unlock when the prompt is locked', () => {
    const el = mount({ promptLocked: true })
    expect(el.textContent).toContain('Unlock full prompt')
    expect(el.textContent).not.toContain('Copy prompt')
    // The withheld portion still isn't in the DOM — only the head that was
    // actually passed in `prompt`.
    expect(el.textContent).toContain(PROMPT)
  })

  it('shows the free-account caption and the premium pill when asked', () => {
    const el = mount({ needsFreeAccount: true, premium: true })
    expect(el.textContent).toContain('Free account required')
    expect(el.textContent).toContain('Premium')
  })
})
