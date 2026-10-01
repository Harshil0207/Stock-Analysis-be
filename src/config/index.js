import dotenv from 'dotenv';
import mailConfig from './mail.js';
import jwtConfig from './jwt.js';

dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/auth',
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173',
  },
  mail: mailConfig,
  jwt: jwtConfig,
  rateLimiter: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10),
    maxResendLimit: parseInt(process.env.OTP_MAX_RESEND_LIMIT || '3', 10),
  },
};

export default config;
