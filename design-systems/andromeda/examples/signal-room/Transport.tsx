// ============================================================
// SIGNAL ROOM: Transport (layout wrapper)
// NOT a player — the player is the shared <MusicPlayer> design-system
// component. This file is only Signal Room's LAYOUT for it: on desktop
// the player is a normal in-flow bottom region; below `mq.md` it floats
// fixed at the bottom with a 12px inset on every edge, a page-background
// reveal strip above it, and an in-flow spacer (sized to the player's
// measured height) so the last scrolled row clears the floating player
// with no overlap and no oversized gap. Positioning belongs to the
// consumer, so it lives here, not in the shared component.
// ============================================================

'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import { MusicPlayer } from '../../components/MusicPlayer';
import { nowPlaying } from './data';
import type { PlayerTrack } from './data';

// Client-side measure-before-paint; plain effect on the server (no SSR warning).
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type TransportProps = {
  current?: PlayerTrack;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  motionProps?: MotionProps;
};

export function Transport({ current, isPlaying, onTogglePlay, motionProps }: TransportProps) {
  const cur = current ?? {
    title: nowPlaying.track,
    subtitle: nowPlaying.artist,
    cover: null,
  };
  // Signal Room's player second line is the play count (not the artist) — the
  // shared MusicPlayer just renders whatever `subtitle` it's handed.
  const plays = current?.plays ?? nowPlaying.plays;
  const duration = current?.duration ?? nowPlaying.duration;
  const track = { title: cur.title, subtitle: `${plays} plays`, cover: cur.cover ?? null };

  // The player is position:fixed on mobile (zero flow space), so this in-flow
  // spacer reserves exactly the player's height minus the two spacing[3] bands
  // the scroller already reserves (the .sr-main-col flex gap in front of it and
  // .sr-shell's bottom padding behind it), landing the last row at the reveal
  // strip: no overlap, no oversized gap.
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [playerH, setPlayerH] = useState(0);
  useIsomorphicLayoutEffect(() => {
    const el = outerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => setPlayerH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <motion.div
        {...(motionProps ?? {})}
        ref={outerRef}
        className="sr-transport-outer"
        style={{ position: 'relative', flexShrink: 0 }}
      >
        <MusicPlayer track={track} playing={isPlaying} duration={duration} onTogglePlay={onTogglePlay} />
      </motion.div>

      <div
        aria-hidden
        className="sr-transport-spacer"
        style={{ display: 'none', height: playerH ? `calc(${playerH}px - ${tokens.spacing[3]})` : 0 }}
      />

      <style>{`
        ${mq.md} {
          /* Float the player fixed at the bottom with a 12px inset on every
             edge; padding-top + surface.base give the reveal strip above it. */
          .sr-transport-outer {
            position: fixed !important;
            left: ${tokens.spacing[3]} !important;
            right: ${tokens.spacing[3]} !important;
            bottom: ${tokens.spacing[3]} !important;
            z-index: 20 !important;
            background: ${themeColor.surface.base} !important;
            padding-top: ${tokens.spacing[3]} !important;
          }
          .sr-transport-spacer { display: block !important; }
        }
      `}</style>
    </>
  );
}
