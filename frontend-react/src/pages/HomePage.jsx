import { useMemo } from 'react'
import { useProductos } from '../hooks/useProductos'
import { filtrarYOrdenarProductos } from '../hooks/useProductos'
import ProductGrid from '../components/ProductGrid'

const SIN_FILTROS = { generos: [], categorias: [], precioMax: 100000, soloOutlet: false, soloNovedad: false }

/**
 * Página de inicio: destacados, novedades y outlet.
 */
export default function HomePage() {
  const { productos } = useProductos()

  const destacados = useMemo(
    () => filtrarYOrdenarProductos(productos, SIN_FILTROS, 'relevancia').slice(0, 8),
    [productos]
  )
  const novedades = useMemo(
    () => filtrarYOrdenarProductos(productos, { ...SIN_FILTROS, soloNovedad: true }, 'novedades').slice(0, 8),
    [productos]
  )
  const outlet = useMemo(
    () => filtrarYOrdenarProductos(productos, { ...SIN_FILTROS, soloOutlet: true }, 'precio-asc').slice(0, 8),
    [productos]
  )

  return (
    <main className="home-page">
      <section className="home-section">
        <h2>Destacados</h2>
        <ProductGrid productos={destacados} />
      </section>
      <section className="home-section">
        <h2>Novedades ✨</h2>
        <ProductGrid productos={novedades} />
      </section>
      <section className="home-section">
        <h2>Outlet</h2>
        <ProductGrid productos={outlet} />
      </section>
    </main>
  )
}
