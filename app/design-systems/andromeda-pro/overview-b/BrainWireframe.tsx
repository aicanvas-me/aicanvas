'use client'

// A slow-spinning wireframe of the Brain model for the Built for AI card. The
// same brain.glb as the Brain page, locked to the site's olive-500, reduced to
// a spin: no drag, no labels. Fails silent (the dark ground only) when WebGL
// or the model cannot load.
//
// The loop only runs while the card is on screen, and under reduced motion it
// draws a single still frame instead. The reduced-motion setting is read
// through a ref, so toggling it never rebuilds the WebGL context.

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { Mesh, Object3D, WebGLRenderer } from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

const BRAIN_MODEL_URL = '/models/brain.glb'
const BRAIN_OLIVE_500 = '#A8B94D'
const BRAIN_VOID = '#0E0E0F'

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
        const r = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' })
        renderer = r
        r.setSize(W, H)
        r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
        host.appendChild(r.domElement)

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(BRAIN_VOID)
        scene.add(new THREE.AmbientLight(0xffffff, 0.25))
        const key = new THREE.DirectionalLight(0xeaf2ff, 1)
        key.position.set(3, 4, 5)
        scene.add(key)

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
            model.traverse((o) => {
              const mesh = o as Mesh
              if (mesh.isMesh) {
                mesh.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color(BRAIN_OLIVE_500),
                  wireframe: true,
                  emissive: new THREE.Color(BRAIN_OLIVE_500),
                  emissiveIntensity: 0.6,
                  metalness: 0,
                  roughness: 1,
                })
              }
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

  return <div ref={hostRef} aria-hidden className="absolute inset-0" style={{ background: BRAIN_VOID }} />
}
