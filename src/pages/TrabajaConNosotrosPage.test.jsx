import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TrabajaConNosotrosPage from './TrabajaConNosotrosPage'

describe('TrabajaConNosotrosPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><TrabajaConNosotrosPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Trabaja con Nosotros' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><TrabajaConNosotrosPage /></MemoryRouter>)
    expect(document.title).toBe('Trabaja con Nosotros — Shoes Store')
  })
})
