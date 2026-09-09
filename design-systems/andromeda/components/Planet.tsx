// ============================================================
// COMPONENT: Planet
// Particle-sphere rendered with Three.js — a slowly-rotating
// 3D sphere lit from one side. All particle colors are sourced
// from the Andromeda accent ramp (100 lit → 500 shadow), so the
// component automatically follows the system palette.
//
// Designed for "next destination" / "active body" widgets in the
// mission-control dashboard. The canvas is transparent — drop it
// inside a Card and the void shows through. Resize-observed.
// ============================================================

'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { tokens } from '../tokens';
import { useReducedMotion } from './lib/motion';
import { andromedaVars, cn } from './lib/utils';
import { subscribeToTheme } from './lib/theme';
import { mq } from './lib/responsive';

/**
 * Perceived brightness, 0 to 1, of a `#rgb` or `#rrggbb` color string.
 * Anything it cannot parse reads as bright, which keeps the dark theme's
 * additive glow as the default answer.
 */
function luma(css: string) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(css.trim());
  if (!m) return 1;
  const h = m[1].length === 3 ? m[1].replace(/./g, (d) => d + d) : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Soft radial sprite. Multiplied by vertex color, and blended additively on a
 *  dark ground so each particle reads as a tiny glow on the void. */
function makeSprite(): THREE.CanvasTexture | undefined {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  // andromeda-allow: an interpolated alpha ramp for the canvas particle sprite.
  // A gradient stop is texture math, not palette — no token can express one.
  grad.addColorStop(0.00, 'rgba(255,255,255,1.00)');
  // andromeda-allow: same ramp.
  grad.addColorStop(0.20, 'rgba(255,255,255,0.78)');
  // andromeda-allow: same ramp.
  grad.addColorStop(0.55, 'rgba(255,255,255,0.22)');
  // andromeda-allow: same ramp.
  grad.addColorStop(1.00, 'rgba(255,255,255,0.00)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * @typedef {object} PlanetProps
 * @property {number} [particleCount=6000] Number of surface particles; 6000 reads dense at 320 to 480px.
 * @property {number} [particleSize=0.028] Per-particle point size in world units.
 * @property {number} [rotationSpeed=0.0035] Auto-rotation speed in radians per frame (assumes about 60fps).
 * @property {boolean} [paused=false] When true, the planet does not auto-rotate.
 * @property {string} [className] Additional CSS classes applied to the root element.
 * @property {React.CSSProperties} [style] Inline styles applied to the root element.
 */
export function Planet({
  /** Number of surface particles. 6000 reads dense at 320 to 480px. */
  particleCount = 6000,
  /** Per-particle point size in world units. */
  particleSize = 0.028,
  /** Rotation speed (radians per frame, ~60fps assumed). */
  rotationSpeed = 0.0035,
  /** When true, the planet doesn't auto-rotate. */
  paused = false,
  className,
  style,
}: {
  particleCount?: number;
  particleSize?: number;
  rotationSpeed?: number;
  paused?: boolean;
  className?: string;
  style?: React.CSSProperties;
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let W = container.clientWidth  || 320;
    let H = container.clientHeight || 320;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);
    camera.position.z = 3;

    // Three dropped its WebGL1 fallback, so this throws outright on a browser
    // that cannot hand back a webgl2 context: hardware acceleration switched
    // off, an older or virtualised machine, a hardened browser, or simply too
    // many live contexts on one page (browsers cap it around sixteen). The throw
    // happens synchronously inside an effect with no error boundary above it,
    // which takes down the entire page rather than this one canvas. A planet
    // nobody can render is worth an empty box, never a dead page.
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Transparent canvas — let the parent (Card / void) show through.
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Andromeda palette → THREE.Color ─────────────────────────────────────
    // WebGL needs raw hex (var() cannot resolve on the GPU), so read the
    // RESOLVED CSS vars off the container, so a themed page renders a themed
    // planet. Read again whenever the theme moves (see paint() below), so a
    // flip retints the surface without restarting the rotation.
    const accent = (stop: Extract<keyof typeof tokens.color.accent, number>) =>
      getComputedStyle(container).getPropertyValue(`--andromeda-accent-${stop}`).trim() ||
      tokens.color.accent[stop];

    // Light comes from the front-right, slightly above. Choose a direction
    // that's NOT axis-aligned so the rotating planet shows a moving terminator.
    const lightDir = new THREE.Vector3(0.55, 0.30, 0.78).normalize();

    // ── Buffer geometry: positions + per-vertex colors ──────────────────────
    const positions = new Float32Array(particleCount * 3);
    const colors    = new Float32Array(particleCount * 3);
    // The three per-particle shading inputs, kept so a repaint can reuse them.
    // Resampling instead would re-roll every random draw, and the surface and
    // its highlight specks would visibly jump on a theme change.
    const litness  = new Float32Array(particleCount);
    const equators = new Float32Array(particleCount);
    const specks   = new Uint8Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Uniform-on-sphere sampling
      const theta = Math.acos(2 * Math.random() - 1);
      const phi   = 2 * Math.PI * Math.random();
      // Tiny radius jitter so the surface reads as "atmosphere" not a hard shell.
      const r = 1.0 + (Math.random() - 0.5) * 0.06;

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.cos(theta);
      const z = r * Math.sin(theta) * Math.sin(phi);

      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Lambert-style: dot(normal, lightDir) ∈ [-1, 1] → [0, 1]
      const dot = (x * lightDir.x + y * lightDir.y + z * lightDir.z) / r;
      litness[i] = (dot + 1) * 0.5;

      // Equator emphasis — particles near the equator ride a tiny bit brighter,
      // suggesting cloud bands without a literal texture.
      equators[i] = 1 - Math.abs(y / r) * 0.18;

      // 1% of well-lit particles become highlight specks — adds tiny "city
      // light" / atmospheric sparkle on the lit hemisphere.
      specks[i] = Math.random() < 0.012 && litness[i] > 0.62 ? 1 : 0;
    }

    // Fill the color attribute from the palette as it resolves right now, and
    // answer with the blend mode that palette calls for.
    const ramp = new THREE.Color();
    function paint() {
      const hi  = accent(100); // lit highlight
      const lit = accent(200); // lit body
      const cHi  = new THREE.Color(hi);
      const cLit = new THREE.Color(lit);
      const cMid = new THREE.Color(accent(400)); // terminator
      const cShd = new THREE.Color(accent(500)); // shadow side

      for (let i = 0; i < particleCount; i++) {
        const l = litness[i];
        // Two-stop ramp: shadow → mid (l ∈ [0, 0.5]), then mid → lit (l ∈ [0.5, 1]).
        if (l < 0.5) ramp.lerpColors(cShd, cMid, l * 2);
        else         ramp.lerpColors(cMid, cLit, (l - 0.5) * 2);

        const e = equators[i];
        const speck = specks[i] === 1;
        colors[i * 3]     = speck ? cHi.r : ramp.r * e;
        colors[i * 3 + 1] = speck ? cHi.g : ramp.g * e;
        colors[i * 3 + 2] = speck ? cHi.b : ramp.b * e;
      }

      // Additive blending is what makes the particles read as a glowing body on
      // a dark void: each one ADDS light to what is behind it. Over a light
      // ground that only bleaches them, because adding to near-white cannot
      // darken anything. Decide from the palette itself rather than from any
      // theme flag, so a custom palette gets the right answer too: a dark lit
      // color means the planet is meant to be drawn ON light, not made of it.
      return luma(lit) < 0.5 ? THREE.NormalBlending : THREE.AdditiveBlending;
    }

    const geo = new THREE.BufferGeometry();
    const colorAttr = new THREE.BufferAttribute(colors, 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    colorAttr);

    // A browser canvas always yields a 2d context, so the sprite is always built.
    const sprite = makeSprite() as THREE.CanvasTexture;
    const mat = new THREE.PointsMaterial({
      size:         particleSize,
      map:          sprite,
      vertexColors: true,
      transparent:  true,
      depthWrite:   false,
      blending:     paint(),
    });

    // Repaint in place on a theme change: same sphere, same specks, new palette.
    const unsubscribeTheme = subscribeToTheme(() => {
      mat.blending = paint();
      mat.needsUpdate = true;
      colorAttr.needsUpdate = true;
    });

    const mesh = new THREE.Points(geo, mat);
    mesh.rotation.x = 0.22;
    mesh.rotation.z = 0.06;
    scene.add(mesh);

    // ── Resize handling ─────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth  || W;
      const nh = container.clientHeight || H;
      if (nw === W && nh === H) return;
      W = nw; H = nh;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    // ── Animation loop ──────────────────────────────────────────────────────
    let raf = 0;
    let t = 0;
    let alive = true;
    function tick() {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      // Reduced motion: render the scene once with no rotation/wobble.
      if (!paused && !reducedMotion) {
        t += rotationSpeed;
        mesh.rotation.y = t;
        // Gentle Z wobble — keeps the rotation from feeling mechanical.
        mesh.rotation.z = 0.06 + Math.sin(t * 0.4) * 0.035;
      }
      renderer.render(scene, camera);
    }
    tick();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      unsubscribeTheme();
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      sprite.dispose();
      // Hand the GPU context back explicitly. dispose() alone frees the scene
      // but leaves the context alive, and a browser only grants about sixteen
      // per page, so a component that mounts and unmounts a few times exhausts
      // them and the next mount is the one that fails to get a context at all.
      try {
        renderer.forceContextLoss();
      } catch {}
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [particleCount, particleSize, rotationSpeed, paused, reducedMotion]);

  return (
    <>
      <div
        ref={containerRef}
        className={cn('andromeda-planet', className)}
        style={{
          ...andromedaVars(),
          width: '100%',
          height: '100%',
          // Hero set-piece: never let the WebGL canvas push past the viewport.
          // The canvas sizes to clientWidth/clientHeight (ResizeObserver), so
          // capping the container here caps the render too. boxSizing keeps any
          // template padding inside the cap. 100% (not 100vw) avoids the
          // scrollbar-width page-scroll trap.
          maxWidth: '100%',
          boxSizing: 'border-box',
          ...style,
        }}
      />
      <style>{`
        /* On phones a hero Planet sized by a min-height parent can render a
           canvas taller than the viewport. Cap its height to the viewport's
           shorter side so a stacked hero panel never forces page scroll. The
           canvas stays square via its own aspect; this only sets the ceiling. */
        ${mq.md} {
          .andromeda-planet { max-height: 60vh !important; }
        }
      `}</style>
    </>
  );
}
