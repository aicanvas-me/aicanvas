import { redirect } from 'next/navigation'

// /ideation lands you directly on the Andromeda showcase — that's the only
// design system shipped today. The ideation-local wrapper page was retired as
// a duplicate (see next.config.ts), so this points straight at the canonical
// public route. Add a chooser back here when a second system goes live.
export default function IdeationRoot() {
  redirect('/design-systems/andromeda/components')
}
