/**
 * Event detail page controller.
 * The event id is read from the query string (?id=12) with a localStorage
 * fallback, then GET /api/events/:id populates the page. The register button
 * deliberately opens an "under construction" dialog because ticketing is out
 * of scope for Assessment 2.
 */
(function () {
  'use strict';

  var U = window.CharityUtils;
  var Api = window.CharityApi;
  var STORAGE_KEY = 'commonGround.lastEventId';
  var UNDER_CONSTRUCTION = 'This feature is currently under construction.';

  function readEventId() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get('id') || params.get('eventId');
    if (fromQuery && /^\d+$/.test(fromQuery)) {
      window.localStorage.setItem(STORAGE_KEY, fromQuery);
      return fromQuery;
    }
    var hash = window.location.hash.match(/id=(\d+)/);
    if (hash) return hash[1];
    return window.localStorage.getItem(STORAGE_KEY) || '';
  }

  function initials(name) {
    return String(name || 'CG').split(/\s+/).filter(Boolean).slice(0, 2)
      .map(function (word) { return word.charAt(0).toUpperCase(); }).join('');
  }

  function showState(state, message) {
    U.querySelector('#event-loading').hidden = state !== 'loading';
    U.querySelector('#event-content').hidden = state !== 'ready';
    var errorBox = U.querySelector('#event-error');
    errorBox.hidden = state !== 'error';
    if (message) U.setText(U.querySelector('#event-error-message'), message);
  }

  function renderMeta(event) {
    var parts = [
      '<span class="tag tag-accent">' + U.escapeHtml(event.category ? event.category.name : 'Community') + '</span>',
      '<span class="tag">' + U.escapeHtml(U.formatTicket(event.ticket)) + ' entry</span>',
      '<span class="tag">' + U.escapeHtml(String(event.capacity || '—')) + ' places</span>'
    ];
    U.querySelector('#event-meta').innerHTML = parts.join('');
  }

  function renderQuickFacts(event) {
    var facts = [
      { label: 'Date', value: U.formatEventDate(event.startDateTime, { long: true }) },
      { label: 'Time', value: U.formatTimeRange(event.startDateTime, event.endDateTime) },
      { label: 'Location', value: [event.venue && event.venue.suburb, event.venue && event.venue.stateCode].filter(Boolean).join(', ') || 'Sydney, NSW' }
    ];
    U.querySelector('#event-quick-facts').innerHTML = facts.map(function (fact) {
      return '<div><dt>' + U.escapeHtml(fact.label) + '</dt><dd>' + U.escapeHtml(fact.value) + '</dd></div>';
    }).join('');
  }

  function renderHighlights(event) {
    var container = U.querySelector('#event-highlights');
    var highlights = event.highlights || [];
    if (!highlights.length) {
      container.innerHTML = '<div class="highlight-item"><strong>Full details</strong><p>Contact the organiser for the full event program.</p></div>';
      return;
    }
    container.innerHTML = highlights.map(function (highlight) {
      return '<div class="highlight-item"><strong>' + U.escapeHtml(highlight.title) + '</strong><p>' + U.escapeHtml(highlight.detail) + '</p></div>';
    }).join('');
  }

  function renderRegistration(event) {
    var ticket = event.ticket || {};
    U.setText(U.querySelector('#ticket-price'), U.formatTicket(ticket));
    U.setText(U.querySelector('#ticket-note'), ticket.isFree
      ? 'Free community entry. Fundraising is encouraged but completely optional.'
      : 'Ticket price per person. All revenue is directed to this event purpose.');
  }

  function renderProgress(event) {
    var percent = U.progressPercent(event.fundraising);
    var fundraising = event.fundraising || { raised: 0, goal: 0 };
    var currency = event.ticket && event.ticket.currency;

    U.setText(U.querySelector('#progress-percent'), percent + '%');
    U.setText(U.querySelector('#progress-status'), U.progressStatus(percent));
    U.setText(U.querySelector('#raised-amount'), U.formatCurrency(fundraising.raised, currency));
    U.setText(U.querySelector('#goal-amount'), U.formatCurrency(fundraising.goal, currency));

    var track = U.querySelector('#progress-track');
    track.setAttribute('aria-valuenow', String(percent));
    track.setAttribute('aria-valuetext', percent + '% of the fundraising goal raised');
    U.querySelector('#progress-bar').style.width = percent + '%';
  }

  function renderInfo(event) {
    var venue = event.venue || {};
    var address = [venue.addressLine1, venue.suburb, venue.stateCode, venue.postcode].filter(Boolean).join(', ');
    var rows = [
      { label: 'Date', value: U.formatEventDate(event.startDateTime, { long: true }) },
      { label: 'Time', value: U.formatTimeRange(event.startDateTime, event.endDateTime), note: event.timezone },
      { label: 'Venue', value: venue.name || 'To be confirmed', note: address },
      { label: 'Category', value: event.category ? event.category.name : 'Community' },
      { label: 'Capacity', value: (event.capacity || '—') + ' people' },
      { label: 'Reference', value: 'Event #' + String(event.id).padStart(3, '0') }
    ];
    U.querySelector('#event-info-list').innerHTML = rows.map(function (row) {
      return '<div class="event-info-row"><dt>' + U.escapeHtml(row.label) + '</dt><dd>' + U.escapeHtml(row.value) +
        (row.note ? '<small>' + U.escapeHtml(row.note) + '</small>' : '') + '</dd></div>';
    }).join('');
  }

  function renderEvent(event) {
    document.title = event.title + ' | Common Ground Collective';

    renderMeta(event);
    U.setText(U.querySelector('#event-title'), event.title);
    U.setText(U.querySelector('#event-summary'), event.summary);
    renderQuickFacts(event);

    var cover = U.querySelector('#event-cover');
    cover.src = U.resolveAssetPath(event.heroImage);
    cover.alt = event.title + ' event cover';

    U.setText(U.querySelector('#cover-category'), event.category ? event.category.name : 'Community');
    U.setText(U.querySelector('#cover-date'), U.formatEventDate(event.startDateTime, { medium: true }));

    U.setText(U.querySelector('#breadcrumb-event'), event.title);
    U.setText(U.querySelector('#event-purpose'), event.purpose || event.title);
    U.setText(U.querySelector('#event-description'), event.description || event.summary);

    renderHighlights(event);

    U.setText(U.querySelector('#event-organiser'), event.organisation ? event.organisation.name : 'Common Ground Collective');
    U.setText(U.querySelector('#event-organiser-mission'), (event.organisation && event.organisation.mission) || 'A local organisation working with Common Ground Collective.');
    U.setText(U.querySelector('#organiser-monogram'), initials(event.organisation && event.organisation.name));

    renderRegistration(event);
    renderProgress(event);
    renderInfo(event);
    showState('ready', '');
  }

  function openConstructionNotice() {
    var dialog = U.querySelector('#construction-dialog');
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.showModal();
      return;
    }
    window.alert(UNDER_CONSTRUCTION);
  }

  function init() {
    var registerButton = U.querySelector('#register-button');
    if (registerButton) registerButton.addEventListener('click', openConstructionNotice);

    var eventId = readEventId();
    showState('loading', '');

    if (!eventId) {
      showState('error', 'No event id was supplied. Open an event from the home page or the search results.');
      return;
    }

    Api.getEvent(eventId)
      .then(renderEvent)
      .catch(function (error) {
        var message = error.status === 404
          ? 'That event is not published, has been suspended or does not exist.'
          : error.message;
        showState('error', message);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
