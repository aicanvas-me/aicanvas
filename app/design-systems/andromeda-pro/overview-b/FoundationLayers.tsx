'use client'

// The foundation teaser under the compare stage: the three token layers as
// three cards, with one colour followed through all of them. A brand stop
// (primitive) is what status.info.text (semantic) points at, and that role is
// what the accent Badge's dot (component wire) paints with.
//
// Nothing is typed by hand: the swatches paint through the page's --at-* set,
// and the highlighted stop is recovered by matching the role's resolved value
// back against the brand ramp, per theme, so the card follows the preview
// theme and cannot drift from tokens.ts.

import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from '@phosphor-icons/react'
import { buttonClasses } from '../../../components/buttonClasses'
import { Badge, tokens } from '../../../lib/andromeda-pro.generated'
import { andromedaLightVars, andromedaVars } from '../../../lib/andromeda-pro-helpers.generated'
import { useAndromedaPreviewTheme } from '../AndromedaThemeWrap'

const DARK_VARS = andromedaVars() as Record<string, string>
const LIGHT_VARS = andromedaLightVars() as Record<string, string>

const stripVar = (value: string) => {
  const m = /^var\([^,]+,\s*(.*)\)$/.exec(String(value))
  return m ? m[1] : String(value)
}

const RAMP_STOPS = [100, 200, 300, 400, 500] as const
const RAMP = tokens.color.brand as unknown as Record<string, string>

// The role the Badge's accent dot reads.
const ROLE = 'status-info-text'
const ROLE_NAME = ROLE.replaceAll('-', '.')

const stopFor = (value: string | undefined) => RAMP_STOPS.find((s) => RAMP[s] === value)
const ACTIVE_STOP = {
  dark: stopFor(stripVar(DARK_VARS[`--andromeda-${ROLE}`] ?? '')),
  light: stopFor(LIGHT_VARS[`--at-${ROLE}`]),
}

// The visual well of each card is an Andromeda root: it spreads the full
// --andromeda-* set, so the Badge inside resolves and every value below reads
// through the page's --at-* theme channel (dark is the var() fallback).
const WELL: CSSProperties = {
  ...(DARK_VARS as CSSProperties),
  background: 'var(--andromeda-surface-base)',
  border: '1px solid var(--andromeda-border-base)',
  borderRadius: 4,
}
const MONO: CSSProperties = { fontFamily: tokens.typography.fontMono }

function LayerCard({ n, title, caption, children }: { n: number; title: string; caption: string; children: ReactNode }) {
  return (
    <li className="flex min-w-0 flex-col rounded-xl border border-sand-200 bg-sand-50 p-3 dark:border-sand-800 dark:bg-sand-950">
      <div className="flex h-20 items-center justify-center px-3" style={WELL}>
        {children}
      </div>
      <p className="mt-3 px-1 text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
        Layer {n}
      </p>
      <h3 className="mt-1 px-1 text-sm font-bold text-sand-900 dark:text-sand-50">{title}</h3>
      <p className="mt-1 px-1 pb-1 text-sm text-sand-600 dark:text-sand-400">{caption}</p>
    </li>
  )
}

function Step() {
  return (
    <li aria-hidden className="flex items-center justify-center text-sand-400 dark:text-sand-600">
      <ArrowDown weight="regular" className="size-4 sm:hidden" />
      <ArrowRight weight="regular" className="hidden size-4 sm:block" />
    </li>
  )
}

export function FoundationLayers() {
  const theme = useAndromedaPreviewTheme()?.theme ?? 'dark'
  const active = ACTIVE_STOP[theme]

  return (
    <div className="mt-4 rounded-2xl border border-sand-200 bg-sand-100 p-4 dark:border-sand-800 dark:bg-sand-900 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base font-bold text-sand-900 dark:text-sand-50">Three layers under every component.</p>
          <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
            Change a value once and every component follows.
          </p>
        </div>
        <Link
          href="/design-systems/andromeda-pro/foundation"
          className={`${buttonClasses({ variant: 'outline', size: 'md' })} h-10 self-start sm:self-auto`}
        >
          See the foundation
          <ArrowRight weight="regular" aria-hidden className="size-4" />
        </Link>
      </div>

      <ol className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
        <LayerCard n={1} title="Primitives" caption="Raw values: a grey ladder and four hue families.">
          <div className="flex w-full gap-1">
            {RAMP_STOPS.map((stop) => (
              <div key={stop} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <span
                  className="h-6 w-full"
                  style={{
                    background: `var(--andromeda-brand-${stop})`,
                    borderRadius: 2,
                    outline: stop === active ? '1px solid var(--andromeda-text-primary)' : undefined,
                    outlineOffset: 2,
                  }}
                />
                <span
                  className="text-[10px]"
                  style={{ ...MONO, color: stop === active ? 'var(--andromeda-text-primary)' : 'var(--andromeda-text-muted)' }}
                >
                  {stop}
                </span>
              </div>
            ))}
          </div>
        </LayerCard>
        <Step />
        <LayerCard n={2} title="Semantic" caption="Named roles. Components read only these.">
          <div className="flex min-w-0 flex-col items-center gap-1.5">
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className="size-3 shrink-0"
                style={{ background: `var(--andromeda-${ROLE})`, borderRadius: 2 }}
              />
              <span className="truncate text-xs" style={{ ...MONO, color: 'var(--andromeda-text-primary)' }}>
                {ROLE_NAME}
              </span>
            </span>
            {active ? (
              <span className="text-[10px]" style={{ ...MONO, color: 'var(--andromeda-text-muted)' }}>
                brand {active}
              </span>
            ) : null}
          </div>
        </LayerCard>
        <Step />
        <LayerCard n={3} title="Component wires" caption="Each part points at one role.">
          <Badge variant="accent">Live</Badge>
        </LayerCard>
      </ol>
    </div>
  )
}
