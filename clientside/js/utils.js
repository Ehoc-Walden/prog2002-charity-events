/**
 * Shared helpers used by every page of the client-side website.
 * Keeping formatting and escaping in one place avoids duplicated logic and
 * reduces the chance of injecting raw database text into the DOM.
 */
(function () {
  'use strict';

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /** Convert a value to safe display text before it is inserted with innerHTML. */
  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Parse the MySQL/ISO date-time strings returned by the API. */
  function parseDate(value) {
    if (!value) return null;
    var normalised = String(value).replace(' ', 'T');
    var date = new Date(normalised);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatCurrency(amount, currency) {
    var symbols = { AUD: '$', USD: '$', NZD: '$', GBP: '£', EUR: '€' };
    var symbol = symbols[currency] || '$';
    var value = Number(amount) || 0;
    var decimals = value % 1 === 0 ? 0 : 2;
    return symbol + value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function formatNumber(value) {
    return String(Number(value) || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function formatCompactCurrency(amount, currency) {
    var value = Number(amount) || 0;
    if (value >= 1000000) return formatCurrency(Math.round(value / 100000) / 10, currency) + 'M';
    if (value >= 1000) return formatCurrency(Math.round(value / 100) / 10, currency) + 'k';
    return formatCurrency(value, currency);
  }

  function formatTicket(ticket) {
    if (!ticket) return 'See details';
    if (ticket.isFree || Number(ticket.price) === 0) return 'Free';
    return formatCurrency(ticket.price, ticket.currency);
  }

  function formatEventDate(value, options) {
    var date = parseDate(value);
    if (!date) return 'Date to be confirmed';
    var opts = options || {};
    if (opts.long) {
      return DAYS[date.getDay()] + ', ' + date.getDate() + ' ' + MONTHS[date.getMonth()] + ' ' + date.getFullYear();
    }
    if (opts.medium) {
      return date.getDate() + ' ' + MONTHS[date.getMonth()] + ' ' + date.getFullYear();
    }
    return date.getDate() + ' ' + MONTHS[date.getMonth()];
  }

  function formatDateParts(value) {
    var date = parseDate(value);
    if (!date) return { day: '--', month: '---', year: '----' };
    return {
      day: String(date.getDate()),
      month: MONTHS[date.getMonth()],
      year: String(date.getFullYear())
    };
  }

  function formatTime(value) {
    var date = parseDate(value);
    if (!date) return '';
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var suffix = hours >= 12 ? 'pm' : 'am';
    var displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return displayHour + (minutes ? ':' + String(minutes).padStart(2, '0') : '') + ' ' + suffix;
  }

  function formatTimeRange(start, end) {
    var from = formatTime(start);
    var to = formatTime(end);
    if (!from) return 'Time to be confirmed';
    return to ? from + ' – ' + to : from;
  }

  /** Clamp the API progress value to a safe 0-100 number. */
  function progressPercent(fundraising) {
    if (!fundraising) return 0;
    var value = Number(fundraising.progressPercent);
    if (Number.isNaN(value)) {
      var goal = Number(fundraising.goal) || 0;
      var raised = Number(fundraising.raised) || 0;
      value = goal > 0 ? (raised / goal) * 100 : 0;
    }
    return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
  }

  function progressStatus(percent) {
    if (percent >= 100) return 'Goal reached';
    if (percent >= 75) return 'Final stretch';
    if (percent >= 40) return 'Building momentum';
    if (percent > 0) return 'Just getting started';
    return 'Not started';
  }

  /** Event cover keys are stored with a leading slash; make them portable. */
  function resolveAssetPath(path) {
    if (!path) return 'assets/covers/twilight-harbour.svg';
    return String(path).replace(/^\//, '');
  }

  function querySelector(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function querySelectorAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setText(element, value) {
    if (element) element.textContent = value === null || value === undefined ? '' : String(value);
  }

  function debounce(callback, delay) {
    var timer = null;
    return function () {
      var args = arguments;
      var context = this;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { callback.apply(context, args); }, delay || 300);
    };
  }

  window.CharityUtils = {
    DAYS: DAYS,
    MONTHS: MONTHS,
    debounce: debounce,
    escapeHtml: escapeHtml,
    formatCompactCurrency: formatCompactCurrency,
    formatCurrency: formatCurrency,
    formatDateParts: formatDateParts,
    formatEventDate: formatEventDate,
    formatNumber: formatNumber,
    formatTicket: formatTicket,
    formatTimeRange: formatTimeRange,
    parseDate: parseDate,
    progressPercent: progressPercent,
    progressStatus: progressStatus,
    querySelector: querySelector,
    querySelectorAll: querySelectorAll,
    resolveAssetPath: resolveAssetPath,
    setText: setText
  };
})();

/**
 * Build the reusable event card markup shared by the home and search pages.
 * The card is returned as an HTML string so callers can decide how to place it
 * in the DOM (innerHTML for lists, or a single card for a spotlight panel).
 */
window.CharityUtils.renderEventCardHTML = function (event) {
  var U = window.CharityUtils;
  var dateParts = U.formatDateParts(event.startDateTime);
  var percent = U.progressPercent(event.fundraising);
  var ticket = U.formatTicket(event.ticket);
  var venue = event.venue || {};
  var location = [venue.name, venue.suburb].filter(Boolean).join(', ');
  var statusLabel = event.ticket && event.ticket.isFree ? 'Free entry' : 'Ticketed';
  var statusClass = event.ticket && event.ticket.isFree ? ' is-free' : '';
  var detailUrl = 'event.html?id=' + encodeURIComponent(event.id);

  return [
    '<article class="event-card">',
    '  <div class="event-card-media">',
    '    <img src="' + U.escapeHtml(U.resolveAssetPath(event.heroImage)) + '" alt="' + U.escapeHtml(event.title) + ' event cover" loading="lazy">',
    '    <div class="event-card-date"><strong>' + U.escapeHtml(dateParts.day) + '</strong><span>' + U.escapeHtml(dateParts.month) + '</span></div>',
    '    <span class="event-card-status' + statusClass + '">' + U.escapeHtml(statusLabel) + '</span>',
    '  </div>',
    '  <div class="event-card-body">',
    '    <div class="event-card-tags">',
    '      <span class="tag tag-accent">' + U.escapeHtml(event.category ? event.category.name : 'Community') + '</span>',
    '      <span class="tag">' + U.escapeHtml(U.formatEventDate(event.startDateTime, { medium: true })) + '</span>',
    '      <span class="tag tag-status ' + (event.isPast ? 'is-past' : 'is-upcoming') + '">' + (event.isPast ? 'Past' : 'Upcoming') + '</span>',
    '    </div>',
    '    <h3>' + U.escapeHtml(event.title) + '</h3>',
    '    <p class="event-card-location"><span aria-hidden="true">⌖</span>' + U.escapeHtml(location || 'Sydney, NSW') + '</p>',
    '    <div class="mini-progress">',
    '      <div class="mini-progress-head"><span>Raised ' + U.escapeHtml(U.formatCompactCurrency(event.fundraising && event.fundraising.raised, event.ticket && event.ticket.currency)) + '</span><span>' + percent + '% of goal</span></div>',
    '      <div class="progress-rail" role="progressbar" aria-label="Fundraising progress for ' + U.escapeHtml(event.title) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + percent + '"><span style="width:' + percent + '%"></span></div>',
    '    </div>',
    '    <div class="event-card-footer">',
    '      <p class="event-card-price">Entry<strong>' + U.escapeHtml(ticket) + '</strong></p>',
    '      <a class="card-link" href="' + detailUrl + '">View details <span aria-hidden="true">→</span></a>',
    '    </div>',
    '  </div>',
    '</article>'
  ].join('\n');
};
