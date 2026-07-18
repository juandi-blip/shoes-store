# Fase 5 — Imágenes por género en mega-menú + páginas del footer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the mega-menu promo card sharing one image across Hombre/Mujer/Niños, and turn the 13 dead footer links (`to: '#'`) into real content pages.

**Architecture:** Part 1 adds a per-género `img` field to the existing `MEGA_MENUS` data and points `Navbar.jsx` at it instead of the shared static asset. Part 2 introduces one reusable `InfoPage` layout component (title + SEO head + content slot) and 13 thin page components built on top of it, wired into `App.jsx` as lazy routes inside `StoreLayout`, then `Footer.jsx`'s link data is updated to point at the new routes.

**Tech Stack:** React 19, react-router-dom v6, Vite, Vitest + @testing-library/react (colocated `*.test.jsx` files), oxlint.

## Global Constraints

- Tests colocate next to source: `Component.jsx` + `Component.test.jsx` in the same folder (no `__tests__` dirs).
- Test imports: `import { describe, it, expect } from 'vitest'`, `import { render, screen, fireEvent } from '@testing-library/react'`, `import '@testing-library/jest-dom'`. Wrap anything using `Link`/routes in `<MemoryRouter>`.
- New pages get their own SEO metadata via `useDocumentHead({ title, description, canonicalPath })` (`src/hooks/useDocumentHead.js`) — `canonicalPath` has no leading slash.
- New routes live inside `StoreLayout` in `src/App.jsx` (Navbar+Footer chrome) and are `lazy()`-loaded, matching Catálogo/Carrito/Pago.
- Run `pnpm test`, `pnpm lint`, and `pnpm build` clean before each commit that touches app code.
- Contact/location data used across pages must be internally consistent:
  - Email: `contacto@shoesstore.com.co`
  - Teléfono: `+57 601 743 2891`
  - WhatsApp: `+57 300 452 8890`
  - Tienda Bogotá: Carrera 11 #93-45, Chapinero, Bogotá D.C.
  - Tienda Medellín: Centro Comercial Santafé, Local 214, Medellín
  - Horario: Lunes a sábado, 9:00 a.m. – 7:00 p.m.
  - Empleo: `empleo@shoesstore.com.co`

---

## Part 1 — Per-género mega-menu image

### Task 1: Distinct promo image per género in mega-menu

**Files:**
- Modify: `src/components/megaMenuData.js:39` (mujer promo), `:73` (hombre promo), `:100` (ninos promo)
- Modify: `src/components/Navbar.jsx:1-6` (imports), `:208` (img src)
- Modify: `src/components/Navbar.test.jsx` (append test)
- Delete: `public/megamenu-promo.png`

**Interfaces:**
- Produces: `MEGA_MENUS[genero].promo.img` — string URL, present on `mujer`, `hombre`, `ninos` (not on `deporte`, which has no `promo` key at all).

- [ ] **Step 1: Write the failing test**

Append to `src/components/Navbar.test.jsx` (after the existing `describe('Navbar — mega-menú por teclado', ...)` block):

```jsx
describe('Navbar — mega-menú promo', () => {
  it('cada mega-menú con promo usa una imagen distinta según género', () => {
    renderNavbar()
    const imgMujer = screen.getByAltText('Nueva Colección Mujer')
    const imgHombre = screen.getByAltText('Lanzamiento Exclusivo')
    const imgNinos = screen.getByAltText('Back to School')
    const srcs = [imgMujer.src, imgHombre.src, imgNinos.src]
    expect(new Set(srcs).size).toBe(3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- Navbar.test.jsx`
Expected: FAIL — `Unable to find an element with the alt text: Nueva Colección Mujer` (or similar), since today's `<img>` alt is `menu.promo.title` but `src` is identical across all three, and `getByAltText` alone should actually still find them — the real failure is the `Set` size assertion: `expect(new Set(srcs).size).toBe(3)` fails because all three share `assetUrl('megamenu-promo.png')`, so `new Set(srcs).size` is `1`, not `3`.

- [ ] **Step 3: Add `img` field to each géner promo in `megaMenuData.js`**

In `src/components/megaMenuData.js`, change line 39:

```js
    promo: { title: 'Nueva Colección Mujer', sub: 'Primavera 2026', to: '/catalogo?genero=mujer&novedad=true' },
```

to:

```js
    promo: {
      title: 'Nueva Colección Mujer',
      sub: 'Primavera 2026',
      to: '/catalogo?genero=mujer&novedad=true',
      img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
    },
```

Change line 73:

```js
    promo: { title: 'Lanzamiento Exclusivo', sub: 'Solo en Shoes Store', to: '/catalogo?genero=hombre&novedad=true' },
```

to:

```js
    promo: {
      title: 'Lanzamiento Exclusivo',
      sub: 'Solo en Shoes Store',
      to: '/catalogo?genero=hombre&novedad=true',
      img: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800',
    },
```

Change line 100:

```js
    promo: { title: 'Back to School', sub: 'Colección Infantil', to: '/catalogo?genero=ninos' },
```

to:

```js
    promo: {
      title: 'Back to School',
      sub: 'Colección Infantil',
      to: '/catalogo?genero=ninos',
      img: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800',
    },
```

- [ ] **Step 4: Point `Navbar.jsx` at `menu.promo.img` and drop the unused import**

In `src/components/Navbar.jsx`, remove line 6:

```js
import { assetUrl } from '../utils/assetUrl'
```

Change line 208 from:

```jsx
                <img src={assetUrl('megamenu-promo.png')} alt={menu.promo.title} loading="lazy" />
```

to:

```jsx
                <img src={menu.promo.img} alt={menu.promo.title} loading="lazy" />
```

- [ ] **Step 5: Delete the now-unused static asset**

```bash
rm "public/megamenu-promo.png"
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm test -- Navbar.test.jsx`
Expected: PASS (all Navbar tests, including the new one)

- [ ] **Step 7: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: both exit 0, no "unused import" warning for `assetUrl`, no reference errors for the deleted PNG

- [ ] **Step 8: Commit**

```bash
git add src/components/megaMenuData.js src/components/Navbar.jsx src/components/Navbar.test.jsx public/megamenu-promo.png
git commit -m "fix: distinct promo image per género in mega-menu"
```

---

## Part 2 — Footer pages

### Task 2: `InfoPage` shared layout component

**Files:**
- Create: `src/components/InfoPage.jsx`
- Create: `src/components/InfoPage.test.jsx`
- Create: `src/styles/info-page.css`
- Modify: `src/main.jsx:9-10` (add stylesheet import before `glamour.css`)

**Interfaces:**
- Produces: `InfoPage({ title: string, description: string, canonicalPath: string, children: ReactNode })` — default export. Renders `<main className="info-page">` wrapping `<h1>{title}</h1>` (clean, no suffix) and `<div className="info-page__content">{children}</div>`, and calls `useDocumentHead({ title: \`${title} — Shoes Store\`, description, canonicalPath })` — the brand suffix is appended only for `document.title`/SEO tags, matching the pattern already used in `CatalogoPage.jsx:47` (`'Catálogo | Shoes Store'`), not shown in the `<h1>`. All 13 page components in later tasks pass their plain page name as `title` (e.g. `"Estado de tu Pedido"`) and get `document.title === "Estado de tu Pedido — Shoes Store"` for free.

- [ ] **Step 1: Write the failing test**

Create `src/components/InfoPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InfoPage from './InfoPage'

function renderInfoPage(props = {}) {
  return render(
    <MemoryRouter>
      <InfoPage
        title={props.title ?? 'Título de prueba'}
        description={props.description ?? 'Descripción de prueba'}
        canonicalPath={props.canonicalPath ?? 'prueba'}
      >
        <p>Contenido de prueba</p>
      </InfoPage>
    </MemoryRouter>
  )
}

describe('InfoPage', () => {
  it('renderiza el título como <h1> y el contenido hijo', () => {
    renderInfoPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Título de prueba' })).toBeInTheDocument()
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument()
  })

  it('actualiza document.title vía useDocumentHead, agregando el sufijo de marca', () => {
    renderInfoPage({ title: 'Otro título' })
    expect(document.title).toBe('Otro título — Shoes Store')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- InfoPage.test.jsx`
Expected: FAIL — `Failed to resolve import "./InfoPage"` (file doesn't exist yet)

- [ ] **Step 3: Create `InfoPage.jsx`**

```jsx
import { useDocumentHead } from '../hooks/useDocumentHead'

/**
 * Layout compartido por las páginas de contenido estático (Ayuda, Nosotros,
 * Legal): título, metadatos SEO vía useDocumentHead, y un slot de contenido.
 */
export default function InfoPage({ title, description, canonicalPath, children }) {
  useDocumentHead({ title: `${title} — Shoes Store`, description, canonicalPath })

  return (
    <main className="info-page">
      <div className="section-container info-page__container">
        <h1>{title}</h1>
        <div className="info-page__content">{children}</div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Create `src/styles/info-page.css`**

```css
.info-page {
  padding: 6rem 0 5rem;
  color: var(--color-text);
}

.info-page__container {
  max-width: 860px;
}

.info-page h1 {
  font-size: var(--text-3xl);
  margin-bottom: 2.5rem;
}

.info-page__content {
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.info-page__content h2 {
  color: var(--color-text);
  font-size: var(--text-xl);
  margin: 2rem 0 0.75rem;
}

.info-page__content h2:first-child {
  margin-top: 0;
}

.info-page__content p {
  margin-bottom: 1rem;
}

.info-page__content ul {
  margin: 0 0 1rem 1.25rem;
}

.info-page__content li {
  margin-bottom: 0.5rem;
}

.info-page__content a {
  color: var(--color-text);
  text-decoration: underline;
}
```

- [ ] **Step 5: Import the stylesheet in `main.jsx`**

In `src/main.jsx`, change:

```js
import './styles/carrito.css'
import './styles/glamour.css' // capa de elevación visual, siempre al final para ganar la cascada
```

to:

```js
import './styles/carrito.css'
import './styles/info-page.css'
import './styles/glamour.css' // capa de elevación visual, siempre al final para ganar la cascada
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm test -- InfoPage.test.jsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/InfoPage.jsx src/components/InfoPage.test.jsx src/styles/info-page.css src/main.jsx
git commit -m "feat: add InfoPage shared layout for static content pages"
```

---

### Task 3: Páginas de Ayuda (4 páginas + rutas)

**Files:**
- Create: `src/pages/ayuda/EstadoPedidoPage.jsx`, `src/pages/ayuda/EstadoPedidoPage.test.jsx`
- Create: `src/pages/ayuda/EnviosPage.jsx`, `src/pages/ayuda/EnviosPage.test.jsx`
- Create: `src/pages/ayuda/DevolucionesPage.jsx`, `src/pages/ayuda/DevolucionesPage.test.jsx`
- Create: `src/pages/ayuda/OpcionesPagoPage.jsx`, `src/pages/ayuda/OpcionesPagoPage.test.jsx`
- Modify: `src/App.jsx` (imports + 4 routes inside `StoreLayout`)

**Interfaces:**
- Consumes: `InfoPage` from Task 2 (`src/components/InfoPage.jsx`).
- Produces: routes `/ayuda/estado-pedido`, `/ayuda/envios`, `/ayuda/devoluciones`, `/ayuda/pago` — consumed by Task 7 (Footer wiring).

- [ ] **Step 1: Write the failing tests**

Create `src/pages/ayuda/EstadoPedidoPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EstadoPedidoPage from './EstadoPedidoPage'

describe('EstadoPedidoPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><EstadoPedidoPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Estado de tu Pedido' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><EstadoPedidoPage /></MemoryRouter>)
    expect(document.title).toBe('Estado de tu Pedido — Shoes Store')
  })
})
```

Create `src/pages/ayuda/EnviosPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EnviosPage from './EnviosPage'

describe('EnviosPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><EnviosPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Envíos y Entregas' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><EnviosPage /></MemoryRouter>)
    expect(document.title).toBe('Envíos y Entregas — Shoes Store')
  })
})
```

Create `src/pages/ayuda/DevolucionesPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DevolucionesPage from './DevolucionesPage'

describe('DevolucionesPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><DevolucionesPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Devoluciones y Cambios' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><DevolucionesPage /></MemoryRouter>)
    expect(document.title).toBe('Devoluciones y Cambios — Shoes Store')
  })
})
```

Create `src/pages/ayuda/OpcionesPagoPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OpcionesPagoPage from './OpcionesPagoPage'

describe('OpcionesPagoPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><OpcionesPagoPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Opciones de Pago' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><OpcionesPagoPage /></MemoryRouter>)
    expect(document.title).toBe('Opciones de Pago — Shoes Store')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/pages/ayuda`
Expected: FAIL — `Failed to resolve import "./EstadoPedidoPage"` etc. (files don't exist yet)

- [ ] **Step 3: Create the 4 page components**

Create `src/pages/ayuda/EstadoPedidoPage.jsx`:

```jsx
import { Link } from 'react-router-dom'
import InfoPage from '../../components/InfoPage'

export default function EstadoPedidoPage() {
  return (
    <InfoPage
      title="Estado de tu Pedido"
      description="Consulta el estado de tu pedido en Shoes Store: en preparación, en camino o entregado."
      canonicalPath="ayuda/estado-pedido"
    >
      <p>
        Una vez confirmado tu pago, tu pedido pasa por tres etapas: <strong>en preparación</strong> (empacamos tu
        pedido en nuestra bodega), <strong>en camino</strong> (la transportadora lo tiene en ruta) y{' '}
        <strong>entregado</strong>.
      </p>
      <h2>¿Dónde veo el estado?</h2>
      <p>
        Si iniciaste sesión antes de comprar, revisa la sección "Mis Pedidos" en tu{' '}
        <Link to="/perfil">perfil</Link>. Ahí verás el número de guía y la fecha estimada de entrega.
      </p>
      <h2>¿Tu pedido está demorado?</h2>
      <p>
        Los tiempos estimados son de 2 a 5 días hábiles en ciudades principales y de 5 a 8 días hábiles en el resto
        del país. Si tu pedido supera ese rango, escríbenos a <a href="mailto:contacto@shoesstore.com.co">contacto@shoesstore.com.co</a>{' '}
        con tu número de orden.
      </p>
    </InfoPage>
  )
}
```

Create `src/pages/ayuda/EnviosPage.jsx`:

```jsx
import InfoPage from '../../components/InfoPage'

export default function EnviosPage() {
  return (
    <InfoPage
      title="Envíos y Entregas"
      description="Tiempos, costos y cobertura de envío de Shoes Store en Colombia."
      canonicalPath="ayuda/envios"
    >
      <h2>Cobertura</h2>
      <p>Enviamos a todo el territorio nacional a través de transportadoras aliadas.</p>
      <h2>Tiempos estimados</h2>
      <ul>
        <li>Bogotá, Medellín, Cali y Barranquilla: 2 a 5 días hábiles.</li>
        <li>Resto del país: 5 a 8 días hábiles.</li>
        <li>Zonas rurales o de difícil acceso: hasta 10 días hábiles.</li>
      </ul>
      <h2>Costos</h2>
      <p>
        El envío es gratuito en compras superiores a $250.000 COP. Para el resto de compras, el costo se calcula
        según destino y se muestra antes de confirmar el pago.
      </p>
    </InfoPage>
  )
}
```

Create `src/pages/ayuda/DevolucionesPage.jsx`:

```jsx
import InfoPage from '../../components/InfoPage'

export default function DevolucionesPage() {
  return (
    <InfoPage
      title="Devoluciones y Cambios"
      description="Política de devoluciones y cambios de Shoes Store: 30 días para cambiar de opinión."
      canonicalPath="ayuda/devoluciones"
    >
      <h2>Plazo</h2>
      <p>Tienes 30 días calendario desde que recibes tu pedido para solicitar un cambio o devolución.</p>
      <h2>Condiciones</h2>
      <ul>
        <li>El producto debe estar sin uso, con su empaque original y etiquetas.</li>
        <li>Debe incluir la factura o comprobante de compra.</li>
        <li>Productos en Outlet marcados como "venta final" no aplican para devolución.</li>
      </ul>
      <h2>¿Cómo lo solicito?</h2>
      <p>
        Escríbenos a <a href="mailto:contacto@shoesstore.com.co">contacto@shoesstore.com.co</a> con tu número de
        orden y el motivo. Te confirmamos la recogida o el punto de entrega más cercano.
      </p>
    </InfoPage>
  )
}
```

Create `src/pages/ayuda/OpcionesPagoPage.jsx`:

```jsx
import InfoPage from '../../components/InfoPage'

export default function OpcionesPagoPage() {
  return (
    <InfoPage
      title="Opciones de Pago"
      description="Métodos de pago disponibles en Shoes Store: tarjetas, PSE y contraentrega."
      canonicalPath="ayuda/pago"
    >
      <h2>Métodos disponibles</h2>
      <ul>
        <li>Tarjetas de crédito y débito (Visa, Mastercard, American Express).</li>
        <li>PSE — débito directo desde tu cuenta bancaria.</li>
        <li>Pago contraentrega, disponible en ciudades principales.</li>
      </ul>
      <h2>Seguridad</h2>
      <p>
        Todas las transacciones se procesan de forma cifrada. Shoes Store no almacena los datos completos de tu
        tarjeta.
      </p>
    </InfoPage>
  )
}
```

- [ ] **Step 4: Register the 4 routes in `App.jsx`**

In `src/App.jsx`, add lazy imports after line 17 (`const PerfilPage = ...`):

```js
const EstadoPedidoPage = lazy(() => import('./pages/ayuda/EstadoPedidoPage'))
const EnviosPage = lazy(() => import('./pages/ayuda/EnviosPage'))
const DevolucionesPage = lazy(() => import('./pages/ayuda/DevolucionesPage'))
const OpcionesPagoPage = lazy(() => import('./pages/ayuda/OpcionesPagoPage'))
```

Add routes inside `StoreLayout`'s `<Route element={<StoreLayout />}>` block, after the `/pago` route (line 54):

```jsx
                  <Route path="/pago" element={<PagoPage />} />
                  <Route path="/ayuda/estado-pedido" element={<EstadoPedidoPage />} />
                  <Route path="/ayuda/envios" element={<EnviosPage />} />
                  <Route path="/ayuda/devoluciones" element={<DevolucionesPage />} />
                  <Route path="/ayuda/pago" element={<OpcionesPagoPage />} />
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test -- src/pages/ayuda`
Expected: PASS (8 tests)

- [ ] **Step 6: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: both exit 0

- [ ] **Step 7: Commit**

```bash
git add src/pages/ayuda src/App.jsx
git commit -m "feat: add 4 páginas de Ayuda (estado de pedido, envíos, devoluciones, pago)"
```

---

### Task 4: Página de Contacto

**Files:**
- Create: `src/pages/ContactoPage.jsx`, `src/pages/ContactoPage.test.jsx`
- Modify: `src/App.jsx` (import + route)

**Interfaces:**
- Consumes: `InfoPage` from Task 2.
- Produces: route `/contacto` — consumed by Task 7.

- [ ] **Step 1: Write the failing test**

Create `src/pages/ContactoPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ContactoPage from './ContactoPage'

describe('ContactoPage', () => {
  it('renderiza el título y los datos de contacto', () => {
    render(<MemoryRouter><ContactoPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Contáctanos' })).toBeInTheDocument()
    expect(screen.getByText('contacto@shoesstore.com.co')).toBeInTheDocument()
    expect(screen.getByText('+57 601 743 2891')).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><ContactoPage /></MemoryRouter>)
    expect(document.title).toBe('Contáctanos — Shoes Store')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- ContactoPage.test.jsx`
Expected: FAIL — `Failed to resolve import "./ContactoPage"`

- [ ] **Step 3: Create `ContactoPage.jsx`**

```jsx
import InfoPage from '../components/InfoPage'

export default function ContactoPage() {
  return (
    <InfoPage
      title="Contáctanos"
      description="Escríbenos, llámanos o visítanos. Datos de contacto de Shoes Store."
      canonicalPath="contacto"
    >
      <h2>Escríbenos</h2>
      <p>
        Correo: <a href="mailto:contacto@shoesstore.com.co">contacto@shoesstore.com.co</a>
        <br />
        Teléfono: <a href="tel:+576017432891">+57 601 743 2891</a>
        <br />
        WhatsApp: <a href="tel:+573004528890">+57 300 452 8890</a>
      </p>
      <h2>Horario de atención</h2>
      <p>Lunes a sábado, 9:00 a.m. – 7:00 p.m.</p>
      <h2>Sede principal</h2>
      <p>Carrera 11 #93-45, Chapinero, Bogotá D.C., Colombia.</p>
    </InfoPage>
  )
}
```

- [ ] **Step 4: Register the route in `App.jsx`**

Add lazy import after the `ayuda` imports from Task 3:

```js
const ContactoPage = lazy(() => import('./pages/ContactoPage'))
```

Add route after `/ayuda/pago`:

```jsx
                  <Route path="/contacto" element={<ContactoPage />} />
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- ContactoPage.test.jsx`
Expected: PASS

- [ ] **Step 6: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: both exit 0

- [ ] **Step 7: Commit**

```bash
git add src/pages/ContactoPage.jsx src/pages/ContactoPage.test.jsx src/App.jsx
git commit -m "feat: add página de Contacto"
```

---

### Task 5: Páginas Nuestra Historia y Sostenibilidad

**Files:**
- Create: `src/pages/nosotros/HistoriaPage.jsx`, `src/pages/nosotros/HistoriaPage.test.jsx`
- Create: `src/pages/nosotros/SostenibilidadPage.jsx`, `src/pages/nosotros/SostenibilidadPage.test.jsx`
- Modify: `src/App.jsx` (imports + 2 routes)

**Interfaces:**
- Consumes: `InfoPage` from Task 2.
- Produces: routes `/nosotros/historia`, `/nosotros/sostenibilidad` — consumed by Task 7.

- [ ] **Step 1: Write the failing tests**

Create `src/pages/nosotros/HistoriaPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HistoriaPage from './HistoriaPage'

describe('HistoriaPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><HistoriaPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Nuestra Historia' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><HistoriaPage /></MemoryRouter>)
    expect(document.title).toBe('Nuestra Historia — Shoes Store')
  })
})
```

Create `src/pages/nosotros/SostenibilidadPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SostenibilidadPage from './SostenibilidadPage'

describe('SostenibilidadPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><SostenibilidadPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Sostenibilidad' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><SostenibilidadPage /></MemoryRouter>)
    expect(document.title).toBe('Sostenibilidad — Shoes Store')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/pages/nosotros`
Expected: FAIL — imports don't resolve yet

- [ ] **Step 3: Create the 2 page components**

Create `src/pages/nosotros/HistoriaPage.jsx`:

```jsx
import InfoPage from '../../components/InfoPage'

export default function HistoriaPage() {
  return (
    <InfoPage
      title="Nuestra Historia"
      description="Cómo nació Shoes Store: la historia detrás de la marca."
      canonicalPath="nosotros/historia"
    >
      <p>
        Shoes Store nació en Bogotá en 2019, de la idea de un grupo de amigos apasionados por la cultura sneaker
        que no encontraba en Colombia una tienda especializada, con curaduría real y atención cercana.
      </p>
      <h2>De un local a una tienda online</h2>
      <p>
        Empezamos con un local pequeño en Chapinero. Hoy combinamos esa misma atención personalizada con una
        tienda online que llega a todo el país, sin perder el criterio de selección que nos caracteriza desde el
        primer día.
      </p>
      <h2>Lo que nos mueve</h2>
      <p>
        Creemos que unas buenas sneakers son más que un producto: son una forma de expresión. Por eso cuidamos
        cada detalle, desde la selección de marcas hasta la experiencia de compra.
      </p>
    </InfoPage>
  )
}
```

Create `src/pages/nosotros/SostenibilidadPage.jsx`:

```jsx
import InfoPage from '../../components/InfoPage'

export default function SostenibilidadPage() {
  return (
    <InfoPage
      title="Sostenibilidad"
      description="Iniciativas de sostenibilidad de Shoes Store: empaques responsables y reciclaje."
      canonicalPath="nosotros/sostenibilidad"
    >
      <h2>Empaques responsables</h2>
      <p>
        Nuestras cajas y bolsas de envío usan cartón y papel reciclado, sin plásticos de un solo uso innecesarios.
      </p>
      <h2>Programa de reciclaje</h2>
      <p>
        Trae tus tenis usados a cualquiera de nuestras tiendas físicas y te damos un descuento en tu próxima
        compra. Los tenis recolectados se donan o se reciclan según su estado.
      </p>
      <h2>Marcas responsables</h2>
      <p>
        Priorizamos trabajar con marcas que reportan avances concretos en materiales reciclados y reducción de
        huella de carbono en su producción.
      </p>
    </InfoPage>
  )
}
```

- [ ] **Step 4: Register the 2 routes in `App.jsx`**

Add lazy imports after `ContactoPage`:

```js
const HistoriaPage = lazy(() => import('./pages/nosotros/HistoriaPage'))
const SostenibilidadPage = lazy(() => import('./pages/nosotros/SostenibilidadPage'))
```

Add routes after `/contacto`:

```jsx
                  <Route path="/nosotros/historia" element={<HistoriaPage />} />
                  <Route path="/nosotros/sostenibilidad" element={<SostenibilidadPage />} />
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test -- src/pages/nosotros`
Expected: PASS (4 tests)

- [ ] **Step 6: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: both exit 0

- [ ] **Step 7: Commit**

```bash
git add src/pages/nosotros src/App.jsx
git commit -m "feat: add páginas Nuestra Historia y Sostenibilidad"
```

---

### Task 6: Páginas Tiendas Físicas, Trabaja con Nosotros y App

**Files:**
- Create: `src/pages/TiendasPage.jsx`, `src/pages/TiendasPage.test.jsx`
- Create: `src/pages/TrabajaConNosotrosPage.jsx`, `src/pages/TrabajaConNosotrosPage.test.jsx`
- Create: `src/pages/AppPage.jsx`, `src/pages/AppPage.test.jsx`
- Modify: `src/App.jsx` (imports + 3 routes)

**Interfaces:**
- Consumes: `InfoPage` from Task 2.
- Produces: routes `/tiendas`, `/trabaja-con-nosotros`, `/app` — consumed by Task 7.

- [ ] **Step 1: Write the failing tests**

Create `src/pages/TiendasPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TiendasPage from './TiendasPage'

describe('TiendasPage', () => {
  it('renderiza el título y las dos ciudades', () => {
    render(<MemoryRouter><TiendasPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Tiendas Físicas' })).toBeInTheDocument()
    expect(screen.getByText(/Bogotá/)).toBeInTheDocument()
    expect(screen.getByText(/Medellín/)).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><TiendasPage /></MemoryRouter>)
    expect(document.title).toBe('Tiendas Físicas — Shoes Store')
  })
})
```

Create `src/pages/TrabajaConNosotrosPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TrabajaConNosotrosPage from './TrabajaConNosotrosPage'

describe('TrabajaConNosotrosPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><TrabajaConNosotrosPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Trabaja con Nosotros' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><TrabajaConNosotrosPage /></MemoryRouter>)
    expect(document.title).toBe('Trabaja con Nosotros — Shoes Store')
  })
})
```

Create `src/pages/AppPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppPage from './AppPage'

describe('AppPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><AppPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Shoes Store App' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><AppPage /></MemoryRouter>)
    expect(document.title).toBe('Shoes Store App — Shoes Store')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- TiendasPage.test.jsx TrabajaConNosotrosPage.test.jsx AppPage.test.jsx`
Expected: FAIL — imports don't resolve yet

- [ ] **Step 3: Create the 3 page components**

Create `src/pages/TiendasPage.jsx`:

```jsx
import InfoPage from '../components/InfoPage'

export default function TiendasPage() {
  return (
    <InfoPage
      title="Tiendas Físicas"
      description="Encuentra la tienda Shoes Store más cercana en Bogotá y Medellín."
      canonicalPath="tiendas"
    >
      <h2>Bogotá</h2>
      <p>
        Carrera 11 #93-45, Chapinero.
        <br />
        Lunes a sábado, 9:00 a.m. – 7:00 p.m.
      </p>
      <h2>Medellín</h2>
      <p>
        Centro Comercial Santafé, Local 214.
        <br />
        Lunes a sábado, 9:00 a.m. – 7:00 p.m.
      </p>
    </InfoPage>
  )
}
```

Create `src/pages/TrabajaConNosotrosPage.jsx`:

```jsx
import InfoPage from '../components/InfoPage'

export default function TrabajaConNosotrosPage() {
  return (
    <InfoPage
      title="Trabaja con Nosotros"
      description="Únete al equipo de Shoes Store. Vacantes y cómo postularte."
      canonicalPath="trabaja-con-nosotros"
    >
      <p>
        Estamos siempre buscando gente apasionada por la cultura sneaker y el buen servicio al cliente, para
        nuestras tiendas físicas y nuestro equipo digital.
      </p>
      <h2>¿Cómo postularte?</h2>
      <p>
        Envía tu hoja de vida a <a href="mailto:empleo@shoesstore.com.co">empleo@shoesstore.com.co</a> contándonos
        en qué área te gustaría trabajar (tienda, logística, marketing o tecnología). Si hay una vacante afín, te
        contactamos.
      </p>
    </InfoPage>
  )
}
```

Create `src/pages/AppPage.jsx`:

```jsx
import InfoPage from '../components/InfoPage'

export default function AppPage() {
  return (
    <InfoPage
      title="Shoes Store App"
      description="La app móvil de Shoes Store: novedades, seguimiento de pedidos y ofertas exclusivas."
      canonicalPath="app"
    >
      <p>Estamos construyendo la app móvil de Shoes Store, con:</p>
      <ul>
        <li>Notificaciones de nuevos lanzamientos antes que nadie.</li>
        <li>Seguimiento de tus pedidos en tiempo real.</li>
        <li>Ofertas exclusivas para usuarios de la app.</li>
      </ul>
      <p>Déjanos tu correo en nuestro newsletter para avisarte apenas esté disponible.</p>
    </InfoPage>
  )
}
```

- [ ] **Step 4: Register the 3 routes in `App.jsx`**

Add lazy imports after `SostenibilidadPage`:

```js
const TiendasPage = lazy(() => import('./pages/TiendasPage'))
const TrabajaConNosotrosPage = lazy(() => import('./pages/TrabajaConNosotrosPage'))
const AppPage = lazy(() => import('./pages/AppPage'))
```

Add routes after `/nosotros/sostenibilidad`:

```jsx
                  <Route path="/tiendas" element={<TiendasPage />} />
                  <Route path="/trabaja-con-nosotros" element={<TrabajaConNosotrosPage />} />
                  <Route path="/app" element={<AppPage />} />
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test -- TiendasPage.test.jsx TrabajaConNosotrosPage.test.jsx AppPage.test.jsx`
Expected: PASS (6 tests)

- [ ] **Step 6: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: both exit 0

- [ ] **Step 7: Commit**

```bash
git add src/pages/TiendasPage.jsx src/pages/TiendasPage.test.jsx src/pages/TrabajaConNosotrosPage.jsx src/pages/TrabajaConNosotrosPage.test.jsx src/pages/AppPage.jsx src/pages/AppPage.test.jsx src/App.jsx
git commit -m "feat: add páginas Tiendas Físicas, Trabaja con Nosotros y App"
```

---

### Task 7: Páginas legales

**Files:**
- Create: `src/pages/legal/TerminosPage.jsx`, `src/pages/legal/TerminosPage.test.jsx`
- Create: `src/pages/legal/PrivacidadPage.jsx`, `src/pages/legal/PrivacidadPage.test.jsx`
- Create: `src/pages/legal/AvisoLegalPage.jsx`, `src/pages/legal/AvisoLegalPage.test.jsx`
- Modify: `src/App.jsx` (imports + 3 routes)

**Interfaces:**
- Consumes: `InfoPage` from Task 2.
- Produces: routes `/legal/terminos`, `/legal/privacidad`, `/legal/aviso-legal` — consumed by Task 8.

- [ ] **Step 1: Write the failing tests**

Create `src/pages/legal/TerminosPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TerminosPage from './TerminosPage'

describe('TerminosPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><TerminosPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Términos de Uso' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><TerminosPage /></MemoryRouter>)
    expect(document.title).toBe('Términos de Uso — Shoes Store')
  })
})
```

Create `src/pages/legal/PrivacidadPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PrivacidadPage from './PrivacidadPage'

describe('PrivacidadPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><PrivacidadPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Política de Privacidad' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><PrivacidadPage /></MemoryRouter>)
    expect(document.title).toBe('Política de Privacidad — Shoes Store')
  })
})
```

Create `src/pages/legal/AvisoLegalPage.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AvisoLegalPage from './AvisoLegalPage'

describe('AvisoLegalPage', () => {
  it('renderiza el título de la página', () => {
    render(<MemoryRouter><AvisoLegalPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Aviso Legal' })).toBeInTheDocument()
  })

  it('actualiza el título del documento', () => {
    render(<MemoryRouter><AvisoLegalPage /></MemoryRouter>)
    expect(document.title).toBe('Aviso Legal — Shoes Store')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/pages/legal`
Expected: FAIL — imports don't resolve yet

- [ ] **Step 3: Create the 3 page components**

Create `src/pages/legal/TerminosPage.jsx`:

```jsx
import InfoPage from '../../components/InfoPage'

export default function TerminosPage() {
  return (
    <InfoPage
      title="Términos de Uso"
      description="Términos y condiciones de uso del sitio Shoes Store."
      canonicalPath="legal/terminos"
    >
      <p>
        Al usar este sitio aceptas estos términos. Shoes Store se reserva el derecho de actualizar precios,
        disponibilidad de productos y condiciones de envío sin previo aviso.
      </p>
      <h2>Cuentas de usuario</h2>
      <p>
        Eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad realizada desde tu
        cuenta.
      </p>
      <h2>Compras</h2>
      <p>
        Los precios se muestran en pesos colombianos (COP) e incluyen los impuestos aplicables. Una compra se
        confirma únicamente tras la aprobación del pago.
      </p>
    </InfoPage>
  )
}
```

Create `src/pages/legal/PrivacidadPage.jsx`:

```jsx
import InfoPage from '../../components/InfoPage'

export default function PrivacidadPage() {
  return (
    <InfoPage
      title="Política de Privacidad"
      description="Cómo Shoes Store recopila, usa y protege tus datos personales."
      canonicalPath="legal/privacidad"
    >
      <h2>Qué datos recopilamos</h2>
      <p>
        Nombre, correo, dirección de envío y datos de contacto que nos das al crear una cuenta o al completar una
        compra.
      </p>
      <h2>Para qué los usamos</h2>
      <ul>
        <li>Procesar y enviar tus pedidos.</li>
        <li>Comunicarnos contigo sobre el estado de tu compra.</li>
        <li>Enviarte novedades, solo si te suscribes al newsletter.</li>
      </ul>
      <h2>Tus derechos</h2>
      <p>
        Puedes solicitar la actualización o eliminación de tus datos escribiendo a{' '}
        <a href="mailto:contacto@shoesstore.com.co">contacto@shoesstore.com.co</a>.
      </p>
    </InfoPage>
  )
}
```

Create `src/pages/legal/AvisoLegalPage.jsx`:

```jsx
import InfoPage from '../../components/InfoPage'

export default function AvisoLegalPage() {
  return (
    <InfoPage
      title="Aviso Legal"
      description="Aviso legal del sitio Shoes Store."
      canonicalPath="legal/aviso-legal"
    >
      <p>
        Shoes Store es un proyecto académico desarrollado como evidencia de aprendizaje del SENA
        (GA7-220501096-AA4-EV03). El catálogo, precios e imágenes de este sitio son de carácter demostrativo y no
        corresponden a una operación comercial real.
      </p>
      <h2>Marcas mencionadas</h2>
      <p>
        Nike, Adidas, Jordan, Puma, New Balance, Vans, Converse y Hoka se mencionan únicamente con fines
        ilustrativos; sus marcas y logotipos pertenecen a sus respectivos titulares.
      </p>
    </InfoPage>
  )
}
```

- [ ] **Step 4: Register the 3 routes in `App.jsx`**

Add lazy imports after `AppPage`:

```js
const TerminosPage = lazy(() => import('./pages/legal/TerminosPage'))
const PrivacidadPage = lazy(() => import('./pages/legal/PrivacidadPage'))
const AvisoLegalPage = lazy(() => import('./pages/legal/AvisoLegalPage'))
```

Add routes after `/app`:

```jsx
                  <Route path="/legal/terminos" element={<TerminosPage />} />
                  <Route path="/legal/privacidad" element={<PrivacidadPage />} />
                  <Route path="/legal/aviso-legal" element={<AvisoLegalPage />} />
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test -- src/pages/legal`
Expected: PASS (6 tests)

- [ ] **Step 6: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: both exit 0

- [ ] **Step 7: Commit**

```bash
git add src/pages/legal src/App.jsx
git commit -m "feat: add páginas legales (términos, privacidad, aviso legal)"
```

---

### Task 8: Wire Footer links to the new routes

**Files:**
- Modify: `src/components/Footer.jsx:15-34` (`COLUMNAS` data), `:86-88` (legal links)
- Create: `src/components/Footer.test.jsx`

**Interfaces:**
- Consumes: all 13 routes produced by Tasks 3–7.

- [ ] **Step 1: Write the failing test**

Create `src/components/Footer.test.jsx`:

```jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './Footer'

describe('Footer — enlaces', () => {
  it('ningún enlace de las columnas Ayuda o Shoes Store queda como placeholder "#"', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    const enlaces = [
      'Estado de Pedido',
      'Envíos y Entregas',
      'Devoluciones',
      'Opciones de Pago',
      'Contacto',
      'Nuestra Historia',
      'Sostenibilidad',
      'Tiendas Físicas',
      'Trabaja con Nosotros',
      'Shoes Store App',
    ]
    enlaces.forEach((texto) => {
      const link = screen.getByRole('link', { name: texto })
      expect(link.getAttribute('href')).not.toBe('#')
      expect(link.getAttribute('href')).toMatch(/^\//)
    })
  })

  it('los enlaces legales del pie apuntan a rutas reales', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Términos de Uso' }).getAttribute('href')).toBe('/legal/terminos')
    expect(screen.getByRole('link', { name: 'Política de Privacidad' }).getAttribute('href')).toBe('/legal/privacidad')
    expect(screen.getByRole('link', { name: 'Aviso Legal' }).getAttribute('href')).toBe('/legal/aviso-legal')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- Footer.test.jsx`
Expected: FAIL — links still resolve to `href="#"` for "Estado de Pedido" etc., and legal links aren't `<Link>`s yet

- [ ] **Step 3: Update `COLUMNAS` in `Footer.jsx`**

Change lines 15-34 from:

```js
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
```

to:

```js
  {
    titulo: 'Ayuda',
    links: [
      { label: 'Estado de Pedido', to: '/ayuda/estado-pedido' },
      { label: 'Envíos y Entregas', to: '/ayuda/envios' },
      { label: 'Devoluciones', to: '/ayuda/devoluciones' },
      { label: 'Opciones de Pago', to: '/ayuda/pago' },
      { label: 'Contacto', to: '/contacto' },
    ],
  },
  {
    titulo: 'Shoes Store',
    links: [
      { label: 'Nuestra Historia', to: '/nosotros/historia' },
      { label: 'Sostenibilidad', to: '/nosotros/sostenibilidad' },
      { label: 'Tiendas Físicas', to: '/tiendas' },
      { label: 'Trabaja con Nosotros', to: '/trabaja-con-nosotros' },
      { label: 'Shoes Store App', to: '/app' },
    ],
  },
```

- [ ] **Step 4: Update the legal links in `Footer.jsx`**

Change lines 85-89 from:

```jsx
            <ul className="legal-links">
              <li><a href="#">Términos de Uso</a></li>
              <li><a href="#">Política de Privacidad</a></li>
              <li><a href="#">Aviso Legal</a></li>
            </ul>
```

to:

```jsx
            <ul className="legal-links">
              <li><Link to="/legal/terminos">Términos de Uso</Link></li>
              <li><Link to="/legal/privacidad">Política de Privacidad</Link></li>
              <li><Link to="/legal/aviso-legal">Aviso Legal</Link></li>
            </ul>
```

(`Link` is already imported at the top of `Footer.jsx`, line 1 — no import change needed.)

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- Footer.test.jsx`
Expected: PASS

- [ ] **Step 6: Run the full suite, lint and build**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass — this is the integration point where every route from Tasks 3–7 gets exercised via the Footer

- [ ] **Step 7: Commit**

```bash
git add src/components/Footer.jsx src/components/Footer.test.jsx
git commit -m "fix: wire footer links (Ayuda, Shoes Store, legales) to real pages"
```

---

## Manual verification (after Task 8)

- [ ] Run `pnpm dev`, open the site, hover/focus Mujer, Hombre and Niños in the navbar — confirm 3 different promo images.
- [ ] Click every link in the footer's "Ayuda", "Shoes Store" and legal rows — confirm each lands on a real page with its own title (browser tab) and content, not a page reload to `#`.
