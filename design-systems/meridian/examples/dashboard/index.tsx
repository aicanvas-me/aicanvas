// ============================================================
// MERIDIAN EXAMPLE: Dashboard — composition shell
// ============================================================

import { useState } from 'react';
import { tokens } from '../../tokens';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatRow } from './StatRow';
import { VelocityChart } from './VelocityChart';
import { WorkloadChart } from './WorkloadChart';
import { ProjectsTable } from './ProjectsTable';
import { ActivityFeed } from './ActivityFeed';

export default function Dashboard() {
  const [activeNav, setActiveNav]     = useState('overview');
  const [searchValue, setSearchValue] = useState('');

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: tokens.color.neutral[30],
      fontFamily: tokens.typography.fontFamily,
      overflow: 'hidden',
    }}>
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <Header searchValue={searchValue} onSearchChange={setSearchValue} />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: tokens.spacing[6],
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[4],
          boxSizing: 'border-box',
        }}>
          <StatRow />

          <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
            <VelocityChart />
            <WorkloadChart />
          </div>

          <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
            <ProjectsTable />
            <ActivityFeed />
          </div>
        </main>
      </div>
    </div>
  );
}
