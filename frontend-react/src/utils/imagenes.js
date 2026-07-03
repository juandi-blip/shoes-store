/**
 * Utilidades de imágenes de producto.
 *
 * El dataset (productos.json) referencia CDNs externos y varios enlaces han
 * muerto (hotlink-protection o rotación de catálogo del CDN). En vez de un
 * "Sin imagen" genérico, generamos un placeholder SVG determinista con la
 * marca y el modelo del producto, con la misma estética oscura del sitio.
 * Sin dependencias externas: funciona offline y nunca se rompe.
 */

/** Escapa texto para incrustarlo en el SVG del data URI. */
function escaparSvg(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
}

/**
 * Placeholder SVG (data URI) personalizado con marca y nombre del producto.
 * @param {{marca?: string, nombre?: string}} producto
 * @returns {string} data URI listo para usar en src
 */
export function imagenFallback(producto = {}) {
  const marca = escaparSvg((producto.marca || 'SHOES.STORE').toUpperCase())
  const nombre = escaparSvg(producto.nombre || 'Imagen no disponible')
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='660' height='660' viewBox='0 0 660 660'>` +
    `<rect width='660' height='660' fill='#161616'/>` +
    `<rect x='24' y='24' width='612' height='612' rx='24' fill='none' stroke='#2a2a2a' stroke-width='2'/>` +
    `<text x='50%' y='45%' text-anchor='middle' fill='#3d3d3d' font-family='Poppins,system-ui,sans-serif' font-size='52' font-weight='700' letter-spacing='6'>${marca}</text>` +
    `<text x='50%' y='54%' text-anchor='middle' fill='#565656' font-family='Poppins,system-ui,sans-serif' font-size='26' font-weight='500'>${nombre}</text>` +
    `<text x='50%' y='63%' text-anchor='middle' fill='#3d3d3d' font-family='Poppins,system-ui,sans-serif' font-size='16'>Imagen no disponible</text>` +
    `</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
