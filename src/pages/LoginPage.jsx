import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

/**
 * Formulario de inicio de sesión (autenticación mock, sin backend).
 * Reproduce fielmente inicio.html + js/login.js: back-link, brand-tag,
 * textos de bienvenida, placeholders y shake de error.
 */
export default function LoginPage() {
  const { iniciarSesion } = useSession()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [sacudir, setSacudir] = useState(false)
  const claveRef = useRef(null)

  function mostrarError(mensaje) {
    setError(mensaje)
    setSacudir(true)
  }

  function manejarEnvio(e) {
    e.preventDefault()

    if (!usuario.trim() || !clave) {
      mostrarError('Por favor completa todos los campos.')
      return
    }

    const ok = iniciarSesion(usuario.trim(), clave)
    if (ok) {
      navigate('/')
    } else {
      mostrarError('Usuario o contraseña incorrectos.')
      setClave('')
      claveRef.current?.focus()
    }
  }

  return (
    <main className="auth-view">
      <div className={`card${sacudir ? ' shake' : ''}`} onAnimationEnd={() => setSacudir(false)}>
        <nav className="top-nav" aria-label="Navegación superior">
          <Link to="/" className="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Volver
          </Link>
        </nav>

        <Link to="/" className="brand-tag">SHOES<span className="brand-dot">.</span>STORE</Link>

        <h1 className="text1">Bienvenido de nuevo</h1>
        <h2 className="text2">Inicia sesión en tu cuenta para continuar</h2>

        <form id="login-form" noValidate onSubmit={manejarEnvio}>
          <div className="form">
            <label htmlFor="user">Nombre de usuario</label>
            <input
              id="user"
              name="username"
              type="text"
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              spellCheck={false}
              value={usuario}
              onChange={(e) => { setUsuario(e.target.value); setError('') }}
              required
            />
          </div>

          <div className="form">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              value={clave}
              onChange={(e) => { setClave(e.target.value); setError('') }}
              ref={claveRef}
              required
            />
          </div>

          <button type="submit" className="btn1">Iniciar sesión</button>

          <div className={`login-error${error ? ' visible' : ''}`} role="alert" aria-live="polite">{error}</div>
        </form>

        <div className="auth-link">
          <Link to="/registro">¿No tienes una cuenta? Regístrate</Link>
        </div>
      </div>
    </main>
  )
}
