# Fase 5 — Imágenes por género en mega-menú + páginas del footer

## Contexto

Dos bugs visibles reportados por el usuario con capturas de pantalla:

1. **Imagen repetida en mega-menú.** `Navbar.jsx:208` usa `assetUrl('megamenu-promo.png')` — un único archivo estático para las 3 tarjetas promo (Mujer/Hombre/Niños) definidas en `megaMenuData.js`. El texto (`promo.title`, `promo.sub`) ya varía por género, pero la imagen no. Nota: las tarjetas de "Categorías Destacadas" en `HomePage.jsx` (líneas 24-28) **ya usan** imagen distinta por género — ese bug no aplica ahí, solo al mega-menú.
2. **Footer con links muertos.** `Footer.jsx` tiene 13 enlaces (`to: '#'`) en las columnas "Ayuda" y "Shoes Store" que no apuntan a ninguna ruta real. Solo la columna "Productos" funciona hoy (enlaza a `/catalogo` con query params).

Fuera de alcance para esta fase (confirmado con el usuario): estrategia de marketing (se discute después), iconos sociales del footer, links legales del pie (Términos/Privacidad/Aviso Legal se incluyen como páginas porque ya están listados como columna, pero no se profundiza en contenido legal real).

## Parte 1 — Imagen por género en el mega-menú

**Cambio en datos:** cada entrada de `MEGA_MENUS` en `megaMenuData.js` (mujer, hombre, ninos) gana un campo `promo.img` con una URL externa (Pexels/Unsplash, mismo patrón que `CATEGORIAS` en `HomePage.jsx`) mostrando un producto/calzado distinto y coherente con el género. `deporte` no tiene `promo` y queda igual.

**Cambio en componente:** `Navbar.jsx:208` cambia de:
```jsx
<img src={assetUrl('megamenu-promo.png')} alt={menu.promo.title} loading="lazy" />
```
a:
```jsx
<img src={menu.promo.img} alt={menu.promo.title} loading="lazy" />
```

El archivo `public/megamenu-promo.png` queda sin referencias tras el cambio — se elimina.

## Parte 2 — Páginas del footer

**13 páginas nuevas**, contenido estático razonable (sin funcionalidad backend — ej. "Estado de Pedido" explica el proceso, no consulta un pedido real), con datos de contacto ficticios pero coherentes (Colombia: Bogotá como sede principal, teléfono/email con formato válido, reutilizados de forma consistente en Contacto y Tiendas Físicas).

| Columna footer | Label | Ruta |
|---|---|---|
| Ayuda | Estado de Pedido | `/ayuda/estado-pedido` |
| Ayuda | Envíos y Entregas | `/ayuda/envios` |
| Ayuda | Devoluciones | `/ayuda/devoluciones` |
| Ayuda | Opciones de Pago | `/ayuda/pago` |
| Ayuda | Contacto | `/contacto` |
| Shoes Store | Nuestra Historia | `/nosotros/historia` |
| Shoes Store | Sostenibilidad | `/nosotros/sostenibilidad` |
| Shoes Store | Tiendas Físicas | `/tiendas` |
| Shoes Store | Trabaja con Nosotros | `/trabaja-con-nosotros` |
| Shoes Store | Shoes Store App | `/app` |
| Legal (pie) | Términos de Uso | `/legal/terminos` |
| Legal (pie) | Política de Privacidad | `/legal/privacidad` |
| Legal (pie) | Aviso Legal | `/legal/aviso-legal` |

**Componente compartido:** en vez de 13 archivos duplicando boilerplate, se crea `src/components/InfoPage.jsx` — layout reutilizable (título, breadcrumb simple, bloque de contenido) que cada página de contenido usa pasando su copy. Sigue el patrón ya existente de `useDocumentHead` (Fase 4) para SEO por página (title/description/canonicalPath propios).

**Rutas:** se agregan dentro de `StoreLayout` en `App.jsx` (llevan Navbar+Footer, igual que Catálogo/Carrito), con `lazy()` igual que las páginas secundarias existentes. Contenido de cada página vive en `src/pages/ayuda/`, `src/pages/nosotros/`, `src/pages/legal/`, o como archivos sueltos (`ContactoPage.jsx`, `TiendasPage.jsx`, etc.) según corresponda — el detalle de organización de carpetas se decide en el plan de implementación, no aquí.

**Fuera de alcance:** formularios funcionales (ej. Contacto no envía email real, solo muestra los datos y opcionalmente un `<form>` decorativo sin backend, igual que el newsletter existente en HomePage). Iconos sociales del footer siguen como están.

## Verificación

- Mega-menú: abrir cada uno de Mujer/Hombre/Niños, confirmar imagen distinta y coherente por género, sin regresión de layout.
- Footer: cada uno de los 13 links navega a una página real (no `#`), con `<title>` y contenido propios.
- `pnpm build` sin errores, sin referencias rotas a `megamenu-promo.png`.
