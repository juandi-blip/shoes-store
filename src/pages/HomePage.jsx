import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProductos, filtrarYOrdenarProductos } from '../hooks/useProductos'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ProductGrid from '../components/ProductGrid'
import { assetUrl } from '../utils/assetUrl'
import { useDocumentHead } from '../hooks/useDocumentHead'
import { useHeroScrollEffect } from '../hooks/useHeroScrollEffect'

const SIN_FILTROS = { generos: [], categorias: [], precioMax: 100000, soloOutlet: false, soloNovedad: false }

/** Marcas mostradas en la barra "Nuestras marcas". */
const MARCAS = [
  { nombre: 'Nike', logo: assetUrl('assets/brands/nike.svg') },
  { nombre: 'Adidas', logo: assetUrl('assets/brands/adidas.svg') },
  { nombre: 'Jordan', logo: assetUrl('assets/brands/jordan.svg') },
  { nombre: 'Puma', logo: assetUrl('assets/brands/puma.svg') },
  { nombre: 'New Balance', logo: assetUrl('assets/brands/newbalance.svg') },
  { nombre: 'Vans', logo: assetUrl('assets/brands/vans.svg') },
  { nombre: 'Converse', logo: assetUrl('assets/brands/converse.svg') },
  { nombre: 'Hoka', logo: assetUrl('assets/brands/hoka.svg') },
]

/** Categorías destacadas con su imagen de fondo. */
const CATEGORIAS = [
  { titulo: 'HOMBRE', genero: 'hombre', bg: 'https://images.pexels.com/photos/9400746/pexels-photo-9400746.jpeg' },
  { titulo: 'MUJER', genero: 'mujer', bg: 'https://images.pexels.com/photos/27008326/pexels-photo-27008326.jpeg' },
  { titulo: 'NIÑOS', genero: 'ninos', bg: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800' },
]

/** Secuencia de sneakers del hero (crossfade ligado al scroll). */
const HERO_SNEAKER_IMGS = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80&w=1600',
]

/**
 * Página de inicio: hero, marcas, categorías, banners promocionales y las
 * secciones de productos (Lo más vendido, Novedades, Outlet) + newsletter.
 * Reproduce la estructura y clases del index.html original.
 */
export default function HomePage() {
  useDocumentHead({
    title: 'Shoes Store — Sneakers premium',
    description: 'Shoes Store — Las sneakers más exclusivas del momento. Rendimiento y diseño en cada paso.',
    canonicalPath: '',
  })

  const { productos } = useProductos()

  const destacados = useMemo(
    () => filtrarYOrdenarProductos(productos, SIN_FILTROS, 'relevancia').filter((p) => !p.novedad && !p.outlet).slice(0, 8),
    [productos]
  )
  const novedades = useMemo(
    () => filtrarYOrdenarProductos(productos, { ...SIN_FILTROS, soloNovedad: true }, 'novedades').slice(0, 8),
    [productos]
  )
  const outlet = useMemo(
    () => filtrarYOrdenarProductos(productos, { ...SIN_FILTROS, soloOutlet: true }, 'precio-asc').slice(0, 8),
    [productos]
  )

  // Activa la aparición al hacer scroll una vez que los productos están listos.
  useScrollReveal([destacados, novedades, outlet])

  const heroWrapperRef = useRef(null)
  const heroStackRef = useRef(null)
  const heroContentRef = useRef(null)
  useHeroScrollEffect(heroWrapperRef, heroStackRef, heroContentRef)

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="hero-scroll" ref={heroWrapperRef} aria-label="Banner principal">
        <div className="hero-scroll__pin">
          <div className="hero-scroll__stack" ref={heroStackRef}>
            {HERO_SNEAKER_IMGS.map((src, i) => (
              <img
                key={src}
                className="hero-scroll__img"
                src={src}
                alt={i === 0 ? '' : undefined}
                style={{ opacity: i === 0 ? 1 : 0 }}
              />
            ))}
          </div>
          <div className="hero-scroll__overlay"></div>
          <div className="hero__content hero-scroll__content" ref={heroContentRef}>
            <h1 className="hero__title">Eleva tu estilo</h1>
            <p className="hero__subtitle">Las sneakers más exclusivas del momento. Rendimiento y diseño en cada paso.</p>
            <div className="hero__actions">
              <a href="#lo-mas-vendido" className="btn-primary">COMPRAR AHORA</a>
              <a href="#categorias" className="btn-secondary">VER COLECCIÓN</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARCAS ===== */}
      <section className="brands-section" aria-label="Nuestras Marcas">
        <div className="brands-grid-container">
          <p className="brands-label">NUESTRAS MARCAS</p>
          {/* Marquee infinito: dos copias del set; la segunda es decorativa (aria-hidden) */}
          <div className="brands-marquee">
            {[false, true].map((esCopia) => (
              <div className="brands-grid" aria-hidden={esCopia || undefined} key={esCopia ? 'copia' : 'original'}>
                {MARCAS.map((marca) => (
                  <div className="brand-card" key={marca.nombre}>
                    {/* Sin loading="lazy": dentro del marquee (glamour.css convierte .brands-grid
                        a flex sin ancho fijo en .brand-card), el navegador no puede resolver el
                        umbral "cerca del viewport" antes de cargar la imagen → nunca dispara el
                        fetch y el logo queda en blanco para siempre. Son 16 SVG pequeños, carga
                        inmediata sale gratis. */}
                    <img src={marca.logo} alt={esCopia ? '' : marca.nombre} className="brand-logo-img" width="96" height="40" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORÍAS ===== */}
      <section id="categorias" className="categories-section fade-in" aria-label="Categorías Destacadas">
        <div className="section-container">
          <div className="categories-grid">
            {CATEGORIAS.map((cat) => (
              <Link to={`/catalogo?genero=${cat.genero}`} className="category-card" key={cat.genero}>
                <div className="category-card__bg" style={{ backgroundImage: `url('${cat.bg}')` }}></div>
                <div className="category-card__content">
                  <h3>{cat.titulo}</h3>
                  <span className="btn-outline">VER TODO</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BANNER NUEVA COLECCIÓN ===== */}
      <section className="promo-banner fade-in" aria-label="Nueva Colección">
        <div className="promo-banner__image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1200')" }}></div>
        <div className="promo-banner__content">
          <span className="promo-tag">NUEVA COLECCIÓN</span>
          <h2>Estilo Urbano Redefinido</h2>
          <p>Descubre los lanzamientos más recientes con un diseño pensado para destacar en la calle. Confort, durabilidad y un diseño que atrae miradas.</p>
          <a href="#lo-mas-vendido" className="btn-primary">EXPLORAR AHORA</a>
        </div>
      </section>

      {/* ===== LO MÁS VENDIDO ===== */}
      <section id="lo-mas-vendido" className="products-section fade-in" aria-label="Lo más vendido">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">LO MÁS VENDIDO</h2>
          </div>
          <ProductGrid productos={destacados} className="product-grid" />
          <div className="section-footer">
            <Link to="/catalogo" className="btn-outline-dark">VER TODOS LOS PRODUCTOS</Link>
          </div>
        </div>
      </section>

      {/* ===== BANNER DEPORTE ===== */}
      <section className="sport-banner fade-in" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&q=80&w=1600')" }}>
        <div className="sport-banner__overlay"></div>
        <div className="sport-banner__content">
          <h2>RENDIMIENTO SIN LÍMITES</h2>
          <p>Alcanza tu máximo potencial con nuestra línea performance, diseñada para atletas que no se conforman.</p>
          <Link to="/catalogo?proposito=deporte" className="btn-primary">DEPORTE</Link>
        </div>
      </section>

      {/* ===== NOVEDADES ===== */}
      <section className="products-section fade-in" aria-label="Novedades">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">NOVEDADES ✨</h2>
          </div>
          <ProductGrid productos={novedades} className="product-grid product-grid--4" />
          <div className="section-footer">
            <Link to="/catalogo?novedad=true" className="btn-outline-dark">VER TODAS LAS NOVEDADES</Link>
          </div>
        </div>
      </section>

      {/* ===== OUTLET ===== */}
      <section className="outlet-section fade-in" aria-label="Outlet">
        <div className="section-container">
          <div className="section-header outlet-header">
            <h2 className="section-title text-white">OUTLET — HASTA 50% OFF</h2>
          </div>
          <ProductGrid productos={outlet} className="product-grid product-grid--4" />
          <div className="section-footer">
            <Link to="/catalogo?outlet=true" className="btn-outline-white">VER OUTLET</Link>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="newsletter-section fade-in" aria-label="Newsletter">
        <div className="newsletter-container">
          <h2>Sé el primero en conocer las novedades</h2>
          <p>Aprovecha accesos exclusivos y mantente al día con los últimos lanzamientos.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Tu correo electrónico" required />
            <button type="submit" className="btn-primary">SUSCRIBIRSE</button>
          </form>
          <span className="newsletter-note">Sin spam, puedes cancelar cuando quieras.</span>
        </div>
      </section>
    </main>
  )
}
