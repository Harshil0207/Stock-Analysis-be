import dotenv from 'dotenv';

dotenv.config();

const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_development_only_123456789',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_development_only_123456789',
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};

export default jwtConfig;
