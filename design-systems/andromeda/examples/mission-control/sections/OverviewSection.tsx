// ============================================================
// MISSION CONTROL · Overview section
// Original dashboard composition: TelemetryRow + NextDestination
// + RadarChart/SystemStatus + VehiclesTable/CommsLog. Lifted out
// of index.tsx so the section switcher can route to it like any
// other section.
//
// Entrance: each visual row is a `motion.div` that picks up the
// next slot in the parent's cascade via `useCascadeProps`. Pass
// `startIndex` to align this section's first row with the parent
// sequence (Sidebar=0, Header=1, then our rows pick up from 2).
// Rendered standalone, the default startIndex=0 cascades from
// scratch.
//
// Responsive (desktop-first — see rules.md → Responsive): the two
// dual-pane rows are flex on desktop. Below `mq.md` they collapse to
// a single column (flex-direction:column) and the panels' fixed
// flex-bases (60% / 65%) reset to full width — source order keeps
// the primary panel first (RadarChart before SystemStatus,
// VehiclesTable before CommsLog).
// ============================================================

'use client';

import { motion } from 'framer-motion';
import { tokens } from '../../../tokens';
import { mq } from '../../../components/lib/responsive';
import { useCascadeProps } from '../../../components/lib/motion';
import { TelemetryRow } from '../TelemetryRow';
import { RadarChart } from '../../../components/RadarChart';
import { SystemStatus } from '../SystemStatus';
import { VehiclesTable } from '../VehiclesTable';
import { CommsLog } from '../CommsLog';
import { NextDestination } from '../NextDestination';

export function OverviewSection({ startIndex = 0 }) {
  // Four visual rows, each gets the next slot in the parent's cascade.
  // Standalone: rows cascade 0..3. Inside Mission Control: 2..5.
  const row0 = useCascadeProps(startIndex);
  const row1 = useCascadeProps(startIndex + 1);
  const row2 = useCascadeProps(startIndex + 2);
  const row3 = useCascadeProps(startIndex + 3);

  return (
    <>
      <motion.div {...row0}>
        <TelemetryRow />
      </motion.div>

      <motion.div {...row1}>
        <NextDestination />
      </motion.div>

      <motion.div {...row2} className="mc-pane-row" style={{ display: 'flex', gap: tokens.spacing[5] }}>
        <RadarChart
          className="mc-pane-primary"
          style={{ flex: '0 0 calc(60% - 10px)', minWidth: 0 }}
          label="/// Systems"
          title="Ship Diagnostics"
          description="Nominal vs critical thresholds"
        />
        <SystemStatus />
      </motion.div>

      <motion.div {...row3} className="mc-pane-row" style={{ display: 'flex', gap: tokens.spacing[5] }}>
        <VehiclesTable className="mc-pane-primary" />
        <CommsLog />
      </motion.div>

      <style>{`
        ${mq.md} {
          /* Dual-pane rows stack one column; panels with a fixed flex-basis
             (60% / 65%) reset to full width. Tighter row gap on the stack. */
          .mc-pane-row {
            flex-direction: column !important;
            gap: ${tokens.spacing[3]} !important;
          }
          .mc-pane-primary {
            flex: 1 1 auto !important;
            width: 100% !important;
          }
        }
      `}</style>
    </>
  );
}
