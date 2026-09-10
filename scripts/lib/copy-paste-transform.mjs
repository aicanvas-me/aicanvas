/**
 * Shared copy-paste-readiness transform for component source code, applied by
 * `generate-component-codes.mjs` and `generate-registry.mjs` before shipping
 * source to end users (the website "Copy Code" button, and the shadcn registry
 * JSON consumed by `shadcn add` and the MCP).
 */

/**
 * Make a component's source copy-paste ready by replacing `h-full` with
 * `min-h-screen` ON THE ROOT JSX ELEMENT ONLY: the first `className="..."` after
 * the `return (` of `export default function`.
 *
 * Root-only, because a root `h-full` relies on a parent height chain no fresh
 * project provides, so the component collapses when pasted. Inner elements
 * legitimately use `h-full` to fill their container (a progress-bar fill, an
 * avatar inside a card), and rewriting those makes them try to be viewport-tall.
 *
 * Returns the content unchanged if detection fails at any step: shipping
 * `h-full` as-is beats mis-transforming.
 *
 * @param {string} content - Component source file content
 * @returns {string} The content with the root className transformed (if applicable)
 */
export function transformRootHeightClass(content) {
  const exportMatch = content.match(/export\s+default\s+function/)
  if (!exportMatch) return content

  const exportPos = exportMatch.index

  // The JSX return, not a useEffect cleanup: `return (` followed by `<`.
  const returnEndPos = findJSXReturnContentStart(content, exportPos)
  if (returnEndPos === -1) return content

  const afterReturn = content.slice(returnEndPos)

  const classNameRegex = /className\s*=\s*(["'])([^"']*?)\1/
  const classNameMatch = afterReturn.match(classNameRegex)
  if (!classNameMatch) return content

  const fullMatch = classNameMatch[0]
  const quote = classNameMatch[1]
  const classNameValue = classNameMatch[2]

  if (!/\bh-full\b/.test(classNameValue)) return content

  const transformedValue = classNameValue.replace(/\bh-full\b/g, 'min-h-screen')
  if (transformedValue === classNameValue) return content

  const transformedClassName = `className=${quote}${transformedValue}${quote}`

  const matchAbsoluteStart = returnEndPos + classNameMatch.index
  const matchAbsoluteEnd = matchAbsoluteStart + fullMatch.length

  return (
    content.slice(0, matchAbsoluteStart) +
    transformedClassName +
    content.slice(matchAbsoluteEnd)
  )
}

/**
 * Position immediately after the `(` of the JSX return, searching from
 * `startPos`, or -1 if there is none. A JSX return is distinguished from other
 * `return (` patterns (a useEffect cleanup `return () => {...}`) by requiring the
 * next non-whitespace, non-comment character after `(` to be `<`.
 */
export function findJSXReturnContentStart(content, startPos) {
  const re = /return\s*\(/g
  re.lastIndex = startPos
  let match
  while ((match = re.exec(content)) !== null) {
    const afterParen = match.index + match[0].length
    let i = afterParen
    while (i < content.length) {
      const ch = content[i]
      if (/\s/.test(ch)) { i++; continue }
      if (ch === '/' && content[i + 1] === '*') {
        const end = content.indexOf('*/', i + 2)
        if (end === -1) return -1
        i = end + 2
        continue
      }
      if (ch === '/' && content[i + 1] === '/') {
        const end = content.indexOf('\n', i + 2)
        if (end === -1) return -1
        i = end + 1
        continue
      }
      // First real char: must be `<` for a JSX return
      if (ch === '<') return afterParen
      // Anything else (`)` for `() =>`, `{` for `({...})`) is not JSX, try next.
      break
    }
  }
  return -1
}
