# Hero con crossfade de sneakers + zoom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la única imagen de sneaker del hero (zoom 125%→100% ligado al scroll) por un crossfade de 5 sneakers distintos que se mezclan mientras el scroll avanza, manteniendo el mismo zoom.

**Architecture:** `useHeroScrollEffect` cambia de animar una sola `<img>` a animar un contenedor (`stackRef`) con 5 `<img>` apiladas: el `scale` se aplica al contenedor completo, y el crossfade anima la opacidad de cada imagen en su tramo del timeline. `HomePage.jsx` pasa el nuevo `stackRef` en vez de `imgRef`.

**Tech Stack:** React 19, GSAP (`gsap` + `gsap/ScrollTrigger`, ya instalado), Vitest + @testing-library/react.

## Global Constraints

- 5 imágenes, en este orden exacto:
  1. `https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600`
  2. `https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=1600`
  3. `https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1600`
  4. `https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=1600`
  5. `https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80&w=1600`
- Hook signature: `useHeroScrollEffect(wrapperRef, stackRef, contentRef)` — `stackRef` apunta a un contenedor cuyos hijos directos son las `<img>` (no una sola `<img>` como antes).
- `scale: 1.25 → 1.0` se aplica al `stackRef` completo (no a cada imagen), `ease: 'power2.out'`, `scrollTrigger: { start: 'top top', end: 'bottom bottom', scrub: 1 }`.
- Crossfade: para N imágenes, el timeline tiene N-1 tramos consecutivos (posiciones `0, 1, 2, ...`); cada tramo desvanece la imagen `i-1` a opacity 0 mientras sube la imagen `i` a opacity 1, ambos con `ease: 'none', duration: 1`.
- `prefers-reduced-motion: reduce`: deja visible solo la ÚLTIMA imagen (`gsap.set` a opacity 0 en todas, luego opacity 1 en la última) y revela el contenido de inmediato — sin animación.
- Cleanup con `gsap.context(...)` + `ctx.revert()` (ya establecido, no cambia).
- Solo la primera `<img>` del stack lleva `alt=""`; las demás no llevan `alt` (son parte de la misma pieza decorativa continua).
- No tocar ninguna otra sección de `HomePage.jsx`.

---

## Task 1: Actualizar `useHeroScrollEffect` para animar un stack de imágenes

**Files:**
- Modify: `src/hooks/useHeroScrollEffect.js` (archivo completo — reemplaza la versión de una sola imagen)
- Modify: `src/hooks/useHeroScrollEffect.test.jsx` (archivo completo — reemplaza los tests existentes)

**Interfaces:**
- Produces: `useHeroScrollEffect(wrapperRef, stackRef, contentRef)` — `stackRef.current.children` son las `<img>` del crossfade, en orden. Sin valor de retorno. Agrega `is-revealed` a `contentRef.current` al terminar (o de inmediato si `prefers-reduced-motion: reduce`).

- [ ] **Step 1: Escribir el test (falla primero)**

Reemplazar el contenido completo de `src/hooks/useHeroScrollEffect.test.jsx`:

```jsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRef } from 'react'
import { useHeroScrollEffect } from './useHeroScrollEffect'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function mockMatchMedia(prefiereMenosMovimiento) {
  vi.stubGlobal('matchMedia', (query) => ({
    matches: prefiereMenosMovimiento,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

function HeroDeTest() {
  const wrapperRef = useRef(null)
  const stackRef = useRef(null)
  const contentRef = useRef(null)
  useHeroScrollEffect(wrapperRef, stackRef, contentRef)
  return (
    <div ref={wrapperRef}>
      <div ref={stackRef}>
        <img alt="" data-testid="img-0" />
        <img data-testid="img-1" />
        <img data-testid="img-2" />
      </div>
      <div ref={contentRef} data-testid="content" />
    </div>
  )
}

describe('useHeroScrollEffect', () => {
  it('no explota al montar y desmontar con movimiento normal', () => {
    mockMatchMedia(false)
    const { unmount } = render(<HeroDeTest />)
    expect(() => unmount()).not.toThrow()
  })

  it('revela el contenido de inmediato si el usuario prefiere menos movimiento', () => {
    mockMatchMedia(true)
    const { getByTestId } = render(<HeroDeTest />)
    expect(getByTestId('content')).toHaveClass('is-revealed')
  })

  it('con movimiento reducido deja solo la última imagen visible', () => {
    mockMatchMedia(true)
    const { getByTestId } = render(<HeroDeTest />)
    expect(getByTestId('img-0')).toHaveStyle({ opacity: '0' })
    expect(getByTestId('img-1')).toHaveStyle({ opacity: '0' })
    expect(getByTestId('img-2')).toHaveStyle({ opacity: '1' })
  })

  it('no agrega is-revealed de inmediato con movimiento normal (la anima GSAP/scroll)', () => {
    mockMatchMedia(false)
    const { getByTestId } = render(<HeroDeTest />)
    expect(getByTestId('content')).not.toHaveClass('is-revealed')
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm vitest run src/hooks/useHeroScrollEffect.test.jsx`
Expected: FAIL — el hook actual todavía espera `imgRef` (una sola `<img>`), no `stackRef` con varios hijos; el test de "última imagen visible" no encuentra la lógica de `gsap.set` sobre varios hijos.

- [ ] **Step 3: Reemplazar la implementación del hook**

Reemplazar el contenido completo de `src/hooks/useHeroScrollEffect.js`:

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

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm vitest run src/hooks/useHeroScrollEffect.test.jsx`
Expected: PASS (4/4)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useHeroScrollEffect.js src/hooks/useHeroScrollEffect.test.jsx
git commit -m "feat: animate hero as a crossfading image stack instead of a single image"
```

---

## Task 2: Integrar las 5 imágenes en HomePage + CSS

**Files:**
- Modify: `src/pages/HomePage.jsx:1-85` (imports, constante `HERO_SNEAKER_IMG` → `HERO_SNEAKER_IMGS`, refs, JSX del hero)
- Modify: `src/styles/tienda1.css:1290-1332` (agregar `.hero-scroll__stack`, ajustar `.hero-scroll__img`)
- Modify: `src/pages/HomePage.test.jsx` (archivo completo — actualizar aserciones del hero)

**Interfaces:**
- Consumes: `useHeroScrollEffect(wrapperRef, stackRef, contentRef)` de Task 1.

- [ ] **Step 1: Escribir el test (falla primero)**

Reemplazar el bloque `describe('HomePage — hero con scroll', ...)` completo (líneas 35-54 de `src/pages/HomePage.test.jsx`) por:

```jsx
describe('HomePage — hero con scroll', () => {
  it('renderiza las 5 imágenes del stack en orden, con overlay y bloque de contenido', () => {
    renderHomePage()
    const seccion = document.querySelector('.hero-scroll')
    expect(seccion).toBeInTheDocument()

    const imgs = document.querySelectorAll('.hero-scroll__stack .hero-scroll__img')
    expect(imgs).toHaveLength(5)
    expect(imgs[0]).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600'
    )
    expect(imgs[4]).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80&w=1600'
    )
    expect(imgs[0]).toHaveAttribute('alt', '')

    expect(document.querySelector('.hero-scroll__overlay')).toBeInTheDocument()
  })

  it('muestra el título, subtítulo y los CTA del hero', () => {
    renderHomePage()
    expect(screen.getByRole('heading', { level: 1, name: 'Eleva tu estilo' })).toBeInTheDocument()
    expect(screen.getByText(/Las sneakers más exclusivas del momento/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'COMPRAR AHORA' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'VER COLECCIÓN' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm vitest run src/pages/HomePage.test.jsx`
Expected: FAIL — todavía existe una sola `.hero-scroll__img` fuera de `.hero-scroll__stack` (ese contenedor no existe aún).

- [ ] **Step 3: Actualizar la constante y los refs en HomePage.jsx**

Reemplazar la constante `HERO_SNEAKER_IMG` (línea 31-32) por:

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

Reemplazar `heroImgRef` por `heroStackRef` (línea 65, dentro de `HomePage()`):

```jsx
  const heroWrapperRef = useRef(null)
  const heroStackRef = useRef(null)
  const heroContentRef = useRef(null)
  useHeroScrollEffect(heroWrapperRef, heroStackRef, heroContentRef)
```

- [ ] **Step 4: Reemplazar el JSX del hero**

Reemplazar la sección hero completa (líneas 71-85 tras el Step 3) por:

```jsx
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
```

- [ ] **Step 5: Actualizar el CSS**

En `src/styles/tienda1.css`, reemplazar la regla `.hero-scroll__img` (líneas 1306-1313) por estas dos reglas:

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

- [ ] **Step 6: Correr el test y verificar que pasa**

Run: `pnpm vitest run src/pages/HomePage.test.jsx`
Expected: PASS (2/2)

- [ ] **Step 7: Correr toda la suite**

Run: `pnpm test`
Expected: todos los tests pasan, sin regresiones.

- [ ] **Step 8: Commit**

```bash
git add src/pages/HomePage.jsx src/pages/HomePage.test.jsx src/styles/tienda1.css
git commit -m "feat: show 5-sneaker crossfade sequence in the hero"
```
