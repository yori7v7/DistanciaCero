import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CounterSection from '../components/CounterSection'

// Mock siteConfig to control dates
vi.mock('../data/siteConfig.json', () => ({
  default: {
    dates: {
      metDate: '2024-01-15',
      relationshipStartDate: '2024-03-01',
      nextMeetingDate: '2026-12-25'
    }
  },
  couple: {
    mainPairName: 'Test Pair'
  }
}))

describe('CounterSection', () => {
  beforeEach(() => {
    // Freeze time to a known date for deterministic tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-22T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders all 4 counter cards', () => {
    const { container } = render(<CounterSection />)
    const cards = container.querySelectorAll('.glass-card')
    expect(cards.length).toBe(4)
  })

  it('renders counter section title', () => {
    render(<CounterSection />)
    expect(screen.getByText('Contadores del universo')).toBeDefined()
  })

  it('calculates days since met correctly', () => {
    render(<CounterSection />)
    // Jan 15 2024 → Jul 22 2026 = ~919 days
    expect(screen.getByText('919')).toBeDefined()
  })

  it('renders next meeting countdown', () => {
    render(<CounterSection />)
    // Should show days until Dec 25 2026 from Jul 22 2026 = ~156
    expect(screen.getByText('156')).toBeDefined()
  })
})
