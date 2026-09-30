// ============================================================================
// WAVEFORM
// ============================================================================
// A fluid signal visualisation for live audio and telemetry. Use it when continuous
// movement communicates that a measured signal is active, with a static frame retained
// whenever motion is paused or reduced.
//
// Props: samples, speed, and amplitude shape the signal; height and color control its
// presentation; showBars and showCenterline toggle reference layers; paused freezes motion;
// className and style support root-level composition.

'use client';

import { forwardRef, useEffect, useMemo, useRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { tokens } from '../tokens';
import { cn, andromedaVars } from './lib/utils';
import { useReducedMotion } from './lib/motion';

const WAVE_W = 800;
const BAR_SCALE = 0.18;
const CENTER_GAP = 4;

const DEFAULT_WAVEFORM = Object.freeze({
  samples: 120,
  speed: 0.6,
  amplitude: 0.4,
  height: 120,
  color: `var(--andromeda-text-primary, ${tokens.color.text.primary})`,
  showBars: true,
  showCenterline: true,
  paused: false,
});

// Pure superposition of sines — fractional `t` keeps the morph smooth instead of snapping.
// Values are normalised so geometry can scale independently through the amplitude prop.
function computeValues(t: number, samples: number) {
  const out: number[] = new Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i / samples) * Math.PI * 6;
    const base = Math.sin(x + t * 0.7) * 0.5 + Math.sin(x * 2.3 + t) * 0.25;
    const wobble = (Math.sin(i * 0.13 + t * 1.4) + Math.cos(i * 0.07 + t)) * 0.12;
    out[i] = base + wobble;
  }
  return out;
}

function pointsFrom(values: number[], height: number, amplitude: number) {
  const stepX = WAVE_W / (values.length - 1);
  const midY = height / 2;
  const peak = height * amplitude;
  let out = '';

  for (let i = 0; i < values.length; i++) {
    out += `${(i * stepX).toFixed(2)},${(midY + values[i] * peak).toFixed(2)} `;
  }

  return out;
}

// All mirrored level bars share one path, keeping each animation frame to one `d` write.
function barsFrom(values: number[], height: number) {
  const stepX = WAVE_W / (values.length - 1);
  const midY = height / 2;
  let d = '';

  for (let i = 0; i < values.length; i++) {
    const x = i * stepX;
    const barHeight = Math.abs(values[i]) * (height * BAR_SCALE);
    d += `M${x.toFixed(2)},${(midY - barHeight - CENTER_GAP).toFixed(2)}L${x.toFixed(2)},${(midY - CENTER_GAP).toFixed(2)}`;
    d += `M${x.toFixed(2)},${(midY + CENTER_GAP).toFixed(2)}L${x.toFixed(2)},${(midY + barHeight + CENTER_GAP).toFixed(2)}`;
  }

  return d;
}

/**
 * @typedef {object} WaveformProps
 * @property {number} [samples=120] Number of points sampled across the waveform.
 * @property {number} [speed=0.6] Animation time-scale multiplier.
 * @property {number} [amplitude=0.4] Peak height as a fraction of the SVG height.
 * @property {number} [height=120] Fluid SVG height in pixels.
 * @property {string} [color=tokens.color.text.primary] Polyline stroke color only.
 * @property {boolean} [showBars=true] Whether to render mirrored level bars.
 * @property {boolean} [showCenterline=true] Whether to render the dashed centre reference.
 * @property {boolean} [paused=false] Whether to hold the current or initial static frame.
 * @property {string} [className=''] Root element class name.
 * @property {React.CSSProperties} [style={}] Root element inline styles.
 */
type WaveformOwnProps = {
  samples?: number;
  speed?: number;
  amplitude?: number;
  height?: number;
  color?: string;
  showBars?: boolean;
  showCenterline?: boolean;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
};

type WaveformProps = WaveformOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof WaveformOwnProps>;

/** @type {React.ForwardRefExoticComponent<WaveformProps & React.HTMLAttributes<HTMLDivElement>>} */
export const Waveform = forwardRef<HTMLDivElement, WaveformProps>(function Waveform(
  {
    samples = DEFAULT_WAVEFORM.samples,
    speed = DEFAULT_WAVEFORM.speed,
    amplitude = DEFAULT_WAVEFORM.amplitude,
    height = DEFAULT_WAVEFORM.height,
    color = DEFAULT_WAVEFORM.color,
    showBars = DEFAULT_WAVEFORM.showBars,
    showCenterline = DEFAULT_WAVEFORM.showCenterline,
    paused = DEFAULT_WAVEFORM.paused,
    className = '',
    style = {},
    ...props
  },
  ref,
) {
  const reduced = useReducedMotion();
  const lineRef = useRef<SVGPolylineElement | null>(null);
  const barsRef = useRef<SVGPathElement | null>(null);
  const sampleCount = Math.max(2, Math.floor(samples));

  // Build the first frame during render so SSR and motion-free modes never start empty.
  const initialFrame = useMemo(() => {
    const values = computeValues(0, sampleCount);
    return {
      points: pointsFrom(values, height, amplitude),
      bars: barsFrom(values, height),
    };
  }, [sampleCount, height, amplitude]);

  useEffect(() => {
    if (reduced || paused) return undefined;

    let raf = 0;
    let last = performance.now();
    let t = 0;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      t += dt * speed;

      const values = computeValues(t, sampleCount);
      if (lineRef.current) {
        lineRef.current.setAttribute('points', pointsFrom(values, height, amplitude));
      }
      if (barsRef.current) {
        barsRef.current.setAttribute('d', barsFrom(values, height));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, paused, sampleCount, speed, height, amplitude]);

  const midY = height / 2;

  return (
    <div
      ref={ref}
      className={cn('andromeda-waveform', className)}
      style={{
        ...andromedaVars(),
        position: 'relative',
        width: '100%',
        height,
        ...style,
      }}
      {...props}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${WAVE_W} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        style={{ display: 'block' }}
      >
        {showCenterline ? (
          <line
            x1={0}
            x2={WAVE_W}
            y1={midY}
            y2={midY}
            strokeDasharray="2 4"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            style={{ stroke: `var(--andromeda-border-subtle, ${tokens.color.border.subtle})` }}
          />
        ) : null}
        {showBars ? (
          <path
            ref={barsRef}
            d={initialFrame.bars}
            fill="none"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            style={{ stroke: `var(--andromeda-text-faint, ${tokens.color.text.faint})` }}
          />
        ) : null}
        <polyline
          ref={lineRef}
          fill="none"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={initialFrame.points}
          vectorEffect="non-scaling-stroke"
          style={{ stroke: color }}
        />
      </svg>
    </div>
  );
});

Waveform.displayName = 'Waveform';
