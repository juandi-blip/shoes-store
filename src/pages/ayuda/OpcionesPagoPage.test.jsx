import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OpcionesPagoPage from './OpcionesPagoPage'

describe('OpcionesPagoPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><OpcionesPagoPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Opciones de Pago' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><OpcionesPagoPage /></MemoryRouter>)
    expect(document.title).toBe('Opciones de Pago — Shoes Store')
  })
})
