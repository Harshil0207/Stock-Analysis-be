import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  registerValidator,
  verifyOtpValidator,
  loginValidator,
  resendOtpValidator,
} from '../validators/auth.validator.js';

const router = Router();

// --- Public Authentication Routes ---

// Registration
router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/verify-register-otp', otpLimiter, verifyOtpValidator, validate, authController.verifyRegisterOtp);

// Login (Passwordless)
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/verify-login-otp', otpLimiter, verifyOtpValidator, validate, authController.verifyLoginOtp);

// OTP Resending
router.post('/resend-otp', otpLimiter, resendOtpValidator, validate, authController.resendOtp);


// --- Protected Routes (Requires JWT Access Token) ---

router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);

export default router;
