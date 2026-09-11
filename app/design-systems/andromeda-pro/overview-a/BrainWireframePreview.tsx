'use client'

// A slow-spinning olive wireframe of the Brain model, for the Brain panel.
// The same brain.glb as the live Brain page, reduced to the spin: no drag, no
// labels. Locked to the site's olive-500, because this is AI Canvas chrome
// presenting the system. Fails silent (the void ground only) when WebGL or the
// model cannot load, and holds still under reduced motion.
import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { Mesh, Object3D, WebGLRenderer } from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_URL = '/models/brain.glb'
const OLIVE_500 = '#A8B94D'
const VOID = '#0E0E0F'

export function BrainWireframePreview() {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  // Read inside the render loop, so toggling the preference never rebuilds
  // the renderer.
  const reduceRef = useRef(reduce)
  reduceRef.current = reduce

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let alive = true
    let raf = 0
    let renderer: WebGLRenderer | undefined
    let observer: ResizeObserver | undefined

    ;(async () => {
      try {
        const [THREE, { GLTFLoader }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
        ])
        if (!alive) return

        let W = host.clientWidth || 400
        let H = host.clientHeight || 300
        const r = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' })
        renderer = r
        r.setSize(W, H)
        r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
        host.appendChild(r.domElement)

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(VOID)
        scene.add(new THREE.AmbientLight(0xffffff, 0.25))
        const key = new THREE.DirectionalLight(0xeaf2ff, 1)
        key.position.set(3, 4, 5)
        scene.add(key)

        const camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 100)
        camera.position.set(0, 0.2, 3)
        camera.lookAt(0, 0, 0)

        // The box changes height between the stacked and two-column layouts,
        // so follow the box itself rather than the window.
        observer = new ResizeObserver(() => {
          W = host.clientWidth || W
          H = host.clientHeight || H
          r.setSize(W, H)
          camera.aspect = W / H
          camera.updateProjectionMatrix()
        })
        observer.observe(host)

        let brainRoot: Object3D | null = null
        new GLTFLoader().load(
          MODEL_URL,
          (gltf: GLTF) => {
            if (!alive) return
            const model = gltf.scene
            // Normalise scale, then recentre on the bounding sphere (the model
            // ships off-origin at an arbitrary scale).
            model.updateWorldMatrix(true, true)
            let box = new THREE.Box3().setFromObject(model)
            let sphere = box.getBoundingSphere(new THREE.Sphere())
            model.scale.setScalar(1 / (sphere.radius || 1))
            model.updateWorldMatrix(true, true)
            box = new THREE.Box3().setFromObject(model)
            sphere = box.getBoundingSphere(new THREE.Sphere())
            model.position.sub(sphere.center)
            model.traverse((o) => {
              const mesh = o as Mesh
              if (mesh.isMesh) {
                mesh.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color(OLIVE_500),
                  wireframe: true,
                  emissive: new THREE.Color(OLIVE_500),
                  emissiveIntensity: 0.6,
                  metalness: 0,
                  roughness: 1,
                })
              }
            })
            scene.add(model)
            brainRoot = model
          },
          undefined,
          () => {},
        )

        const clock = new THREE.Clock()
        const loop = () => {
          raf = requestAnimationFrame(loop)
          const dt = Math.min(clock.getDelta(), 1 / 30)
          if (brainRoot && !reduceRef.current) brainRoot.rotation.y += dt * 0.25
          r.render(scene, camera)
        }
        loop()
      } catch {
        // No WebGL: the void ground stays, nothing else.
      }
    })()

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      observer?.disconnect()
      try {
        if (renderer) {
          renderer.forceContextLoss()
          renderer.dispose()
          if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement)
        }
      } catch {}
    }
  }, [])

  return <div ref={hostRef} aria-hidden className="absolute inset-0" style={{ background: VOID }} />
}
