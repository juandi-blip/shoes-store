import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext'
import productos from '../data/productos.json'

const CLAVE = 'shoesStore_carrito'
// Producto real del catálogo para las pruebas
const p = productos[0]
const talla = p.tallas[0]

function wrapper({ children }) {
  return <CartProvider>{children}</CartProvider>
}

beforeEach(() => {
  localStorage.clear()
})

describe('useCart — operaciones básicas', () => {
  it('inicia vacío', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.lineas).toEqual([])
    expect(result.current.totalPrecio).toBe(0)
  })

  it('agrega un producto y calcula el subtotal desde el dataset', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.agregarItem(p.id, talla, 2))
    expect(result.current.totalUnidades).toBe(2)
    expect(result.current.totalPrecio).toBe(p.precio * 2)
  })

  it('fusiona duplicados de id+talla y acota la cantidad a 10', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.agregarItem(p.id, talla, 8))
    act(() => result.current.agregarItem(p.id, talla, 8))
    expect(result.current.lineas).toHaveLength(1)
    expect(result.current.lineas[0].cantidad).toBe(10)
  })

  it('quita y vacía', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.agregarItem(p.id, talla, 1))
    act(() => result.current.quitarItem(p.id, talla))
    expect(result.current.lineas).toEqual([])
  })
})

describe('useCart — endurecimiento contra manipulación del storage', () => {
  it('descarta JSON corrupto sin lanzar', () => {
    localStorage.setItem(CLAVE, '{{{no-es-json')
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.lineas).toEqual([])
  })

  it('descarta productos inexistentes y tallas inválidas inyectados', () => {
    localStorage.setItem(CLAVE, JSON.stringify([
      { id: 'hack-999', talla: 9, cantidad: 1 },
      { id: p.id, talla: 999, cantidad: 1 },
    ]))
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.lineas).toEqual([])
  })

  it('acota cantidades absurdas inyectadas (anti-manipulación)', () => {
    localStorage.setItem(CLAVE, JSON.stringify([{ id: p.id, talla, cantidad: 99999 }]))
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.lineas[0].cantidad).toBe(10)
  })

  it('el precio nunca se lee del storage: siempre del catálogo', () => {
    // Un atacante escribe un precio falso en el storage: debe ignorarse
    localStorage.setItem(CLAVE, JSON.stringify([{ id: p.id, talla, cantidad: 1, precio: 0.01 }]))
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.totalPrecio).toBe(p.precio)
  })
})

describe('useCart — estabilidad de referencia (memoización)', () => {
  it('agregarItem, quitarItem y vaciarCarrito mantienen la misma identidad entre renders sin cambios', () => {
    const { result, rerender } = renderHook(() => useCart(), { wrapper })
    const agregarItemInicial = result.current.agregarItem
    const quitarItemInicial = result.current.quitarItem
    const vaciarCarritoInicial = result.current.vaciarCarrito

    rerender()

    expect(result.current.agregarItem).toBe(agregarItemInicial)
    expect(result.current.quitarItem).toBe(quitarItemInicial)
    expect(result.current.vaciarCarrito).toBe(vaciarCarritoInicial)
  })

  it('el value completo mantiene la misma identidad entre renders sin cambios en el carrito', () => {
    const { result, rerender } = renderHook(() => useCart(), { wrapper })
    const valueInicial = result.current

    rerender()

    expect(result.current).toBe(valueInicial)
  })
})
