import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDocumentHead } from './useDocumentHead'

afterEach(() => {
  document.head
    .querySelectorAll(
      'meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]'
    )
    .forEach((el) => el.remove())
  document.title = ''
})

describe('useDocumentHead', () => {
  it('setea document.title y meta description', () => {
    renderHook(() =>
      useDocumentHead({ title: 'Título de prueba', description: 'Descripción de prueba', canonicalPath: '' })
    )
    expect(document.title).toBe('Título de prueba')
    expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe(
      'Descripción de prueba'
    )
  })

  it('setea el canonical con el path dado, sin barra final para la raíz', () => {
    renderHook(() => useDocumentHead({ title: 'Home', description: 'desc', canonicalPath: '' }))
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(
      'https://juandi-blip.github.io/shoes-store'
    )
  })

  it('setea el canonical con un path anidado', () => {
    renderHook(() => useDocumentHead({ title: 'Producto', description: 'desc', canonicalPath: 'producto/001' }))
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(
      'https://juandi-blip.github.io/shoes-store/producto/001'
    )
  })

  it('setea og:image y twitter:image solo si se pasa ogImage', () => {
    renderHook(() =>
      useDocumentHead({
        title: 'Producto',
        description: 'desc',
        ogImage: 'https://example.com/img.jpg',
        canonicalPath: 'producto/001',
      })
    )
    expect(document.querySelector('meta[property="og:image"]').getAttribute('content')).toBe(
      'https://example.com/img.jpg'
    )
    expect(document.querySelector('meta[name="twitter:image"]').getAttribute('content')).toBe(
      'https://example.com/img.jpg'
    )
  })

  it('no crea og:image ni twitter:image si no se pasa ogImage', () => {
    renderHook(() => useDocumentHead({ title: 'Home', description: 'desc', canonicalPath: '' }))
    expect(document.querySelector('meta[property="og:image"]')).toBeNull()
    expect(document.querySelector('meta[name="twitter:image"]')).toBeNull()
  })

  it('actualiza los tags existentes en vez de duplicarlos al re-renderizar con otro título', () => {
    const { rerender } = renderHook(
      ({ title }) => useDocumentHead({ title, description: 'desc', canonicalPath: '' }),
      { initialProps: { title: 'Uno' } }
    )
    rerender({ title: 'Dos' })
    expect(document.title).toBe('Dos')
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1)
  })
})
