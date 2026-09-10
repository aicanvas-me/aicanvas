// ============================================================
// DASHBOARD: Row 1 — Stat Tiles
// ============================================================

import { FolderOpen, Zap, DollarSign, Target } from 'lucide-react';
import { tokens } from '../../tokens';
import { StatTile } from '../../components/StatTile';

export function StatRow() {
  return (
    <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
      <StatTile
        label="Active Projects"
        value="24"
        delta={3}
        deltaLabel="this month"
        icon={FolderOpen}
        colorVariant="primary"
      />
      <StatTile
        label="Team Velocity"
        value="87 pts"
        delta={12}
        deltaLabel="vs last sprint"
        icon={Zap}
        colorVariant="success"
      />
      <StatTile
        label="Budget Utilized"
        value="68%"
        delta={-4}
        deltaLabel="vs plan"
        icon={DollarSign}
        colorVariant="warning"
      />
      <StatTile
        label="On-time Rate"
        value="94%"
        delta={2}
        deltaLabel="vs last quarter"
        icon={Target}
        colorVariant="purple"
      />
    </div>
  );
}
