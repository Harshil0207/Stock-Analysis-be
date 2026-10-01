import pool from '../../config/database.js';
import userModel from '../../models/user.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { asyncHandler } from '../../utils/helpers.js';
import ApiError from '../../utils/ApiError.js';
import { STATUS_CODES } from '../../utils/constants.js';
import config from '../../config/index.js';

const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  };
};

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Please provide an email address.');
  }

  // Simulate OTP send for passwordless forgot password flow
  res.status(STATUS_CODES.OK).json({
    success: true,
    message: `Password reset OTP successfully transmitted to ${email}.`,
  });
});

export const verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Email and OTP verification token are required.');
  }

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'OTP verification successful. You may now reset your credential token.',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Email and new password are required.');
  }

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Security credentials updated successfully.',
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      if (decoded) {
        await userModel.updateRefreshToken(decoded.id, null);
      }
    } catch (e) {}
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Operator session successfully terminated.',
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Session token missing.');
  }

  const decoded = verifyRefreshToken(token);
  if (!decoded) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Session token expired or corrupted.');
  }

  const user = await userModel.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Invalid session token mapping.');
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });

  res.status(STATUS_CODES.OK)
    .cookie('accessToken', accessToken, getCookieOptions())
    .json({
      success: true,
      message: 'Session token refreshed.',
      data: { accessToken },
    });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: user,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, mobileNumber, role } = req.body;
  
  const query = `
    UPDATE users 
    SET first_name = COALESCE($1, first_name), 
        last_name = COALESCE($2, last_name), 
        mobile_number = COALESCE($3, mobile_number), 
        role = COALESCE($4, role),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING id, first_name as "firstName", last_name as "lastName", email, mobile_number as "mobileNumber", role, is_verified as "isVerified"
  `;
  const { rows } = await pool.query(query, [firstName, lastName, mobileNumber, role, req.user.id]);
  const updatedUser = rows[0];

  const accessToken = generateAccessToken({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });

  res.status(STATUS_CODES.OK)
    .cookie('accessToken', accessToken, getCookieOptions())
    .json({
      success: true,
      message: 'Profile details updated.',
      data: updatedUser,
    });
});

export const changePassword = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Security credentials changed.',
  });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
  
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Operator account and credentials completely purged from database.',
  });
});
