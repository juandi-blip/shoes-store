import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import PagoPage from './PagoPage'
import productos from '../data/productos.json'

const CLAVE = 'shoesStore_carrito'
const p = productos[0]
const talla = p.tallas[0]

function renderPagoPage() {
  localStorage.setItem(CLAVE, JSON.stringify([{ id: p.id, talla, cantidad: 1 }]))
  return render(
    <MemoryRouter>
      <CartProvider>
        <PagoPage />
      </CartProvider>
    </MemoryRouter>
  )
}

function llenarFormularioValido() {
  fireEvent.change(screen.getByLabelText('Número de tarjeta'), { target: { value: '4111111111111111' } })
  fireEvent.change(screen.getByLabelText('Titular'), { target: { value: 'Juan Perez' } })
  fireEvent.change(screen.getByLabelText('Vence (MM/AA)'), { target: { value: '12/28' } })
  fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } })
}

beforeEach(() => {
  localStorage.clear()
})

describe('PagoPage — validación de formulario', () => {
  it('muestra error si el número de tarjeta es inválido', () => {
    renderPagoPage()
    llenarFormularioValido()
    fireEvent.change(screen.getByLabelText('Número de tarjeta'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /Pagar/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('Número de tarjeta inválido')
  })

  it('muestra error si el CVV es inválido', () => {
    renderPagoPage()
    llenarFormularioValido()
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: /Pagar/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('CVV inválido')
  })

  it('muestra error si el vencimiento no tiene formato MM/AA', () => {
    renderPagoPage()
    llenarFormularioValido()
    fireEvent.change(screen.getByLabelText('Vence (MM/AA)'), { target: { value: '13/99' } })
    fireEvent.click(screen.getByRole('button', { name: /Pagar/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('Vencimiento en formato MM/AA')
  })

  it('reactiva el botón de pago tras un intento inválido (el guard no lo deja bloqueado)', () => {
    renderPagoPage()
    llenarFormularioValido()
    fireEvent.change(screen.getByLabelText('Número de tarjeta'), { target: { value: '123' } })
    const boton = screen.getByRole('button', { name: /Pagar/ })
    fireEvent.click(boton)
    expect(screen.getByRole('alert')).toHaveTextContent('Número de tarjeta inválido')
    expect(boton).not.toBeDisabled()
  })

  it('confirma el pedido con datos válidos y vacía el carrito', () => {
    renderPagoPage()
    llenarFormularioValido()
    fireEvent.click(screen.getByRole('button', { name: /Pagar/ }))
    expect(screen.getByText('¡Pedido confirmado!')).toBeInTheDocument()
    expect(localStorage.getItem(CLAVE)).toBe(JSON.stringify([]))
  })
})
