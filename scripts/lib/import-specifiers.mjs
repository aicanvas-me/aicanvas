// Every quoted specifier reachable via `from '...'` (all variants of `import` /
// `import type` / `export ... from`) plus bare side-effect `import '...'` lines.
// Comment lines are skipped: a commented-out import is not a dependency.
const COMMENT_LINE = /^\s*(\/\/|\/\*|\*)/

export function extractImportSpecifiers(content) {
  const code = content
    .split('\n')
    .filter((line) => !COMMENT_LINE.test(line))
    .join('\n')
  const specs = []
  const fromRe = /\bfrom\s+['"]([^'"]+)['"]/g
  let m
  while ((m = fromRe.exec(code)) !== null) specs.push(m[1])
  const sideRe = /^\s*import\s+['"]([^'"]+)['"]/gm
  while ((m = sideRe.exec(code)) !== null) specs.push(m[1])
  return specs
}
