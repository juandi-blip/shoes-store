# Shoes.Store — React frontend

React port of the Shoes.Store sneaker storefront (originally vanilla HTML/CSS/JS,
kept at the repo root for reference). Same visual identity and behavior,
rebuilt as a single-page app.

## Stack

- **React 18** + **Vite** + **react-router-dom 6**
- Plain CSS (no framework) — ported 1:1 from the original stylesheets, plus
  an additive `glamour.css` layer for motion/visual polish
- **pnpm** as the package manager
- **Vitest** + **@testing-library/react** for tests

## Setup

```bash
pnpm install
pnpm dev       # http://localhost:5173
```

Other scripts:

```bash
pnpm test      # run the test suite (Vitest)
pnpm build     # production build to dist/
pnpm preview   # preview the production build locally
```

## Features

- **Home / catalog / product detail** — faithful to the original design:
  hero video, mega-menu navigation, scroll-reveal animations, size selector
  with real availability, image zoom + lightbox
- **Catalog filters synced to the URL** (genre, category, price, sort) — back/forward
  and shareable links work as expected
- **Cart & checkout (mock)** — cart persisted in `localStorage`, simulated
  payment (card / PSE / cash on delivery). No real payment processing; see
  the "Security notes" section below
- **Auth (mock)** — login/register/profile with a client-side session, no backend
- **Premium product cards** — cursor-following 3D tilt, price chip, staggered
  entrance, all behind `prefers-reduced-motion`

## Project structure

```
src/
├── components/     # Navbar, Footer, ProductCard, ProductGrid, Toast…
├── context/        # SessionContext (auth mock), CartContext (cart)
├── data/           # productos.json — local product catalog
├── hooks/          # useProductos (filter/sort), useScrollReveal
├── pages/          # HomePage, CatalogoPage, ProductoDetallePage,
│                   # CarritoPage, PagoPage, LoginPage, RegistroPage, PerfilPage
├── styles/         # ported CSS + carrito.css + glamour.css
└── utils/          # imagenes.js (deterministic image fallback)
```

## Security notes

The cart and checkout are demonstrations, not production code:

- Cart contents are validated against the real product catalog on load
  (unknown ids, invalid sizes, or out-of-range quantities are discarded) —
  prices are always derived from the catalog, never trusted from storage.
- Payment fields (card number, CVV, etc.) live only in component state:
  they are never persisted or sent over the network, and the checkout page
  displays an explicit "demo, don't enter real data" notice.

## Author

Juan — Learning project for e-commerce fundamentals.
