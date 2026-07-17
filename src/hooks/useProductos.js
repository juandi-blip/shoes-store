import { useMemo } from 'react'
import productosData from '../data/productos.json'

/**
 * Filtra y ordena una lista de productos según los criterios del catálogo.
 * Función pura — sin dependencias de React — portada de js/catalogo.js.
 * @param {Array<object>} productos
 * @param {{generos: string[], categorias: string[], precioMax: number, soloOutlet: boolean, soloNovedad: boolean, busqueda?: string}} filtros
 * @param {'relevancia'|'precio-asc'|'precio-desc'|'nombre'|'novedades'} orden
 * @returns {Array<object>}
 */
export function filtrarYOrdenarProductos(productos, filtros, orden) {
  const { generos, categorias, precioMax, soloOutlet, soloNovedad, busqueda = '' } = filtros
  const textoBusqueda = busqueda.trim().toLowerCase()

  const filtrados = productos.filter((p) => {
    if (generos.length > 0 && !generos.includes(p.genero)) return false
    if (p.precio > precioMax) return false
    if (soloOutlet && !p.outlet) return false
    if (soloNovedad && !p.novedad) return false
    if (categorias.length > 0) {
      const coincide = categorias.some(
        (cat) => p.proposito === cat || p.subcategoria === cat
      )
      if (!coincide) return false
    }
    if (textoBusqueda) {
      const coincideTexto = p.nombre.toLowerCase().includes(textoBusqueda) || p.marca.toLowerCase().includes(textoBusqueda)
      if (!coincideTexto) return false
    }
    return true
  })

  const ordenados = [...filtrados]
  switch (orden) {
    case 'precio-asc':
      ordenados.sort((a, b) => a.precio - b.precio)
      break
    case 'precio-desc':
      ordenados.sort((a, b) => b.precio - a.precio)
      break
    case 'nombre':
      ordenados.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      break
    case 'novedades':
      ordenados.sort((a, b) => (b.novedad ? 1 : 0) - (a.novedad ? 1 : 0))
      break
    default:
      ordenados.sort((a, b) => {
        if (a.novedad !== b.novedad) return b.novedad ? 1 : -1
        if (a.outlet !== b.outlet) return b.outlet ? 1 : -1
        return a.nombre.localeCompare(b.nombre, 'es')
      })
  }
  return ordenados
}

/**
 * Expone el catálogo completo de productos (dataset estático, memoizado).
 * @returns {{productos: Array<object>}}
 */
export function useProductos() {
  const productos = useMemo(() => productosData, [])
  return { productos }
}
