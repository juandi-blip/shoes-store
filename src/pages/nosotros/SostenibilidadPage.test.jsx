import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SostenibilidadPage from './SostenibilidadPage'

describe('SostenibilidadPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><SostenibilidadPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Sostenibilidad' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><SostenibilidadPage /></MemoryRouter>)
    expect(document.title).toBe('Sostenibilidad — Shoes Store')
  })
})
