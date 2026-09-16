// The review URL for the overview redesign. The design is now the real
// Andromeda Pro landing, so this address sends visitors there for good.
import { permanentRedirect } from 'next/navigation'

export default function AndromedaOverviewBPage() {
  permanentRedirect('/design-systems/andromeda-pro')
}
