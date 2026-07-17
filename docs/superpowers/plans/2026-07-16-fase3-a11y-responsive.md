# Fase 3: accesibilidad y responsive — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer el mega-menú de escritorio operable por teclado, implementar una búsqueda real integrada con el catálogo (el botón de búsqueda no hacía nada), y documentar en código la relación entre el breakpoint hardcodeado en JS y el breakpoint real en CSS de la página de detalle de producto.

**Architecture:** `useProductos.js` gana un criterio de filtro `busqueda` (función pura, sin dependencias de React). `CatalogoPage.jsx` lee `q` de la URL (mismo patrón de memoización que los demás filtros, ya arreglado en Fase 2) y lo pasa al filtrado. `Navbar.jsx` gana un panel de búsqueda desplegable que navega a `/catalogo?q=...`, y reutiliza el mecanismo de delay ya existente (`abrirMega`/`cerrarMegaConDelay`/`cancelarCierre`) también para eventos de foco en el mega-menú. `ProductoDetallePage.jsx` extrae un magic number a una constante documentada.

**Tech Stack:** React 19, React Router 6 (`useNavigate`, `useSearchParams`, `Link`), Vite 8, Vitest 4 (jsdom, `globals: true`).

## Global Constraints

- Sin cambios de comportamiento visible en filtros/carrito existentes — solo se agrega funcionalidad nueva (búsqueda) o accesibilidad (teclado), no se modifica ningún flujo actual.
- Nombres de variables/funciones en español.
- No modificar `CartContext.jsx`, `CarritoPage.jsx`, `PagoPage.jsx`, `src/utils/pricing.js` en esta fase.
- CSS nuevo debe ser aditivo (selectores nuevos, no modificar reglas CSS existentes) para no arriesgar layouts ya validados.
- No se toca la unificación de breakpoints/variables CSS (descartada por el usuario).

---

### Task 1: Filtro de búsqueda por texto en `useProductos`

**Files:**
- Modify: `src/hooks/useProductos.js:8-27` (JSDoc + `filtrarYOrdenarProductos`)
- Test: `src/hooks/useProductos.test.js` (agregar casos al final del `describe('filtrarYOrdenarProductos', ...)`)

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `filtrarYOrdenarProductos(productos, filtros, orden)` acepta ahora `filtros.busqueda` (string opcional, default `''`). Las Tasks 2 usa este campo pasándolo desde `CatalogoPage`.

- [ ] **Step 1: Escribir los tests de búsqueda (fallan primero)**

Agregar dentro de `describe('filtrarYOrdenarProductos', ...)` en `src/hooks/useProductos.test.js`, después del último `it(...)` existente (antes del `})` de cierre del describe):

```javascript
  it('filtra por texto en el nombre (case-insensitive)', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false, busqueda: 'ULTRABOOST' }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result.map(p => p.id)).toEqual(['2'])
  })

  it('filtra por texto en la marca (case-insensitive)', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false, busqueda: 'nike' }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia').map(p => p.id).sort()
    expect(result).toEqual(['1', '3'])
  })

  it('busqueda vacía no filtra nada', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false, busqueda: '' }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result).toHaveLength(sample.length)
  })

  it('busqueda ausente (undefined) no filtra nada', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result).toHaveLength(sample.length)
  })
```

- [ ] **Step 2: Ejecutar los tests para confirmar que fallan**

Run: `pnpm vitest run src/hooks/useProductos.test.js`
Expected: FAIL en los 4 casos nuevos — el filtro `busqueda` no existe todavía, así que `filtrarYOrdenarProductos` ignora ese campo y devuelve todos los productos sin filtrar por texto (los dos primeros tests esperan un subconjunto y reciben el array completo).

- [ ] **Step 3: Implementar el filtro de búsqueda**

En `src/hooks/useProductos.js`, reemplazar el JSDoc y la firma de `filtrarYOrdenarProductos` (líneas 4-13):

```javascript
/**
 * Filtra y ordena una lista de productos según los criterios del catálogo.
 * Función pura — sin dependencias de React — portada de js/catalogo.js.
 * @param {Array<object>} productos
 * @param {{generos: string[], categorias: string[], precioMax: number, soloOutlet: boolean, soloNovedad: boolean, busqueda?: string}} filtros
 * @param {'relevancia'|'precio-asc'|'precio-desc'|'nombre'|'novedades'} orden
 * @returns {Array<object>}
 */
export function filtrarYOrdenarProductos(productos, filtros, orden) {
  const { generos, categorias, precioMax, soloOutlet, soloNovedad, busqueda = '' } = filtros
  const textoBusqueda = busqueda.trim().toLowerCase()

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
    if (textoBusqueda) {
      const coincideTexto = p.nombre.toLowerCase().includes(textoBusqueda) || p.marca.toLowerCase().includes(textoBusqueda)
      if (!coincideTexto) return false
    }
    return true
  })
```

El resto de la función (ordenamiento, `switch (orden)`) no cambia.

- [ ] **Step 4: Ejecutar los tests para confirmar que pasan**

Run: `pnpm vitest run src/hooks/useProductos.test.js`
Expected: PASS — los 4 casos nuevos y los 6 existentes (10 en total en este archivo).

- [ ] **Step 5: Ejecutar la suite completa**

Run: `pnpm vitest run`
Expected: todos los archivos en PASS (27 tests existentes + 4 nuevos = 31).

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useProductos.js src/hooks/useProductos.test.js
git commit -m "feat: add text search filter to filtrarYOrdenarProductos"
```

---

### Task 2: `CatalogoPage` lee `q` de la URL y muestra el resultado de búsqueda

**Files:**
- Modify: `src/pages/CatalogoPage.jsx:1-4,35-49,69-72,161-177`

**Interfaces:**
- Consumes: `filtrarYOrdenarProductos(productos, filtros, orden)` con `filtros.busqueda` (Task 1).
- Produces: nada nuevo para tasks futuras — esta página es la hoja del árbol de dependencias de este plan.

- [ ] **Step 1: Importar `Link` y leer `q` de la URL**

Reemplazar la línea 1-4 (imports) de `src/pages/CatalogoPage.jsx`:

```javascript
import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useProductos, filtrarYOrdenarProductos } from '../hooks/useProductos'
import ProductGrid from '../components/ProductGrid'
```

Dentro de `CatalogoPage()`, agregar `qParam` junto a los demás params (después de la línea `const subcategoriaParam = searchParams.get('subcategoria')`, antes de `const generos = useMemo(...)`):

```javascript
  const qParam = searchParams.get('q') ?? ''
```

- [ ] **Step 2: Pasar `busqueda` al filtrado**

Reemplazar el bloque `productosFiltrados`:

```javascript
  const productosFiltrados = useMemo(
    () => filtrarYOrdenarProductos(productos, { generos, categorias, precioMax, soloOutlet, soloNovedad, busqueda: qParam }, orden),
    [productos, generos, categorias, precioMax, soloOutlet, soloNovedad, qParam, orden]
  )
```

- [ ] **Step 3: Mostrar "Resultados para..." cuando hay búsqueda activa**

Ubicar el JSX de `<section className="catalog-main">` (dentro del `return`) y agregar el bloque de resultado de búsqueda justo antes de `<div className="catalog-toolbar">`:

```jsx
        <section className="catalog-main">
          {qParam && (
            <p className="catalog-search-info">
              Resultados para «{qParam}» · <Link to="/catalogo">Quitar</Link>
            </p>
          )}
          <div className="catalog-toolbar">
```

- [ ] **Step 4: Agregar el estilo `.catalog-search-info` (aditivo)**

Agregar al final de `src/styles/catalogo.css` (después de la regla `.catalog-count`, línea 321-326):

```css
.catalog-search-info {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.catalog-search-info a {
  color: var(--color-text);
  text-decoration: underline;
}
```

- [ ] **Step 5: Ejecutar la suite completa**

Run: `pnpm vitest run`
Expected: todos los tests en PASS. `CatalogoPage.jsx` no tiene test propio hoy (fuera de alcance, per spec — se verifica manualmente en Task 5).

- [ ] **Step 6: Commit**

```bash
git add src/pages/CatalogoPage.jsx src/styles/catalogo.css
git commit -m "feat: CatalogoPage reads q param and filters by search text"
```

---

### Task 3: Panel de búsqueda funcional en `Navbar`

**Files:**
- Modify: `src/components/Navbar.jsx:1-2,16-50,97-101`
- Modify: `src/styles/tienda1.css` (agregar bloque nuevo después de la línea 222, antes del comentario `/* ── Hamburger Menu ── */` en la línea 224)

**Interfaces:**
- Consumes: nada de tasks anteriores directamente — genera URLs `/catalogo?q=<texto>` que Task 2 ya sabe interpretar (el orden de tasks no importa para la corrección: si Task 3 corre antes de que Task 2 esté mergeado, la navegación simplemente no filtraría hasta que Task 2 también esté aplicado. En este plan, Task 2 va antes).
- Produces: nada que otras tasks de este plan consuman.

- [ ] **Step 1: Importar `useNavigate` y agregar estado del panel de búsqueda**

Reemplazar la línea 1-2 (imports) de `src/components/Navbar.jsx`:

```javascript
import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
```

Dentro de `Navbar()`, agregar el nuevo estado y ref justo después de `const timerRef = useRef(null)` (línea 22):

```javascript
  const navigate = useNavigate()
  const [busquedaAbierta, setBusquedaAbierta] = useState(false)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const inputBusquedaRef = useRef(null)
```

- [ ] **Step 2: Agregar los handlers de búsqueda y extender `cerrarTodo`**

Reemplazar la función `cerrarTodo` existente (líneas 47-50):

```javascript
  function cerrarTodo() {
    setMenuActivo(null)
    cerrarDrawer()
    setBusquedaAbierta(false)
  }

  /* ─── Búsqueda ─── */
  function alternarBusqueda() {
    setBusquedaAbierta((v) => !v)
  }
  function enviarBusqueda(e) {
    e.preventDefault()
    const texto = textoBusqueda.trim()
    if (texto) {
      navigate(`/catalogo?q=${encodeURIComponent(texto)}`)
    }
    setBusquedaAbierta(false)
    setTextoBusqueda('')
  }
```

Agregar un nuevo `useEffect` justo después del `useEffect` existente que escucha `Escape` (después de la línea que cierra ese `useEffect`, antes del `return (`):

```javascript
  // Enfoca el input al abrir el panel de búsqueda.
  useEffect(() => {
    if (busquedaAbierta) inputBusquedaRef.current?.focus()
  }, [busquedaAbierta])
```

- [ ] **Step 3: Reemplazar el botón de búsqueda muerto por el panel funcional**

Reemplazar el botón de búsqueda (líneas 98-101 originales, dentro de `<div className="nav-actions">`):

```jsx
            <div className="nav-search-wrap">
              <button
                className="nav-action-btn"
                id="btn-search"
                aria-label="Buscar"
                aria-expanded={busquedaAbierta}
                type="button"
                onClick={alternarBusqueda}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </button>
              {busquedaAbierta && (
                <form className="nav-search" role="search" onSubmit={enviarBusqueda}>
                  <input
                    ref={inputBusquedaRef}
                    type="search"
                    className="nav-search__input"
                    placeholder="Buscar productos…"
                    aria-label="Buscar productos"
                    value={textoBusqueda}
                    onChange={(e) => setTextoBusqueda(e.target.value)}
                  />
                </form>
              )}
            </div>
```

- [ ] **Step 4: Agregar el CSS del panel (aditivo)**

Agregar en `src/styles/tienda1.css`, después de la regla `.nav-action-btn--login:hover` (línea 218-222) y antes del comentario `/* ── Hamburger Menu ── */` (línea 224):

```css
.nav-search-wrap {
  position: relative;
}

.nav-search {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 20;
  background: var(--color-surface);
  border: 1px solid var(--color-border-hover);
  border-radius: var(--radius-pill);
  padding: 0.25rem 0.25rem 0.25rem 1rem;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
}

.nav-search__input {
  border: none;
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  width: 220px;
  outline: none;
}

.nav-search__input::placeholder {
  color: var(--color-text-secondary);
}
```

- [ ] **Step 5: Ejecutar la suite completa**

Run: `pnpm vitest run`
Expected: todos los tests en PASS. `Navbar.jsx` no tiene test propio hoy (fuera de alcance, per spec — se verifica manualmente en Task 5).

- [ ] **Step 6: Commit**

```bash
git add src/components/Navbar.jsx src/styles/tienda1.css
git commit -m "feat: working search panel in Navbar, navigates to /catalogo?q="
```

---

### Task 4: Mega-menú accesible por teclado

**Files:**
- Modify: `src/components/Navbar.jsx:79-88,131-166` (líneas del archivo previas a la Task 3; renumerar según el estado real del archivo tras aplicar Task 3 antes de editar)

**Interfaces:**
- Consumes: `abrirMega(id)`, `cerrarMegaConDelay()`, `cancelarCierre()` — funciones ya existentes en el mismo archivo (líneas 27-37 originales), sin cambios en su firma ni lógica interna.
- Produces: nada que otras tasks de este plan consuman.

- [ ] **Step 1: Agregar `onFocus`/`onBlur` al `<li>` disparador del mega-menú**

Ubicar el bloque `<ul className="nav-main" id="nav-main">` y el `.map` sobre `NAV_MEGA` (líneas 78-88 originales). Reemplazar el `<li>`:

```jsx
            {NAV_MEGA.map((item) => (
              <li
                key={item.id}
                className={`nav-main__item has-mega${menuActivo === item.id ? ' active' : ''}`}
                onMouseEnter={() => abrirMega(item.id)}
                onMouseLeave={cerrarMegaConDelay}
                onFocus={() => abrirMega(item.id)}
                onBlur={cerrarMegaConDelay}
              >
                <Link className="nav-main__link" to={item.to}>{item.label}</Link>
              </li>
            ))}
```

- [ ] **Step 2: Agregar `onFocus`/`onBlur` al panel del mega-menú**

Ubicar el bloque de los paneles del mega-menú (`{Object.entries(MEGA_MENUS).map(([id, menu]) => (...))}`, líneas 131-166 originales). Reemplazar el `<div className="mega-menu...">`:

```jsx
        <div
          key={id}
          className={`mega-menu${menuActivo === id ? ' is-open' : ''}`}
          id={`mega-${id}`}
          aria-hidden={menuActivo !== id}
          onMouseEnter={cancelarCierre}
          onMouseLeave={cerrarMegaConDelay}
          onFocus={cancelarCierre}
          onBlur={cerrarMegaConDelay}
        >
```

- [ ] **Step 3: Ejecutar la suite completa**

Run: `pnpm vitest run`
Expected: todos los tests en PASS. `Navbar.jsx` no tiene test propio hoy (fuera de alcance, per spec — se verifica manualmente en Task 5 con Tab/Shift+Tab).

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.jsx
git commit -m "fix: mega-menu opens/closes on keyboard focus, not just mouse hover"
```

---

### Task 5: Sincronizar el breakpoint de zoom con el CSS en `ProductoDetallePage`

**Files:**
- Modify: `src/pages/ProductoDetallePage.jsx` (constante nueva cerca del inicio del archivo + línea 125 original)

**Interfaces:**
- Consumes: nada.
- Produces: constante `BREAKPOINT_ZOOM_DESACTIVADO_PX` usada solo dentro de este archivo.

- [ ] **Step 1: Localizar el inicio del archivo y agregar la constante**

Leer las primeras ~20 líneas de `src/pages/ProductoDetallePage.jsx` para ubicar dónde terminan los imports y empiezan las constantes de módulo (patrón ya usado en otros archivos del proyecto, ej. `PagoPage.jsx` tiene `BANCOS_PSE` como constante de módulo justo después de los imports). Agregar, en ese mismo lugar:

```javascript
// Debe coincidir con el breakpoint real que desactiva el layout de zoom
// en producto-detalle.css:816 (`@media (max-width: 768px)`). Si cambia
// uno, hay que cambiar el otro — no hay forma de leer el CSS desde JS
// sin herramientas adicionales, así que esto es documentación ejecutable.
const BREAKPOINT_ZOOM_DESACTIVADO_PX = 768
```

- [ ] **Step 2: Reemplazar el número mágico en `alternarZoom`**

Reemplazar la línea `if (window.innerWidth <= 768 || !galleryRef.current) return` dentro de `alternarZoom(e)`:

```javascript
  function alternarZoom(e) {
    if (window.innerWidth <= BREAKPOINT_ZOOM_DESACTIVADO_PX || !galleryRef.current) return
```

- [ ] **Step 3: Verificar que no queda el número mágico suelto**

Run: `grep -n "innerWidth <= 768" src/pages/ProductoDetallePage.jsx`
Expected: sin coincidencias — solo debe aparecer `BREAKPOINT_ZOOM_DESACTIVADO_PX`.

- [ ] **Step 4: Ejecutar la suite completa**

Run: `pnpm vitest run`
Expected: todos los tests en PASS. Sin cambio de comportamiento — mismo valor `768`, solo documentado.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ProductoDetallePage.jsx
git commit -m "docs: name the zoom breakpoint constant and link it to its CSS source"
```

---

### Task 6: Verificación manual de accesibilidad y búsqueda

**Files:** ninguno (solo verificación, sin cambios de código).

**Interfaces:** N/A.

- [ ] **Step 1: Levantar el servidor de desarrollo**

Run: `pnpm dev`
Expected: Vite arranca sin errores en `http://localhost:5173/`.

- [ ] **Step 2: Verificar el mega-menú por teclado**

En el navegador, en `/`: usar `Tab` para navegar desde el logo hacia los links de la nav principal (Hombre/Mujer/Niños/Deporte). Al llegar con foco a uno de esos links, el mega-menú correspondiente debe abrirse visualmente. Seguir con `Tab` hacia los links dentro del panel — el panel debe permanecer abierto mientras el foco esté en cualquiera de sus links. Al seguir tabulando más allá del último link del panel (hacia "NOVEDADES" o el siguiente elemento), el panel debe cerrarse.

Expected: el mega-menú es completamente operable sin mouse; ningún link queda inalcanzable por teclado.

- [ ] **Step 3: Verificar la búsqueda**

En `/`, hacer click en el ícono de lupa del navbar: debe aparecer el panel con un input ya enfocado. Escribir un texto que coincida con un producto real del catálogo (por ejemplo, una marca como "Nike") y presionar `Enter`. Debe navegar a `/catalogo?q=Nike` y la página debe mostrar `Resultados para «Nike»` junto con solo los productos cuyo nombre o marca contienen ese texto. Hacer click en "Quitar" — debe volver a `/catalogo` sin el filtro de texto, mostrando todos los productos.

Expected: la búsqueda filtra correctamente y es reversible.

- [ ] **Step 4: Verificar que el zoom de producto sigue funcionando igual**

En cualquier página de producto (`/producto/:id`) en viewport de escritorio (> 768px), hacer click en la imagen principal — debe activarse el zoom igual que antes. Redimensionar la ventana a menos de 768px de ancho (o usar las devtools en modo móvil) y hacer click en la imagen — el zoom no debe activarse (mismo comportamiento que antes de esta fase, ahora con la constante documentada).

Expected: sin cambio de comportamiento respecto a antes de esta fase.

- [ ] **Step 5: Correr la suite completa una última vez**

Run: `pnpm vitest run`
Expected: todos los tests en PASS (31 tests: 27 previos + 4 nuevos de búsqueda).

No hay commit en esta tarea (es solo verificación).
