# Fase 2: performance — memoización — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Estabilizar la identidad de referencia del `value` de `CartContext` y reparar la memoización rota de `productosFiltrados` en `CatalogoPage`, sin cambiar ningún comportamiento visible.

**Architecture:** `CartContext.jsx` pasa sus funciones a `useCallback` (deps vacías), sus totales derivados a `useMemo([items])`, y su objeto `value` a `useMemo` sobre esos derivados ya estables. `CatalogoPage.jsx` memoiza `generos`/`categorias` con `useMemo` sobre los strings crudos de `searchParams` (no sobre el objeto `searchParams`, que cambia de referencia en cada render).

**Tech Stack:** React 19, Vite 8, Vitest 4 (jsdom, `globals: true`), `@testing-library/react` (`renderHook`, `act`).

## Global Constraints

- Sin cambios de comportamiento visible ni de resultados de filtrado/carrito — es una optimización interna.
- Nombres de variables/funciones en español (consistencia con el resto del proyecto).
- No modificar `PagoPage.jsx`, `CarritoPage.jsx`, ni `src/utils/pricing.js` en esta fase (ya cerrados en Fase 1).
- No tocar el `<video>` de `HomePage.jsx` (descartado por el usuario para este ciclo).
- Comentario JSDoc corto donde el código nuevo lo amerite (estándar ya usado en el repo).

---

### Task 1: Memoizar `CartContext`

**Files:**
- Modify: `src/context/CartContext.jsx:1,54-105`
- Test: `src/context/CartContext.test.jsx` (agregar caso al final del archivo)

**Interfaces:**
- Consumes: nada nuevo — sigue exponiendo `useCart()` con la misma forma (`lineas`, `totalUnidades`, `totalPrecio`, `agregarItem`, `actualizarCantidad`, `quitarItem`, `vaciarCarrito`).
- Produces: mismas firmas que hoy, ahora con identidad de referencia estable entre renders cuando `items` no cambia. Las Tasks futuras (fuera de este plan) pueden asumir que `agregarItem`/`actualizarCantidad`/`quitarItem`/`vaciarCarrito` son seguras como dependencia de `useEffect`/`useCallback` sin causar loops.

- [ ] **Step 1: Escribir el test de estabilidad de referencia (falla primero)**

Agregar al final de `src/context/CartContext.test.jsx` (después del último `describe`, antes del cierre del archivo):

```javascript
describe('useCart — estabilidad de referencia (memoización)', () => {
  it('agregarItem, quitarItem y vaciarCarrito mantienen la misma identidad entre renders sin cambios', () => {
    const { result, rerender } = renderHook(() => useCart(), { wrapper })
    const agregarItemInicial = result.current.agregarItem
    const quitarItemInicial = result.current.quitarItem
    const vaciarCarritoInicial = result.current.vaciarCarrito

    rerender()

    expect(result.current.agregarItem).toBe(agregarItemInicial)
    expect(result.current.quitarItem).toBe(quitarItemInicial)
    expect(result.current.vaciarCarrito).toBe(vaciarCarritoInicial)
  })

  it('el value completo mantiene la misma identidad entre renders sin cambios en el carrito', () => {
    const { result, rerender } = renderHook(() => useCart(), { wrapper })
    const valueInicial = result.current

    rerender()

    expect(result.current).toBe(valueInicial)
  })
})
```

- [ ] **Step 2: Ejecutar el test para confirmar que falla**

Run: `pnpm vitest run src/context/CartContext.test.jsx`
Expected: FAIL en los dos casos nuevos — `agregarItem`/`quitarItem`/`vaciarCarrito` y el `value` completo son objetos/funciones nuevos en cada render porque hoy no hay memoización.

- [ ] **Step 3: Implementar la memoización en `CartContext.jsx`**

Reemplazar la línea 1 (import) de `src/context/CartContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
```

Reemplazar el cuerpo de `CartProvider` desde la línea 54 (`export function CartProvider({ children }) {`) hasta la línea 105 (cierre de la función, antes de `/** Hook de acceso al carrito. */`) por:

```javascript
/** Provee el estado del carrito (persistido en localStorage) a toda la app. */
export function CartProvider({ children }) {
  const [items, setItems] = useState(cargarCarrito)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items))
    } catch {
      /* storage lleno o bloqueado: el carrito sigue funcionando en memoria */
    }
  }, [items])

  const agregarItem = useCallback((id, talla, cantidad = 1) => {
    setItems((previos) => sanearItems([...previos, { id, talla, cantidad }]))
  }, [])

  const actualizarCantidad = useCallback((id, talla, cantidad) => {
    setItems((previos) =>
      sanearItems(
        previos.map((item) =>
          item.id === id && item.talla === talla ? { ...item, cantidad } : item
        )
      )
    )
  }, [])

  const quitarItem = useCallback((id, talla) => {
    setItems((previos) => previos.filter((item) => !(item.id === id && item.talla === talla)))
  }, [])

  const vaciarCarrito = useCallback(() => {
    setItems([])
  }, [])

  // Enriquecidos con datos del catálogo (precio SIEMPRE del dataset).
  // Memoizado sobre `items`: sin esto, `lineas` sería un array nuevo en
  // cada render (aunque `items` no cambie), invalidando el useMemo de abajo.
  const { lineas, totalUnidades, totalPrecio } = useMemo(() => {
    const lineas = items
      .map((item) => {
        const producto = productosData.find((p) => p.id === item.id)
        return producto ? { ...item, producto, subtotal: producto.precio * item.cantidad } : null
      })
      .filter(Boolean)
    return {
      lineas,
      totalUnidades: lineas.reduce((acc, l) => acc + l.cantidad, 0),
      totalPrecio: lineas.reduce((acc, l) => acc + l.subtotal, 0),
    }
  }, [items])

  // El value solo cambia de referencia cuando `items` realmente cambia:
  // las funciones son estables (useCallback) y los derivados también (useMemo).
  const value = useMemo(
    () => ({ lineas, totalUnidades, totalPrecio, agregarItem, actualizarCantidad, quitarItem, vaciarCarrito }),
    [lineas, totalUnidades, totalPrecio, agregarItem, actualizarCantidad, quitarItem, vaciarCarrito]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
```

- [ ] **Step 4: Ejecutar el test para confirmar que pasa**

Run: `pnpm vitest run src/context/CartContext.test.jsx`
Expected: PASS — los 2 casos nuevos y los 8 existentes (10 en total en este archivo).

- [ ] **Step 5: Ejecutar la suite completa**

Run: `pnpm vitest run`
Expected: todos los archivos en PASS (incluye `SessionContext.test.jsx`, `useProductos.test.js`, `pricing.test.js` sin cambios de comportamiento).

- [ ] **Step 6: Commit**

```bash
git add src/context/CartContext.jsx src/context/CartContext.test.jsx
git commit -m "perf: memoize CartContext value to stop cascading re-renders"
```

---

### Task 2: Reparar la memoización de filtros en `CatalogoPage`

**Files:**
- Modify: `src/pages/CatalogoPage.jsx:35-36`

**Interfaces:**
- Consumes: `parseGeneros(searchParams)` y `parseCategorias(searchParams)` (funciones ya existentes en el mismo archivo, sin cambios en su firma ni lógica interna).
- Produces: `generos` y `categorias` con identidad de referencia estable mientras los parámetros de URL relevantes no cambien — el `useMemo` de `productosFiltrados` (líneas 60-63, sin cambios) ahora cachea de verdad porque sus dependencias dejan de cambiar en cada render.

- [ ] **Step 1: Memoizar `generos` y `categorias`**

La línea 1 (`import { useMemo } from 'react'`) no cambia — `useMemo` ya estaba importado para `productosFiltrados`.

Reemplazar las líneas 35-36 dentro de `CatalogoPage()`:

```javascript
  const generos = parseGeneros(searchParams)
  const categorias = parseCategorias(searchParams)
```

por:

```javascript
  // Memoizados sobre los strings crudos de la URL (no sobre `searchParams`,
  // que React Router entrega como instancia nueva en cada render): así
  // `generos`/`categorias` solo cambian de referencia cuando el usuario
  // realmente cambia esos filtros, y el useMemo de productosFiltrados de
  // abajo deja de recalcular en cada render.
  const generoParam = searchParams.get('genero')
  const categoriaParam = searchParams.get('categoria')
  const propositoParam = searchParams.get('proposito')
  const subcategoriaParam = searchParams.get('subcategoria')
  const generos = useMemo(() => parseGeneros(searchParams), [generoParam])
  const categorias = useMemo(() => parseCategorias(searchParams), [categoriaParam, propositoParam, subcategoriaParam])
```

- [ ] **Step 2: Verificar que no queden usos sin memoizar**

Run: `grep -n "const generos = parseGeneros\|const categorias = parseCategorias" src/pages/CatalogoPage.jsx`
Expected: sin coincidencias — ambas asignaciones directas fueron reemplazadas por las versiones con `useMemo`.

- [ ] **Step 3: Ejecutar la suite completa**

Run: `pnpm vitest run`
Expected: todos los tests en PASS. `CatalogoPage.jsx` no tiene test propio hoy (fuera de alcance de esta fase, ver spec — la reducción de recálculos se verifica manualmente con React DevTools Profiler, no con un test nuevo).

- [ ] **Step 4: Commit**

```bash
git add src/pages/CatalogoPage.jsx
git commit -m "perf: fix broken memoization of generos/categorias in CatalogoPage"
```

---

### Task 3: Verificación manual del comportamiento y del efecto de la memoización

**Files:** ninguno (solo verificación, sin cambios de código).

**Interfaces:** N/A.

- [ ] **Step 1: Levantar el servidor de desarrollo**

Run: `pnpm dev`
Expected: Vite arranca sin errores en `http://localhost:5173/`.

- [ ] **Step 2: Verificar que el carrito funciona igual que antes**

En el navegador: agregar un producto al carrito desde `/producto/:id`, ir a `/carrito`, cambiar cantidad con `+`/`-`, eliminar el ítem, verificar que el badge del carrito en el navbar se actualiza en cada paso.

Expected: comportamiento idéntico al de antes de esta fase — ningún cambio visible.

- [ ] **Step 3: Verificar que los filtros del catálogo funcionan igual que antes**

En `/catalogo`: activar un filtro de género, un filtro de categoría, mover el slider de precio, activar "Solo Outlet" y "Solo Novedades", cambiar el orden. Verificar que el conteo de productos y la URL se actualizan correctamente en cada caso, y que el botón "atrás" del navegador restaura el estado de filtros anterior.

Expected: comportamiento idéntico al de antes de esta fase.

- [ ] **Step 4: (Opcional) Confirmar la reducción de re-renders con React DevTools Profiler**

Abrir React DevTools → pestaña Profiler → grabar mientras se interactúa con el carrito (agregar/quitar un ítem) y con los filtros del catálogo (activar/desactivar un checkbox). Comparar qué componentes se re-renderizan.

Expected: al agregar un ítem al carrito, solo los consumidores de `CartContext` cuyo dato relevante cambió deberían re-renderizarse en el próximo cambio real del carrito (no en renders no relacionados); al cambiar un filtro de catálogo, `productosFiltrados` deja de recalcularse en renders donde los filtros no cambiaron. Esta verificación es exploratoria — no hay un número exacto esperado, es una confirmación cualitativa del efecto de la memoización.

- [ ] **Step 5: Correr la suite completa una última vez**

Run: `pnpm vitest run`
Expected: todos los tests en PASS (incluye los 2 casos nuevos de `CartContext.test.jsx`).

No hay commit en esta tarea (es solo verificación).
