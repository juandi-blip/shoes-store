import { useEffect } from 'react'

/**
 * Notificación flotante temporal (ej. "Agregado al carrito").
 * @param {{mensaje: string|null, onClose: Function}} props
 */
export default function Toast({ mensaje, onClose }) {
  useEffect(() => {
    if (!mensaje) return
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [mensaje, onClose])

  if (!mensaje) return null

  return (
    <div id="pd-toast" role="status" aria-live="polite">
      {mensaje}
    </div>
  )
}
