import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProductos, filtrarYOrdenarProductos } from '../hooks/useProductos'
import ProductGrid from '../components/ProductGrid'

const PRECIO_MAX_GLOBAL = 300

/**
 * Página de catálogo con filtros de sidebar (género, categoría, precio,
 * outlet, novedad) y selector de orden, sincronizados con la URL.
 */
export default function CatalogoPage() {
  const { productos } = useProductos()
  const [searchParams] = useSearchParams()

  const generoUrl = searchParams.get('genero')
  const propositoUrl = searchParams.get('proposito')
  const novedadUrl = searchParams.get('novedad') === 'true'
  const outletUrl = searchParams.get('outlet') === 'true'

  const [generos, setGeneros] = useState(() => (generoUrl ? [generoUrl === 'ninos' ? 'nino' : generoUrl] : []))
  const [categorias, setCategorias] = useState(() => (propositoUrl ? [propositoUrl] : []))
  const [precioMax, setPrecioMax] = useState(PRECIO_MAX_GLOBAL)
  const [soloOutlet, setSoloOutlet] = useState(outletUrl)
  const [soloNovedad, setSoloNovedad] = useState(novedadUrl)
  const [orden, setOrden] = useState('relevancia')

  useEffect(() => {
    setGeneros(generoUrl ? [generoUrl === 'ninos' ? 'nino' : generoUrl] : [])
    setCategorias(propositoUrl ? [propositoUrl] : [])
    setSoloOutlet(outletUrl)
    setSoloNovedad(novedadUrl)
  }, [generoUrl, propositoUrl, outletUrl, novedadUrl])

  const productosFiltrados = useMemo(
    () => filtrarYOrdenarProductos(productos, { generos, categorias, precioMax, soloOutlet, soloNovedad }, orden),
    [productos, generos, categorias, precioMax, soloOutlet, soloNovedad, orden]
  )

  function alternarGenero(valor) {
    setGeneros((prev) => (prev.includes(valor) ? prev.filter((g) => g !== valor) : [...prev, valor]))
  }

  function alternarCategoria(valor) {
    setCategorias((prev) => (prev.includes(valor) ? prev.filter((c) => c !== valor) : [...prev, valor]))
  }

  return (
    <main>
      <div className="catalog-page">
        <aside className="catalog-sidebar">
          <div className="sidebar-section">
            <h4 className="sidebar-title">Género</h4>
            {[['hombre', 'Hombre'], ['mujer', 'Mujer'], ['nino', 'Niños']].map(([valor, etiqueta]) => (
              <label className="filter-check" key={valor}>
                <input
                  type="checkbox"
                  checked={generos.includes(valor)}
                  onChange={() => alternarGenero(valor)}
                />
                {etiqueta}
              </label>
            ))}
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-title">Precio</h4>
            <div className="price-range-wrap">
              <div className="price-display">
                <span>$0</span>
                <span>${precioMax}</span>
              </div>
              <input
                type="range"
                className="price-range"
                min="0"
                max={PRECIO_MAX_GLOBAL}
                step="5"
                value={precioMax}
                onChange={(e) => setPrecioMax(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-title">Categoría</h4>
            {[
              ['lifestyle', 'Lifestyle'],
              ['running', 'Running'],
              ['basketball', 'Basketball'],
              ['entrenamiento', 'Entrenamiento'],
              ['futbol', 'Fútbol'],
            ].map(([valor, etiqueta]) => (
              <label className="filter-check" key={valor}>
                <input
                  type="checkbox"
                  checked={categorias.includes(valor)}
                  onChange={() => alternarCategoria(valor)}
                />
                {etiqueta}
              </label>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="toggle-row">
              <span className="toggle-label toggle-label--outlet">Solo Outlet</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={soloOutlet} onChange={(e) => setSoloOutlet(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="toggle-row">
              <span className="toggle-label">Solo Novedades</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={soloNovedad} onChange={(e) => setSoloNovedad(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </aside>

        <section className="catalog-main">
          <div className="catalog-toolbar">
            <span className="catalog-count">{productosFiltrados.length} productos</span>
            <select
              className="sort-select"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
              <option value="novedades">Novedades primero</option>
            </select>
          </div>
          <ProductGrid productos={productosFiltrados} />
        </section>
      </div>
    </main>
  )
}
