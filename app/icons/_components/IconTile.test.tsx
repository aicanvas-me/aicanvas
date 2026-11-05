// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { IconTile } from './IconTile'

afterEach(cleanup)

function renderTile() {
  const { container } = render(
    <IconTile
      icon={{ name: 'arrow-right', category: 'arrows', isNew: false }}
      markup='<path d="M4 12h16" />'
      size={24}
      weight="regular"
      colour="#F4F4FA"
      exportColour={null}
      style="line"
    />,
  )
  return container.querySelector('[data-icon-tile]')!
}

const copyButtons = () => screen.queryAllByRole('button', { name: /^Copy arrow-right/ })

describe('IconTile', () => {
  it('leaves a touch on the tile to the link, without revealing the copy buttons', () => {
    const tile = renderTile()
    fireEvent.pointerEnter(tile, { pointerType: 'touch' })
    expect(copyButtons()).toHaveLength(0)
    expect(screen.getByRole('link', { name: 'Open arrow-right details' })).toBeTruthy()
  })

  it('reveals the copy buttons for a mouse and hides them when it leaves', () => {
    const tile = renderTile()
    fireEvent.pointerEnter(tile, { pointerType: 'mouse' })
    expect(copyButtons()).toHaveLength(2)
    fireEvent.pointerLeave(tile, { pointerType: 'mouse' })
    expect(copyButtons()).toHaveLength(0)
  })
})
