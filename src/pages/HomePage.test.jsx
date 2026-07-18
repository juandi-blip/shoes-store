import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import HomePage from './HomePage'

// GSAP/ScrollTrigger depende de layout real del DOM (offsets, viewport)
// que jsdom no simula, así que no se prueba el scrub/easing en sí — solo
// que la estructura del hero (imagen, overlay, contenido) está presente.
//
// jsdom no implementa window.matchMedia por defecto; useHeroScrollEffect lo
// llama al montar (mismo criterio que ProductCard.jsx), así que se stubea
// aquí igual que en useHeroScrollEffect.test.jsx.
beforeEach(() => {
  vi.stubGlobal('matchMedia', (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
}

describe('HomePage — hero con scroll', () => {
  it('renderiza la imagen del sneaker con overlay y el bloque de contenido', () => {
    renderHomePage()
    const seccion = document.querySelector('.hero-scroll')
    expect(seccion).toBeInTheDocument()
    expect(document.querySelector('.hero-scroll__img')).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600'
    )
    expect(document.querySelector('.hero-scroll__overlay')).toBeInTheDocument()
  })

  it('muestra el título, subtítulo y los CTA del hero', () => {
    renderHomePage()
    expect(screen.getByRole('heading', { level: 1, name: 'Eleva tu estilo' })).toBeInTheDocument()
    expect(screen.getByText(/Las sneakers más exclusivas del momento/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'COMPRAR AHORA' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'VER COLECCIÓN' })).toBeInTheDocument()
  })
})
