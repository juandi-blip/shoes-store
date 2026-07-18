import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EstadoPedidoPage from './EstadoPedidoPage'

describe('EstadoPedidoPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><EstadoPedidoPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Estado de tu Pedido' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><EstadoPedidoPage /></MemoryRouter>)
    expect(document.title).toBe('Estado de tu Pedido — Shoes Store')
  })
})
