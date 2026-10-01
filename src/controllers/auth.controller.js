import authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { STATUS_CODES } from '../utils/constants.js';
import { asyncHandler } from '../utils/helpers.js';
import config from '../config/index.js';

const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  };
};

class AuthController {
  register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, mobileNumber } = req.body;
    const result = await authService.register({ firstName, lastName, email, mobileNumber });
    
    return res
      .status(STATUS_CODES.OK)
      .json(new ApiResponse(STATUS_CODES.OK, result, 'Registration initiated. OTP sent to email.'));
  });

  verifyRegisterOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const { user, accessToken, refreshToken } = await authService.verifyRegisterOtp({ email, otp });

    return res
      .status(STATUS_CODES.CREATED)
      .cookie('accessToken', accessToken, getCookieOptions())
      .cookie('refreshToken', refreshToken, getCookieOptions())
      .json(
        new ApiResponse(
          STATUS_CODES.CREATED,
          { user, accessToken, refreshToken },
          'Email verified and account registered successfully.'
        )
      );
  });

  login = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.login({ email });

    return res
      .status(STATUS_CODES.OK)
      .json(new ApiResponse(STATUS_CODES.OK, result, 'Login verification code sent to your email.'));
  });

  verifyLoginOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const { user, accessToken, refreshToken } = await authService.verifyLoginOtp({ email, otp });

    return res
      .status(STATUS_CODES.OK)
      .cookie('accessToken', accessToken, getCookieOptions())
      .cookie('refreshToken', refreshToken, getCookieOptions())
      .json(
        new ApiResponse(
          STATUS_CODES.OK,
          { user, accessToken, refreshToken },
          'Login successful. Welcome back.'
        )
      );
  });

  resendOtp = asyncHandler(async (req, res) => {
    const { email, purpose } = req.body;
    const result = await authService.resendOtp({ email, purpose });

    return res
      .status(STATUS_CODES.OK)
      .json(new ApiResponse(STATUS_CODES.OK, result, 'Verification code resent successfully.'));
  });

  logout = asyncHandler(async (req, res) => {
    if (req.user?.id) {
      await authService.logout(req.user.id);
    }

    const { maxAge, ...clearCookieOptions } = getCookieOptions();

    return res
      .status(STATUS_CODES.OK)
      .clearCookie('accessToken', clearCookieOptions)
      .clearCookie('refreshToken', clearCookieOptions)
      .json(new ApiResponse(STATUS_CODES.OK, null, 'Logged out successfully.'));
  });

  getProfile = asyncHandler(async (req, res) => {
    const result = await authService.getProfile(req.user.id);

    return res
      .status(STATUS_CODES.OK)
      .json(new ApiResponse(STATUS_CODES.OK, result, 'Profile retrieved successfully.'));
  });
}

export default new AuthController();
