# Frontend React Migration (GA7-220501096-AA4-EV03) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Shoes'sStore 2.0's public storefront (home, catalog, product detail, login, register, profile) from vanilla HTML/CSS/JS to a Vite + React app, reusing existing CSS and `productos.json`, no backend dependency.

**Architecture:** Vite + React 18 + React Router 6 project at `frontend-react/` inside `shoes'sStore 2.0`. Existing CSS files imported as-is. Product filtering/sorting logic ported from `js/catalogo.js` into a pure, unit-tested `useProductos` hook. Session/login state lives in a small `SessionContext`. See design spec: `docs/superpowers/specs/2026-06-30-frontend-react-migration-design.md`.

**Tech Stack:** Vite 5, React 18, react-router-dom 6, Vitest + @testing-library/react (unit tests for hooks/context only), pnpm as package manager.

## Global Constraints

- Package manager is **pnpm**, not npm, for every install/script in this plan.
- No backend/API calls — data comes from a local `productos.json` bundled in the React project.
- Reuse existing CSS files verbatim (`variables.css`, `tienda1.css`, `catalogo.css`, `producto-detalle.css`, `inicioRegistro.css`) — do not rewrite styles.
- Component files: PascalCase, one component per file, short JSDoc comment describing responsibility (evidence requires commented, standards-compliant code).
- Variable/function names in Spanish, consistent with the rest of the codebase.
- Every task must leave `pnpm build` passing before moving to the next task.

---

### Task 1: Scaffold the Vite + React project

**Files:**
- Create: `frontend-react/package.json`
- Create: `frontend-react/vite.config.js`
- Create: `frontend-react/index.html`
- Create: `frontend-react/src/main.jsx`
- Create: `frontend-react/src/App.jsx`
- Create: `frontend-react/.gitignore`

**Interfaces:**
- Produces: a running Vite dev server and `pnpm build` command that later tasks extend.

- [ ] **Step 1: Scaffold with pnpm create vite**

Run from `shoes'sStore 2.0/`:
```bash
pnpm create vite@latest frontend-react -- --template react
```

- [ ] **Step 2: Install dependencies**

```bash
cd frontend-react
pnpm add react-router-dom@6
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Add `.gitignore` entries**

`frontend-react/.gitignore` (append if scaffold already created one):
```
node_modules
dist
*.local
```

- [ ] **Step 4: Configure Vitest in `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 5: Add test script to `package.json`**

Add to `"scripts"`:
```json
"test": "vitest run"
```

- [ ] **Step 6: Verify the scaffold builds**

Run: `pnpm build`
Expected: `dist/` created, no errors.

- [ ] **Step 7: Commit**

```bash
cd ..
git add frontend-react/package.json frontend-react/pnpm-lock.yaml frontend-react/vite.config.js frontend-react/index.html frontend-react/src frontend-react/.gitignore
git commit -m "feat: scaffold Vite+React frontend project"
```

---

### Task 2: Bring over shared assets (CSS + productos.json)

**Files:**
- Create: `frontend-react/src/data/productos.json` (copy of `../productos.json`)
- Create: `frontend-react/src/styles/variables.css` (copy)
- Create: `frontend-react/src/styles/tienda1.css` (copy)
- Create: `frontend-react/src/styles/catalogo.css` (copy)
- Create: `frontend-react/src/styles/producto-detalle.css` (copy)
- Create: `frontend-react/src/styles/inicioRegistro.css` (copy)
- Modify: `frontend-react/src/main.jsx`

**Interfaces:**
- Produces: `src/data/productos.json` importable as `import productos from './data/productos.json'`.
- Produces: global stylesheets loaded once in `main.jsx`, available to every component without per-component imports.

- [ ] **Step 1: Copy the data file and CSS files**

Run from `shoes'sStore 2.0/`:
```bash
mkdir -p frontend-react/src/data frontend-react/src/styles
cp productos.json frontend-react/src/data/productos.json
cp variables.css tienda1.css catalogo.css producto-detalle.css inicioRegistro.css frontend-react/src/styles/
```

- [ ] **Step 2: Load global styles once in `main.jsx`**

`frontend-react/src/main.jsx`:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/variables.css'
import './styles/tienda1.css'
import './styles/catalogo.css'
import './styles/producto-detalle.css'
import './styles/inicioRegistro.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 3: Verify the app still builds**

Run: `pnpm build`
Expected: no errors, `dist/assets/*.css` includes the copied styles.

- [ ] **Step 4: Commit**

```bash
git add frontend-react/src/data frontend-react/src/styles frontend-react/src/main.jsx
git commit -m "feat: bring over productos.json and existing stylesheets"
```

---

### Task 3: `useProductos` hook — filtering and sorting logic (TDD)

Ports the filter/sort logic from `js/catalogo.js` (gender, price, outlet, novedad, category/proposito/subcategoria match, and the 5 sort modes) into a pure, testable function plus a hook wrapper.

**Files:**
- Create: `frontend-react/src/hooks/useProductos.js`
- Test: `frontend-react/src/hooks/useProductos.test.js`

**Interfaces:**
- Produces: `filtrarYOrdenarProductos(productos, filtros, orden)` — pure function, exported for tests.
  - `filtros: { generos: string[], categorias: string[], precioMax: number, soloOutlet: boolean, soloNovedad: boolean }`
  - `orden: 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre' | 'novedades'`
  - Returns: filtered+sorted array of producto objects (same shape as `productos.json` entries: `id, nombre, marca, precio, genero, proposito, subcategoria, colorway, novedad, outlet, tallas, imagen`).
- Produces: `useProductos()` — hook, returns `{ productos }` (the full static dataset, memoized).

- [ ] **Step 1: Write the failing tests**

`frontend-react/src/hooks/useProductos.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { filtrarYOrdenarProductos } from './useProductos'

const sample = [
  { id: '1', nombre: 'Air Force 1', marca: 'Nike', precio: 115, genero: 'hombre', proposito: 'lifestyle', subcategoria: 'originals', novedad: false, outlet: false, tallas: [9], imagen: '' },
  { id: '2', nombre: 'Ultraboost', marca: 'Adidas', precio: 180, genero: 'mujer', proposito: 'running', subcategoria: 'performance', novedad: true, outlet: false, tallas: [8], imagen: '' },
  { id: '3', nombre: 'Zoom Freak', marca: 'Nike', precio: 95, genero: 'hombre', proposito: 'basketball', subcategoria: 'performance', novedad: false, outlet: true, tallas: [10], imagen: '' },
]

describe('filtrarYOrdenarProductos', () => {
  it('filtra por género', () => {
    const filtros = { generos: ['mujer'], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result.map(p => p.id)).toEqual(['2'])
  })

  it('filtra por precio máximo', () => {
    const filtros = { generos: [], categorias: [], precioMax: 100, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result.map(p => p.id)).toEqual(['3'])
  })

  it('filtra solo outlet', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: true, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result.map(p => p.id)).toEqual(['3'])
  })

  it('filtra por categoría contra proposito o subcategoria', () => {
    const filtros = { generos: [], categorias: ['performance'], precioMax: 300, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia').map(p => p.id).sort()
    expect(result).toEqual(['2', '3'])
  })

  it('ordena por precio ascendente', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'precio-asc')
    expect(result.map(p => p.id)).toEqual(['3', '1', '2'])
  })

  it('relevancia prioriza novedades primero', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result[0].id).toBe('2')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `useProductos.js` does not exist yet / `filtrarYOrdenarProductos` is not exported.

- [ ] **Step 3: Implement the hook and pure function**

`frontend-react/src/hooks/useProductos.js`:
```js
import { useMemo } from 'react'
import productosData from '../data/productos.json'

/**
 * Filtra y ordena una lista de productos según los criterios del catálogo.
 * Función pura — sin dependencias de React — portada de js/catalogo.js.
 * @param {Array<object>} productos
 * @param {{generos: string[], categorias: string[], precioMax: number, soloOutlet: boolean, soloNovedad: boolean}} filtros
 * @param {'relevancia'|'precio-asc'|'precio-desc'|'nombre'|'novedades'} orden
 * @returns {Array<object>}
 */
export function filtrarYOrdenarProductos(productos, filtros, orden) {
  const { generos, categorias, precioMax, soloOutlet, soloNovedad } = filtros

  const filtrados = productos.filter((p) => {
    if (generos.length > 0 && !generos.includes(p.genero)) return false
    if (p.precio > precioMax) return false
    if (soloOutlet && !p.outlet) return false
    if (soloNovedad && !p.novedad) return false
    if (categorias.length > 0) {
      const coincide = categorias.some(
        (cat) => p.proposito === cat || p.subcategoria === cat
      )
      if (!coincide) return false
    }
    return true
  })

  const ordenados = [...filtrados]
  switch (orden) {
    case 'precio-asc':
      ordenados.sort((a, b) => a.precio - b.precio)
      break
    case 'precio-desc':
      ordenados.sort((a, b) => b.precio - a.precio)
      break
    case 'nombre':
      ordenados.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      break
    case 'novedades':
      ordenados.sort((a, b) => (b.novedad ? 1 : 0) - (a.novedad ? 1 : 0))
      break
    default:
      ordenados.sort((a, b) => {
        if (a.novedad !== b.novedad) return b.novedad ? 1 : -1
        if (a.outlet !== b.outlet) return b.outlet ? 1 : -1
        return a.nombre.localeCompare(b.nombre, 'es')
      })
  }
  return ordenados
}

/**
 * Expone el catálogo completo de productos (dataset estático, memoizado).
 * @returns {{productos: Array<object>}}
 */
export function useProductos() {
  const productos = useMemo(() => productosData, [])
  return { productos }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add frontend-react/src/hooks/useProductos.js frontend-react/src/hooks/useProductos.test.js
git commit -m "feat: add useProductos hook with filter/sort logic ported from catalogo.js"
```

---

### Task 4: `SessionContext` — mock authentication (TDD)

Ports the mock credentials check from `js/login.js` (`admin` / `shoes2026`) into a React Context so `LoginPage`, `PerfilPage`, and `Navbar` can share session state.

**Files:**
- Create: `frontend-react/src/context/SessionContext.jsx`
- Test: `frontend-react/src/context/SessionContext.test.jsx`

**Interfaces:**
- Produces: `validarCredenciales(usuario, clave)` — pure function, exported for tests, returns `boolean`.
- Produces: `SessionProvider` — component wrapping the app.
- Produces: `useSession()` — hook, returns `{ usuario: string|null, iniciarSesion(usuario, clave): boolean, cerrarSesion(): void }`.

- [ ] **Step 1: Write the failing tests**

`frontend-react/src/context/SessionContext.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SessionProvider, useSession, validarCredenciales } from './SessionContext'

describe('validarCredenciales', () => {
  it('acepta el usuario mock correcto', () => {
    expect(validarCredenciales('admin', 'shoes2026')).toBe(true)
  })

  it('rechaza credenciales incorrectas', () => {
    expect(validarCredenciales('admin', 'wrong')).toBe(false)
  })
})

describe('useSession', () => {
  function wrapper({ children }) {
    return <SessionProvider>{children}</SessionProvider>
  }

  it('inicia sin sesión activa', () => {
    const { result } = renderHook(() => useSession(), { wrapper })
    expect(result.current.usuario).toBeNull()
  })

  it('inicia sesión con credenciales válidas', () => {
    const { result } = renderHook(() => useSession(), { wrapper })
    act(() => {
      const ok = result.current.iniciarSesion('admin', 'shoes2026')
      expect(ok).toBe(true)
    })
    expect(result.current.usuario).toBe('admin')
  })

  it('no inicia sesión con credenciales inválidas', () => {
    const { result } = renderHook(() => useSession(), { wrapper })
    act(() => {
      const ok = result.current.iniciarSesion('admin', 'wrong')
      expect(ok).toBe(false)
    })
    expect(result.current.usuario).toBeNull()
  })

  it('cierra sesión', () => {
    const { result } = renderHook(() => useSession(), { wrapper })
    act(() => { result.current.iniciarSesion('admin', 'shoes2026') })
    act(() => { result.current.cerrarSesion() })
    expect(result.current.usuario).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `SessionContext.jsx` does not exist yet.

- [ ] **Step 3: Implement the context**

`frontend-react/src/context/SessionContext.jsx`:
```jsx
import { createContext, useContext, useState } from 'react'

/**
 * Valida las credenciales mock (sin backend), igual que js/login.js.
 * @param {string} usuario
 * @param {string} clave
 * @returns {boolean}
 */
export function validarCredenciales(usuario, clave) {
  return usuario === 'admin' && clave === 'shoes2026'
}

const SessionContext = createContext(null)

/**
 * Provee el estado de sesión mock (usuario autenticado o null) a la app.
 */
export function SessionProvider({ children }) {
  const [usuario, setUsuario] = useState(null)

  function iniciarSesion(usuarioInput, clave) {
    const valido = validarCredenciales(usuarioInput, clave)
    if (valido) setUsuario(usuarioInput)
    return valido
  }

  function cerrarSesion() {
    setUsuario(null)
  }

  return (
    <SessionContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </SessionContext.Provider>
  )
}

/**
 * Hook de acceso a la sesión mock actual.
 * @returns {{usuario: string|null, iniciarSesion: Function, cerrarSesion: Function}}
 */
export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider')
  return ctx
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add frontend-react/src/context/SessionContext.jsx frontend-react/src/context/SessionContext.test.jsx
git commit -m "feat: add SessionContext with mock authentication ported from login.js"
```

---

### Task 5: `ProductCard` and `ProductGrid` components

Shared presentational components used by `HomePage` and `CatalogoPage`, reusing `.product-card` / `.catalog-grid` classes already defined in `catalogo.css`.

**Files:**
- Create: `frontend-react/src/components/ProductCard.jsx`
- Create: `frontend-react/src/components/ProductGrid.jsx`

**Interfaces:**
- Consumes: producto objects shaped like `useProductos` output (`id, nombre, marca, precio, imagen, novedad, outlet`).
- Produces: `<ProductCard producto={producto} />`, `<ProductGrid productos={productos} />` — reusable in Task 7 and Task 8.

- [ ] **Step 1: Implement `ProductCard`**

`frontend-react/src/components/ProductCard.jsx`:
```jsx
import { Link } from 'react-router-dom'

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' fill='%23555' font-family='Poppins,sans-serif' font-size='14'%3ESin imagen%3C/text%3E%3C/svg%3E"

function formatearPrecio(precio) {
  const valor = typeof precio === 'number' ? precio : Number(precio)
  if (!Number.isFinite(valor) || valor <= 0) return 'No disponible'
  return '$' + valor.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

/**
 * Tarjeta individual de producto usada en grids de catálogo y home.
 * @param {{producto: object}} props
 */
export default function ProductCard({ producto }) {
  return (
    <Link to={`/producto/${producto.id}`} className="product-card">
      {producto.novedad && <span className="product-badge product-badge--new">Nuevo</span>}
      {producto.outlet && <span className="product-badge product-badge--outlet">Outlet</span>}
      <img
        src={producto.imagen || PLACEHOLDER_IMG}
        alt={producto.nombre}
        loading="lazy"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
      />
      <div className="product-card__info">
        <p className="product-card__brand">{producto.marca}</p>
        <h3 className="product-card__name">{producto.nombre}</h3>
        <p className="product-card__price">{formatearPrecio(producto.precio)}</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Implement `ProductGrid`**

`frontend-react/src/components/ProductGrid.jsx`:
```jsx
import ProductCard from './ProductCard'

/**
 * Grilla de productos. Muestra un mensaje cuando no hay resultados.
 * @param {{productos: Array<object>}} props
 */
export default function ProductGrid({ productos }) {
  if (productos.length === 0) {
    return <p className="catalog-empty">No se encontraron productos con estos filtros.</p>
  }
  return (
    <div className="catalog-grid">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: no errors (components not yet used anywhere is fine — Vite still bundles them once imported later; for now just confirm no syntax errors via `pnpm build` which type-checks JSX).

- [ ] **Step 4: Commit**

```bash
git add frontend-react/src/components/ProductCard.jsx frontend-react/src/components/ProductGrid.jsx
git commit -m "feat: add ProductCard and ProductGrid components"
```

---

### Task 6: Layout components — `Navbar`, `Footer`, `AnnouncementBar`, `Toast`

Ports the top banner + mega-menu skeleton from `tienda.js`/`index.html` header markup, simplified to the primary nav links (mega-menu submenus are a visual/CSS concern already covered by `tienda1.css`; this task wires the top-level links and mobile toggle state).

**Files:**
- Create: `frontend-react/src/components/AnnouncementBar.jsx`
- Create: `frontend-react/src/components/Navbar.jsx`
- Create: `frontend-react/src/components/Footer.jsx`
- Create: `frontend-react/src/components/Toast.jsx`

**Interfaces:**
- Produces: `<AnnouncementBar />`, `<Navbar />`, `<Footer />` — used in `App.jsx` (Task 12).
- Produces: `<Toast mensaje={string|null} onClose={Function} />` — used in `ProductoDetallePage` (Task 9).
- Consumes: `useSession()` from Task 4 (Navbar shows "Mi perfil" vs "Iniciar sesión").

- [ ] **Step 1: Implement `AnnouncementBar`**

`frontend-react/src/components/AnnouncementBar.jsx`:
```jsx
/**
 * Banner superior con la promoción de envío gratis.
 */
export default function AnnouncementBar() {
  return (
    <div className="top-banner">
      <p>
        Envío gratis en pedidos superiores a $200.000 COP&nbsp;&nbsp;|&nbsp;&nbsp;
        <a href="/catalogo">Comprar ahora</a>
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Implement `Navbar`**

`frontend-react/src/components/Navbar.jsx`:
```jsx
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
```

- [ ] **Step 3: Implement `Footer`**

`frontend-react/src/components/Footer.jsx`:
```jsx
/**
 * Pie de página del sitio.
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <p>© 2026 Shoes.Store — Proyecto de aprendizaje SENA GA7-220501096-AA4-EV03.</p>
    </footer>
  )
}
```

- [ ] **Step 4: Implement `Toast`**

`frontend-react/src/components/Toast.jsx`:
```jsx
import { useEffect } from 'react'

/**
 * Notificación flotante temporal (ej. "Agregado al carrito").
 * @param {{mensaje: string|null, onClose: Function}} props
 */
export default function Toast({ mensaje, onClose }) {
  useEffect(() => {
    if (!mensaje) return
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [mensaje, onClose])

  if (!mensaje) return null

  return (
    <div id="pd-toast" role="status" aria-live="polite">
      {mensaje}
    </div>
  )
}
```

- [ ] **Step 5: Verify build**

Run: `pnpm build`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add frontend-react/src/components/AnnouncementBar.jsx frontend-react/src/components/Navbar.jsx frontend-react/src/components/Footer.jsx frontend-react/src/components/Toast.jsx
git commit -m "feat: add layout components (Navbar, Footer, AnnouncementBar, Toast)"
```

---

### Task 7: `HomePage`

Ports `js/home.js` (destacados/novedades/outlet grids) using `useProductos` + `ProductGrid`.

**Files:**
- Create: `frontend-react/src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: `useProductos()` (Task 3), `ProductGrid` (Task 5).
- Produces: default export used as `/` route in `App.jsx` (Task 12).

- [ ] **Step 1: Implement `HomePage`**

`frontend-react/src/pages/HomePage.jsx`:
```jsx
import { useMemo } from 'react'
import { useProductos } from '../hooks/useProductos'
import { filtrarYOrdenarProductos } from '../hooks/useProductos'
import ProductGrid from '../components/ProductGrid'

const SIN_FILTROS = { generos: [], categorias: [], precioMax: 100000, soloOutlet: false, soloNovedad: false }

/**
 * Página de inicio: destacados, novedades y outlet.
 */
export default function HomePage() {
  const { productos } = useProductos()

  const destacados = useMemo(
    () => filtrarYOrdenarProductos(productos, SIN_FILTROS, 'relevancia').slice(0, 8),
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

  return (
    <main className="home-page">
      <section className="home-section">
        <h2>Destacados</h2>
        <ProductGrid productos={destacados} />
      </section>
      <section className="home-section">
        <h2>Novedades ✨</h2>
        <ProductGrid productos={novedades} />
      </section>
      <section className="home-section">
        <h2>Outlet</h2>
        <ProductGrid productos={outlet} />
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend-react/src/pages/HomePage.jsx
git commit -m "feat: add HomePage with destacados/novedades/outlet sections"
```

---

### Task 8: `CatalogoPage` — filters, sort, URL sync

Ports the sidebar filters + sort select + URL param sync from `catalogo.html`/`js/catalogo.js`, using `useSearchParams` instead of manual `URLSearchParams`.

**Files:**
- Create: `frontend-react/src/pages/CatalogoPage.jsx`

**Interfaces:**
- Consumes: `useProductos()` + `filtrarYOrdenarProductos()` (Task 3), `ProductGrid` (Task 5).
- Produces: default export used as `/catalogo` route in `App.jsx` (Task 12).
- Reads query params: `genero`, `proposito`, `novedad`, `outlet` (same contract as the current site's links, e.g. `/catalogo?genero=hombre`).

- [ ] **Step 1: Implement `CatalogoPage`**

`frontend-react/src/pages/CatalogoPage.jsx`:
```jsx
import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProductos, filtrarYOrdenarProductos } from '../hooks/useProductos'
import ProductGrid from '../components/ProductGrid'

const PRECIO_MAX_GLOBAL = 300

/**
 * Página de catálogo con filtros de sidebar (género, categoría, precio,
 * outlet, novedad) y selector de orden, sincronizados con la URL.
 */
export default function CatalogoPage() {
  const { productos } = useProductos()
  const [searchParams] = useSearchParams()

  const generoUrl = searchParams.get('genero')
  const propositoUrl = searchParams.get('proposito')
  const novedadUrl = searchParams.get('novedad') === 'true'
  const outletUrl = searchParams.get('outlet') === 'true'

  const [generos, setGeneros] = useState(() => (generoUrl ? [generoUrl === 'ninos' ? 'nino' : generoUrl] : []))
  const [categorias, setCategorias] = useState(() => (propositoUrl ? [propositoUrl] : []))
  const [precioMax, setPrecioMax] = useState(PRECIO_MAX_GLOBAL)
  const [soloOutlet, setSoloOutlet] = useState(outletUrl)
  const [soloNovedad, setSoloNovedad] = useState(novedadUrl)
  const [orden, setOrden] = useState('relevancia')

  useEffect(() => {
    setGeneros(generoUrl ? [generoUrl === 'ninos' ? 'nino' : generoUrl] : [])
    setCategorias(propositoUrl ? [propositoUrl] : [])
    setSoloOutlet(outletUrl)
    setSoloNovedad(novedadUrl)
  }, [generoUrl, propositoUrl, outletUrl, novedadUrl])

  const productosFiltrados = useMemo(
    () => filtrarYOrdenarProductos(productos, { generos, categorias, precioMax, soloOutlet, soloNovedad }, orden),
    [productos, generos, categorias, precioMax, soloOutlet, soloNovedad, orden]
  )

  function alternarGenero(valor) {
    setGeneros((prev) => (prev.includes(valor) ? prev.filter((g) => g !== valor) : [...prev, valor]))
  }

  function alternarCategoria(valor) {
    setCategorias((prev) => (prev.includes(valor) ? prev.filter((c) => c !== valor) : [...prev, valor]))
  }

  return (
    <main>
      <div className="catalog-page">
        <aside className="catalog-sidebar">
          <div className="sidebar-section">
            <h4 className="sidebar-title">Género</h4>
            {[['hombre', 'Hombre'], ['mujer', 'Mujer'], ['nino', 'Niños']].map(([valor, etiqueta]) => (
              <label className="filter-check" key={valor}>
                <input
                  type="checkbox"
                  checked={generos.includes(valor)}
                  onChange={() => alternarGenero(valor)}
                />
                {etiqueta}
              </label>
            ))}
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-title">Precio</h4>
            <div className="price-range-wrap">
              <div className="price-display">
                <span>$0</span>
                <span>${precioMax}</span>
              </div>
              <input
                type="range"
                className="price-range"
                min="0"
                max={PRECIO_MAX_GLOBAL}
                step="5"
                value={precioMax}
                onChange={(e) => setPrecioMax(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-title">Categoría</h4>
            {[
              ['lifestyle', 'Lifestyle'],
              ['running', 'Running'],
              ['basketball', 'Basketball'],
              ['entrenamiento', 'Entrenamiento'],
              ['futbol', 'Fútbol'],
            ].map(([valor, etiqueta]) => (
              <label className="filter-check" key={valor}>
                <input
                  type="checkbox"
                  checked={categorias.includes(valor)}
                  onChange={() => alternarCategoria(valor)}
                />
                {etiqueta}
              </label>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="toggle-row">
              <span className="toggle-label toggle-label--outlet">Solo Outlet</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={soloOutlet} onChange={(e) => setSoloOutlet(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="toggle-row">
              <span className="toggle-label">Solo Novedades</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={soloNovedad} onChange={(e) => setSoloNovedad(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </aside>

        <section className="catalog-main">
          <div className="catalog-toolbar">
            <span className="catalog-count">{productosFiltrados.length} productos</span>
            <select
              className="sort-select"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
              <option value="novedades">Novedades primero</option>
            </select>
          </div>
          <ProductGrid productos={productosFiltrados} />
        </section>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend-react/src/pages/CatalogoPage.jsx
git commit -m "feat: add CatalogoPage with sidebar filters, sort, and URL sync"
```

---

### Task 9: `ProductoDetallePage`

Ports `producto-detalle.js` (product lookup by id, image, specs, "add" toast).

**Files:**
- Create: `frontend-react/src/pages/ProductoDetallePage.jsx`

**Interfaces:**
- Consumes: `useProductos()` (Task 3), `Toast` (Task 6), `useParams()` from react-router-dom.
- Produces: default export used as `/producto/:id` route in `App.jsx` (Task 12).

- [ ] **Step 1: Implement `ProductoDetallePage`**

`frontend-react/src/pages/ProductoDetallePage.jsx`:
```jsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProductos } from '../hooks/useProductos'
import Toast from '../components/Toast'

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' fill='%23555' font-family='Poppins,sans-serif' font-size='14'%3ESin imagen%3C/text%3E%3C/svg%3E"

/**
 * Página de detalle de producto: imagen, specs, selección de talla y toast al agregar.
 */
export default function ProductoDetallePage() {
  const { id } = useParams()
  const { productos } = useProductos()
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null)
  const [mensajeToast, setMensajeToast] = useState(null)

  const producto = productos.find((p) => p.id === id)

  if (!producto) {
    return (
      <main className="producto-detalle-page">
        <p>Producto no encontrado.</p>
        <Link to="/catalogo">Volver al catálogo</Link>
      </main>
    )
  }

  function agregar() {
    if (!tallaSeleccionada) {
      setMensajeToast('Selecciona una talla primero')
      return
    }
    setMensajeToast(`${producto.nombre} (talla ${tallaSeleccionada}) agregado`)
  }

  return (
    <main className="producto-detalle-page">
      <div className="pd-gallery">
        <img
          src={producto.imagen || PLACEHOLDER_IMG}
          alt={producto.nombre}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
        />
      </div>
      <div className="pd-info">
        <p className="pd-brand">{producto.marca}</p>
        <h1 className="pd-name">{producto.nombre}</h1>
        <p className="pd-colorway">{producto.colorway}</p>
        <p className="pd-price">${producto.precio.toLocaleString('en-US')}</p>

        <div className="pd-sizes">
          {producto.tallas.map((talla) => (
            <button
              key={talla}
              className={`pd-size${tallaSeleccionada === talla ? ' pd-size--selected' : ''}`}
              onClick={() => setTallaSeleccionada(talla)}
            >
              {talla}
            </button>
          ))}
        </div>

        <button className="pd-add-btn" onClick={agregar}>Agregar</button>

        <div className="accordion">
          <div className="accordion-item">
            <h3 className="accordion-header">Detalles del producto</h3>
            <div className="accordion-body">
              <p>Género: {producto.genero}</p>
              <p>Propósito: {producto.proposito}</p>
              <p>Subcategoría: {producto.subcategoria}</p>
            </div>
          </div>
        </div>
      </div>
      <Toast mensaje={mensajeToast} onClose={() => setMensajeToast(null)} />
    </main>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend-react/src/pages/ProductoDetallePage.jsx
git commit -m "feat: add ProductoDetallePage with size selection and toast"
```

---

### Task 10: `LoginPage` and `RegistroPage`

Ports `js/login.js` mock validation and the registration form (client-side only, no backend).

**Files:**
- Create: `frontend-react/src/pages/LoginPage.jsx`
- Create: `frontend-react/src/pages/RegistroPage.jsx`

**Interfaces:**
- Consumes: `useSession()` (Task 4).
- Produces: default exports used as `/login` and `/registro` routes in `App.jsx` (Task 12).

- [ ] **Step 1: Implement `LoginPage`**

`frontend-react/src/pages/LoginPage.jsx`:
```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

/**
 * Formulario de inicio de sesión (autenticación mock, sin backend).
 */
export default function LoginPage() {
  const { iniciarSesion } = useSession()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')

  function manejarEnvio(e) {
    e.preventDefault()
    const ok = iniciarSesion(usuario, clave)
    if (ok) {
      navigate('/perfil')
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <main className="auth-page">
      <form className="card" id="login-form" onSubmit={manejarEnvio}>
        <h1>Iniciar sesión</h1>
        <label htmlFor="user">Usuario</label>
        <input id="user" value={usuario} onChange={(e) => { setUsuario(e.target.value); setError('') }} required />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" value={clave} onChange={(e) => { setClave(e.target.value); setError('') }} required />
        {error && <p className="login-error visible">{error}</p>}
        <button type="submit">Entrar</button>
        <p>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
      </form>
    </main>
  )
}
```

- [ ] **Step 2: Implement `RegistroPage`**

`frontend-react/src/pages/RegistroPage.jsx`:
```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * Formulario de registro (mock, sin persistencia real).
 */
export default function RegistroPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')

  function manejarEnvio(e) {
    e.preventDefault()
    navigate('/login')
  }

  return (
    <main className="auth-page">
      <form className="card" onSubmit={manejarEnvio}>
        <h1>Crear cuenta</h1>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <label htmlFor="correo">Correo</label>
        <input id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" type="password" value={clave} onChange={(e) => setClave(e.target.value)} required />
        <button type="submit">Registrarme</button>
        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
    </main>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend-react/src/pages/LoginPage.jsx frontend-react/src/pages/RegistroPage.jsx
git commit -m "feat: add LoginPage and RegistroPage"
```

---

### Task 11: `PerfilPage` (protected)

**Files:**
- Create: `frontend-react/src/pages/PerfilPage.jsx`

**Interfaces:**
- Consumes: `useSession()` (Task 4).
- Produces: default export used as `/perfil` route in `App.jsx` (Task 12). Redirects to `/login` when `usuario` is `null`.

- [ ] **Step 1: Implement `PerfilPage`**

`frontend-react/src/pages/PerfilPage.jsx`:
```jsx
import { Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

/**
 * Página de perfil, solo accesible con sesión activa (mock).
 */
export default function PerfilPage() {
  const { usuario, cerrarSesion } = useSession()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="perfil-page">
      <h1>Hola, {usuario}</h1>
      <p>Este es tu perfil de Shoes.Store.</p>
      <button onClick={cerrarSesion}>Cerrar sesión</button>
    </main>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend-react/src/pages/PerfilPage.jsx
git commit -m "feat: add protected PerfilPage"
```

---

### Task 12: Wire `App.jsx` with routing and providers

**Files:**
- Modify: `frontend-react/src/App.jsx`

**Interfaces:**
- Consumes: every component/page from Tasks 5–11 and `SessionProvider` from Task 4.
- Produces: the complete routed application.

- [ ] **Step 1: Implement `App.jsx`**

`frontend-react/src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import AnnouncementBar from './components/AnnouncementBar'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import CatalogoPage from './pages/CatalogoPage'
import ProductoDetallePage from './pages/ProductoDetallePage'
import LoginPage from './pages/LoginPage'
import RegistroPage from './pages/RegistroPage'
import PerfilPage from './pages/PerfilPage'

/**
 * Componente raíz: enrutamiento, proveedor de sesión, layout compartido.
 * Proyecto SENA GA7-220501096-AA4-EV03 - Evidencia de aprendizaje.
 */
function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <div className="app">
          <AnnouncementBar />
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/producto/:id" element={<ProductoDetallePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </SessionProvider>
  )
}

export default App
```

- [ ] **Step 2: Run the full test suite**

Run: `pnpm test`
Expected: PASS — all hook/context tests from Tasks 3–4 still green.

- [ ] **Step 3: Verify production build**

Run: `pnpm build`
Expected: no errors, `dist/` produced.

- [ ] **Step 4: Manual smoke check**

Run: `pnpm run dev` (or `pnpm dev`), open `http://localhost:5173/` in a browser, and verify:
- Home shows three product sections.
- Clicking a product opens `/producto/:id` with size selection and "Agregar" toast.
- `/catalogo?genero=hombre` pre-filters the sidebar and shows only "hombre" products.
- `/login` with `admin`/`shoes2026` redirects to `/perfil`; wrong credentials show an error.
- `/perfil` redirects to `/login` when not authenticated.

Stop the dev server (Ctrl+C) after verifying.

- [ ] **Step 5: Commit**

```bash
git add frontend-react/src/App.jsx
git commit -m "feat: wire routing, session provider, and shared layout in App.jsx"
```

---

### Task 13: Package the evidence deliverable

Produces the ZIP required by the guide (`NOMBRE_APELLIDO_AA4_EV03.zip`, project files + repository link) inside the evidence folder in `D:\juandiplay\sena\`.

**Files:**
- Create: `D:\juandiplay\sena\GA7-220501096-AA4-EV03\enlace_repositorio.txt`
- Create: `D:\juandiplay\sena\GA7-220501096-AA4-EV03\<APELLIDO_NOMBRE>_AA4_EV03.zip`

**Interfaces:**
- Consumes: the finished `frontend-react/` project (Tasks 1–12) and the pushed git remote URL of `shoes'sStore 2.0`.

- [ ] **Step 1: Confirm the remote repository URL**

Run: `git -C "D:/juandiplay/cursito html/sena/shoes'sStore 2.0" remote -v`
Expected: prints the `origin` (or `github`) URL. If none is configured, push the repo to GitHub first — this step cannot be automated without the user's account, so pause here and ask the user for the URL if missing.

- [ ] **Step 2: Push latest commits**

```bash
git -C "D:/juandiplay/cursito html/sena/shoes'sStore 2.0" push
```

- [ ] **Step 3: Create the evidence folder and repo-link file**

```bash
mkdir -p "D:/juandiplay/sena/GA7-220501096-AA4-EV03"
echo "Repositorio: <URL_DEL_REMOTO>" > "D:/juandiplay/sena/GA7-220501096-AA4-EV03/enlace_repositorio.txt"
```
Replace `<URL_DEL_REMOTO>` with the URL from Step 1.

- [ ] **Step 4: Zip the `frontend-react/` project (excluding `node_modules` and `dist`)**

```bash
cd "D:/juandiplay/cursito html/sena/shoes'sStore 2.0/frontend-react"
zip -r "D:/juandiplay/sena/GA7-220501096-AA4-EV03/APELLIDO_NOMBRE_AA4_EV03.zip" . -x "node_modules/*" "dist/*"
```
Rename `APELLIDO_NOMBRE` to the learner's actual name/surname before running (matches the naming convention already used in this SENA workspace, e.g. `FLOREZ_JUAN_AA4_EV03.zip`).

- [ ] **Step 5: Verify the ZIP contents**

Run: `unzip -l "D:/juandiplay/sena/GA7-220501096-AA4-EV03/APELLIDO_NOMBRE_AA4_EV03.zip" | head -30`
Expected: lists `src/`, `package.json`, `vite.config.js`, etc., with no `node_modules/` or `dist/` entries.

- [ ] **Step 6: Commit the evidence link file (in the sena workspace, if it is a git repo) or leave as-is**

This folder (`D:\juandiplay\sena\`) is not a git repository — no commit needed here. The ZIP and link file are the final deliverables to upload to the SENA platform.
