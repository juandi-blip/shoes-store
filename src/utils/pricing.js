/**
 * Reglas de negocio de precio y envío (mock, sin backend).
 * Única fuente de verdad compartida entre CarritoPage y PagoPage.
 */

export const TASA_COP = 4200
export const ENVIO_GRATIS_DESDE_COP = 200000
export const COSTO_ENVIO_COP = 15000

/** Costo de envío en COP: gratis sobre el umbral o con carrito vacío. */
export function calcularEnvioCOP(totalCOP, cantidadLineas) {
  if (cantidadLineas === 0) return 0
  return totalCOP >= ENVIO_GRATIS_DESDE_COP ? 0 : COSTO_ENVIO_COP
}
