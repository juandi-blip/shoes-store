import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AvisoLegalPage from './AvisoLegalPage'

describe('AvisoLegalPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><AvisoLegalPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Aviso Legal' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><AvisoLegalPage /></MemoryRouter>)
    expect(document.title).toBe('Aviso Legal — Shoes Store')
  })
})
