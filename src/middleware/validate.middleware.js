import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import { STATUS_CODES } from '../utils/constants.js';


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  return next(new ApiError(STATUS_CODES.BAD_REQUEST, 'Validation failed', formattedErrors));
};

export default validate;
