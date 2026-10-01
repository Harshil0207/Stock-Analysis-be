import pool from '../../config/database.js';
import { asyncHandler } from '../../utils/helpers.js';
import { STATUS_CODES } from '../../utils/constants.js';
import ApiError from '../../utils/ApiError.js';

export const createWatchlist = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Watchlist name is required.');
  }

  const query = `
    INSERT INTO watchlists (user_id, name)
    VALUES ($1, $2)
    RETURNING id, name, created_at as "createdAt"
  `;
  const { rows } = await pool.query(query, [req.user.id, name]);

  res.status(STATUS_CODES.CREATED).json({
    success: true,
    message: 'Watchlist created successfully.',
    data: rows[0]
  });
});

export const getWatchlists = asyncHandler(async (req, res) => {
  // Fetch all watchlists for the user, including their items
  const query = `
    SELECT w.id, w.name, w.created_at as "createdAt",
           COALESCE(json_agg(wi.symbol) FILTER (WHERE wi.symbol IS NOT NULL), '[]') as symbols
    FROM watchlists w
    LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
    WHERE w.user_id = $1
    GROUP BY w.id
    ORDER BY w.created_at DESC
  `;
  const { rows } = await pool.query(query, [req.user.id]);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows
  });
});

export const updateWatchlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'New watchlist name is required.');
  }

  const query = `
    UPDATE watchlists
    SET name = $1
    WHERE id = $2 AND user_id = $3
    RETURNING id, name, created_at as "createdAt"
  `;
  const { rows } = await pool.query(query, [name, id, req.user.id]);

  if (rows.length === 0) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Watchlist not found or unauthorized.');
  }

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Watchlist updated successfully.',
    data: rows[0]
  });
});

export const deleteWatchlist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM watchlists
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;
  const { rows } = await pool.query(query, [id, req.user.id]);

  if (rows.length === 0) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Watchlist not found or unauthorized.');
  }

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Watchlist deleted successfully.'
  });
});

export const addStockToWatchlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { symbol } = req.body;

  if (!symbol) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Stock symbol is required.');
  }

  // Verify ownership of the watchlist first
  const checkOwner = await pool.query('SELECT id FROM watchlists WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (checkOwner.rows.length === 0) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Watchlist not found or unauthorized.');
  }

  const query = `
    INSERT INTO watchlist_items (watchlist_id, symbol)
    VALUES ($1, $2)
    ON CONFLICT (watchlist_id, symbol) DO NOTHING
    RETURNING id, symbol
  `;
  const { rows } = await pool.query(query, [id, symbol.toUpperCase()]);

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: `Stock ${symbol.toUpperCase()} added to watchlist.`,
    data: rows[0] || { symbol: symbol.toUpperCase() }
  });
});

export const removeStockFromWatchlist = asyncHandler(async (req, res) => {
  const { id, symbol } = req.params;

  // Verify ownership
  const checkOwner = await pool.query('SELECT id FROM watchlists WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (checkOwner.rows.length === 0) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Watchlist not found or unauthorized.');
  }

  const query = `
    DELETE FROM watchlist_items
    WHERE watchlist_id = $1 AND symbol = $2
    RETURNING id
  `;
  const { rows } = await pool.query(query, [id, symbol.toUpperCase()]);

  if (rows.length === 0) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Stock not found in this watchlist.');
  }

  res.status(STATUS_CODES.OK).json({
    success: true,
    message: `Stock ${symbol.toUpperCase()} removed from watchlist.`
  });
});
