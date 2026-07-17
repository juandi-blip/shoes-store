import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useProductos, filtrarYOrdenarProductos } from '../hooks/useProductos'
import { useDocumentHead } from '../hooks/useDocumentHead'
import ProductGrid from '../components/ProductGrid'

const PRECIO_MAX_GLOBAL = 300

function parseGeneros(searchParams) {
  const legado = searchParams.get('genero')
  if (!legado) return []
  return legado.split(',').map((g) => (g === 'ninos' ? 'nino' : g)).filter(Boolean)
}

function parseCategorias(searchParams) {
  const set = new Set()
  const categoria = searchParams.get('categoria')
  if (categoria) categoria.split(',').filter(Boolean).forEach((c) => set.add(c))
  const proposito = searchParams.get('proposito')
  if (proposito) set.add(proposito)
  const subcategoria = searchParams.get('subcategoria')
  if (subcategoria) set.add(subcategoria)
  return [...set]
}

/**
 * Página de catálogo con filtros de sidebar (género, categoría, precio,
 * outlet, novedad) y selector de orden. El estado de filtros vive en la URL
 * (query params), no en useState: así los enlaces del mega-menú y el botón
 * "atrás" del navegador funcionan, y los filtros son compartibles/enlazables.
 */
export default function CatalogoPage() {
  const { productos } = useProductos()
  const [searchParams, setSearchParams] = useSearchParams()

  // Memoizados sobre los strings crudos de la URL (no sobre `searchParams`,
  // que React Router entrega como instancia nueva en cada render): así
  // `generos`/`categorias` solo cambian de referencia cuando el usuario
  // realmente cambia esos filtros, y el useMemo de productosFiltrados de
  // abajo deja de recalcular en cada render.
  const generoParam = searchParams.get('genero')
  const categoriaParam = searchParams.get('categoria')
  const propositoParam = searchParams.get('proposito')
  const subcategoriaParam = searchParams.get('subcategoria')
  const qParam = searchParams.get('q') ?? ''
  useDocumentHead({
    title: qParam ? `Resultados para "${qParam}" — Catálogo | Shoes Store` : 'Catálogo | Shoes Store',
    description:
      'Explora nuestro catálogo completo de sneakers premium: hombre, mujer y niños, running, basketball, lifestyle y más.',
    canonicalPath: 'catalogo',
  })
  const generos = useMemo(() => parseGeneros(searchParams), [generoParam])
  const categorias = useMemo(() => parseCategorias(searchParams), [categoriaParam, propositoParam, subcategoriaParam])
  const precioMax = Number(searchParams.get('precio')) || PRECIO_MAX_GLOBAL
  const soloOutlet = searchParams.get('outlet') === 'true'
  const soloNovedad = searchParams.get('novedad') === 'true'
  const orden = searchParams.get('orden') || 'relevancia'

  /** Reescribe la URL a partir del estado de filtros dado (reemplaza claves heredadas del mega-menú). */
  function actualizarFiltros(cambios) {
    const siguiente = {
      generos, categorias, precioMax, soloOutlet, soloNovedad, orden,
      ...cambios,
    }
    const params = new URLSearchParams()
    if (siguiente.generos.length > 0) {
      params.set('genero', siguiente.generos.map((g) => (g === 'nino' ? 'ninos' : g)).join(','))
    }
    if (siguiente.categorias.length > 0) params.set('categoria', siguiente.categorias.join(','))
    if (siguiente.precioMax !== PRECIO_MAX_GLOBAL) params.set('precio', String(siguiente.precioMax))
    if (siguiente.soloOutlet) params.set('outlet', 'true')
    if (siguiente.soloNovedad) params.set('novedad', 'true')
    if (siguiente.orden !== 'relevancia') params.set('orden', siguiente.orden)
    setSearchParams(params, { replace: true })
  }

  const productosFiltrados = useMemo(
    () => filtrarYOrdenarProductos(productos, { generos, categorias, precioMax, soloOutlet, soloNovedad, busqueda: qParam }, orden),
    [productos, generos, categorias, precioMax, soloOutlet, soloNovedad, qParam, orden]
  )

  function alternarGenero(valor) {
    actualizarFiltros({ generos: generos.includes(valor) ? generos.filter((g) => g !== valor) : [...generos, valor] })
  }

  function alternarCategoria(valor) {
    actualizarFiltros({ categorias: categorias.includes(valor) ? categorias.filter((c) => c !== valor) : [...categorias, valor] })
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
                aria-label="Precio máximo"
                min="0"
                max={PRECIO_MAX_GLOBAL}
                step="5"
                value={precioMax}
                onChange={(e) => actualizarFiltros({ precioMax: Number(e.target.value) })}
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
                <input type="checkbox" checked={soloOutlet} onChange={(e) => actualizarFiltros({ soloOutlet: e.target.checked })} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="toggle-row">
              <span className="toggle-label">Solo Novedades</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={soloNovedad} onChange={(e) => actualizarFiltros({ soloNovedad: e.target.checked })} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </aside>

        <section className="catalog-main">
          {qParam && (
            <p className="catalog-search-info">
              Resultados para «{qParam}» · <Link to="/catalogo">Quitar</Link>
            </p>
          )}
          <div className="catalog-toolbar">
            <span className="catalog-count">{productosFiltrados.length} productos</span>
            <select
              className="sort-select"
              aria-label="Ordenar por"
              value={orden}
              onChange={(e) => actualizarFiltros({ orden: e.target.value })}
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
