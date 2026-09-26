'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSearchStatement } = require('../src/utils/eventSql');

const baseFilters = {
  today: '2026-09-25',
  date: null,
  location: '',
  categories: [],
  sort: 'date_asc',
  scope: 'upcoming',
  page: 1,
  limit: 12
};

test('buildSearchStatement keeps all values parameterised', () => {
  const statement = buildSearchStatement({
    ...baseFilters,
    location: 'Bondi',
    categories: ['wellness', 'community'],
    page: 2,
    limit: 6
  });

  assert.match(statement.rowsSql, /c\.slug IN \(\?, \?\)/);
  assert.match(statement.rowsSql, /LIMIT \? OFFSET \?/);
  assert.deepEqual(statement.rowsParams, ['2026-09-25', '%Bondi%', 'wellness', 'community', 6, 6]);
  assert.equal(statement.countParams.length, 4);
});

test('buildSearchStatement selects only published active events', () => {
  const statement = buildSearchStatement(baseFilters);
  assert.match(statement.rowsSql, /e\.status = 'published'/);
  assert.match(statement.rowsSql, /DATE\(e\.end_datetime\) >= \?/);
  assert.match(statement.rowsSql, /ORDER BY e\.start_datetime ASC/);
});

test('buildSearchStatement bounds past events when scope is past', () => {
  const statement = buildSearchStatement({ ...baseFilters, scope: 'past' });
  assert.match(statement.rowsSql, /DATE\(e\.end_datetime\) < \?/);
  assert.deepEqual(statement.countParams, ['2026-09-25']);
});

test('buildSearchStatement removes the date window when scope is all', () => {
  const statement = buildSearchStatement({ ...baseFilters, scope: 'all' });
  assert.doesNotMatch(statement.rowsSql, /DATE\(e\.end_datetime\)/);
  assert.deepEqual(statement.rowsParams, [12, 0]);
});
