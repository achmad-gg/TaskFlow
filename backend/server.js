// Separation of app.js and server.js matters:
// app.js exports the Express app (testable without starting a real server)
// server.js is the runnable entry point

import app from './src/app.js';
import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';
import prisma from './src/config/database.js';

const PORT = parseInt(env.PORT, 10);

const server = app.listen(PORT, () => {
  logger.info(`🚀 TaskFlow API running on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Graceful shutdown — in production, finish in-flight requests before exiting
const shutdown = async (signal) => {
  logger.info(`${signal} received — starting graceful shutdown`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    await prisma.$disconnect();
    logger.info('Database disconnected');
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});