/**
 * js/home.js
 * Logic for the Shoes's Store Homepage redesign.
 * Fetches products from productos.json and populates the grids.
 */

(function () {
  'use strict';

  /* ─── Constants ─── */
  const JSON_URL = 'productos.json';
  const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' fill='%23555' font-family='Poppins,sans-serif' font-size='14'%3ESin imagen%3C/text%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' fill='%23444' font-family='Poppins,sans-serif' font-size='36'%3E👟%3C/text%3E%3C/svg%3E";

  /* ─── Elements ─── */
  const gridDestacados = document.getElementById('grid-destacados');
  const gridNovedades = document.getElementById('grid-novedades');
  const gridOutlet = document.getElementById('grid-outlet');

  /* ─── Utilities ─── */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function formatPrice(price) {
    const value = typeof price === 'number' ? price : Number(price);
    if (!Number.isFinite(value) || value <= 0) return 'No disponible';
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  /* ─── Card Generation ─── */
  function createSneakerCard(sneaker, isNew, isSale) {
    let badge = '';
    if (isSale) badge = 'SALE';
    else if (isNew) badge = 'NEW';
    else if (sneaker.genero) badge = sneaker.genero.toUpperCase();

    const imgSrc = sneaker.imagen || PLACEHOLDER_IMG;
    const name = escapeHtml(sneaker.nombre);
    const brand = escapeHtml(sneaker.marca);
    const price = formatPrice(sneaker.precio);
    const colorway = sneaker.colorway ? escapeHtml(sneaker.colorway) : '';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.addEventListener('click', () => {
      window.location.href = `producto-detalle.html?id=${encodeURIComponent(sneaker.id)}`;
    });

    card.innerHTML = `
      ${badge ? `<span class="card-badge">${badge}</span>` : ''}
      <div class="card-image-wrap">
        <img src="${imgSrc}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
        <div class="card-overlay">
          <button class="card-overlay-btn" type="button">Ver producto</button>
        </div>
      </div>
      <div class="card-body">
        <h3>${name}</h3>
        <p class="brand">${brand}</p>
        <div class="card-bottom">
          <p class="colorway">${colorway}</p>
          <span class="price">${price}</span>
        </div>
      </div>
    `;

    return card;
  }

  /* ─── Data Initialization ─── */
  async function loadHomeProducts() {
    try {
      const response = await fetch(JSON_URL);
      if (!response.ok) throw new Error('No se pudo cargar ' + JSON_URL);
      
      const allProducts = await response.json();
      
      if (!Array.isArray(allProducts)) {
        throw new Error('Formato de JSON inválido');
      }

      // Segment products by type
      const novedades = allProducts.filter(p => p.novedad === true);
      const outlet = allProducts.filter(p => p.outlet === true);
      const regulares = allProducts.filter(p => p.novedad === false && p.outlet === false);

      // Randomize product display order
      const shuffle = (array) => array.sort(() => 0.5 - Math.random());

      // Populate Best Sellers grid (max 8)
      const destacados = shuffle(regulares).slice(0, 8);
      if (gridDestacados) {
        gridDestacados.innerHTML = '';
        destacados.forEach((p, i) => {
          const card = createSneakerCard(p, false, false);
          card.style.animationDelay = `${i * 0.05}s`;
          gridDestacados.appendChild(card);
        });
      }

      // Populate New Arrivals grid (max 4)
      const topNovedades = shuffle(novedades).slice(0, 4);
      // Pad with regular products if short
      while(topNovedades.length < 4 && regulares.length) {
         topNovedades.push(regulares.shift());
      }
      if (gridNovedades) {
        gridNovedades.innerHTML = '';
        topNovedades.forEach((p, i) => {
          const card = createSneakerCard(p, true, false);
          card.style.animationDelay = `${i * 0.05}s`;
          gridNovedades.appendChild(card);
        });
      }

      // Populate Outlet grid (max 4)
      const topOutlet = shuffle(outlet).slice(0, 4);
      // Pad with regular products if short
      while(topOutlet.length < 4 && regulares.length) {
         topOutlet.push(regulares.shift());
      }
      if (gridOutlet) {
        gridOutlet.innerHTML = '';
        topOutlet.forEach((p, i) => {
          const card = createSneakerCard(p, false, true);
          card.style.animationDelay = `${i * 0.05}s`;
          gridOutlet.appendChild(card);
        });
      }

    } catch (err) {
      console.error('[Home.js] Error renderizando productos:', err);
      const msj = `<div style="grid-column: 1/-1;text-align:center;color:#888;">Error cargando productos. ${err.message}</div>`;
      if (gridDestacados) gridDestacados.innerHTML = msj;
      if (gridNovedades) gridNovedades.innerHTML = msj;
      if (gridOutlet) gridOutlet.innerHTML = msj;
    }
  }

  /* ─── Scroll Animations ─── */
  function initFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    // Bypass animations for older browsers
    if (!('IntersectionObserver' in window)) {
      fadeElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => observer.observe(el));
  }

  /* ─── Initialization ─── */
  function init() {
    initFadeInAnimations();
    loadHomeProducts();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
