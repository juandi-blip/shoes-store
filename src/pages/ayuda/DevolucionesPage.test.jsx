import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DevolucionesPage from './DevolucionesPage'

describe('DevolucionesPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><DevolucionesPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Devoluciones y Cambios' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><DevolucionesPage /></MemoryRouter>)
    expect(document.title).toBe('Devoluciones y Cambios — Shoes Store')
  })
})
