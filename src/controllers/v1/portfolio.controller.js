import pool from "../../config/database.js";
import { asyncHandler } from "../../utils/helpers.js";
import { STATUS_CODES } from "../../utils/constants.js";
import ApiError from "../../utils/ApiError.js";
import stockService from "../../services/stock.service.js";

export const buyAsset = asyncHandler(async (req, res) => {
  const { symbol, quantity, price } = req.body;

  if (!symbol || !quantity || quantity <= 0 || !price || price <= 0) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      "Valid symbol, quantity, and price are required.",
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get or create wallet
    let walletQuery = await client.query(
      "SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE",
      [req.user.id],
    );
    if (walletQuery.rows.length === 0) {
      walletQuery = await client.query(
        "INSERT INTO wallets (user_id, balance) VALUES ($1, 0.00) RETURNING id, balance",
        [req.user.id],
      );
    }
    const wallet = walletQuery.rows[0];
    const totalCost = parseFloat(price) * parseInt(quantity, 10);

    if (parseFloat(wallet.balance) < totalCost) {
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "Insufficient wallet balance for this purchase.",
      );
    }

    // Deduct balance
    const nextBalance = parseFloat(wallet.balance) - totalCost;
    await client.query("UPDATE wallets SET balance = $1 WHERE id = $2", [
      nextBalance,
      wallet.id,
    ]);

    // Record wallet transaction
    await client.query(
      "INSERT INTO wallet_transactions (wallet_id, amount, type) VALUES ($1, $2, $3)",
      [wallet.id, -totalCost, "STOCK_BUY"],
    );

    // Record order
    const orderQuery = await client.query(
      `INSERT INTO orders (user_id, symbol, quantity, price, type, status)
       VALUES ($1, $2, $3, $4, 'BUY', 'COMPLETED')
       RETURNING id, created_at as "createdAt"`,
      [req.user.id, symbol.toUpperCase(), quantity, price],
    );

    // Update holdings
    const holdingQuery = await client.query(
      "SELECT id, quantity, avg_price FROM holdings WHERE user_id = $1 AND symbol = $2 FOR UPDATE",
      [req.user.id, symbol.toUpperCase()],
    );

    if (holdingQuery.rows.length === 0) {
      await client.query(
        "INSERT INTO holdings (user_id, symbol, quantity, avg_price) VALUES ($1, $2, $3, $4)",
        [req.user.id, symbol.toUpperCase(), quantity, price],
      );
    } else {
      const existing = holdingQuery.rows[0];
      const newQty = existing.quantity + parseInt(quantity, 10);
      const newAvgPrice =
        (existing.quantity * parseFloat(existing.avg_price) + totalCost) /
        newQty;

      await client.query(
        "UPDATE holdings SET quantity = $1, avg_price = $2 WHERE id = $3",
        [newQty, newAvgPrice, existing.id],
      );
    }

    await client.query("COMMIT");
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: `Asset ${symbol.toUpperCase()} purchased successfully.`,
      data: {
        orderId: orderQuery.rows[0].id,
        remainingBalance: nextBalance,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

export const sellAsset = asyncHandler(async (req, res) => {
  const { symbol, quantity, price } = req.body;

  if (!symbol || !quantity || quantity <= 0 || !price || price <= 0) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      "Valid symbol, quantity, and price are required.",
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const holdingQuery = await client.query(
      "SELECT id, quantity, avg_price FROM holdings WHERE user_id = $1 AND symbol = $2 FOR UPDATE",
      [req.user.id, symbol.toUpperCase()],
    );

    if (
      holdingQuery.rows.length === 0 ||
      holdingQuery.rows[0].quantity < quantity
    ) {
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "Insufficient holdings to execute sell order.",
      );
    }

    const holding = holdingQuery.rows[0];
    const totalProceeds = parseFloat(price) * parseInt(quantity, 10);

    const nextQty = holding.quantity - parseInt(quantity, 10);
    if (nextQty === 0) {
      await client.query("DELETE FROM holdings WHERE id = $1", [holding.id]);
    } else {
      await client.query("UPDATE holdings SET quantity = $1 WHERE id = $2", [
        nextQty,
        holding.id,
      ]);
    }

    let walletQuery = await client.query(
      "SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE",
      [req.user.id],
    );
    if (walletQuery.rows.length === 0) {
      walletQuery = await client.query(
        "INSERT INTO wallets (user_id, balance) VALUES ($1, 0.00) RETURNING id, balance",
        [req.user.id],
      );
    }
    const wallet = walletQuery.rows[0];
    const nextBalance = parseFloat(wallet.balance) + totalProceeds;
    await client.query("UPDATE wallets SET balance = $1 WHERE id = $2", [
      nextBalance,
      wallet.id,
    ]);

    await client.query(
      "INSERT INTO wallet_transactions (wallet_id, amount, type) VALUES ($1, $2, $3)",
      [wallet.id, totalProceeds, "STOCK_SELL"],
    );
    const orderQuery = await client.query(
      `INSERT INTO orders (user_id, symbol, quantity, price, type, status)
       VALUES ($1, $2, $3, $4, 'SELL', 'COMPLETED')
       RETURNING id, created_at as "createdAt"`,
      [req.user.id, symbol.toUpperCase(), quantity, price],
    );

    await client.query("COMMIT");
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: `Asset ${symbol.toUpperCase()} sold successfully.`,
      data: {
        orderId: orderQuery.rows[0].id,
        remainingBalance: nextBalance,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

async function fetchLivePrice(symbol) {
  try {
    const quote = await stockService.getQuote(symbol);
    if (quote && typeof quote.c === "number" && quote.c > 0) {
      return { price: parseFloat(quote.c), dp: parseFloat(quote.dp || 0) };
    }
  } catch (_) {}

  try {
    const detail = await stockService.getDetail(symbol);
    if (detail && detail.price > 0) {
      return { price: parseFloat(detail.price), dp: 0 };
    }
  } catch (_) {}

  return null;
}

async function enrichHolding(holding) {
  const quantity = parseInt(holding.quantity, 10);
  const avgPrice = parseFloat(holding.avgPrice);
  const totalCost = quantity * avgPrice;

  const live = await fetchLivePrice(holding.symbol);
  const currentPrice = live && live.price > 0 ? live.price : avgPrice;

  const currentValue = quantity * currentPrice;
  const totalGain = currentValue - totalCost;
  const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return {
    ...holding,
    avgPrice,
    quantity,
    currentPrice,
    totalCost,
    currentValue,
    totalGain,
    gainPercent,
  };
}

export const getPortfolio = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, symbol, quantity, avg_price as "avgPrice" FROM holdings WHERE user_id = $1',
    [req.user.id],
  );

  const enrichedHoldings = await Promise.all(rows.map(enrichHolding));

  res.status(STATUS_CODES.OK).json({ success: true, data: enrichedHoldings });
});

export const getSummary = asyncHandler(async (req, res) => {
  const [holdingsResult, walletResult] = await Promise.all([
    pool.query(
      "SELECT symbol, quantity, avg_price FROM holdings WHERE user_id = $1",
      [req.user.id],
    ),
    pool.query("SELECT balance FROM wallets WHERE user_id = $1", [req.user.id]),
  ]);

  const balance = walletResult.rows[0]
    ? parseFloat(walletResult.rows[0].balance)
    : 0;

  // Fetch all live prices in parallel
  const liveMap = {};
  await Promise.all(
    holdingsResult.rows.map(async (item) => {
      const live = await fetchLivePrice(item.symbol);
      liveMap[item.symbol] = live;
    }),
  );

  let totalEquity = 0;
  let totalCost = 0;

  for (const item of holdingsResult.rows) {
    const qty = parseInt(item.quantity, 10);
    const avg = parseFloat(item.avg_price);
    totalCost += qty * avg;

    const live = liveMap[item.symbol];
    const currentPrice = live && live.price > 0 ? live.price : avg;
    totalEquity += qty * currentPrice;
  }

  const netWorth = balance + totalEquity;
  const totalGain = totalEquity - totalCost;

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: {
      cashBalance: balance,
      equityValue: totalEquity,
      totalCost,
      netWorth,
      totalGain,
      gainPercent: totalCost > 0 ? (totalGain / totalCost) * 100 : 0,
    },
  });
});

export const getPerformance = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: {
      dayChange: 0,
      dayChangePercent: 0,
      allTimeReturn: 0,
      allTimeReturnPercent: 0,
    },
  });
});

export const getHistory = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, symbol, quantity, price, type, status, created_at as "createdAt"
     FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id],
  );
  res.status(STATUS_CODES.OK).json({ success: true, data: rows });
});

export const getHoldings = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, symbol, quantity, avg_price as "avgPrice" FROM holdings WHERE user_id = $1',
    [req.user.id],
  );

  const enrichedHoldings = await Promise.all(rows.map(enrichHolding));

  res.status(STATUS_CODES.OK).json({ success: true, data: enrichedHoldings });
});
