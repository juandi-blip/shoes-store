# Hero con crossfade de sneakers + zoom — Design

**Fecha:** 2026-07-18
**Estado:** Aprobado

## Contexto

El hero actual (`src/pages/HomePage.jsx`, hook `src/hooks/useHeroScrollEffect.js`) anima UNA imagen de sneaker con zoom (`scale: 1.25 → 1.0`) ligado al scroll vía GSAP ScrollTrigger. El usuario lo probó en el navegador y lo consideró poco impactante — quería algo más parecido a un giro 360° de producto (referencias exploradas: landing de GTA VI, demo "moto-scroll" de javascript100.dev, sitios premium tipo Nike/Apple).

Se investigó un giro 3D real (Three.js + modelo glTF) y se descartó: los únicos modelos 3D gratuitos con licencia libre disponibles (poly.pizza, "Poly by Google") son de estilo caricatura/low-poly, no fotorrealista, y no encajan con el look premium buscado. Renderizar fotogramas de un modelo 3D en Blender tampoco es viable (no hay Blender instalado, y es trabajo manual de horas). Se descartó también generar el modelo vía IA (image-to-3D) por calidad poco confiable.

Se intentó conseguir 4-6 fotos del MISMO producto en ángulos distintos desde el CDN de Adidas (URLs con sufijos `_02`, `_03`, `side`, `back`, etc.) — todas las variantes devuelven el mismo archivo (mismo tamaño en bytes), confirmando que no hay ángulos reales expuestos por URL predecible.

**Decisión final:** en vez de un giro de producto real, se usa un **crossfade de 5 fotos de sneakers distintos** (mismo tono oscuro/dramático que ya usa el hero) que se van mezclando mientras el usuario scrollea, combinado con el zoom que ya funciona. Es un montaje editorial, no un giro 3D — decisión consciente y explícita del usuario tras descartar las alternativas reales.

## Alcance

- Modifica `src/hooks/useHeroScrollEffect.js` (nueva lógica de crossfade) y `src/pages/HomePage.jsx` (5 imágenes en vez de 1).
- No cambia la estructura de texto/CTA del hero, ni el resto de la home.
- No introduce dependencias nuevas (sigue usando `gsap`, ya instalado).

## Imágenes (5, todas verificadas HTTP 200, sin duplicar con otras imágenes de la home)

1. `https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600` (la actual — se mantiene como primer frame)
2. `https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=1600`
3. `https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1600`
4. `https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=1600`
5. `https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80&w=1600`

(Se evitó `photo-1608231387042-66d1773070a5`, ya usada en `promo-banner` de la misma `HomePage.jsx:130`.)

## Diseño

### Estructura (`HomePage.jsx`)

```jsx
/** Secuencia de sneakers del hero (crossfade ligado al scroll). */
const HERO_SNEAKER_IMGS = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80&w=1600',
]
```

En el JSX, el único `<img ref={heroImgRef} .../>` se reemplaza por un contenedor con las 5 imágenes apiladas (todas `position: absolute; inset: 0`, superpuestas exactamente):

```jsx
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
```

- Solo la primera imagen lleva `alt=""` (decorativa, ya establecido); el resto no necesita `alt` porque nunca son la única imagen visible de forma persistente fuera de la animación (son parte de la misma pieza decorativa continua). Estado inicial en JSX (`opacity` inline) evita un parpadeo antes de que GSAP tome control.

### Hook `useHeroScrollEffect.js`

Firma nueva: `useHeroScrollEffect(wrapperRef, stackRef, contentRef)` — el segundo parámetro pasa de ser la imagen única a ser el contenedor `.hero-scroll__stack` con las 5 `<img>` como hijos directos.

```js
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let scrollTriggerRegistered = false

/** ¿El usuario prefiere reducir el movimiento? (mismo criterio que ProductCard.jsx) */
function prefiereMenosMovimiento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Anima el stack de sneakers del hero: zoom (scale 1.25 → 1.0) ligado al
 * scroll, con crossfade secuencial entre las imágenes apiladas dentro de
 * `stackRef` (la 1 se desvanece mientras entra la 2, y así hasta la
 * última). Agrega `is-revealed` a `contentRef` cuando el scroll llega al
 * final del wrapper. Si el usuario prefiere menos movimiento, se omite
 * la animación: se deja visible solo la última imagen y el contenido se
 * revela de inmediato.
 *
 * @param {import('react').RefObject<HTMLElement>} wrapperRef
 * @param {import('react').RefObject<HTMLElement>} stackRef
 * @param {import('react').RefObject<HTMLElement>} contentRef
 */
export function useHeroScrollEffect(wrapperRef, stackRef, contentRef) {
  useEffect(() => {
    if (!wrapperRef.current || !stackRef.current || !contentRef.current) return

    const imgs = stackRef.current.children

    if (prefiereMenosMovimiento()) {
      gsap.set(imgs, { opacity: 0 })
      gsap.set(imgs[imgs.length - 1], { opacity: 1 })
      contentRef.current.classList.add('is-revealed')
      return
    }

    if (!scrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger)
      scrollTriggerRegistered = true
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      })
      tl.fromTo(stackRef.current, { scale: 1.25 }, { scale: 1, ease: 'power2.out', duration: 1 }, 0)
      for (let i = 1; i < imgs.length; i++) {
        tl.to(imgs[i - 1], { opacity: 0, ease: 'none', duration: 1 }, i - 1)
        tl.to(imgs[i], { opacity: 1, ease: 'none', duration: 1 }, i - 1)
      }
      tl.call(() => contentRef.current.classList.add('is-revealed'))
    }, wrapperRef)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
```

- El `scale` se aplica al contenedor `stackRef` completo (no a cada `<img>` individualmente) para que las 5 imágenes hagan zoom juntas como una sola pieza — evita animar 5 transforms por separado.
- Los crossfades se distribuyen en el mismo timeline en posiciones `0, 1, 2, 3` (uno por cada par consecutivo de imágenes), de forma que con 5 imágenes el timeline total dura 4 "unidades", cada una cubriendo 1/4 del scroll del wrapper.
- `gsap.set` en la rama de `prefiereMenosMovimiento` deja solo la última imagen visible sin animación, consistente con "mostrar el estado final de inmediato" (mismo criterio que la versión de una sola imagen).

### CSS (`src/styles/tienda1.css`)

`.hero-scroll__img` pasa de una regla simple a necesitar apilado:

```css
.hero-scroll__stack {
  position: absolute;
  inset: 0;
  will-change: transform;
}

.hero-scroll__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

(Se quita `will-change: transform` de `.hero-scroll__img` individual — ahora vive en `.hero-scroll__stack`, que es lo que GSAP anima con `scale`.)

## Testing

Igual que la versión anterior: GSAP/ScrollTrigger no se puede simular en jsdom (offsets/layout reales). El test de `HomePage.jsx` se actualiza para verificar que las 5 `<img>` existen dentro de `.hero-scroll__stack` con los `src` correctos (en el orden de `HERO_SNEAKER_IMGS`), en vez de una sola imagen. El test del hook (`useHeroScrollEffect.test.jsx`) se actualiza: el segundo ref ahora es un contenedor con varios `<img>` hijos (no una sola `<img>`), y se verifica que con `prefers-reduced-motion` la última imagen queda con opacidad 1 y las demás en 0.

## Fuera de alcance

- Giro 3D real (Three.js) — descartado explícitamente, sin assets fotorrealistas gratuitos disponibles.
- Secuencia de fotogramas de un único producto real — descartado, no hay fuente gratuita confiable.
- Cambios a otras secciones de la home.
