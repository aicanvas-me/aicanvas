// @ts-nocheck — design-systems/ is not type-checked (see design-systems/CLAUDE.md). Strip this after a proper typing pass.
// ============================================================
// MISSION CONTROL: Row 3 left — Vehicles Table
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '../../tokens';
import { Card, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { rowContainer, rowItem } from '../../components/lib/motion';
import { vehicles, vehicleStatusLabel } from './data';

// Local map: data status → Badge variant
const vehicleBadgeVariant = {
  active:  'accent',
  standby: 'default',
  caution: 'warning',
  fault:   'fault',
};

// Inset divider lines — 12px transparent stops at each end so the divider
// reads as a deliberate inset, never edge-to-edge. TR borders don't render
// under `border-collapse: collapse`, so the line is delivered as a
// background-image gradient instead. See `rules.md` → Section dividers.
const ROW_INSET_LINE = `linear-gradient(to right, transparent ${tokens.spacing[3]}, ${tokens.color.border.subtle} ${tokens.spacing[3]}, ${tokens.color.border.subtle} calc(100% - ${tokens.spacing[3]}), transparent calc(100% - ${tokens.spacing[3]}))`;
const HEADER_INSET_LINE = `linear-gradient(to right, transparent ${tokens.spacing[3]}, ${tokens.color.border.base} ${tokens.spacing[3]}, ${tokens.color.border.base} calc(100% - ${tokens.spacing[3]}), transparent calc(100% - ${tokens.spacing[3]}))`;
const rowSeparatorStyle = {
  backgroundImage: ROW_INSET_LINE,
  backgroundSize: '100% 1px',
  backgroundPosition: 'bottom',
  backgroundRepeat: 'no-repeat',
};
const headerSeparatorStyle = {
  backgroundImage: HEADER_INSET_LINE,
  backgroundSize: '100% 1px',
  backgroundPosition: 'bottom',
  backgroundRepeat: 'no-repeat',
};

function VehicleRow({ vehicle, isLast }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.tr
      variants={rowItem}
      exit="exit"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? tokens.color.surface.hover : 'transparent',
        transition: 'background 0.15s ease',
        ...(isLast ? null : rowSeparatorStyle),
      }}
    >
      {/* Callsign */}
      <td style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`, whiteSpace: 'nowrap' }}>
        <span style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.sm,
          color: tokens.color.text.primary,
          fontWeight: tokens.typography.weight.medium,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.wider,
        }}>
          {vehicle.callsign}
        </span>
      </td>
      {/* Type */}
      <td style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`, whiteSpace: 'nowrap' }}>
        <span style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.xs,
          color: tokens.color.text.muted,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.wider,
        }}>
          {vehicle.type}
        </span>
      </td>
      {/* Status */}
      <td style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`, whiteSpace: 'nowrap' }}>
        <Badge variant={vehicleBadgeVariant[vehicle.status]}>
          {vehicleStatusLabel[vehicle.status]}
        </Badge>
      </td>
      {/* Distance */}
      <td style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`, textAlign: 'right', whiteSpace: 'nowrap' }}>
        <span style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.sm,
          color: tokens.color.text.secondary,
          letterSpacing: tokens.typography.tracking.wide,
        }}>
          {vehicle.distance}
        </span>
      </td>
      {/* Last contact */}
      <td style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`, textAlign: 'right', whiteSpace: 'nowrap' }}>
        <span style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.xs,
          color: tokens.color.text.muted,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.wide,
        }}>
          {vehicle.lastContact}
        </span>
      </td>
    </motion.tr>
  );
}

export function VehiclesTable({ className }) {
  return (
    <Card className={className} style={{ flex: '0 0 calc(65% - 10px)', minWidth: 0 }}>
      <CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
          <span style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: tokens.color.text.muted,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}>
            /// Fleet
          </span>
          <span style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.md,
            color: tokens.color.text.primary,
            fontWeight: tokens.typography.weight.medium,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.wider,
          }}>
            Vehicles
          </span>
        </div>
        <Button variant="ghost" size="sm">View all</Button>
      </CardHeader>

      {/* Horizontal scroller — the faithful-stack strategy: when the panel is
          narrower than the table's natural width (stacked phone layout), the
          columns scroll INSIDE the panel rather than reflowing into cards or
          forcing page scroll. `width:max-content` lets the table size to its
          content (cells never wrap — see whiteSpace below) while `minWidth:100%`
          keeps it filling the panel on desktop. No hardcoded px — the columns'
          natural widths set the scroll threshold. See rules.md → Responsive
          (faithful-stack). */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={headerSeparatorStyle}>
            {[
              { label: 'Callsign',     align: 'left'  },
              { label: 'Type',         align: 'left'  },
              { label: 'Status',       align: 'left'  },
              { label: 'Distance',     align: 'right' },
              { label: 'Last Contact', align: 'right' },
            ].map((col, i) => (
              <th key={i} style={{
                padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`,
                textAlign: col.align,
                whiteSpace: 'nowrap',
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.xs,
                fontWeight: tokens.typography.weight.medium,
                color: tokens.color.text.faint,
                textTransform: 'uppercase',
                letterSpacing: tokens.typography.tracking.widest,
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody
          variants={rowContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <AnimatePresence initial={false}>
            {vehicles.map((vehicle, i) => (
              <VehicleRow
                key={vehicle.callsign}
                vehicle={vehicle}
                isLast={i === vehicles.length - 1}
              />
            ))}
          </AnimatePresence>
        </motion.tbody>
        </table>
      </div>
    </Card>
  );
}
