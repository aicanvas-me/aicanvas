/**
 * The Andromeda Pro component card shows ONE sentence, and it is cut here
 * rather than in either caller because both surfaces must cut it the same way:
 * the components index and the "More Andromeda Pro components" carousel render
 * the same card, so the first two-sentence description would otherwise make one
 * of them taller than the other.
 *
 * Its own module, free of React and of any icon import, because both callers are
 * SERVER components. Living beside the card meant importing that file — and with
 * it @phosphor-icons — into the RSC graph, where the icon package's
 * `createContext` call is a hard 500.
 */
export const firstSentence = (text: string) => {
  const end = text.indexOf('. ')
  return end === -1 ? text : text.slice(0, end + 1)
}
