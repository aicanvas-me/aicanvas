import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a new file called ParticleSphere.tsx. It should export a React client component named ParticleSphere that renders an animated 3D particle sphere using Three.js.

Requirements:
- 'use client' at the top
- Add a "// npm install three" comment immediately after it
- Use the named export declaration: export default function ParticleSphere
- Import useEffect, useRef from react; import * as THREE from 'three'
- PARTICLE_COUNT = 9000
- makeSprite(): creates a 64×64 canvas with radial white→transparent gradient, returns THREE.CanvasTexture
- colorFromY(ny) returns the dark [r,g,b] palette: for ny≥0 return [1, 0.55+ny*0.37, 0.02+ny*0.63]; for ny<0 let d=-ny, v=0.38+d*0.62 and return [v, v, v+(1-d)*0.07]
- lightColorFromY(ny) returns the light [r,g,b] palette: for ny≥0 return [0.95, 0.42+ny*0.30, 0.02+ny*0.20]; for ny<0 let d=-ny, v=0.55-d*0.35 and return [v+(1-d)*0.06, v+(1-d)*0.02, v]
- useEffect: create scene, PerspectiveCamera(52, W/H, 0.1, 100), camera.position.z=2.9
- Create WebGLRenderer({ antialias:true, alpha:true }), setClearColor(0x000000, 0), and append its canvas to the inner host
- A ResizeObserver on the inner absolute inset-0 host updates renderer size, camera aspect, and the projection matrix
- Fill positions/colors Float32Arrays using spherical coords (acos(2*rand-1), 2π*rand) with r±0.07 jitter
- BufferGeometry with position + color attributes
- PointsMaterial: size 0.032, map=sprite, vertexColors, transparent, depthWrite false; dark uses THREE.AdditiveBlending and light uses THREE.NormalBlending
- Read theme from the closest [data-card-theme], else <html>.dark. A MutationObserver watches both, and theme changes rewrite the geometry color attribute and material blending in place
- mesh.rotation.x=0.28, mesh.rotation.z=0.08 (tilt)
- RAF loop: t+=0.004/frame, mesh.rotation.y=t, z wobble via sin
- Cleanup: cancelAnimationFrame, dispose geo/mat/sprite/renderer, removeChild
- Return a relative min-h-screen w-full root with bg-[#F2F1EC] dark:bg-black for a standalone page, containing <div ref={containerRef} className="absolute inset-0" />`,
  'Lovable': `Create a new file called ParticleSphere.tsx. It should export a React client component that renders an animated 3D particle sphere using Three.js.

Requirements:
- 'use client' at the top
- Import useEffect, useRef from react; import * as THREE from 'three'
- PARTICLE_COUNT = 9000
- makeSprite(): creates a 64×64 canvas with radial white→transparent gradient, returns THREE.CanvasTexture
- colorFromY(ny): returns [r,g,b]. For ny≥0: warm gold [1, 0.55+ny*0.37, ny*0.63]; ny<0: silver [v,v,v+...] where v=0.38+(-ny)*0.62
- useEffect: create scene, PerspectiveCamera(52, W/H, 0.1, 100), camera.position.z=2.9
- WebGLRenderer, setClearColor(0x000000), appendChild to container div
- Fill positions/colors Float32Arrays using spherical coords (acos(2*rand-1), 2π*rand) with r±0.07 jitter
- BufferGeometry with position + color attributes
- PointsMaterial: size 0.032, map=sprite, vertexColors, transparent, depthWrite false, blending THREE.AdditiveBlending
- mesh.rotation.x=0.28, mesh.rotation.z=0.08 (tilt)
- RAF loop: t+=0.004/frame, mesh.rotation.y=t, z wobble via sin
- Cleanup: cancelAnimationFrame, dispose geo/mat/sprite/renderer, removeChild
- Return: <div ref={containerRef} className="h-full w-full" />`,
  'V0': `Create a ParticleSphere component using React and Three.js. Render 9,000 particles distributed uniformly across a sphere surface using spherical coordinates (theta = acos(2*rand-1), phi = 2π*rand). Add slight radial jitter (r = 1 ± 0.07) for volumetric depth. Color each particle by its normalised Y position: upper hemisphere → warm gold-to-orange (rgb 1.0, 0.55+t*0.37, t*0.63), lower hemisphere → cool white-to-silver (v = 0.38+t*0.62). Use THREE.PointsMaterial with AdditiveBlending, a soft radial glow sprite as the map, and depthWrite: false. Tilt the mesh (rotation.x=0.28, rotation.z=0.08) and animate rotation.y continuously. Black background. TypeScript + 'use client'.`,
}
