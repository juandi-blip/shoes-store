/**
 * Datos de los mega-menús del header, portados del index.html original.
 * Cada entrada define los pilares (columnas) con sus enlaces y, salvo
 * "deporte", una tarjeta promocional a la derecha.
 */
export const MEGA_MENUS = {
  mujer: {
    pillars: [
      {
        title: 'Lifestyle',
        links: [
          { label: 'Originals / Classics', sub: 'Modelos Icónicos', to: '/catalogo?genero=mujer&subcategoria=originals' },
          { label: 'Casual / Streetwear', to: '/catalogo?genero=mujer&subcategoria=casual' },
          { label: 'Platform / Bold', to: '/catalogo?genero=mujer&proposito=lifestyle' },
          { label: 'Novedades Lifestyle', to: '/catalogo?genero=mujer&proposito=lifestyle' },
        ],
      },
      {
        title: 'Performance',
        links: [
          { label: 'Running (Carrera)', to: '/catalogo?genero=mujer&proposito=running' },
          { label: 'Basketball', to: '/catalogo?genero=mujer&proposito=basketball' },
          { label: 'Entrenamiento / Gym', to: '/catalogo?genero=mujer&proposito=entrenamiento' },
          { label: 'Fútbol / Soccer', to: '/catalogo?genero=mujer&proposito=futbol' },
          { label: 'Novedades Performance', to: '/catalogo?genero=mujer&novedad=true' },
        ],
      },
      {
        title: 'Colecciones & Destacados',
        links: [
          { label: 'Novedades', to: '/catalogo?novedad=true' },
          { label: 'Sostenibilidad (Eco-Friendly)', to: '/catalogo?genero=mujer' },
          { label: 'Exclusivos / Colaboraciones', to: '/catalogo?genero=mujer' },
          { label: 'Más Vendidos', to: '/catalogo?genero=mujer' },
          { label: 'OUTLET', to: '/catalogo?outlet=true', outlet: true },
        ],
      },
    ],
    promo: { title: 'Nueva Colección Mujer', sub: 'Primavera 2026', to: '/catalogo?genero=mujer&novedad=true' },
  },
  hombre: {
    pillars: [
      {
        title: 'Lifestyle',
        links: [
          { label: 'Originals / Classics', sub: 'Modelos Icónicos', to: '/catalogo?genero=hombre&subcategoria=originals' },
          { label: 'Casual / Streetwear', to: '/catalogo?genero=hombre&subcategoria=casual' },
          { label: 'Platform / Bold', to: '/catalogo?genero=hombre&proposito=lifestyle' },
          { label: 'Novedades Lifestyle', to: '/catalogo?genero=hombre&proposito=lifestyle' },
        ],
      },
      {
        title: 'Performance',
        links: [
          { label: 'Running (Carrera)', to: '/catalogo?genero=hombre&proposito=running' },
          { label: 'Basketball', to: '/catalogo?genero=hombre&proposito=basketball' },
          { label: 'Entrenamiento / Gym', to: '/catalogo?genero=hombre&proposito=entrenamiento' },
          { label: 'Fútbol / Soccer', to: '/catalogo?genero=hombre&proposito=futbol' },
          { label: 'Novedades Performance', to: '/catalogo?genero=hombre&novedad=true' },
        ],
      },
      {
        title: 'Colecciones & Destacados',
        links: [
          { label: 'Novedades', to: '/catalogo?novedad=true' },
          { label: 'Sostenibilidad (Eco-Friendly)', to: '/catalogo?genero=hombre' },
          { label: 'Exclusivos / Colaboraciones', to: '/catalogo?genero=hombre' },
          { label: 'Más Vendidos', to: '/catalogo?genero=hombre' },
          { label: 'OUTLET', to: '/catalogo?outlet=true', outlet: true },
        ],
      },
    ],
    promo: { title: 'Lanzamiento Exclusivo', sub: 'Solo en Shoes Store', to: '/catalogo?genero=hombre&novedad=true' },
  },
  ninos: {
    pillars: [
      {
        title: 'Lifestyle',
        links: [
          { label: 'Casual / Streetwear', to: '/catalogo?genero=ninos&subcategoria=casual' },
          { label: 'Novedades', to: '/catalogo?genero=ninos&novedad=true' },
        ],
      },
      {
        title: 'Performance',
        links: [
          { label: 'Running', to: '/catalogo?genero=ninos&proposito=running' },
          { label: 'Basketball', to: '/catalogo?genero=ninos&proposito=basketball' },
          { label: 'Fútbol / Soccer', to: '/catalogo?genero=ninos&proposito=futbol' },
        ],
      },
      {
        title: 'Destacados',
        links: [
          { label: 'Más Vendidos', to: '/catalogo?genero=ninos' },
          { label: 'OUTLET', to: '/catalogo?outlet=true', outlet: true },
        ],
      },
    ],
    promo: { title: 'Back to School', sub: 'Colección Infantil', to: '/catalogo?genero=ninos' },
  },
  deporte: {
    sport: true,
    pillars: [
      {
        title: 'Running',
        links: [
          { label: 'Competencia', to: '/catalogo?proposito=running' },
          { label: 'Entrenamiento', to: '/catalogo?proposito=entrenamiento' },
          { label: 'Trail', to: '/catalogo?proposito=running' },
          { label: 'Novedades Running', to: '/catalogo?proposito=running&novedad=true' },
        ],
      },
      {
        title: 'Basketball',
        links: [
          { label: 'Performance', to: '/catalogo?proposito=basketball' },
          { label: 'Lifestyle', to: '/catalogo?proposito=lifestyle' },
          { label: 'Signature Series', to: '/catalogo?proposito=basketball' },
        ],
      },
      {
        title: 'Entrenamiento',
        links: [
          { label: 'CrossFit / Gym', to: '/catalogo?proposito=entrenamiento' },
          { label: 'HIIT', to: '/catalogo?proposito=entrenamiento' },
          { label: 'Outdoor', to: '/catalogo?proposito=entrenamiento' },
        ],
      },
      {
        title: 'Fútbol',
        links: [
          { label: 'Terreno Firme', to: '/catalogo?proposito=futbol' },
          { label: 'Terreno Artificial', to: '/catalogo?proposito=futbol' },
          { label: 'Indoor / Sala', to: '/catalogo?proposito=futbol' },
          { label: 'Novedades Fútbol', to: '/catalogo?proposito=futbol&novedad=true' },
        ],
      },
    ],
  },
}

/** Orden de los ítems del nav principal que abren mega-menú. */
export const NAV_MEGA = [
  { id: 'mujer', label: 'MUJER', to: '/catalogo?genero=mujer' },
  { id: 'hombre', label: 'HOMBRE', to: '/catalogo?genero=hombre' },
  { id: 'ninos', label: 'NIÑOS', to: '/catalogo?genero=ninos' },
  { id: 'deporte', label: 'DEPORTE', to: '/catalogo?proposito=deporte' },
]
