'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { tokens } from '../tokens';
import { useReducedMotion } from './lib/motion';
import { andromedaVars, cn } from './lib/utils';
import { subscribeToTheme } from './lib/theme';
import { mq } from './lib/responsive';

// Hex only: rgb() or hsl() colours read as bright and get the additive glow.
function luma(css: string) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(css.trim());
  if (!m) return 1;
  const h = m[1].length === 3 ? m[1].replace(/./g, (d) => d + d) : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

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
  particleCount = 6000,
  particleSize = 0.028,
  rotationSpeed = 0.0035,
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
  const rotationSpeedRef = useRef(rotationSpeed);
  const pausedRef = useRef(paused);
  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => {
    rotationSpeedRef.current = rotationSpeed;
    pausedRef.current = paused;
    reducedMotionRef.current = reducedMotion;
  }, [rotationSpeed, paused, reducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let W = container.clientWidth  || 320;
    let H = container.clientHeight || 320;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);
    camera.position.z = 3;

    // No WebGL: render nothing instead of crashing the page.
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Resolved off the container: WebGL cannot read var(), and themes change the values.
    const accent = (stop: Extract<keyof typeof tokens.color.accent, number>) =>
      getComputedStyle(container).getPropertyValue(`--andromeda-accent-${stop}`).trim() ||
      tokens.color.accent[stop];

    const lightDir = new THREE.Vector3(0.55, 0.30, 0.78).normalize();

    const positions = new Float32Array(particleCount * 3);
    const colors    = new Float32Array(particleCount * 3);
    const litness  = new Float32Array(particleCount);
    const equators = new Float32Array(particleCount);
    const specks   = new Uint8Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi   = 2 * Math.PI * Math.random();
      const r = 1.0 + (Math.random() - 0.5) * 0.06;

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.cos(theta);
      const z = r * Math.sin(theta) * Math.sin(phi);

      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const dot = (x * lightDir.x + y * lightDir.y + z * lightDir.z) / r;
      litness[i] = (dot + 1) * 0.5;

      equators[i] = 1 - Math.abs(y / r) * 0.18;

      specks[i] = Math.random() < 0.012 && litness[i] > 0.62 ? 1 : 0;
    }

    const ramp = new THREE.Color();
    function paint() {
      const hi  = accent(100);
      const lit = accent(200);
      const cHi  = new THREE.Color(hi);
      const cLit = new THREE.Color(lit);
      const cMid = new THREE.Color(accent(400));
      const cShd = new THREE.Color(accent(500));

      for (let i = 0; i < particleCount; i++) {
        const l = litness[i];
        if (l < 0.5) ramp.lerpColors(cShd, cMid, l * 2);
        else         ramp.lerpColors(cMid, cLit, (l - 0.5) * 2);

        const e = equators[i];
        const speck = specks[i] === 1;
        colors[i * 3]     = speck ? cHi.r : ramp.r * e;
        colors[i * 3 + 1] = speck ? cHi.g : ramp.g * e;
        colors[i * 3 + 2] = speck ? cHi.b : ramp.b * e;
      }

      // Read from the palette, not the page: additive blending bleaches on a light ground.
      return luma(lit) < 0.5 ? THREE.NormalBlending : THREE.AdditiveBlending;
    }

    const geo = new THREE.BufferGeometry();
    const colorAttr = new THREE.BufferAttribute(colors, 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    colorAttr);

    const sprite = makeSprite() as THREE.CanvasTexture;
    const mat = new THREE.PointsMaterial({
      size:         particleSize,
      map:          sprite,
      vertexColors: true,
      transparent:  true,
      depthWrite:   false,
      blending:     paint(),
    });

    const unsubscribeTheme = subscribeToTheme(() => {
      mat.blending = paint();
      mat.needsUpdate = true;
      colorAttr.needsUpdate = true;
    });

    const mesh = new THREE.Points(geo, mat);
    mesh.rotation.x = 0.22;
    mesh.rotation.z = 0.06;
    scene.add(mesh);

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

    let raf = 0;
    let t = 0;
    let alive = true;
    function tick() {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      if (!pausedRef.current && !reducedMotionRef.current) {
        t += rotationSpeedRef.current;
        mesh.rotation.y = t;
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
      // dispose() keeps the WebGL context; release it or remounts hit the browser limit.
      try {
        renderer.forceContextLoss();
      } catch {}
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [particleCount, particleSize]);

  return (
    <>
      <div
        ref={containerRef}
        className={cn('andromeda-planet', className)}
        style={{
          ...andromedaVars(),
          width: '100%',
          height: '100%',
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
