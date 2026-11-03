// Site search matching. Two rules:
//
// 1. A query is matched word by word, never as one contiguous phrase, so word
//    order does not matter and "glass component" still finds the glass entries.
// 2. When the full query matches nothing it is relaxed rather than failed: words
//    no entry carries go first, then the least selective word, until something
//    matches or a single word is left. That drops "component", "ui" or "react"
//    without a hand-kept filler list to go stale, and keeps real tags like
//    "blocks" and "widgets" working as filters.
//
// A one-word query is never relaxed, so a typo still lands on the empty state.
//
// A word people type for something we name differently also matches our name
// for it (SYNONYMS). Every target must be a word a real entry carries; a
// synonym that points at nothing only hides the empty state.

/** Searched words with no match on the live site, mapped to the words our
 *  names and descriptions use for the same thing. Keys are singular. */
export const SYNONYMS: Record<string, string[]> = {
  login: ['sign in', 'sign up'],
  signin: ['sign in'],
  signup: ['sign up'],
  register: ['sign up'],
  auth: ['sign in', 'sign up'],
  authentication: ['sign in', 'sign up'],
  password: ['sign in'],
  chatbot: ['chat'],
  assistant: ['chat'],
  conversation: ['chat'],
  sheet: ['drawer'],
  loader: ['loading', 'spinner', 'skeleton'],
  loading: ['loader', 'spinner', 'skeleton'],
  voice: ['waveform', 'audio'],
  sound: ['waveform', 'audio'],
  audio: ['waveform'],
}

/** The word itself plus every word that stands for it. */
export function wordVariants(word: string): string[] {
  return [word, ...(SYNONYMS[word] ?? [])]
}

const hasWord = (haystack: string, word: string) => wordVariants(word).some((v) => haystack.includes(v))

/** Split a raw query into lowercase words. Empty for a blank query. */
export function searchTokens(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean)
}

/** True when every word (or a synonym of it) appears somewhere in the text.
 *  Pass the entry's name, description and tags as one string. */
export function matchesQuery(text: string, tokens: string[]): boolean {
  if (tokens.length === 0) return true
  const haystack = text.toLowerCase()
  return tokens.every((t) => hasWord(haystack, t))
}

/** The words actually used to filter, after relaxing a query that would find
 *  nothing. `corpus` is every searchable entry as one string, exactly as
 *  it will be matched. */
export function effectiveTokens(tokens: string[], corpus: string[]): string[] {
  if (tokens.length < 2) return tokens
  const haystacks = corpus.map((t) => t.toLowerCase())
  const hits = (t: string) => haystacks.reduce((n, h) => (hasWord(h, t) ? n + 1 : n), 0)
  const count = new Map(tokens.map((t) => [t, hits(t)]))
  const anyEntryMatches = (words: string[]) =>
    haystacks.some((h) => words.every((t) => hasWord(h, t)))

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
