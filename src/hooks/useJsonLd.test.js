import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useJsonLd } from './useJsonLd'

afterEach(() => {
  document.getElementById('jsonld-producto')?.remove()
})

describe('useJsonLd', () => {
  it('inyecta un script application/ld+json con el objeto serializado', () => {
    const data = { '@type': 'Product', name: 'Air Force 1' }
    renderHook(() => useJsonLd(data))
    const script = document.getElementById('jsonld-producto')
    expect(script).not.toBeNull()
    expect(script.type).toBe('application/ld+json')
    expect(JSON.parse(script.textContent)).toEqual(data)
  })

  it('no crea ningún script si el dato es null', () => {
    renderHook(() => useJsonLd(null))
    expect(document.getElementById('jsonld-producto')).toBeNull()
  })

  it('actualiza el contenido del script existente al cambiar el objeto', () => {
    const { rerender } = renderHook(({ data }) => useJsonLd(data), {
      initialProps: { data: { name: 'Uno' } },
    })
    rerender({ data: { name: 'Dos' } })
    const scripts = document.querySelectorAll('#jsonld-producto')
    expect(scripts).toHaveLength(1)
    expect(JSON.parse(scripts[0].textContent)).toEqual({ name: 'Dos' })
  })
})
