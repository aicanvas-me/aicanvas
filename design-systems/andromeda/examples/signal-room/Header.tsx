// ============================================================
// SIGNAL ROOM: Header
// Section label left, command-K search center, transmit-status
// right. Mirrors the mission-control header so the system reads
// as one family.
//
// Responsive (desktop-first — see rules.md → Responsive): this is the
// desktop header only. Below `mq.md` it is hidden entirely and the
// shared MobileTopBar (brand + hamburger) replaces it — see
// examples/_shared/TemplateMobileChrome.
// ============================================================

'use client';

import { motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import { CornerMarkers } from '../../components/CornerMarkers';
import { SearchField } from '../../components/SearchField';

type HeaderProps = {
  sectionTitle?: string;
  motionProps?: MotionProps;
};

export function Header({ sectionTitle = 'Library', motionProps }: HeaderProps) {
  return (
    <motion.header
      {...(motionProps ?? {})}
      className="sr-header"
      style={{
        position: 'relative',
        height: tokens.layout.headerHeight,
        flexShrink: 0,
        background: themeColor.surface.raised,
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${tokens.spacing[6]}`,
        gap: tokens.spacing[5],
        backdropFilter: 'blur(var(--andromeda-blur-sm, 2px))',
        WebkitBackdropFilter: 'blur(var(--andromeda-blur-sm, 2px))',
      }}
    >
      <CornerMarkers />

      {/* Section title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], flexShrink: 0 }}>
        <span
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.muted,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}
        >
          {'/// Section'}
        </span>
        <h1
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontSans,
            fontSize: tokens.typography.size.lg,
            fontWeight: tokens.typography.weight.semibold,
            color: themeColor.text.primary,
            letterSpacing: '-0.01em',
          }}
        >
          {sectionTitle}
        </h1>
      </div>

      {/* Command search */}
      <div className="sr-search" style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
        <SearchField style={{ width: '420px', maxWidth: '60%' }} />
      </div>

      {/* Transmit status — dot + label, no box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            flexShrink: 0,
            background: themeColor.accent[400],
            border: `${tokens.border.thin} ${themeColor.accent[400]}`,
            // Bespoke glow blur (6px, not the 8px glow token), left literal
            boxShadow: `0 0 6px ${themeColor.accent[500]}`,
          }}
        />
        <span
          className="sr-status-label"
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.accent[100],
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.wider,
          }}
        >
          Transmitting
        </span>
      </div>

      <style>{`
        /* Desktop only. The section title, search and status read as the
           desktop header; below md the shared MobileTopBar (brand + hamburger)
           replaces it — see examples/_shared/TemplateMobileChrome. */
        ${mq.md} { .sr-header { display: none !important; } }
      `}</style>
    </motion.header>
  );
}
