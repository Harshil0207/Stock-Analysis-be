import app from './src/app.js';
import config from './src/config/index.js';
import { logger } from './src/utils/logger.js';
import { testConnection } from './src/config/database.js';

let server;

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

async function startServer() {
  try {
    await testConnection();
    logger.info('Database connection verified successfully.');
    const PORT = config.port || 5000;
    server = app.listen(PORT, () => {
      logger.info(`Server is running in ${config.env} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  if (server) {
    server.close(() => {
      logger.info('Process terminated.');
    });
  }
});
