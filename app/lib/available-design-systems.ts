import 'server-only'
import { existsSync } from 'node:fs'
import { DESIGN_SYSTEMS } from '../../scripts/lib/design-systems.config.mjs'

/**
 * The design systems this build can actually serve.
 *
 * A `skipIfMissing` system whose source tree is absent — an injected-only
 * system such as Andromeda Pro on a build with no vault access — is left out,
 * so the sitemap and llms.txt never advertise a system this deployment cannot
 * render. Server-only: it touches the filesystem, and the shared config it
 * reads is also imported by client components, which must stay Node-free.
 */
export function availableDesignSystems() {
  return DESIGN_SYSTEMS.filter(
    (ds: { skipIfMissing?: boolean; rootDir: string }) => !ds.skipIfMissing || existsSync(ds.rootDir),
  )
}
