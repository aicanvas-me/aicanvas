import { describe, it, expect } from 'vitest'
import { searchTokens, matchesQuery, effectiveTokens, SYNONYMS } from './search-match'

// Searchable strings shaped the way HomeClient builds them: name, description
// and tag labels in one string. The last three carry the design-system keyword
// tail HomeClient folds into the Andromeda entries, which is what makes
// "component" a catalog-wide word rather than a distinguishing one.
const KW = 'andromeda components design systems'
const CORPUS = [
  'Glass Card A frosted card with a blurred backdrop Cards & Modals Glass',
  'Glass Dock A macOS-style dock with a frosted bar Navigation Glass',
  'Neon Button A button with a glowing outline Buttons & Toggles',
  'Pricing Table A three-tier pricing section Blocks',
  `Alert Banner-style status component for inline messages ${KW}`,
  `Gauge A radial gauge with a threshold arc ${KW}`,
  `Waveform An audio waveform readout ${KW}`,
]

const run = (query: string) => {
  const tokens = effectiveTokens(searchTokens(query), CORPUS)
  return CORPUS.filter((text) => matchesQuery(text, tokens))
}

describe('searchTokens', () => {
  it('lowercases and splits on whitespace', () => {
    expect(searchTokens('Glass Component')).toEqual(['glass', 'component'])
    expect(searchTokens('  glass   dock ')).toEqual(['glass', 'dock'])
    expect(searchTokens('   ')).toEqual([])
  })
})

describe('matchesQuery', () => {
  it('needs every word, in any order, anywhere in the text', () => {
    expect(matchesQuery(CORPUS[0], ['glass', 'card'])).toBe(true)
    expect(matchesQuery(CORPUS[0], ['card', 'glass'])).toBe(true)
    expect(matchesQuery(CORPUS[0], ['glass', 'neon'])).toBe(false)
  })

  it('matches across fields — one word from the name, one from a tag', () => {
    expect(matchesQuery(CORPUS[1], ['dock', 'navigation'])).toBe(true)
  })

  it('does not read words like constructor off the prototype', () => {
    expect(matchesQuery(CORPUS[0], ['constructor'])).toBe(false)
    expect(matchesQuery(CORPUS[0], ['__proto__'])).toBe(false)
  })

  it('treats no words as matching everything', () => {
    expect(matchesQuery(CORPUS[0], [])).toBe(true)
  })
})

describe('search behaviour', () => {
  it('finds the glass components for "glass component" — the reported bug', () => {
    // "component" appears only in one unrelated description, so the whole query
    // matches nothing and the least selective word is given up.
    expect(run('glass component')).toHaveLength(2)
  })

  it('matches a real phrase without relaxing it', () => {
    expect(run('glass dock')).toEqual([CORPUS[1]])
  })

  it('drops a word the catalog does not know at all', () => {
    expect(run('react glass')).toHaveLength(2)
  })

  it('keeps a one-word query intact, so a typo still finds nothing', () => {
    expect(run('gllass')).toHaveLength(0)
  })

  it('keeps a real tag working as a filter', () => {
    expect(run('pricing blocks')).toEqual([CORPUS[3]])
  })

  it('keeps a design-system word that really does distinguish', () => {
    expect(run('andromeda gauge')).toEqual([CORPUS[5]])
  })

  it('leaves a blank query alone', () => {
    expect(effectiveTokens(searchTokens(''), CORPUS)).toEqual([])
  })
})

describe('synonyms', () => {
  const ENTRIES = [
    'Sign In A whole authentication flow: create an account, sign in, recover a password',
    'AI Chat A revenue desk that works by conversation',
    'Drawer Displays content in a panel that slides in from the edge of the screen',
    'Waveform Displays a live signal as a moving trace',
  ]
  const find = (query: string) => {
    const tokens = effectiveTokens(searchTokens(query), ENTRIES)
    return ENTRIES.filter((text) => matchesQuery(text, tokens)).map((t) => t.split(' ')[0])
  }

  it('finds an entry by the word people search for it', () => {
    expect(find('login')).toEqual(['Sign'])
    expect(find('chatbot')).toEqual(['AI'])
    expect(find('sheet')).toEqual(['Drawer'])
    expect(find('voice')).toEqual(['Waveform'])
  })

  it('every synonym points at a word, never at itself', () => {
    for (const [word, targets] of Object.entries(SYNONYMS)) {
      expect(targets.length).toBeGreaterThan(0)
      expect(targets).not.toContain(word)
    }
  })
})
