import { Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

/**
 * Página de perfil, solo accesible con sesión activa (mock).
 */
export default function PerfilPage() {
  const { usuario, cerrarSesion } = useSession()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="auth-view">
      <div className="card">
        <div className="profile-header">
          <h1 className="text1">Hola, {usuario}</h1>
          <h2 className="text2">Este es tu perfil de Shoes.Store.</h2>
        </div>
        <button type="button" className="btn1" onClick={cerrarSesion}>Cerrar sesión</button>
      </div>
    </main>
  )
}
