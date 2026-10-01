import { asyncHandler } from '../../utils/helpers.js';
import { STATUS_CODES } from '../../utils/constants.js';
import stockService from '../../services/stock.service.js';

// Utility helper to generate dynamic historical data path based on current price
const generateChartData = (currentPrice, pointsCount) => {
  const data = [];
  let price = currentPrice;
  for (let i = pointsCount - 1; i >= 0; i--) {
    const dev = (Math.random() - 0.48) * (price * 0.015); // drift slightly upward
    price = price - dev;
    data.unshift(parseFloat(price.toFixed(2)));
  }
  return data;
};

export const getCandlestick = asyncHandler(async (req, res) => {
  const symbol = req.query.symbol || 'NIFTY50';
  let price = 100.00;
  try {
    const q = await stockService.getQuote(symbol);
    price = q.c || 100.00;
  } catch (e) {}

  const c = generateChartData(price, 10);
  const o = c.map(val => parseFloat((val * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2)));
  const h = c.map((val, idx) => parseFloat((Math.max(val, o[idx]) * (1 + Math.random() * 0.006)).toFixed(2)));
  const l = c.map((val, idx) => parseFloat((Math.min(val, o[idx]) * (1 - Math.random() * 0.006)).toFixed(2)));
  const t = Array.from({ length: 10 }, (_, i) => Math.floor(Date.now() / 1000) - (10 - i) * 60);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { t, o, h, l, c }
  });
});

export const getLine = asyncHandler(async (req, res) => {
  const symbol = req.query.symbol || 'NIFTY50';
  let price = 100.00;
  try {
    const q = await stockService.getQuote(symbol);
    price = q.c || 100.00;
  } catch (e) {}

  const data = generateChartData(price, 8);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data
  });
});

export const getIntraday = asyncHandler(async (req, res) => {
  const symbol = req.query.symbol || 'NIFTY50';
  let price = 100.00;
  try {
    const q = await stockService.getQuote(symbol);
    price = q.c || 100.00;
  } catch (e) {}

  const data = generateChartData(price, 6);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data
  });
});

export const getDaily = asyncHandler(async (req, res) => {
  const symbol = req.query.symbol || 'NIFTY50';
  let price = 100.00;
  try {
    const q = await stockService.getQuote(symbol);
    price = q.c || 100.00;
  } catch (e) {}

  const data = generateChartData(price, 12);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data
  });
});

export const getWeekly = asyncHandler(async (req, res) => {
  const symbol = req.query.symbol || 'NIFTY50';
  let price = 100.00;
  try {
    const q = await stockService.getQuote(symbol);
    price = q.c || 100.00;
  } catch (e) {}

  const data = generateChartData(price, 5);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data
  });
});

export const getMonthly = asyncHandler(async (req, res) => {
  const symbol = req.query.symbol || 'NIFTY50';
  let price = 100.00;
  try {
    const q = await stockService.getQuote(symbol);
    price = q.c || 100.00;
  } catch (e) {}

  const data = generateChartData(price, 4);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data
  });
});

export const getYearly = asyncHandler(async (req, res) => {
  const symbol = req.query.symbol || 'NIFTY50';
  let price = 100.00;
  try {
    const q = await stockService.getQuote(symbol);
    price = q.c || 100.00;
  } catch (e) {}

  const data = generateChartData(price, 3);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data
  });
});
