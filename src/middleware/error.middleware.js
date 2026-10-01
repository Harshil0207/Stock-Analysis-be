import ApiError from '../utils/ApiError.js';
import { STATUS_CODES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import config from '../config/index.js';

export const notFoundHandler = (req, res, next) => {
  const err = new ApiError(STATUS_CODES.NOT_FOUND, `Route not found: ${req.originalUrl}`);
  next(err);
};


export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  if (error.code === '23505') {
    error = new ApiError(STATUS_CODES.CONFLICT, 'Record already exists.', error.errors);
  }

  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(STATUS_CODES.UNAUTHORIZED, 'Invalid token. Please authenticate again.');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(STATUS_CODES.UNAUTHORIZED, 'Your session expired. Please log in again.');
  }

  logger.error(`${error.message} - Path: ${req.originalUrl} - Method: ${req.method} - IP: ${req.ip}`, {
    stack: error.stack,
  });

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
  };

  if (config.env === 'development') {
    response.stack = error.stack;
  }

  return res.status(error.statusCode).json(response);
};
