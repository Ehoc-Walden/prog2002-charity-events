/**
 * Thin wrapper around the charity events REST API.
 * Every request goes through fetchJson so timeout handling, HTTP status
 * checking and JSON error parsing are implemented exactly once.
 */
(function () {
  'use strict';

  var config = window.CHARITY_API || { baseUrl: '/api' };
  var BASE_URL = String(config.baseUrl || '/api').replace(/\/$/, '');

  function CharityApiError(message, status, details) {
    this.name = 'CharityApiError';
    this.message = message || 'The request could not be completed.';
    this.status = status || 0;
    this.details = details || null;
  }
  CharityApiError.prototype = Object.create(Error.prototype);
  CharityApiError.prototype.constructor = CharityApiError;

  /** Fetch a JSON payload with an abort-based timeout and friendly errors. */
  function fetchJson(path, options) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeoutId = null;
    var settings = options || {};

    if (controller) {
      timeoutId = window.setTimeout(function () { controller.abort(); }, config.requestTimeoutMs || 12000);
      settings.signal = controller.signal;
    }

    return window.fetch(BASE_URL + path, settings)
      .catch(function (error) {
        if (error && error.name === 'AbortError') {
          throw new CharityApiError('The charity events service took too long to respond. Check that the API is running and try again.', 0);
        }
        throw new CharityApiError('The charity events service could not be reached. Start the Node API on port 3000 and refresh the page.', 0);
      })
      .then(function (response) {
        if (timeoutId) window.clearTimeout(timeoutId);

        return response.json().catch(function () {
          throw new CharityApiError('The API returned a response that was not valid JSON.', response.status);
        }).then(function (body) {
          if (!response.ok) {
            // The API returns { error: { status, message } } for failures, so
            // unwrap the object instead of rendering "[object Object]".
            var payload = body || {};
            var message = '';
            if (payload.error) {
              message = typeof payload.error === 'string' ? payload.error : payload.error.message;
            } else if (payload.message) {
              message = payload.message;
            }
            throw new CharityApiError(message || ('Request failed with status ' + response.status + '.'), response.status, payload);
          }
          return body;
        });
      })
      .catch(function (error) {
        if (timeoutId) window.clearTimeout(timeoutId);
        if (error instanceof CharityApiError) throw error;
        throw new CharityApiError(error && error.message ? error.message : 'Unexpected error.', 0);
      });
  }

  function getUpcomingEvents(limit) {
    return fetchJson('/events/upcoming?limit=' + encodeURIComponent(limit || 6)).then(function (body) {
      return { events: body.data || [], meta: body.meta || {} };
    });
  }

  function buildSearchQuery(filters) {
    var params = new URLSearchParams();
    if (filters.date) params.set('date', filters.date);
    if (filters.location) params.set('location', filters.location);
    (filters.categories || []).forEach(function (slug) { params.append('category', slug); });
    if (filters.scope && filters.scope !== 'upcoming') params.set('scope', filters.scope);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page) params.set('page', filters.page);
    if (filters.limit) params.set('limit', filters.limit);
    var query = params.toString();
    return query ? '?' + query : '';
  }

  function searchEvents(filters) {
    return fetchJson('/events/search' + buildSearchQuery(filters)).then(function (body) {
      return { events: body.data || [], meta: body.meta || {} };
    });
  }

  function getEvent(eventId) {
    return fetchJson('/events/' + encodeURIComponent(eventId)).then(function (body) {
      return body.data;
    });
  }

  function getCategories() {
    return fetchJson('/categories').then(function (body) { return body.data || []; });
  }

  function getLocations() {
    return fetchJson('/locations').then(function (body) { return body.data || []; });
  }

  function getOrganisations() {
    return fetchJson('/organisations').then(function (body) { return body.data || []; });
  }

  window.CharityApiError = CharityApiError;
  window.CharityApi = {
    buildSearchQuery: buildSearchQuery,
    fetchJson: fetchJson,
    getCategories: getCategories,
    getEvent: getEvent,
    getLocations: getLocations,
    getOrganisations: getOrganisations,
    getUpcomingEvents: getUpcomingEvents,
    searchEvents: searchEvents
  };
})();
