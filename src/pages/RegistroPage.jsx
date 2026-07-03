import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * Formulario de registro (mock, sin persistencia real).
 * Reproduce fielmente registro.html: nombre completo, cédula, contraseña
 * y fecha de nacimiento dentro de .cardRegister.
 */
export default function RegistroPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [clave, setClave] = useState('')
  const [nacimiento, setNacimiento] = useState('')

  function manejarEnvio(e) {
    e.preventDefault()
    navigate('/login')
  }

  return (
    <main className="auth-view">
      <div className="cardRegister">
        <nav className="top-nav" aria-label="Navegación superior">
          <Link to="/login" className="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Volver
          </Link>
        </nav>

        <Link to="/" className="brand-tag">SHOES<span className="brand-dot">.</span>STORE</Link>

        <h1 className="text1">Crear una cuenta</h1>
        <h2 className="text2">Únete a la plataforma de sneakers más premium</h2>

        <form onSubmit={manejarEnvio}>
          <div className="form">
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Ingresa tu nombre"
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="form">
            <label htmlFor="cedula">Cédula</label>
            <input
              id="cedula"
              name="cedula"
              type="number"
              inputMode="numeric"
              placeholder="Ingresa tu documento"
              autoComplete="off"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
            />
          </div>

          <div className="form">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="new-password"
              type="password"
              placeholder="Crea una contraseña segura"
              autoComplete="new-password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
            />
          </div>

          <div className="form">
            <label htmlFor="birthdate">Fecha de nacimiento</label>
            <input
              id="birthdate"
              name="bday"
              type="date"
              autoComplete="bday"
              value={nacimiento}
              onChange={(e) => setNacimiento(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn2">Registrarse</button>
        </form>

        <div className="auth-link">
          <Link to="/login">¿Ya tienes una cuenta? Inicia sesión</Link>
        </div>

        <p className="footer">Asegúrate de ingresar datos reales para tu proceso de envío.</p>
      </div>
    </main>
  )
}
