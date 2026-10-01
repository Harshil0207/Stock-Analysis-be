import { verifyAccessToken } from '../utils/jwt.js';
import userModel from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import { STATUS_CODES } from '../utils/constants.js';
import { asyncHandler } from '../utils/helpers.js';


export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Access denied. No authentication token provided.');
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Session expired or invalid token. Please authenticate again.');
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'User account no longer exists.');
  }

  if (!user.isVerified) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Your email is not verified.');
  }

  req.user = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };

  next();
});


export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          STATUS_CODES.FORBIDDEN,
          `Access Denied. Role '${req.user?.role || 'Guest'}' is not authorized to access this resource.`
        )
      );
    }
    next();
  };
};
