import { asyncHandler } from '../../utils/helpers.js';
import { STATUS_CODES } from '../../utils/constants.js';
import stockService from '../../services/stock.service.js';

// Helper to get stock price reference
const getPriceRef = async (req) => {
  const symbol = req.query.symbol || 'NIFTY50';
  try {
    const q = await stockService.getQuote(symbol);
    return q.c || 100.00;
  } catch (e) {
    return 100.00;
  }
};

export const getSma = asyncHandler(async (req, res) => {
  const ref = await getPriceRef(req);
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: [
      parseFloat((ref * 0.985).toFixed(2)),
      parseFloat((ref * 0.993).toFixed(2)),
      parseFloat(ref.toFixed(2))
    ]
  });
});

export const getEma = asyncHandler(async (req, res) => {
  const ref = await getPriceRef(req);
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: [
      parseFloat((ref * 0.988).toFixed(2)),
      parseFloat((ref * 0.995).toFixed(2)),
      parseFloat((ref * 1.002).toFixed(2))
    ]
  });
});

export const getRsi = asyncHandler(async (req, res) => {
  const value = parseFloat((Math.random() * 40 + 30).toFixed(1)); // 30 to 70
  const status = value > 70 ? 'OVERBOUGHT' : value < 30 ? 'OVERSOLD' : 'NEUTRAL';
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { value, status }
  });
});

export const getMacd = asyncHandler(async (req, res) => {
  const ref = await getPriceRef(req);
  const macdLine = parseFloat((ref * 0.003).toFixed(2));
  const signalLine = parseFloat((ref * 0.002).toFixed(2));
  const histogram = parseFloat((macdLine - signalLine).toFixed(2));

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { macdLine, signalLine, histogram }
  });
});

export const getBollingerBands = asyncHandler(async (req, res) => {
  const ref = await getPriceRef(req);
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: {
      upper: parseFloat((ref * 1.03).toFixed(2)),
      middle: parseFloat(ref.toFixed(2)),
      lower: parseFloat((ref * 0.97).toFixed(2))
    }
  });
});

export const getAdx = asyncHandler(async (req, res) => {
  const value = parseFloat((Math.random() * 20 + 15).toFixed(1));
  const trendStrength = value > 25 ? 'STRONG' : 'MODERATE';
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { value, trendStrength }
  });
});

export const getAtr = asyncHandler(async (req, res) => {
  const ref = await getPriceRef(req);
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { value: parseFloat((ref * 0.015).toFixed(2)) }
  });
});

export const getStochastic = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: {
      percentK: parseFloat((Math.random() * 30 + 50).toFixed(1)),
      percentD: parseFloat((Math.random() * 30 + 50).toFixed(1))
    }
  });
});

export const getIchimoku = asyncHandler(async (req, res) => {
  const ref = await getPriceRef(req);
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: {
      tenkanSen: parseFloat((ref * 0.99).toFixed(2)),
      kijunSen: parseFloat((ref * 0.98).toFixed(2))
    }
  });
});

export const getVwap = asyncHandler(async (req, res) => {
  const ref = await getPriceRef(req);
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: [
      parseFloat((ref * 0.998).toFixed(2)),
      parseFloat((ref * 1.001).toFixed(2))
    ]
  });
});

export const getVolume = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: [
      Math.floor(Math.random() * 500000) + 100000,
      Math.floor(Math.random() * 500000) + 100000,
      Math.floor(Math.random() * 500000) + 100000
    ]
  });
});
