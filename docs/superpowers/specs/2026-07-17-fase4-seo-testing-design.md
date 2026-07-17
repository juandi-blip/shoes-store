# Fase 4: SEO y testing ampliado — Shoes'sStore 2.0

## Contexto

Última fase del ciclo de mejoras (Fase 1: bugs/lógica, Fase 2: performance, Fase 3: a11y/responsive, las tres en `origin/main`). Cubre los hallazgos de SEO y testing de la auditoría original.

El sitio es un SPA sin SSR desplegado en GitHub Pages (`https://juandi-blip.github.io/shoes-store/`, `base: '/shoes-store/'` en build). Esto acota el alcance real del SEO: bots que no ejecutan JavaScript no ven contenido dinámico, así que las mejoras de esta fase optimizan rankings/snippets para bots que sí ejecutan JS (Google actual) y previsualizaciones de redes sociales (Open Graph/Twitter Cards), sin resolver indexación al 100%. Prerendering/SSG queda fuera de alcance por decisión explícita del usuario (cambia el pipeline de build, alto riesgo/esfuerzo desproporcionado para este ciclo).

## Hallazgos que motivan esta fase

1. **`<title>`/meta description estáticos para todas las rutas** (`index.html:11,22`): un único título y descripción sirven para Home, Catálogo y cada producto — sin diferenciación, mal para SEO y para previsualizaciones al compartir un link de producto.
2. **Sin Open Graph ni Twitter Cards**: compartir un link (ej. `/producto/001`) en redes sociales o WhatsApp no muestra imagen/nombre del producto.
3. **Sin datos estructurados** (`schema.org`): los resultados de búsqueda no pueden mostrar rich snippets (precio, disponibilidad) para productos.
4. **Sin `robots.txt` ni `sitemap.xml`**: no hay guía explícita para crawlers, ni lista de URLs indexables.
5. **Cobertura de tests limitada a lógica pura/hooks** (`pricing.test.js`, `CartContext.test.jsx`, `SessionContext.test.jsx`, `useProductos.test.js`): cero tests de componentes con lógica de negocio propia — `PagoPage` (validación de formulario de pago), `CatalogoPage` (filtros end-to-end vía URL), `Navbar` (búsqueda, mega-menú por teclado, ambos añadidos en Fase 3).

## Objetivo

Que cada ruta principal tenga título/meta description/Open Graph propios, que las páginas de producto expongan datos estructurados de tipo `Product`, que existan `robots.txt`/`sitemap.xml`, y que la lógica de negocio más propensa a bugs en componentes (pago, filtros de catálogo, búsqueda/mega-menú) tenga cobertura de tests — todo sin agregar dependencias nuevas ni tocar el pipeline de build.

## Decisiones

### Meta tags dinámicos por ruta

- **`src/hooks/useDocumentHead.js`** (nuevo, sin dependencias): hook `useDocumentHead({ title, description, ogImage, canonicalPath })` que en un `useEffect`:
  - Setea `document.title = title`.
  - Para cada meta tag relevante (`description`, `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`), busca el elemento existente por su atributo selector (`meta[name="..."]` o `meta[property="..."]`) y si existe actualiza su `content`; si no existe, lo crea y lo agrega a `<head>`.
  - Para el canonical, busca o crea `<link rel="canonical">` y setea `href` a `` `https://juandi-blip.github.io/shoes-store/${canonicalPath}` `` (sin slash inicial duplicado — `canonicalPath` no debe empezar con `/`, ej. `''`, `'catalogo'`, `` `producto/${id}` ``).
  - Sin cleanup en el `useEffect`: el próximo componente que monte (siguiente ruta) sobreescribe los mismos tags — no hace falta revertir, evita parpadeos entre navegaciones.
  - Los valores de `og:image`/`twitter:image` deben ser URLs absolutas (ya lo son: las imágenes de producto vienen de `static.sneakerjagers.com`; para Home/Catálogo se usa una imagen genérica del sitio, ej. `megamenu-promo.png` con URL absoluta construida a partir de `import.meta.env.BASE_URL` + origin).
- **Uso**:
  - `HomePage`: título `"Shoes Store — Sneakers premium"`, descripción genérica (la misma que ya está en `index.html`), `canonicalPath: ''`.
  - `CatalogoPage`: título dinámico — `` `Resultados para "${qParam}" — Catálogo | Shoes Store` `` si hay búsqueda activa, si no `"Catálogo | Shoes Store"`; descripción genérica de catálogo; `canonicalPath: 'catalogo'` (sin incluir query params — el canonical apunta a la versión sin filtros, práctica estándar para evitar contenido duplicado por combinaciones de filtros).
  - `ProductoDetallePage`: título `` `${producto.nombre} — ${producto.marca} | Shoes Store` ``, descripción con nombre/marca/colorway, `ogImage: producto.imagen`, `canonicalPath: `producto/${producto.id}``.
- **`index.html`**: el `<title>`/`<meta name="description">` estáticos quedan como fallback para el primer paint antes de que React monte (no se eliminan) — el hook los sobreescribe apenas monta cada página.

### Datos estructurados (JSON-LD)

- **`src/hooks/useJsonLd.js`** (nuevo, sin dependencias): hook `useJsonLd(objeto)` que en un `useEffect` crea/actualiza un `<script type="application/ld+json" id="jsonld-producto">` en `<head>` con `JSON.stringify(objeto)`. Si `objeto` es `null` (producto no encontrado todavía), no hace nada.
- **Uso en `ProductoDetallePage.jsx`**: schema `Product` de schema.org:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "<producto.nombre>",
    "brand": { "@type": "Brand", "name": "<producto.marca>" },
    "image": "<producto.imagen>",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "COP",
      "price": "<precio convertido a COP con pricing.js: producto.precio * TASA_COP>",
      "availability": "https://schema.org/InStock"
    }
  }
  ```
  El precio se calcula con la misma constante `TASA_COP` de `src/utils/pricing.js` (no se duplica el valor `4200`), consistente con el precio mostrado en pantalla.

### `robots.txt` y `sitemap.xml`

- **`public/robots.txt`** (nuevo, estático):
  ```
  User-agent: *
  Allow: /
  Sitemap: https://juandi-blip.github.io/shoes-store/sitemap.xml
  ```
- **`public/sitemap.xml`** (nuevo, estático, generado a mano una vez): `<urlset>` con las rutas fijas (`/`, `/catalogo`) y una entrada `/producto/<id>` por cada uno de los 80 productos de `src/data/productos.json`, todas bajo el prefijo `https://juandi-blip.github.io/shoes-store/`. Al ser un dataset que no cambia en cada deploy normal, un archivo estático es suficiente — generarlo dinámicamente en el pipeline de build es YAGNI para el alcance de este ciclo.
- Las páginas fuera del catálogo público (`/login`, `/registro`, `/perfil`, `/carrito`, `/pago`) no se incluyen en el sitemap (no son contenido indexable de interés).

### Tests de componentes clave

Con Vitest + Testing Library (ya configurado), envolviendo cada render en `MemoryRouter` para aislar el enrutamiento:

- **`src/pages/PagoPage.test.jsx`**: número de tarjeta/vencimiento/CVV inválidos muestran el mensaje de error correspondiente y no avanzan; el guard `enviando` bloquea un segundo submit mientras el primero está en curso; un formulario válido muestra la confirmación de orden y vacía el carrito.
- **`src/pages/CatalogoPage.test.jsx`**: togglear un checkbox de género/categoría actualiza la URL (`useSearchParams`) y el grid muestra solo los productos que matchean; el slider de precio filtra por `precioMax`; navegar con `?q=texto` en la URL inicial preselecciona el filtro de búsqueda y muestra el mensaje "Resultados para...".
- **`src/components/Navbar.test.jsx`**: escribir en el input de búsqueda y enviar el formulario navega a `/catalogo?q=<texto>`; abrir el mega-menú por foco (`onFocus` en el `<li>`) lo muestra, y `Escape` lo cierra.

Estos tres archivos son componentes nuevos de test, no modifican los 4 archivos de test existentes (`pricing.test.js`, `CartContext.test.jsx`, `SessionContext.test.jsx`, `useProductos.test.js`), que deben seguir pasando sin cambios.

## Arquitectura

```
src/
├── hooks/
│   ├── useDocumentHead.js     # nuevo: title/meta/canonical dinámicos por ruta
│   ├── useJsonLd.js           # nuevo: inyecta <script type="application/ld+json">
│   └── useProductos.js        # sin cambios
├── pages/
│   ├── HomePage.jsx           # usa useDocumentHead
│   ├── CatalogoPage.jsx       # usa useDocumentHead; CatalogoPage.test.jsx nuevo
│   ├── ProductoDetallePage.jsx # usa useDocumentHead + useJsonLd
│   └── PagoPage.jsx           # PagoPage.test.jsx nuevo
├── components/
│   └── Navbar.jsx             # Navbar.test.jsx nuevo
└── utils/
    └── pricing.js              # sin cambios (se importa TASA_COP para el JSON-LD)

public/
├── robots.txt                 # nuevo
└── sitemap.xml                # nuevo
```

## Fuera de alcance

- Prerendering/SSG (descartado por el usuario, cambia el pipeline de build).
- `react-helmet-async` u otra dependencia para manejo de `<head>` (descartado por el usuario, se prefiere hook propio sin dependencias).
- Configuración de coverage de Vitest con umbral mínimo (descartado por el usuario).
- Generación dinámica del sitemap en build.
- Sitemap/SEO para rutas no públicas (`/login`, `/registro`, `/perfil`, `/carrito`, `/pago`).
