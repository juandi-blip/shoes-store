import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './Footer'

describe('Footer — enlaces', () => {
  it('ningún enlace de las columnas Ayuda o Shoes Store queda como placeholder "#"', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    const enlaces = [
      'Estado de Pedido',
      'Envíos y Entregas',
      'Devoluciones',
      'Opciones de Pago',
      'Contacto',
      'Nuestra Historia',
      'Sostenibilidad',
      'Tiendas Físicas',
      'Trabaja con Nosotros',
      'Shoes Store App',
    ]
    enlaces.forEach((texto) => {
      const link = screen.getByRole('link', { name: texto })
      expect(link.getAttribute('href')).not.toBe('#')
      expect(link.getAttribute('href')).toMatch(/^\//)
    })
  })

  it('los enlaces legales del pie apuntan a rutas reales', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Términos de Uso' }).getAttribute('href')).toBe('/legal/terminos')
    expect(screen.getByRole('link', { name: 'Política de Privacidad' }).getAttribute('href')).toBe('/legal/privacidad')
    expect(screen.getByRole('link', { name: 'Aviso Legal' }).getAttribute('href')).toBe('/legal/aviso-legal')
  })
})
