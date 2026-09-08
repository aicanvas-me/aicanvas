import { redirect } from 'next/navigation'

// /ideation lands straight on the Andromeda showcase, the only design system
// shipped today. Add a chooser here when a second system goes live.
export default function IdeationRoot() {
  redirect('/design-systems/andromeda/system')
}
