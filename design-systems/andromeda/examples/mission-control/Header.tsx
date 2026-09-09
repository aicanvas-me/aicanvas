// ============================================================
// MISSION CONTROL: Header
// Title left, mission clock center, status + bell right.
//
// Responsive (desktop-first — see rules.md → Responsive): this is the
// desktop header only. Below `mq.md` it is hidden entirely and the
// shared MobileTopBar (brand + hamburger) replaces it — see
// examples/_shared/TemplateMobileChrome.
// ============================================================

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import type { useCascadeProps } from '../../components/lib/motion';
import { CornerMarkers } from '../../components/CornerMarkers';

function pad(n: number) { return String(n).padStart(2, '0'); }

function MissionClock() {
  // Display "T+ HH:MM:SS" — counts up from page mount.
  const [seconds, setSeconds] = useState(14 * 3600 + 32 * 60 + 8); // start at T+ 14:32:08

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[3],
      padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
      border: `${tokens.border.thin} ${themeColor.border.base}`,
      background: themeColor.surface.raised,
      position: 'relative',
      minWidth: 0,
    }}>
      <CornerMarkers size={4} offset={2} />
      <span style={{
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.xs,
        color: themeColor.text.muted,
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.tracking.widest,
      }}>
        Mission
      </span>
      <span style={{
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.md,
        color: themeColor.accent[300],
        fontWeight: tokens.typography.weight.medium,
        letterSpacing: tokens.typography.tracking.wide,
      }}>
        T+ {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </div>
  );
}

export function Header({ sectionTitle = 'Overview', motionProps }: {
  sectionTitle?: string;
  motionProps?: ReturnType<typeof useCascadeProps>;
}) {
  return (
    <motion.header
      {...(motionProps ?? {})}
      className="mc-header"
      style={{
        position: 'relative',
        height: tokens.layout.headerHeight,
        flexShrink: 0,
        background: themeColor.surface.raised,
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${tokens.spacing[6]}`,
        gap: tokens.spacing[5],
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >
      <CornerMarkers />

      {/* Title block — section-aware */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], flexShrink: 0 }}>
        <span style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.xs,
          color: themeColor.text.muted,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.widest,
        }}>
          {'/// Section'}
        </span>
        <h1 style={{
          margin: 0,
          fontFamily: tokens.typography.fontSans,
          fontSize: tokens.typography.size.lg,
          fontWeight: tokens.typography.weight.semibold,
          color: themeColor.text.primary,
          letterSpacing: '-0.01em',
        }}>
          {sectionTitle}
        </h1>
      </div>

      {/* Mission clock — centered */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
        <MissionClock />
      </div>

      {/* Right: status only — dot + label, no box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        flexShrink: 0,
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          flexShrink: 0,
          background: themeColor.accent[400],
          border: `${tokens.border.thin} ${themeColor.accent[400]}`,
          boxShadow: `0 0 6px ${themeColor.accent[500]}`, // 6px glow is a bespoke dot value, not the 8px system glow
        }} />
        <span
          className="mc-status-label"
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.accent[100],
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.wider,
          }}
        >
          Nominal
        </span>
      </div>

      <style>{`
        /* Desktop only. The section title, mission clock and status read as
           the desktop header; below md the shared MobileTopBar (brand +
           hamburger) replaces it — see examples/_shared/TemplateMobileChrome. */
        ${mq.md} { .mc-header { display: none !important; } }
      `}</style>
    </motion.header>
  );
}
