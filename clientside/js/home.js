/**
 * Home page controller.
 * Loads upcoming events from GET /api/events/upcoming and renders the live
 * "city thread" panel, the event grid and the fundraising summary.
 */
(function () {
  'use strict';

  var U = window.CharityUtils;
  var Api = window.CharityApi;

  function threadItemHTML(event) {
    var parts = U.formatDateParts(event.startDateTime);
    var venue = event.venue || {};
    return [
      '<a class="thread-event" href="event.html?id=' + encodeURIComponent(event.id) + '">',
      '  <div class="thread-date"><strong>' + U.escapeHtml(parts.day) + '</strong><span>' + U.escapeHtml(parts.month) + '</span></div>',
      '  <div class="thread-event-copy">',
      '    <h3>' + U.escapeHtml(event.title) + '</h3>',
      '    <p>' + U.escapeHtml((venue.suburb || 'Sydney') + ' · ' + U.formatTicket(event.ticket)) + '</p>',
      '  </div>',
      '  <span aria-hidden="true">→</span>',
      '</a>'
    ].join('');
  }

  function renderThread(events) {
    var container = U.querySelector('[data-city-thread]');
    if (!container) return;
    if (!events.length) {
      container.innerHTML = '<p class="thread-empty">No upcoming events are published yet. Please check back soon.</p>';
      return;
    }
    container.innerHTML = events.slice(0, 4).map(threadItemHTML).join('');
  }

  function renderGrid(events) {
    var container = U.querySelector('[data-home-events]');
    if (!container) return;
    if (!events.length) {
      container.innerHTML = '<div class="state-card"><h3>No events scheduled right now</h3><p>New charity events are added regularly. Try the search page again soon.</p></div>';
      return;
    }
    container.innerHTML = events.slice(0, 6).map(U.renderEventCardHTML).join('');
  }

  function renderSummary(events) {
    var count = U.querySelector('[data-upcoming-count]');
    var raised = U.querySelector('[data-raised-total]');
    var total = events.reduce(function (sum, event) {
      return sum + (Number(event.fundraising && event.fundraising.raised) || 0);
    }, 0);

    U.setText(count, String(events.length));
    if (raised) raised.textContent = U.formatCurrency(total, 'AUD');
  }

  function showError(message) {
    var thread = U.querySelector('[data-city-thread]');
    var grid = U.querySelector('[data-home-events]');
    if (thread) thread.innerHTML = '<p class="thread-empty">Live events are unavailable right now.</p>';
    if (grid) {
      grid.innerHTML = '<div class="state-card"><h3>We could not load the event calendar</h3><p>' + U.escapeHtml(message) + '</p><button class="button button-dark" type="button" data-retry>Try again</button></div>';
      var retry = U.querySelector('[data-retry]', grid);
      if (retry) retry.addEventListener('click', load);
    }
  }

  function load() {
    var thread = U.querySelector('[data-city-thread]');
    if (thread) {
      thread.innerHTML = '<div class="thread-skeleton"><span></span><span></span><span></span></div>';
    }
    Api.getUpcomingEvents(12)
      .then(function (result) {
        renderThread(result.events);
        renderGrid(result.events);
        renderSummary(result.events);
      })
      .catch(function (error) { showError(error.message); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
