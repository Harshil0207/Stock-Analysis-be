import { asyncHandler } from '../../utils/helpers.js';
import { STATUS_CODES } from '../../utils/constants.js';
import stockService from '../../services/stock.service.js';

export const searchStocks = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const results = await stockService.search(q || '');

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: results
  });
});

export const listStocks = asyncHandler(async (req, res) => {
  const list = await stockService.list();

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: list
  });
});

export const getStockDetail = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const detail = await stockService.getDetail(symbol);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: detail
  });
});

export const getStockProfile = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const profile = await stockService.getProfile(symbol);
  const detail = await stockService.getDetail(symbol);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: {
      ...profile,
      ...detail
    }
  });
});

export const getStockQuote = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const quote = await stockService.getQuote(symbol);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: quote
  });
});

export const getStockChart = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const points = await stockService.getChartPoints(symbol);
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: points
  });
});

export const getStockHistory = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: []
  });
});

export const getStockStatistics = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { peRatio: 28.5, marketCap: 150000000000, volume: 1200000 }
  });
});

export const getStockDividend = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { yield: 1.45, amount: 2.50 }
  });
});

export const getStockSplits = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: []
  });
});

export const getStockEarnings = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { eps: 4.85, estimate: 4.70 }
  });
});

export const getStockFinancials = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { revenue: 54000000000, netIncome: 12000000000 }
  });
});

export const getStockBalanceSheet = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { totalAssets: 120000000000, totalLiabilities: 65000000000 }
  });
});

export const getStockIncomeStatement = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { grossProfit: 35000000000 }
  });
});

export const getStockCashFlow = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { freeCashFlow: 8000000000 }
  });
});

export const getStockShareholders = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: [
      { holder: 'Institutional Capital Group', ownership: '12.4%' }
    ]
  });
});

export const getStockPeers = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: ['TCS.NS', 'INFY.NS']
  });
});
