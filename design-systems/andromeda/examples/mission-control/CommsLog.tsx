// ============================================================
// MISSION CONTROL: Row 3 right — Comms Log
// ============================================================

import { ArrowDown, ArrowUp, Warning } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { Card, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { rowContainer, rowItem } from '../../components/lib/motion';
import { commsLog } from './data';

// Inset divider line — 12px transparent stops at each end so the divider
// reads as a deliberate inset, never edge-to-edge. See `rules.md` →
// Section dividers.
const ROW_INSET_LINE = `linear-gradient(to right, transparent ${tokens.spacing[3]}, ${themeColor.border.subtle} ${tokens.spacing[3]}, ${themeColor.border.subtle} calc(100% - ${tokens.spacing[3]}), transparent calc(100% - ${tokens.spacing[3]}))`;
const rowSeparatorStyle = {
  backgroundImage: ROW_INSET_LINE,
  backgroundSize: '100% 1px',
  backgroundPosition: 'bottom',
  backgroundRepeat: 'no-repeat',
};

const dirConfig = {
  down: {
    icon:  ArrowDown,
    label: 'DN',
    color: themeColor.accent[100],
    bg:    themeColor.accent[500],
    border:themeColor.accent[400],
  },
  up: {
    icon:  ArrowUp,
    label: 'UP',
    color: themeColor.text.primary,
    bg:    themeColor.surface.raised,
    border:themeColor.border.base,
  },
  alert: {
    icon:  Warning,
    label: '!',
    color: themeColor.orange[300],
    bg:    themeColor.orange[500],
    border:themeColor.orange[400],
  },
};

function CommsItem({ entry, isLast }: { entry: (typeof commsLog)[number]; isLast: boolean }) {
  const cfg = dirConfig[entry.dir];
  const Icon = cfg.icon;

  return (
    <motion.div
      variants={rowItem}
      exit="exit"
      style={{
        display: 'flex',
        gap: tokens.spacing[3],
        padding: tokens.spacing[3],
        ...(isLast ? null : rowSeparatorStyle),
      }}
    >
      {/* Direction box */}
      <div style={{
        width: '32px',
        height: '32px',
        flexShrink: 0,
        background: cfg.bg,
        border: `${tokens.border.thin} ${cfg.border}`,
        borderRadius: tokens.radius.frame,
        color: cfg.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={20} weight="light" />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: tokens.spacing[2],
          marginBottom: tokens.spacing[1],
        }}>
          <span style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            fontWeight: tokens.typography.weight.semibold,
            color: cfg.color,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.wider,
          }}>
            {entry.from}
          </span>
          <span style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.muted,
            letterSpacing: tokens.typography.tracking.wide,
            flexShrink: 0,
          }}>
            {entry.time}
          </span>
        </div>
        <div style={{
          fontFamily: tokens.typography.fontSans,
          fontSize: tokens.typography.size.sm,
          color: themeColor.text.secondary,
          lineHeight: tokens.typography.lineHeight.snug,
        }}>
          {entry.text}
        </div>
      </div>
    </motion.div>
  );
}

export function CommsLog() {
  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
          <span style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.muted,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}>
            {'/// Channel'}
          </span>
          <span style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.md,
            color: themeColor.text.primary,
            fontWeight: tokens.typography.weight.medium,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.wider,
          }}>
            Comms Log
          </span>
        </div>
        <Button variant="ghost" size="sm">All</Button>
      </CardHeader>

      {/* Items render directly inside Card — they own their own padding.
          Sliced to 5 entries so the card matches the VehiclesTable height
          on the Overview row. The "All" button in the header is the
          escape hatch when a viewer wants the full log. The motion.div
          orchestrates the row stagger when the log scrolls into view. */}
      <motion.div
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <AnimatePresence initial={false}>
          {commsLog.slice(0, 5).map((entry, i, arr) => (
            <CommsItem
              key={`${entry.from}-${entry.time}`}
              entry={entry}
              isLast={i === arr.length - 1}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
}
