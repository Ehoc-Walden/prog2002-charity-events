'use strict';

const db = require('../../event_db');
const { buildSearchStatement } = require('../utils/eventSql');
const { HttpError } = require('../utils/http');

const EVENT_FIELDS = `
  e.event_id,
  e.title,
  e.slug,
  e.summary,
  e.purpose,
  e.description,
  e.start_datetime,
  e.end_datetime,
  e.timezone,
  e.ticket_price,
  e.currency,
  e.is_free,
  e.goal_amount,
  e.raised_amount,
  e.capacity,
  e.hero_image_key,
  e.is_featured,
  c.category_id,
  c.name AS category_name,
  c.slug AS category_slug,
  c.accent_colour,
  c.icon_key,
  o.organisation_id,
  o.name AS organisation_name,
  o.slug AS organisation_slug,
  o.tagline AS organisation_tagline,
  o.mission AS organisation_mission,
  v.venue_id,
  v.name AS venue_name,
  v.address_line_1,
  v.suburb,
  v.state_code,
  v.postcode,
  v.country_code
`;

function sydneyToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

/**
 * Returns true when the event has already finished relative to the supplied
 * Sydney date, which is how the client labels each card as Past or Upcoming.
 */
function isPastEnd(endDateTime, today) {
  const value = endDateTime instanceof Date
    ? endDateTime.toISOString().slice(0, 10)
    : String(endDateTime || '').slice(0, 10);
  if (!value) return false;
  return value < (today || sydneyToday());
}

function mapEvent(row, today) {
  const goal = Number(row.goal_amount);
  const raised = Number(row.raised_amount);
  const progressPercent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 1000) / 10) : 0;

  return {
    id: row.event_id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    purpose: row.purpose,
    description: row.description,
    startDateTime: row.start_datetime,
    endDateTime: row.end_datetime,
    timezone: row.timezone,
    ticket: {
      price: Number(row.ticket_price),
      currency: row.currency,
      isFree: Boolean(row.is_free)
    },
    fundraising: {
      goal: goal,
      raised: raised,
      progressPercent
    },
    capacity: row.capacity,
    heroImage: row.hero_image_key,
    featured: Boolean(row.is_featured),
    isPast: isPastEnd(row.end_datetime, today),
    category: {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
      accentColour: row.accent_colour,
      iconKey: row.icon_key
    },
    organisation: {
      id: row.organisation_id,
      name: row.organisation_name,
      slug: row.organisation_slug,
      tagline: row.organisation_tagline,
      mission: row.organisation_mission
    },
    venue: {
      id: row.venue_id,
      name: row.venue_name,
      addressLine1: row.address_line_1,
      suburb: row.suburb,
      stateCode: row.state_code,
      postcode: row.postcode,
      countryCode: row.country_code
    }
  };
}

async function listUpcomingEvents(limit) {
  const today = sydneyToday();
  const [rows] = await db.execute(
    `SELECT ${EVENT_FIELDS}
     FROM events e
     JOIN categories c ON c.category_id = e.category_id
     JOIN organisations o ON o.organisation_id = e.organisation_id
     JOIN venues v ON v.venue_id = e.venue_id
     WHERE e.status = 'published' AND DATE(e.end_datetime) >= ?
     ORDER BY e.is_featured DESC, e.start_datetime ASC
     LIMIT ?`,
    [today, limit]
  );

  return { events: rows.map((row) => mapEvent(row, today)), asOfDate: today };
}

async function searchEvents(filters) {
  const today = sydneyToday();
  const statement = buildSearchStatement({ ...filters, today });
  const [[countRows], [rows]] = await Promise.all([
    db.execute(statement.countSql, statement.countParams),
    db.execute(statement.rowsSql, statement.rowsParams)
  ]);
  const total = Number(countRows[0]?.total || 0);

  return {
    events: rows.map((row) => mapEvent(row, today)),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit))
    }
  };
}

async function getEventById(eventId) {
  const [rows] = await db.execute(
    `SELECT ${EVENT_FIELDS}
     FROM events e
     JOIN categories c ON c.category_id = e.category_id
     JOIN organisations o ON o.organisation_id = e.organisation_id
     JOIN venues v ON v.venue_id = e.venue_id
     WHERE e.event_id = ? AND e.status = 'published'
     LIMIT 1`,
    [eventId]
  );

  if (rows.length === 0) {
    throw new HttpError(404, 'Event not found.');
  }

  const [highlightRows] = await db.execute(
    `SELECT highlight_id, title, detail
     FROM event_highlights
     WHERE event_id = ?
     ORDER BY display_order ASC`,
    [eventId]
  );

  const event = mapEvent(rows[0], sydneyToday());
  event.highlights = highlightRows.map((highlight) => ({
    id: highlight.highlight_id,
    title: highlight.title,
    detail: highlight.detail
  }));

  return event;
}

module.exports = {
  getEventById,
  isPastEnd,
  listUpcomingEvents,
  mapEvent,
  searchEvents,
  sydneyToday
};
