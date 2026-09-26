'use strict';

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
    console.error('Unable to connect to MySQL. Check the values in .env.');
    console.error(error.message);
    process.exit(1);
  }
}

start();
