import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CatalogoPage from './CatalogoPage'

function renderCatalogo(initialEntries = ['/catalogo']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <CatalogoPage />
    </MemoryRouter>
  )
}

function contadorActual() {
  return Number(screen.getByText(/productos$/).textContent.split(' ')[0])
}

describe('CatalogoPage — filtros', () => {
  it('sin filtros muestra los 80 productos del catálogo', () => {
    renderCatalogo()
    expect(contadorActual()).toBe(80)
  })

  it('togglear el checkbox de género "Hombre" reduce el conteo (40 productos)', () => {
    renderCatalogo()
    fireEvent.click(screen.getByLabelText('Hombre'))
    expect(contadorActual()).toBe(40)
  })

  it('el slider de precio máximo filtra los productos por encima del umbral', () => {
    renderCatalogo()
    const inicial = contadorActual()
    fireEvent.change(screen.getByLabelText('Precio máximo'), { target: { value: '50' } })
    expect(contadorActual()).toBeLessThan(inicial)
  })

  it('con ?q= en la URL inicial, muestra el mensaje de resultados de búsqueda', () => {
    renderCatalogo(['/catalogo?q=nike'])
    expect(screen.getByText(/Resultados para «nike»/)).toBeInTheDocument()
  })

  it('setea el título del documento según haya o no búsqueda activa', () => {
    renderCatalogo(['/catalogo?q=nike'])
    expect(document.title).toBe('Resultados para "nike" — Catálogo | Shoes Store')
  })
})
