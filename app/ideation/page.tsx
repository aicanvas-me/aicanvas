import { redirect } from 'next/navigation'

// /ideation lands on Andromeda Pro's component grid. Two systems ship now, and
// Pro is the one this route was built around: /components is its IA, and
// Andromeda Legacy has no such route (its grid is /system). The ideation-local
// wrapper page was retired as a duplicate (see next.config.ts), so this points
// straight at the canonical public route.
export default function IdeationRoot() {
  redirect('/design-systems/andromeda-pro/components')
}
