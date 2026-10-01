import pool from '../../config/database.js';
import { asyncHandler } from '../../utils/helpers.js';
import { STATUS_CODES } from '../../utils/constants.js';
import ApiError from '../../utils/ApiError.js';

export const getTransactions = asyncHandler(async (req, res) => {
  const query = `
    SELECT id, amount, type, created_at as "createdAt"
    FROM wallet_transactions
    WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = $1)
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [req.user.id]);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows
  });
});

export const filterTransactions = asyncHandler(async (req, res) => {
  const { type } = req.query;
  let query = `
    SELECT id, amount, type, created_at as "createdAt"
    FROM wallet_transactions
    WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = $1)
  `;
  const params = [req.user.id];

  if (type) {
    query += ' AND type = $2';
    params.push(type.toUpperCase());
  }

  query += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(query, params);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows
  });
});

export const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT id, amount, type, created_at as "createdAt"
    FROM wallet_transactions
    WHERE id = $1 AND wallet_id = (SELECT id FROM wallets WHERE user_id = $2)
  `;
  const { rows } = await pool.query(query, [id, req.user.id]);

  if (rows.length === 0) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Transaction not found.');
  }

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows[0]
  });
});

export const getDemoTransactions = asyncHandler(async (req, res) => {
  const query = `
    SELECT id, amount, type, created_at as "createdAt"
    FROM demo_wallet_transactions
    WHERE wallet_id = (SELECT id FROM demo_wallets WHERE user_id = $1)
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [req.user.id]);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows
  });
});
