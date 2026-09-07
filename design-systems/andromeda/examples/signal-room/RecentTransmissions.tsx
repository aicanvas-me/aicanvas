// ============================================================
// SIGNAL ROOM: Recent transmissions
// Replaces the Spotify "Jump back in" row. Renders the shared
// <DataTable> design-system component (config-driven columns + rows,
// row hover, selected-row accent edge, click-to-play, and the mobile
// column-priority + info-tooltip fold). This example consumes the
// shared component; it no longer hand-rolls the table.
//
// The play cell, the track title/artist stack, and the peak meter are
// passed as per-column `render` functions — the bits that are specific
// to this data, layered on top of the generic grid.
// ============================================================

'use client';

import { Play, Pause } from '@phosphor-icons/react';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { Card } from '../../components/Card';
import { PanelHeader } from '../../components/PanelHeader';
import { IconButton } from '../../components/IconButton';
import { DataTable } from '../../components/DataTable';
import { recentTransmissions } from './data';
import type { Transmission } from './data';

function PeakBar({ value }: { value: number }) {
  return (
    <div
      style={{
        position: 'relative',
        height: '4px',
        width: '88px',
        background: themeColor.surface.overlay,
        border: `${tokens.border.thin} ${themeColor.border.subtle}`,
        borderRadius: tokens.radius.frame,
        display: 'inline-block',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${value}%`,
          background: value > 85 ? themeColor.orange[300] : themeColor.text.primary,
        }}
      />
    </div>
  );
}

type RecentTransmissionsProps = {
  onPlay?: (r: Transmission) => void;
  currentCode?: string;
  isPlaying?: boolean;
};

export function RecentTransmissions({ onPlay, currentCode, isPlaying }: RecentTransmissionsProps) {
  const columns = [
    {
      key: 'play',
      header: '',
      width: '48px',
      render: (r: Transmission) => (
        <IconButton
          variant={r.id === currentCode ? 'default' : 'ghost'}
          size="sm"
          icon={r.id === currentCode && isPlaying ? Pause : Play}
          aria-label={`Play ${r.track}`}
          onClick={(e) => { e.stopPropagation(); onPlay?.(r); }}
        />
      ),
    },
    { key: 'id', header: 'ID', width: '96px', hideBelow: 'md', fold: 'none', color: themeColor.text.faint },
    {
      key: 'track',
      header: 'Track',
      primary: true,
      render: (r: Transmission) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
          <span
            style={{
              fontFamily: tokens.typography.fontSans,
              fontSize: tokens.typography.size.sm,
              color: themeColor.text.primary,
              fontWeight: tokens.typography.weight.medium,
              letterSpacing: tokens.typography.tracking.tight,
              lineHeight: 'var(--andromeda-leading-none, 1)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {r.track}
          </span>
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.sm,
              color: themeColor.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
              lineHeight: 'var(--andromeda-leading-none, 1)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {r.artist}
          </span>
        </div>
      ),
    },
    { key: 'duration', header: 'Duration', width: '110px', hideBelow: 'md', fold: 'meta', color: themeColor.text.primary },
    { key: 'plays', header: 'Plays', width: '100px', hideBelow: 'md', fold: 'meta', infoValue: (r: Transmission) => `${r.plays} plays`, color: themeColor.text.primary },
    { key: 'peak', header: 'Peak', width: '124px', hideBelow: 'md', infoValue: (r: Transmission) => `${r.peak}%`, render: (r: Transmission) => <PeakBar value={r.peak} /> },
    { key: 'last', header: 'Last', width: '84px', hideBelow: 'md', color: themeColor.text.faint },
  ];

  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <PanelHeader
        title="Recent transmissions"
        actions={
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.sm,
              color: themeColor.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
              cursor: 'pointer',
            }}
          >
            See all
          </span>
        }
      />
      <DataTable
        columns={columns}
        rows={recentTransmissions}
        getRowKey={(r: Transmission) => r.id}
        onRowClick={(r: Transmission) => onPlay?.(r)}
        selectedRowKey={currentCode}
      />
    </Card>
  );
}
