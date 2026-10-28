import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import DistanceMapSection from '../components/DistanceMapSection'

afterEach(cleanup)

describe('mapa de la plantilla', () => {
  it('muestra pendientes sin enlaces vacíos ni una ruta calculada ficticia', () => {
    render(<DistanceMapSection />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getAllByText('Ubicación pendiente')).toHaveLength(2)
    expect(screen.getByText('Distancia pendiente')).toBeVisible()
  })
  it('usa ubicaciones y distancia configuradas y rechaza protocolos inválidos', () => {
    render(<DistanceMapSection config={{
      point1: { label: 'Punto de ejemplo', link: ' https://example.com/mapa ' },
      point2: { label: 'Sin enlace seguro', link: 'javascript:alert(1)' }, kilometers: 0,
    }} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    for (const link of links) expect(link).toHaveAttribute('href', 'https://example.com/mapa')
    expect(screen.getByText('0')).toBeVisible()
    expect(screen.getByText(/no se calcula automáticamente/)).toBeVisible()
  })
})
