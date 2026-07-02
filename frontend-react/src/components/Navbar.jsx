import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useSession } from '../context/SessionContext'
import { MEGA_MENUS, NAV_MEGA } from './megaMenuData'

const CLOSE_DELAY = 120 // ms, igual que js/tienda.js

/**
 * Header completo del sitio: barra de promoción, navegación principal con
 * mega-menús al hover (escritorio), iconos de acción, y drawer móvil con
 * subnavegación desplegable. Reproduce la estructura y el comportamiento de
 * index.html + js/tienda.js.
 */
export default function Navbar() {
  const { usuario } = useSession()
  const [menuActivo, setMenuActivo] = useState(null) // mega-menú abierto (escritorio)
  const [drawerAbierto, setDrawerAbierto] = useState(false) // menú móvil
  const [expandido, setExpandido] = useState(null) // subnav móvil desplegado
  const timerRef = useRef(null)

  const overlayVisible = menuActivo !== null || drawerAbierto

  /* ─── Mega-menú (hover con cierre retardado) ─── */
  function abrirMega(id) {
    clearTimeout(timerRef.current)
    setMenuActivo(id)
  }
  function cerrarMegaConDelay() {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setMenuActivo(null), CLOSE_DELAY)
  }
  function cancelarCierre() {
    clearTimeout(timerRef.current)
  }

  /* ─── Drawer móvil ─── */
  function alternarDrawer() {
    setDrawerAbierto((v) => !v)
  }
  function cerrarDrawer() {
    setDrawerAbierto(false)
    setExpandido(null)
  }
  function cerrarTodo() {
    setMenuActivo(null)
    cerrarDrawer()
  }

  // Cerrar con la tecla Escape, igual que el sitio original.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') cerrarTodo()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="site-header" id="site-header">
      {/* Barra de promoción superior */}
      <div className="top-banner">
        <p>
          Envío gratis en pedidos superiores a $200.000 COP&nbsp;&nbsp;|&nbsp;&nbsp;
          <Link to="/catalogo">Comprar ahora</Link>
        </p>
      </div>

      <nav className="shoes-nav" id="main-nav">
        <div className="nav-container">
          <Link className="navbar-brand" to="/" onClick={cerrarTodo}>
            SHOES<span className="brand-dot">.</span>STORE
          </Link>

          {/* Nav principal (escritorio) */}
          <ul className="nav-main" id="nav-main">
            {NAV_MEGA.map((item) => (
              <li
                key={item.id}
                className={`nav-main__item has-mega${menuActivo === item.id ? ' active' : ''}`}
                onMouseEnter={() => abrirMega(item.id)}
                onMouseLeave={cerrarMegaConDelay}
              >
                <Link className="nav-main__link" to={item.to}>{item.label}</Link>
              </li>
            ))}
            <li className="nav-main__item">
              <Link className="nav-main__link nav-main__link--new" to="/catalogo?novedad=true">NOVEDADES ✨</Link>
            </li>
            <li className="nav-main__item">
              <Link className="nav-main__link nav-main__link--outlet" to="/catalogo?outlet=true">OUTLET</Link>
            </li>
          </ul>

          {/* Acciones (escritorio) */}
          <div className="nav-actions">
            <button className="nav-action-btn" id="btn-search" aria-label="Buscar" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </button>
            <Link className="nav-action-btn" to="/perfil" aria-label="Mi cuenta">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </Link>
            <Link className="nav-action-btn nav-action-btn--login" to={usuario ? '/perfil' : '/login'}>
              {usuario ? 'Mi perfil' : 'Iniciar sesión'}
            </Link>
          </div>

          {/* Hamburguesa (móvil) */}
          <button
            className={`hamburger${drawerAbierto ? ' is-active' : ''}`}
            id="hamburger-btn"
            type="button"
            aria-label="Abrir menú"
            aria-expanded={drawerAbierto}
            onClick={alternarDrawer}
          >
            <span className="hamburger__line"></span>
            <span className="hamburger__line"></span>
            <span className="hamburger__line"></span>
          </button>
        </div>
      </nav>

      {/* Mega-menús (escritorio) */}
      {Object.entries(MEGA_MENUS).map(([id, menu]) => (
        <div
          key={id}
          className={`mega-menu${menuActivo === id ? ' is-open' : ''}`}
          id={`mega-${id}`}
          aria-hidden={menuActivo !== id}
          onMouseEnter={cancelarCierre}
          onMouseLeave={cerrarMegaConDelay}
        >
          <div className={`mega-menu__inner${menu.sport ? ' mega-menu__inner--sport' : ''}`}>
            {menu.pillars.map((pillar) => (
              <div className="mega-menu__pillar" key={pillar.title}>
                <h4 className="mega-menu__pillar-title">{pillar.title}</h4>
                <ul className="mega-menu__list">
                  {pillar.links.map((link) => (
                    <li key={link.label + link.to}>
                      <Link to={link.to} className={link.outlet ? 'mega-outlet' : undefined} onClick={cerrarTodo}>
                        {link.label}
                        {link.sub && <span className="mega-sub">{link.sub}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {menu.promo && (
              <div className="mega-menu__promo">
                <img src="/megamenu-promo.png" alt={menu.promo.title} loading="lazy" />
                <h5 className="mega-menu__promo-title">{menu.promo.title}</h5>
                <p className="mega-menu__promo-sub">{menu.promo.sub}</p>
                <Link to={menu.promo.to} className="mega-menu__promo-btn" onClick={cerrarTodo}>VER MÁS</Link>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Fondo oscuro compartido por mega-menú y drawer */}
      <div
        className={`mega-overlay${overlayVisible ? ' is-visible' : ''}`}
        id="mega-overlay"
        onClick={cerrarTodo}
      ></div>

      {/* Drawer móvil */}
      <div className={`mobile-drawer${drawerAbierto ? ' is-open' : ''}`} id="mobile-drawer" aria-hidden={!drawerAbierto}>
        <div className="mobile-drawer__header">
          <span className="mobile-drawer__title">Menú</span>
          <button className="mobile-drawer__close" aria-label="Cerrar menú" onClick={cerrarDrawer}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="mobile-drawer__body">
          <ul className="mobile-nav">
            {NAV_MEGA.map((item) => (
              <li
                key={item.id}
                className={`mobile-nav__item mobile-nav__item--expandable${expandido === item.id ? ' is-expanded' : ''}`}
              >
                <button
                  className="mobile-nav__link"
                  onClick={() => setExpandido((prev) => (prev === item.id ? null : item.id))}
                >
                  {item.label} <span className="mobile-nav__arrow">›</span>
                </button>
                <div className="mobile-subnav" id={`m-${item.id}`}>
                  {MEGA_MENUS[item.id].pillars.map((pillar) => (
                    <div key={pillar.title}>
                      <h5 className="mobile-subnav__title">{pillar.title}</h5>
                      {pillar.links.map((link) => (
                        <Link
                          key={link.label + link.to}
                          to={link.to}
                          className={link.outlet ? 'mega-outlet' : undefined}
                          onClick={cerrarDrawer}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </li>
            ))}
            <li className="mobile-nav__item">
              <Link className="mobile-nav__link mobile-nav__link--new" to="/catalogo?novedad=true" onClick={cerrarDrawer}>NOVEDADES ✨</Link>
            </li>
            <li className="mobile-nav__item">
              <Link className="mobile-nav__link mobile-nav__link--outlet" to="/catalogo?outlet=true" onClick={cerrarDrawer}>OUTLET</Link>
            </li>
          </ul>
          <div className="mobile-drawer__footer">
            <Link to={usuario ? '/perfil' : '/login'} className="mobile-drawer__login" onClick={cerrarDrawer}>
              {usuario ? 'Mi perfil' : 'Iniciar sesión'}
            </Link>
            <Link to="/perfil" className="mobile-drawer__profile" onClick={cerrarDrawer}>Mi perfil</Link>
          </div>
        </div>
      </div>
    </header>
  )
}
