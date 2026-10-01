import pool from '../../config/database.js';
import { asyncHandler } from '../../utils/helpers.js';
import { STATUS_CODES } from '../../utils/constants.js';
import ApiError from '../../utils/ApiError.js';

export const placeOrder = asyncHandler(async (req, res) => {
  const { symbol, quantity, price, type } = req.body;
  if (!symbol || !quantity || quantity <= 0 || !price || price <= 0 || !type) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Valid symbol, quantity, price, and type (BUY/SELL) are required.');
  }

  const query = `
    INSERT INTO orders (user_id, symbol, quantity, price, type, status)
    VALUES ($1, $2, $3, $4, $5, 'PENDING')
    RETURNING id, symbol, quantity, price, type, status, created_at as "createdAt"
  `;
  const { rows } = await pool.query(query, [req.user.id, symbol.toUpperCase(), quantity, price, type.toUpperCase()]);

  res.status(STATUS_CODES.CREATED).json({
    success: true,
    message: 'Limit order placed successfully.',
    data: rows[0]
  });
});

export const modifyOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, price } = req.body;

  if (!quantity || quantity <= 0 || !price || price <= 0) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Valid modified quantity and price are required.');
  }

  const query = `
    UPDATE orders
    SET quantity = $1, price = $2
    WHERE id = $3 AND user_id = $4 AND status = 'PENDING'
    RETURNING id, symbol, quantity, price, type, status, created_at as "createdAt"
  `;
  const { rows } = await pool.query(query, [quantity, price, id, req.user.id]);

  if (rows.length === 0) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Active pending order not found or unauthorized.');
  }

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Order modified successfully.',
    data: rows[0]
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE orders
    SET status = 'CANCELLED'
    WHERE id = $1 AND user_id = $2 AND status = 'PENDING'
    RETURNING id, symbol, status
  `;
  const { rows } = await pool.query(query, [id, req.user.id]);

  if (rows.length === 0) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Active pending order not found or unauthorized.');
  }

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Order cancelled successfully.',
    data: rows[0]
  });
});

export const getOrders = asyncHandler(async (req, res) => {
  const query = `
    SELECT id, symbol, quantity, price, type, status, created_at as "createdAt"
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [req.user.id]);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows
  });
});

export const getOpenOrders = asyncHandler(async (req, res) => {
  const query = `
    SELECT id, symbol, quantity, price, type, status, created_at as "createdAt"
    FROM orders
    WHERE user_id = $1 AND status = 'PENDING'
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [req.user.id]);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows
  });
});

export const getCompletedOrders = asyncHandler(async (req, res) => {
  const query = `
    SELECT id, symbol, quantity, price, type, status, created_at as "createdAt"
    FROM orders
    WHERE user_id = $1 AND status = 'COMPLETED'
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [req.user.id]);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows
  });
});

export const getCancelledOrders = asyncHandler(async (req, res) => {
  const query = `
    SELECT id, symbol, quantity, price, type, status, created_at as "createdAt"
    FROM orders
    WHERE user_id = $1 AND status = 'CANCELLED'
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [req.user.id]);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT id, symbol, quantity, price, type, status, created_at as "createdAt"
    FROM orders
    WHERE id = $1 AND user_id = $2
  `;
  const { rows } = await pool.query(query, [id, req.user.id]);

  if (rows.length === 0) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Order not found.');
  }

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows[0]
  });
});
