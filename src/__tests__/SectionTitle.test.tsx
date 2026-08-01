import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionTitle from '../components/SectionTitle'

describe('SectionTitle', () => {
  it('renders eyebrow and title', () => {
    render(<SectionTitle eyebrow="Sección" title="Mi Título" />)
    expect(screen.getByText('Sección')).toBeDefined()
    expect(screen.getByText('Mi Título')).toBeDefined()
  })

  it('renders optional text paragraph', () => {
    render(<SectionTitle eyebrow="Eyebrow" title="Title" text="Description text" />)
    expect(screen.getByText('Description text')).toBeDefined()
  })

  it('does not render text paragraph when not provided', () => {
    const { container } = render(<SectionTitle eyebrow="Eyebrow" title="Title" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs.length).toBe(0)
  })

  it('renders eyebrow inside pill badge', () => {
    render(<SectionTitle eyebrow="UNIVERSO" title="Sistema Solar" />)
    const eyebrow = screen.getByText('UNIVERSO')
    // eyebrow text is inside the pill span
    expect(eyebrow.className).toContain('pill')
  })

  it('renders title as h2', () => {
    render(<SectionTitle eyebrow="Test" title="Heading" />)
    const heading = screen.getByText('Heading')
    expect(heading.tagName).toBe('H2')
  })
})
