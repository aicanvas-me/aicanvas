// @ts-nocheck — showcase consumes JSX design-system components whose
// forwardRef wrappers lack TypeScript prop types in a .tsx context.
//
// Sibling component (NOT a route file). Both the showcase route and
// the ideation Andromeda landing render this so the body lives in one
// place.
//
// INTERNAL PREVIEW: every component on one page, nothing
// collapsed, for reviewing the system as a whole instead of 40 tabs. The public
// /system is a gallery of cards now (AndromedaGallery), the same shape Lumen
// uses. Dev-only — see preview/page.tsx.
//
// COLLAPSED. This page used to hold 40 hand-written component
// sections, ~1900 lines of them, beside the per-component pages' own
// hand-written demos. Two hand-written bodies is what made the two surfaces
// drift, so the components are now ONE LOOP over the matrix declarations
// (app/_lib/andromeda-pro/matrix/) that the per-component pages also render. The
// curated section copy survives verbatim in section-copy.ts; the FOUNDATION
// blocks below stay hand-authored, because they document tokens rather than
// components and have nothing to declare.
'use client'

import { Fragment, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { JetBrains_Mono } from 'next/font/google'
import { ArrowUpRight } from '@phosphor-icons/react'
import { SiteFooter } from '../../../../components/SiteFooter'
import { tokens } from '../../../../lib/andromeda-pro.generated'
import { mq } from '../../../../lib/andromeda-pro-helpers.generated'
import { buttonVariants } from '../../../../lib/andromeda-pro.generated'
import { andromedaVars, useResolvedVars } from '../../../../lib/andromeda-pro-helpers.generated'
import { AndromedaThemeWrap, AndromedaThemeDock } from '../../AndromedaThemeWrap'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '../../../../lib/andromeda-pro.generated'
import { ANDROMEDA_COMPONENT_META } from '../../../../_lib/andromeda-pro/andromeda-meta'
import { MatrixBlock } from '../../../../_lib/andromeda-pro/matrix/Matrix'
import { SPEC_BY_SLUG } from '../../../../_lib/andromeda-pro/matrix'
import { SECTION_COPY } from '../section-copy'
import { CATEGORY } from '../categories'

// Review order: the gallery's taxonomy (categories.ts), in a fixed reading
// order so charts sit with charts and objects with objects. Within a group,
// the meta order holds. A slug missing from the map lands in Other, visible.
const CATEGORY_ORDER = [
  'Actions', 'Forms', 'Data display', 'Charts', 'Overlays', 'Feedback',
  'Navigation', 'Surfaces', 'Media', 'Objects', 'Other',
] as const
const GROUPED_META = CATEGORY_ORDER.map((category) => ({
  category,
  items: ANDROMEDA_COMPONENT_META.filter((m) => (CATEGORY[m.slug] ?? 'Other') === category),
})).filter((g) => g.items.length > 0)
import { ShowcaseInstall } from '../../../../_components/ShowcaseInstall'
import { ShowcaseInstallCard } from '../../../../_components/ShowcaseInstallCard'

// Same JetBrains Mono setup as the dashboard page so the showcase
// matches the design system's only font exactly.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// ─── Layout helpers ──────────────────────────────────────────────────────────
// Local to this page — they exist only to keep the JSX below readable, not
// to abstract anything reusable.

// their true case; everything around them is body copy. Without this the
// backticks printed literally AND the uppercase transform flattened the camel
// hump, so `onClose` reached the page as ONCLOSE — one unreadable word.
function withCode(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.length > 2 && part.startsWith('`') && part.endsWith('`') ? (
      <code key={i} style={{ fontFamily: 'inherit', color: `var(--at-text-primary, ${tokens.color.text.primary})` }}>
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  )
}

function Section({
  id,
  title,
  kicker,
  description,
  slug,
  allowOverflow,
  children,
}: {
  id?: string
  title: string
  kicker?: string
  description?: string
  // When provided, renders a right-aligned "Open <title>" link in the
  // header pointing at /design-systems/andromeda-pro/<slug>. Foundation
  // sections (Color Palette, Typography) omit this and have no button.
  slug?: string
  // Skip content-visibility for sections whose demo opens an INLINE docs
  // popover (defaultOpen/staticOpen menu, calendar, tooltip) that paints
  // outside the card box. content-visibility implies `contain: paint`, which
  // clips the open popover (the bug the kebab menus hit) — at every width, so
  // this also un-clips desktop. Correctness beats the offscreen-skip perf win
  // for these few sections.
  allowOverflow?: boolean
  children: ReactNode
}) {
  return (
    <Card
      id={id}
      className="scroll-mt-14"
      // Perf: the showcase is a very tall single page, so let the browser skip
      // rendering/layout of each section while it's offscreen. contain-intrinsic-size
      // reserves a placeholder height (scrollbar stays stable), then `auto`
      // remembers the real size after first render. Corner markers are inset
      // (inside the card box), so paint containment never clips them. Degrades
      // gracefully where content-visibility is unsupported. Sections with an
      // open inline popover opt out via `allowOverflow`.
      style={allowOverflow ? undefined : { contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}
    >
      {/* A showcase section is a SECTION, not a card-in-a-dashboard, so it takes
          the section padding step (spacing[6]) rather than Card's spacing[3]
          default. Scoped here on purpose: Card's 12px is a documented must and
          every template depends on it. The inset dividers stay on spacing[3]
          either way — that inset is fixed by rule, it does not track padding. */}
      <CardHeader className="px-[var(--andromeda-6)] py-[var(--andromeda-6)]">
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.sm,
              color: `var(--at-text-muted, ${tokens.color.text.muted})`,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
            }}
          >
            {'/// '}
            {kicker ?? 'Component'}
          </span>
          <CardTitle>{title}</CardTitle>
        </div>
        {slug ? (
          // Plain Link styled with buttonVariants — bypasses Radix Slot,
          // which doesn't tolerate the Button's internal `{icon}{children}`
          // rendering when asChild is true.
          <Link
            href={`/design-systems/andromeda-pro/${slug}`}
            className={buttonVariants({ variant: 'ghost', size: 'md' })}
            style={andromedaVars()}
          >
            Open {title}
            <ArrowUpRight weight="regular" size={14} />
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="p-[var(--andromeda-6)]">
        {description ? (
          <p
            style={{
              margin: 0,
              marginBottom: tokens.spacing[6],
              fontFamily: tokens.typography.fontMono,
              // Body copy, per voice-and-copy: normal case, text.secondary,
              // normal tracking. It used to render uppercase / muted / wide,
              // which is the UI-LABEL treatment — wrong for a paragraph, and
              // the reason every prop name in here lost its camel hump.
              fontSize: tokens.typography.size.md,
              color: `var(--at-text-secondary, ${tokens.color.text.secondary})`,
              letterSpacing: tokens.typography.tracking.normal,
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}
          >
            {withCode(description)}
          </p>
        ) : null}
        {children}
      </CardContent>
    </Card>
  )
}

// ─── The neutral ladder ──────────────────────────────────────────────────────
// The greys are ONE ladder of thirteen steps, numbered by depth in the stack
// rather than by lightness: 100 is the page ground and 1300 the strongest ink
// in BOTH themes, which is what lets a step number keep its meaning when the
// ground inverts. Every surface, border and text role is a name for one of
// these steps, so the three rows under this one are not more colours — they
// are the same thirteen values under the names components actually read.
const NEUTRAL_STEPS = [
  { step: 100,  roles: 'surface.base', note: 'Page ground · template global background' },
  { step: 200,  roles: 'surface.raised', note: 'Cards · panels · template section background' },
  { step: 300,  roles: 'surface.overlay · surface.floating', note: 'Menus · tooltips · anything that floats' },
  { step: 400,  roles: 'surface.hover', note: 'Hover ground' },
  { step: 500,  roles: 'border.subtle', note: 'Dividers' },
  { step: 600,  roles: 'surface.active', note: 'Pressed ground' },
  { step: 700,  roles: 'border.base', note: 'Default edge' },
  { step: 800,  roles: 'border.bright · border.floating', note: 'Hover edge · floating edge' },
  { step: 900,  roles: 'border.strong', note: 'High-emphasis edge' },
  { step: 1000, roles: 'text.faint', note: 'Labels · hints' },
  { step: 1100, roles: 'text.muted', note: 'Kickers · metadata' },
  { step: 1200, roles: 'text.secondary', note: 'Body · descriptions' },
  { step: 1300, roles: 'text.primary', note: 'Headings · values' },
] as const

// Module scope: a fresh object each render would resubscribe the observer every
// frame. The keys are the step numbers, so a row reads its own live value.
const NEUTRAL_VAR_NAMES = Object.fromEntries(
  NEUTRAL_STEPS.map(({ step }) => [String(step), `--andromeda-neutral-${step}`]),
)

function NeutralLadder() {
  const hostRef = useRef(null)
  // Every Section is a Card, and Card spreads andromedaVars() on its root, so
  // the whole --andromeda-* set resolves here. Reading it back is what keeps
  // the printed value and the painted swatch the same fact in either theme —
  // the hue chips above deliberately do the opposite and pin their literal.
  const live = useResolvedVars(hostRef, NEUTRAL_VAR_NAMES)

  return (
    <div ref={hostRef} style={{ width: '100%' }}>
      {NEUTRAL_STEPS.map(({ step, roles, note }, i) => (
        <div
          key={step}
          className="as-neutral-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '72px 132px minmax(0, 1fr) auto',
            alignItems: 'center',
            gap: tokens.spacing[3],
            paddingTop: tokens.spacing[2],
            paddingBottom: tokens.spacing[2],
            borderTop: i === 0 ? 'none' : `1px solid var(--at-border-subtle, ${tokens.color.border.subtle})`,
          }}
        >
          <div
            style={{
              height: 32,
              background: `var(--andromeda-neutral-${step}, ${tokens.color.neutral[step]})`,
              border: `1px solid var(--at-border-base, ${tokens.color.border.base})`,
            }}
          />
          <div
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: `var(--at-text-primary, ${tokens.color.text.primary})`,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.wider,
            }}
          >
            Neutral {step}
          </div>
          <div>
            <div
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.xs,
                color: `var(--at-text-secondary, ${tokens.color.text.secondary})`,
              }}
            >
              {roles}
            </div>
            <div
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.xs,
                color: `var(--at-text-faint, ${tokens.color.text.faint})`,
                marginTop: tokens.spacing[1],
              }}
            >
              {note}
            </div>
          </div>
          <div
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: `var(--at-accent-400, ${tokens.color.accent[400]})`,
              wordBreak: 'break-all',
              textAlign: 'right',
            }}
          >
            {live?.[String(step)] ?? tokens.color.neutral[step]}
          </div>
        </div>
      ))}
      <div
        style={{
          marginTop: tokens.spacing[3],
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.xs,
          color: `var(--at-text-faint, ${tokens.color.text.faint})`,
        }}
      >
        scrim is a name, not a step on this ladder: it darkens whatever sits behind it, in either theme.
      </div>
    </div>
  )
}

// ── Colour specimens ──────────────────────────────────────────────────────
// A specimen reads its own value off the channel: the chip paints
// var(--andromeda-<token>) and the caption prints what that resolved to, so
// both halves are the same fact in either theme. This is the contract
// NeutralLadder already keeps. The chips used to pin the dark literal on the
// grounds that a themed fill would caption one colour and paint another —
// true of a literal caption, but it also made the light theme invisible on
// the page that documents it, and a palette you cannot see is one you cannot
// review. Printing the RESOLVED value keeps the pair honest instead.
const cssVarName = (token) => `--andromeda-${token.replace(/\./g, '-')}`
const literalOf = (token) => token.split('.').reduce((o, k) => o?.[k], tokens.color)

// `names` is a useEffect dep inside useResolvedVars, so each row's map is
// built ONCE here. Rebuilt per render it would resubscribe the observer every
// frame — the same trap NEUTRAL_VAR_NAMES avoids.
const swatchRow = (label, kind, items) => ({
  label,
  kind,
  items,
  vars: Object.fromEntries(items.map(({ token }) => [token, cssVarName(token)])),
})

const FAMILY_NOTES = ['Pastel · highlight', 'Light · emphasis', 'Solid · icon · base', 'Border · ring', 'Subtle fill']
const familyItems = (family, notes = FAMILY_NOTES) =>
  [100, 200, 300, 400, 500].map((stop, i) => ({ token: `${family}.${stop}`, note: notes[i] }))

const COLOR_ROWS_TOP = [
  swatchRow('Accent · Blue', 'fill', familyItems('accent', [
    'Highlighted text · pastel', 'Light emphasis', 'Active · selected · base', 'Focus borders · dim', 'Glow halos · tinted fills',
  ])),
  swatchRow('Green · Success', 'fill', familyItems('success')),
  swatchRow('Orange · Warning', 'fill', familyItems('warning')),
  swatchRow('Red · Fault', 'fill', familyItems('danger')),
  swatchRow('Alpha · Layered Tints', 'fill', [
    { token: 'accent.alpha',  note: 'Blue selection · highlight' },
    { token: 'success.alpha', note: 'Healthy overlay · positive tint' },
    { token: 'warning.alpha', note: 'Warning overlay · caution tint' },
    { token: 'danger.alpha',  note: 'Fault overlay · error tint' },
    { token: 'surface.alpha', note: 'Modal scrim · backdrop' },
  ]),
]

const COLOR_ROWS_BOTTOM = [
  swatchRow('Surfaces', 'fill', [
    { token: 'surface.base',    note: 'Page void · root' },
    { token: 'surface.raised',  note: 'Cards · panels' },
    { token: 'surface.overlay', note: 'Dropdowns · tips' },
    { token: 'surface.hover',   note: 'Hover state' },
    { token: 'surface.active',  note: 'Pressed state' },
  ]),
  swatchRow('Borders', 'border', [
    { token: 'border.subtle', note: 'Dividers' },
    { token: 'border.base',   note: 'Default edges' },
    { token: 'border.bright', note: 'Focus · hover' },
    { token: 'border.strong', note: 'High emphasis' },
  ]),
  swatchRow('Text', 'text', [
    { token: 'text.primary',   note: 'Headings · values' },
    { token: 'text.secondary', note: 'Body · descriptions' },
    { token: 'text.muted',     note: 'Kickers · metadata' },
    { token: 'text.faint',     note: 'Labels · hints' },
  ]),
]

const captionStyle = {
  fontFamily: tokens.typography.fontMono,
  fontSize: tokens.typography.size.xs,
  color: `var(--at-text-secondary, ${tokens.color.text.secondary})`,
  textTransform: 'uppercase',
  letterSpacing: tokens.typography.tracking.wider,
}

function SwatchRow({ row }) {
  const hostRef = useRef(null)
  const live = useResolvedVars(hostRef, row.vars)

  return (
    <div ref={hostRef}>
      <Row label={row.label}>
        {row.items.map(({ token, note }) => {
          const painted = `var(${cssVarName(token)}, ${literalOf(token)})`
          return (
            <div key={token} style={{ width: 148 }}>
              {row.kind === 'text' ? (
                <div
                  style={{
                    height: 48,
                    border: `1px solid var(--at-border-base, ${tokens.color.border.base})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.md, color: painted, letterSpacing: '0.1em' }}>
                    Aa 01
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    height: 48,
                    marginBottom: tokens.spacing[2],
                    background: row.kind === 'border' ? 'transparent' : painted,
                    border: row.kind === 'border' ? `1px solid ${painted}` : `1px solid var(--at-border-base, ${tokens.color.border.base})`,
                  }}
                />
              )}
              <div style={captionStyle}>{token}</div>
              <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-faint, ${tokens.color.text.faint})`, marginTop: tokens.spacing[1], minHeight: 28 }}>{note}</div>
              <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-accent-400, ${tokens.color.accent[400]})`, marginTop: tokens.spacing[1], wordBreak: 'break-all' }}>
                {live?.[token] ?? literalOf(token)}
              </div>
            </div>
          )
        })}
      </Row>
    </div>
  )
}

function Row({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: tokens.spacing[5] }}>
      {label ? (
        <div
          style={{
            marginBottom: tokens.spacing[3],
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.sm,
            color: `var(--at-text-faint, ${tokens.color.text.faint})`,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: tokens.spacing[3],
          alignItems: 'flex-start',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// The component rail. Driven by the catalog, never by the spec array: it has to
// list what EXISTS. Every anchor target carries scroll-mt-14 because the
// scroller is the content column with the topbar sticky inside it.
function ComponentRail() {
  return (
    <nav
      className="sticky top-14 hidden h-[calc(100vh-3.5rem)] overflow-y-auto lg:flex"
      style={{
        flex: '0 0 auto',
        width: '170px',
        flexDirection: 'column',
        gap: tokens.spacing[1],
        paddingBottom: tokens.spacing[8],
      }}
    >
      <span
        style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.xs,
          color: `var(--at-text-muted, ${tokens.color.text.muted})`,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.widest,
          marginBottom: tokens.spacing[2],
        }}
      >
        {ANDROMEDA_COMPONENT_META.length} components
      </span>
      {GROUPED_META.map((g) => (
        <Fragment key={g.category}>
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: `var(--at-text-muted, ${tokens.color.text.muted})`,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
              marginTop: tokens.spacing[3],
            }}
          >
            {g.category}
          </span>
          {g.items.map((m) => (
            <a
              key={m.slug}
              href={`#c-${m.slug}`}
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.xs,
                letterSpacing: tokens.typography.tracking.wider,
                textDecoration: 'none',
                color: `var(--at-text-secondary, ${tokens.color.text.secondary})`,
              }}
            >
              {m.name}
            </a>
          ))}
        </Fragment>
      ))}
    </nav>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

interface AndromedaShowcaseProps {
  componentCount?: number
  templateCount?: number
}

export default function AndromedaShowcase({
  componentCount = 0,
  templateCount = 0,
}: AndromedaShowcaseProps = {}) {

  return (
    <AndromedaThemeWrap>
    <AndromedaThemeDock />
    <ShowcaseInstall
      installs={[
        { slug: 'andromeda', label: 'All components' },
        { slug: 'andromeda-all', label: 'Everything' },
      ]}
    />
    <div
      className={`as-shell ${jetbrainsMono.variable}`}
      style={{
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: `var(--at-surface-base, ${tokens.color.surface.base})`,
        // All-longhand (no `padding` shorthand) so paddingBottom isn't clobbered.
        paddingTop: tokens.spacing[10],
        paddingLeft: tokens.spacing[8],
        paddingRight: tokens.spacing[8],
        paddingBottom: tokens.spacing[10],
      }}
    >
      <div
        style={{
          maxWidth: '1180px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[6],
        }}
      >
        {/* Responsive reflow — desktop-first. The default (unqualified)
            rules ARE the desktop layout; the mq.md block collapses the dense
            two/three-column section grids to a single column below 768px, and
            mq.sm tightens the page gutter and steps the display title down on
            phones. Grid tracks use minmax(0,…) and items get min-width:0 so a
            wide child (chart/table) can never push the page past the viewport.
            Overrides that compete with an inline style (shell padding, title
            font-size) carry !important per the brain's inline-style rule. */}
        <style>{`
          .as-grid-2 { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
          .as-grid-2 > * { min-width: 0; }
          .as-grid-planet { grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); }
          .as-grid-planet > * { min-width: 0; }
          .as-usage-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .as-usage-grid > * { min-width: 0; }
          ${mq.md} {
            .as-grid-2 { grid-template-columns: minmax(0, 1fr); }
            .as-grid-planet { grid-template-columns: minmax(0, 1fr); }
            .as-usage-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .as-shell { padding: ${tokens.spacing[8]} ${tokens.spacing[5]} !important; padding-bottom: 7.5rem !important; }
          }
          ${mq.sm} {
            .as-usage-grid { grid-template-columns: minmax(0, 1fr); }
            .as-shell { padding: ${tokens.spacing[6]} ${tokens.spacing[4]} !important; padding-bottom: 7.5rem !important; }
            .as-title { font-size: ${tokens.typography.size['3xl']} !important; }
            /* Phones: drop the right-hand usage gloss on the Type Scale and
               Spacing rows — at phone widths it crowds the specimen off-screen.
               Desktop/tablet keep it (rule is mq.sm-only). */
            .as-scale-usage { display: none !important; }
            /* The ProgressBar segment row is fixed geometry (30×6px + 29×3px =
               267px, segments don't shrink). On a sub-~323px phone it would
               exceed the card and widen the page, so let it scroll inside its
               own stack — the sanctioned fixed-geometry behaviour. Inert on
               wider phones/desktop where 267px fits. */
            .as-progress-stack { overflow-x: auto; }
          }
        `}</style>

        {/* Page header — AI Canvas site style (Manrope), not the Andromeda mono
            aesthetic of the demos below. Colours ride the --at- channel with the
            dark literals as fallback: the showcase surface follows the theme
            toggle, so light-on-dark values cannot be pinned here. */}
        {/* A div, not a header: the site bar is the page's banner landmark. */}
        <div style={{ marginBottom: tokens.spacing[6], fontFamily: "var(--font-sans), 'Manrope', system-ui, sans-serif" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--at-text-secondary, #DAE4A0)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 10,
            }}
          >
            Andromeda
          </div>
          <h1
            className="as-title"
            style={{
              margin: 0,
              fontSize: 'clamp(30px, 4.5vw, 42px)',
              fontWeight: 800,
              color: 'var(--at-text-primary, #F4F4FA)',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            System
          </h1>
          <p
            style={{
              margin: '16px 0 0 0',
              maxWidth: '56ch',
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'var(--at-text-secondary, #9B9B9E)',
            }}
          >
            Built for designers, developers, and teams who want a system, not a stylesheet. Tokens, components, templates, and a documented AI Brain that keeps everyone aligned.
          </p>
          <div
            style={{
              marginTop: 16,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--at-text-faint, #7B7B7D)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {componentCount} components · {templateCount} templates · 1 AI Brain · one-command install
          </div>
        </div>
        {/* ── Colors ─────────────────────────────────────────────────────── */}
        <Section
          title="Color Palette"
          kicker="Foundation · Colors"
          description="Four hue families lead: accent (blue), success (green), warning (amber), danger (red), each a 5-stop scale (100 lightest → 500 darkest) with a matching alpha. Every chip below paints the live token and prints what it resolved to, so this section reads the theme you are looking at rather than the dark one. Then the greys, which are one ladder of thirteen steps from 100 (page ground) to 1300 (strongest ink) — the surface, border and text rows after it are names pointing into that ladder, not more colours. Every alpha sits in a single row at the seam between the two halves."
        >
          {/* Swatch chips paint the LITERAL printed beneath them, not the
              themed property. A documentation chip whose fill came off the
              channel would show one colour and caption another the moment a
              theme is defined, which reads as an inverted ramp. The chip frame,
              the label and the note stay on the channel: those are page ink,
              not the specimen. A light specimen would be its own extra row. */}
          {COLOR_ROWS_TOP.map((row) => <SwatchRow key={row.label} row={row} />)}

          <Row label="Neutral ladder · 13 steps">
            <NeutralLadder />
          </Row>

          {COLOR_ROWS_BOTTOM.map((row) => <SwatchRow key={row.label} row={row} />)}

          <div>
            <div style={{ marginBottom: tokens.spacing[3], fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-faint, ${tokens.color.text.faint})`, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.widest }}>
              Usage Reference
            </div>
            <div className="as-usage-grid" style={{ display: 'grid', gap: tokens.spacing[2] }}>
              {[
                { role: 'Page headings',       token: 'text.primary' },
                { role: 'Body · descriptions', token: 'text.secondary' },
                { role: 'Kickers · metadata',  token: 'text.muted' },
                { role: 'Decorative labels',   token: 'text.faint' },
                { role: 'Page background',     token: 'surface.base' },
                { role: 'Card backgrounds',    token: 'surface.raised' },
                { role: 'Hover → pressed',     token: 'surface.hover → surface.active' },
                { role: 'Dividers',            token: 'border.subtle' },
                { role: 'Default borders',     token: 'border.base' },
                { role: 'Focus borders',       token: 'border.bright' },
                { role: 'Active · selected',   token: 'accent.300' },
                { role: 'Accent glow',         token: 'accent.500' },
                { role: 'Warning indicator',   token: 'warning.300 + warning.500' },
                { role: 'Fault indicator',     token: 'danger.300 + danger.500' },
                { role: 'Modal scrim',         token: 'surface.alpha' },
                { role: 'Toned surface',       token: 'accent / warning / danger .alpha' },
              ].map(({ role, token }) => (
                <div key={role} style={{ padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`, background: `var(--at-surface-raised, ${tokens.color.surface.raised})`, border: `1px solid var(--at-border-subtle, ${tokens.color.border.subtle})` }}>
                  <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-muted, ${tokens.color.text.muted})`, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider, marginBottom: tokens.spacing[1] }}>{role}</div>
                  <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-accent-100, ${tokens.color.accent[100]})` }}>{token}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Typography ──────────────────────────────────────────────────── */}
        <Section
          title="Typography"
          kicker="Foundation · Type"
          description="Manrope is the default face; JetBrains Mono stays in the system as the mono face, for content that genuinely needs fixed advance widths. A step on the ramp names three values, not one: a size, its leading, and its tracking. Tracking is a function of size, open at the small end and pulled in at the display end. Weight is the second axis."
        >
          <div style={{ marginBottom: tokens.spacing[5] }}>
            <div style={{ marginBottom: tokens.spacing[3], fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-faint, ${tokens.color.text.faint})`, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.widest }}>
              Type Scale
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Read off the ramp, never re-typed. The old table hardcoded its px
                  values and carried a usage column in prose, which is exactly the
                  second source of truth the roles work was meant to end. */}
              {(['textXs','textSm','textMd','textLg','textXl','text2xl','displayXs','displaySm','displayMd','displayLg','displayXl','display2xl'] as const).map((step) => {
                const size = tokens.typography.size[step];
                const lead = tokens.typography.leading[step];
                const track = (tokens.typography.tracking as Record<string, string>)[step];
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], padding: `${tokens.spacing[2]} 0`, borderBottom: `1px solid var(--at-border-subtle, ${tokens.color.border.subtle})` }}>
                    <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-muted, ${tokens.color.text.muted})`, letterSpacing: tokens.typography.tracking.wider, width: 92, flexShrink: 0 }}>{step}</span>
                    <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-faint, ${tokens.color.text.faint})`, width: 72, flexShrink: 0 }}>{size} / {lead}</span>
                    <span style={{ fontFamily: tokens.typography.fontSans, fontSize: size, lineHeight: lead, letterSpacing: track, color: `var(--at-text-primary, ${tokens.color.text.primary})`, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>Aa</span>
                    <span className="as-scale-usage" style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-faint, ${tokens.color.text.faint})`, flexShrink: 0, textAlign: 'right' }}>{track}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Row label="Weight Scale">
            {[
              { name: 'thin',     val: 200 },
              { name: 'regular',  val: 400 },
              { name: 'medium',   val: 500 },
              { name: 'semibold', val: 600 },
              { name: 'bold',     val: 700 },
            ].map(({ name, val }) => (
              <div key={name} style={{ width: 148 }}>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size['3xl'], fontWeight: val, color: `var(--at-text-primary, ${tokens.color.text.primary})`, letterSpacing: tokens.typography.tracking.wider, marginBottom: tokens.spacing[1] }}>NOVA</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-secondary, ${tokens.color.text.secondary})`, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>weight.{name}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-faint, ${tokens.color.text.faint})` }}>{val}</div>
              </div>
            ))}
          </Row>

          <Row label="Letter Spacing · Tracking">
            {[
              { name: 'tight',  val: '0',      usage: 'Dense data tables' },
              { name: 'normal', val: '0.02em',  usage: 'Inline body text' },
              { name: 'wide',   val: '0.08em',  usage: 'Values · readouts' },
              { name: 'wider',  val: '0.14em',  usage: 'Nav labels' },
              { name: 'widest', val: '0.22em',  usage: 'Kickers · row heads' },
            ].map(({ name, val, usage }) => (
              <div key={name} style={{ width: 160 }}>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.md, fontWeight: 500, color: `var(--at-text-primary, ${tokens.color.text.primary})`, letterSpacing: val, textTransform: 'uppercase', marginBottom: tokens.spacing[1] }}>TRACKING</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-secondary, ${tokens.color.text.secondary})`, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>tracking.{name}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-muted, ${tokens.color.text.muted})` }}>{val || '0'}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-faint, ${tokens.color.text.faint})`, marginTop: tokens.spacing[1] }}>{usage}</div>
              </div>
            ))}
          </Row>
        </Section>

        {/* ── Spacing ────────────────────────────────────────────────────── */}
        <Section
          title="Spacing"
          kicker="Foundation · Spacing"
          description="A 4px-based scale. Token names track the px value: spacing.1 → 4px, spacing.4 → 16px. The scale skips 7, 9, and 11, because only the values the system actually uses are emitted, so the keys you have are the keys you should be reaching for."
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { token: '1',  px: '4px',  usage: 'Micro gaps · dot offsets · sub-line padding' },
              { token: '2',  px: '8px',  usage: 'Icon ↔ text · inline rhythm' },
              { token: '3',  px: '12px', usage: 'Card padding · list rows · default form gap' },
              { token: '4',  px: '16px', usage: 'Row gap · panel content rhythm' },
              { token: '5',  px: '20px', usage: 'Toolbar gap · header rhythm' },
              { token: '6',  px: '24px', usage: 'Section padding · panel gutter' },
              { token: '8',  px: '32px', usage: 'Page gutter · hero margin' },
              { token: '10', px: '40px', usage: 'Page top padding · large breaks' },
              { token: '12', px: '48px', usage: 'Hero bottom · max scale break' },
            ].map(({ token, px, usage }) => (
              <div
                key={token}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[4],
                  padding: `${tokens.spacing[2]} 0`,
                  borderBottom: `1px solid var(--at-border-subtle, ${tokens.color.border.subtle})`,
                }}
              >
                <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-muted, ${tokens.color.text.muted})`, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.widest, width: 110, flexShrink: 0 }}>
                  {`spacing.${token}`}
                </span>
                <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-faint, ${tokens.color.text.faint})`, width: 36, flexShrink: 0 }}>
                  {px}
                </span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
                  <div
                    aria-hidden
                    style={{
                      width: px,
                      height: 8,
                      background: `var(--at-text-primary, ${tokens.color.text.primary})`,
                      flexShrink: 0,
                    }}
                  />
                </div>
                <span className="as-scale-usage" style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: `var(--at-text-faint, ${tokens.color.text.faint})`, flexShrink: 0, textAlign: 'right' }}>
                  {usage}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Components ─────────────────────────────────────────────────────
            One loop, 40 components. Each one renders its own declaration: the
            variant grid across the size ladder, then a states row where every
            forced state sits beside its own Rest baseline, then any state that
            cannot be painted at rest, named with the mechanism that prevents
            it. Nothing here is hand-written per component any more. */}
        {/* The gate. Scoped to the component loop rather than the whole shell so
            the foundation blocks above are never inside it: the forced-state
            selectors are inert without this attribute, and this is the one box
            that should carry it. */}
        <div
          data-andromeda-matrix
          style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[6] }}
        >
          <ComponentRail />
          <div
            style={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[6],
            }}
          >
            {GROUPED_META.map((g) => (
              <Fragment key={g.category}>
                <h2
                  id={`cat-${g.category.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    fontFamily: tokens.typography.fontMono,
                    fontSize: tokens.typography.size.textSm,
                    color: `var(--at-text-muted, ${tokens.color.text.muted})`,
                    textTransform: 'uppercase',
                    letterSpacing: tokens.typography.tracking.widest,
                    margin: 0,
                    marginTop: tokens.spacing[6],
                  }}
                >
                  /// {g.category} · {g.items.length}
                </h2>
                {g.items.map((m) => {
              const spec = SPEC_BY_SLUG[m.slug]
              const copy = SECTION_COPY[m.slug]
              return (
                <Section
                  key={m.slug}
                  id={`c-${m.slug}`}
                  title={copy?.title ?? m.name}
                  kicker={copy?.kicker}
                  description={copy?.description}
                  slug={m.slug}
                  // Derived from the declaration, never repeated by hand: a spec
                  // that opens an inline popover must not sit in a paint-contained
                  // box, or the panel it just opened gets clipped.
                  allowOverflow={spec?.overflow}
                >
                  {spec ? <MatrixBlock spec={spec} /> : null}
                </Section>
              )
                })}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Bottom install card — the two packages, like the brain's card. */}
        <ShowcaseInstallCard />
      </div>
      <SiteFooter />
    </div>
    </AndromedaThemeWrap>
  )
}
