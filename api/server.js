'use strict';

require('./src/config/loadEnv');

const app = require('./src/app');
const env = require('./src/config/env');
const db = require('./event_db');

async function start() {
  try {
    await db.query('SELECT 1');
    const server = app.listen(env.port, () => {
      console.log(`Charity Events API listening on http://localhost:${env.port}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Closing API server.`);
      server.close(async () => {
        await db.end();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Unable to connect to MySQL.');
    console.error(`Reason: ${error.message}`);
    console.error('');
    console.error('Connection settings come from api/.env, which is created');
    console.error('automatically from api/.env.example on first run. To fix this:');
    console.error('  1. Re-run api/database/schema.sql as an administrative MySQL user.');
    console.error('     It creates the read-only charity_app account the API expects.');
    console.error('  2. Or set DB_USER and DB_PASSWORD in api/.env to your own MySQL login.');
    process.exit(1);
  }
}

start();
