/**
 * Search page controller.
 * Reads the filter form, validates the values, calls GET /api/events/search,
 * renders results with the shared card component and keeps the URL in sync so
 * a filtered search can be bookmarked or shared.
 */
(function () {
  'use strict';

  var U = window.CharityUtils;
  var Api = window.CharityApi;

  var elements = {};
  var categoryLookup = {};
  var locationLookup = {};

  function cacheElements() {
    elements.form = U.querySelector('#event-search-form');
    elements.date = U.querySelector('#event-date');
    elements.scope = U.querySelector('#event-scope');
    elements.location = U.querySelector('#event-location');
    elements.categoryOptions = U.querySelector('#category-options');
    elements.sort = U.querySelector('#event-sort');
    elements.results = U.querySelector('#search-results');
    elements.resultsTitle = U.querySelector('#results-title');
    elements.resultCount = U.querySelector('#result-count');
    elements.error = U.querySelector('#search-error');
    elements.activeFilters = U.querySelector('#active-filters');
    elements.emptyState = U.querySelector('#empty-state');
  }

  /* ---------------- Validation ---------------- */

  function localDateString(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function clearFieldError(input) {
    if (!input) return;
    input.removeAttribute('aria-invalid');
    var message = input.parentElement && input.parentElement.querySelector('.field-error');
    if (!message && input.closest('.field-group')) message = input.closest('.field-group').querySelector('.field-error');
    if (message) message.remove();
  }

  function showFieldError(input, text) {
    clearFieldError(input);
    input.setAttribute('aria-invalid', 'true');
    var target = input.closest('.field-group') || input.parentElement;
    var node = document.createElement('p');
    node.className = 'field-error';
    node.textContent = text;
    target.appendChild(node);
  }

  function validate(filters) {
    var errors = [];
    var scope = filters.scope || 'upcoming';
    clearFieldError(elements.date);

    if (filters.date) {
      var today = localDateString(new Date());
      var limit = new Date();
      limit.setMonth(limit.getMonth() + 24);
      var maxDate = localDateString(limit);

      if (filters.date < today && scope === 'upcoming') {
        showFieldError(elements.date, 'Choose today or a future date, or switch the time range to past events.');
        errors.push('Event date cannot be in the past while searching upcoming events.');
      } else if (filters.date > maxDate) {
        showFieldError(elements.date, 'Choose a date within the next 24 months.');
        errors.push('Event date is too far in the future.');
      }
    }

    return errors;
  }

  function showError(message) {
    elements.error.textContent = message;
    elements.error.hidden = false;
  }

  function clearError() {
    elements.error.hidden = true;
    elements.error.textContent = '';
  }

  /* ---------------- Reading and writing the form ---------------- */

  function readFilters() {
    var categories = U.querySelectorAll('input[name="category"]:checked', elements.categoryOptions)
      .map(function (input) { return input.value; });

    return {
      date: elements.date.value || '',
      location: elements.location.value || '',
      categories: categories,
      sort: elements.sort.value || 'date_asc',
      scope: (elements.scope && elements.scope.value) || 'upcoming'
    };
  }

  function applyFiltersToForm(filters) {
    elements.date.value = filters.date || '';
    elements.location.value = filters.location || '';
    elements.sort.value = filters.sort || 'date_asc';
    if (elements.scope) elements.scope.value = filters.scope || 'upcoming';
    U.querySelectorAll('input[name="category"]', elements.categoryOptions).forEach(function (input) {
      input.checked = (filters.categories || []).indexOf(input.value) !== -1;
    });
    syncDateBounds(filters.scope || 'upcoming');
  }

  function readFiltersFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return {
      date: params.get('date') || '',
      location: params.get('location') || '',
      categories: params.getAll('category'),
      sort: params.get('sort') || 'date_asc',
      scope: params.get('scope') || 'upcoming'
    };
  }

  function buildQueryString(filters) {
    var params = new URLSearchParams();
    if (filters.date) params.set('date', filters.date);
    if (filters.location) params.set('location', filters.location);
    (filters.categories || []).forEach(function (slug) { params.append('category', slug); });
    if (filters.sort && filters.sort !== 'date_asc') params.set('sort', filters.sort);
    if (filters.scope && filters.scope !== 'upcoming') params.set('scope', filters.scope);
    var query = params.toString();
    return query ? '?' + query : '';
  }

  function syncUrl(filters, replace) {
    var url = window.location.pathname + buildQueryString(filters);
    if (replace) window.history.replaceState({ filters: filters }, '', url);
    else window.history.pushState({ filters: filters }, '', url);
  }

  /* ---------------- Active filter chips ---------------- */

  function renderActiveFilters(filters) {
    var chips = [];

    if (filters.date) {
      chips.push({ label: 'Date: ' + U.formatEventDate(filters.date, { medium: true }), remove: 'date', value: filters.date });
    }
    if (filters.location) {
      chips.push({ label: 'Location: ' + (locationLookup[filters.location] || filters.location), remove: 'location', value: filters.location });
    }
    (filters.categories || []).forEach(function (slug) {
      chips.push({ label: 'Category: ' + (categoryLookup[slug] || slug), remove: 'category', value: slug });
    });
    if (filters.sort && filters.sort !== 'date_asc') {
      chips.push({ label: 'Sort: ' + elements.sort.options[elements.sort.selectedIndex].text, remove: 'sort', value: filters.sort });
    }
    if (filters.scope && filters.scope !== 'upcoming') {
      chips.push({ label: 'Time range: ' + scopeLabel(filters.scope), remove: 'scope', value: filters.scope });
    }

    if (!chips.length) {
      elements.activeFilters.hidden = true;
      elements.activeFilters.innerHTML = '';
      return;
    }

    var html = ['<span class="active-filters-label">Active</span>'];
    chips.forEach(function (chip) {
      html.push(
        '<span class="filter-chip">' + U.escapeHtml(chip.label) +
        '<button type="button" data-remove="' + U.escapeHtml(chip.remove) + '" data-value="' + U.escapeHtml(chip.value) + '" aria-label="Remove ' + U.escapeHtml(chip.label) + '">×</button></span>'
      );
    });
    elements.activeFilters.innerHTML = html.join('');
    elements.activeFilters.hidden = false;
  }

  function removeFilter(type, value) {
    var next = readFilters();
    if (type === 'date') next.date = '';
    if (type === 'location') next.location = '';
    if (type === 'sort') next.sort = 'date_asc';
    if (type === 'scope') next.scope = 'upcoming';
    if (type === 'category') {
      next.categories = next.categories.filter(function (slug) { return slug !== value; });
    }
    applyFiltersToForm(next);
    clearFieldError(elements.date);
    syncUrl(next, true);
    search(next);
  }

  /* ---------------- Rendering results ---------------- */

  function renderResults(result) {
    var events = result.events || [];
    var total = result.meta && result.meta.pagination ? result.meta.pagination.total : events.length;

    elements.results.setAttribute('aria-busy', 'false');
    elements.resultCount.textContent = total + (total === 1 ? ' event found' : ' events found');
    elements.resultsTitle.textContent = total === 1 ? 'One event matches' : 'Matching events';

    if (!events.length) {
      elements.results.innerHTML = '';
      elements.results.hidden = true;
      elements.emptyState.hidden = false;
      return;
    }

    elements.emptyState.hidden = true;
    elements.results.hidden = false;
    elements.results.innerHTML = events.map(U.renderEventCardHTML).join('');
  }

  function scopeLabel(scope) {
    if (scope === 'past') return 'Past events';
    if (scope === 'all') return 'All events';
    return 'Upcoming events';
  }

  function renderLoading(filters) {
    clearError();
    elements.emptyState.hidden = true;
    elements.results.hidden = false;
    elements.results.setAttribute('aria-busy', 'true');
    elements.results.innerHTML = '<article class="event-card event-card-skeleton"></article><article class="event-card event-card-skeleton"></article>';
    elements.resultCount.textContent = 'Finding events…';
    elements.resultsTitle.textContent = scopeLabel(filters && filters.scope);
  }

  /* ---------------- Search ---------------- */

  function search(filters) {
    var errors = validate(filters);
    renderActiveFilters(filters);

    if (errors.length) {
      showError(errors.join(' '));
      elements.results.setAttribute('aria-busy', 'false');
      elements.resultCount.textContent = 'Check the filters above';
      return;
    }

    renderLoading(filters);
    Api.searchEvents({
      date: filters.date,
      location: filters.location,
      categories: filters.categories,
      sort: filters.sort,
      scope: filters.scope || 'upcoming',
      limit: 24
    })
      .then(renderResults)
      .catch(function (error) {
        elements.results.setAttribute('aria-busy', 'false');
        elements.results.innerHTML = '';
        elements.results.hidden = true;
        elements.emptyState.hidden = true;
        elements.resultCount.textContent = 'Search unavailable';
        showError(error.message);
      });
  }

  function clearFilters() {
    elements.form.reset();
    U.querySelectorAll('input[name="category"]', elements.categoryOptions).forEach(function (input) { input.checked = false; });
    elements.sort.value = 'date_asc';
    if (elements.scope) elements.scope.value = 'upcoming';
    syncDateBounds('upcoming');
    clearFieldError(elements.date);
    clearError();
    var emptyFilters = { date: '', location: '', categories: [], sort: 'date_asc', scope: 'upcoming' };
    syncUrl(emptyFilters, true);
    search(emptyFilters);
  }

  /* ---------------- Reference data ---------------- */

  function renderCategoryOptions(categories) {
    if (!categories.length) {
      elements.categoryOptions.innerHTML = '<p class="form-loading">No categories are available.</p>';
      return;
    }
    elements.categoryOptions.innerHTML = categories.map(function (category) {
      categoryLookup[category.slug] = category.name;
      return '<label class="category-option"><input type="checkbox" name="category" value="' + U.escapeHtml(category.slug) + '"><span>' + U.escapeHtml(category.name) + '</span></label>';
    }).join('');
  }

  function renderLocationOptions(locations) {
    var options = ['<option value="">Anywhere in Sydney</option>'];
    locations.forEach(function (item) {
      locationLookup[item.suburb] = item.label || item.suburb;
      options.push('<option value="' + U.escapeHtml(item.suburb) + '">' + U.escapeHtml(item.label || item.suburb) + '</option>');
    });
    elements.location.innerHTML = options.join('');
  }

  /* ---------------- Wiring ---------------- */

  /**
   * Upcoming searches only accept today or later, while past and all-event
   * searches must be free to pick any historical date.
   */
  function syncDateBounds(scope) {
    if ((scope || 'upcoming') === 'upcoming') {
      elements.date.min = localDateString(new Date());
      var max = new Date();
      max.setMonth(max.getMonth() + 24);
      elements.date.max = localDateString(max);
    } else {
      elements.date.removeAttribute('min');
      elements.date.removeAttribute('max');
    }
  }

  function init() {
    cacheElements();
    syncDateBounds('upcoming');

    var initial = readFiltersFromUrl();

    Promise.all([Api.getCategories(), Api.getLocations()])
      .then(function (results) {
        renderCategoryOptions(results[0]);
        renderLocationOptions(results[1]);
        applyFiltersToForm(initial);
        renderActiveFilters(readFilters());
        var filters = readFilters();
        search(filters);
      })
      .catch(function (error) {
        elements.categoryOptions.innerHTML = '<p class="form-loading">Categories could not be loaded.</p>';
        elements.location.innerHTML = '<option value="">Location list unavailable</option>';
        showError(error.message);
      });

    elements.form.addEventListener('submit', function (event) {
      event.preventDefault();
      var filters = readFilters();
      syncUrl(filters, false);
      search(filters);
    });

    ['#clear-filters', '#clear-filters-top', '#empty-clear'].forEach(function (selector) {
      var trigger = U.querySelector(selector);
      if (trigger) trigger.addEventListener('click', clearFilters);
    });

    elements.activeFilters.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-remove]');
      if (button) removeFilter(button.getAttribute('data-remove'), button.getAttribute('data-value'));
    });

    elements.date.addEventListener('change', function () { clearFieldError(elements.date); clearError(); });

    if (elements.scope) {
      elements.scope.addEventListener('change', function () {
        syncDateBounds(elements.scope.value);
        clearFieldError(elements.date);
        clearError();
      });
    }

    window.addEventListener('popstate', function () {
      var filters = readFiltersFromUrl();
      applyFiltersToForm(filters);
      search(filters);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
