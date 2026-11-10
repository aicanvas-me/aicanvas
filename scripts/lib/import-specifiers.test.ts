import { describe, expect, it } from 'vitest'
import { extractImportSpecifiers } from './import-specifiers.mjs'

describe('extractImportSpecifiers', () => {
  it('reads from-imports, re-exports and side-effect imports', () => {
    const src = [
      "import { motion } from 'framer-motion'",
      "import type { Theme } from './theme'",
      "export { Button } from '../button'",
      "import './styles.css'",
    ].join('\n')
    expect(extractImportSpecifiers(src)).toEqual(['framer-motion', './theme', '../button', './styles.css'])
  })

  it('skips a commented-out import, so it never becomes a dependency', () => {
    const src = [
      "// import { IconName } from '@/app/_icons/icons/icon-name'",
      "/* import { Old } from './old' */",
      " * import { Doc } from './doc'",
      "import { Check } from '@/app/_icons/icons/check'",
    ].join('\n')
    expect(extractImportSpecifiers(src)).toEqual(['@/app/_icons/icons/check'])
  })
})
