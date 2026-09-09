// ============================================================
// SERVICE ORDER · SlaPanel
// Right panel — standalone. surface.raised bg, accent corner
// brackets (no gradient, no border). Four stacked zones:
//
//   ┌ panel-header: "Window Risk" + pin/close ─────────────┐
//   │  [7×5 risk grid]   60%    ← row 1                    │
//   │  description text         ← row 2                    │
//   │  231 USED · 102 REM · [SEE TRANSFERS] ← row 3        │
//   └──────────────────────────────────────────────────────┘
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { PushPin, X, ArrowUpRight } from '@phosphor-icons/react';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Tag } from '../../components/Tag';
import { Tooltip } from '../../components/Tooltip';
import { HeatGrid } from '../../components/HeatGrid';
import { useReducedMotion } from '../../components/lib/motion';
import { slaRisk } from './data';

// Stagger timing — values match the grid's stagger so the percentage
// kicks off the moment the wave-front cell finishes its transition.
const GRID_FINISH_MS    = 800;   // last grid cell finishes around here
const PERCENT_DURATION  = 500;   // count-up duration
const CURRENT_DELAY_MS  = GRID_FINISH_MS + PERCENT_DURATION;

function InsetDivider({ side = 'bottom' }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: tokens.spacing[3],
        right: tokens.spacing[3],
        [side]: 0,
        height: 'var(--andromeda-border-width, 1px)',
        background: themeColor.border.subtle,
        pointerEvents: 'none',
      }}
    />
  );
}

export function SlaPanel() {
  const INITIAL = slaRisk.value;
  const reducedMotion = useReducedMotion();
  const [liveValue, setLiveValue] = useState(INITIAL); // drives the gauge
  const [displayedPct, setDisplayedPct] = useState(0);
  const [showCurrent, setShowCurrent] = useState(false);
  const [driftOn, setDriftOn] = useState(false);

  useEffect(() => {
    // After the grid has finished its stagger, count up the percentage to the
    // initial value. Then hand off to the live drift.
    let rafId: number | undefined;
    const startTimer = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / PERCENT_DURATION);
        // ease-out cubic — fast start, gentle settle
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplayedPct(Math.round(INITIAL * eased));
        if (t < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, GRID_FINISH_MS);

    // After the count-up settles, reveal CURRENT and start the live drift.
    const currentTimer = setTimeout(() => setShowCurrent(true), CURRENT_DELAY_MS);
    const driftTimer = setTimeout(() => setDriftOn(true), CURRENT_DELAY_MS + 400);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(currentTimer);
      clearTimeout(driftTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [INITIAL]);

  // Live drift — a calm random walk with gentle mean-reversion, simulating a
  // risk value updating from telemetry (same intent as StatTile's live drift).
  // The HeatGrid crossfades to each new value; reduced-motion holds it steady.
  useEffect(() => {
    if (!driftOn || reducedMotion) return undefined;
    const id = setInterval(() => {
      setLiveValue((v) => {
        const wander = (Math.random() - 0.5) * 12;   // ±6
        const pull   = (50 - v) * 0.12;               // pull back toward centre
        return Math.max(32, Math.min(66, Math.round(v + wander + pull)));
      });
    }, 2800);
    return () => clearInterval(id);
  }, [driftOn, reducedMotion]);

  // Once drift is live, the readout tracks the gauge value.
  useEffect(() => {
    if (driftOn) setDisplayedPct(Math.round(liveValue));
  }, [liveValue, driftOn]);

  return (
    <Card
      variant="default"
      markerProps={{ color: themeColor.accent[300] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: `${tokens.spacing[4]} ${tokens.spacing[5]}`,
        }}
      >
        <InsetDivider />
        <span
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xl,
            fontWeight: tokens.typography.weight.semibold,
            color: themeColor.text.primary,
            letterSpacing: tokens.typography.tracking.tight,
          }}
        >
          {slaRisk.title}
        </span>
        <div style={{ flex: 1 }} />
        <Tooltip label="Pin"><IconButton aria-label="Pin"   variant="ghost" size="sm" icon={PushPin} /></Tooltip>
        <Tooltip label="Close"><IconButton aria-label="Close" variant="ghost" size="sm" icon={X} /></Tooltip>
      </div>

      {/* Row 1 — grid · percentage · current chip — all on one line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: tokens.spacing[5],
          padding: `${tokens.spacing[5]} ${tokens.spacing[5]} ${tokens.spacing[4]} ${tokens.spacing[5]}`,
        }}
      >
        {/* The panel renders its own count-up / live percentage (below), so the
            gauge ships with showValue off and tracks the drifting liveValue. */}
        <HeatGrid value={liveValue} showValue={false} label="Window risk" />

        {/* Percentage — accent-300 because it IS the measurement. The 4xl
            hero reading steps down one stop below `mq.sm` (rules → Responsive). */}
        <span
          className="so-sla-pct"
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size['4xl'],
            fontWeight: tokens.typography.weight.bold,
            color: themeColor.accent[300],
            letterSpacing: tokens.typography.tracking.tight,
            lineHeight: tokens.typography.lineHeight.tight,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {displayedPct}%
        </span>

        {/* Current — chip, fades in after the count-up settles */}
        <span
          style={{
            display: 'inline-flex',
            opacity: showCurrent ? 1 : 0,
            transform: showCurrent ? 'translateY(0)' : 'translateY(-4px)',
            // off-token: 320ms + 'ease' — no matching motion token, left literal
            transition: 'opacity 320ms ease, transform 320ms ease',
          }}
        >
          <Tag variant="default">Current</Tag>
        </span>
      </div>

      {/* Row 2 — stats + CTA on the same row */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: tokens.spacing[5],
          padding: `${tokens.spacing[4]} ${tokens.spacing[5]} ${tokens.spacing[5]} ${tokens.spacing[5]}`,
          marginTop: 'auto',
        }}
      >
        <InsetDivider side="top" />
        {[slaRisk.used, slaRisk.remaining].map((stat) => (
          <div
            key={stat.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[1],
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size['2xl'],
                fontWeight: tokens.typography.weight.bold,
                color: themeColor.text.primary,
                letterSpacing: tokens.typography.tracking.tight,
                lineHeight: tokens.typography.lineHeight.tight,
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.xs,
                color: themeColor.text.muted,
                textTransform: 'uppercase',
                letterSpacing: tokens.typography.tracking.wider,
                lineHeight: tokens.typography.lineHeight.snug,
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}

        <div style={{ flex: 1 }} />
        <Button variant="outline" size="sm" icon={ArrowUpRight} style={{ whiteSpace: 'nowrap' }}>See All</Button>
      </div>

      <style>{`
        ${mq.sm} {
          /* Step the 4xl hero reading down one stop on phones so it doesn't
             overpower the narrow panel (rules → Responsive: only 4xl/5xl
             display sizes step down; the mono UI type stays fixed). */
          .so-sla-pct { font-size: ${tokens.typography.size['3xl']} !important; }
        }
      `}</style>
    </Card>
  );
}
