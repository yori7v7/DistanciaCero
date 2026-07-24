import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProposalSection from '../components/ProposalSection'

// Mock the proposal JSON data
vi.mock('../data/proposal.json', () => ({
  default: {
    proposalDate: '2027-01-01T00:00:00Z',
    eyebrow: 'La Pregunta',
    title: '¿Quieres ser mi universo?',
    intro: 'Desde que te conocí...',
    beforeQuestion: 'Por eso te pregunto:',
    question: '¿Quieres compartir el resto de nuestras vidas?',
    yesButton: '¡Sí, quiero!',
    talkButton: 'Hablemos',
    yesTitle: '¡Dijo que sí!',
    yesMessage: 'El universo celebra.',
    talkMessage: 'Lo hablamos cuando quieras.',
    savedFooter: 'Respuesta guardada en tu corazón.'
  }
}))

const STORAGE_KEY = 'distancia-cero-proposal-answer'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-24T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ProposalSection', () => {
  it('renders the question when no answer saved', () => {
    render(<ProposalSection />)
    expect(screen.getByText('¿Quieres compartir el resto de nuestras vidas?')).toBeInTheDocument()
    expect(screen.getByText('¡Sí, quiero!')).toBeInTheDocument()
    expect(screen.getByText('Hablemos')).toBeInTheDocument()
  })

  it('shows countdown with remaining time', () => {
    render(<ProposalSection />)
    // Proposal date is 2027-01-01, current date is 2026-07-24
    expect(screen.getByText(/Faltan \d+ días/)).toBeInTheDocument()
  })

  it('shows accepted state when "Sí" is clicked', () => {
    render(<ProposalSection />)
    fireEvent.click(screen.getByText('¡Sí, quiero!'))
    expect(screen.getByText('¡Dijo que sí!')).toBeInTheDocument()
    expect(screen.getByText('El universo celebra.')).toBeInTheDocument()
    expect(screen.getByText('Oficialmente')).toBeInTheDocument()
  })

  it('shows talk state when "Hablemos" is clicked', () => {
    render(<ProposalSection />)
    fireEvent.click(screen.getByText('Hablemos'))
    expect(screen.getByText('Entonces lo hablamos bonito')).toBeInTheDocument()
    expect(screen.getByText('Lo hablamos cuando quieras.')).toBeInTheDocument()
  })

  it('persists answer to localStorage', () => {
    render(<ProposalSection />)
    fireEvent.click(screen.getByText('¡Sí, quiero!'))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.value).toBe('yes')
    expect(stored.answeredAt).toBeDefined()
  })

  it('allows resetting the answer from talk state', () => {
    render(<ProposalSection />)
    fireEvent.click(screen.getByText('Hablemos'))
    expect(screen.getByText('Entonces lo hablamos bonito')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Volver a la pregunta'))
    // Should show question again
    expect(screen.getByText('¿Quieres compartir el resto de nuestras vidas?')).toBeInTheDocument()
  })

  it('shows saved state on re-render when answer is in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value: 'yes', answeredAt: new Date().toISOString() }))
    render(<ProposalSection />)
    expect(screen.getByText('¡Dijo que sí!')).toBeInTheDocument()
  })

  it('shows expired countdown when proposal date has passed', () => {
    vi.setSystemTime(new Date('2027-06-01T12:00:00Z'))
    render(<ProposalSection />)
    expect(screen.getByText('Hoy este universo tiene una pregunta importante.')).toBeInTheDocument()
  })
})
