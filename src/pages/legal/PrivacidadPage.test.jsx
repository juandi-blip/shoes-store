import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PrivacidadPage from './PrivacidadPage'

describe('PrivacidadPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><PrivacidadPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Política de Privacidad' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><PrivacidadPage /></MemoryRouter>)
    expect(document.title).toBe('Política de Privacidad — Shoes Store')
  })
})
