'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/app/components/ThemeProvider'
import { BRAIN_GRAY, BRAIN_ZONES } from '@/app/_lib/brain-colors'
import type { Group, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_URL = '/models/brain.glb'

// The Andromeda brain look: one gray, per site theme (app/_lib/brain-colors.ts).
// The section legend stays, in the same gray.
const SECTIONS = BRAIN_ZONES.map((z) => z.label)

// Wireframe brain for the reader's Brain Index landing, tumbling on a tilted
// axis. Client-only Three.js; the reader only mounts for premium users.
export function BrainRender({ height = 400 }: { height?: number }) {
  const hostRef = useRef<HTMLDivElement>(null)
  // A theme switch rebuilds the scene (the model comes from cache); repainting in
  // place is the ceiling, and this view sits behind the paywall.
  const { theme } = useTheme()

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

      const gray = new THREE.Color(BRAIN_GRAY[theme])

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
          const colors = new Float32Array(pos.count * 3)
          for (let i = 0; i < pos.count; i++) gray.toArray(colors, i * 3)
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
  }, [height, theme])

  return (
    <div style={{ position: 'relative', width: '100%', height, pointerEvents: 'none' }} aria-hidden>
      <div ref={hostRef} style={{ width: '100%', height }} />
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
        {SECTIONS.map((label) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: 4, background: BRAIN_GRAY[theme], flexShrink: 0 }} />
            <span style={{ color: BRAIN_GRAY[theme], letterSpacing: '0.04em' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
