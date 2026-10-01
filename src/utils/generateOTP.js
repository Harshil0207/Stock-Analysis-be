import crypto from 'crypto';

/**
 * Generates a cryptographically secure 6-digit OTP
 * @returns {string} 6-digit numeric OTP string
 */
const generateOTP = () => {
  // Generates a random integer between 100000 and 999999 (inclusive)
  return crypto.randomInt(100000, 1000000).toString();
};

export default generateOTP;
