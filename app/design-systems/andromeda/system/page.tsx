// /system carried the public gallery until the v2 IA restructure (plan ruling
// 2026-08-17: Foundation, Components, Templates, Brain). Its URL equity moves
// to /foundation with a permanent redirect — indexed, never 404 — and the
// gallery itself now lives at /components. /system/preview is untouched: it
// stays the internal review matrix.
import { permanentRedirect } from 'next/navigation'

export default function SystemRedirect() {
  permanentRedirect('/design-systems/andromeda/foundation')
}
