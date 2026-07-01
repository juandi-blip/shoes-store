import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useSession } from '../context/SessionContext'

/**
 * Navegación principal: logo, enlaces por género/propósito, y acceso a sesión.
 */
export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { usuario } = useSession()

  return (
    <nav className="shoes-nav" id="main-nav">
      <div className="nav-container">
        <Link className="navbar-brand" to="/">
          SHOES<span className="brand-dot">.</span>STORE
        </Link>
        <ul className="nav-main" id="nav-main">
          <li className="nav-main__item">
            <Link className="nav-main__link" to="/catalogo?genero=mujer">MUJER</Link>
          </li>
          <li className="nav-main__item">
            <Link className="nav-main__link" to="/catalogo?genero=hombre">HOMBRE</Link>
          </li>
          <li className="nav-main__item">
            <Link className="nav-main__link" to="/catalogo?genero=ninos">NIÑOS</Link>
          </li>
          <li className="nav-main__item">
            <Link className="nav-main__link" to="/catalogo?proposito=deporte">DEPORTE</Link>
          </li>
          <li className="nav-main__item">
            <Link className="nav-main__link nav-main__link--new" to="/catalogo?novedad=true">NOVEDADES ✨</Link>
          </li>
          <li className="nav-main__item">
            <Link className="nav-main__link nav-main__link--outlet" to="/catalogo?outlet=true">OUTLET</Link>
          </li>
        </ul>
        <div className="nav-actions">
          {usuario ? (
            <Link to="/perfil" className="nav-actions__profile">Mi perfil</Link>
          ) : (
            <Link to="/login" className="nav-actions__login">Iniciar sesión</Link>
          )}
        </div>
        <button
          className="mobile-menu-toggle"
          aria-label="Abrir menú"
          onClick={() => setMenuAbierto((v) => !v)}
        >
          ☰
        </button>
      </div>
      {menuAbierto && (
        <ul className="mobile-nav" id="mobile-nav">
          <li className="mobile-nav__item"><Link to="/catalogo?genero=mujer">MUJER</Link></li>
          <li className="mobile-nav__item"><Link to="/catalogo?genero=hombre">HOMBRE</Link></li>
          <li className="mobile-nav__item"><Link to="/catalogo?genero=ninos">NIÑOS</Link></li>
          <li className="mobile-nav__item"><Link to="/catalogo?novedad=true">NOVEDADES ✨</Link></li>
          <li className="mobile-nav__item"><Link to="/catalogo?outlet=true">OUTLET</Link></li>
        </ul>
      )}
    </nav>
  )
}
