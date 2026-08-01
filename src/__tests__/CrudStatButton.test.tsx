import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CrudStatButton from '../components/centro-universo/CrudStatButton'

describe('CrudStatButton', () => {
  it('renders value and label', () => {
    render(
      <CrudStatButton filter="all" value={42} label="Total" activeFilter="all" onClick={() => {}} />
    )
    expect(screen.getByText('42')).toBeDefined()
    expect(screen.getByText('Total')).toBeDefined()
  })

  it('has is-active class when filter matches', () => {
    const { container } = render(
      <CrudStatButton filter="all" value={10} label="All" activeFilter="all" onClick={() => {}} />
    )
    const button = container.querySelector('button')
    expect(button?.className).toContain('is-active')
  })

  it('does not have is-active class when filter differs', () => {
    const { container } = render(
      <CrudStatButton filter="hidden" value={5} label="Hidden" activeFilter="all" onClick={() => {}} />
    )
    const button = container.querySelector('button')
    expect(button?.className).not.toContain('is-active')
  })

  it('calls onClick with filter value', () => {
    const handleClick = vi.fn()
    render(
      <CrudStatButton filter="overridden" value={3} label="Edited" activeFilter="all" onClick={handleClick} />
    )
    fireEvent.click(screen.getByText('3'))
    expect(handleClick).toHaveBeenCalledWith('overridden')
  })
})
