'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateSearchQuery } = require('../src/utils/validation');

test('validateSearchQuery applies safe defaults', () => {
  const result = validateSearchQuery({});
  assert.deepEqual(result, {
    date: null,
    location: '',
    categories: [],
    sort: 'date_asc',
    scope: 'upcoming',
    page: 1,
    limit: 12
  });
});

test('validateSearchQuery accepts explicit past and all scopes', () => {
  assert.equal(validateSearchQuery({ scope: 'past' }).scope, 'past');
  assert.equal(validateSearchQuery({ scope: 'all' }).scope, 'all');
});

test('validateSearchQuery accepts comma-separated category slugs', () => {
  const result = validateSearchQuery({ category: 'fun-run,community', location: 'Manly' });
  assert.deepEqual(result.categories, ['fun-run', 'community']);
  assert.equal(result.location, 'Manly');
});

test('validateSearchQuery rejects invalid dates and sort values', () => {
  assert.throws(() => validateSearchQuery({ date: '18/10/2026' }), /YYYY-MM-DD/);
  assert.throws(() => validateSearchQuery({ sort: 'random' }), /sort must be/);
  assert.throws(() => validateSearchQuery({ scope: 'everything' }), /scope must be/);
});
