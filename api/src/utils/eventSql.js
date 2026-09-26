'use strict';

const SORT_SQL = Object.freeze({
  date_asc: 'e.start_datetime ASC, e.event_id ASC',
  date_desc: 'e.start_datetime DESC, e.event_id DESC',
  raised_desc: 'e.raised_amount DESC, e.start_datetime ASC',
  goal_desc: 'e.goal_amount DESC, e.start_datetime ASC'
});

function buildSearchStatement(filters) {
  // Only published events are ever exposed, so draft, cancelled and suspended
  // listings never leak into the website. The scope widens or narrows the date
  // window so one endpoint can serve upcoming, past and all-events searches.
  const where = ["e.status = 'published'"];
  const params = [];

  if (filters.scope === 'past') {
    where.push('DATE(e.end_datetime) < ?');
    params.push(filters.today);
  } else if (filters.scope !== 'all') {
    where.push('DATE(e.end_datetime) >= ?');
    params.push(filters.today);
  }

  if (filters.date) {
    where.push('DATE(e.start_datetime) = ?');
    params.push(filters.date);
  }

  if (filters.location) {
    where.push("CONCAT(v.name, ' ', v.address_line_1, ' ', v.suburb, ' ', v.state_code, ' ', v.postcode) LIKE ?");
    params.push(`%${filters.location}%`);
  }

  if (filters.categories.length > 0) {
    const placeholders = filters.categories.map(() => '?').join(', ');
    where.push(`c.slug IN (${placeholders})`);
    params.push(...filters.categories);
  }

  const whereSql = where.join(' AND ');
  const orderSql = SORT_SQL[filters.sort] || SORT_SQL.date_asc;
  const offset = (filters.page - 1) * filters.limit;

  return {
    countSql: `
      SELECT COUNT(*) AS total
      FROM events e
      JOIN categories c ON c.category_id = e.category_id
      JOIN venues v ON v.venue_id = e.venue_id
      WHERE ${whereSql}
    `,
    countParams: params,
    rowsSql: `
      SELECT
        e.event_id,
        e.title,
        e.slug,
        e.summary,
        e.purpose,
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
        v.venue_id,
        v.name AS venue_name,
        v.address_line_1,
        v.suburb,
        v.state_code,
        v.postcode
      FROM events e
      JOIN categories c ON c.category_id = e.category_id
      JOIN organisations o ON o.organisation_id = e.organisation_id
      JOIN venues v ON v.venue_id = e.venue_id
      WHERE ${whereSql}
      ORDER BY ${orderSql}
      LIMIT ? OFFSET ?
    `,
    rowsParams: [...params, filters.limit, offset]
  };
}

module.exports = { buildSearchStatement, SORT_SQL };
