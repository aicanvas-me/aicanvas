'use client'

// A slow-spinning wireframe of the Brain model for the Built for AI card. The
// same brain.glb as the Brain page, reduced to a spin: no drag, no labels.
// Painted in Andromeda Pro's brand ramp: brand-500 carries the mass and the
// lines lift through 400 and 300 to 200 toward the crown. Lines add where they
// cross, so the dense core glows brighter on its own. Fails silent (the ground
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

// The brand ramp is a primitive, the same value in both themes, so reading it
// once from tokens.ts is safe here: the card is always drawn on the dark void.
const BRAND = tokens.color.brand
// Base to crown. Most of the model sits low in the ramp.
const LINE_STOPS = [BRAND[500], BRAND[500], BRAND[400], BRAND[300], BRAND[200]]

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

        const camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 100)
        camera.position.set(0, 0.2, 2.6)
        camera.lookAt(0, 0, 0)

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
          camera.updateProjectionMatrix()
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
            // One material for every mesh: unlit, so the ramp reads exactly,
            // and additive, so crossings brighten.
            const material = new THREE.MeshBasicMaterial({
              vertexColors: true,
              wireframe: true,
              transparent: true,
              opacity: 0.75,
              blending: THREE.AdditiveBlending,
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
                // Height carries most of the ramp; a little front-to-back
                // depth makes the shades drift as the model turns.
                const ny = (v.y - box.min.y) / (size.y || 1)
                const nx = (v.x - box.min.x) / (size.x || 1)
                colorAt(ny * 0.75 + nx * 0.25, c).toArray(colors, i * 3)
              }
              geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
              mesh.geometry = geometry
              mesh.material = material
            })
            scene.add(model)
            brainRoot = model
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
