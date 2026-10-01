import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom log formatting for console output
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const options = {
  console: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    handleExceptions: true,
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      logFormat
    ),
  },
  errorFile: {
    level: 'error',
    filename: 'logs/error.log',
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      json()
    ),
  },
  combinedFile: {
    level: 'info',
    filename: 'logs/combined.log',
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      json()
    ),
  },
};

// Instantiate Winston Logger
export const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.Console(options.console),
    new winston.transports.File(options.errorFile),
    new winston.transports.File(options.combinedFile),
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

// Create a stream object with a write function that will be used by Morgan
export const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger;
