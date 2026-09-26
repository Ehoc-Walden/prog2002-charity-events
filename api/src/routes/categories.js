'use strict';

const express = require('express');
const db = require('../../event_db');
const { asyncHandler } = require('../utils/http');

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await db.execute(`
    SELECT category_id, name, slug, description, accent_colour, icon_key
    FROM categories
    WHERE is_active = 1
    ORDER BY name ASC
  `);

  res.json({
    data: rows.map((row) => ({
      id: row.category_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      accentColour: row.accent_colour,
      iconKey: row.icon_key
    }))
  });
}));

module.exports = router;
