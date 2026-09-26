'use strict';

const express = require('express');
const eventService = require('../services/eventService');
const { asyncHandler, HttpError } = require('../utils/http');
const { toPositiveInteger, validateSearchQuery } = require('../utils/validation');

const router = express.Router();

router.get('/upcoming', asyncHandler(async (req, res) => {
  const limit = toPositiveInteger(req.query.limit, 6, 20);
  const result = await eventService.listUpcomingEvents(limit);
  res.json({ data: result.events, meta: { asOfDate: result.asOfDate, count: result.events.length } });
}));

router.get('/search', asyncHandler(async (req, res) => {
  const filters = validateSearchQuery(req.query);
  const result = await eventService.searchEvents(filters);
  res.json({ data: result.events, meta: { filters, pagination: result.pagination } });
}));

router.get('/:eventId', asyncHandler(async (req, res) => {
  if (!/^\d+$/.test(req.params.eventId)) {
    throw new HttpError(400, 'Event ID must be a positive integer.');
  }
  const event = await eventService.getEventById(Number(req.params.eventId));
  res.json({ data: event });
}));

module.exports = router;
