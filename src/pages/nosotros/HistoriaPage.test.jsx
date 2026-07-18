import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HistoriaPage from './HistoriaPage'

describe('HistoriaPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><HistoriaPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Nuestra Historia' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><HistoriaPage /></MemoryRouter>)
    expect(document.title).toBe('Nuestra Historia — Shoes Store')
  })
})
