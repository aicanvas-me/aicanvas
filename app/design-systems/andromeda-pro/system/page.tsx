// /system carried the public gallery until the IA moved to Foundation,
// Components, Templates and Brain. Its URL equity moves
// to /foundation with a permanent redirect — indexed, never 404 — and the
// gallery itself now lives at /components. /system/preview is untouched: it
// stays the internal review matrix.
import { permanentRedirect } from 'next/navigation'

export default function SystemRedirect() {
  permanentRedirect('/design-systems/andromeda-pro/foundation')
}
