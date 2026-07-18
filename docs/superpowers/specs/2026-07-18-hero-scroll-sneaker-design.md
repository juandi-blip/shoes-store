# Hero cinematográfico con scroll (sneaker) — Design

**Fecha:** 2026-07-18
**Estado:** Aprobado

## Contexto

El hero actual de `HomePage.jsx` (`src/pages/HomePage.jsx:63-84`) es un video de fondo en loop con overlay oscuro y texto que aparece con `fade-in` inmediato. El objetivo es reemplazarlo por un hero con un efecto de scroll cinematográfico inspirado en dos referencias:

- Un tutorial de scroll animation en JS vanilla (`javascript100.dev/12-moto-scroll`): imagen que hace zoom/rotación mientras se scrollea dentro de una sección fija.
- El clon educativo de la landing de GTA VI (`github.com/midudev/landing-gta-vi`): usa **GSAP + ScrollTrigger** con `scrub`, escalando la imagen hero de 125%→100% mientras el logo/texto se desvanece.

Se adapta la técnica de GSAP/ScrollTrigger (sin el efecto de máscara SVG del logo, que es específico de GTA VI) a un hero con la imagen de un sneaker como protagonista.

## Alcance

- Reemplaza la sección `<section className="hero...">` de `HomePage.jsx` (incluye eliminar el `<video>` de fondo actual).
- No afecta ninguna otra sección de la home (marcas, categorías, productos, newsletter).
- No incluye el efecto de "logo mask" de GTA VI (decisión explícita del usuario: solo zoom de imagen).

## Stack

Se agrega **`gsap`** (incluye el plugin `ScrollTrigger`) como dependencia de producción — la única librería de animación del proyecto. Es la misma técnica que usa la referencia de GTA VI y evita reimplementar scrub/easing a mano.

## Diseño

### Estructura (`HomePage.jsx`)

```
<section className="hero-scroll" ref={wrapperRef}>          {/* height: 250vh */}
  <div className="hero-scroll__pin">                        {/* position: sticky; top:0; height:100vh */}
    <img ref={imgRef} className="hero-scroll__img" src={HERO_SNEAKER_IMG} alt="" />
    <div className="hero-scroll__overlay"></div>
    <div className="hero-scroll__content" ref={contentRef}>  {/* clase is-revealed la agrega el hook */}
      <h1 className="hero__title">...</h1>                   {/* mismo texto/markup que hoy */}
      <p className="hero__subtitle">...</p>
      <div className="hero__actions">...</div>
    </div>
  </div>
</section>
```

- `wrapperRef`: el contenedor alto que define cuánto scroll dura el efecto.
- `imgRef`: la imagen del sneaker, blanco de la animación GSAP.
- `contentRef`: recibe la clase `is-revealed` cuando el timeline termina.

### Hook `src/hooks/useHeroScrollEffect.js`

```js
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Anima la imagen del hero (scale 1.25 → 1.0) ligada al scroll dentro de
 * `wrapperRef`, y agrega `is-revealed` a `contentRef` cuando el scroll
 * llega al final del wrapper. Técnica adaptada de la landing de GTA VI
 * (GSAP + ScrollTrigger con scrub).
 */
export function useHeroScrollEffect(wrapperRef, imgRef, contentRef) {
  useEffect(() => {
    if (!wrapperRef.current || !imgRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      })
      tl.fromTo(
        imgRef.current,
        { scale: 1.25 },
        { scale: 1, ease: 'power2.out', duration: 1 }
      ).call(() => contentRef.current.classList.add('is-revealed'))
    }, wrapperRef)

    return () => ctx.revert()
  }, [wrapperRef, imgRef, contentRef])
}
```

- `gsap.context` + `ctx.revert()` en el cleanup: mata el `ScrollTrigger` y cualquier tween creado, evitando fugas entre montajes/HMR — necesario porque `HomePage` es una ruta lazy que puede desmontarse/remontarse.
- El `.call()` agrega la clase de reveal al llegar al final del scrub; el fade-in del texto lo hace CSS (`hero-scroll__content.is-revealed`), mismo patrón que `.fade-in.is-visible` ya usado en el sitio (`useScrollReveal.js`).

### CSS (`src/styles/glamour.css` o nuevo bloque en `tienda1.css`, a decidir en el plan)

- `.hero-scroll { height: 250vh; }`
- `.hero-scroll__pin { position: sticky; top: 0; height: 100vh; overflow: hidden; }`
- `.hero-scroll__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; will-change: transform; }`
- `.hero-scroll__overlay`: gradiente oscuro más intenso que el actual `hero__overlay`, para el look cinematográfico tipo GTA VI.
- `.hero-scroll__content { opacity: 0; transition: opacity .6s ease; }` → `.is-revealed { opacity: 1; }`

### Imagen del sneaker

URL externa verificada (HTTP 200): `https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600` — sneaker en ángulo dramático sobre fondo oscuro, coherente con el overlay cinematográfico. Mismo patrón que las imágenes externas ya usadas en `megaMenuData.js` y `CATEGORIAS` (HomePage.jsx).

## Testing

GSAP/ScrollTrigger depende de layout real del DOM (offsets, altura de viewport) que **jsdom no simula** — no se puede probar el scrub/easing en Vitest. El test de `HomePage.jsx` verifica:

- La sección `.hero-scroll` existe con la imagen del sneaker (`alt` correcto) y el bloque de contenido con el título/CTA actuales.
- Se documenta con un comentario corto la limitación de jsdom para el efecto de scroll en sí, siguiendo el mismo criterio ya usado en el proyecto para otras limitaciones de jsdom.

No se testea `useHeroScrollEffect` de forma aislada más allá de verificar que no explota al montar/desmontar (jsdom no dispara scroll real).

## Fuera de alcance

- Efecto de máscara SVG sobre el texto/logo (estilo GTA VI) — descartado explícitamente.
- PNG transparente del sneaker — se usa foto normal con `object-fit: cover`, igual que el video actual.
- Cambios a otras secciones de la home.
