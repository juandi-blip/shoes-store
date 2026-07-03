# Shoes.Store 👟

E-commerce platform for sneakers with a dark theme, mega-menu navigation, and local product database.

> **Current implementation: React** — see [`frontend-react/`](./frontend-react). The
> original vanilla HTML/CSS/JS files at the repo root are kept for reference
> (and as the source of truth for visual/behavioral fidelity), but are no
> longer the active app.

## Features
- **Responsive Design**: Desktop, tablet, and mobile
- **Product Catalog**: Filtering by gender, category, price, and collections
  (state synced to the URL)
- **Product Details**: Full specifications, size availability, image zoom/lightbox
- **Shopping Cart & Checkout (mock)**: Cart persisted locally, simulated payment
  (card / PSE / cash on delivery) — no real payment processing
- **Dark Theme**: Modern dark interface with a premium, animated product grid
- **Local Data**: No external APIs — uses `productos.json`

## Stack
- **Active app**: React 18 + Vite + react-router-dom 6, plain CSS (see `frontend-react/`)
- **Legacy reference**: HTML5, CSS3, vanilla JavaScript (repo root)
- Poppins font
- Local `productos.json` database

## Setup

1. Clone the repo:
```bash
git clone https://github.com/juandi-blip/shoes-store.git
cd shoes-store
```

2. Run the React app (uses pnpm):
```bash
cd frontend-react
pnpm install
pnpm dev
```

3. Visit `http://localhost:5173`

See [`frontend-react/README.md`](./frontend-react/README.md) for the full
project structure, scripts, and testing instructions.

## Hero Video
The hero video (`hero.mp4`) is sourced from Pexels. If you want to use a local copy:
1. Download from [Pexels](https://www.pexels.com/search/sneakers/)
2. Place in root folder as `hero.mp4`
3. Or update `index.html` with a CDN link

## File Structure
shoes-store/
├── frontend-react/          # Active app (React + Vite) — see its own README
├── index.html               # Legacy: main store page
├── catalogo.html            # Legacy: product listing
├── producto-detalle.html    # Legacy: product detail
├── inicio.html              # Legacy: home page
├── tienda1.css              # Legacy: store styles
├── catalogo.css             # Legacy: catalog styles
├── producto-detalle.css     # Legacy: product detail styles
├── productos.json           # Product database (shared source data)
├── js/
│   ├── catalogo.js          # Legacy: filtering & sorting logic
│   ├── tienda.js            # Legacy: navigation & mega-menu
│   ├── producto-detalle.js  # Legacy: product detail logic
│   ├── home.js              # Legacy: home page logic
│   ├── login.js             # Legacy: login validation
│   └── config.example.js    # Configuration template
├── assets/brands/           # Brand SVG logos
└── README.md                # This file

## Technologies
- **Active frontend**: React 18, Vite, react-router-dom
- **Legacy frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3 / Tailwind CSS
- **Typography**: Poppins (Google Fonts)
- **Data**: JSON (local)

## Author
Juan — Learning project for e-commerce fundamentals

---

Made with ❤️ for sneaker lovers 👟