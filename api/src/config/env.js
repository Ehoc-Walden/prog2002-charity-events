'use strict';

const dotenv = require('dotenv');
dotenv.config();

function parseOrigins(value) {
  return String(value || 'http://localhost:5500,http://127.0.0.1:5500')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS)
};
