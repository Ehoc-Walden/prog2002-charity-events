'use strict';

const { HttpError } = require('./http');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toPositiveInteger(value, fallback, maximum) {
  if (value === undefined || value === null || value === '') return fallback;
  if (!/^\d+$/.test(String(value))) {
    throw new HttpError(400, 'Expected a positive integer.');
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new HttpError(400, `Value must be between 1 and ${maximum}.`);
  }
  return parsed;
}

function toDateString(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;
  const text = String(value).trim();
  if (!DATE_PATTERN.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00Z`))) {
    throw new HttpError(400, `${fieldName} must use YYYY-MM-DD format.`);
  }
  return text;
}

function toStringArray(value) {
  if (value === undefined || value === null || value === '') return [];
  return (Array.isArray(value) ? value : [value])
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateSearchQuery(query = {}) {
  const categories = toStringArray(query.category);
  if (categories.some((slug) => !SLUG_PATTERN.test(slug))) {
    throw new HttpError(400, 'Each category must be a valid slug.');
  }

  const location = query.location ? String(query.location).trim() : '';
  if (location.length > 80) {
    throw new HttpError(400, 'Location must be 80 characters or fewer.');
  }

  const allowedSorts = new Set(['date_asc', 'date_desc', 'raised_desc', 'goal_desc']);
  const sort = query.sort ? String(query.sort) : 'date_asc';
  if (!allowedSorts.has(sort)) {
    throw new HttpError(400, 'sort must be date_asc, date_desc, raised_desc or goal_desc.');
  }

  // scope lets the client ask for upcoming, past or all published events so the
  // website can label each card as past or upcoming using the same endpoint.
  const allowedScopes = new Set(['upcoming', 'past', 'all']);
  const scope = query.scope ? String(query.scope) : 'upcoming';
  if (!allowedScopes.has(scope)) {
    throw new HttpError(400, 'scope must be upcoming, past or all.');
  }

  return {
    date: toDateString(query.date, 'date'),
    location,
    categories,
    sort,
    scope,
    page: toPositiveInteger(query.page, 1, 10000),
    limit: toPositiveInteger(query.limit, 12, 50)
  };
}

module.exports = {
  toDateString,
  toPositiveInteger,
  toStringArray,
  validateSearchQuery
};
