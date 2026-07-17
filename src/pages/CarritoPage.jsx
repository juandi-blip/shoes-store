import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { imagenFallback } from '../utils/imagenes'
import { TASA_COP, ENVIO_GRATIS_DESDE_COP, calcularEnvioCOP } from '../utils/pricing'

/**
 * Página del carrito de compras (mock): líneas con imagen, talla, cantidad
 * editable y subtotal; resumen con envío y total; CTA hacia la página de pago.
 */
export default function CarritoPage() {
  const { lineas, totalUnidades, totalPrecio, actualizarCantidad, quitarItem } = useCart()
  const navigate = useNavigate()

  const totalCOP = totalPrecio * TASA_COP
  const envioGratis = totalCOP >= ENVIO_GRATIS_DESDE_COP
  const costoEnvioCOP = calcularEnvioCOP(totalCOP, lineas.length)

  if (lineas.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Tu carrito</h1>
          <div className="cart-empty">
            <p>Tu carrito está vacío. Explora el catálogo y encuentra tu próximo par.</p>
            <Link to="/catalogo" className="btn-primary-full cart-empty__cta">Ir al catálogo</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">
          Tu carrito <span className="cart-title__count">({totalUnidades} {totalUnidades === 1 ? 'artículo' : 'artículos'})</span>
        </h1>

        <div className="cart-layout">
          {/* Líneas del carrito */}
          <section className="cart-items" aria-label="Artículos en el carrito">
            {lineas.map((linea) => (
              <article className="cart-item" key={`${linea.id}-${linea.talla}`}>
                <Link to={`/producto/${linea.id}`} className="cart-item__image">
                  <img
                    src={linea.producto.imagen || imagenFallback(linea.producto)}
                    alt={linea.producto.nombre}
                    width="120"
                    height="120"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = imagenFallback(linea.producto) }}
                  />
                </Link>
                <div className="cart-item__info">
                  <p className="cart-item__brand">{linea.producto.marca}</p>
                  <Link to={`/producto/${linea.id}`} className="cart-item__name">{linea.producto.nombre}</Link>
                  <p className="cart-item__meta">Talla US {linea.talla} · {linea.producto.colorway}</p>
                  <div className="cart-item__controls">
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        aria-label="Disminuir cantidad"
                        onClick={() => actualizarCantidad(linea.id, linea.talla, linea.cantidad - 1)}
                        disabled={linea.cantidad <= 1}
                      >
                        -
                      </button>
                      <div className="qty-value" aria-live="polite">{linea.cantidad}</div>
                      <button
                        className="qty-btn"
                        aria-label="Aumentar cantidad"
                        onClick={() => actualizarCantidad(linea.id, linea.talla, linea.cantidad + 1)}
                        disabled={linea.cantidad >= 10}
                      >
                        +
                      </button>
                    </div>
                    <button className="cart-item__remove" onClick={() => quitarItem(linea.id, linea.talla)}>
                      Eliminar
                    </button>
                  </div>
                </div>
                <p className="cart-item__price">${linea.subtotal.toLocaleString('en-US')}</p>
              </article>
            ))}
          </section>

          {/* Resumen */}
          <aside className="cart-summary" aria-label="Resumen del pedido">
            <h2 className="cart-summary__title">Resumen</h2>
            <dl className="cart-summary__rows">
              <div className="cart-summary__row">
                <dt>Subtotal</dt>
                <dd>${totalPrecio.toLocaleString('en-US')} USD</dd>
              </div>
              <div className="cart-summary__row">
                <dt>Envío</dt>
                <dd>{envioGratis ? 'Gratis' : `$${costoEnvioCOP.toLocaleString('es-CO')} COP`}</dd>
              </div>
              <div className="cart-summary__row cart-summary__row--total">
                <dt>Total aprox.</dt>
                <dd>${(totalCOP + costoEnvioCOP).toLocaleString('es-CO')} COP</dd>
              </div>
            </dl>
            {!envioGratis && (
              <p className="cart-summary__hint">
                Envío gratis en pedidos superiores a ${ENVIO_GRATIS_DESDE_COP.toLocaleString('es-CO')} COP
              </p>
            )}
            <button className="btn-primary-full" onClick={() => navigate('/pago')}>
              Proceder al pago
            </button>
            <Link to="/catalogo" className="cart-summary__continue">Seguir comprando</Link>
          </aside>
        </div>
      </div>
    </main>
  )
}
