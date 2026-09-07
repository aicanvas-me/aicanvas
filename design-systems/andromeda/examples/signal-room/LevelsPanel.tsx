// ============================================================
// SIGNAL ROOM: Output levels
// Right column under the hero — a vertical stack of channel
// faders mapped onto Andromeda's ProgressBar primitive. The
// "OUT" badge in the header lives next to the title; everything
// else reuses the SystemStatus body pattern from mission control.
// Uses PanelHeader to match its row-mate (RecentTransmissions)
// per the "don't mix header weights at the same hierarchy" rule.
// ============================================================

import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { Card } from '../../components/Card';
import { PanelHeader } from '../../components/PanelHeader';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import {
  channelLevels,
  levelStatusVariant,
  levelStatusLabel,
  levelProgressVariant,
} from './data';

export function LevelsPanel() {
  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <PanelHeader
        title="Output levels"
        actions={<Badge variant="accent">Live</Badge>}
      />

      <div style={{ padding: tokens.spacing[4] }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
          {channelLevels.map(lvl => (
            <div
              key={lvl.name}
              style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}
              >
                <span
                  style={{
                    fontFamily: tokens.typography.fontMono,
                    fontSize: tokens.typography.size.xs,
                    color: themeColor.text.primary,
                    fontWeight: tokens.typography.weight.medium,
                    textTransform: 'uppercase',
                    letterSpacing: tokens.typography.tracking.wider,
                  }}
                >
                  {lvl.name}
                </span>
                <Badge variant={levelStatusVariant[lvl.status]}>
                  {levelStatusLabel[lvl.status]}
                </Badge>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                }}
              >
                <ProgressBar
                  value={lvl.value}
                  variant={levelProgressVariant[lvl.status]}
                  style={{ flex: 1 }}
                />
                <span
                  style={{
                    fontFamily: tokens.typography.fontMono,
                    fontSize: tokens.typography.size.xs,
                    color: themeColor.text.faint,
                    letterSpacing: tokens.typography.tracking.wider,
                    flexShrink: 0,
                    width: '32px',
                    textAlign: 'right',
                  }}
                >
                  {lvl.value}dB
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
