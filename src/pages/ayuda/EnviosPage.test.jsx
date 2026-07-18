import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EnviosPage from './EnviosPage'

describe('EnviosPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><EnviosPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Envíos y Entregas' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><EnviosPage /></MemoryRouter>)
    expect(document.title).toBe('Envíos y Entregas — Shoes Store')
  })
})
