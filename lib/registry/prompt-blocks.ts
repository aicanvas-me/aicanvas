/**
 * The paywall seam in the seven-block prompt scaffold:
 *
 *   1. Setup · 2. Constants · 3. State · 4. Tree · 5. Why · 6. Remix · 7. Check
 *
 * Blocks 1 and 2 are the free teaser: enough to prove the component is worth
 * paying for. Everything from block 3 on is withheld, because block 3 is the
 * whole engine and block 4 the JSX, and the two together rebuild the paid
 * component. Blocks 5 to 7 are prose that could be public, but they sit after
 * the cut, and content resuming below a paywall reads as broken rather than
 * gated: one clean wall beats correct block order, SEO cost accepted.
 *
 * The seam is therefore [start of "## 3. State", end of prompt).
 */
const LOCKED_HEADINGS = [
  '## 3. State',
  '## 4. Tree',
  '## 5. Why',
  '## 6. Remix',
  '## 7. Check',
] as const
const LOCK_START = LOCKED_HEADINGS[0]

/**
 * Occurrences of a heading, matched at LINE START only, and the one definition
 * of "a heading" used both to place the cut and to assert the result. A substring
 * match would cut early on a heading quoted inside block 2's shipped constants,
 * and would reject a safe prompt for merely mentioning one in a string.
 */
function headingHits(text: string, heading: string): number[] {
  const out: number[] = []
  // Trailing whitespace still makes it a heading: a bare `$` would miss
  // "## 3. State " and let the block under it survive the cut.
  const re = new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'gm')
  for (let m = re.exec(text); m; m = re.exec(text)) out.push(m.index)
  return out
}

/**
 * The public part of a scaffold prompt (blocks 1 and 2), or null when the prompt
 * is not in a recognisable scaffold. Callers must then withhold it whole: the
 * scaffold is enforced per listed slug (scripts/prompts-scaffold-scope.json), so
 * "no headings found" means "cannot safely redact", never "nothing to redact".
 */
export function splitPromptAtPaywall(prompt: string): { head: string } | null {
  // Exactly one cut point, or we cannot say which one is real.
  const starts = headingHits(prompt, LOCK_START)
  if (starts.length !== 1) return null

  const head = prompt.slice(0, starts[0]).trimEnd()
  // Asserted on the output, not the input: no locked heading may survive as a
  // real heading in what we are about to ship.
  if (LOCKED_HEADINGS.some((h) => headingHits(head, h).length > 0)) return null
  return { head }
}
