// ============================================================
// SIGNAL ROOM: Routines
// Replaces the Spotify "Made for you" row of glossy artwork tiles.
// Each card is the shared <MediaCard> design-system component — a
// full-bleed photo with a code Tag top-left and the mix name + play
// count with the play action bottom-right. This example consumes the
// shared component; it no longer defines the card inline.
//
// Responsive (desktop-first — see rules.md → Responsive): below
// `mq.md` five flex-1 cards would crush into illegible slivers, so
// the faithful-stack strategy applies — the row scrolls horizontally
// inside its panel (overflow-x:auto) and each card holds a legible
// token-sized minimum (flex:0 0 auto + min-width). On desktop the
// cards keep their equal `flex-1` stretch.
// ============================================================

import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import { Card } from '../../components/Card';
import { PanelHeader } from '../../components/PanelHeader';
import { MediaCard } from '../../components/MediaCard';
import { mixes } from './data';
import type { Mix } from './data';

type MixesRowProps = {
  onPlay?: (mix: Mix) => void;
  currentCode?: string;
  isPlaying?: boolean;
};

export function MixesRow({ onPlay, currentCode, isPlaying }: MixesRowProps) {
  return (
    <Card>
      <PanelHeader
        title="Routines"
        actions={
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
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
      <div
        className="sr-mixes-row"
        style={{
          display: 'flex',
          gap: tokens.spacing[3],
          padding: tokens.spacing[3],
        }}
      >
        {mixes.map(mix => (
          <MediaCard
            key={mix.code}
            className="sr-mix-card"
            image={mix.image}
            code={mix.code}
            title={mix.name}
            meta={`${mix.plays} plays`}
            action="play"
            playing={mix.code === currentCode && isPlaying}
            onAction={() => onPlay?.(mix)}
          />
        ))}
      </div>

      <style>{`
        ${mq.md} {
          .sr-mixes-row {
            overflow-x: auto !important;
          }
          /* Release the flex-1 stretch so the cards keep a legible width and
             scroll horizontally instead of collapsing into slivers. MediaCard's
             own inline flex:1 needs !important to beat it. */
          .sr-mix-card {
            flex: 0 0 auto !important;
            width: calc(${tokens.spacing[12]} * 4) !important;
          }
        }
      `}</style>
    </Card>
  );
}
