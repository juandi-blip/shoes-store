# Fase 2: performance — memoización — Shoes'sStore 2.0

## Contexto

Continuación del ciclo de mejoras iniciado en la Fase 1 (`docs/superpowers/specs/2026-07-16-fase1-bugs-logica-negocio-design.md`, ya implementada y en `origin/main`). Esta fase cubre los hallazgos de performance confirmados en la auditoría original, acotados por decisión del usuario a los dos de mayor severidad.

## Hallazgos que motivan esta fase

1. **`CartContext` reconstruye su `value` en cada render** (`src/context/CartContext.jsx:98-104`, severidad Alta): las funciones (`agregarItem`, etc.) y el objeto `value` son literales nuevos en cada render del provider. Como `CartProvider` envuelve toda la app, cualquier consumidor (`Navbar`, `CarritoPage`, `PagoPage`, `ProductoDetallePage`) se re-renderiza en cascada aunque el carrito no haya cambiado.
2. **Memoización rota en `CatalogoPage`** (`src/pages/CatalogoPage.jsx:35-36,60-63`, severidad Media): `generos` y `categorias` se calculan como arrays nuevos en cada render (no memoizados) y son dependencias del `useMemo` de `productosFiltrados`. Como su referencia cambia siempre, el `useMemo` nunca cachea — se refiltra el catálogo en cada render.

Descartado por decisión explícita del usuario: mejoras al `<video>` del hero en `HomePage.jsx` (severidad Baja, fuera de alcance de este ciclo).

## Objetivo

Que `CartContext` exponga un `value` con identidad estable entre renders cuando el carrito no cambia, y que `CatalogoPage` filtre el catálogo solo cuando cambian los filtros reales — sin alterar ningún comportamiento visible ni resultado de filtrado/carrito.

## Decisiones

- **`CartContext.jsx`**:
  - `agregarItem`, `actualizarCantidad`, `quitarItem`, `vaciarCarrito` pasan a `useCallback` con array de dependencias vacío (`[]`) — cada una solo usa `setItems` (estable por contrato de React) y funciones puras de módulo (`sanearItems`), sin closures sobre props/estado.
  - El cálculo de `lineas`, `totalUnidades`, `totalPrecio` (hoy código plano en el cuerpo del componente) pasa a `useMemo` con dependencia `[items]`.
  - El objeto `value` del `<CartContext.Provider>` pasa a `useMemo` con dependencias `[lineas, totalUnidades, totalPrecio, agregarItem, actualizarCantidad, quitarItem, vaciarCarrito]`.
- **`CatalogoPage.jsx`**:
  - `generos` pasa a `useMemo(() => parseGeneros(searchParams), [searchParams.get('genero')])`.
  - `categorias` pasa a `useMemo(() => parseCategorias(searchParams), [searchParams.get('categoria'), searchParams.get('proposito'), searchParams.get('subcategoria')])`.
  - Los deps son los strings crudos de la URL (no el objeto `searchParams`, que es una instancia nueva en cada render de React Router), así que `generos`/`categorias` solo cambian de referencia cuando el usuario realmente cambia esos filtros.
- **Sin cambios de comportamiento**: mismos resultados de filtrado, mismos datos de carrito, misma UI. Es una optimización interna.

## Arquitectura

```
src/
├── context/
│   └── CartContext.jsx   # agregarItem/actualizarCantidad/quitarItem/vaciarCarrito → useCallback;
│                          # lineas/totalUnidades/totalPrecio → useMemo([items]);
│                          # value del provider → useMemo(...)
├── pages/
│   └── CatalogoPage.jsx  # generos/categorias → useMemo sobre los params crudos de la URL
```

### Testing

- `src/context/CartContext.test.jsx`: nuevo caso que verifica estabilidad de referencia — usando `rerender()` de `renderHook` sin cambiar `items`, confirmar que `agregarItem`, `quitarItem` y `vaciarCarrito` mantienen la misma identidad de función entre renders (prueba directa de que `useCallback` funciona).
- La reducción de recálculos en `CatalogoPage` (efecto del `useMemo` reparado) no se cubre con un test unitario nuevo — requeriría un arnés de conteo de renders que sería frágil y no aporta valor proporcional; se verifica manualmente con React DevTools Profiler durante la Fase 4 (o cuando el usuario lo pida).
- Los tests existentes (`CartContext.test.jsx` actuales, `SessionContext.test.jsx`, `useProductos.test.js`, `pricing.test.js`) deben seguir pasando sin cambios: esta fase no modifica ningún resultado observable.

## Fuera de alcance (queda para fases posteriores)

- Video del hero en `HomePage.jsx` (descartado por el usuario para este ciclo).
- Accesibilidad/responsive (Fase 3).
- SEO/testing ampliado (Fase 4).
