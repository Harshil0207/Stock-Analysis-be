import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Generate JWT Access Token
 * @param {object} payload 
 * @returns {string} Access Token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  });
};

/**
 * Generate JWT Refresh Token
 * @param {object} payload 
 * @returns {string} Refresh Token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
};

/**
 * Verify JWT Access Token
 * @param {string} token 
 * @returns {object} Decoded payload
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Verify JWT Refresh Token
 * @param {string} token 
 * @returns {object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    return null;
  }
};
