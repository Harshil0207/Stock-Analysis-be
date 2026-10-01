import pool from '../../config/database.js';
import { asyncHandler } from '../../utils/helpers.js';
import { STATUS_CODES } from '../../utils/constants.js';
import ApiError from '../../utils/ApiError.js';

export const addMoney = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Please provide a valid transfer amount.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get or create wallet
    let walletQuery = await client.query('SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE', [req.user.id]);
    if (walletQuery.rows.length === 0) {
      walletQuery = await client.query('INSERT INTO wallets (user_id, balance) VALUES ($1, 0.00) RETURNING id, balance', [req.user.id]);
    }
    const wallet = walletQuery.rows[0];
    const nextBalance = parseFloat(wallet.balance) + parseFloat(amount);

    await client.query('UPDATE wallets SET balance = $1 WHERE id = $2', [nextBalance, wallet.id]);
    await client.query('INSERT INTO wallet_transactions (wallet_id, amount, type) VALUES ($1, $2, $3)', [wallet.id, amount, 'ADD']);

    await client.query('COMMIT');
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: `Deposit of ₹${amount} successfully credited to your settlement wallet.`,
      data: { balance: nextBalance }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const withdrawMoney = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Please provide a valid withdrawal amount.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get or create wallet
    let walletQuery = await client.query('SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE', [req.user.id]);
    if (walletQuery.rows.length === 0) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Wallet not initialized. No funds to withdraw.');
    }
    const wallet = walletQuery.rows[0];

    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Insufficient wallet balance for this withdrawal.');
    }

    const nextBalance = parseFloat(wallet.balance) - parseFloat(amount);
    await client.query('UPDATE wallets SET balance = $1 WHERE id = $2', [nextBalance, wallet.id]);
    await client.query('INSERT INTO wallet_transactions (wallet_id, amount, type) VALUES ($1, $2, $3)', [wallet.id, -amount, 'WITHDRAW']);

    await client.query('COMMIT');
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: `Withdrawal of ₹${amount} successfully transferred to linked bank account.`,
      data: { balance: nextBalance }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const getBalance = asyncHandler(async (req, res) => {
  const query = 'SELECT balance FROM wallets WHERE user_id = $1';
  const { rows } = await pool.query(query, [req.user.id]);

  const balance = rows[0] ? parseFloat(rows[0].balance) : 0.00;

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { balance }
  });
});

export const getHistory = asyncHandler(async (req, res) => {
  const query = `
    SELECT wt.id, wt.amount, wt.type, wt.created_at as "createdAt"
    FROM wallet_transactions wt
    JOIN wallets w ON wt.wallet_id = w.id
    WHERE w.user_id = $1
    ORDER BY wt.created_at DESC
  `;
  const { rows } = await pool.query(query, [req.user.id]);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows
  });
});

export const getTransactions = asyncHandler(async (req, res) => {
  const query = `
    SELECT wt.id, wt.amount, wt.type, wt.created_at as "createdAt"
    FROM wallet_transactions wt
    JOIN wallets w ON wt.wallet_id = w.id
    WHERE w.user_id = $1
    ORDER BY wt.created_at DESC
  `;
  const { rows } = await pool.query(query, [req.user.id]);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: rows
  });
});

export const getDemoBalance = asyncHandler(async (req, res) => {
  const query = 'SELECT balance FROM demo_wallets WHERE user_id = $1';
  const { rows } = await pool.query(query, [req.user.id]);

  const balance = rows[0] ? parseFloat(rows[0].balance) : 0.00;

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { balance }
  });
});

export const depositDemoMoney = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Please provide a valid transfer amount.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let walletQuery = await client.query('SELECT id, balance FROM demo_wallets WHERE user_id = $1 FOR UPDATE', [req.user.id]);
    if (walletQuery.rows.length === 0) {
      walletQuery = await client.query('INSERT INTO demo_wallets (user_id, balance) VALUES ($1, 0.00) RETURNING id, balance', [req.user.id]);
    }
    const wallet = walletQuery.rows[0];
    const nextBalance = parseFloat(wallet.balance) + parseFloat(amount);

    await client.query('UPDATE demo_wallets SET balance = $1 WHERE id = $2', [nextBalance, wallet.id]);
    await client.query('INSERT INTO demo_wallet_transactions (wallet_id, amount, type) VALUES ($1, $2, $3)', [wallet.id, amount, 'ADD']);

    await client.query('COMMIT');
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: `Demo deposit of ₹${amount} successfully credited to your sandbox wallet.`,
      data: { balance: nextBalance }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const withdrawDemoMoney = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Please provide a valid withdrawal amount.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let walletQuery = await client.query('SELECT id, balance FROM demo_wallets WHERE user_id = $1 FOR UPDATE', [req.user.id]);
    if (walletQuery.rows.length === 0) {
      walletQuery = await client.query('INSERT INTO demo_wallets (user_id, balance) VALUES ($1, 0.00) RETURNING id, balance', [req.user.id]);
    }
    const wallet = walletQuery.rows[0];

    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Insufficient demo balance for this withdrawal.');
    }

    const nextBalance = parseFloat(wallet.balance) - parseFloat(amount);
    await client.query('UPDATE demo_wallets SET balance = $1 WHERE id = $2', [nextBalance, wallet.id]);
    await client.query('INSERT INTO demo_wallet_transactions (wallet_id, amount, type) VALUES ($1, $2, $3)', [wallet.id, -amount, 'WITHDRAW']);

    await client.query('COMMIT');
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: `Demo withdrawal of ₹${amount} successfully processed.`,
      data: { balance: nextBalance }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});
