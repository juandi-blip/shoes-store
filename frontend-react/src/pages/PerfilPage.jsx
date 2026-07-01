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
    <main className="perfil-page">
      <h1>Hola, {usuario}</h1>
      <p>Este es tu perfil de Shoes.Store.</p>
      <button onClick={cerrarSesion}>Cerrar sesión</button>
    </main>
  )
}
