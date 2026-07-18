import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import '@testing-library/jest-dom'
import { SessionProvider } from '../context/SessionContext'
import { CartProvider } from '../context/CartContext'
import Navbar from './Navbar'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location-display">{location.pathname}{location.search}</div>
}

function renderNavbar() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <SessionProvider>
        <CartProvider>
          <Navbar />
          <LocationDisplay />
        </CartProvider>
      </SessionProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('Navbar — búsqueda', () => {
  it('escribir un texto y enviar el formulario navega a /catalogo?q=<texto>', () => {
    renderNavbar()
    fireEvent.click(screen.getByLabelText('Buscar'))
    const input = screen.getByPlaceholderText('Buscar productos…')
    fireEvent.change(input, { target: { value: 'nike air' } })
    fireEvent.submit(input.closest('form'))
    expect(screen.getByTestId('location-display')).toHaveTextContent('/catalogo?q=nike%20air')
  })

  it('el panel de búsqueda se cierra después de enviar', () => {
    renderNavbar()
    fireEvent.click(screen.getByLabelText('Buscar'))
    const input = screen.getByPlaceholderText('Buscar productos…')
    fireEvent.change(input, { target: { value: 'vans' } })
    fireEvent.submit(input.closest('form'))
    expect(screen.queryByPlaceholderText('Buscar productos…')).not.toBeInTheDocument()
  })
})

describe('Navbar — mega-menú por teclado', () => {
  it('enfocar el link del trigger abre el mega-menú (clase active en el <li>)', () => {
    renderNavbar()
    const link = screen.getByRole('link', { name: 'MUJER' })
    fireEvent.focus(link)
    expect(link.closest('li')).toHaveClass('active')
  })

  it('Escape cierra el mega-menú abierto', () => {
    renderNavbar()
    const link = screen.getByRole('link', { name: 'MUJER' })
    fireEvent.focus(link)
    expect(link.closest('li')).toHaveClass('active')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(link.closest('li')).not.toHaveClass('active')
  })
})

describe('Navbar — mega-menú promo', () => {
  it('cada mega-menú con promo usa una imagen distinta según género', () => {
    renderNavbar()
    const imgMujer = screen.getByAltText('Nueva Colección Mujer')
    const imgHombre = screen.getByAltText('Lanzamiento Exclusivo')
    const imgNinos = screen.getByAltText('Back to School')
    const srcs = [imgMujer.src, imgHombre.src, imgNinos.src]
    expect(new Set(srcs).size).toBe(3)
  })
})
