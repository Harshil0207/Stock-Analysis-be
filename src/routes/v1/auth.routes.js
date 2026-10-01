import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import * as authController from '../../controllers/v1/auth.controller.js';

const router = Router();

router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-forgot-password-otp', authController.verifyForgotPasswordOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

// Secured endpoints
router.get('/profile', protect, authController.getProfile);
router.put('/update-profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);
router.delete('/delete-account', protect, authController.deleteAccount);

export default router;
