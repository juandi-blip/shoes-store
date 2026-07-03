import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const TASA_COP = 4200

const BANCOS_PSE = [
  'Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA Colombia',
  'Banco de Occidente', 'Nequi', 'Daviplata', 'Banco Agrario',
]

/**
 * Página de pago (SIMULACIÓN — evidencia SENA, sin pasarela real).
 *
 * Seguridad del mock:
 *  - Aviso explícito de no ingresar datos reales.
 *  - Los campos de tarjeta viven solo en el estado del componente: JAMÁS se
 *    escriben en localStorage/sessionStorage ni viajan a ninguna red.
 *  - autocomplete="off" en los campos sensibles para no disparar el gestor
 *    de contraseñas ni dejar los valores en el autofill del navegador.
 *  - Validación de formato en cliente (longitudes, solo dígitos) como
 *    demostración; una pasarela real exige validación y tokenización del
 *    lado del servidor (nunca guardar PAN/CVV).
 */
export default function PagoPage() {
  const { lineas, totalPrecio, vaciarCarrito } = useCart()

  const [metodo, setMetodo] = useState('tarjeta')
  const [numero, setNumero] = useState('')
  const [titular, setTitular] = useState('')
  const [vence, setVence] = useState('')
  const [cvv, setCvv] = useState('')
  const [banco, setBanco] = useState('')
  const [error, setError] = useState('')
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null)

  const totalCOP = totalPrecio * TASA_COP
  const envioCOP = totalCOP >= 200000 || lineas.length === 0 ? 0 : 15000

  if (lineas.length === 0 && !pedidoConfirmado) {
    return <Navigate to="/carrito" replace />
  }

  function validar() {
    if (metodo === 'tarjeta') {
      const digitos = numero.replace(/\s/g, '')
      if (!/^\d{13,19}$/.test(digitos)) return 'Número de tarjeta inválido (13–19 dígitos).'
      if (titular.trim().length < 3) return 'Ingresa el nombre del titular.'
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(vence)) return 'Vencimiento en formato MM/AA.'
      if (!/^\d{3,4}$/.test(cvv)) return 'CVV inválido (3–4 dígitos).'
    }
    if (metodo === 'pse' && !banco) return 'Selecciona tu banco.'
    return ''
  }

  function pagar(e) {
    e.preventDefault()
    const mensajeError = validar()
    if (mensajeError) {
      setError(mensajeError)
      return
    }
    // Simulación: genera un número de pedido y limpia todo. Los datos de
    // tarjeta se descartan aquí mismo — nunca se persisten.
    const orden = `SS-${Date.now().toString(36).toUpperCase()}`
    setNumero(''); setTitular(''); setVence(''); setCvv('')
    setPedidoConfirmado(orden)
    vaciarCarrito()
  }

  if (pedidoConfirmado) {
    return (
      <main className="pay-page">
        <div className="pay-container">
          <div className="pay-success" role="status" aria-live="polite">
            <div className="pay-success__icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <h1>¡Pedido confirmado!</h1>
            <p>Tu pedido <strong>{pedidoConfirmado}</strong> fue registrado (simulación).</p>
            <p className="pay-success__note">Este es un entorno de demostración: no se procesó ningún pago real.</p>
            <Link to="/catalogo" className="btn-primary-full pay-success__cta">Volver al catálogo</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pay-page">
      <div className="pay-container">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/carrito">Carrito</Link>
          <span className="bc-sep">›</span>
          <span className="bc-current">Pago</span>
        </nav>

        <h1 className="cart-title">Método de pago</h1>

        {/* Aviso de demostración */}
        <div className="pay-demo-banner" role="note">
          ⚠️ Entorno de demostración: no ingreses datos reales de tarjetas ni cuentas. Ningún dato sale de tu navegador.
        </div>

        <div className="cart-layout">
          <form className="pay-form" onSubmit={pagar} noValidate>
            {/* Selector de método */}
            <div className="pay-methods" role="radiogroup" aria-label="Selecciona el método de pago">
              {[
                ['tarjeta', 'Tarjeta crédito / débito', 'Visa · Mastercard · Amex'],
                ['pse', 'PSE', 'Débito desde tu banco'],
                ['contraentrega', 'Contra entrega', 'Paga al recibir'],
              ].map(([valor, titulo, sub]) => (
                <label key={valor} className={`pay-method${metodo === valor ? ' is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="metodo"
                    value={valor}
                    checked={metodo === valor}
                    onChange={() => { setMetodo(valor); setError('') }}
                  />
                  <span className="pay-method__title">{titulo}</span>
                  <span className="pay-method__sub">{sub}</span>
                </label>
              ))}
            </div>

            {/* Campos según método */}
            {metodo === 'tarjeta' && (
              <div className="pay-fields">
                <div className="form">
                  <label htmlFor="card-number">Número de tarjeta</label>
                  <input
                    id="card-number"
                    name="card-number-demo"
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    maxLength={23}
                    autoComplete="off"
                    spellCheck={false}
                    value={numero}
                    onChange={(e) => { setNumero(e.target.value.replace(/[^\d\s]/g, '')); setError('') }}
                  />
                </div>
                <div className="form">
                  <label htmlFor="card-holder">Titular</label>
                  <input
                    id="card-holder"
                    name="card-holder-demo"
                    type="text"
                    placeholder="Como aparece en la tarjeta"
                    maxLength={60}
                    autoComplete="off"
                    value={titular}
                    onChange={(e) => { setTitular(e.target.value); setError('') }}
                  />
                </div>
                <div className="pay-fields__row">
                  <div className="form">
                    <label htmlFor="card-exp">Vence (MM/AA)</label>
                    <input
                      id="card-exp"
                      name="card-exp-demo"
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/AA"
                      maxLength={5}
                      autoComplete="off"
                      value={vence}
                      onChange={(e) => { setVence(e.target.value.replace(/[^\d/]/g, '')); setError('') }}
                    />
                  </div>
                  <div className="form">
                    <label htmlFor="card-cvv">CVV</label>
                    <input
                      id="card-cvv"
                      name="card-cvv-demo"
                      type="password"
                      inputMode="numeric"
                      placeholder="•••"
                      maxLength={4}
                      autoComplete="off"
                      value={cvv}
                      onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '')); setError('') }}
                    />
                  </div>
                </div>
              </div>
            )}

            {metodo === 'pse' && (
              <div className="pay-fields">
                <div className="form">
                  <label htmlFor="pse-banco">Tu banco</label>
                  <select
                    id="pse-banco"
                    className="sort-select pay-select"
                    value={banco}
                    onChange={(e) => { setBanco(e.target.value); setError('') }}
                  >
                    <option value="">Selecciona tu banco…</option>
                    {BANCOS_PSE.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <p className="pay-fields__note">Serás redirigido al portal de tu banco (simulado).</p>
              </div>
            )}

            {metodo === 'contraentrega' && (
              <div className="pay-fields">
                <p className="pay-fields__note">
                  Pagas en efectivo o con datáfono al recibir tu pedido. Disponible en ciudades principales de Colombia.
                </p>
              </div>
            )}

            <div className={`login-error${error ? ' visible' : ''}`} role="alert" aria-live="polite">{error}</div>

            <button type="submit" className="btn-primary-full pay-submit">
              {metodo === 'contraentrega' ? 'Confirmar pedido' : `Pagar $${(totalCOP + envioCOP).toLocaleString('es-CO')} COP`}
            </button>
          </form>

          {/* Resumen lateral */}
          <aside className="cart-summary" aria-label="Resumen del pedido">
            <h2 className="cart-summary__title">Tu pedido</h2>
            <ul className="pay-summary-list">
              {lineas.map((linea) => (
                <li key={`${linea.id}-${linea.talla}`}>
                  <span>{linea.producto.nombre} · US {linea.talla} ×{linea.cantidad}</span>
                  <span>${linea.subtotal.toLocaleString('en-US')}</span>
                </li>
              ))}
            </ul>
            <dl className="cart-summary__rows">
              <div className="cart-summary__row">
                <dt>Envío</dt>
                <dd>{envioCOP === 0 ? 'Gratis' : `$${envioCOP.toLocaleString('es-CO')} COP`}</dd>
              </div>
              <div className="cart-summary__row cart-summary__row--total">
                <dt>Total</dt>
                <dd>${(totalCOP + envioCOP).toLocaleString('es-CO')} COP</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </main>
  )
}
