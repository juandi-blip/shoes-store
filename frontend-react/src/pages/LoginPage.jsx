import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

/**
 * Formulario de inicio de sesión (autenticación mock, sin backend).
 */
export default function LoginPage() {
  const { iniciarSesion } = useSession()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')

  function manejarEnvio(e) {
    e.preventDefault()
    const ok = iniciarSesion(usuario, clave)
    if (ok) {
      navigate('/perfil')
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <main className="auth-view">
      <form className="card" id="login-form" onSubmit={manejarEnvio}>
        <h1>Iniciar sesión</h1>
        <label htmlFor="user">Usuario</label>
        <input id="user" value={usuario} onChange={(e) => { setUsuario(e.target.value); setError('') }} required />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" value={clave} onChange={(e) => { setClave(e.target.value); setError('') }} required />
        {error && <p className="login-error visible">{error}</p>}
        <button type="submit" className="btn1">Iniciar sesión</button>
        <p className="auth-link">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
      </form>
    </main>
  )
}
