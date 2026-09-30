'use client'

// A slow-spinning wireframe of the Brain model for the Built for AI card. The
// same brain.glb as the Brain page, reduced to a spin: no drag, no labels.
// The wires carry the Andromeda Pro brain look: the four corpus sections in
// their own colours, blended by which way each vertex faces
// (app/_lib/brain-colors.ts). Lines blend normally rather than adding, so dense
// areas keep their colour instead of burning to white. Drawn on the dark void
// by default; `followSite` takes the site theme's inks instead, for a brain
// that sits straight on the page. Fails silent (the ground only) when WebGL or
// the model cannot load.
//
// The loop only runs while the card is on screen, and under reduced motion it
// draws a single still frame instead. The reduced-motion setting is read
// through a ref, so toggling it never rebuilds the WebGL context.

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { Mesh, Object3D, WebGLRenderer } from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { tokens } from '../../../lib/andromeda-pro.generated'
import { useTheme } from '../../../components/ThemeProvider'
import { BRAIN_ZONES, blendZones } from '../../../_lib/brain-colors'

const BRAIN_MODEL_URL = '/models/brain.glb'
const BRAIN_VOID = '#0E0E0F'

// Brand primitives for the ground, read once from tokens.ts.
const BRAND = tokens.color.brand

const withAlpha = (oklch: string, alpha: number) => oklch.replace(')', ` / ${alpha})`)

// Barely-there brand light behind the model: a glow where the brain sits and
// two faint sweeps from opposite corners, over the void. The Brain page's
// stage paints the same ground.
export const BRAIN_GROUND = [
  `radial-gradient(ellipse 60% 55% at 50% 48%, ${withAlpha(BRAND[500], 0.3)} 0%, transparent 70%)`,
  `radial-gradient(ellipse 80% 70% at 0% 0%, ${withAlpha(BRAND[400], 0.1)} 0%, transparent 60%)`,
  `radial-gradient(ellipse 70% 60% at 100% 100%, ${withAlpha(BRAND[500], 0.12)} 0%, transparent 60%)`,
  BRAIN_VOID,
].join(', ')

export function BrainWireframe({ followSite = false }: { followSite?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  // A theme switch rebuilds the scene (the model comes from cache); only a
  // followSite brain ever sees one.
  const ink = followSite ? theme : 'dark'

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

        const zoneCols = BRAIN_ZONES.map((z) => {
          const c = new THREE.Color(z.hex[ink])
          return [c.r, c.g, c.b] as [number, number, number]
        })

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
        // Frame time from performance.now(): THREE.Clock is deprecated.
        let last = performance.now()
        const delta = () => {
          const now = performance.now()
          const dt = (now - last) / 1000
          last = now
          return dt
        }

        const tick = () => {
          raf = 0
          const dt = Math.min(delta(), 1 / 30)
          if (brainRoot && !reduceRef.current) brainRoot.rotation.y += dt * 0.25
          r.render(scene, camera)
          if (alive && visible && !reduceRef.current) raf = requestAnimationFrame(tick)
        }
        const kick = () => {
          if (!alive || raf) return
          delta() // drop the time spent paused, so the spin never jumps
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
            const centre = box.getCenter(new THREE.Vector3())
            const v = new THREE.Vector3()
            // One material for every mesh: unlit, so the colours read exactly.
            const material = new THREE.MeshBasicMaterial({
              vertexColors: true,
              wireframe: true,
              transparent: true,
              opacity: 1,
              depthWrite: false,
            })
            // Wires behind the brain's front surface stay, drawn faint. An
            // invisible solid copy of each mesh writes depth first; the wires
            // in front of it draw at full strength, and a second pass draws
            // only the wires behind it, at BACK_OPACITY. All the detail stays,
            // and front and back stop muddying each other where they cross.
            const BACK_OPACITY = 0.28
            const occluderMaterial = new THREE.MeshBasicMaterial({
              colorWrite: false,
              polygonOffset: true,
              polygonOffsetFactor: 1,
              polygonOffsetUnits: 1,
            })
            const backMaterial = material.clone()
            backMaterial.opacity = BACK_OPACITY
            backMaterial.depthFunc = THREE.GreaterDepth
            const meshes: Mesh[] = []
            model.traverse((o) => {
              if ((o as Mesh).isMesh) meshes.push(o as Mesh)
            })
            meshes.forEach((mesh) => {
              // A copy per mesh, so writing its colours never touches a shared
              // geometry the model reuses elsewhere.
              const geometry = mesh.geometry.clone()
              const pos = geometry.getAttribute('position')
              const colors = new Float32Array(pos.count * 3)
              for (let i = 0; i < pos.count; i++) {
                // Direction from the model's centre, so each section holds its
                // side of the brain while the whole thing turns.
                v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).sub(centre).normalize()
                blendZones(v.x, v.y, v.z, zoneCols, colors, i * 3)
              }
              geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
              mesh.geometry = geometry
              mesh.material = material
              mesh.renderOrder = 2
              const occluder = new THREE.Mesh(geometry, occluderMaterial)
              occluder.renderOrder = 0
              const back = new THREE.Mesh(geometry, backMaterial)
              back.renderOrder = 1
              mesh.add(occluder, back)
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
  }, [ink])

  return <div ref={hostRef} aria-hidden className="absolute inset-0" style={{ background: BRAIN_GROUND }} />
}
