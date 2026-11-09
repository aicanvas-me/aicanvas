export function iconItemsIn(code: string): string[] {
  return [...new Set(
    [...code.matchAll(/from ['"]@\/components\/icons\/([A-Za-z0-9-]+)['"]/g)]
      .map(([, name]) => (name === 'IconBase' ? 'icon-base' : `icon-${name}`)),
  )].sort()
}
