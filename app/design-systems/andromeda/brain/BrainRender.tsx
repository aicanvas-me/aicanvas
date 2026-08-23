'use client'

import { useEffect, useRef } from 'react'
import type { Group, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_URL = '/models/brain.glb'

// The four brain sections and their colours. The colours are baked into the
// wireframe as per-vertex colours (blended by region, so the wires shade from
// one into the next); the labels sit together in a fixed legend, not floating
// on the brain.
const ZONES = [
  { label: 'Index', dir: [0.2, 0.9, 0.35], hex: '#a78bfa' }, // purple
  { label: 'Foundations', dir: [-0.9, 0.05, 0.4], hex: '#38bdf8' }, // cyan
  { label: 'Components', dir: [0.9, 0.05, 0.4], hex: '#fb923c' }, // orange
  { label: 'Skills', dir: [0.0, -0.7, 0.7], hex: '#a3e635' }, // lime
]

// Wireframe brain for the reader's Brain Index landing: a multi-colour wireframe
// (the four section colours blended across the wires) tumbling on a tilted axis.
// Client-only Three.js; the reader only mounts for premium users.
export function BrainRender({ height = 400 }: { height?: number }) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let alive = true
    let raf = 0
    let renderer: WebGLRenderer
    let scene: Scene
    let camera: PerspectiveCamera
    let rig: Group | undefined
    let onResize = () => {}

    ;(async () => {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      if (!alive) return

      let W = host.clientWidth || 600
      const H = height
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      host.appendChild(renderer.domElement)

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 100)
      camera.position.set(0, 0.05, 2.8)

      // Linear-space RGB of each zone colour (three stores hex as linear internally).
      const zoneCols = ZONES.map((z) => {
        const c = new THREE.Color(z.hex)
        return [c.r, c.g, c.b] as [number, number, number]
      })
      const zoneDirs = ZONES.map((z) => new THREE.Vector3(z.dir[0], z.dir[1], z.dir[2]).normalize())

      new GLTFLoader().load(MODEL_URL, (gltf: GLTF) => {
        if (!alive) return
        const model = gltf.scene
        model.updateWorldMatrix(true, true)
        let sph = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere())
        model.scale.setScalar(1 / (sph.radius || 1))
        model.updateWorldMatrix(true, true)
        sph = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere())
        model.position.sub(sph.center)

        model.traverse((o) => {
          // Duck-typed on purpose: instanceof breaks when two copies of three load.
          const mesh = o as Mesh
          if (!mesh.isMesh) return
          const geo = mesh.geometry
          const pos = geo.attributes.position
          // Local centre so each vertex direction is measured from the brain's middle.
          geo.computeBoundingBox()
          const box = geo.boundingBox!
          const cx = (box.min.x + box.max.x) / 2
          const cy = (box.min.y + box.max.y) / 2
          const cz = (box.min.z + box.max.z) / 2
          const colors = new Float32Array(pos.count * 3)
          const d = new THREE.Vector3()
          for (let i = 0; i < pos.count; i++) {
            d.set(pos.getX(i) - cx, pos.getY(i) - cy, pos.getZ(i) - cz).normalize()
            // Weight each zone by angular proximity; blend the four colours.
            let wsum = 0
            const w = [0, 0, 0, 0]
            for (let k = 0; k < 4; k++) {
              const dot = Math.max(0, d.dot(zoneDirs[k]))
              w[k] = dot * dot * dot + 0.04 // epsilon so no wire goes fully black
              wsum += w[k]
            }
            let r = 0, g = 0, b = 0
            for (let k = 0; k < 4; k++) {
              const t = w[k] / wsum
              r += zoneCols[k][0] * t
              g += zoneCols[k][1] * t
              b += zoneCols[k][2] * t
            }
            colors[i * 3] = r
            colors[i * 3 + 1] = g
            colors[i * 3 + 2] = b
          }
          geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
          mesh.material = new THREE.MeshBasicMaterial({ wireframe: true, vertexColors: true })
        })

        rig = new THREE.Group()
        rig.add(model)
        rig.rotation.x = 0.32 // tilt so it reads as 3D, not a flat spin
        scene.add(rig)
      })

      onResize = () => {
        if (!renderer) return
        W = host.clientWidth || 600
        renderer.setSize(W, H)
        camera.aspect = W / H
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      const clock = new THREE.Clock()
      const loop = () => {
        if (!alive) return
        raf = requestAnimationFrame(loop)
        if (rig) {
          const t = clock.getElapsedTime()
          rig.rotation.y += 0.004
          rig.rotation.x = 0.32 + Math.sin(t * 0.35) * 0.1 // gentle tilt wobble
        }
        renderer.render(scene, camera)
      }
      loop()
    })().catch(() => {})

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      // forceContextLoss releases the WebGL context (browser cap ~16) — dispose alone leaks it.
      try {
        try {
          renderer?.forceContextLoss()
        } catch {}
        renderer?.dispose()
        if (renderer?.domElement && host.contains(renderer.domElement)) host.removeChild(renderer.domElement)
      } catch {}
    }
  }, [height])

  return (
    <div style={{ position: 'relative', width: '100%', height, pointerEvents: 'none' }} aria-hidden>
      <div ref={hostRef} style={{ width: '100%', height }} />
      {/* Fixed legend — one place, colour + section. */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          fontFamily: "var(--font-sans), 'Manrope', system-ui, sans-serif",
          fontSize: 12,
        }}
      >
        {ZONES.map((z) => (
          <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: 4, background: z.hex, flexShrink: 0 }} />
            <span style={{ color: z.hex, letterSpacing: '0.04em' }}>{z.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
