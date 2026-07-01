import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProductos } from '../hooks/useProductos'
import Toast from '../components/Toast'

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' fill='%23555' font-family='Poppins,sans-serif' font-size='14'%3ESin imagen%3C/text%3E%3C/svg%3E"

/**
 * Página de detalle de producto: imagen, specs, selección de talla y toast al agregar.
 */
export default function ProductoDetallePage() {
  const { id } = useParams()
  const { productos } = useProductos()
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null)
  const [mensajeToast, setMensajeToast] = useState(null)

  const producto = productos.find((p) => p.id === id)

  if (!producto) {
    return (
      <main className="producto-detalle-page">
        <p>Producto no encontrado.</p>
        <Link to="/catalogo">Volver al catálogo</Link>
      </main>
    )
  }

  function agregar() {
    if (!tallaSeleccionada) {
      setMensajeToast('Selecciona una talla primero')
      return
    }
    setMensajeToast(`${producto.nombre} (talla ${tallaSeleccionada}) agregado`)
  }

  return (
    <main className="producto-detalle-page">
      <div className="pd-gallery">
        <img
          src={producto.imagen || PLACEHOLDER_IMG}
          alt={producto.nombre}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
        />
      </div>
      <div className="pd-info">
        <p className="pd-brand">{producto.marca}</p>
        <h1 className="pd-name">{producto.nombre}</h1>
        <p className="pd-colorway">{producto.colorway}</p>
        <p className="pd-price">${producto.precio.toLocaleString('en-US')}</p>

        <div className="pd-sizes">
          {producto.tallas.map((talla) => (
            <button
              key={talla}
              className={`pd-size${tallaSeleccionada === talla ? ' pd-size--selected' : ''}`}
              onClick={() => setTallaSeleccionada(talla)}
            >
              {talla}
            </button>
          ))}
        </div>

        <button className="pd-add-btn" onClick={agregar}>Agregar</button>

        <div className="accordion">
          <div className="accordion-item">
            <h3 className="accordion-header">Detalles del producto</h3>
            <div className="accordion-body">
              <p>Género: {producto.genero}</p>
              <p>Propósito: {producto.proposito}</p>
              <p>Subcategoría: {producto.subcategoria}</p>
            </div>
          </div>
        </div>
      </div>
      <Toast mensaje={mensajeToast} onClose={() => setMensajeToast(null)} />
    </main>
  )
}
