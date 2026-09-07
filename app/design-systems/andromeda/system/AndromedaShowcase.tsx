// Sibling component (NOT a route file). Both the showcase route and
// the ideation Andromeda landing render this so the body lives in one
// place.
'use client'

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { JetBrains_Mono } from 'next/font/google'
import { SiteFooter } from '../../../components/SiteFooter'
import {
  MagnifyingGlass,
  Bell,
  Gear,
  Pulse,
  Users,
  Database,
  Compass,
  Envelope,
  EnvelopeOpen,
  Warning,
  Info,
  ArrowUpRight,
  ArrowClockwise,
  Sliders,
  Export,
  EyeSlash,
  Trash,
  Pencil,
  Copy,
  Star,
  ChartLine,
  ChartBar,
  Clock,
  Keyboard,
  SignOut,
  UserCircle,
} from '@phosphor-icons/react'
import { tokens, light } from '../../../../design-systems/andromeda/tokens'
import { subscribeToTheme } from '../../../../design-systems/andromeda/components/lib/theme'
import { mq } from '../../../../design-systems/andromeda/components/lib/responsive'
import { Button, buttonVariants } from '../../../../design-systems/andromeda/components/Button'
import { IconButton } from '../../../../design-systems/andromeda/components/IconButton'
import { PanelHeader } from '../../../../design-systems/andromeda/components/PanelHeader'
import { PanelMenu } from '../../../../design-systems/andromeda/components/PanelMenu'
import { SegmentedControl } from '../../../../design-systems/andromeda/components/SegmentedControl'
import { DateRangePicker } from '../../../../design-systems/andromeda/components/DateRangePicker'
import { andromedaVars } from '../../../../design-systems/andromeda/components/lib/utils'
import { Badge } from '../../../../design-systems/andromeda/components/Badge'
import { Avatar } from '../../../../design-systems/andromeda/components/Avatar'
import { Input } from '../../../../design-systems/andromeda/components/Input'
import { SearchField } from '../../../../design-systems/andromeda/components/SearchField'
import { NavItem } from '../../../../design-systems/andromeda/components/NavItem'
import { ProgressBar } from '../../../../design-systems/andromeda/components/ProgressBar'
import { HeatGrid } from '../../../../design-systems/andromeda/components/HeatGrid'
import { StatTile } from '../../../../design-systems/andromeda/components/StatTile'
import { Tag } from '../../../../design-systems/andromeda/components/Tag'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '../../../../design-systems/andromeda/components/Card'
import { CornerMarkers } from '../../../../design-systems/andromeda/components/CornerMarkers'
import { Checkbox } from '../../../../design-systems/andromeda/components/Checkbox'
import { Radio, RadioGroup } from '../../../../design-systems/andromeda/components/Radio'
import { Toggle } from '../../../../design-systems/andromeda/components/Toggle'
import { Spinner } from '../../../../design-systems/andromeda/components/Spinner'
import { Slider } from '../../../../design-systems/andromeda/components/Slider'
import { Textarea } from '../../../../design-systems/andromeda/components/Textarea'
import { UserCard } from '../../../../design-systems/andromeda/components/UserCard'
import { UserMenu } from '../../../../design-systems/andromeda/components/UserMenu'
import {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
} from '../../../../design-systems/andromeda/components/Alert'
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from '../../../../design-systems/andromeda/components/EmptyState'
import { RadarChart } from '../../../../design-systems/andromeda/components/RadarChart'
import { TrendChart } from '../../../../design-systems/andromeda/components/TrendChart'
import { Planet } from '../../../../design-systems/andromeda/components/Planet'
import { Tooltip } from '../../../../design-systems/andromeda/components/Tooltip'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableStyles,
} from '../../../../design-systems/andromeda/components/Table'
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from '../../../../design-systems/andromeda/components/Drawer'
// v2 components come from the build-time-injected shim (real re-exports when
// injected, placeholder panels on degraded builds) — never import them from
// design-systems/ directly. See scripts/inject-premium.mjs.
import { MetricChart, Gauge, Waveform, MediaCard, DataTable, MusicPlayer } from '../../../lib/andromeda-v2.generated'
import { ShowcaseInstall } from '../../../_components/ShowcaseInstall'
import { ShowcaseInstallCard } from '../../../_components/ShowcaseInstallCard'

// Same JetBrains Mono setup as the dashboard page so the showcase
// matches the design system's only font exactly.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// Organic demo telemetry for the Trend Chart — deterministic (no Math.random)
// so SSR and client agree. Real day-to-day variance: allocated wanders, used
// tracks at a varying fraction so the gap weaves, reserved holds roughly flat.
// The showcase documents the palette itself, so unlike every other Andromeda
// surface it reads the ACTIVE theme's literal values rather than painting
// through the theme channel. A swatch and the hex printed under it have to
// agree, and `var(--andromeda-theme-accent-300, #0FCFB2)` is not a hex.
//
// It follows the CHANNEL rather than the site's dark class, because this
// component also renders on routes that do not apply the Andromeda theme.
// There the components below stay dark, and the gallery has to say so.
function useAndromedaColors() {
  const [themed, setThemed] = useState(false)
  useEffect(() => {
    // The channel lives on the layout's .andromeda-theme-scope div, never on
    // <html>, so probe the scope element; a page without the scope (the
    // ideation landing) reads as unthemed and stays dark, which is true.
    const read = () => {
      const scope = document.querySelector('.andromeda-theme-scope')
      setThemed(
        !!scope
        && !!getComputedStyle(scope).getPropertyValue('--andromeda-theme-surface-base').trim(),
      )
    }
    read()
    return subscribeToTheme(read)
  }, [])
  return themed ? light.color : tokens.color
}

const _tcFract = (x: number) => x - Math.floor(x)
const _tcNoise = (i: number, s: number) => _tcFract(Math.sin((i + 1) * 12.9898 + s * 78.233) * 43758.5453)
const _tcClamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const TREND_DEMO_DATA = Array.from({ length: 31 }, (_, i) => {
  const allocated = _tcClamp(
    Math.round(8600 + Math.sin(i / 5) * 900 + Math.sin(i / 2.3 + 1) * 700 + (_tcNoise(i, 1) - 0.5) * 1900),
    6200,
    11400,
  )
  return {
    t: i + 1,
    allocated,
    used: Math.round(allocated * (0.76 + _tcNoise(i, 2) * 0.2)),
    reserved: Math.round(1480 + (_tcNoise(i, 3) - 0.5) * 160),
  }
})

// ─── Layout helpers ──────────────────────────────────────────────────────────
// Local to this page — they exist only to keep the JSX below readable, not
// to abstract anything reusable. Each Section is a Card; each Row is a flex
// strip with an uppercase mono mini-label above it.

function Section({
  title,
  kicker,
  description,
  slug,
  allowOverflow,
  children,
}: {
  title: string
  kicker?: string
  description?: string
  // When provided, renders a right-aligned "Open <title>" link in the
  // header pointing at /design-systems/andromeda/<slug>. Foundation
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
  const c = useAndromedaColors()
  return (
    <Card
      // Perf: the showcase is a very tall single page, so let the browser skip
      // rendering/layout of each section while it's offscreen. contain-intrinsic-size
      // reserves a placeholder height (scrollbar stays stable), then `auto`
      // remembers the real size after first render. Corner markers are inset
      // (inside the card box), so paint containment never clips them. Degrades
      // gracefully where content-visibility is unsupported. Sections with an
      // open inline popover opt out via `allowOverflow`.
      style={allowOverflow ? undefined : { contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}
    >
      <CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: c.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
            }}
          >
            {'/// '}{kicker ?? 'Component'}
          </span>
          <CardTitle>{title}</CardTitle>
        </div>
        {slug ? (
          // Plain Link styled with buttonVariants — bypasses Radix Slot,
          // which doesn't tolerate the Button's internal `{icon}{children}`
          // rendering when asChild is true.
          <Link
            href={`/design-systems/andromeda/${slug}`}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            style={andromedaVars() as CSSProperties}
          >
            Open {title}
            <ArrowUpRight weight="regular" size={14} />
          </Link>
        ) : null}
      </CardHeader>
      <CardContent>
        {description ? (
          <p
            style={{
              margin: 0,
              marginBottom: tokens.spacing[6],
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: c.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.wide,
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        ) : null}
        {children}
      </CardContent>
    </Card>
  )
}

function Row({ label, children }: { label?: string; children: ReactNode }) {
  const c = useAndromedaColors()
  return (
    <div style={{ marginBottom: tokens.spacing[5] }}>
      {label ? (
        <div
          style={{
            marginBottom: tokens.spacing[3],
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: c.text.faint,
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

// ─── Page ────────────────────────────────────────────────────────────────────

interface AndromedaShowcaseProps {
  componentCount?: number
  templateCount?: number
}

export default function AndromedaShowcase({
  componentCount = 0,
  templateCount = 0,
}: AndromedaShowcaseProps = {}) {
  const c = useAndromedaColors()
  // Local interactive state used by the live demos below.
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sliderValue, setSliderValue] = useState(64)
  const [thrustValue, setThrustValue] = useState(38)
  const [radioValue, setRadioValue] = useState('default')
  const [chartTypeSm, setChartTypeSm] = useState('line')
  const [chartTypeLg, setChartTypeLg] = useState('line')
  const [periodValue, setPeriodValue] = useState('1w')
  const [heatValue, setHeatValue] = useState(60)
  const [dateRange, setDateRange] = useState({
    start: new Date(2026, 5, 17),
    end:   new Date(2026, 5, 21),
  })

  return (
    <>
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
        // No ground of its own. This page is site chrome, not a template, so the
        // page ground belongs to AndromedaContentColumn (bg-sand-50 / sand-950)
        // and the shell lets it through. Painting Andromeda's own surface.base
        // here put a seam in the light theme, where the two grounds are one
        // step apart (#F4F4F5 against sand-50 #F4F4FA); in dark they are the
        // same value, which is why only light ever showed it. The Section
        // cards still lift off it on surface.raised, so depth is unchanged.
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
            .as-title { font-size: ${tokens.typography.size['2xl']} !important; }
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
            aesthetic of the demos below. Site sand/olive pairs so the header follows
            the site theme like the rest of the page. */}
        <header style={{ marginBottom: tokens.spacing[6], fontFamily: "var(--font-sans), 'Manrope', system-ui, sans-serif" }}>
          <div
            className="text-olive-600 dark:text-olive-400"
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 10,
            }}
          >
            Andromeda
          </div>
          <h1
            className="as-title text-sand-900 dark:text-sand-50"
            style={{
              margin: 0,
              fontSize: 'clamp(30px, 4.5vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            System
          </h1>
          <p
            className="text-sand-600 dark:text-sand-400"
            style={{
              margin: '16px 0 0 0',
              maxWidth: '56ch',
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Built for designers, developers, and teams who want a system, not a stylesheet. Tokens, components, templates, and a documented brain that keeps everyone aligned.
          </p>
          <div
            className="text-sand-500"
            style={{
              marginTop: 16,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {componentCount} components · {templateCount} templates · 1 brain · one-command install
          </div>
        </header>

        {/* ── Colors ─────────────────────────────────────────────────────── */}
        <Section
          title="Color Palette"
          kicker="Foundation · Colors"
          description="Three brand hue palettes lead — accent (turquoise), orange (warning), red (fault) — each a 5-stop scale (100 lightest → 500 darkest) with a matching alpha. The foundational greys follow: surface, border, text. Every alpha sits in a single row at the seam between the two halves."
        >
          <Row label="Accent · Turquoise">
            {[
              { name: 'accent.100', color: c.accent[100], note: 'Highlighted text · pastel' },
              { name: 'accent.200', color: c.accent[200], note: 'Light emphasis' },
              { name: 'accent.300', color: c.accent[300], note: 'Active · selected · base' },
              { name: 'accent.400', color: c.accent[400], note: 'Focus borders · dim' },
              { name: 'accent.500', color: c.accent[500], note: 'Glow halos · tinted fills' },
            ].map(({ name, color, note }) => (
              <div key={name} style={{ width: 148 }}>
                <div style={{ height: 48, background: color, border: `1px solid ${c.border.base}`, marginBottom: tokens.spacing[2] }} />
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.secondary, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>{name}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, marginTop: tokens.spacing[1], minHeight: 28 }}>{note}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.accent[400], marginTop: tokens.spacing[1], wordBreak: 'break-all' }}>{color}</div>
              </div>
            ))}
          </Row>

          <Row label="Orange · Warning">
            {[
              { name: 'orange.100', color: c.orange[100], note: 'Pastel · highlight' },
              { name: 'orange.200', color: c.orange[200], note: 'Light · emphasis' },
              { name: 'orange.300', color: c.orange[300], note: 'Solid · icon · base' },
              { name: 'orange.400', color: c.orange[400], note: 'Border · ring' },
              { name: 'orange.500', color: c.orange[500], note: 'Subtle fill' },
            ].map(({ name, color, note }) => (
              <div key={name} style={{ width: 148 }}>
                <div style={{ height: 48, background: color, border: `1px solid ${c.border.base}`, marginBottom: tokens.spacing[2] }} />
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.secondary, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>{name}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, marginTop: tokens.spacing[1], minHeight: 28 }}>{note}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.accent[400], marginTop: tokens.spacing[1], wordBreak: 'break-all' }}>{color}</div>
              </div>
            ))}
          </Row>

          <Row label="Red · Fault">
            {[
              { name: 'red.100', color: c.red[100], note: 'Pastel · highlight' },
              { name: 'red.200', color: c.red[200], note: 'Light · emphasis' },
              { name: 'red.300', color: c.red[300], note: 'Solid · icon · base' },
              { name: 'red.400', color: c.red[400], note: 'Border · ring' },
              { name: 'red.500', color: c.red[500], note: 'Subtle fill' },
            ].map(({ name, color, note }) => (
              <div key={name} style={{ width: 148 }}>
                <div style={{ height: 48, background: color, border: `1px solid ${c.border.base}`, marginBottom: tokens.spacing[2] }} />
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.secondary, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>{name}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, marginTop: tokens.spacing[1], minHeight: 28 }}>{note}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.accent[400], marginTop: tokens.spacing[1], wordBreak: 'break-all' }}>{color}</div>
              </div>
            ))}
          </Row>

          <Row label="Alpha · Layered Tints">
            {[
              { name: 'accent.alpha',  color: c.accent.alpha,  note: 'Turquoise selection · highlight' },
              { name: 'orange.alpha', color: c.orange.alpha,   note: 'Warning overlay · caution tint' },
              { name: 'red.alpha',     color: c.red.alpha,     note: 'Fault overlay · error tint' },
              { name: 'surface.alpha', color: c.surface.alpha, note: 'Modal scrim · backdrop' },
              { name: 'border.alpha',  color: c.border.alpha,  note: 'Glassy edge · sheen' },
            ].map(({ name, color, note }) => (
              <div key={name} style={{ width: 148 }}>
                <div style={{ height: 48, background: color, border: `1px solid ${c.border.base}`, marginBottom: tokens.spacing[2] }} />
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.secondary, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>{name}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, marginTop: tokens.spacing[1], minHeight: 28 }}>{note}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.accent[400], marginTop: tokens.spacing[1], wordBreak: 'break-all' }}>{color}</div>
              </div>
            ))}
          </Row>

          <Row label="Surfaces">
            {[
              { name: 'surface.base',    color: c.surface.base,    note: 'Page void · root' },
              { name: 'surface.raised',  color: c.surface.raised,  note: 'Cards · panels' },
              { name: 'surface.overlay', color: c.surface.overlay, note: 'Dropdowns · tips' },
              { name: 'surface.hover',   color: c.surface.hover,   note: 'Hover state' },
              { name: 'surface.active',  color: c.surface.active,  note: 'Pressed state' },
            ].map(({ name, color, note }) => (
              <div key={name} style={{ width: 148 }}>
                <div style={{ height: 48, background: color, border: `1px solid ${c.border.base}`, marginBottom: tokens.spacing[2] }} />
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.secondary, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>{name}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, marginTop: tokens.spacing[1], minHeight: 28 }}>{note}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.accent[400], marginTop: tokens.spacing[1], wordBreak: 'break-all' }}>{color}</div>
              </div>
            ))}
          </Row>

          <Row label="Borders">
            {[
              { name: 'border.subtle', color: c.border.subtle, note: 'Dividers' },
              { name: 'border.base',   color: c.border.base,   note: 'Default edges' },
              { name: 'border.bright', color: c.border.bright, note: 'Focus · hover' },
              { name: 'border.strong', color: c.border.strong, note: 'High emphasis' },
            ].map(({ name, color, note }) => (
              <div key={name} style={{ width: 148 }}>
                <div style={{ height: 48, border: `1px solid ${color}`, marginBottom: tokens.spacing[2] }} />
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.secondary, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>{name}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, marginTop: tokens.spacing[1], minHeight: 28 }}>{note}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.accent[400], marginTop: tokens.spacing[1], wordBreak: 'break-all' }}>{color}</div>
              </div>
            ))}
          </Row>

          <Row label="Text">
            {[
              { name: 'text.primary',   color: c.text.primary,   note: 'Headings · values' },
              { name: 'text.secondary', color: c.text.secondary, note: 'Body · descriptions' },
              { name: 'text.muted',     color: c.text.muted,     note: 'Kickers · metadata' },
              { name: 'text.faint',     color: c.text.faint,     note: 'Labels · hints' },
            ].map(({ name, color, note }) => (
              <div key={name} style={{ width: 148 }}>
                <div style={{ height: 48, border: `1px solid ${c.border.base}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: tokens.spacing[2] }}>
                  <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.md, color, letterSpacing: '0.1em' }}>Aa 01</span>
                </div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.secondary, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>{name}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, marginTop: tokens.spacing[1], minHeight: 28 }}>{note}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.accent[400], marginTop: tokens.spacing[1], wordBreak: 'break-all' }}>{color}</div>
              </div>
            ))}
          </Row>

          <div>
            <div style={{ marginBottom: tokens.spacing[3], fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.widest }}>
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
                { role: 'Warning indicator',   token: 'orange.300 + orange.500' },
                { role: 'Fault indicator',     token: 'red.300 + red.500' },
                { role: 'Modal scrim',         token: 'surface.alpha' },
                { role: 'Glassy edge',         token: 'border.alpha' },
                { role: 'Selection sheen',     token: 'color.alpha' },
              ].map(({ role, token }) => (
                <div key={role} style={{ padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`, background: c.surface.raised, border: `1px solid ${c.border.subtle}` }}>
                  <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.muted, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider, marginBottom: tokens.spacing[1] }}>{role}</div>
                  <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.accent[100] }}>{token}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Typography ──────────────────────────────────────────────────── */}
        <Section
          title="Typography"
          kicker="Foundation · Type"
          description="JetBrains Mono is the only typeface. Both fontSans and fontMono resolve to it — the distinction exists only for backward compatibility. Hierarchy comes from size, weight, and letter-spacing, not from switching families."
        >
          <div style={{ marginBottom: tokens.spacing[5] }}>
            <div style={{ marginBottom: tokens.spacing[3], fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.widest }}>
              Type Scale
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { token: 'xs',  px: '10px', usage: 'Data labels · kickers · row headers' },
                { token: 'sm',  px: '12px', usage: 'Descriptions · captions · error text' },
                { token: 'md',  px: '14px', usage: 'UI body · card descriptions' },
                { token: 'lg',  px: '15px', usage: 'Card titles · nav labels' },
                { token: 'xl',  px: '18px', usage: 'Section headings' },
                { token: '2xl', px: '22px', usage: 'Sub-page headings' },
                { token: '3xl', px: '28px', usage: 'Showcase page title' },
                { token: '4xl', px: '36px', usage: 'Dashboard hero readout' },
                { token: '5xl', px: '48px', usage: 'Stat primary value' },
              ].map(({ token, px, usage }) => (
                <div key={token} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], padding: `${tokens.spacing[2]} 0`, borderBottom: `1px solid ${c.border.subtle}` }}>
                  <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.muted, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.widest, width: 28, flexShrink: 0 }}>{token}</span>
                  <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, width: 32, flexShrink: 0 }}>{px}</span>
                  <span style={{ fontFamily: tokens.typography.fontMono, fontSize: px, color: c.text.primary, letterSpacing: tokens.typography.tracking.wide, lineHeight: 1.1, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>ANDROMEDA</span>
                  <span className="as-scale-usage" style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, flexShrink: 0, textAlign: 'right' }}>{usage}</span>
                </div>
              ))}
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
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size['2xl'], fontWeight: val, color: c.text.primary, letterSpacing: tokens.typography.tracking.wider, marginBottom: tokens.spacing[1] }}>NOVA</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.secondary, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>weight.{name}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint }}>{val}</div>
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
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.md, fontWeight: 500, color: c.text.primary, letterSpacing: val, textTransform: 'uppercase', marginBottom: tokens.spacing[1] }}>TRACKING</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.secondary, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>tracking.{name}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.muted }}>{val || '0'}</div>
                <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, marginTop: tokens.spacing[1] }}>{usage}</div>
              </div>
            ))}
          </Row>
        </Section>

        {/* ── Spacing ────────────────────────────────────────────────────── */}
        <Section
          title="Spacing"
          kicker="Foundation · Spacing"
          description="A 4px-based scale. Token names track the px value: spacing.1 → 4px, spacing.4 → 16px. The scale skips 7, 9, and 11 — only the values the system actually uses are emitted, so the keys you have are the keys you should be reaching for."
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
                  borderBottom: `1px solid ${c.border.subtle}`,
                }}
              >
                <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.muted, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.widest, width: 110, flexShrink: 0 }}>
                  {`spacing.${token}`}
                </span>
                <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, width: 36, flexShrink: 0 }}>
                  {px}
                </span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
                  <div
                    aria-hidden
                    style={{
                      width: px,
                      height: 8,
                      background: c.text.primary,
                      flexShrink: 0,
                    }}
                  />
                </div>
                <span className="as-scale-usage" style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.faint, flexShrink: 0, textAlign: 'right' }}>
                  {usage}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Button ─────────────────────────────────────────────────────── */}
        <Section
          title="Button"
          slug="button"
          description="5 variants × 3 sizes. Supports asChild via Radix Slot, optional leading icon, full hover / focus / active / disabled state coverage."
        >
          <Row label="Variants">
            <Button variant="default">Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="With icon">
            <Button icon={Bell}>Notifications</Button>
            <Button variant="outline" icon={Gear}>
              Settings
            </Button>
            <Button variant="destructive" icon={Bell}>
              Abort
            </Button>
          </Row>
          <Row label="Disabled">
            <Button disabled>Default</Button>
            <Button variant="outline" disabled>
              Outline
            </Button>
            <Button variant="destructive" disabled>
              Destructive
            </Button>
          </Row>
        </Section>

        {/* ── IconButton ─────────────────────────────────────────────────── */}
        <Section
          title="Icon Button"
          slug="icon-button"
          description="Square companion to Button. Same variant + size vocabulary so a Button and an IconButton sit on the same baseline in toolbars and headers."
        >
          <Row label="Variants">
            <IconButton aria-label="Default"     variant="default"     icon={Bell} />
            <IconButton aria-label="Outline"     variant="outline"     icon={Gear} />
            <IconButton aria-label="Ghost"       variant="ghost"       icon={Bell} />
            <IconButton aria-label="Destructive" variant="destructive" icon={Bell} />
          </Row>
          <Row label="Sizes">
            <IconButton aria-label="Small"  size="sm" icon={Gear} />
            <IconButton aria-label="Medium" size="md" icon={Gear} />
            <IconButton aria-label="Large"  size="lg" icon={Gear} />
          </Row>
          <Row label="Disabled">
            <IconButton aria-label="Disabled default"     variant="default"     icon={Bell} disabled />
            <IconButton aria-label="Disabled outline"     variant="outline"     icon={Gear} disabled />
            <IconButton aria-label="Disabled destructive" variant="destructive" icon={Bell} disabled />
          </Row>
        </Section>

        {/* ── PanelHeader ────────────────────────────────────────────────── */}
        <Section
          allowOverflow
          title="Panel Header"
          slug="panel-header"
          description="Title row for top-level dashboard panels. Sentence-case mono title on the left, optional actions slot on the right (PanelMenu, IconButton, Button). Inset bottom divider separates the header from the panel body. Distinct from CardHeader, which uses uppercase-widest mono and tighter padding for nested compositions."
        >
          {(() => {
            // Both demos sit side-by-side on one line. Each cell carries its
            // own uppercase mini-label (same style as Row's label) above a
            // 320px panel. flexWrap lets them stack on narrow viewports.
            // minHeight reserves room for the second cell's open menu — the
            // dropdown is absolutely positioned so it would otherwise paint
            // over the next section ("PanelMenu").
            const labelStyle = {
              marginBottom: tokens.spacing[3],
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: c.text.faint,
              textTransform: 'uppercase' as const,
              letterSpacing: tokens.typography.tracking.widest,
            };
            const panelStyle = { width: 320, maxWidth: '100%', position: 'relative' as const, background: c.surface.raised };
            return (
              <div style={{
                display: 'flex',
                gap: tokens.spacing[6],
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                minHeight: 260,
              }}>
                <div>
                  <div style={labelStyle}>Title only</div>
                  <div style={panelStyle}>
                    <CornerMarkers />
                    <PanelHeader title="Capacity" />
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Title + actions (PanelMenu)</div>
                  <div style={panelStyle}>
                    <CornerMarkers />
                    <PanelHeader
                      title="Requests"
                      actions={
                        <PanelMenu
                          ariaLabel="Requests options"
                          staticOpen
                          items={[
                            { label: 'Refresh', icon: ArrowClockwise, onSelect: () => {} },
                            { label: 'Export',  icon: Export,         onSelect: () => {} },
                            { type: 'separator' },
                            { label: 'Hide',    icon: EyeSlash,       onSelect: () => {} },
                          ]}
                        />
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </Section>

        {/* ── PanelMenu ──────────────────────────────────────────────────── */}
        <Section
          allowOverflow
          title="Panel Menu"
          slug="panel-menu"
          description="Kebab-trigger overflow menu for panel headers. The trigger (IconButton, ghost, sm) flips to a held-pressed look while the menu is open. Items support icons, separators, destructive styling, persistent selection, and a single level of right-flyout submenu. Closes on outside click or Escape."
        >
          {(() => {
            // Each cell is laid out vertically (label on top, kebab below);
            // the three cells sit side-by-side in a flex row. Width is wide
            // enough that an opened submenu (160px panel) doesn't overlap the
            // next cell's trigger.
            const labelStyle = {
              marginBottom: tokens.spacing[3],
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: c.text.faint,
              textTransform: 'uppercase' as const,
              letterSpacing: tokens.typography.tracking.widest,
            };
            const cellStyle = { width: 200, flexShrink: 0 };
            return (
              <div style={{
                display: 'flex',
                gap: tokens.spacing[6],
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                // Reserve vertical space for the open menus. The dropdown is
                // absolutely positioned so it does NOT push the section's
                // height — without an explicit minHeight the menu would paint
                // over the next section ("Badge").
                minHeight: 220,
              }}>
                <div style={cellStyle}>
                  <div style={labelStyle}>Default · panel actions</div>
                  <PanelMenu
                    align="left"
                    staticOpen
                    items={[
                      { label: 'Refresh',   icon: ArrowClockwise, onSelect: () => {} },
                      { label: 'Configure', icon: Sliders,        onSelect: () => {} },
                      { label: 'Export',    icon: Export,         onSelect: () => {} },
                      { type: 'separator' },
                      { label: 'Hide',      icon: EyeSlash,       onSelect: () => {} },
                    ]}
                  />
                </div>
                <div style={cellStyle}>
                  <div style={labelStyle}>With submenu</div>
                  <PanelMenu
                    align="left"
                    staticOpen
                    items={[
                      { label: 'Edit',   icon: Pencil,  onSelect: () => {} },
                      { label: 'Copy',   icon: Copy,    onSelect: () => {} },
                      {
                        label: 'Move to',
                        icon: ArrowUpRight,
                        submenu: [
                          { label: 'Starred', icon: Star,     onSelect: () => {} },
                          { label: 'Archive', icon: Database, onSelect: () => {} },
                          { label: 'Snoozed', icon: Clock,    onSelect: () => {} },
                        ],
                      },
                      { type: 'separator' },
                      { label: 'Delete', icon: Trash, destructive: true, onSelect: () => {} },
                    ]}
                  />
                </div>
              </div>
            );
          })()}
        </Section>

        {/* ── Badge ──────────────────────────────────────────────────────── */}
        <Section
          title="Badge"
          slug="badge"
          description="6 variants for status, metric tags, and inline labels. A leading per-variant status dot blinks on a loop to carry the signal, and holds steady when reduced motion is requested."
        >
          <Row>
            <Badge variant="default">Default</Badge>
            <Badge variant="accent">Live</Badge>
            <Badge variant="warning">Caution</Badge>
            <Badge variant="fault">Fault</Badge>
            <Badge variant="subtle">Subtle</Badge>
            <Badge variant="outline">Outline</Badge>
          </Row>
        </Section>

        {/* ── Avatar ─────────────────────────────────────────────────────── */}
        <Section
          title="Avatar"
          slug="avatar"
          description="3 sizes. Shows an image when `src` is provided, with a fallback to initials. Optional status bar in 4 states."
        >
          <Row label="Sizes">
            <Avatar name="Reza Quinn" size="sm" />
            <Avatar name="Reza Quinn" size="md" />
            <Avatar name="Reza Quinn" size="lg" />
          </Row>
          <Row label="With status">
            <Avatar name="Reza Quinn" status="online" />
            <Avatar name="Mira Voss" status="caution" />
            <Avatar name="Kai Ortiz" status="fault" />
            <Avatar name="June Park" status="offline" />
          </Row>
        </Section>

        {/* ── Card ───────────────────────────────────────────────────────── */}
        <Section
          title="Card"
          slug="card"
          description="Compound primitive: Card / CardHeader / CardContent / CardFooter / CardTitle / CardDescription. Corner brackets do the framing by default, with a bordered toggle for a continuous 1px border and a glow variant that adds an accent tint."
        >
          <div
            className="as-grid-2"
            style={{
              display: 'grid',
              gap: tokens.spacing[5],
            }}
          >
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  <span
                    style={{
                      fontFamily: tokens.typography.fontMono,
                      fontSize: tokens.typography.size.xs,
                      color: c.text.muted,
                      textTransform: 'uppercase',
                      letterSpacing: tokens.typography.tracking.widest,
                    }}
                  >
                    {'/// Default'}
                  </span>
                  <CardTitle>Default card</CardTitle>
                </div>
                <Badge variant="default">Idle</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sharp corners with bracket markers tucked into each corner. No
                  perimeter stroke — the brackets are the frame.
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button size="md" variant="outline">
                  Configure
                </Button>
              </CardFooter>
            </Card>

            <Card variant="glow">
              <CardHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  <span
                    style={{
                      fontFamily: tokens.typography.fontMono,
                      fontSize: tokens.typography.size.xs,
                      color: c.text.muted,
                      textTransform: 'uppercase',
                      letterSpacing: tokens.typography.tracking.widest,
                    }}
                  >
                    {'/// Glow'}
                  </span>
                  <CardTitle>Highlight card</CardTitle>
                </div>
                <Badge variant="accent">Live</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tinted accent gradient surface. Use for the card you want to
                  draw the user&apos;s eye to first.
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button size="md">Open</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* ── CornerMarkers ──────────────────────────────────────────────── */}
        <Section
          title="Corner Markers"
          slug="corner-markers"
          description="The defining motif. Renders 4 L-shaped brackets at the corners of the nearest position:relative ancestor. Geometry comes from tokens.marker."
        >
          <div style={{ display: 'flex', gap: tokens.spacing[5], flexWrap: 'wrap' }}>
            {[
              { label: 'Default', props: {} },
              { label: 'Larger', props: { size: 18 } },
              { label: 'Inset 6px', props: { offset: 6 } },
              { label: 'Accent', props: { color: c.accent[300] } },
            ].map(({ label, props }) => (
              <div
                key={label}
                style={{
                  position: 'relative',
                  width: 180,
                  height: 100,
                  background: c.surface.raised,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CornerMarkers {...props} />
                <span
                  style={{
                    fontFamily: tokens.typography.fontMono,
                    fontSize: tokens.typography.size.xs,
                    color: c.text.muted,
                    textTransform: 'uppercase',
                    letterSpacing: tokens.typography.tracking.widest,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Input ──────────────────────────────────────────────────────── */}
        <Section
          title="Input"
          slug="input"
          description="Optional uppercase mono label, optional left icon, default + error states. Border transitions on focus."
        >
          <div
            className="as-grid-2"
            style={{
              display: 'grid',
              gap: tokens.spacing[5],
            }}
          >
            <Input label="Callsign" placeholder="ENTER CALLSIGN" />
            <Input label="Search" icon={MagnifyingGlass} placeholder="QUERY DATABASE" />
            <Input
              label="Operator"
              icon={Envelope}
              placeholder="OPERATOR@DOMAIN.COM"
            />
            <Input
              label="Validation"
              defaultValue="INVALID"
              error="Field cannot be empty"
            />
          </div>
        </Section>

        {/* ── SearchField ────────────────────────────────────────────────── */}
        <Section
          title="Search Field"
          slug="search-field"
          description="Command-bar-style search input with an optional ⌘-K shortcut chip. Five states — idle, hover, focus, text-inactive (placeholder), text-active (typed)."
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[5],
              width: '100%',
              maxWidth: 520,
            }}
          >
            <SearchField placeholder="Search anything" />
            <SearchField placeholder="Search tracks, channels, waveforms" shortcut="⌘ F" />
            <SearchField placeholder="No shortcut" shortcut={null} />
            <SearchField defaultValue="orbital launch" />
          </div>
        </Section>

        {/* ── NavItem ────────────────────────────────────────────────────── */}
        <Section
          title="Nav Item"
          slug="nav-item"
          description="Sidebar item with icon, active state, right-edge indicator dot. Mono label by default; pass mono={false} for sans."
        >
          <div
            style={{
              width: 260,
              background: c.surface.raised,
              position: 'relative',
            }}
          >
            <CornerMarkers />
            <NavItem icon={Compass} label="Overview" active />
            <NavItem icon={Pulse} label="Activity" />
            <NavItem icon={Users} label="Members" />
            <NavItem icon={Database} label="Logs" />
            <NavItem icon={Gear} label="Settings" />
          </div>
        </Section>

        {/* ── ProgressBar ────────────────────────────────────────────────── */}
        <Section
          title="Progress Bar"
          slug="progress-bar"
          description="3 status variants. 30 skewed segments fill left to right with a scroll-gated staggered cascade."
        >
          <div
            className="as-progress-stack"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[5],
              maxWidth: 520,
            }}
          >
            <ProgressBar label="Storage Used" value={72} variant="default" />
            <ProgressBar label="Bandwidth" value={48} variant="warning" />
            <ProgressBar label="Memory Critical" value={91} variant="fault" />
          </div>
        </Section>

        {/* ── HeatGrid ───────────────────────────────────────────────────── */}
        <Section
          title="Heat Grid"
          slug="heat-grid"
          description="2-D matrix fill gauge — the cousin of ProgressBar. Cells fill from the bottom-centre outward in a widening pyramid as the value rises, dim-to-bright toward the wave front. Scroll-gated fill, optional percentage readout, role=meter."
        >
          <Row label="Value">
            <HeatGrid value={60} label="Window risk" />
          </Row>
          <Row label="Live · jump or drag (cells appear / disappear in real time)">
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[8], flexWrap: 'wrap' }}>
              <HeatGrid value={heatValue} label="Live gauge" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], minWidth: 240 }}>
                <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
                  {[0, 40, 60, 80, 100].map((v) => (
                    <Button
                      key={v}
                      size="sm"
                      variant={heatValue === v ? 'default' : 'outline'}
                      onClick={() => setHeatValue(v)}
                    >
                      {v}%
                    </Button>
                  ))}
                </div>
                <Slider value={heatValue} onValueChange={setHeatValue} min={0} max={100} label="Fill" unit="%" />
              </div>
            </div>
          </Row>
          <Row label="Sizes · without readout">
            <HeatGrid value={30} cellSize={16} gap={2} showValue={false} label="Low" />
            <HeatGrid value={75} cellSize={16} gap={2} showValue={false} label="High" />
            <HeatGrid value={100} cellSize={16} gap={2} showValue={false} label="Full" />
          </Row>
        </Section>

        {/* ── StatTile ───────────────────────────────────────────────────── */}
        <Section
          title="Stat Tile"
          slug="stat-tile"
          description="Stat readout built on Card. Big numeric value, optional unit, optional ▲/▼ delta whose glyph carries the direction and whose color carries the judgment: set polarity to lower-is-better and a falling response time reads as the improvement it is, or none for a reading with no good/bad sense. Scroll-aware count-up on first view, a live mode that snaps to new values, a per-digit odometer roll (liveRoll), and a top-right code identifier prop."
        >
          <div
            style={{
              display: 'flex',
              gap: tokens.spacing[5],
              flexWrap: 'wrap',
            }}
          >
            <StatTile
              label="Throughput"
              code="REQ-01"
              value="7842"
              unit="rps"
              delta={2.4}
              deltaLabel="vs prior period"
            />
            {/* Latency falling is an improvement, so this ▼ reads accent, not
                fault. polarity is what separates the direction of a move from
                the judgment of it. */}
            <StatTile
              label="Latency"
              code="LAT-02"
              value="412"
              unit="ms"
              delta={-1.2}
              polarity="lower-is-better"
              deltaLabel="vs prior period"
            />
            <StatTile label="Errors" code="ERR-03" value="1.04" unit="%" />
          </div>
        </Section>

        {/* ── Tag ────────────────────────────────────────────────────────── */}
        <Section
          title="Tag"
          slug="tag"
          description="Compact uppercase mono label. 4 variants. Optional dismiss button when onClose is provided."
        >
          <Row label="Variants">
            <Tag variant="default">Default</Tag>
            <Tag variant="accent">Accent</Tag>
            <Tag variant="warning">Warning</Tag>
            <Tag variant="fault">Fault</Tag>
          </Row>
          <Row label="Dismissible">
            <Tag variant="default" onClose={() => {}}>
              Removable
            </Tag>
            <Tag variant="accent" onClose={() => {}}>
              Active filter
            </Tag>
          </Row>
        </Section>

        {/* ── Checkbox ───────────────────────────────────────────────────── */}
        <Section
          title="Checkbox"
          slug="checkbox"
          description="Square boolean control. Controlled or uncontrolled. Inline label, accent fill on checked, an accent focus ring, a press scale, a pop-in on the checkmark, and a 40px touch target on coarse pointers."
        >
          <Row label="States">
            <Checkbox label="Unchecked" />
            <Checkbox label="Checked" defaultChecked />
            <Checkbox label="Disabled" disabled />
            <Checkbox label="Disabled checked" disabled defaultChecked />
          </Row>
        </Section>

        {/* ── Radio (Choicebox) ──────────────────────────────────────────── */}
        <Section
          title="Radio · Choicebox"
          slug="radio"
          description="Mutually-exclusive square radio. Use standalone or inside a RadioGroup that wires up `name` / `value` / `onValueChange`."
        >
          <Row label="Group">
            <RadioGroup
              value={radioValue}
              onValueChange={setRadioValue}
              // flexWrap so the four labeled radios drop to a second line on a
              // phone instead of overflowing the card. Inert on desktop (all
              // four fit one line in the 1180px shell), so desktop is unchanged.
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing[4] }}
            >
              <Radio value="default" label="Default" />
              <Radio value="alternate" label="Alternate" />
              <Radio value="ground" label="Ground" />
              <Radio value="disabled" label="Restricted" disabled />
            </RadioGroup>
          </Row>
          <Row label="Standalone">
            <Radio label="Standalone" defaultChecked />
            <Radio label="Off" />
          </Row>
        </Section>

        {/* ── Toggle ─────────────────────────────────────────────────────── */}
        <Section
          title="Toggle · Switch"
          slug="toggle"
          description="Sharp rectangular track + sliding rectangular thumb. Same vocabulary as Checkbox, but feels like a hardware switch."
        >
          <Row label="States">
            <Toggle label="Off" />
            <Toggle label="On" defaultChecked />
            <Toggle label="Disabled" disabled />
            <Toggle label="Disabled on" disabled defaultChecked />
          </Row>
        </Section>

        {/* ── SegmentedControl ───────────────────────────────────────────── */}
        <Section
          title="Segmented Control"
          slug="segmented-control"
          description="Row of icon-or-label buttons that share a single border. The active background slides between segments on selection (Framer Motion layout animation). Sized sm/md/lg to align with the Button/IconButton baseline."
        >
          <Row label="Icons · sm">
            <SegmentedControl
              size="sm"
              value={chartTypeSm}
              onChange={setChartTypeSm}
              options={[
                { value: 'line', icon: ChartLine, ariaLabel: 'Line chart' },
                { value: 'bars', icon: ChartBar,  ariaLabel: 'Bar chart' },
              ]}
            />
          </Row>
          <Row label="Icons · lg">
            <SegmentedControl
              size="lg"
              value={chartTypeLg}
              onChange={setChartTypeLg}
              options={[
                { value: 'line', icon: ChartLine, ariaLabel: 'Line chart' },
                { value: 'bars', icon: ChartBar,  ariaLabel: 'Bar chart' },
              ]}
            />
          </Row>
          <Row label="Labels">
            <SegmentedControl
              size="md"
              value={periodValue}
              onChange={setPeriodValue}
              options={[
                { value: '1d',  label: '1D' },
                { value: '1w',  label: '1W' },
                { value: '1m',  label: '1M' },
                { value: 'all', label: 'ALL' },
              ]}
            />
          </Row>
        </Section>

        {/* ── DateRangePicker ────────────────────────────────────────────── */}
        <Section
          allowOverflow
          title="Date Range Picker"
          slug="date-range-picker"
          description="Trigger chip + drop-down calendar panel. Anchor-then-confirm range selection with hover preview, Monday-first 6×7 grid, ESC and click-outside to close. Selected endpoints fill in accent; the in-between band is a 1px accent outline so the eye stays on the picked dates."
        >
          <div style={{
            display: 'flex',
            gap: tokens.spacing[6],
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            // The calendar panel is absolutely positioned (~330px tall) and
            // would otherwise overflow into the next section.
            minHeight: 380,
          }}>
            <DateRangePicker
              value={dateRange}
              presetLabel="Custom"
              onChange={setDateRange}
              staticOpen
            />
          </div>
        </Section>

        {/* ── Spinner ────────────────────────────────────────────────────── */}
        <Section
          title="Spinner"
          slug="spinner"
          description="A 3x3 pixel grid with a snake-game trail cycling via a single CSS keyframe, running on the compositor. 4 color variants and 3 sizes."
        >
          <Row label="Sizes">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </Row>
          <Row label="Variants">
            <Spinner variant="default" />
            <Spinner variant="accent" />
            <Spinner variant="warning" />
            <Spinner variant="fault" />
          </Row>
        </Section>

        {/* ── Slider ─────────────────────────────────────────────────────── */}
        <Section
          title="Slider"
          slug="slider"
          description="Custom horizontal range. Pointer drag + full keyboard support (←/→/↑/↓, PageUp/PageDown, Home/End). ARIA-compliant."
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[5],
              maxWidth: 520,
            }}
          >
            <Slider
              label="Throttle"
              unit="%"
              value={sliderValue}
              onValueChange={setSliderValue}
            />
            <Slider
              label="Thrust Vector"
              unit="°"
              min={-30}
              max={30}
              value={thrustValue}
              onValueChange={setThrustValue}
            />
            <Slider label="Locked" value={50} disabled />
          </div>
        </Section>

        {/* ── Textarea ───────────────────────────────────────────────────── */}
        <Section
          title="Textarea"
          slug="textarea"
          description="Multi-line counterpart to Input. Same border / focus / error behavior, vertical resize."
        >
          <div
            className="as-grid-2"
            style={{
              display: 'grid',
              gap: tokens.spacing[5],
            }}
          >
            <Textarea
              label="Description"
              placeholder="ENTER DESCRIPTION…"
              rows={4}
            />
            <Textarea
              label="Validation"
              defaultValue="TOO SHORT"
              error="Brief must be at least 80 characters"
              rows={4}
            />
          </div>
        </Section>

        {/* ── Alert ──────────────────────────────────────────────────────── */}
        <Section
          title="Alert"
          slug="alert"
          kicker="Component · Error"
          description="Banner-style status component for inline messages. 4 variants — default, accent, warning, fault — each with its own per-variant color set. Severity-aware ARIA (warning and fault announce assertively, the rest politely) and compound parts: AlertIcon, AlertContent, AlertTitle, AlertDescription."
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[3],
              // Cap the banner width so the alerts read as inline messages
              // instead of stretching the full (very wide) showcase column on
              // desktop. maxWidth caps; the alerts still fill the width on
              // phones (where full-width is the right look).
              maxWidth: 640,
            }}
          >
            <Alert variant="default">
              <AlertIcon><Info weight="light" /></AlertIcon>
              <AlertContent>
                <AlertTitle>System nominal</AlertTitle>
                <AlertDescription>All systems reporting in.</AlertDescription>
              </AlertContent>
            </Alert>
            <Alert variant="accent">
              <AlertIcon><Pulse weight="light" /></AlertIcon>
              <AlertContent>
                <AlertTitle>New activity</AlertTitle>
                <AlertDescription>Burst received from VHCL-04.</AlertDescription>
              </AlertContent>
            </Alert>
            <Alert variant="warning">
              <AlertIcon><Warning weight="light" /></AlertIcon>
              <AlertContent>
                <AlertTitle>Caution</AlertTitle>
                <AlertDescription>Heat shield within 12% of operational limit.</AlertDescription>
              </AlertContent>
            </Alert>
            <Alert variant="fault">
              <AlertIcon><Warning weight="light" /></AlertIcon>
              <AlertContent>
                <AlertTitle>Connection lost</AlertTitle>
                <AlertDescription>Reconnecting. ETA 8 seconds.</AlertDescription>
              </AlertContent>
            </Alert>
          </div>
        </Section>

        {/* ── Empty State ────────────────────────────────────────────────── */}
        <Section
          title="Empty State"
          slug="empty-state"
          description="Centered icon + uppercase mono title + sans description + optional action. Built on Card so it inherits the bracket motif."
        >
          <EmptyState>
            <EmptyStateIcon><EnvelopeOpen weight="light" /></EmptyStateIcon>
            <EmptyStateTitle>No activity</EmptyStateTitle>
            <EmptyStateDescription>
              Awaiting signal from the deep-space array. The next pass is in
              approximately 14 minutes.
            </EmptyStateDescription>
            <EmptyStateAction>
              <Button variant="outline" size="sm">Refresh</Button>
              <Button size="sm">Open log</Button>
            </EmptyStateAction>
          </EmptyState>
        </Section>

        {/* ── Charts ─────────────────────────────────────────────────────── */}
        <Section
          title="Radar Chart"
          slug="radar-chart"
          kicker="Component · Charts"
          description="Polygon spider chart for multi-axis system diagnostics. Supports single or multiple overlapping series. Built on recharts, fully styled with andromeda tokens."
        >
          <div className="as-grid-2" style={{ display: 'grid', gap: tokens.spacing[5] }}>
            <RadarChart
              label="/// Systems"
              title="Ship Diagnostics"
            />
            <RadarChart
              label="/// Performance"
              title="System Performance"
              description="Current system readiness"
              data={[
                { axis: 'CPU',      score: 94 },
                { axis: 'MEMORY',   score: 81 },
                { axis: 'STORAGE',  score: 76 },
                { axis: 'NETWORK',  score: 88 },
                { axis: 'SECURITY', score: 65 },
                { axis: 'API',      score: 90 },
              ]}
              series={[{ key: 'score', label: 'Readiness', color: c.accent[300] }]}
            />
          </div>
        </Section>

        {/* ── Trend Chart ────────────────────────────────────────────────── */}
        <Section
          title="Trend Chart"
          slug="trend-chart"
          kicker="Component · Charts"
          description="The canonical multi-series time-series chart. One component, line / area / bar via the mode toggle, with a custom tooltip and toggleable legend. Series colour follows the multi-series hierarchy: baseline (white), live (accent), context (faint), threshold (red dashed). Built on recharts; scroll-gated left-to-right reveal."
        >
          <div style={{ position: 'relative', background: c.surface.raised, padding: tokens.spacing[5] }}>
            <CornerMarkers />
            <TrendChart
              title="Allocation vs usage"
              yLabel="Compute units, PFLOPS"
              height={260}
              data={TREND_DEMO_DATA}
              series={[
                { key: 'allocated', label: 'Allocated', role: 'baseline' },
                { key: 'used',      label: 'Used',      role: 'live' },
                { key: 'reserved',  label: 'Reserved',  role: 'context' },
              ]}
              tooltipLabelFormatter={(l) => `DAY ${String(l).padStart(2, '0')}`}
            />
          </div>
        </Section>

        {/* ── Metric Chart ───────────────────────────────────────────────── */}
        <Section
          title="Metric Chart"
          slug="metric-chart"
          kicker="Component · Charts"
          description="The framed single-series telemetry panel. It brings its own corner-marked frame, header and status badge, and fits the y-domain to the data by default so percentage and non-zero-floor measurements fill the plot. TrendChart renders content only, for a panel you compose yourself, and baselines at zero. Both take a domain, so the frame is what decides between them. The variant colors the status badge only; chart ink stays neutral."
        >
          <div className="as-grid-2" style={{ display: 'grid', gap: tokens.spacing[5] }}>
            <MetricChart />
            <MetricChart
              label="/// Station"
              title="Orbital Altitude"
              description="Reboost burn at 14:00"
              unit="km"
              variant="warning"
              badgeText="Drift"
            />
          </div>
        </Section>

        {/* ── Gauge ──────────────────────────────────────────────────────── */}
        <Section
          title="Gauge"
          slug="gauge"
          kicker="Component · Charts"
          description="Radial percentage gauge. The arc IS the measurement, so it takes the semantic color (accent live, orange warning, red fault) over a neutral track; the readout counts up in sync with the sweep. A bare primitive that composes into Cards and panels."
        >
          <Row label="Sizes">
            <Gauge size="sm" />
            <Gauge size="md" />
            <Gauge size="lg" />
          </Row>
          <Row label="Variants">
            <Gauge variant="accent" value={82} label="CPU" />
            <Gauge variant="warning" value={64} label="FUEL" />
            <Gauge variant="fault" value={12} label="O2" />
          </Row>
        </Section>

        {/* ── Waveform ───────────────────────────────────────────────────── */}
        <Section
          title="Waveform"
          slug="waveform"
          kicker="Component · Charts"
          description="Live signal waveform. A fluid SVG of a morphing polyline over mirrored level bars and a dashed centreline, animating to signal an active feed and holding a static frame when paused or reduced-motion. Neutral ink by default; colour only when the wave itself is the live measurement."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
            <Waveform />
            <Waveform height={80} showBars={false} />
          </div>
        </Section>

        {/* ── Media Card ─────────────────────────────────────────────────── */}
        <Section
          title="Media Card"
          slug="media-card"
          kicker="Component · Surfaces"
          description="Image-backed content tile. A full-bleed photo under a soft bottom scrim, a mono code tag, title and meta, and one corner action — Play, a CTA arrow, or none. Composes the Card frame with markers off, so the image carries the card identity."
        >
          <div className="as-grid-2" style={{ display: 'grid', gap: tokens.spacing[5] }}>
            <MediaCard code="MIX-01" title="Your Mix" meta="3.4k plays" action="play" />
            <MediaCard
              code="CH-04"
              title="Deep Focus"
              meta="Ambient · 2h"
              action="cta"
              ctaLabel="Open"
              image="https://ik.imagekit.io/aitoolkit/andromeda/signal-room/mix-03.webp"
            />
          </div>
        </Section>

        {/* ── Data Table ─────────────────────────────────────────────────── */}
        <Section
          title="Data Table"
          slug="data-table"
          kicker="Component · Data"
          description="Configuration-driven data grid. Pass columns and rows to get hairline inset dividers, row hover, a selected-row accent edge, and a mobile column-priority fold that tucks low-priority columns into a per-row info tooltip or the primary column's sub-line instead of a horizontal scrollbar."
        >
          <DataTable />
        </Section>

        {/* ── Music Player ───────────────────────────────────────────────── */}
        <Section
          title="Music Player"
          slug="music-player"
          kicker="Component · Composites"
          description="Block-scale transport bar. Track identity, the full transport cluster, a scrub slider with elapsed and remaining readouts, and like, lyrics, and volume controls — assembled from Andromeda primitives, driven by props with a live demo fallback."
        >
          <MusicPlayer />
        </Section>

        {/* ── Planet · Next Destination ──────────────────────────────────── */}
        <Section
          title="Planet"
          slug="planet"
          kicker="Component · Visualization"
          description="3D particle sphere — every point lit on a Lambert ramp from accent.500 (shadow) to accent.200 (lit), with 1% accent.100 sparkles on the day side. Self-contained Three.js, transparent canvas. Drop into a Card for status / next-destination widgets."
        >
          <div className="as-grid-planet" style={{ display: 'grid', gap: tokens.spacing[5] }}>
            {/* Standalone planet — full canvas */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.muted, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.widest }}>{'/// Body'}</span>
                  <CardTitle>Solo</CardTitle>
                </div>
              </CardHeader>
              <div style={{ height: 280, position: 'relative' }}>
                <Planet />
              </div>
            </Card>

            {/* Composed "Next Destination" widget */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.muted, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.widest }}>{'/// Heading'}</span>
                  <CardTitle>Next Destination</CardTitle>
                </div>
                <Badge variant="accent">LOCKED</Badge>
              </CardHeader>
              <div className="as-grid-2" style={{ display: 'grid', gap: tokens.spacing[4], padding: tokens.spacing[4], alignItems: 'center' }}>
                <div style={{ height: 220, position: 'relative' }}>
                  <Planet particleCount={5500} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                  <div>
                    <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.muted, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.widest }}>Target</div>
                    <div style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xl, color: c.text.primary, fontWeight: tokens.typography.weight.bold, letterSpacing: tokens.typography.tracking.wider, marginTop: tokens.spacing[1] }}>KEPLER-186F</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                    {[
                      { label: 'Distance', value: '492.3 ly' },
                      { label: 'ETA',      value: '2027.04.18' },
                      { label: 'Bearing',  value: '042.7°'    },
                      { label: 'Class',    value: 'M-Dwarf'   },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${c.border.subtle}`, paddingBottom: tokens.spacing[2] }}>
                        <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: c.text.muted, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>{label}</span>
                        <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.sm, color: c.text.primary, letterSpacing: tokens.typography.tracking.wide }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <CardFooter>
                <Button variant="default" size="sm">ENGAGE TRAJECTORY</Button>
                <Button variant="ghost"   size="sm">DETAILS</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Section
          title="Table"
          slug="table"
          description="Compound primitive for dense data tables. Sortable column headers with caret indicators, row hover highlight, and selected-row accent-300 left edge. TableStyles must be rendered once per page to inject the hover class rules."
        >
          <TableStyles />
          <Table>
            <TableHead>
              <TableRow hoverable={false}>
                <TableHeader>Order ID</TableHeader>
                <TableHeader>Part ID</TableHeader>
                <TableHeader>Source Location</TableHeader>
                <TableHeader sort="asc">Source Level</TableHeader>
                <TableHeader sort="sortable">Service Level</TableHeader>
                <TableHeader align="right">Total Volume</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { id: 'AB-00032734', part: 'X60 BJGJ29839281', source: 'US, Denver - 24071',        lvl: '66%', svc: '4/10', vol: '10.9985' },
                { id: 'AB-00032736', part: 'X61 BHH09027512',  source: 'US, San Francisco - 27381',  lvl: '75%', svc: '3/10', vol: '8.85221', selected: true },
                { id: 'AB-00039925', part: 'X52 BB0372/2 X5A', source: 'US, Houston - 24027',        lvl: '98%', svc: '7/10', vol: '10.29701' },
                { id: 'AB-00032002', part: 'B12 BZ9025/2 X12', source: 'EU, Sweden - 00085',         lvl: '68%', svc: '2/10', vol: '3.92871' },
              ].map((r) => (
                <TableRow key={r.id} selected={!!r.selected}>
                  <TableCell muted>{r.id}</TableCell>
                  <TableCell>{r.part}</TableCell>
                  <TableCell muted>{r.source}</TableCell>
                  <TableCell>{r.lvl}</TableCell>
                  <TableCell>{r.svc}</TableCell>
                  <TableCell align="right">{r.vol}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        {/* ── Tooltip ────────────────────────────────────────────────────── */}
        <Section
          title="Tooltip"
          slug="tooltip"
          description="Hover label for icon-only controls. Wraps any child and floats a mono uppercase label above (or below) it. Shows on keyboard focus too, carries role='tooltip', and clamps itself away from the viewport edges. Inline by default, so it stays in the nearest stacking context; pass portal to lift it to the body when the trigger sits in a panel that clips or scrolls."
        >
          <Row label="Position · top (default)">
            <Tooltip label="Refresh">
              <IconButton aria-label="Refresh" icon={ArrowClockwise} />
            </Tooltip>
            <Tooltip label="Settings">
              <IconButton aria-label="Settings" icon={Gear} />
            </Tooltip>
            <Tooltip label="Notifications">
              <IconButton aria-label="Notifications" icon={Bell} />
            </Tooltip>
            <Tooltip label="Export">
              <IconButton aria-label="Export" variant="outline" icon={Export} />
            </Tooltip>
            <Tooltip label="Delete" >
              <IconButton aria-label="Delete" variant="destructive" icon={Trash} />
            </Tooltip>
          </Row>
          <Row label="Position · bottom">
            <Tooltip label="Refresh" position="bottom">
              <IconButton aria-label="Refresh" icon={ArrowClockwise} />
            </Tooltip>
            <Tooltip label="Settings" position="bottom">
              <IconButton aria-label="Settings" icon={Gear} />
            </Tooltip>
          </Row>
          <Row label="Portal · trigger inside a scrolling panel">
            {/* The panel below clips and scrolls, which is exactly what an
                inline tooltip cannot survive: it gets cut at the edge and
                summons a horizontal scrollbar for as long as it is open.
                `portal` lifts the label to <body> instead. */}
            <div
              style={{
                display: 'flex',
                gap: tokens.spacing[3],
                padding: tokens.spacing[3],
                maxWidth: '260px',
                overflow: 'auto',
                border: `${tokens.border.thin} ${c.border.subtle}`,
              }}
            >
              <Tooltip label="Refresh" portal>
                <IconButton aria-label="Refresh" icon={ArrowClockwise} />
              </Tooltip>
              <Tooltip label="Settings" portal>
                <IconButton aria-label="Settings" icon={Gear} />
              </Tooltip>
              <Tooltip label="Notifications" portal>
                <IconButton aria-label="Notifications" icon={Bell} />
              </Tooltip>
            </div>
          </Row>
        </Section>

        {/* ── Drawer ─────────────────────────────────────────────────────── */}
        <Section
          title="Drawer"
          slug="drawer"
          description="Slide-in panel on any side (left, right, top, or bottom), with focus trap and a size prop. Backdrop, ESC to close, body scroll lock, and the bracket motif. React Portal escapes any clipped ancestor."
        >
          <Row label="Trigger">
            <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          </Row>
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} side="right" size={420}>
            <DrawerHeader>
              <DrawerTitle>System Parameters</DrawerTitle>
              <DrawerDescription>Configure flight envelope</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
                <Input label="Callsign" placeholder="ENTER CALLSIGN" />
                <Slider label="Throttle" unit="%" defaultValue={64} />
                <Toggle label="Autopilot" defaultChecked />
                <Toggle label="Manual override" />
                <Checkbox label="Confirm pre-flight checklist" defaultChecked />
                <Textarea label="Notes" rows={3} placeholder="OPERATOR NOTES…" />
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setDrawerOpen(false)}>
                Engage
              </Button>
            </DrawerFooter>
          </Drawer>
        </Section>

        {/* ── UserMenu ───────────────────────────────────────────────────── */}
        <Section
          allowOverflow
          title="User Menu"
          slug="user-menu"
          description="Avatar-trigger popover whose menu rows are supplied by the caller via an `items` prop. Designed for top-bar slots where space is tight. Opens downward and right-aligned by default; pairs with UserCard for sidebars that have room to spell out name and role."
        >
          {(() => {
            const items = [
              { id: 'profile',     label: 'Profile',             icon: UserCircle },
              { id: 'preferences', label: 'Preferences',         icon: Gear },
              { id: 'shortcuts',   label: 'Keyboard Shortcuts',  icon: Keyboard },
              { id: 'sep1',        type: 'separator' as const },
              { id: 'signout',     label: 'Sign Out',            icon: SignOut },
            ];
            return (
              <div
                style={{
                  display: 'flex',
                  gap: tokens.spacing[8],
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  // Reserve room for the open-down panel (~200px tall) so
                  // it doesn't paint over the next section. Same trick the
                  // PanelMenu showcase uses.
                  minHeight: 260,
                }}
              >
                <Row label="Open up">
                  <UserMenu
                    name="OPS-01"
                    src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    status="online"
                    items={items}
                    placement="top"
                    align="end"
                  />
                </Row>
                {/* Shifted 40px right so the open panel (which extends
                    leftward from the right-aligned trigger) doesn't crowd
                    the Open Up trigger in the column to its left. */}
                <div style={{ marginLeft: 40 }}>
                  <Row label="Open down">
                    <UserMenu
                      name="OPS-01"
                      src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      status="online"
                      items={items}
                      placement="bottom"
                      align="end"
                      staticOpen
                    />
                  </Row>
                </div>
              </div>
            );
          })()}
        </Section>

        {/* ── UserCard ───────────────────────────────────────────────────── */}
        <Section
          allowOverflow
          title="User Card"
          slug="user-card"
          description="Wider user trigger that shows avatar, name, and role alongside the chevron, the canonical bottom-of-sidebar identity card. Same popover as UserMenu, with menu rows supplied by the caller via an `items` prop; opens upward by default and stretches to the card width."
        >
          {(() => {
            const items = [
              { id: 'profile',     label: 'Profile',             icon: UserCircle },
              { id: 'preferences', label: 'Preferences',         icon: Gear },
              { id: 'shortcuts',   label: 'Keyboard Shortcuts',  icon: Keyboard },
              { id: 'sep1',        type: 'separator' as const },
              { id: 'signout',     label: 'Sign Out',            icon: SignOut },
            ];
            return (
              <div
                style={{
                  display: 'flex',
                  gap: tokens.spacing[8],
                  // Open-down is the variant we render pre-opened, so the
                  // triggers sit at the TOP of the row (flex-start) and the
                  // panel grows downward into the reserved minHeight space
                  // below — instead of bleeding into the next section.
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  minHeight: 360,
                }}
              >
                <div style={{ width: 224 }}>
                  <Row label="Open down">
                    <div style={{ width: '100%', background: c.surface.raised }}>
                      <UserCard
                        name="Reza Quinn"
                        role="Flight Director"
                        src="https://images.unsplash.com/photo-1669287731461-bd8ce3126710?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        status="online"
                        items={items}
                        placement="bottom"
                        align="stretch"
                        staticOpen
                      />
                    </div>
                  </Row>
                </div>
                <div style={{ width: 224 }}>
                  <Row label="Open up">
                    <div style={{ width: '100%', background: c.surface.raised }}>
                      <UserCard
                        name="Reza Quinn"
                        role="Flight Director"
                        src="https://images.unsplash.com/photo-1669287731461-bd8ce3126710?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        status="online"
                        items={items}
                        placement="top"
                        align="stretch"
                      />
                    </div>
                  </Row>
                </div>
              </div>
            );
          })()}
        </Section>

        {/* Bottom install card — the two packages, like the brain's card. */}
        <ShowcaseInstallCard />
      </div>
      <SiteFooter />
    </div>
    </>
  )
}
