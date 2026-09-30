// ============================================================================
// MUSICPLAYER
// A block-scale transport composite for media playback — track identity,
// transport controls, a scrub slider with elapsed/remaining readouts, and a
// like / lyrics / volume cluster, all reading as one bar. Assembled from
// Andromeda primitives (IconButton, Slider, CornerMarkers). This is the
// canonical shared component behind the Signal Room template's player.
//
// Controlled OR uncontrolled: pass playback state + callbacks to drive it, or
// omit them and the bar runs a live demo (an internal once-per-second timer
// advances the scrubber while playing). One primary action — the accent-filled
// Play. The liked heart is the single sanctioned colour exception (red on a
// non-fault element), a plain toggle affordance.
//
// Responsive: a wide single row is the base layout; below its own container
// width `breakpoints.md` it STACKS into three rows (track meta, timer/scrub,
// transport controls), like a mobile player. It responds to ITS OWN width via
// a CSS container query (`container-type: inline-size`), NOT the viewport — a
// block-scale bar can be dropped into a narrow panel on a wide screen, and it
// must stack on its own container, not the window. Positioning (fixed/sticky/
// in-flow) stays the consumer's job.
// ============================================================================

'use client';

import { forwardRef, useEffect, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  SpeakerHigh,
  ListBullets,
  Heart,
  Broadcast,
} from '@phosphor-icons/react';
import { tokens } from '../tokens';
import { cn, andromedaVars } from './lib/utils';
import { CornerMarkers } from './CornerMarkers';
import { IconButton } from './IconButton';
import { Slider } from './Slider';

const DEFAULT_TRACK = {
  title: 'Signal Drift',
  subtitle: 'Lyra Voss',
  cover: null,
};
const DEFAULT_DURATION = 221;
const DEFAULT_VOLUME = 72;
// A pressed toggle (shuffle, repeat, lyrics) lights its glyph in the accent.
const PRESSED_INK = `var(--andromeda-accent-300, ${tokens.color.accent[300]})`;

type MusicPlayerTrack = { title?: string; subtitle?: string; cover?: string | null };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatTime(sec: number) {
  const s = Math.max(0, Number.isFinite(sec) ? sec : 0);
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

function Cover({ cover, title }: { cover: string | null; title: string }) {
  // Cover art when the track has it, else a stylised broadcast glyph.
  return (
    <div
      style={{
        position: 'relative',
        width: '40px',
        height: '40px',
        flexShrink: 0,
        background: cover
          ? `center / cover no-repeat url(${JSON.stringify(cover)})`
          : `var(--andromeda-surface-overlay, ${tokens.color.surface.overlay})`,
        border: `${tokens.border.thin} var(--andromeda-border-subtle, ${tokens.color.border.subtle})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="img"
      aria-label={title ? `${title} cover` : 'Cover art'}
    >
      <CornerMarkers size={4} offset={1} />
      {/* Glyph ink rides `style`: an icon's `color` prop lands on the svg fill
          ATTRIBUTE, which takes the literal, while the CSS property resolves. */}
      {cover ? null : (
        <Broadcast
          size={tokens.iconSize.sm}
          weight="regular"
          style={{ fill: `var(--andromeda-text-muted, ${tokens.color.text.muted})` }}
        />
      )}
    </div>
  );
}

/**
 * @typedef {object} MusicPlayerProps
 * @property {{ title: string, subtitle: string, cover: string | null }} [track=DEFAULT_TRACK] Track identity shown in the metadata region.
 * @property {boolean} [playing=true] Play state; the internal fallback's initial value when onTogglePlay is omitted.
 * @property {number} [elapsed] Controlled elapsed seconds; omit it (and onSeek) to run the internal demo timer from zero. Supplying either one makes elapsed controlled and stops the timer.
 * @property {number} [duration=221] Track length in seconds.
 * @property {number} [volume=72] Volume 0..100; local fallback when onVolumeChange is omitted.
 * @property {boolean} [liked=false] Liked state; local fallback when onLike is omitted.
 * @property {() => void} [onTogglePlay] Primary play/pause handler; omission enables local play state.
 * @property {(seconds: number) => void} [onSeek] Scrub handler; omission enables local seeking when elapsed is also omitted.
 * @property {() => void} [onNext] Next-track handler; omission restarts the demo track.
 * @property {() => void} [onPrev] Previous-track handler; omission restarts the demo track.
 * @property {boolean} [shuffle=false] Shuffle state; local fallback when onShuffle is omitted.
 * @property {boolean} [repeat=false] Repeat state; local fallback when onRepeat is omitted.
 * @property {boolean} [lyrics=false] Lyrics-open state; local fallback when onLyrics is omitted.
 * @property {() => void} [onShuffle] Shuffle-toggle handler; omission enables local shuffle state.
 * @property {() => void} [onRepeat] Repeat-toggle handler; omission enables local repeat state.
 * @property {() => void} [onLyrics] Lyrics-toggle handler; omission enables local lyrics state.
 * @property {() => void} [onLike] Like-toggle handler; omission enables local liked state.
 * @property {(volume: number) => void} [onVolumeChange] Volume handler; omission enables local volume state.
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 */
type MusicPlayerOwnProps = {
  track?: MusicPlayerTrack;
  playing?: boolean;
  elapsed?: number;
  duration?: number;
  volume?: number;
  liked?: boolean;
  shuffle?: boolean;
  repeat?: boolean;
  lyrics?: boolean;
  onTogglePlay?: () => void;
  onSeek?: (seconds: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onShuffle?: () => void;
  onRepeat?: () => void;
  onLyrics?: () => void;
  onLike?: () => void;
  onVolumeChange?: (volume: number) => void;
  className?: string;
  style?: CSSProperties;
};

type MusicPlayerProps = MusicPlayerOwnProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof MusicPlayerOwnProps>;

/** @type {React.ForwardRefExoticComponent<MusicPlayerProps & React.HTMLAttributes<HTMLDivElement>>} */
export const MusicPlayer = forwardRef<HTMLDivElement, MusicPlayerProps>(function MusicPlayer(
  {
    track = DEFAULT_TRACK,
    playing: playingProp = true,
    elapsed: elapsedProp,
    duration = DEFAULT_DURATION,
    volume: volumeProp = DEFAULT_VOLUME,
    liked: likedProp = false,
    shuffle: shuffleProp = false,
    repeat: repeatProp = false,
    lyrics: lyricsProp = false,
    onTogglePlay,
    onSeek,
    onNext,
    onPrev,
    onShuffle,
    onRepeat,
    onLyrics,
    onLike,
    onVolumeChange,
    className,
    style,
    ...props
  },
  ref,
) {
  const cur = {
    title: track?.title ?? DEFAULT_TRACK.title,
    subtitle: track?.subtitle ?? DEFAULT_TRACK.subtitle,
    cover: track?.cover ?? DEFAULT_TRACK.cover,
  };
  const safeDuration = Math.max(0, Number.isFinite(duration) ? duration : DEFAULT_DURATION);
  const controlledElapsed = elapsedProp !== undefined || typeof onSeek === 'function';

  const [localPlaying, setLocalPlaying] = useState(playingProp);
  const [localLiked, setLocalLiked] = useState(likedProp);
  const [localElapsed, setLocalElapsed] = useState(0);
  const [localVolume, setLocalVolume] = useState(() => clamp(volumeProp, 0, 100));
  const [localShuffle, setLocalShuffle] = useState(shuffleProp);
  const [localRepeat, setLocalRepeat] = useState(repeatProp);
  const [localLyrics, setLocalLyrics] = useState(lyricsProp);

  const playing = onTogglePlay ? playingProp : localPlaying;
  const liked = onLike ? likedProp : localLiked;
  // Number.isFinite() carries no type predicate, so the true branch is narrowed
  // by hand; it is a finite number by definition of the guard.
  const elapsed = clamp(Number.isFinite(elapsedProp) ? (elapsedProp as number) : localElapsed, 0, safeDuration);
  const volume = onVolumeChange ? clamp(volumeProp, 0, 100) : localVolume;
  const shuffle = onShuffle ? shuffleProp : localShuffle;
  const repeat = onRepeat ? repeatProp : localRepeat;
  const lyrics = onLyrics ? lyricsProp : localLyrics;

  const togglePlay = onTogglePlay ?? (() => setLocalPlaying((p) => !p));
  const toggleLike = onLike ?? (() => setLocalLiked((v) => !v));
  const toggleShuffle = onShuffle ?? (() => setLocalShuffle((v) => !v));
  const toggleRepeat = onRepeat ?? (() => setLocalRepeat((v) => !v));
  const toggleLyrics = onLyrics ?? (() => setLocalLyrics((v) => !v));
  const handleSeek = (v: number) => {
    const s = clamp(Number.isFinite(v) ? v : 0, 0, safeDuration);
    if (onSeek) onSeek(s);
    else if (elapsedProp === undefined) setLocalElapsed(s);
  };
  // Without a playlist behind it, Previous and Next restart the current track.
  const restart = () => handleSeek(0);
  const handleVolume = (v: number) => {
    const s = clamp(Number.isFinite(v) ? v : 0, 0, 100);
    if (onVolumeChange) onVolumeChange(s);
    else setLocalVolume(s);
  };

  useEffect(() => {
    if (!controlledElapsed) setLocalElapsed(0);
  }, [controlledElapsed, cur.title]);

  useEffect(() => {
    if (controlledElapsed || !playing || safeDuration <= 0) return undefined;
    const id = setInterval(() => setLocalElapsed((e) => Math.min(safeDuration, e + 1)), 1000);
    return () => clearInterval(id);
  }, [controlledElapsed, playing, safeDuration]);

  return (
    // Container-query root: makes the bar respond to its OWN width, not the
    // viewport. The visual bar is the inner div.
    <div
      {...props}
      ref={ref}
      className={cn('andro-mp-root', className)}
      style={{
        ...andromedaVars(),
        containerType: 'inline-size',
        width: '100%',
        ...style,
      }}
    >
      <div
        className="andro-mp-bar"
        style={{
          position: 'relative',
          boxSizing: 'border-box',
          width: '100%',
          background: `var(--andromeda-surface-raised, ${tokens.color.surface.raised})`,
          backdropFilter: 'blur(var(--andromeda-blur-sm, 2px))',
          WebkitBackdropFilter: 'blur(var(--andromeda-blur-sm, 2px))',
          display: 'flex',
          alignItems: 'center',
          padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
          gap: tokens.spacing[5],
          fontFamily: tokens.typography.fontSans,
          color: `var(--andromeda-text-primary, ${tokens.color.text.primary})`,
        }}
      >
        <CornerMarkers />

        {/* Left: track metadata */}
        <div
          className="andro-mp-meta"
          style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flex: '0 1 220px', minWidth: 0 }}
        >
          <Cover cover={cur.cover} title={cur.title} />
          <div className="andro-mp-meta-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <span
              style={{
                fontFamily: tokens.typography.fontSans,
                fontSize: tokens.typography.size.md,
                fontWeight: tokens.typography.weight.medium,
                color: `var(--andromeda-text-primary, ${tokens.color.text.primary})`,
                letterSpacing: tokens.typography.tracking.tight,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {cur.title}
            </span>
            <span
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.xs,
                color: `var(--andromeda-text-muted, ${tokens.color.text.muted})`,
                textTransform: 'uppercase',
                letterSpacing: tokens.typography.tracking.widest,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {cur.subtitle}
            </span>
          </div>
          {/* Stacked-layout only like — render-both-and-CSS-hide: same state as
              the aux copy, relocated onto the meta row so the stack needs no
              extra row. */}
          <IconButton
            variant="ghost"
            size="md"
            className="andro-mp-meta-like"
            aria-label={liked ? 'Unlike' : 'Like'}
            onClick={toggleLike}
            style={{ display: 'none' }}
          >
            <Heart
              size={16}
              weight={liked ? 'fill' : 'regular'}
              style={{ fill: liked ? `var(--andromeda-red-300, ${tokens.color.red[300]})` : undefined }}
            />
          </IconButton>
        </div>

        {/* Center: transport controls + scrub */}
        <div
          className="andro-mp-center"
          style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: tokens.spacing[1] }}
        >
          <div
            className="andro-mp-controls"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[3] }}
          >
            <IconButton variant="ghost" size="md" aria-label="Shuffle" aria-pressed={shuffle} onClick={toggleShuffle}>
              <Shuffle size={16} weight="regular" style={{ fill: shuffle ? PRESSED_INK : undefined }} />
            </IconButton>
            <IconButton variant="ghost" size="lg" icon={SkipBack} aria-label="Previous" onClick={onPrev ?? restart} />
            <IconButton
              variant="default"
              size="lg"
              icon={playing ? Pause : Play}
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={togglePlay}
            />
            <IconButton variant="ghost" size="lg" icon={SkipForward} aria-label="Next" onClick={onNext ?? restart} />
            <IconButton variant="ghost" size="md" aria-label="Repeat" aria-pressed={repeat} onClick={toggleRepeat}>
              <Repeat size={16} weight="regular" style={{ fill: repeat ? PRESSED_INK : undefined }} />
            </IconButton>
          </div>

          <div className="andro-mp-scrub" style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <span
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.sm,
                color: `var(--andromeda-text-muted, ${tokens.color.text.muted})`,
                letterSpacing: tokens.typography.tracking.wide,
                flexShrink: 0,
                width: '44px',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTime(elapsed)}
            </span>
            <Slider min={0} max={safeDuration} step={1} value={elapsed} onValueChange={handleSeek} showValue={false} aria-label="Seek" style={{ flex: 1, minWidth: 0 }} />
            <span
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.sm,
                color: `var(--andromeda-text-muted, ${tokens.color.text.muted})`,
                letterSpacing: tokens.typography.tracking.wide,
                flexShrink: 0,
                width: '48px',
                textAlign: 'left',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              -{formatTime(Math.max(0, safeDuration - elapsed))}
            </span>
          </div>
        </div>

        {/* Right: like + lyrics + volume */}
        <div
          className="andro-mp-aux"
          style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flex: '0 1 240px', justifyContent: 'flex-end' }}
        >
          <IconButton variant="ghost" size="md" className="andro-mp-aux-like" aria-label={liked ? 'Unlike' : 'Like'} onClick={toggleLike}>
            <Heart
              size={16}
              weight={liked ? 'fill' : 'regular'}
              style={{ fill: liked ? `var(--andromeda-red-300, ${tokens.color.red[300]})` : undefined }}
            />
          </IconButton>
          <div className="andro-mp-volume" style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], minWidth: 0 }}>
            <IconButton variant="ghost" size="md" aria-label="Lyrics" aria-pressed={lyrics} onClick={toggleLyrics}>
              <ListBullets size={16} weight="regular" style={{ fill: lyrics ? PRESSED_INK : undefined }} />
            </IconButton>
            <SpeakerHigh
              size={16}
              weight="regular"
              style={{ fill: `var(--andromeda-text-muted, ${tokens.color.text.muted})`, flexShrink: 0 }}
            />
            <div style={{ width: '120px', minWidth: '72px' }}>
              <Slider min={0} max={100} step={1} value={volume} onValueChange={handleVolume} showValue={false} aria-label="Volume" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @container (max-width: ${tokens.breakpoints.md}) {
          /* Narrow container: the bar STACKS into three rows — track meta, then
             the timer/scrub, then the transport controls — like a mobile player. */
          .andro-mp-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: ${tokens.spacing[4]} !important;
            gap: ${tokens.spacing[3]} !important;
          }
          /* Row 1 — meta across the width, title takes the slack so the like
             button (relocated here when stacked) sits at the far right. */
          .andro-mp-meta { flex: 0 0 auto !important; }
          .andro-mp-meta-text { flex: 1 1 auto !important; }
          .andro-mp-meta-like { display: inline-flex !important; }
          /* Rows 2 + 3 — reverse the centre column so scrub sits ABOVE the
             transport controls (meta / scrub / controls, top to bottom). */
          .andro-mp-center {
            flex: 0 0 auto !important;
            flex-direction: column-reverse !important;
            gap: ${tokens.spacing[3]} !important;
          }
          .andro-mp-controls { gap: ${tokens.spacing[4]} !important; }
          /* Aux row drops when stacked — its like button lives on the meta row
             now, and lyrics/volume are the least essential controls here. */
          .andro-mp-aux { display: none !important; }
        }
      `}</style>
    </div>
  );
});

MusicPlayer.displayName = 'MusicPlayer';
