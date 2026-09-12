'use client'

// A slow-spinning wireframe of the Brain model for the Built for AI card. The
// same brain.glb as the Brain page, reduced to a spin: no drag, no labels.
// The crown is a light neutral and the lines fade down through brand 300 and
// 400 to brand-500 at the stem. Lines blend normally rather than adding, so
// dense areas settle on the ramp colour instead of burning to white or flat
// cyan and the fade stays soft. Fails silent (the ground
// only) when WebGL or the model cannot load.
//
// The loop only runs while the card is on screen, and under reduced motion it
// draws a single still frame instead. The reduced-motion setting is read
// through a ref, so toggling it never rebuilds the WebGL context.

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { Mesh, Object3D, WebGLRenderer } from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { tokens } from '../../../lib/andromeda-pro.generated'

const BRAIN_MODEL_URL = '/models/brain.glb'
const BRAIN_VOID = '#0E0E0F'

// Primitives read once from tokens.ts. Safe here because the card is always
// drawn on the dark void, so the dark-authored neutral stops are the right ink.
const BRAND = tokens.color.brand
const NEUTRAL = tokens.color.neutral
// Stem to crown: blue at the base, a light neutral over the top.
const LINE_STOPS = [BRAND[500], BRAND[400], BRAND[300], NEUTRAL[1000], NEUTRAL[1100]]

const withAlpha = (oklch: string, alpha: number) => oklch.replace(')', ` / ${alpha})`)

// Barely-there brand light behind the model: a glow where the brain sits and
// two faint sweeps from opposite corners, over the void.
const GROUND = [
  `radial-gradient(ellipse 60% 55% at 50% 48%, ${withAlpha(BRAND[500], 0.2)} 0%, transparent 70%)`,
  `radial-gradient(ellipse 80% 70% at 0% 0%, ${withAlpha(BRAND[400], 0.1)} 0%, transparent 60%)`,
  `radial-gradient(ellipse 70% 60% at 100% 100%, ${withAlpha(BRAND[500], 0.12)} 0%, transparent 60%)`,
  BRAIN_VOID,
].join(', ')

export function BrainWireframe() {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const reduceRef = useRef(reduce)
  // Starts one frame, and the loop if motion is allowed. Filled in once the
  // renderer exists.
  const kickRef = useRef<() => void>(() => {})

  useEffect(() => {
    reduceRef.current = reduce
    kickRef.current()
  }, [reduce])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let alive = true
    let raf = 0
    let visible = false
    let renderer: WebGLRenderer | undefined
    let resizeObserver: ResizeObserver | undefined
    let viewObserver: IntersectionObserver | undefined

    ;(async () => {
      try {
        const [THREE, { GLTFLoader }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
        ])
        if (!alive) return

        let W = host.clientWidth || 400
        let H = host.clientHeight || 180
        // Transparent canvas: the gradient ground is the host's CSS background.
        const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
        r.setClearColor(0x000000, 0)
        renderer = r
        r.setSize(W, H)
        r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
        host.appendChild(r.domElement)

        const scene = new THREE.Scene()

        // WebGL cannot read oklch, so the browser resolves each stop to sRGB
        // through a 1px canvas.
        const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
        const toColor = (css: string) => {
          if (!probe) return new THREE.Color(0x888888)
          probe.clearRect(0, 0, 1, 1)
          probe.fillStyle = css
          probe.fillRect(0, 0, 1, 1)
          const [red, green, blue] = probe.getImageData(0, 0, 1, 1).data
          return new THREE.Color().setStyle(`rgb(${red}, ${green}, ${blue})`)
        }
        const stops = LINE_STOPS.map(toColor)
        const colorAt = (t: number, out: InstanceType<typeof THREE.Color>) => {
          const x = Math.min(Math.max(t, 0), 1) * (stops.length - 1)
          const i = Math.min(Math.floor(x), stops.length - 2)
          return out.copy(stops[i]).lerp(stops[i + 1], x - i)
        }

        // The camera backs off until the model's unit sphere, times FIT, fits
        // the narrower side of the box, so the brain keeps the same share of
        // the card whether the card is wide (phones) or tall (two columns).
        const FOV = 38
        const FIT = 1.1
        const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.01, 100)
        const frame = () => {
          const halfV = THREE.MathUtils.degToRad(FOV / 2)
          const halfH = Math.atan(Math.tan(halfV) * camera.aspect)
          const d = FIT / Math.tan(Math.min(halfV, halfH))
          camera.position.set(0, d * 0.08, d)
          camera.lookAt(0, 0, 0)
          camera.updateProjectionMatrix()
        }
        frame()

        let brainRoot: Object3D | null = null
        const clock = new THREE.Clock()

        const tick = () => {
          raf = 0
          const dt = Math.min(clock.getDelta(), 1 / 30)
          if (brainRoot && !reduceRef.current) brainRoot.rotation.y += dt * 0.25
          r.render(scene, camera)
          if (alive && visible && !reduceRef.current) raf = requestAnimationFrame(tick)
        }
        const kick = () => {
          if (!alive || raf) return
          clock.getDelta() // drop the time spent paused, so the spin never jumps
          raf = requestAnimationFrame(tick)
        }
        kickRef.current = kick

        // The box changes height between the stacked and two-column layouts,
        // so follow the box itself rather than the window.
        resizeObserver = new ResizeObserver(() => {
          W = host.clientWidth || W
          H = host.clientHeight || H
          r.setSize(W, H)
          camera.aspect = W / H
          frame()
          kick()
        })
        resizeObserver.observe(host)

        viewObserver = new IntersectionObserver(([entry]) => {
          visible = entry?.isIntersecting ?? false
          if (visible) kick()
        })
        viewObserver.observe(host)

        new GLTFLoader().load(
          BRAIN_MODEL_URL,
          (gltf: GLTF) => {
            if (!alive) return
            const model = gltf.scene
            // Normalize scale, then recenter on the bounding sphere.
            model.updateWorldMatrix(true, true)
            let box = new THREE.Box3().setFromObject(model)
            let sphere = box.getBoundingSphere(new THREE.Sphere())
            model.scale.setScalar(1 / (sphere.radius || 1))
            model.updateWorldMatrix(true, true)
            box = new THREE.Box3().setFromObject(model)
            sphere = box.getBoundingSphere(new THREE.Sphere())
            model.position.sub(sphere.center)
            model.updateWorldMatrix(true, true)
            box = new THREE.Box3().setFromObject(model)
            const size = box.getSize(new THREE.Vector3())
            const v = new THREE.Vector3()
            const c = new THREE.Color()
            // One material for every mesh: unlit, so the ramp reads exactly.
            const material = new THREE.MeshBasicMaterial({
              vertexColors: true,
              wireframe: true,
              transparent: true,
              opacity: 0.7,
              depthWrite: false,
            })
            model.traverse((o) => {
              const mesh = o as Mesh
              if (!mesh.isMesh) return
              // A copy per mesh, so writing its colours never touches a shared
              // geometry the model reuses elsewhere.
              const geometry = mesh.geometry.clone()
              const pos = geometry.getAttribute('position')
              const colors = new Float32Array(pos.count * 3)
              for (let i = 0; i < pos.count; i++) {
                v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld)
                // Height alone: the spin turns around the vertical axis, so a
                // top-to-bottom fade holds still while the model turns.
                const ny = (v.y - box.min.y) / (size.y || 1)
                colorAt(ny, c).toArray(colors, i * 3)
              }
              geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
              mesh.geometry = geometry
              mesh.material = material
            })
            // The recentring moved the model, not its pivot, so spinning the
            // model itself would swing it around its old origin and drift it
            // sideways. A pivot at the origin spins it in place.
            const pivot = new THREE.Group()
            pivot.add(model)
            scene.add(pivot)
            brainRoot = pivot
            kick()
          },
          undefined,
          () => {},
        )

        kick()
      } catch {
        // No WebGL or no model: the dark ground stays, nothing else.
      }
    })()

    return () => {
      alive = false
      kickRef.current = () => {}
      cancelAnimationFrame(raf)
      resizeObserver?.disconnect()
      viewObserver?.disconnect()
      try {
        if (renderer) {
          renderer.forceContextLoss()
          renderer.dispose()
          if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement)
        }
      } catch {}
    }
  }, [])

  return <div ref={hostRef} aria-hidden className="absolute inset-0" style={{ background: GROUND }} />
}
