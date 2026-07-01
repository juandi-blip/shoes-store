import { Link } from 'react-router-dom'

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' fill='%23555' font-family='Poppins,sans-serif' font-size='14'%3ESin imagen%3C/text%3E%3C/svg%3E"

function formatearPrecio(precio) {
  const valor = typeof precio === 'number' ? precio : Number(precio)
  if (!Number.isFinite(valor) || valor <= 0) return 'No disponible'
  return '$' + valor.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function obtenerEtiquetaBadge(producto) {
  if (producto.outlet) return 'Outlet'
  if (producto.novedad) return 'Nuevo'
  return null
}

/**
 * Tarjeta individual de producto usada en grids de catálogo y home.
 * Reutiliza las clases .product-card / .card-* definidas en tienda1.css.
 * @param {{producto: object}} props
 */
export default function ProductCard({ producto }) {
  const etiquetaBadge = obtenerEtiquetaBadge(producto)

  return (
    <Link to={`/producto/${producto.id}`} className="product-card">
      {etiquetaBadge && <span className="card-badge">{etiquetaBadge}</span>}
      <div className="card-image-wrap">
        <img
          src={producto.imagen || PLACEHOLDER_IMG}
          alt={producto.nombre}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
        />
        <div className="card-overlay">
          <button className="card-overlay-btn" type="button">Ver producto</button>
        </div>
      </div>
      <div className="card-body">
        <h3>{producto.nombre}</h3>
        <p className="brand">{producto.marca}</p>
        <div className="card-bottom">
          <p className="colorway">{producto.colorway || ''}</p>
          <span className="price">{formatearPrecio(producto.precio)}</span>
        </div>
      </div>
    </Link>
  )
}
