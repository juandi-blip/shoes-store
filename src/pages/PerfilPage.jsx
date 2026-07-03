import { Link, Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { assetUrl } from '../utils/assetUrl'

/**
 * Página de perfil, solo accesible con sesión activa (mock).
 * Reproduce fielmente perfil.html: avatar, back-link "Tienda", brand-tag,
 * campos de solo lectura y botón de cerrar sesión con estilo secundario.
 */
export default function PerfilPage() {
  const { usuario, cerrarSesion } = useSession()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="auth-view">
      <div className="card">
        <nav className="top-nav" aria-label="Navegación superior">
          <Link to="/" className="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Tienda
          </Link>
        </nav>

        <Link to="/" className="brand-tag">SHOES<span className="brand-dot">.</span>STORE</Link>

        <div className="profile-header">
          <img src={assetUrl('icono-perfil.avif')} alt="Avatar del usuario" className="profile-avatar" />
          <h1 className="text1">Mi Perfil</h1>
          <h2 className="text2">Gestiona tu información personal</h2>
        </div>

        <form>
          <div className="form">
            <label htmlFor="username">Nombre de usuario</label>
            <input id="username" type="text" value={usuario} readOnly />
          </div>

          <div className="form">
            <label htmlFor="birthdate">Fecha de nacimiento</label>
            <input id="birthdate" type="date" defaultValue="1998-05-15" readOnly />
          </div>
        </form>

        <button
          type="button"
          className="btn1"
          style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border-hover)', color: 'var(--color-text-secondary)', marginTop: '2rem' }}
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}
