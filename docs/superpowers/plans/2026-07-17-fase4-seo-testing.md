# Fase 4: SEO y testing ampliado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar a cada ruta principal título/meta-description/Open Graph propios, exponer JSON-LD `Product` en el detalle de producto, publicar `robots.txt`/`sitemap.xml`, y cubrir con tests de componentes la lógica de negocio de `PagoPage`, `CatalogoPage` y `Navbar`.

**Architecture:** Dos hooks nuevos sin dependencias (`useDocumentHead`, `useJsonLd`) que manipulan `document.head` directamente vía `useEffect`; se consumen desde `HomePage`, `CatalogoPage` y `ProductoDetallePage`. `robots.txt`/`sitemap.xml` son archivos estáticos en `public/`, generados una vez con un comando Node de una línea a partir de `src/data/productos.json`. Los tests nuevos usan Vitest + Testing Library + `MemoryRouter`, sin tocar los 4 archivos de test existentes.

**Tech Stack:** React 19, React Router 6 (`MemoryRouter`, `useLocation`), Vitest 4, @testing-library/react 16, jsdom.

## Global Constraints

- Sin dependencias nuevas (no `react-helmet-async`).
- Sitio desplegado en `https://juandi-blip.github.io/shoes-store/` (`base: '/shoes-store/'` en build) — todas las URLs absolutas (canonical, sitemap, robots) usan este dominio+prefijo.
- El precio en COP para el JSON-LD se calcula con `TASA_COP` importado de `src/utils/pricing.js` (nunca un literal `4200` nuevo).
- Los 4 archivos de test existentes (`pricing.test.js`, `CartContext.test.jsx`, `SessionContext.test.jsx`, `useProductos.test.js`) deben seguir pasando sin modificaciones.
- No se generan páginas de sitemap para `/login`, `/registro`, `/perfil`, `/carrito`, `/pago`.

---

### Task 1: Hook `useDocumentHead`

**Files:**
- Create: `src/hooks/useDocumentHead.js`
- Test: `src/hooks/useDocumentHead.test.js`

**Interfaces:**
- Produces: `useDocumentHead({ title: string, description: string, ogImage?: string, canonicalPath: string })` — hook sin valor de retorno. `canonicalPath` no debe empezar con `/` (ej. `''`, `'catalogo'`, `'producto/001'`).

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useDocumentHead.test.js`:

```javascript
import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDocumentHead } from './useDocumentHead'

afterEach(() => {
  document.head
    .querySelectorAll(
      'meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]'
    )
    .forEach((el) => el.remove())
  document.title = ''
})

describe('useDocumentHead', () => {
  it('setea document.title y meta description', () => {
    renderHook(() =>
      useDocumentHead({ title: 'Título de prueba', description: 'Descripción de prueba', canonicalPath: '' })
    )
    expect(document.title).toBe('Título de prueba')
    expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe(
      'Descripción de prueba'
    )
  })

  it('setea el canonical con el path dado, sin barra final para la raíz', () => {
    renderHook(() => useDocumentHead({ title: 'Home', description: 'desc', canonicalPath: '' }))
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(
      'https://juandi-blip.github.io/shoes-store'
    )
  })

  it('setea el canonical con un path anidado', () => {
    renderHook(() => useDocumentHead({ title: 'Producto', description: 'desc', canonicalPath: 'producto/001' }))
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(
      'https://juandi-blip.github.io/shoes-store/producto/001'
    )
  })

  it('setea og:image y twitter:image solo si se pasa ogImage', () => {
    renderHook(() =>
      useDocumentHead({
        title: 'Producto',
        description: 'desc',
        ogImage: 'https://example.com/img.jpg',
        canonicalPath: 'producto/001',
      })
    )
    expect(document.querySelector('meta[property="og:image"]').getAttribute('content')).toBe(
      'https://example.com/img.jpg'
    )
    expect(document.querySelector('meta[name="twitter:image"]').getAttribute('content')).toBe(
      'https://example.com/img.jpg'
    )
  })

  it('no crea og:image ni twitter:image si no se pasa ogImage', () => {
    renderHook(() => useDocumentHead({ title: 'Home', description: 'desc', canonicalPath: '' }))
    expect(document.querySelector('meta[property="og:image"]')).toBeNull()
    expect(document.querySelector('meta[name="twitter:image"]')).toBeNull()
  })

  it('actualiza los tags existentes en vez de duplicarlos al re-renderizar con otro título', () => {
    const { rerender } = renderHook(
      ({ title }) => useDocumentHead({ title, description: 'desc', canonicalPath: '' }),
      { initialProps: { title: 'Uno' } }
    )
    rerender({ title: 'Dos' })
    expect(document.title).toBe('Dos')
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- useDocumentHead.test.js`
Expected: FAIL — `Failed to resolve import "./useDocumentHead"` (el archivo aún no existe).

- [ ] **Step 3: Write the implementation**

Create `src/hooks/useDocumentHead.js`:

```javascript
import { useEffect } from 'react'

const SITE_URL = 'https://juandi-blip.github.io/shoes-store'

function setMetaTag(selector, attrName, attrValue, content) {
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonicalLink(href) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Actualiza título, meta description, Open Graph, Twitter Card y canonical
 * del documento para la ruta actual. Sin cleanup: la siguiente ruta que
 * monte sobreescribe los mismos tags, sin dejar restos entre navegaciones.
 * @param {{title: string, description: string, ogImage?: string, canonicalPath: string}} params
 */
export function useDocumentHead({ title, description, ogImage, canonicalPath }) {
  useEffect(() => {
    document.title = title

    const canonicalUrl = `${SITE_URL}/${canonicalPath}`.replace(/\/$/, '') || SITE_URL

    setMetaTag('meta[name="description"]', 'name', 'description', description)
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title)
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description)
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description)

    if (ogImage) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage)
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage)
    }

    setCanonicalLink(canonicalUrl)
  }, [title, description, ogImage, canonicalPath])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- useDocumentHead.test.js`
Expected: PASS (6/6)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useDocumentHead.js src/hooks/useDocumentHead.test.js
git commit -m "feat: add useDocumentHead hook for per-route meta tags"
```

---

### Task 2: Hook `useJsonLd`

**Files:**
- Create: `src/hooks/useJsonLd.js`
- Test: `src/hooks/useJsonLd.test.js`

**Interfaces:**
- Produces: `useJsonLd(data: object|null)` — hook sin valor de retorno. Si `data` es `null`, no crea ni modifica ningún elemento.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useJsonLd.test.js`:

```javascript
import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useJsonLd } from './useJsonLd'

afterEach(() => {
  document.getElementById('jsonld-producto')?.remove()
})

describe('useJsonLd', () => {
  it('inyecta un script application/ld+json con el objeto serializado', () => {
    const data = { '@type': 'Product', name: 'Air Force 1' }
    renderHook(() => useJsonLd(data))
    const script = document.getElementById('jsonld-producto')
    expect(script).not.toBeNull()
    expect(script.type).toBe('application/ld+json')
    expect(JSON.parse(script.textContent)).toEqual(data)
  })

  it('no crea ningún script si el dato es null', () => {
    renderHook(() => useJsonLd(null))
    expect(document.getElementById('jsonld-producto')).toBeNull()
  })

  it('actualiza el contenido del script existente al cambiar el objeto', () => {
    const { rerender } = renderHook(({ data }) => useJsonLd(data), {
      initialProps: { data: { name: 'Uno' } },
    })
    rerender({ data: { name: 'Dos' } })
    const scripts = document.querySelectorAll('#jsonld-producto')
    expect(scripts).toHaveLength(1)
    expect(JSON.parse(scripts[0].textContent)).toEqual({ name: 'Dos' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- useJsonLd.test.js`
Expected: FAIL — `Failed to resolve import "./useJsonLd"`.

- [ ] **Step 3: Write the implementation**

Create `src/hooks/useJsonLd.js`:

```javascript
import { useEffect } from 'react'

const SCRIPT_ID = 'jsonld-producto'

/**
 * Inyecta/actualiza un <script type="application/ld+json"> en <head> con
 * los datos estructurados dados. Si `data` es null, no hace nada (permite
 * llamarlo siempre en el mismo orden de hooks aunque el producto aún no
 * se haya resuelto).
 * @param {object|null} data
 */
export function useJsonLd(data) {
  useEffect(() => {
    if (!data) return
    let script = document.getElementById(SCRIPT_ID)
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = SCRIPT_ID
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(data)
  }, [data])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- useJsonLd.test.js`
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useJsonLd.js src/hooks/useJsonLd.test.js
git commit -m "feat: add useJsonLd hook for structured data injection"
```

---

### Task 3: Meta tags dinámicos en HomePage y CatalogoPage

**Files:**
- Modify: `src/pages/HomePage.jsx:1-6,34-40`
- Modify: `src/pages/CatalogoPage.jsx:1-5,31-51`
- Test: `src/pages/CatalogoPage.test.jsx`

**Interfaces:**
- Consumes: `useDocumentHead` from Task 1 (`src/hooks/useDocumentHead.js`), signature `useDocumentHead({ title, description, ogImage?, canonicalPath })`.

- [ ] **Step 1: Add the import and call in `HomePage.jsx`**

In `src/pages/HomePage.jsx`, add the import alongside the existing ones (after the `assetUrl` import, currently line 6):

```javascript
import { useDocumentHead } from '../hooks/useDocumentHead'
```

Then, as the first line inside `export default function HomePage() {` (before `const { productos } = useProductos()`):

```javascript
  useDocumentHead({
    title: 'Shoes Store — Sneakers premium',
    description: 'Shoes Store — Las sneakers más exclusivas del momento. Rendimiento y diseño en cada paso.',
    canonicalPath: '',
  })
```

- [ ] **Step 2: Add the import and call in `CatalogoPage.jsx`**

In `src/pages/CatalogoPage.jsx`, change the import line (currently line 3):

```javascript
import { useProductos, filtrarYOrdenarProductos } from '../hooks/useProductos'
```

to:

```javascript
import { useProductos, filtrarYOrdenarProductos } from '../hooks/useProductos'
import { useDocumentHead } from '../hooks/useDocumentHead'
```

Then, immediately after the line `const qParam = searchParams.get('q') ?? ''` (currently line 44), add:

```javascript
  useDocumentHead({
    title: qParam ? `Resultados para "${qParam}" — Catálogo | Shoes Store` : 'Catálogo | Shoes Store',
    description:
      'Explora nuestro catálogo completo de sneakers premium: hombre, mujer y niños, running, basketball, lifestyle y más.',
    canonicalPath: 'catalogo',
  })
```

- [ ] **Step 3: Write the component test for `CatalogoPage`**

Create `src/pages/CatalogoPage.test.jsx`:

```javascript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CatalogoPage from './CatalogoPage'

function renderCatalogo(initialEntries = ['/catalogo']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <CatalogoPage />
    </MemoryRouter>
  )
}

function contadorActual() {
  return Number(screen.getByText(/productos$/).textContent.split(' ')[0])
}

describe('CatalogoPage — filtros', () => {
  it('sin filtros muestra los 80 productos del catálogo', () => {
    renderCatalogo()
    expect(contadorActual()).toBe(80)
  })

  it('togglear el checkbox de género "Hombre" reduce el conteo (40 productos)', () => {
    renderCatalogo()
    fireEvent.click(screen.getByLabelText('Hombre'))
    expect(contadorActual()).toBe(40)
  })

  it('el slider de precio máximo filtra los productos por encima del umbral', () => {
    renderCatalogo()
    const inicial = contadorActual()
    fireEvent.change(screen.getByLabelText('Precio máximo'), { target: { value: '50' } })
    expect(contadorActual()).toBeLessThan(inicial)
  })

  it('con ?q= en la URL inicial, muestra el mensaje de resultados de búsqueda', () => {
    renderCatalogo(['/catalogo?q=nike'])
    expect(screen.getByText(/Resultados para «nike»/)).toBeInTheDocument()
  })

  it('setea el título del documento según haya o no búsqueda activa', () => {
    renderCatalogo(['/catalogo?q=nike'])
    expect(document.title).toBe('Resultados para "nike" — Catálogo | Shoes Store')
  })
})
```

- [ ] **Step 4: Run the tests**

Run: `pnpm test -- CatalogoPage.test.jsx`
Expected: PASS (5/5)

- [ ] **Step 5: Run the full suite to confirm no regressions**

Run: `pnpm test`
Expected: PASS — all suites green, including the 4 pre-existing test files unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/pages/HomePage.jsx src/pages/CatalogoPage.jsx src/pages/CatalogoPage.test.jsx
git commit -m "feat: dynamic per-route meta tags for HomePage and CatalogoPage"
```

---

### Task 4: Meta tags + JSON-LD en ProductoDetallePage

**Files:**
- Modify: `src/pages/ProductoDetallePage.jsx:1-4,69-95`

**Interfaces:**
- Consumes: `useDocumentHead` (Task 1), `useJsonLd` (Task 2), `TASA_COP` from `src/utils/pricing.js` (already exported, value `4200`).

- [ ] **Step 1: Update imports**

In `src/pages/ProductoDetallePage.jsx`, change the import block (currently lines 1-6):

```javascript
import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProductos } from '../hooks/useProductos'
import { useCart } from '../context/CartContext'
import { imagenFallback } from '../utils/imagenes'
import Toast from '../components/Toast'
```

to:

```javascript
import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProductos } from '../hooks/useProductos'
import { useCart } from '../context/CartContext'
import { imagenFallback } from '../utils/imagenes'
import { useDocumentHead } from '../hooks/useDocumentHead'
import { useJsonLd } from '../hooks/useJsonLd'
import { TASA_COP } from '../utils/pricing'
import Toast from '../components/Toast'
```

- [ ] **Step 2: Add the hook calls before the early return**

In the component body, immediately after the line `const producto = productos.find((p) => p.id === id)` (currently line 73) and before the `useState` calls, insert:

```javascript
  useDocumentHead({
    title: producto ? `${producto.nombre} — ${producto.marca} | Shoes Store` : 'Producto no encontrado | Shoes Store',
    description: producto
      ? `${producto.nombre} de ${producto.marca}${producto.colorway ? ` — ${producto.colorway}` : ''}. Cómpralo en Shoes Store.`
      : 'No pudimos encontrar el producto que buscas.',
    ogImage: producto ? producto.imagen : undefined,
    canonicalPath: `producto/${id}`,
  })

  useJsonLd(
    producto
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: producto.nombre,
          brand: { '@type': 'Brand', name: producto.marca },
          image: producto.imagen,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'COP',
            price: String(Math.round(producto.precio * TASA_COP)),
            availability: 'https://schema.org/InStock',
          },
        }
      : null
  )
```

This must come **before** the existing `if (!producto) { return ... }` block (currently line 95), so both hooks are called unconditionally on every render regardless of whether the product exists (Rules of Hooks — no hook may live after a conditional early return).

- [ ] **Step 3: Manual verification**

Run the dev server and visit a real product page:

Run: `pnpm dev`

Navigate to `http://localhost:5173/producto/001` and, using the browser devtools console, run:

```javascript
document.title
document.querySelector('meta[property="og:image"]').content
JSON.parse(document.getElementById('jsonld-producto').textContent)
```

Expected: `document.title` is `"Air Force 1 '07 — Nike | Shoes Store"`, `og:image` content is the product's real image URL, and the parsed JSON-LD has `name: "Air Force 1 '07"`, `brand.name: "Nike"`, and `offers.price` equal to `String(Math.round(115 * 4200))` = `"483000"`.

Then navigate to `http://localhost:5173/producto/does-not-exist` and confirm the page doesn't crash (shows "Producto no encontrado") and `document.title` is `"Producto no encontrado | Shoes Store"`.

- [ ] **Step 4: Run the full test suite**

Run: `pnpm test`
Expected: PASS — no test file directly covers `ProductoDetallePage` yet, so this just confirms no regression in the rest of the suite.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ProductoDetallePage.jsx
git commit -m "feat: dynamic meta tags and Product JSON-LD in ProductoDetallePage"
```

---

### Task 5: `robots.txt` y `sitemap.xml`

**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml` (generated via a one-off Node command, not hand-typed)

**Interfaces:**
- None (static files, no code interface).

- [ ] **Step 1: Create `public/robots.txt`**

Create `public/robots.txt` with exactly this content:

```
User-agent: *
Allow: /

Sitemap: https://juandi-blip.github.io/shoes-store/sitemap.xml
```

- [ ] **Step 2: Generate `public/sitemap.xml`**

Run this exact command from the repo root (it reads `src/data/productos.json` — 80 products with sequential ids `"001"`..`"080"` — and writes the sitemap deterministically):

```bash
node -e "
const fs = require('fs');
const productos = require('./src/data/productos.json');
const base = 'https://juandi-blip.github.io/shoes-store';
const urls = [
  { loc: base + '/', changefreq: 'weekly', priority: '1.0' },
  { loc: base + '/catalogo', changefreq: 'daily', priority: '0.9' },
  ...productos.map((p) => ({ loc: base + '/producto/' + p.id, changefreq: 'weekly', priority: '0.7' })),
];
const body = urls
  .map(
    (u) =>
      '  <url>\n    <loc>' + u.loc + '</loc>\n    <changefreq>' + u.changefreq + '</changefreq>\n    <priority>' + u.priority + '</priority>\n  </url>'
  )
  .join('\n');
const xml = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n' + body + '\n</urlset>\n';
fs.writeFileSync('public/sitemap.xml', xml);
console.log('wrote', urls.length, 'urls to public/sitemap.xml');
"
```

Expected output: `wrote 82 urls to public/sitemap.xml` (80 products + `/` + `/catalogo`).

- [ ] **Step 3: Verify the generated file**

Run: `node -e "const fs=require('fs'); const xml=fs.readFileSync('public/sitemap.xml','utf8'); console.log(xml.split('<url>').length - 1); console.log(xml.includes('https://juandi-blip.github.io/shoes-store/producto/080'));"`

Expected output:
```
82
true
```

- [ ] **Step 4: Commit**

```bash
git add public/robots.txt public/sitemap.xml
git commit -m "feat: add robots.txt and sitemap.xml"
```

---

### Task 6: Tests de `PagoPage`

**Files:**
- Test: `src/pages/PagoPage.test.jsx`

**Interfaces:**
- Consumes: `CartProvider` from `src/context/CartContext.jsx` (existing), `PagoPage` default export from `src/pages/PagoPage.jsx` (existing, unmodified).

- [ ] **Step 1: Write the test file**

Create `src/pages/PagoPage.test.jsx`:

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import PagoPage from './PagoPage'
import productos from '../data/productos.json'

const CLAVE = 'shoesStore_carrito'
const p = productos[0]
const talla = p.tallas[0]

function renderPagoPage() {
  localStorage.setItem(CLAVE, JSON.stringify([{ id: p.id, talla, cantidad: 1 }]))
  return render(
    <MemoryRouter>
      <CartProvider>
        <PagoPage />
      </CartProvider>
    </MemoryRouter>
  )
}

function llenarFormularioValido() {
  fireEvent.change(screen.getByLabelText('Número de tarjeta'), { target: { value: '4111111111111111' } })
  fireEvent.change(screen.getByLabelText('Titular'), { target: { value: 'Juan Perez' } })
  fireEvent.change(screen.getByLabelText('Vence (MM/AA)'), { target: { value: '12/28' } })
  fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } })
}

beforeEach(() => {
  localStorage.clear()
})

describe('PagoPage — validación de formulario', () => {
  it('muestra error si el número de tarjeta es inválido', () => {
    renderPagoPage()
    llenarFormularioValido()
    fireEvent.change(screen.getByLabelText('Número de tarjeta'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /Pagar/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('Número de tarjeta inválido')
  })

  it('muestra error si el CVV es inválido', () => {
    renderPagoPage()
    llenarFormularioValido()
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: /Pagar/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('CVV inválido')
  })

  it('muestra error si el vencimiento no tiene formato MM/AA', () => {
    renderPagoPage()
    llenarFormularioValido()
    fireEvent.change(screen.getByLabelText('Vence (MM/AA)'), { target: { value: '13/99' } })
    fireEvent.click(screen.getByRole('button', { name: /Pagar/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('Vencimiento en formato MM/AA')
  })

  it('reactiva el botón de pago tras un intento inválido (el guard no lo deja bloqueado)', () => {
    renderPagoPage()
    llenarFormularioValido()
    fireEvent.change(screen.getByLabelText('Número de tarjeta'), { target: { value: '123' } })
    const boton = screen.getByRole('button', { name: /Pagar/ })
    fireEvent.click(boton)
    expect(screen.getByRole('alert')).toHaveTextContent('Número de tarjeta inválido')
    expect(boton).not.toBeDisabled()
  })

  it('confirma el pedido con datos válidos y vacía el carrito', () => {
    renderPagoPage()
    llenarFormularioValido()
    fireEvent.click(screen.getByRole('button', { name: /Pagar/ }))
    expect(screen.getByText('¡Pedido confirmado!')).toBeInTheDocument()
    expect(localStorage.getItem(CLAVE)).toBe(JSON.stringify([]))
  })
})
```

- [ ] **Step 2: Run the test**

Run: `pnpm test -- PagoPage.test.jsx`
Expected: PASS (5/5)

- [ ] **Step 3: Run the full suite to confirm no regressions**

Run: `pnpm test`
Expected: PASS — all suites green.

- [ ] **Step 4: Commit**

```bash
git add src/pages/PagoPage.test.jsx
git commit -m "test: cover PagoPage form validation and submit guard"
```

---

### Task 7: Tests de `Navbar`

**Files:**
- Test: `src/components/Navbar.test.jsx`

**Interfaces:**
- Consumes: `SessionProvider` (`src/context/SessionContext.jsx`), `CartProvider` (`src/context/CartContext.jsx`), `Navbar` default export (`src/components/Navbar.jsx`), all existing and unmodified.

- [ ] **Step 1: Write the test file**

Create `src/components/Navbar.test.jsx`:

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { SessionProvider } from '../context/SessionContext'
import { CartProvider } from '../context/CartContext'
import Navbar from './Navbar'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location-display">{location.pathname}{location.search}</div>
}

function renderNavbar() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <SessionProvider>
        <CartProvider>
          <Navbar />
          <LocationDisplay />
        </CartProvider>
      </SessionProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('Navbar — búsqueda', () => {
  it('escribir un texto y enviar el formulario navega a /catalogo?q=<texto>', () => {
    renderNavbar()
    fireEvent.click(screen.getByLabelText('Buscar'))
    const input = screen.getByPlaceholderText('Buscar productos…')
    fireEvent.change(input, { target: { value: 'nike air' } })
    fireEvent.submit(input.closest('form'))
    expect(screen.getByTestId('location-display')).toHaveTextContent('/catalogo?q=nike%20air')
  })

  it('el panel de búsqueda se cierra después de enviar', () => {
    renderNavbar()
    fireEvent.click(screen.getByLabelText('Buscar'))
    const input = screen.getByPlaceholderText('Buscar productos…')
    fireEvent.change(input, { target: { value: 'vans' } })
    fireEvent.submit(input.closest('form'))
    expect(screen.queryByPlaceholderText('Buscar productos…')).not.toBeInTheDocument()
  })
})

describe('Navbar — mega-menú por teclado', () => {
  it('enfocar el link del trigger abre el mega-menú (clase active en el <li>)', () => {
    renderNavbar()
    const link = screen.getByText('MUJER')
    fireEvent.focus(link)
    expect(link.closest('li')).toHaveClass('active')
  })

  it('Escape cierra el mega-menú abierto', () => {
    renderNavbar()
    const link = screen.getByText('MUJER')
    fireEvent.focus(link)
    expect(link.closest('li')).toHaveClass('active')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(link.closest('li')).not.toHaveClass('active')
  })
})
```

- [ ] **Step 2: Run the test**

Run: `pnpm test -- Navbar.test.jsx`
Expected: PASS (4/4)

- [ ] **Step 3: Run the full suite to confirm no regressions**

Run: `pnpm test`
Expected: PASS — all suites green (including Tasks 1, 2, 3, 6 tests already committed).

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.test.jsx
git commit -m "test: cover Navbar search navigation and keyboard mega-menu"
```

---

### Task 8: Verificación final de la fase

**Files:** None (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: PASS — every test file in the repo green, including all new ones from Tasks 1, 2, 3, 6, 7.

- [ ] **Step 2: Run the linter**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Build the project**

Run: `pnpm build`
Expected: build succeeds, and `dist/robots.txt` and `dist/sitemap.xml` exist (Vite copies everything from `public/` verbatim into `dist/`).

Verify with: `node -e "const fs=require('fs'); console.log(fs.existsSync('dist/robots.txt'), fs.existsSync('dist/sitemap.xml'))"`
Expected output: `true true`

- [ ] **Step 4: Manual smoke test in the browser**

Run: `pnpm preview`

Visit the preview URL and:
- Check `<title>` changes when navigating Home → Catálogo → a product detail page (via browser tab title or devtools `document.title`).
- View page source or devtools Elements panel on a product page and confirm a `<script type="application/ld+json">` with `"@type": "Product"` is present in `<head>`.
- Visit `/shoes-store/robots.txt` and `/shoes-store/sitemap.xml` directly and confirm they load with the expected content.
