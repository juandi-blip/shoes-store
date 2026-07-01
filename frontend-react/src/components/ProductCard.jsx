import { Link } from 'react-router-dom'

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' fill='%23555' font-family='Poppins,sans-serif' font-size='14'%3ESin imagen%3C/text%3E%3C/svg%3E"

function formatearPrecio(precio) {
  const valor = typeof precio === 'number' ? precio : Number(precio)
  if (!Number.isFinite(valor) || valor <= 0) return 'No disponible'
  return '$' + valor.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

/**
 * Tarjeta individual de producto usada en grids de catálogo y home.
 * @param {{producto: object}} props
 */
export default function ProductCard({ producto }) {
  return (
    <Link to={`/producto/${producto.id}`} className="product-card">
      {producto.novedad && <span className="product-badge product-badge--new">Nuevo</span>}
      {producto.outlet && <span className="product-badge product-badge--outlet">Outlet</span>}
      <img
        src={producto.imagen || PLACEHOLDER_IMG}
        alt={producto.nombre}
        loading="lazy"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
      />
      <div className="product-card__info">
        <p className="product-card__brand">{producto.marca}</p>
        <h3 className="product-card__name">{producto.nombre}</h3>
        <p className="product-card__price">{formatearPrecio(producto.precio)}</p>
      </div>
    </Link>
  )
}
