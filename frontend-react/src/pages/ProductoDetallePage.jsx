import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProductos } from '../hooks/useProductos'
import { useCart } from '../context/CartContext'
import { imagenFallback } from '../utils/imagenes'
import Toast from '../components/Toast'

/** Tallas US mostradas siempre en el selector, igual que producto-detalle.js original. */
const TALLAS_US = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14]

const ACORDEON = [
  {
    titulo: 'Descripción del producto',
    contenido: (
      <>
        <p>
          Confeccionadas con materiales premium, estas sneakers ofrecen un rendimiento óptimo y un
          estilo inigualable para tu día a día o tus sesiones de entrenamiento más intensas.
        </p>
        <ul>
          <li>Silueta clásica reinventada</li>
          <li>Amortiguación reactiva en cada paso</li>
          <li>Suela exterior con tracción duradera</li>
        </ul>
      </>
    ),
  },
  {
    titulo: 'Detalles y cuidados',
    contenido: (
      <>
        <p>Para mantener tus sneakers en perfectas condiciones:</p>
        <ul>
          <li>Limpiar con un paño húmedo y suave.</li>
          <li>Evitar lavar en lavadora.</li>
          <li>Secar al aire lejos de fuentes de calor directo.</li>
          <li>Guardar en un lugar fresco y seco.</li>
        </ul>
      </>
    ),
  },
  {
    titulo: 'Envío y devoluciones',
    contenido: (
      <p>
        Envíos estándar gratuitos en pedidos superiores a $200.000 COP. Las devoluciones son
        gratuitas dentro de los primeros 30 días posteriores a la fecha de recepción siempre y
        cuando el producto no haya sido usado y mantenga sus etiquetas originales.
      </p>
    ),
  },
]

function capitalizar(texto) {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : ''
}

/**
 * Página de detalle de producto. Reproduce fielmente producto-detalle.html +
 * js/producto-detalle.js: badges, precio en COP, zoom de galería, lightbox,
 * selector de talla con disponibilidad, cantidad, favoritos, perks y acordeón.
 */
export default function ProductoDetallePage() {
  const { id } = useParams()
  const { productos } = useProductos()
  const { agregarItem } = useCart()
  const producto = productos.find((p) => p.id === id)

  const [imgSrc, setImgSrc] = useState(producto ? producto.imagen || imagenFallback(producto) : imagenFallback())
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [favorito, setFavorito] = useState(false)
  const [mensajeToast, setMensajeToast] = useState(null)
  const [zoomActivo, setZoomActivo] = useState(false)
  const [origenZoom, setOrigenZoom] = useState('center center')
  const [lightboxAbierto, setLightboxAbierto] = useState(false)
  const [itemsAbiertos, setItemsAbiertos] = useState(() => new Set())
  const galleryRef = useRef(null)

  useEffect(() => {
    setImgSrc(producto ? producto.imagen || imagenFallback(producto) : imagenFallback())
    setTallaSeleccionada(null)
    setCantidad(1)
    setFavorito(false)
    setZoomActivo(false)
    setLightboxAbierto(false)
  }, [producto])

  if (!producto) {
    return (
      <main className="producto-detalle-page">
        <div className="product-wrapper">
          <div className="error-container">
            <h2>Producto no encontrado</h2>
            <p>No pudimos encontrar el producto que buscas o hubo un problema de conexión.</p>
            <Link
              to="/catalogo"
              className="btn-primary-full"
              style={{ width: 'auto', padding: '1rem 2rem', display: 'inline-block', textDecoration: 'none' }}
            >
              Volver al catálogo
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const colorwayParts = []
  if (producto.genero) colorwayParts.push(capitalizar(producto.genero))
  if (producto.proposito) colorwayParts.push(capitalizar(producto.proposito))
  if (producto.colorway) colorwayParts.push(`Colorway: ${producto.colorway}`)

  const precioCOP = Math.round(producto.precio * 4200).toLocaleString('es-CO')

  function moverMouse(e) {
    if (!zoomActivo || !galleryRef.current) return
    const rect = galleryRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigenZoom(`${x}% ${y}%`)
  }

  function alternarZoom(e) {
    if (window.innerWidth <= 768 || !galleryRef.current) return
    if (zoomActivo) {
      setZoomActivo(false)
      setOrigenZoom('center center')
      return
    }
    const rect = galleryRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigenZoom(`${x}% ${y}%`)
    setZoomActivo(true)
  }

  function salirGaleria() {
    setZoomActivo(false)
    setOrigenZoom('center center')
  }

  function agregarCarrito() {
    if (!tallaSeleccionada) {
      setMensajeToast('Por favor selecciona una talla primero.')
      return
    }
    agregarItem(producto.id, tallaSeleccionada, cantidad)
    setMensajeToast(`Agregado al carrito: ${producto.nombre} (US ${tallaSeleccionada}) x${cantidad}`)
  }

  function alternarFavorito() {
    setFavorito((previo) => {
      const nuevo = !previo
      if (nuevo) setMensajeToast('Agregado a favoritos')
      return nuevo
    })
  }

  function alternarAccordion(indice) {
    setItemsAbiertos((previo) => {
      const siguiente = new Set(previo)
      if (siguiente.has(indice)) siguiente.delete(indice)
      else siguiente.add(indice)
      return siguiente
    })
  }

  return (
    <main className="producto-detalle-page">
      <div className="product-wrapper">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Inicio</Link>
          <span className="bc-sep">›</span>
          <Link to="/catalogo">Catálogo</Link>
          <span className="bc-sep">›</span>
          <span className="bc-current">{producto.nombre}</span>
        </nav>

        <div className="product-detail-container">
          {/* ===== IZQUIERDA: GALERÍA ===== */}
          <div className="pd-gallery">
            <div
              className={`gallery-main${zoomActivo ? ' zooming' : ''}`}
              ref={galleryRef}
              onMouseMove={moverMouse}
              onClick={alternarZoom}
              onMouseLeave={salirGaleria}
              onDoubleClick={() => setLightboxAbierto(true)}
            >
              <img
                src={imgSrc}
                alt={producto.nombre}
                width="660"
                height="660"
                fetchPriority="high"
                style={{ transformOrigin: origenZoom }}
                onError={() => setImgSrc(imagenFallback(producto))}
              />
              <div className="gallery-zoom-hint">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                <span>Pasar el mouse para hacer zoom</span>
              </div>
            </div>
          </div>

          {/* ===== DERECHA: INFO ===== */}
          <div className="pd-info">
            <div className="pd-badges">
              {producto.novedad && <span className="pd-badge pd-badge--new">✨ NUEVO</span>}
              {producto.outlet && <span className="pd-badge pd-badge--outlet">OUTLET</span>}
            </div>

            <p className="pd-brand">{producto.marca || 'Sin marca'}</p>
            <h1 className="pd-title">{producto.nombre}</h1>
            <p className="pd-colorway">{colorwayParts.join(' · ')}</p>

            <div className="pd-price-block">
              <div className="pd-price">${producto.precio.toLocaleString('en-US')}</div>
            </div>
            <div className="pd-price-cop">Aprox. ${precioCOP} COP</div>

            <div className="size-selector">
              <div className="size-header">
                <h3>Selecciona tu talla (US)</h3>
                <span className="size-guide">Guía de tallas</span>
              </div>
              <div className="size-grid">
                {TALLAS_US.map((talla) => {
                  const disponible = producto.tallas.includes(talla)
                  return (
                    <button
                      key={talla}
                      className={`size-btn${tallaSeleccionada === talla ? ' active' : ''}`}
                      disabled={!disponible}
                      onClick={() => setTallaSeleccionada(talla)}
                    >
                      US {talla}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="quantity-selector">
              <span>Cantidad:</span>
              <div className="qty-controls">
                <button className="qty-btn" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>-</button>
                <div className="qty-value">{cantidad}</div>
                <button className="qty-btn" onClick={() => setCantidad((c) => Math.min(10, c + 1))}>+</button>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-primary-full" onClick={agregarCarrito}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2l1.5 4H21l-2 8H8L6 2Z" /><path d="M7 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" /><path d="M18 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" /><path d="M8 14h11" /></svg>
                Agregar al carrito
              </button>
              <button className={`btn-secondary-full${favorito ? ' liked' : ''}`} onClick={alternarFavorito}>
                Favoritos
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>

            <div className="pd-perks">
              <div className="pd-perk">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                <div>
                  <strong>Envío gratis</strong>
                  <span>En pedidos +$200.000 COP</span>
                </div>
              </div>
              <div className="pd-perk">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                <div>
                  <strong>Devolución gratuita</strong>
                  <span>30 días para devolver</span>
                </div>
              </div>
              <div className="pd-perk">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <div>
                  <strong>Compra segura</strong>
                  <span>Pago 100% protegido</span>
                </div>
              </div>
            </div>

            <div className="pd-accordion">
              {ACORDEON.map((item, indice) => (
                <div key={item.titulo} className={`accordion-item${itemsAbiertos.has(indice) ? ' active' : ''}`}>
                  <button className="accordion-header" onClick={() => alternarAccordion(indice)}>
                    {item.titulo}
                    <span className="accordion-icon">+</span>
                  </button>
                  <div className="accordion-content">{item.contenido}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== LIGHTBOX ===== */}
      <div className={`lightbox-overlay${lightboxAbierto ? ' active' : ''}`} aria-hidden={!lightboxAbierto} onClick={() => setLightboxAbierto(false)}>
        <button className="lightbox-close" aria-label="Cerrar" onClick={() => setLightboxAbierto(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <img className="lightbox-img" src={imgSrc} alt={producto.nombre} onClick={(e) => e.stopPropagation()} />
      </div>

      <Toast mensaje={mensajeToast} onClose={() => setMensajeToast(null)} />
    </main>
  )
}
