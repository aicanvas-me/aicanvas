// The code view must show the imports an install writes, so a copy-paster's project resolves them.
// Mirrors toInstalledIconPaths in scripts/lib/copy-paste-transform.mjs; change both.
export function toInstalledIconPaths(content: string): string {
  return content.replace(/(['"])@\/app\/_icons\/(?:icons\/)?/g, '$1@/components/icons/')
}
