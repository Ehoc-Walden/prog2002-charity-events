/**
 * Page chrome behaviour: sticky header state, accessible mobile navigation,
 * the shared notice bar and the dynamic footer year.
 */
(function () {
  'use strict';

  var U = window.CharityUtils;

  function initHeader() {
    var header = U.querySelector('[data-site-header]');
    if (!header) return;

    var update = function () {
      if (window.scrollY > 24) header.classList.add('is-scrolled');
      else if (!header.classList.contains('site-header-solid')) header.classList.remove('is-scrolled');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });

    var toggle = U.querySelector('[data-nav-toggle]');
    var nav = U.querySelector('[data-primary-nav]');
    if (!toggle || !nav) return;

    var closeNav = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') closeNav();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) closeNav();
    });
  }

  function initYear() {
    U.querySelectorAll('[data-current-year]').forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  var alertTimer = null;

  /** Show a short, screen-reader friendly message at the bottom of the page. */
  function showAlert(message, tone) {
    var alert = U.querySelector('[data-site-alert]');
    if (!alert) return;
    alert.textContent = message;
    alert.classList.toggle('is-error', tone === 'error');
    alert.hidden = false;
    window.requestAnimationFrame(function () { alert.classList.add('is-visible'); });
    window.clearTimeout(alertTimer);
    alertTimer = window.setTimeout(function () {
      alert.classList.remove('is-visible');
      window.setTimeout(function () { alert.hidden = true; }, 320);
    }, 4200);
  }

  window.CharityUI = { showAlert: showAlert };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initHeader(); initYear(); });
  } else {
    initHeader();
    initYear();
  }
})();
