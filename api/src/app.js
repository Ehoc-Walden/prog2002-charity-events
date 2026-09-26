'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const eventRoutes = require('./routes/events');
const categoryRoutes = require('./routes/categories');
const locationRoutes = require('./routes/locations');
const organisationRoutes = require('./routes/organisations');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 86400
}));
app.use(express.json({ limit: '20kb' }));
app.use((req, res, next) => {
  if (req.method === 'GET') res.set('Cache-Control', 'public, max-age=30');
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok', service: 'charity-events-api' } });
});

app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/organisations', organisationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
