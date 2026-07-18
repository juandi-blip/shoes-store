import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ContactoPage from './ContactoPage'

describe('ContactoPage', () => {
  it('renderiza el título y los datos de contacto', () => {
    render(<MemoryRouter><ContactoPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Contáctanos' })).toBeInTheDocument()
    expect(screen.getByText('contacto@shoesstore.com.co')).toBeInTheDocument()
    expect(screen.getByText('+57 601 743 2891')).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><ContactoPage /></MemoryRouter>)
    expect(document.title).toBe('Contáctanos — Shoes Store')
  })
})
