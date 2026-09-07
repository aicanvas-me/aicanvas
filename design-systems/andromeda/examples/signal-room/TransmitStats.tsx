// ============================================================
// SIGNAL ROOM: Transmit stats
// Row of telemetry-style readouts that report on the active
// transmission (signal / bitrate / latency / channel). Lives as
// a sibling of NowTransmitting — NOT nested inside it — so the
// StatTile corner markers don't sit inside the hero panel's
// corner markers. See rules.md → "Frames don't nest".
//
// Responsive (desktop-first — see rules.md → Responsive): below
// `mq.md` the seam-joined tile strip would crush 4 tiles into
// illegible slivers, so the faithful-stack strategy applies — the
// strip scrolls horizontally inside its row (overflow-x:auto) and
// each tile holds a legible token-sized minimum (flex:0 0 auto +
// min-width). On desktop the tiles keep their equal `flex-1`
// stretch and the -1px seam overlap. Matches mission-control's
// TelemetryRow.
// ============================================================

'use client';

import { tokens } from '../../tokens';
import { mq } from '../../components/lib/responsive';
import { StatTile } from '../../components/StatTile';
import { nowTransmittingStats } from './data';

export function TransmitStats() {
  return (
    <div className="sr-stats-strip" style={{ display: 'flex', gap: 0 }}>
      {nowTransmittingStats.map((stat, i) => (
        <StatTile
          key={stat.code}
          className="sr-stat-tile"
          code={stat.code}
          label={stat.label}
          value={stat.value}
          unit={stat.unit}
          delta={stat.delta}
          polarity={stat.polarity}
          deltaLabel={stat.deltaLabel}
          live
          style={{ marginLeft: i > 0 ? -1 : 0 }}
        />
      ))}

      <style>{`
        ${mq.md} {
          .sr-stats-strip {
            overflow-x: auto !important;
          }
          .sr-stat-tile {
            flex: 0 0 auto !important;
            min-width: calc(${tokens.spacing[12]} * 3) !important;
          }
        }
      `}</style>
    </div>
  );
}
