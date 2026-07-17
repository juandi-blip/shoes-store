# Fase 3: accesibilidad y responsive — Shoes'sStore 2.0

## Contexto

Continuación del ciclo de mejoras (Fase 1: bugs/lógica, Fase 2: performance, ambas en `origin/main`). Esta fase cubre los hallazgos de accesibilidad confirmados en la auditoría original, acotados por decisión del usuario. Se descartó explícitamente la unificación de breakpoints/variables CSS por su alto riesgo de romper layouts ya validados visualmente.

## Hallazgos que motivan esta fase

1. **Mega-menú inaccesible por teclado** (`src/components/Navbar.jsx:79-88,130-166`, severidad Media): el mega-menú de escritorio solo abre/cierra con `onMouseEnter`/`onMouseLeave`. Un usuario que navega con `Tab` no puede activarlo — los links de segundo nivel dentro del panel quedan inalcanzables sin ratón.
2. **Botón de búsqueda sin funcionalidad** (`src/components/Navbar.jsx:99`, severidad Media): el botón con `aria-label="Buscar"` no tiene `onClick` — se ve interactivo pero no hace nada, confuso para usuarios de teclado/lectores de pantalla.
3. **Breakpoint duplicado y desincronizado entre JS y CSS** (`src/pages/ProductoDetallePage.jsx:125`, severidad Baja): `window.innerWidth <= 768` está hardcodeado en JS sin relación explícita con el `@media (max-width: 768px)` real en `src/styles/producto-detalle.css:816` que desactiva el layout de galería con zoom en el mismo breakpoint.

Descartado por decisión explícita del usuario: unificación de breakpoints/variables CSS en todo el proyecto (25 `@media` repartidos en 6 archivos) — refactor grande, alto riesgo de regresión visual, fuera de proporción para este ciclo.

## Objetivo

Que el mega-menú sea operable por teclado, que el botón de búsqueda ejecute una búsqueda real integrada con el catálogo existente, y que la relación entre el breakpoint de JS y el de CSS en la página de detalle quede documentada en el propio código — sin romper ningún layout ni comportamiento existente.

## Decisiones

### Mega-menú por teclado

- Se reutiliza el mecanismo de delay ya existente (`abrirMega`, `cerrarMegaConDelay`, `cancelarCierre`, `CLOSE_DELAY = 120`ms) para eventos de foco, igual que ya se usa para `mouseenter`/`mouseleave`. Como los paneles `.mega-menu` viven en el DOM como hermanos del `<li>` disparador (no anidados), no basta con `onFocus` en el `<li>`: se necesita también en el panel, apoyándose en el debounce existente para cubrir la transición de foco entre ambos sin comparar `relatedTarget`.
- `<li className="nav-main__item has-mega">`: agrega `onFocus={() => abrirMega(item.id)}` y `onBlur={cerrarMegaConDelay}`.
- `<div className="mega-menu">`: agrega `onFocus={cancelarCierre}` y `onBlur={cerrarMegaConDelay}` (ya tiene `onMouseEnter={cancelarCierre}` y `onMouseLeave={cerrarMegaConDelay}` — se agregan los equivalentes de foco).
- Sin cambios visuales. `Escape` ya cierra todo vía el `useEffect` existente (`cerrarTodo`).

### Búsqueda funcional

- **`src/hooks/useProductos.js`**: `filtrarYOrdenarProductos` gana un criterio opcional `busqueda` (string, default `''`) en el objeto `filtros`. Si `busqueda.trim()` no está vacío, se filtra por coincidencia de subcadena case-insensitive contra `nombre` o `marca` del producto (`.toLowerCase().includes(...)`). Sin acentos-insensitive ni fuzzy matching — YAGNI, el dataset actual no lo requiere.
- **`src/pages/CatalogoPage.jsx`**: nuevo `qParam = searchParams.get('q') ?? ''`, memoizado en el objeto de filtros igual que los demás (dependencia directa del string crudo). Se muestra una línea `Resultados para "texto"` con un link `Quitar` (→ `/catalogo` sin `q`) encima del grid cuando `q` no está vacío.
- **`src/components/Navbar.jsx`**: el botón de búsqueda (`id="btn-search"`) gana `onClick` que alterna un panel desplegable (`busquedaAbierta`, nuevo `useState`) con un `<form>` de un solo `<input type="search">`. Al enviar (`onSubmit`, también cubre Enter), si el texto no está vacío navega a `/catalogo?q=<texto codificado>` vía `useNavigate` y cierra el panel. `Escape` (ya manejado por el `useEffect` existente) también cierra este panel — se agrega `setBusquedaAbierta(false)` a `cerrarTodo`.
- **CSS nuevo, aislado**: un bloque nuevo en `src/styles/tienda1.css` (`.nav-search`, `.nav-search__input`, etc.) posicionado en `absolute` bajo el botón, reutilizando variables ya existentes (`--color-surface`, `--color-border-hover`, `--radius-pill`, `--color-text`). No se modifica ninguna regla CSS existente — solo se agregan selectores nuevos, sin riesgo de romper estilos ya validados.

### Breakpoint JS/CSS en detalle de producto

- `src/pages/ProductoDetallePage.jsx`: se extrae `window.innerWidth <= 768` a una constante de módulo `const BREAKPOINT_ZOOM_DESACTIVADO_PX = 768` con un comentario que referencia explícitamente `producto-detalle.css:816` como la fuente del breakpoint real. Sin cambio de comportamiento — es documentación ejecutable, no una sincronización automática (leer variables CSS en runtime sin herramientas nuevas queda fuera de alcance).

## Arquitectura

```
src/
├── components/
│   └── Navbar.jsx         # onFocus/onBlur en <li> y en .mega-menu (teclado);
│                            # useState busquedaAbierta + textoBusqueda, form de búsqueda
├── hooks/
│   └── useProductos.js    # filtrarYOrdenarProductos gana filtros.busqueda
├── pages/
│   ├── CatalogoPage.jsx   # lee q de la URL, lo pasa a filtros, muestra "Resultados para..."
│   └── ProductoDetallePage.jsx  # window.innerWidth <= 768 → BREAKPOINT_ZOOM_DESACTIVADO_PX
└── styles/
    └── tienda1.css        # bloque nuevo .nav-search (aditivo, no modifica reglas existentes)
```

### Testing

- `src/hooks/useProductos.test.js`: nuevos casos para `busqueda` — coincide por nombre, coincide por marca, case-insensitive, string vacío no filtra nada.
- El mega-menú por teclado y el panel de búsqueda de `Navbar.jsx` se verifican manualmente en navegador (Tab/Shift+Tab a través del menú, Enter en el input de búsqueda) — no son practicables de testear con Vitest+jsdom sin un arnés de simulación de foco frágil que no aporta valor proporcional.
- Los tests existentes (`CartContext.test.jsx`, `SessionContext.test.jsx`, `pricing.test.js`) no deben verse afectados.

## Fuera de alcance (queda para fases posteriores)

- Unificación de breakpoints/variables CSS en todo el proyecto (descartado por el usuario, alto riesgo).
- SEO/testing ampliado (Fase 4).
