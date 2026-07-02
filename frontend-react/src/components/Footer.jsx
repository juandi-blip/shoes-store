import { Link } from 'react-router-dom'

/** Columnas de enlaces del pie de página (portadas del index.html original). */
const COLUMNAS = [
  {
    titulo: 'Productos',
    links: [
      { label: 'Zapatillas Hombre', to: '/catalogo?genero=hombre' },
      { label: 'Zapatillas Mujer', to: '/catalogo?genero=mujer' },
      { label: 'Zapatillas Niños', to: '/catalogo?genero=ninos' },
      { label: 'Nuevos Lanzamientos', to: '/catalogo?novedad=true' },
      { label: 'Outlet & Ofertas', to: '/catalogo?outlet=true' },
    ],
  },
  {
    titulo: 'Ayuda',
    links: [
      { label: 'Estado de Pedido', to: '#' },
      { label: 'Envíos y Entregas', to: '#' },
      { label: 'Devoluciones', to: '#' },
      { label: 'Opciones de Pago', to: '#' },
      { label: 'Contacto', to: '#' },
    ],
  },
  {
    titulo: 'Shoes Store',
    links: [
      { label: 'Nuestra Historia', to: '#' },
      { label: 'Sostenibilidad', to: '#' },
      { label: 'Tiendas Físicas', to: '#' },
      { label: 'Trabaja con Nosotros', to: '#' },
      { label: 'Shoes Store App', to: '#' },
    ],
  },
]

/**
 * Pie de página del sitio: columna de marca con redes sociales, columnas de
 * enlaces y barra inferior con ubicación y enlaces legales. Reproduce el
 * footer del index.html original.
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand-col">
            <Link className="footer-brand-logo" to="/">
              SHOES<span className="brand-dot">.</span>STORE
            </Link>
            <p className="footer-tagline">
              Equipando atletas, definiendo la cultura sneaker. El rendimiento y el estilo no se negocian.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg></a>
              <a href="#" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg></a>
              <a href="#" aria-label="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
              <a href="#" aria-label="YouTube"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg></a>
            </div>
          </div>

          {COLUMNAS.map((columna) => (
            <div className="footer-links-col" key={columna.titulo}>
              <h4 className="footer-heading">{columna.titulo}</h4>
              <ul className="footer-links">
                {columna.links.map((link) => (
                  <li key={link.label}>
                    {link.to.startsWith('/')
                      ? <Link to={link.to}>{link.label}</Link>
                      : <a href={link.to}>{link.label}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <div className="footer-location">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <span>Colombia</span>
          </div>
          <div className="footer-legal">
            <span className="footer-copy">© 2026 Shoes Store. Todos los derechos reservados. Proyecto SENA GA7-220501096-AA4-EV03.</span>
            <ul className="legal-links">
              <li><a href="#">Términos de Uso</a></li>
              <li><a href="#">Política de Privacidad</a></li>
              <li><a href="#">Aviso Legal</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
