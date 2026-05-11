/**
 * Shoes Store — Mega-menu & Mobile Drawer Navigation
 * Handles desktop mega-menu hover interactions, mobile drawer,
 * and responsive behavior.
 */
(function () {
  'use strict';

  /* ─── DOM References ─── */
  const header       = document.getElementById('site-header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileClose  = document.getElementById('mobile-close');
  const megaOverlay  = document.getElementById('mega-overlay');
  const navItems     = document.querySelectorAll('.nav-main__item.has-mega');

  let activeMenu   = null;   // Active mega-menu ID
  let closeTimeout = null;   // Debounce timer
  const CLOSE_DELAY = 120;   // Closing delay in ms

  /* ─── Desktop Mega-Menu Hover ─── */

  function openMega(menuId) {
    clearTimeout(closeTimeout);

    // Close any other active mega-menu
    if (activeMenu && activeMenu !== menuId) {
      const prev = document.getElementById('mega-' + activeMenu);
      if (prev) prev.classList.remove('is-open');
    }

    const mega = document.getElementById('mega-' + menuId);
    if (!mega) return;

    mega.classList.add('is-open');
    mega.setAttribute('aria-hidden', 'false');
    megaOverlay.classList.add('is-visible');
    activeMenu = menuId;

    // Set active state on parent nav
    navItems.forEach(function (item) {
      item.classList.toggle('active', item.dataset.mega === menuId);
    });
  }

  function closeMega() {
    closeTimeout = setTimeout(function () {
      if (activeMenu) {
        const mega = document.getElementById('mega-' + activeMenu);
        if (mega) {
          mega.classList.remove('is-open');
          mega.setAttribute('aria-hidden', 'true');
        }
        megaOverlay.classList.remove('is-visible');
        navItems.forEach(function (item) { item.classList.remove('active'); });
        activeMenu = null;
      }
    }, CLOSE_DELAY);
  }

  function cancelClose() {
    clearTimeout(closeTimeout);
  }

  // Bind hover to nav items
  navItems.forEach(function (item) {
    var menuId = item.dataset.mega;

    item.addEventListener('mouseenter', function () {
      openMega(menuId);
    });

    item.addEventListener('mouseleave', function () {
      closeMega();
    });
  });

  // Prevent close when hovering menu
  document.querySelectorAll('.mega-menu').forEach(function (mega) {
    mega.addEventListener('mouseenter', cancelClose);
    mega.addEventListener('mouseleave', closeMega);
  });

  // Close on overlay interaction
  if (megaOverlay) {
    megaOverlay.addEventListener('mouseenter', closeMega);
    megaOverlay.addEventListener('click', function () {
      clearTimeout(closeTimeout);
      if (activeMenu) {
        var mega = document.getElementById('mega-' + activeMenu);
        if (mega) {
          mega.classList.remove('is-open');
          mega.setAttribute('aria-hidden', 'true');
        }
        megaOverlay.classList.remove('is-visible');
        navItems.forEach(function (item) { item.classList.remove('active'); });
        activeMenu = null;
      }
    });
  }

  /* ─── Mobile Hamburger & Drawer ─── */

  function openDrawer() {
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    hamburgerBtn.classList.add('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    megaOverlay.classList.add('is-visible');
    document.body.classList.add('drawer-open');
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    megaOverlay.classList.remove('is-visible');
    document.body.classList.remove('drawer-open');
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function () {
      if (window.innerWidth >= 992) return;
      var isOpen = mobileDrawer.classList.contains('is-open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeDrawer);
  }

  // Close drawer on overlay click
  if (megaOverlay) {
    megaOverlay.addEventListener('click', function () {
      if (mobileDrawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });
  }

  /* ─── Mobile Accordion ─── */
  document.querySelectorAll('[data-mobile-expand]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var parent = btn.closest('.mobile-nav__item--expandable');
      var isExpanded = parent.classList.contains('is-expanded');

      // Collapse other accordion items
      document.querySelectorAll('.mobile-nav__item--expandable.is-expanded').forEach(function (el) {
        if (el !== parent) el.classList.remove('is-expanded');
      });

      parent.classList.toggle('is-expanded', !isExpanded);
    });
  });

  /* ─── Responsive Handlers ─── */
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 992 && mobileDrawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  /* ─── Keyboard Navigation ─── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (activeMenu) {
        clearTimeout(closeTimeout);
        var mega = document.getElementById('mega-' + activeMenu);
        if (mega) {
          mega.classList.remove('is-open');
          mega.setAttribute('aria-hidden', 'true');
        }
        megaOverlay.classList.remove('is-visible');
        navItems.forEach(function (item) { item.classList.remove('active'); });
        activeMenu = null;
      }
      if (mobileDrawer.classList.contains('is-open')) {
        closeDrawer();
      }
    }
  });

})();
