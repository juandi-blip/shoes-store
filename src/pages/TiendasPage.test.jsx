import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TiendasPage from './TiendasPage'

describe('TiendasPage', () => {
  it('renderiza el título y las dos ciudades', () => {
    render(<MemoryRouter><TiendasPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Tiendas Físicas' })).toBeInTheDocument()
    expect(screen.getByText(/Bogotá/)).toBeInTheDocument()
    expect(screen.getByText(/Medellín/)).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><TiendasPage /></MemoryRouter>)
    expect(document.title).toBe('Tiendas Físicas — Shoes Store')
  })
})
