'use client'

// npm install framer-motion three

/**
 * Renders a shader-driven orb that tracks pointer movement with animated eyes.
 * Idle gaze and blink cycles continue when the pointer leaves the component.
 */

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import * as THREE from 'three'

function useScopedTheme(ref: React.RefObject<HTMLElement | null>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const readTheme = () => {
      const scope = element.closest('[data-card-theme]') as HTMLElement | null
      if (scope) {
        setTheme(scope.dataset.cardTheme === 'dark' ? 'dark' : 'light')
        return
      }
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    }
    readTheme()
    const observers: MutationObserver[] = []
    let current: HTMLElement | null = element
    while (current) {
      const obs = new MutationObserver(readTheme)
      obs.observe(current, { attributes: true, attributeFilter: ['class', 'data-card-theme'] })
      observers.push(obs)
      current = current.parentElement
    }
    const htmlObs = new MutationObserver(readTheme)
    htmlObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    observers.push(htmlObs)
    return () => observers.forEach((o) => o.disconnect())
  }, [ref])
  return theme
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uActive;        // 0..1 lerp toward "alert"
  uniform vec2  uLook;          // -1..1, current look direction (cursor or idle script)
  uniform float uReduce;        // 1 = motion allowed, 0 = motion frozen

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;       // original mesh position — for stable surface speckles
  varying vec3 vViewPos;        // view-space position — fragment derives the displaced normal from this

  // Classic 3D simplex noise — Ashima Arts / Stefan Gustavson, MIT.
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(
              i.z+vec4(0.,i1.z,i2.z,1.))
            + i.y+vec4(0.,i1.y,i2.y,1.))
            + i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=1./7.;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;
    vec4 s1=floor(b1)*2.+1.;
    vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main(){
    vLocalPos = position;            // stable surface coord — speckles stick here
    vec3 pos  = position;
    float t   = uTime * uReduce;

    // Slow anisotropic stretch — orb morphs through ovoid orientations over time.
    float ax = sin(t * 0.27 + 0.0) * 0.16;
    float ay = sin(t * 0.19 + 1.7) * 0.20;
    float az = sin(t * 0.23 + 3.1) * 0.12;
    pos *= vec3(1.0 + ax, 1.0 + ay, 1.0 + az);

    // Two octaves — keep the surface glossier/smoother for the new aesthetic.
    float nLow = snoise(pos * 0.55 + vec3( t * 0.18,  t * 0.13, -t * 0.15));
    float nMid = snoise(pos * 1.45 + vec3(-t * 0.22,  t * 0.20,  t * 0.18));

    // Look direction biases the noise sample — the "face" bulges where it looks.
    vec3 lookDir = vec3(uLook, 0.55);
    float facing = clamp(dot(normalize(pos), normalize(lookDir)), 0.0, 1.0);
    float bulge  = pow(facing, 2.5) * (0.08 + uActive * 0.10);

    // Gentle breath — overall radial pulse, very slow.
    float breath = sin(t * 0.55) * 0.022;

    float amp = mix(0.20, 0.34, uActive);
    float displacement = (nLow * 0.66 + nMid * 0.34) * amp + bulge + breath;

    pos += normal * displacement;

    vec4 mv  = modelViewMatrix * vec4(pos, 1.0);
    vNormal  = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */ `
  precision highp float;

  uniform vec3  uBase;
  uniform vec3  uRimA;     // cyan rim (upper-left light)
  uniform vec3  uRimB;     // magenta rim (lower-right light)
  uniform vec3  uSpeckA;   // electric pink speckle
  uniform vec3  uSpeckB;   // electric cyan speckle
  uniform float uActive;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  varying vec3 vViewPos;

  // Simplex 3D noise — same as vertex, needed for speckle sampling.
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(
              i.z+vec4(0.,i1.z,i2.z,1.))
            + i.y+vec4(0.,i1.y,i2.y,1.))
            + i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=1./7.;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;
    vec4 s1=floor(b1)*2.+1.;
    vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main(){
    // True surface normal derived from view-space position derivatives — picks
    // up the actual wrinkles/ridges from the displaced geometry instead of the
    // smooth icosahedron normal. Gives proper shadow-in-valley, highlight-on-
    // ridge shading.
    vec3 dx = dFdx(vViewPos);
    vec3 dy = dFdy(vViewPos);
    vec3 n  = normalize(cross(dx, dy));
    vec3 v  = normalize(-vViewPos);

    // Fresnel — bright at glancing angles, dark where the surface faces us.
    float fres = 1.0 - clamp(dot(n, v), 0.0, 1.0);

    // ── Diffuse 3D lighting on the body ───────────────────────────────────────
    // Two soft lights: warm-cyan key from upper-left-front, cool-magenta fill
    // from lower-right. Combined with derivative normal, this makes wrinkle
    // ridges catch light and valleys fall into shadow.
    vec3 keyDir  = normalize(vec3(-0.45,  0.70,  0.85));
    vec3 fillDir = normalize(vec3( 0.65, -0.35,  0.55));

    float diffKey  = max(0.0, dot(n, keyDir));
    float diffFill = max(0.0, dot(n, fillDir));

    // Ambient + key + fill — wrap the body in directional light so ridges and
    // valleys actually read as 3D.
    vec3 lit = uBase * (0.30 + diffKey * 0.95 + diffFill * 0.45);

    // ── Two-tone rim lights ──────────────────────────────────────────────────
    vec3 dirCyan    = normalize(vec3(-0.70,  0.55,  0.50));
    vec3 dirMagenta = normalize(vec3( 0.75, -0.30,  0.50));

    float cyanWrap    = max(0.0, dot(n, dirCyan));
    float magentaWrap = max(0.0, dot(n, dirMagenta));

    float rimCoreP = mix(2.2, 1.7, uActive);
    float rimCyan    = pow(cyanWrap,    1.3) * pow(fres, rimCoreP);
    float rimMagenta = pow(magentaWrap, 1.3) * pow(fres, rimCoreP);

    // ── Specular highlight on ridges ─────────────────────────────────────────
    // Blinn-half-vector style spec from the key light — puts a moving glint on
    // ridges that face the light, sells the glossy / wet quality.
    vec3 halfKey = normalize(keyDir + v);
    float specKey = pow(max(0.0, dot(n, halfKey)), 32.0) * 0.55;

    vec3 col = lit
             + uRimA * rimCyan    * mix(1.10, 1.55, uActive)
             + uRimB * rimMagenta * mix(1.00, 1.45, uActive)
             + specKey * vec3(0.80, 0.95, 1.00);

    // ── Iridescent speckles (sparser than before) ────────────────────────────
    // Higher thresholds → ~half the previous density. Single big-scale layer
    // with a small-scale accent.
    float speckBig   = snoise(vLocalPos * 10.0);
    float speckSmall = snoise(vLocalPos * 24.0 + 1.7);
    float maskBig    = smoothstep(0.66, 0.74, speckBig);
    float maskSmall  = smoothstep(0.72, 0.78, speckSmall) * 0.40;
    float speckMask  = max(maskBig, maskSmall);

    // Per-cluster colour pick — biased toward pink, with cyan accents.
    float colorPick  = snoise(vLocalPos * 4.0 + 5.3);
    vec3  speckColor = mix(uSpeckA, uSpeckB, smoothstep(0.55, 0.75, colorPick));

    // Fade speckles in valley shadows so they read as surface, not stickers.
    float speckBody  = 1.0 - smoothstep(0.55, 0.95, fres);
    col += speckColor * speckMask * speckBody * 0.85;

    gl_FragColor = vec4(col, 1.0);
  }
`

type Palette = {
  base:      [number, number, number]
  rimA:      [number, number, number]
  rimB:      [number, number, number]
  speckA:    [number, number, number]
  speckB:    [number, number, number]
  eye:       string
  eyeGlow:   string
}

const PALETTE: Record<'dark' | 'light', Palette> = {
  dark: {
    base:    [0.050, 0.075, 0.085],
    rimA:    [0.380, 0.860, 0.940],
    rimB:    [0.730, 0.330, 0.940],
    speckA:  [0.880, 0.275, 0.985],
    speckB:  [0.400, 0.910, 1.000],
    eye:     'rgba(255, 140, 245, 0.85)',
    eyeGlow: 'rgba(225, 90, 230, 0.70)',
  },
  light: {
    base:    [0.075, 0.105, 0.120],
    rimA:    [0.400, 0.870, 0.940],
    rimB:    [0.745, 0.355, 0.940],
    speckA:  [0.895, 0.290, 0.985],
    speckB:  [0.420, 0.915, 1.000],
    eye:     'rgba(255, 150, 248, 0.88)',
    eyeGlow: 'rgba(225, 100, 230, 0.75)',
  },
}

// tune: adjust coordinates and durations to change the idle gaze pattern
const LOOK_SEQUENCE: { x: number; y: number; dur: number }[] = [
  { x: -0.65, y:  0.00, dur: 2400 },
  { x:  0.32, y:  0.00, dur: 2800 },
  { x: -0.24, y:  0.00, dur: 2200 },
  { x:  0.00, y: -0.55, dur: 2800 },
  { x:  0.00, y:  0.00, dur: 2600 },
]

export default function CuriousAi() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef     = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLDivElement>(null)
  const sizeRef      = useRef({ w: 320, h: 320 })

  const lookTargetRef  = useRef({ x: 0, y: 0 })
  const lookCurrentRef = useRef({ x: 0, y: 0 })
  const hoverActiveRef = useRef(false)

  const activeRef = useRef(0)
  const targetRef = useRef(0)

  const eyeX = useMotionValue(0)
  const eyeY = useMotionValue(0)
  const sx   = useSpring(eyeX, { stiffness: 200, damping: 22, mass: 0.4 })
  const sy   = useSpring(eyeY, { stiffness: 200, damping: 22, mass: 0.4 })

  const [blinkAt, setBlinkAt] = useState(0)
  const [open,    setOpen]    = useState(0.85)

  const theme = useScopedTheme(containerRef)

  useEffect(() => {
    const host = canvasRef.current
    if (!host) return

    const W = host.clientWidth  || 320
    const H = host.clientHeight || 320
    sizeRef.current = { w: W, h: H }

    const palette = PALETTE[theme]

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100)
    camera.position.z = 4.4

    // Throws outright when the browser cannot hand back a WebGL context:
    // hardware acceleration switched off, an older or virtualised machine, or
    // too many live contexts on one page. Thrown from inside an effect it takes
    // the surrounding page down with it, so an empty frame is the better
    // failure.
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    host.appendChild(renderer.domElement)

    const detail = W < 400 ? 32 : 64
    const geo    = new THREE.IcosahedronGeometry(1, detail)

    const uniforms: Record<string, THREE.IUniform> = {
      uTime:   { value: 0 },
      uActive: { value: 0 },
      uLook:   { value: new THREE.Vector2(0, 0) },
      uReduce: { value: 1 },
      uBase:   { value: new THREE.Color(...palette.base) },
      uRimA:   { value: new THREE.Color(...palette.rimA) },
      uRimB:   { value: new THREE.Color(...palette.rimB) },
      uSpeckA: { value: new THREE.Color(...palette.speckA) },
      uSpeckB: { value: new THREE.Color(...palette.speckB) },
    }

    const mat = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent:    true,
    })

    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyMotion = () => { uniforms.uReduce.value = mql.matches ? 0 : 1 }
    applyMotion()
    mql.addEventListener('change', applyMotion)

    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect
      if (!r) return
      const nw = Math.max(1, Math.floor(r.width))
      const nh = Math.max(1, Math.floor(r.height))
      sizeRef.current = { w: nw, h: nh }
      renderer.setSize(nw, nh)
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
    })
    ro.observe(host)

    let raf = 0
    const clock = new THREE.Clock()

    function tick() {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(clock.getDelta(), 0.05)
      uniforms.uTime.value += dt

      // tune: raise the response rate to sharpen alert transitions
      const ka = 1 - Math.exp(-dt * 6)
      activeRef.current += (targetRef.current - activeRef.current) * ka
      uniforms.uActive.value = activeRef.current

      // tune: raise either rate to make gaze tracking more responsive
      const speed = hoverActiveRef.current ? 7 : 2.2
      const kl    = 1 - Math.exp(-dt * speed)
      const lc    = lookCurrentRef.current
      const lt    = lookTargetRef.current
      lc.x += (lt.x - lc.x) * kl
      lc.y += (lt.y - lc.y) * kl

      uniforms.uLook.value.set(lc.x, -lc.y)

      // tune: raise the lean range to increase orb travel
      const lean = 0.12 + activeRef.current * 0.06
      mesh.position.x += (lc.x * lean - mesh.position.x) * kl
      mesh.position.y += (-lc.y * lean - mesh.position.y) * kl

      // tune: raise the range factor to increase eye travel
      const range = sizeRef.current.w * 0.18
      eyeX.set(lc.x * range)
      eyeY.set(lc.y * range)

      mesh.rotation.y += dt * 0.04
      mesh.rotation.x += dt * 0.015

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      mql.removeEventListener('change', applyMotion)
      ro.disconnect()
      geo.dispose()
      mat.dispose()
      // Hand the GPU context back explicitly: dispose() frees the scene but
      // leaves the context alive, and a browser grants only about sixteen per
      // page, so remounting a few times exhausts them.
      try {
        renderer.forceContextLoss()
      } catch {}
      renderer.dispose()
      if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement)
    }
  }, [theme, eyeX, eyeY])

  useEffect(() => {
    const container = containerRef.current
    const stage     = stageRef.current
    if (!container || !stage) return

    function update(clientX: number, clientY: number) {
      const rect    = stage!.getBoundingClientRect()
      const centerX = rect.left + rect.width  / 2
      const centerY = rect.top  + rect.height / 2
      const radius  = rect.width / 2
      const dx      = clientX - centerX
      const dy      = clientY - centerY
      const nx      = Math.max(-1, Math.min(1, dx / radius))
      const ny      = Math.max(-1, Math.min(1, dy / radius))
      const dist    = Math.sqrt(nx * nx + ny * ny)

      // tune: raise the threshold to enlarge the focused pointer region
      const onOrb = dist < 0.62

      hoverActiveRef.current = true
      if (onOrb) {
        targetRef.current = 1
        lookTargetRef.current = { x: nx, y: ny }
        setOpen(0.32)
      } else {
        targetRef.current = 0.35
        // tune: raise the multiplier to increase off-orb eye tracking
        lookTargetRef.current = { x: nx * 0.40, y: ny * 0.40 }
        setOpen(0.70)
      }
    }

    function onMove(e: PointerEvent) {
      update(e.clientX, e.clientY)
    }
    function onEnter(e: PointerEvent) {
      update(e.clientX, e.clientY)
      setBlinkAt((v) => v + 1)
    }
    function onLeave() {
      hoverActiveRef.current = false
      targetRef.current = 0
      setOpen(0.85)
      setBlinkAt((v) => v + 1)
    }
    function onDown(e: PointerEvent) {
      update(e.clientX, e.clientY)
    }
    function onUp() {
      // tune: raise the delay to extend the touch-release grace period
      window.setTimeout(() => {
        if (!container?.matches(':hover')) onLeave()
      }, 500)
    }

    container.addEventListener('pointermove',   onMove)
    container.addEventListener('pointerenter',  onEnter)
    container.addEventListener('pointerleave',  onLeave)
    container.addEventListener('pointerdown',   onDown)
    container.addEventListener('pointerup',     onUp)
    container.addEventListener('pointercancel', onLeave)

    return () => {
      container.removeEventListener('pointermove',   onMove)
      container.removeEventListener('pointerenter',  onEnter)
      container.removeEventListener('pointerleave',  onLeave)
      container.removeEventListener('pointerdown',   onDown)
      container.removeEventListener('pointerup',     onUp)
      container.removeEventListener('pointercancel', onLeave)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let idx = 0
    let timer: number
    function step() {
      const s = LOOK_SEQUENCE[idx]
      if (!hoverActiveRef.current) {
        lookTargetRef.current = { x: s.x, y: s.y }
      }
      idx = (idx + 1) % LOOK_SEQUENCE.length
      timer = window.setTimeout(step, s.dur)
    }
    step()
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let t: number
    function schedule() {
      // tune: raise either bound to reduce blink frequency
      const wait = 3800 + Math.random() * 3200
      t = window.setTimeout(() => {
        setBlinkAt((v) => v + 1)
        schedule()
      }, wait)
    }
    schedule()
    return () => window.clearTimeout(t)
  }, [])

  const palette = PALETTE[theme]
  const bgColor = theme === 'dark' ? '#0A0A09' : '#E8E8DF'

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full items-center justify-center"
      style={{ backgroundColor: bgColor }}
    >
      <div
        ref={stageRef}
        className="relative aspect-square h-full max-h-[min(42vh,42vw)] w-full max-w-[min(42vh,42vw)] cursor-pointer select-none touch-none"
      >
        <div ref={canvasRef} className="absolute inset-0" />

        {}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-between"
          style={{ x: sx, y: sy, width: '11%', height: '15%' }}
        >
          <Eye open={open} blinkKey={blinkAt} palette={palette} />
          <Eye open={open} blinkKey={blinkAt} palette={palette} />
        </motion.div>
      </div>
    </div>
  )
}

function Eye({
  open, blinkKey, palette,
}: {
  open: number
  blinkKey: number
  palette: Palette
}) {
  return (
    <motion.div
      style={{
        // tune: raise to widen the eyes
        width: '32%',
        // tune: raise to lengthen the eyes
        height: '100%',
        background: palette.eye,
        borderRadius: 9999,
        boxShadow: `0 0 4px 0 ${palette.eye}, 0 0 14px 1px ${palette.eyeGlow}, 0 0 28px 4px ${palette.eyeGlow}`,
        originY: 0.5,
      }}
      animate={{ scaleY: open }}
      transition={{ type: 'spring', stiffness: 240, damping: 22, mass: 0.4 }}
    >
      <motion.div
        key={blinkKey}
        className="h-full w-full"
        style={{ background: palette.eye, borderRadius: 9999 }}
        initial={{ scaleY: 1 }}
        animate={{ scaleY: [1, 0.05, 1] }}
        transition={{ duration: 0.18, times: [0, 0.45, 1], ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
