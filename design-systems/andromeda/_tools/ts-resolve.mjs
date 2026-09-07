// --import bootstrap: registers a resolver so plain `node` can follow the
// repo's extensionless relative TS imports (e.g. `../../tokens`) when a
// _tools script pulls component sources directly.
//
//   node --import ./design-systems/andromeda/_tools/ts-resolve.mjs <script>
import { register } from 'node:module'

register(
  'data:text/javascript,' +
    encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context)
  } catch (err) {
    if (specifier.startsWith('.') && !/\\.[a-z]+$/i.test(specifier)) {
      return nextResolve(specifier + '.ts', context)
    }
    throw err
  }
}
`),
)
