import { Link } from 'react-router-dom'
import { useState, useRef, memo } from 'react'
import { imagenFallback } from '../utils/imagenes'

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

/** ¿El usuario prefiere reducir el movimiento? (evaluado por evento, no en render) */
function prefiereMenosMovimiento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Tarjeta individual de producto usada en grids de catálogo y home.
 * Efecto "vitrina 3D": la card se inclina siguiendo el cursor escribiendo
 * las variables CSS --rx/--ry que consume glamour.css (solo punteros finos,
 * desactivado con prefers-reduced-motion). Memoizada para no repintar en
 * cada cambio de filtro.
 * @param {{producto: object}} props
 */
function ProductCard({ producto }) {
  const etiquetaBadge = obtenerEtiquetaBadge(producto)
  const [imgSrc, setImgSrc] = useState(producto.imagen || imagenFallback(producto))
  const rafRef = useRef(0)

  function manejarTilt(e) {
    if (prefiereMenosMovimiento()) return
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${((py - 0.5) * -7).toFixed(2)}deg`)
      el.style.setProperty('--ry', `${((px - 0.5) * 9).toFixed(2)}deg`)
    })
  }

  function reiniciarTilt(e) {
    cancelAnimationFrame(rafRef.current)
    e.currentTarget.style.removeProperty('--rx')
    e.currentTarget.style.removeProperty('--ry')
  }

  return (
    <Link
      to={`/producto/${producto.id}`}
      className="product-card"
      onPointerMove={manejarTilt}
      onPointerLeave={reiniciarTilt}
    >
      {etiquetaBadge && <span className="card-badge">{etiquetaBadge}</span>}
      <div className="card-image-wrap">
        {/* width/height explícitos: el navegador reserva el espacio y evita CLS (el CSS los hace fluidos) */}
        <img
          src={imgSrc}
          alt={producto.nombre}
          width="300"
          height="300"
          loading="lazy"
          onError={() => setImgSrc(imagenFallback(producto))}
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

export default memo(ProductCard)
