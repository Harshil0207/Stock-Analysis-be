import pool from '../config/database.js';

export const OtpSchema = {
  tableName: 'otps',
  fields: {
    id: 'SERIAL',
    email: 'VARCHAR(255)',
    otp: 'VARCHAR(6)',
    purpose: 'VARCHAR(50)',
    expiresAt: 'TIMESTAMP WITH TIME ZONE',
    attempts: 'INTEGER',
    createdAt: 'TIMESTAMP WITH TIME ZONE',
  },
};

class OtpModel {
  /**
   * Save a new OTP entry
   * @param {object} otpData 
   * @returns {Promise<object>}
   */
  async create({ email, otp, purpose, expiresAt }) {
    const query = `
      INSERT INTO otps (email, otp, purpose, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, otp, purpose, expires_at as "expiresAt", attempts, created_at as "createdAt"
    `;
    const { rows } = await pool.query(query, [
      email.toLowerCase().trim(),
      otp,
      purpose,
      expiresAt,
    ]);
    return rows[0];
  }

  /**
   * Find the most recent active OTP for email and purpose
   * @param {string} email 
   * @param {string} purpose 
   * @returns {Promise<object|null>}
   */
  async findValidOTP(email, purpose) {
    const query = `
      SELECT id, email, otp, purpose, expires_at as "expiresAt", attempts, created_at as "createdAt"
      FROM otps
      WHERE email = $1 AND purpose = $2 AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [email.toLowerCase().trim(), purpose]);
    return rows[0] || null;
  }

  /**
   * Increment attempt counter for a specific OTP record
   * @param {number} id 
   * @returns {Promise<number>}
   */
  async incrementAttempts(id) {
    const query = `
      UPDATE otps
      SET attempts = attempts + 1
      WHERE id = $1
      RETURNING attempts
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0]?.attempts || 0;
  }

  /**
   * Invalidate all OTPs for email and purpose (e.g. on new request or successful verification)
   * @param {string} email 
   * @param {string} purpose 
   * @returns {Promise<void>}
   */
  async invalidateOTP(email, purpose) {
    const query = `
      DELETE FROM otps
      WHERE email = $1 AND purpose = $2
    `;
    await pool.query(query, [email.toLowerCase().trim(), purpose]);
  }

  /**
   * Delete expired OTPs from the database (clean up job)
   * @returns {Promise<number>}
   */
  async deleteExpired() {
    const query = `
      DELETE FROM otps
      WHERE expires_at <= CURRENT_TIMESTAMP
    `;
    const { rowCount } = await pool.query(query);
    return rowCount;
  }
}

export default new OtpModel();
