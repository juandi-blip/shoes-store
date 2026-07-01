import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * Formulario de registro (mock, sin persistencia real).
 */
export default function RegistroPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')

  function manejarEnvio(e) {
    e.preventDefault()
    navigate('/login')
  }

  return (
    <main>
      <form className="card" onSubmit={manejarEnvio}>
        <h1>Crear cuenta</h1>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <label htmlFor="correo">Correo</label>
        <input id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" type="password" value={clave} onChange={(e) => setClave(e.target.value)} required />
        <button type="submit" className="btn2">Registrarme</button>
        <p className="auth-link">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
    </main>
  )
}
