import { describe, it, expect } from 'vitest'
import { TASA_COP, ENVIO_GRATIS_DESDE_COP, COSTO_ENVIO_COP, calcularEnvioCOP } from './pricing'

describe('calcularEnvioCOP', () => {
  it('cobra envío cuando el total está por debajo del umbral', () => {
    expect(calcularEnvioCOP(ENVIO_GRATIS_DESDE_COP - 1, 2)).toBe(COSTO_ENVIO_COP)
  })

  it('es gratis cuando el total es exactamente el umbral', () => {
    expect(calcularEnvioCOP(ENVIO_GRATIS_DESDE_COP, 2)).toBe(0)
  })

  it('es gratis cuando el total supera el umbral', () => {
    expect(calcularEnvioCOP(ENVIO_GRATIS_DESDE_COP + 50000, 2)).toBe(0)
  })

  it('es gratis cuando el carrito está vacío, sin importar el total', () => {
    expect(calcularEnvioCOP(0, 0)).toBe(0)
  })
})

describe('constantes', () => {
  it('expone la tasa de conversión y el umbral esperados', () => {
    expect(TASA_COP).toBe(4200)
    expect(ENVIO_GRATIS_DESDE_COP).toBe(200000)
    expect(COSTO_ENVIO_COP).toBe(15000)
  })
})
