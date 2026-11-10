import { describe, expect, it } from 'vitest'
import { toInstalledIconPaths } from './installed-icon-paths'

describe('toInstalledIconPaths', () => {
  it('maps icon and IconBase imports to the flat install folder', () => {
    const src = [
      `import { Check } from '@/app/_icons/icons/check'`,
      `import type { IconProps } from "@/app/_icons/IconBase"`,
    ].join('\n')
    expect(toInstalledIconPaths(src)).toBe(
      [
        `import { Check } from '@/components/icons/check'`,
        `import type { IconProps } from "@/components/icons/IconBase"`,
      ].join('\n'),
    )
  })

  it('leaves other imports alone', () => {
    const src = `import { cn } from '@/lib/utils'\nimport x from '../icons/check'`
    expect(toInstalledIconPaths(src)).toBe(src)
  })
})
