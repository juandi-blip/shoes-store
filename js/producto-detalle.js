    function setFilter(filterName) {
      sessionStorage.setItem('shoesStore_activeFilter', filterName);
    }

    document.addEventListener("DOMContentLoaded", async () => {

      const accordions = document.querySelectorAll('.accordion-header');
      accordions.forEach(acc => {
        acc.addEventListener('click', function() {
          this.parentElement.classList.toggle('active');
        });
      });

      function showToast(message) {
        let el = document.getElementById('pd-toast');
        if (!el) {
          el = document.createElement('div');
          el.id = 'pd-toast';
          el.setAttribute('role', 'status');
          el.setAttribute('aria-live', 'polite');
          el.style.position = 'fixed';
          el.style.left = '50%';
          el.style.bottom = '18px';
          el.style.transform = 'translateX(-50%)';
          el.style.background = 'rgba(20, 20, 20, 0.92)';
          el.style.color = '#fff';
          el.style.padding = '10px 14px';
          el.style.borderRadius = '12px';
          el.style.fontSize = '14px';
          el.style.fontFamily = 'Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
          el.style.boxShadow = '0 10px 30px rgba(0,0,0,.35)';
          el.style.zIndex = '9999';
          el.style.maxWidth = '92vw';
          el.style.textAlign = 'center';
          el.style.display = 'none';
          document.body.appendChild(el);
        }

        el.textContent = message;
        el.style.display = 'block';
        clearTimeout(el._hideTimer);
        el._hideTimer = setTimeout(() => {
          el.style.display = 'none';
        }, 2200);
      }

      let quantity = 1;
      const qtyValue = document.getElementById('qty-value');
      document.getElementById('btn-minus').addEventListener('click', () => {
        if (quantity > 1) {
          quantity--;
          qtyValue.textContent = quantity;
        }
      });
      document.getElementById('btn-plus').addEventListener('click', () => {
        if (quantity < 10) { 
          quantity++;
          qtyValue.textContent = quantity;
        }
      });

      document.getElementById('btn-fav').addEventListener('click', function() {
        this.classList.toggle('liked');
        if (this.classList.contains('liked')) {
          showToast("Agregado a favoritos");
        }
      });

      /* ─── Zoom Interactions ─── */
      const galleryMainEl = document.getElementById('gallery-main');
      const mainImg = document.getElementById('main-image');

      galleryMainEl.addEventListener('mousemove', (e) => {
        if (!galleryMainEl.classList.contains('zooming')) return;
        const rect = galleryMainEl.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        mainImg.style.transformOrigin = `${x}% ${y}%`;
      });

      galleryMainEl.addEventListener('click', (e) => {
        // Toggle zoom state for desktop views
        if (window.innerWidth > 768) {
          if (galleryMainEl.classList.contains('zooming')) {
            galleryMainEl.classList.remove('zooming');
            mainImg.style.transformOrigin = 'center center';
          } else {
            galleryMainEl.classList.add('zooming');
            const rect = galleryMainEl.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            mainImg.style.transformOrigin = `${x}% ${y}%`;
          }
        }
      });

      galleryMainEl.addEventListener('mouseleave', () => {
        galleryMainEl.classList.remove('zooming');
        mainImg.style.transformOrigin = 'center center';
      });

      /* ─── Lightbox Overlay ─── */
      let galleryImages = [];
      let currentLightboxIndex = 0;
      const lightboxOverlay = document.getElementById('lightbox-overlay');
      const lightboxImg = document.getElementById('lightbox-img');

      function openLightbox(index) {
        if (galleryImages.length === 0) return;
        currentLightboxIndex = index;
        lightboxImg.src = galleryImages[currentLightboxIndex];
        lightboxOverlay.classList.add('active');
        lightboxOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }

      function closeLightbox() {
        lightboxOverlay.classList.remove('active');
        lightboxOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
      lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) closeLightbox();
      });

      document.getElementById('lightbox-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
        lightboxImg.src = galleryImages[currentLightboxIndex];
      });

      document.getElementById('lightbox-next').addEventListener('click', (e) => {
        e.stopPropagation();
        currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
        lightboxImg.src = galleryImages[currentLightboxIndex];
      });

      document.addEventListener('keydown', (e) => {
        if (!lightboxOverlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') {
          currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
          lightboxImg.src = galleryImages[currentLightboxIndex];
        }
        if (e.key === 'ArrowRight') {
          currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
          lightboxImg.src = galleryImages[currentLightboxIndex];
        }
      });

      /* ─── Lightbox Trigger ─── */
      galleryMainEl.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (galleryImages.length > 0) {
          const activeThumb = document.querySelector('.thumb-btn.active');
          const idx = activeThumb ? [...document.querySelectorAll('.thumb-btn')].indexOf(activeThumb) : 0;
          openLightbox(idx >= 0 ? idx : 0);
        }
      });

      /* ─── Data Initialization ─── */
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');

      const elLoading = document.getElementById('loading-state');
      const elError = document.getElementById('error-state');
      const elMain = document.getElementById('main-content');

      if (!id) {
        showError();
        return;
      }


      function showError() {
        elLoading.style.display = 'none';
        elMain.style.display = 'none';
        elError.style.display = 'flex';
      }

      function populateUI(data) {
        const d = {
          ...data,
          brand: data.marca ?? data.brand,
          shoeName: data.nombre ?? data.shoeName ?? data.name,
          retailPrice: data.precio ?? data.retailPrice,
          image: data.imagen ?? data.image,
        };

        // Update breadcrumb navigation
        const bcProduct = document.getElementById('bc-product');
        if (bcProduct) {
          bcProduct.textContent = d.shoeName || d.title || 'Producto';
        }

        // Set document title
        document.title = `${d.shoeName || d.title || 'Producto'} | Shoes Store`;

        // Render product badges
        const badgesContainer = document.getElementById('pd-badges');
        if (badgesContainer) {
          badgesContainer.innerHTML = '';
          if (d.novedad === true) {
            const badge = document.createElement('span');
            badge.className = 'pd-badge pd-badge--new';
            badge.textContent = '✨ NUEVO';
            badgesContainer.appendChild(badge);
          }
          if (d.outlet === true) {
            const badge = document.createElement('span');
            badge.className = 'pd-badge pd-badge--outlet';
            badge.textContent = 'OUTLET';
            badgesContainer.appendChild(badge);
          }
        }

        // Render product branding
        document.getElementById('pd-brand').textContent = d.brand || d.make || 'Sin marca';
        document.getElementById('pd-title').textContent = d.shoeName || d.title || 'Producto sin nombre';

        // Render product subtitle variations
        const colorwayEl = document.getElementById('pd-colorway');
        const parts = [];
        if (d.genero) parts.push(d.genero.charAt(0).toUpperCase() + d.genero.slice(1));
        if (d.proposito) parts.push(d.proposito.charAt(0).toUpperCase() + d.proposito.slice(1));
        if (d.colorway) parts.push(`Colorway: ${d.colorway}`);
        else if (d.silhouette) parts.push(`Silueta: ${d.silhouette}`);
        colorwayEl.textContent = parts.join(' · ') || '';
        
        // Render product pricing
        const price = d.retailPrice ?? d.precio ?? d.price ?? d.estimatedMarketValue ?? null;
        const originalPrice = d.precioOriginal ?? null;

        if (typeof price === 'number' && price > 0) {
          document.getElementById('pd-price').textContent = `$${price.toLocaleString('en-US')}`;
          const copPrice = price * 4200;
          document.getElementById('pd-price-cop').textContent = `Aprox. $${copPrice.toLocaleString('es-CO')} COP`;
        } else {
          document.getElementById('pd-price').textContent = 'No disponible';
          document.getElementById('pd-price-cop').textContent = '';
        }

        // Render strikethrough original price
        const origPriceEl = document.getElementById('pd-price-original');
        if (origPriceEl && typeof originalPrice === 'number' && originalPrice > price) {
          origPriceEl.textContent = `$${originalPrice.toLocaleString('en-US')}`;
          origPriceEl.style.display = 'inline';
        }

        // Render image gallery and thumbnails
        const thumbsContainer = document.getElementById('gallery-thumbs');
        const defaultPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23555' font-family='Poppins,sans-serif' font-size='14'%3ESin imagen%3C/text%3E%3C/svg%3E";
        
        let images = [];
        if (d.image) {
          if (typeof d.image === 'object') {
            if (d.image.original) images.push(d.image.original);
            if (d.image.small) images.push(d.image.small);
            if (d.image.thumbnail) images.push(d.image.thumbnail);
          } else if (typeof d.image === 'string') {
            images.push(d.image);
          }
        }
        if (d.thumbnail && !images.includes(d.thumbnail)) {
          images.push(d.thumbnail);
        }
        
        if(images.length === 0) images.push(defaultPlaceholder);
        
        images = [...new Set(images)];
        galleryImages = images;

        mainImg.src = images[0];
        mainImg.onerror = function() { this.src = defaultPlaceholder; };

        if (images.length > 1) {
          images.forEach((imgSrc, index) => {
            const btn = document.createElement('button');
            btn.className = `thumb-btn ${index === 0 ? 'active' : ''}`;
            const img = document.createElement('img');
            img.src = imgSrc;
            img.loading = "lazy";
            img.onerror = function() { this.src = defaultPlaceholder; };
            btn.appendChild(img);
            
            btn.addEventListener('click', () => {
              document.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              
              mainImg.classList.add('fade');
              setTimeout(() => {
                mainImg.src = imgSrc;
                mainImg.classList.remove('fade');
              }, 150);
            });
            
            thumbsContainer.appendChild(btn);
          });
        }

        // Render size selector
        const sizes = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14];
        const sizeGrid = document.getElementById('size-grid');
        
        const seed = parseInt(id.replace(/\D/g, '').slice(0, 4)) || Math.floor(Math.random() * 1000);
        
        sizes.forEach((s, idx) => {
          const btn = document.createElement('button');
          btn.className = 'size-btn';
          btn.textContent = `US ${s}`;
          
          const isOutOfStock = ((seed + idx) % 5 === 0);
          
          if (isOutOfStock) {
            btn.disabled = true;
          } else {
            btn.addEventListener('click', () => {
              document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
            });
          }
          
          sizeGrid.appendChild(btn);
        });

        // Bind Add to Cart functionality
        document.getElementById('btn-add-cart').addEventListener('click', () => {
          const activeSize = document.querySelector('.size-btn.active');
          if (!activeSize) {
            showToast('Por favor selecciona una talla primero.');
            return;
          }
          const size = activeSize.textContent;
          showToast(`Agregado al carrito: ${d.shoeName || d.title || 'Producto'} (${size}) x${quantity}`);
        });
      }

      async function fetchSneaker() {
        try {
          const res = await fetch('productos.json', { cache: 'no-store' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const json = await res.json();
          const list = Array.isArray(json) ? json : (Array.isArray(json.productos) ? json.productos : (Array.isArray(json.products) ? json.products : []));

          const product = list.find(p => p && String(p.id) === String(id));
          if (!product) {
            showError();
            return;
          }

          populateUI(product);
          elError.style.display = 'none';
          elMain.style.display = 'grid';
        } catch (e) {
          showError();
        } finally {
          elLoading.style.display = 'none';
        }
      }

      fetchSneaker();
    });
