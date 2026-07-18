import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppPage from './AppPage'

describe('AppPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><AppPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Shoes Store App' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><AppPage /></MemoryRouter>)
    expect(document.title).toBe('Shoes Store App — Shoes Store')
  })
})
