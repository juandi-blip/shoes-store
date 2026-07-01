# Migración del front-end de Shoes'sStore a React (GA7-220501096-AA4-EV03)

## Contexto

Shoes'sStore 2.0 es una tienda de zapatillas construida en HTML/CSS/JS vanilla, con datos locales en `productos.json` (sin backend). Esta evidencia (GA7-220501096-AA4-EV03 de la guía SENA GA7) exige codificar el módulo front-end del proyecto usando el framework React, cumpliendo estándares de codificación y control de versiones.

El proyecto ya cuenta con un frontend React independiente (`zapateria-frontend`, en la evidencia AA3) que es un **panel de administración** (CRUD de productos/categorías/proveedores) conectado a un backend Spring Boot. Ese proyecto queda fuera de alcance: esta evidencia migra la **tienda pública** (cara al cliente).

## Objetivo

Migrar las páginas públicas de Shoes'sStore 2.0 a componentes React, preservando el diseño visual y la lógica funcional actuales (mega-menú, filtros de catálogo, detalle de producto, login/registro/perfil mock), sin depender de ningún backend.

## Decisiones

- **Fuente de datos**: `productos.json` local, importado como módulo estático. Sin llamadas a `zapateria-backend` (esa integración se evalúa en la actividad AA5 de la guía, no aquí).
- **Alcance de páginas**: todas — Inicio, Catálogo (con filtros y orden), Detalle de producto, Login, Registro, Perfil.
- **Ubicación del proyecto**: `shoes'sStore 2.0/frontend-react/` (proyecto Vite nuevo, conviviendo con el sitio HTML actual, mismo repo git).
- **Stack**: Vite + React 18 + React Router 6 + Axios (no se usa por ahora, se deja disponible por consistencia con `zapateria-frontend` si se conecta a futuro) — mismo patrón que el proyecto hermano `zapateria-frontend` de AA3.
- **Estilos**: se reutilizan los archivos CSS actuales (`variables.css`, `tienda1.css`, `catalogo.css`, `producto-detalle.css`, `inicioRegistro.css`) importados directamente en los componentes, para minimizar el riesgo de romper el diseño ya validado. No se reescribe a Tailwind ni CSS-in-JS.
- **Estado**: sin gestor de estado externo. Un `SessionContext` (React Context + `useState`) simula la sesión de usuario tras login/registro, igual de "mock" que la versión actual (`admin` / `shoes2026`).

## Arquitectura de componentes

```
frontend-react/
├── src/
│   ├── main.jsx
│   ├── App.jsx                  # BrowserRouter + rutas
│   ├── context/
│   │   └── SessionContext.jsx   # sesión mock (login/logout)
│   ├── data/
│   │   └── productos.json       # copia del dataset actual
│   ├── components/
│   │   ├── Navbar.jsx           # mega-menú, reutiliza tienda.js → hook
│   │   ├── Footer.jsx
│   │   ├── AnnouncementBar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   └── Toast.jsx            # feedback "agregado al carrito"
│   ├── hooks/
│   │   └── useProductos.js      # carga/filtra productos.json
│   └── pages/
│       ├── HomePage.jsx         # destacados, novedades, outlet
│       ├── CatalogoPage.jsx     # sidebar filtros + grid + sort, sync con useSearchParams
│       ├── ProductoDetallePage.jsx  # galería, acordeones, tallas, toast
│       ├── LoginPage.jsx
│       ├── RegistroPage.jsx
│       └── PerfilPage.jsx       # protegida por SessionContext
├── index.html
├── package.json
└── vite.config.js
```

### Flujo de datos

- `useProductos()` carga `productos.json` una vez (import estático) y expone helpers de filtrado/orden, reemplazando la lógica imperativa de `catalogo.js`/`home.js`.
- `CatalogoPage` sincroniza filtros (género, categoría, outlet, novedad, precio) con la URL vía `useSearchParams`, igual que hoy con `URLSearchParams` manual.
- `ProductoDetallePage` lee el `id` de la ruta (`/producto/:id`), busca el producto en el dataset y muestra galería + specs + acordeones; el botón "agregar" dispara un `Toast` (sin persistencia real, igual que la versión actual).
- `SessionContext` guarda el usuario mock en memoria (no `localStorage`, para no diverger del comportamiento actual documentado como "Mock Authentication").

### Estándares de codificación (requisito explícito de la evidencia)

- Componentes en PascalCase, un componente por archivo.
- Hooks custom con prefijo `use`.
- Props tipadas con JSDoc (sin TypeScript, para no añadir complejidad de build).
- Comentario JSDoc corto al inicio de cada componente/hook describiendo su responsabilidad.
- Nombres de variables/funciones en español para mantener consistencia con el resto del proyecto (el código actual ya está en español).

## Fuera de alcance

- Conexión real a backend/API (queda para AA5).
- Carrito de compras persistente (no existe hoy, no se añade).
- Tests automatizados de UI (no lo pide esta evidencia; se puede añadir con Vitest si el usuario lo pide después).

## Entregable de evidencia

- Carpeta `GA7-220501096-AA4-EV03/` en `D:\juandiplay\sena\` con:
  - Copia comprimida (`ZIP`) del proyecto `frontend-react/` con nombre `APELLIDO_NOMBRE_AA4_EV03.zip`.
  - Archivo de texto con el enlace del repositorio remoto (mismo repo de `shoes'sStore 2.0`, o uno nuevo si el usuario lo prefiere — pendiente de confirmar en el plan).
