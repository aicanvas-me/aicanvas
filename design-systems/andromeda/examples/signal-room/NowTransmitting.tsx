// ============================================================
// SIGNAL ROOM: Now Transmitting
// Hero panel. Replaces the Spotify "Sound without limits"
// marketing hero with a telemetry-style readout of the active
// stream: title + description on the left, live waveform
// visualisation on the right. The 4 StatTiles (signal/bitrate/
// latency/channel) live OUTSIDE this panel as a sibling row —
// nesting corner-marked surfaces inside another corner-marked
// surface produces bracket-inside-bracket clutter. See rules.md
// → "Frames don't nest". The waveform is the only live element
// in the hero — it redraws every 1.4s to signal continuous
// transmission (movement signals data movement).
// ============================================================

'use client';

import { Play, Heart } from '@phosphor-icons/react';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import { Card } from '../../components/Card';
import { PanelHeader } from '../../components/PanelHeader';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Waveform } from '../../components/Waveform';

export function NowTransmitting() {
  return (
    <Card style={{ width: '100%' }}>
      <PanelHeader
        title="Now transmitting"
        actions={
          <Badge variant="accent">
            Live · Channel 04
          </Badge>
        }
      />

      <div style={{ padding: tokens.spacing[5] }}>
        <div className="sr-hero-panes" style={{ display: 'flex', gap: tokens.spacing[5], alignItems: 'stretch' }}>
          {/* Left: stream metadata */}
          <div
            className="sr-hero-meta"
            style={{
              flex: '0 0 36%',
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[3],
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              <span
                style={{
                  fontFamily: tokens.typography.fontMono,
                  fontSize: tokens.typography.size.xs,
                  color: themeColor.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: tokens.typography.tracking.widest,
                }}
              >
                {'/// Featured stream'}
              </span>
              <h2
                className="sr-hero-title"
                style={{
                  margin: 0,
                  fontFamily: tokens.typography.fontSans,
                  fontSize: tokens.typography.size['3xl'],
                  fontWeight: tokens.typography.weight.semibold,
                  color: themeColor.text.primary,
                  letterSpacing: '-0.02em',
                  lineHeight: tokens.typography.lineHeight.tight,
                }}
              >
                Sound without limits.
              </h2>
              <p
                style={{
                  margin: 0,
                  fontFamily: tokens.typography.fontSans,
                  fontSize: tokens.typography.size.sm,
                  color: themeColor.text.secondary,
                  lineHeight: tokens.typography.lineHeight.normal,
                  maxWidth: '40ch',
                }}
              >
                Continuous transmission across 12 channels, mastered at 320 kbps.
                Discover the weekly mix or tune any frequency on the dial.
              </p>
            </div>

            <div style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center' }}>
              <Button variant="default" size="sm" icon={Play}>
                Engage stream
              </Button>
              <Button variant="outline" size="sm" icon={Heart}>
                Save
              </Button>
            </div>
          </div>

          {/* Right: live waveform */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[2],
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span
                style={{
                  fontFamily: tokens.typography.fontMono,
                  fontSize: tokens.typography.size.xs,
                  color: themeColor.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: tokens.typography.tracking.widest,
                }}
              >
                {'/// Waveform'}
              </span>
              <span
                style={{
                  fontFamily: tokens.typography.fontMono,
                  fontSize: tokens.typography.size.xs,
                  color: themeColor.text.faint,
                  textTransform: 'uppercase',
                  letterSpacing: tokens.typography.tracking.widest,
                }}
              >
                T-LIVE · 96 SAMPLES/S
              </span>
            </div>
            <Waveform height={120} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.xs,
                color: themeColor.text.faint,
                textTransform: 'uppercase',
                letterSpacing: tokens.typography.tracking.widest,
              }}
            >
              <span>−12dB</span>
              <span>0dB</span>
              <span>+12dB</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        ${mq.md} {
          /* Hero dual-pane stacks: metadata block on top, waveform below.
             The left pane releases its 36% basis to flow full width. */
          .sr-hero-panes { flex-direction: column !important; gap: ${tokens.spacing[4]} !important; }
          .sr-hero-meta { flex: 1 1 auto !important; }
        }
        ${mq.sm} {
          /* Step the hero reading down one stop (3xl → 2xl) — the largest
             display size on the page overpowers a phone at full size. */
          .sr-hero-title { font-size: ${tokens.typography.size['2xl']} !important; }
        }
      `}</style>
    </Card>
  );
}
