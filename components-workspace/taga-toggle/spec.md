# Taga Toggle

**Slug:** taga-toggle
**Description:** A playful pill toggle with a face on the thumb — dead (×× eyes + flat mouth) when off, happy (arc eyes + smile + blush) when on.

## Visual
- Same pill track layout, but the thumb carries a full expressive face drawn in SVG
- Off: warm grey track, dead face (×× eyes, flat mouth, no blush)
- On: warm yellow track, happy face (arc squint eyes, big smile, pink blush cheeks)
- Face drawn as SVG paths inside the white thumb circle — always dark lines on white

## Colour palette
- Off track dark: `#4A4540` | light: `#9E9890`
- On track dark:  `#D4960A` | light: `#F5C518`
- Face lines: `#4A3F35` (single warm dark, consistent across states)
- Blush: `#FFB3BA` at 65% opacity (appears only when on)

## Face geometry (SVG viewBox -1 -1 2 2)
- Eyes (off — X): two crossing lines per eye, centered at (±0.32, -0.17)
- Eyes (on — arc): downward-opening arcs `M -0.50,-0.28 Q -0.32,-0.06 -0.14,-0.28` (left)
- Mouth (off — straight): `M -0.40,0.43 Q 0,0.43 0.40,0.43`
- Mouth (on — smile): `M -0.40,0.15 Q 0,0.50 0.40,0.15`
  → same M+Q structure is interpolated by Framer Motion via `animate={{ d }}`
- Blush: two ellipses at (±0.42, 0.18)

## Behaviour
- Click → thumb springs across (stiffness 500, damping 36)
- Track colour transitions continuously via useTransform(thumbX)
- Eyes: AnimatePresence mode="wait" — X scales out, arc scales in (and vice versa)
- Mouth: motion.path uses `animate={{ d: mouthPath }}` for straight→smile interpolation (both M+Q format)
- Blush: AnimatePresence fades in with a slight delay (0.15s) after turning on
- Thumb slightly larger than pill-toggle: thumb = round(trackW * 0.50), trackH = round(trackW * 0.58)
- Responsive via ResizeObserver, dual theme via MutationObserver
