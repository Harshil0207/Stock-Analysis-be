import pool from '../config/database.js';

export const UserSchema = {
  tableName: 'users',
  fields: {
    id: 'UUID',
    firstName: 'VARCHAR(255)',
    lastName: 'VARCHAR(255)',
    email: 'VARCHAR(255)',
    mobileNumber: 'VARCHAR(20)',
    role: 'VARCHAR(50)',
    isVerified: 'BOOLEAN',
    refreshToken: 'TEXT',
    createdAt: 'TIMESTAMP WITH TIME ZONE',
    updatedAt: 'TIMESTAMP WITH TIME ZONE',
  },
};

class UserModel {
  /**
   * Find a user by their email address
   * @param {string} email 
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    const query = `
      SELECT id, first_name as "firstName", last_name as "lastName", email, mobile_number as "mobileNumber", role, is_verified as "isVerified", refresh_token as "refreshToken", created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE email = $1
    `;
    const { rows } = await pool.query(query, [email.toLowerCase().trim()]);
    return rows[0] || null;
  }

  /**
   * Find a user by their unique ID
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    const query = `
      SELECT id, first_name as "firstName", last_name as "lastName", email, mobile_number as "mobileNumber", role, is_verified as "isVerified", refresh_token as "refreshToken", created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  /**
   * Create a new user (Passwordless)
   * @param {object} userData 
   * @returns {Promise<object>}
   */
  async create({ firstName, lastName, email, mobileNumber, role = 'USER', isVerified = false }) {
    const query = `
      INSERT INTO users (first_name, last_name, email, mobile_number, role, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, first_name as "firstName", last_name as "lastName", email, mobile_number as "mobileNumber", role, is_verified as "isVerified", created_at as "createdAt"
    `;
    const { rows } = await pool.query(query, [
      firstName.trim(),
      lastName.trim(),
      email.toLowerCase().trim(),
      mobileNumber.trim(),
      role,
      isVerified,
    ]);
    return rows[0];
  }

  /**
   * Update user's refresh token
   * @param {string} id 
   * @param {string|null} refreshToken 
   * @returns {Promise<void>}
   */
  async updateRefreshToken(id, refreshToken) {
    const query = `
      UPDATE users
      SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await pool.query(query, [refreshToken, id]);
  }

  /**
   * Mark user as email verified
   * @param {string} email 
   * @returns {Promise<object>}
   */
  async verifyUser(email) {
    const query = `
      UPDATE users
      SET is_verified = true, updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id, first_name as "firstName", last_name as "lastName", email, mobile_number as "mobileNumber", role, is_verified as "isVerified"
    `;
    const { rows } = await pool.query(query, [email.toLowerCase().trim()]);
    return rows[0];
  }
}

export default new UserModel();
