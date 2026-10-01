import { body } from 'express-validator';
import { OTP_PURPOSES } from '../utils/constants.js';

export const registerValidator = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('mobileNumber')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Must be a valid E.164 mobile number (e.g. +1234567890 or 1234567890)'),
];

export const verifyOtpValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
];

export const resendOtpValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('purpose')
    .trim()
    .notEmpty()
    .withMessage('Purpose is required')
    .isIn(Object.values(OTP_PURPOSES))
    .withMessage(`Purpose must be one of: ${Object.values(OTP_PURPOSES).join(', ')}`),
];
