import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TerminosPage from './TerminosPage'

describe('TerminosPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><TerminosPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Términos de Uso' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><TerminosPage /></MemoryRouter>)
    expect(document.title).toBe('Términos de Uso — Shoes Store')
  })
})
