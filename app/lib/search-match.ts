// Site search matching.
//
// Learned from "glass component" returning nothing while "glass" alone matched
// a dozen components. Two rules:
//
// 1. A query is matched word by word, never as one contiguous phrase. No name,
//    description or tag carries those two words side by side, so phrase
//    matching found nothing. Word order now stops mattering too.
// 2. When the full query matches nothing, it is relaxed rather than failed:
//    words that match nothing at all go first, then the least selective word
//    (the one the most entries carry) goes next, until something matches or a
//    single word is left. That drops "component", "ui" or "react" — how people
//    describe what they are browsing, not how any one component describes
//    itself — without a hand-kept filler list to go stale, and it keeps real
//    tags like "blocks" and "widgets" working as filters.
//
// A one-word query is never relaxed, so a typo still lands on the empty state
// and its "Did you mean?" suggestions.

/** Split a raw query into lowercase words. Empty for a blank query. */
export function searchTokens(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean)
}

/** True when every word appears somewhere in the text. Pass the entry's name,
 *  description and tag labels joined into one string: a word can never contain
 *  whitespace, so nothing matches across a field boundary. */
export function matchesQuery(text: string, tokens: string[]): boolean {
  if (tokens.length === 0) return true
  const haystack = text.toLowerCase()
  return tokens.every((t) => haystack.includes(t))
}

/** The words actually used to filter, after relaxing a query that would find
 *  nothing. `corpus` is every searchable entry, each as one string, exactly as
 *  it will be matched. */
export function effectiveTokens(tokens: string[], corpus: string[]): string[] {
  if (tokens.length < 2) return tokens
  const haystacks = corpus.map((t) => t.toLowerCase())
  const hits = (t: string) => haystacks.reduce((n, h) => (h.includes(t) ? n + 1 : n), 0)
  const count = new Map(tokens.map((t) => [t, hits(t)]))
  const anyEntryMatches = (words: string[]) =>
    haystacks.some((h) => words.every((t) => h.includes(t)))

  // Words no entry carries at all: they can only ever return nothing.
  let kept = tokens.filter((t) => count.get(t)! > 0)
  if (kept.length === 0) return tokens

  // Still nothing in common? Give up the least selective word first.
  while (kept.length > 1 && !anyEntryMatches(kept)) {
    let broadest = kept[0]
    for (const t of kept) if (count.get(t)! > count.get(broadest)!) broadest = t
    kept = kept.filter((t) => t !== broadest)
  }
  return kept
}
