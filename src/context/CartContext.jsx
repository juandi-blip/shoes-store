import { createContext, useContext, useState, useEffect } from 'react'
import productosData from '../data/productos.json'

/**
 * Carrito de compras (mock, sin backend).
 *
 * Diseño con seguridad en mente:
 *  - En localStorage solo se guardan {id, talla, cantidad}: los PRECIOS se
 *    derivan siempre del dataset. Así, manipular el storage desde DevTools
 *    no puede alterar el total a pagar (anti price-tampering).
 *  - Al cargar, cada entrada se valida contra el catálogo: id existente,
 *    talla disponible para ese producto y cantidad acotada 1–10. Entradas
 *    corruptas o inyectadas se descartan en silencio.
 *  - JSON.parse va protegido con try/catch: un storage corrupto no puede
 *    tumbar la aplicación (anti DoS por datos malformados).
 */

const CLAVE_STORAGE = 'shoesStore_carrito'
const CANTIDAD_MAX = 10

/** Valida y normaliza lo leído del storage contra el catálogo real. */
function sanearItems(crudo) {
  if (!Array.isArray(crudo)) return []
  const saneados = []
  for (const item of crudo) {
    if (!item || typeof item !== 'object') continue
    const producto = productosData.find((p) => p.id === item.id)
    if (!producto) continue
    const talla = Number(item.talla)
    if (!producto.tallas.includes(talla)) continue
    const cantidad = Math.min(CANTIDAD_MAX, Math.max(1, Math.trunc(Number(item.cantidad) || 1)))
    // Fusiona duplicados id+talla en una sola línea
    const existente = saneados.find((s) => s.id === producto.id && s.talla === talla)
    if (existente) {
      existente.cantidad = Math.min(CANTIDAD_MAX, existente.cantidad + cantidad)
    } else {
      saneados.push({ id: producto.id, talla, cantidad })
    }
  }
  return saneados
}

function cargarCarrito() {
  try {
    return sanearItems(JSON.parse(localStorage.getItem(CLAVE_STORAGE) ?? '[]'))
  } catch {
    return []
  }
}

const CartContext = createContext(null)

/** Provee el estado del carrito (persistido en localStorage) a toda la app. */
export function CartProvider({ children }) {
  const [items, setItems] = useState(cargarCarrito)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items))
    } catch {
      /* storage lleno o bloqueado: el carrito sigue funcionando en memoria */
    }
  }, [items])

  function agregarItem(id, talla, cantidad = 1) {
    setItems((previos) => sanearItems([...previos, { id, talla, cantidad }]))
  }

  function actualizarCantidad(id, talla, cantidad) {
    setItems((previos) =>
      sanearItems(
        previos.map((item) =>
          item.id === id && item.talla === talla ? { ...item, cantidad } : item
        )
      )
    )
  }

  function quitarItem(id, talla) {
    setItems((previos) => previos.filter((item) => !(item.id === id && item.talla === talla)))
  }

  function vaciarCarrito() {
    setItems([])
  }

  // Enriquecidos con datos del catálogo (precio SIEMPRE del dataset)
  const lineas = items
    .map((item) => {
      const producto = productosData.find((p) => p.id === item.id)
      return producto ? { ...item, producto, subtotal: producto.precio * item.cantidad } : null
    })
    .filter(Boolean)

  const totalUnidades = lineas.reduce((acc, l) => acc + l.cantidad, 0)
  const totalPrecio = lineas.reduce((acc, l) => acc + l.subtotal, 0)

  return (
    <CartContext.Provider
      value={{ lineas, totalUnidades, totalPrecio, agregarItem, actualizarCantidad, quitarItem, vaciarCarrito }}
    >
      {children}
    </CartContext.Provider>
  )
}

/** Hook de acceso al carrito. */
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
