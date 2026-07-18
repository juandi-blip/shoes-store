# Hero cinematográfico con scroll (sneaker) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el hero de video de la home por un hero cinematográfico donde la imagen de un sneaker hace zoom (125%→100%) ligado al scroll (GSAP ScrollTrigger), con overlay oscuro y texto que se revela al terminar el scroll.

**Architecture:** Un hook `useHeroScrollEffect` encapsula toda la lógica de GSAP/ScrollTrigger (recibe refs, anima, limpia). `HomePage.jsx` solo monta la estructura JSX y llama al hook — no conoce GSAP directamente.

**Tech Stack:** React 19, GSAP (`gsap` + `gsap/ScrollTrigger`), Vitest + @testing-library/react.

## Global Constraints

- Imagen del sneaker (verificada HTTP 200): `https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600`
- Animación: `scale: 1.25 → 1.0`, `ease: 'power2.out'`, `scrollTrigger: { start: 'top top', end: 'bottom bottom', scrub: 1 }`.
- Wrapper alto: `height: 250vh`. Sección pin: `position: sticky; top: 0; height: 100vh`.
- Cleanup con `gsap.context(...)` + `ctx.revert()` — obligatorio, evita fugas de `ScrollTrigger` entre montajes/HMR.
- Respetar `prefers-reduced-motion: reduce` (patrón ya usado en `src/components/ProductCard.jsx:17-20` vía `window.matchMedia('(prefers-reduced-motion: reduce)').matches`): si el usuario lo prefiere, se omite la animación de GSAP y el contenido se revela de inmediato.
- Sin efecto de máscara SVG de texto (descartado explícitamente por el usuario) — solo el zoom de la imagen.
- No tocar ninguna otra sección de `HomePage.jsx` (marcas, categorías, productos, newsletter).

---

## Task 1: Dependencia GSAP + hook `useHeroScrollEffect`

**Files:**
- Modify: `package.json` (agregar dependencia `gsap`)
- Create: `src/hooks/useHeroScrollEffect.js`
- Test: `src/hooks/useHeroScrollEffect.test.js`

**Interfaces:**
- Produces: `useHeroScrollEffect(wrapperRef, imgRef, contentRef)` — hook sin valor de retorno. `wrapperRef`/`imgRef`/`contentRef` son `React.RefObject` a los elementos DOM del wrapper alto, la `<img>` del sneaker y el contenedor de texto, respectivamente. Cuando termina la animación (o si `prefers-reduced-motion: reduce`), agrega la clase `is-revealed` al elemento de `contentRef`.

- [ ] **Step 1: Instalar gsap**

Run: `pnpm add gsap`

- [ ] **Step 2: Escribir el test (falla primero)**

Crear `src/hooks/useHeroScrollEffect.test.js`:

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
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
  const imgRef = useRef(null)
  const contentRef = useRef(null)
  useHeroScrollEffect(wrapperRef, imgRef, contentRef)
  return (
    <div ref={wrapperRef}>
      <img ref={imgRef} alt="" />
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

  it('no agrega is-revealed de inmediato con movimiento normal (la anima GSAP/scroll)', () => {
    mockMatchMedia(false)
    const { getByTestId } = render(<HeroDeTest />)
    expect(getByTestId('content')).not.toHaveClass('is-revealed')
  })
})
```

- [ ] **Step 3: Correr el test y verificar que falla**

Run: `pnpm vitest run src/hooks/useHeroScrollEffect.test.js`
Expected: FAIL con "Failed to resolve import './useHeroScrollEffect'" (el archivo todavía no existe).

- [ ] **Step 4: Implementar el hook**

Crear `src/hooks/useHeroScrollEffect.js`:

```js
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** ¿El usuario prefiere reducir el movimiento? (mismo criterio que ProductCard.jsx) */
function prefiereMenosMovimiento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Anima la imagen del hero (scale 1.25 → 1.0) ligada al scroll dentro de
 * `wrapperRef`, y agrega `is-revealed` a `contentRef` cuando el scroll
 * llega al final del wrapper. Técnica adaptada de la landing de GTA VI
 * (GSAP + ScrollTrigger con scrub). Si el usuario prefiere menos
 * movimiento, se omite la animación y el contenido se revela de inmediato.
 *
 * @param {import('react').RefObject<HTMLElement>} wrapperRef
 * @param {import('react').RefObject<HTMLElement>} imgRef
 * @param {import('react').RefObject<HTMLElement>} contentRef
 */
export function useHeroScrollEffect(wrapperRef, imgRef, contentRef) {
  useEffect(() => {
    if (!wrapperRef.current || !imgRef.current || !contentRef.current) return

    if (prefiereMenosMovimiento()) {
      contentRef.current.classList.add('is-revealed')
      return
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
      tl.fromTo(
        imgRef.current,
        { scale: 1.25 },
        { scale: 1, ease: 'power2.out', duration: 1 }
      ).call(() => contentRef.current.classList.add('is-revealed'))
    }, wrapperRef)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `pnpm vitest run src/hooks/useHeroScrollEffect.test.js`
Expected: PASS (3/3)

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/hooks/useHeroScrollEffect.js src/hooks/useHeroScrollEffect.test.js
git commit -m "feat: add useHeroScrollEffect hook with GSAP ScrollTrigger"
```

---

## Task 2: Integrar el hero en HomePage + CSS

**Files:**
- Modify: `src/pages/HomePage.jsx:1-84`
- Modify: `src/styles/tienda1.css:680-777` (eliminar reglas viejas del hero, agregar `.hero-scroll*`)
- Test: `src/pages/HomePage.test.jsx`

**Interfaces:**
- Consumes: `useHeroScrollEffect(wrapperRef, imgRef, contentRef)` de Task 1.

- [ ] **Step 1: Escribir el test (falla primero)**

Crear `src/pages/HomePage.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import HomePage from './HomePage'

// GSAP/ScrollTrigger depende de layout real del DOM (offsets, viewport)
// que jsdom no simula, así que no se prueba el scrub/easing en sí — solo
// que la estructura del hero (imagen, overlay, contenido) está presente.
function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
}

describe('HomePage — hero con scroll', () => {
  it('renderiza la imagen del sneaker con overlay y el bloque de contenido', () => {
    renderHomePage()
    const seccion = document.querySelector('.hero-scroll')
    expect(seccion).toBeInTheDocument()
    expect(document.querySelector('.hero-scroll__img')).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600'
    )
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
Expected: FAIL — no existe `.hero-scroll` todavía (el hero actual usa `.hero.homepage-hero` con `<video>`).

- [ ] **Step 3: Reemplazar el hero en HomePage.jsx**

En `src/pages/HomePage.jsx`, agregar el import del hook y `useRef` (línea 1), la constante de la imagen junto a `CATEGORIAS` (después de línea 28), los refs dentro del componente (antes del `return`, después de línea 58), y reemplazar la sección `<section className="hero homepage-hero" ...>` completa (líneas 63-84) por la nueva estructura.

Import y `useRef` (línea 1):

```jsx
import { useMemo, useRef } from 'react'
```

Agregar el hook al lado de los otros imports (después de línea 7, junto a `useDocumentHead`):

```jsx
import { useHeroScrollEffect } from '../hooks/useHeroScrollEffect'
```

Constante de la imagen del sneaker (después de `CATEGORIAS`, línea 28):

```jsx
/** Imagen del sneaker protagonista del hero con efecto de scroll. */
const HERO_SNEAKER_IMG = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600'
```

Refs y llamada al hook, dentro de `HomePage()` (después de `useScrollReveal(...)`, línea 58):

```jsx
  const heroWrapperRef = useRef(null)
  const heroImgRef = useRef(null)
  const heroContentRef = useRef(null)
  useHeroScrollEffect(heroWrapperRef, heroImgRef, heroContentRef)
```

Reemplazar la sección hero completa (líneas 62-84) por:

```jsx
      {/* ===== HERO ===== */}
      <section className="hero-scroll" ref={heroWrapperRef} aria-label="Banner principal">
        <div className="hero-scroll__pin">
          <img ref={heroImgRef} className="hero-scroll__img" src={HERO_SNEAKER_IMG} alt="" />
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

- [ ] **Step 4: Reemplazar el CSS del hero en tienda1.css**

En `src/styles/tienda1.css`, eliminar estas reglas (ya no las usa ningún JSX tras el Step 3): `.hero__image-wrap` (líneas 690-693), `.hero__image-wrap::after` (695-706), `.hero__video` (715-723), `.homepage-hero` (1319-1327) y `.hero__overlay` (1329-1334).

Agregar en su lugar, donde estaba `.homepage-hero`/`.hero__overlay` (alrededor de la línea 1318):

```css
/* ── Main Hero: scroll cinematográfico con sneaker ── */
.hero-scroll {
  position: relative;
  height: 250vh;
}

.hero-scroll__pin {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-scroll__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}

.hero-scroll__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(13, 13, 13, 0.95) 0%, rgba(0, 0, 0, 0.7) 45%, rgba(0, 0, 0, 0.4) 100%);
  pointer-events: none;
}

.hero-scroll__content {
  opacity: 0;
  transition: opacity 0.6s ease;
}

.hero-scroll__content.is-revealed {
  opacity: 1;
}
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `pnpm vitest run src/pages/HomePage.test.jsx`
Expected: PASS (2/2)

- [ ] **Step 6: Correr toda la suite**

Run: `pnpm test`
Expected: todos los tests pasan (sin regresiones en `Navbar.test.jsx`, `Footer.test.jsx`, etc.)

- [ ] **Step 7: Commit**

```bash
git add src/pages/HomePage.jsx src/pages/HomePage.test.jsx src/styles/tienda1.css
git commit -m "feat: replace video hero with GSAP scroll-driven sneaker hero"
```
