import { describe, expect, it } from 'vitest'
import { transformRootHeightClass } from './copy-paste-transform.mjs'

describe('transformRootHeightClass', () => {
  it('moves the root to min-h-screen past a .map callback that returns JSX first', () => {
    const src = [
      'export default function Gauge({',
      '  items,',
      '}: { items: string[] }) {',
      '  const bars = items.map((item) => {',
      '    return (',
      '      <div className="relative h-full shrink-0">{item}</div>',
      '    )',
      '  })',
      '  return (',
      '    <div className="flex h-full w-full">{bars}</div>',
      '  )',
      '}',
    ].join('\n')
    const out = transformRootHeightClass(src)
    expect(out).toContain('className="relative h-full shrink-0"')
    expect(out).toContain('className="flex min-h-screen w-full"')
  })

  it('transforms the main return, not an early pre-mount return', () => {
    const src = [
      'export default function Clock() {',
      '  if (!mounted) {',
      '    return (',
      '      <div className="relative flex h-full w-full" />',
      '    )',
      '  }',
      '  return (',
      '    <div className="relative flex h-full w-full">tick</div>',
      '  )',
      '}',
    ].join('\n')
    const out = transformRootHeightClass(src)
    expect(out.indexOf('min-h-screen')).toBeGreaterThan(out.indexOf('  return ('))
    expect(out.match(/min-h-screen/g)).toHaveLength(1)
  })

  it('falls back to the first JSX return when none sits two spaces in', () => {
    const src = 'export default function A() {\n    return (\n      <div className="h-full" />\n    )\n}'
    expect(transformRootHeightClass(src)).toContain('className="min-h-screen"')
  })
})
