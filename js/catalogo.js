/**
 * js/catalogo.js
 * Shoes.Store — Product Listing Page (PLP) Logic
 * Client-side filtering, sorting, and rendering from productos.json
 */
(function () {
  'use strict';

  const JSON_URL = 'productos.json';
  const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' fill='%23555' font-family='Poppins,sans-serif' font-size='14'%3ESin imagen%3C/text%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' fill='%23444' font-family='Poppins,sans-serif' font-size='36'%3E👟%3C/text%3E%3C/svg%3E";

  /* ─── State ─── */
  let allProducts = [];
  let filteredProducts = [];
  let maxPriceGlobal = 300;

  /* ─── DOM ─── */
  const grid            = document.getElementById('catalog-grid');
  const titleEl         = document.getElementById('catalog-title');
  const countEl         = document.getElementById('catalog-count');
  const sortSelect      = document.getElementById('sort-select');
  const breadcrumbTrail = document.getElementById('breadcrumb-trail');
  const activeFiltersEl = document.getElementById('active-filters');
  const priceRange      = document.getElementById('price-range');
  const priceMinLabel   = document.getElementById('price-min-label');
  const priceMaxLabel   = document.getElementById('price-max-label');

  // Sidebar elements
  const genderChecks    = document.querySelectorAll('[data-filter-gender]');
  const categoryChecks  = document.querySelectorAll('[data-filter-category]');
  const outletToggle    = document.getElementById('filter-outlet');
  const novedadToggle   = document.getElementById('filter-novedad');

  // Mobile elements
  const sidebar         = document.getElementById('catalog-sidebar');
  const filterToggleBtn = document.getElementById('mobile-filter-btn');
  const filterCloseBtn  = document.getElementById('sidebar-close');
  const filterOverlay   = document.getElementById('filter-overlay');

  /* ─── URL Params ─── */
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      genero:       params.get('genero'),
      proposito:    params.get('proposito'),
      novedad:      params.get('novedad'),
      outlet:       params.get('outlet'),
      categoria:    params.get('categoria'),
      subcategoria: params.get('subcategoria')
    };
  }

  /* ─── Utilities ─── */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function formatPrice(price) {
    const val = typeof price === 'number' ? price : Number(price);
    if (!Number.isFinite(val) || val <= 0) return 'N/A';
    return '$' + val.toLocaleString('en-US');
  }

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ─── Page Title ─── */
  function getPageTitle(params) {
    if (params.genero) {
      const map = { hombre: 'Hombre', mujer: 'Mujer', ninos: 'Niños', nino: 'Niños' };
      return map[params.genero] || capitalizeFirst(params.genero);
    }
    if (params.proposito) {
      const map = { deporte: 'Deporte', running: 'Running', basketball: 'Basketball', lifestyle: 'Lifestyle', entrenamiento: 'Entrenamiento', futbol: 'Fútbol' };
      return map[params.proposito] || capitalizeFirst(params.proposito);
    }
    if (params.novedad === 'true') return 'Novedades ✨';
    if (params.outlet === 'true') return 'Outlet';
    if (params.categoria) return capitalizeFirst(params.categoria);
    if (params.subcategoria) return capitalizeFirst(params.subcategoria);
    return 'Catálogo';
  }

  /* ─── Breadcrumb ─── */
  function updateBreadcrumb(params) {
    let trail = '';
    const title = getPageTitle(params);

    if (params.genero) {
      trail = `<span class="breadcrumb-sep">›</span><span class="breadcrumb-current">${escapeHtml(title)}</span>`;
    } else if (params.proposito) {
      trail = `<span class="breadcrumb-sep">›</span><span class="breadcrumb-current">${escapeHtml(title)}</span>`;
    } else if (params.novedad === 'true') {
      trail = `<span class="breadcrumb-sep">›</span><span class="breadcrumb-current">Novedades</span>`;
    } else if (params.outlet === 'true') {
      trail = `<span class="breadcrumb-sep">›</span><span class="breadcrumb-current">Outlet</span>`;
    } else if (params.categoria) {
      trail = `<span class="breadcrumb-sep">›</span><span class="breadcrumb-current">${escapeHtml(capitalizeFirst(params.categoria))}</span>`;
    } else if (params.subcategoria) {
      trail = `<span class="breadcrumb-sep">›</span><span class="breadcrumb-current">${escapeHtml(capitalizeFirst(params.subcategoria))}</span>`;
    }

    if (breadcrumbTrail) breadcrumbTrail.innerHTML = trail;
  }

  /* ─── URL Pre-filters ─── */
  function applyUrlFilters(params) {
    // Gender
    if (params.genero) {
      const val = params.genero === 'ninos' ? 'nino' : params.genero;
      genderChecks.forEach(cb => {
        if (cb.value === val) cb.checked = true;
      });
    }

    // Outlet toggle
    if (params.outlet === 'true' && outletToggle) {
      outletToggle.checked = true;
    }

    // Novedad toggle
    if (params.novedad === 'true' && novedadToggle) {
      novedadToggle.checked = true;
    }

    // Map URL traits to UI checkboxes
    if (params.proposito) {
      categoryChecks.forEach(cb => {
        if (cb.value === params.proposito) cb.checked = true;
      });
    }

    if (params.categoria) {
      categoryChecks.forEach(cb => {
        if (cb.value === params.categoria) cb.checked = true;
      });
    }

    if (params.subcategoria) {
      categoryChecks.forEach(cb => {
        if (cb.value === params.subcategoria) cb.checked = true;
      });
    }
  }

  /* ─── Filter State ─── */
  function getFilters() {
    const genders = [];
    genderChecks.forEach(cb => { if (cb.checked) genders.push(cb.value); });

    const categories = [];
    categoryChecks.forEach(cb => { if (cb.checked) categories.push(cb.value); });

    const maxPrice = priceRange ? Number(priceRange.value) : maxPriceGlobal;
    const onlyOutlet = outletToggle ? outletToggle.checked : false;
    const onlyNovedad = novedadToggle ? novedadToggle.checked : false;

    return { genders, categories, maxPrice, onlyOutlet, onlyNovedad };
  }

  /* ─── Filter products ─── */
  function filterProducts() {
    const f = getFilters();

    filteredProducts = allProducts.filter(p => {
      // Gender
      if (f.genders.length > 0 && !f.genders.includes(p.genero)) return false;

      // Price
      if (p.precio > f.maxPrice) return false;

      // Outlet
      if (f.onlyOutlet && !p.outlet) return false;

      // Novedad
      if (f.onlyNovedad && !p.novedad) return false;

      // Allow any matching category trait
      if (f.categories.length > 0) {
        const matched = f.categories.some(cat =>
          p.proposito === cat || p.subcategoria === cat || p.categoria === cat
        );
        if (!matched) return false;
      }

      return true;
    });

    sortProducts();
  }

  /* ─── Sort ─── */
  function sortProducts() {
    const sortVal = sortSelect ? sortSelect.value : 'relevancia';

    switch (sortVal) {
      case 'precio-asc':
        filteredProducts.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        filteredProducts.sort((a, b) => b.precio - a.precio);
        break;
      case 'nombre':
        filteredProducts.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        break;
      case 'novedades':
        filteredProducts.sort((a, b) => (b.novedad ? 1 : 0) - (a.novedad ? 1 : 0));
        break;
      default:
        // Prioritize new arrivals, then outlet, then alphabetical
        filteredProducts.sort((a, b) => {
          if (a.novedad !== b.novedad) return b.novedad ? 1 : -1;
          if (a.outlet !== b.outlet) return b.outlet ? 1 : -1;
          return a.nombre.localeCompare(b.nombre, 'es');
        });
    }
  }

  /* ─── Render products ─── */
  function renderProducts() {
    if (!grid) return;

    if (filteredProducts.length === 0) {
      grid.innerHTML = `
        <div class="catalog-empty">
          <div class="catalog-empty__icon">🔍</div>
          <h3 class="catalog-empty__title">No se encontraron productos</h3>
          <p class="catalog-empty__text">Intenta ajustar los filtros o explorar otra categoría.</p>
        </div>
      `;
      updateCount(0);
      return;
    }

    grid.innerHTML = '';
    filteredProducts.forEach((p, i) => {
      const card = createCard(p);
      card.style.animationDelay = `${i * 0.04}s`;
      grid.appendChild(card);
    });

    updateCount(filteredProducts.length);
  }

  /* ─── Card builder ─── */
  function createCard(p) {
    const card = document.createElement('article');
    card.className = 'catalog-card';
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');

    let badges = '';
    if (p.novedad) badges += '<span class="catalog-badge catalog-badge--new">NUEVO</span>';
    if (p.outlet)  badges += '<span class="catalog-badge catalog-badge--outlet">OUTLET</span>';

    let priceHtml = '';
    if (p.precioOriginal && p.precioOriginal > p.precio) {
      priceHtml = `
        <span class="catalog-card__price catalog-card__price--sale">${formatPrice(p.precio)}</span>
        <span class="catalog-card__price-original">${formatPrice(p.precioOriginal)}</span>
      `;
    } else {
      priceHtml = `<span class="catalog-card__price">${formatPrice(p.precio)}</span>`;
    }

    const imgSrc = p.imagen || PLACEHOLDER_IMG;

    card.innerHTML = `
      ${badges ? `<div class="catalog-card__badges">${badges}</div>` : ''}
      <div class="catalog-card__image">
        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.nombre)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
        <div class="catalog-card__overlay">
          <button class="catalog-card__overlay-btn" type="button">Ver producto</button>
        </div>
      </div>
      <div class="catalog-card__body">
        <p class="catalog-card__brand">${escapeHtml(p.marca)}</p>
        <h3 class="catalog-card__name">${escapeHtml(p.nombre)}</h3>
        <div class="catalog-card__price-row">
          ${priceHtml}
        </div>
      </div>
    `;

    // Navigate to product details on interaction
    card.addEventListener('click', () => {
      window.location.href = `producto-detalle.html?id=${encodeURIComponent(p.id)}`;
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        window.location.href = `producto-detalle.html?id=${encodeURIComponent(p.id)}`;
      }
    });

    return card;
  }

  /* ─── Update count label ─── */
  function updateCount(n) {
    if (countEl) {
      countEl.textContent = `${n} producto${n !== 1 ? 's' : ''}`;
    }
  }

  /* ─── Update price range UI ─── */
  function updatePriceUI() {
    if (!priceRange) return;
    const val = Number(priceRange.value);
    const pct = ((val - Number(priceRange.min)) / (Number(priceRange.max) - Number(priceRange.min))) * 100;
    priceRange.style.setProperty('--range-pct', pct + '%');
    if (priceMaxLabel) priceMaxLabel.textContent = formatPrice(val);
  }

  /* ─── Active filter tags ─── */
  function renderActiveFilters() {
    if (!activeFiltersEl) return;
    const f = getFilters();
    const tags = [];

    const genderNames = { hombre: 'Hombre', mujer: 'Mujer', nino: 'Niños' };
    f.genders.forEach(g => {
      tags.push({ label: genderNames[g] || g, type: 'gender', value: g });
    });

    f.categories.forEach(c => {
      tags.push({ label: capitalizeFirst(c), type: 'category', value: c });
    });

    if (f.onlyOutlet) tags.push({ label: 'Outlet', type: 'outlet' });
    if (f.onlyNovedad) tags.push({ label: 'Novedades', type: 'novedad' });
    if (f.maxPrice < maxPriceGlobal) tags.push({ label: `Hasta ${formatPrice(f.maxPrice)}`, type: 'price' });

    if (tags.length === 0) {
      activeFiltersEl.innerHTML = '';
      return;
    }

    activeFiltersEl.innerHTML = tags.map(t =>
      `<span class="active-filter-tag" data-tag-type="${t.type}" data-tag-value="${t.value || ''}">${escapeHtml(t.label)} <span class="tag-x">✕</span></span>`
    ).join('');

    // Click to remove
    activeFiltersEl.querySelectorAll('.active-filter-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const type = tag.dataset.tagType;
        const value = tag.dataset.tagValue;

        if (type === 'gender') {
          genderChecks.forEach(cb => { if (cb.value === value) cb.checked = false; });
        } else if (type === 'category') {
          categoryChecks.forEach(cb => { if (cb.value === value) cb.checked = false; });
        } else if (type === 'outlet' && outletToggle) {
          outletToggle.checked = false;
        } else if (type === 'novedad' && novedadToggle) {
          novedadToggle.checked = false;
        } else if (type === 'price' && priceRange) {
          priceRange.value = maxPriceGlobal;
          updatePriceUI();
        }

        applyFilters();
      });
    });
  }

  /* ─── Master apply ─── */
  function applyFilters() {
    filterProducts();
    renderProducts();
    renderActiveFilters();

    // Sync page title with active primary filter
    const f = getFilters();
    let title = getPageTitle(getUrlParams());

    if (f.genders.length === 1) {
      const genderNames = { hombre: 'Hombre', mujer: 'Mujer', nino: 'Niños' };
      title = genderNames[f.genders[0]] || title;
    } else if (f.onlyOutlet) {
      title = 'Outlet';
    } else if (f.onlyNovedad) {
      title = 'Novedades ✨';
    } else if (f.genders.length === 0 && f.categories.length === 0) {
      title = getPageTitle(getUrlParams());
    }

    if (titleEl) titleEl.textContent = title;
  }

  /* ─── Mobile sidebar ─── */
  function openSidebar() {
    if (sidebar) sidebar.classList.add('is-open');
    if (filterOverlay) filterOverlay.classList.add('is-visible');
    document.body.classList.add('drawer-open');
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('is-open');
    if (filterOverlay) filterOverlay.classList.remove('is-visible');
    document.body.classList.remove('drawer-open');
  }

  /* ─── Event bindings ─── */
  function bindEvents() {
    // Checkboxes
    genderChecks.forEach(cb => cb.addEventListener('change', applyFilters));
    categoryChecks.forEach(cb => cb.addEventListener('change', applyFilters));

    // Toggles
    if (outletToggle) outletToggle.addEventListener('change', applyFilters);
    if (novedadToggle) novedadToggle.addEventListener('change', applyFilters);

    // Sort
    if (sortSelect) sortSelect.addEventListener('change', () => {
      sortProducts();
      renderProducts();
    });

    // Price range
    if (priceRange) {
      priceRange.addEventListener('input', () => {
        updatePriceUI();
        applyFilters();
      });
    }

    // Clear all
    const clearBtn = document.getElementById('btn-clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        genderChecks.forEach(cb => cb.checked = false);
        categoryChecks.forEach(cb => cb.checked = false);
        if (outletToggle) outletToggle.checked = false;
        if (novedadToggle) novedadToggle.checked = false;
        if (priceRange) {
          priceRange.value = maxPriceGlobal;
          updatePriceUI();
        }
        if (sortSelect) sortSelect.value = 'relevancia';
        applyFilters();
      });
    }

    // Mobile filter toggle
    if (filterToggleBtn) filterToggleBtn.addEventListener('click', openSidebar);
    if (filterCloseBtn) filterCloseBtn.addEventListener('click', closeSidebar);
    if (filterOverlay) filterOverlay.addEventListener('click', closeSidebar);

    // Prevent overlay issues on breakpoint change
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && sidebar && sidebar.classList.contains('is-open')) {
        closeSidebar();
      }
    });
  }

  /* ─── Init ─── */
  async function init() {
    try {
      const resp = await fetch(JSON_URL);
      if (!resp.ok) throw new Error('Error cargando productos');
      allProducts = await resp.json();
      if (!Array.isArray(allProducts)) throw new Error('Formato de datos inválido');

      // Dynamically set price slider bounds
      maxPriceGlobal = Math.max(...allProducts.map(p => p.precio || 0));
      maxPriceGlobal = Math.ceil(maxPriceGlobal / 10) * 10; // Round up for cleaner UI

      if (priceRange) {
        priceRange.max = maxPriceGlobal;
        priceRange.value = maxPriceGlobal;
        if (priceMinLabel) priceMinLabel.textContent = '$0';
        updatePriceUI();
      }

      const params = getUrlParams();
      applyUrlFilters(params);
      updateBreadcrumb(params);

      // Set initial title
      if (titleEl) titleEl.textContent = getPageTitle(params);

      bindEvents();
      applyFilters();

    } catch (err) {
      console.error('[Catalogo] Error:', err);
      if (grid) {
        grid.innerHTML = `
          <div class="catalog-empty">
            <div class="catalog-empty__icon">⚠️</div>
            <h3 class="catalog-empty__title">Error cargando el catálogo</h3>
            <p class="catalog-empty__text">${escapeHtml(err.message)}</p>
          </div>
        `;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
