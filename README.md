# Shoes.Store 👟

E-commerce platform for sneakers with a dark theme, mega-menu navigation, and local product database.

## Features
- **Responsive Design**: Desktop, tablet, and mobile
- **Product Catalog**: Filtering by gender, category, price, and collections
- **Product Details**: Full specifications and image galleries
- **Dark Theme**: Modern dark interface (rgb(33, 37, 41))
- **Local Data**: No external APIs — uses `productos.json`

## Stack
- HTML5, CSS3, Bootstrap 5.3 / Tailwind CSS
- Vanilla JavaScript (no frameworks)
- Poppins font
- Local `productos.json` database

## Setup

1. Clone the repo:
```bash
git clone https://github.com/juandi-blip/shoes-store.git
cd shoes-store
```

2. Open in browser:
```bash
# Simple HTTP server (Python 3)
python -m http.server 8000

# Or use Live Server in VS Code
```

3. Visit `http://localhost:8000`

## Hero Video
The hero video (`hero.mp4`) is sourced from Pexels. If you want to use a local copy:
1. Download from [Pexels](https://www.pexels.com/search/sneakers/)
2. Place in root folder as `hero.mp4`
3. Or update `tienda.html` with a CDN link

## File Structure
shoes-store/
├── tienda.html              # Main store page
├── catalogo.html            # Product listing
├── producto-detalle.html    # Product detail
├── inicio.html              # Home page
├── tienda1.css              # Store styles
├── catalogo.css             # Catalog styles
├── producto-detalle.css     # Product detail styles
├── productos.json           # Product database
├── js/
│   ├── catalogo.js          # Filtering & sorting logic
│   ├── tienda.js            # Navigation & mega-menu
│   ├── producto-detalle.js  # Product detail logic
│   ├── home.js              # Home page logic
│   ├── login.js             # Login validation
│   └── config.example.js    # Configuration template
├── assets/brands/           # Brand SVG logos
└── README.md                # This file

## Technologies
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Design Framework**: Bootstrap 5.3 / Tailwind CSS
- **Typography**: Poppins (Google Fonts)
- **Data**: JSON (local)

## Author
Juan — Learning project for e-commerce fundamentals

---

Made with ❤️ for sneaker lovers 👟