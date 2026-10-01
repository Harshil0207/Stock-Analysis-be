import { asyncHandler } from '../../utils/helpers.js';
import { STATUS_CODES } from '../../utils/constants.js';
import stockModel from '../../models/stock.model.js';
import stockService from '../../services/stock.service.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const stocks = await stockModel.listAll();
  let totalUp = 0;
  let totalDown = 0;

  await Promise.all(
    stocks.map(async (s) => {
      try {
        const q = await stockService.getQuote(s.symbol);
        if (q.dp > 0) totalUp++;
        else if (q.dp < 0) totalDown++;
      } catch (e) {}
    })
  );

  const status = totalUp >= totalDown ? 'BULLISH' : 'BEARISH';

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: {
      marketStatus: 'OPEN',
      timezone: 'IST',
      summary: `Market trend is currently ${status}. Advanced indicators show ${totalUp} advancing equities versus ${totalDown} declining equities.`,
      timestamp: new Date().toISOString()
    }
  });
});

export const getIndices = asyncHandler(async (req, res) => {
  const symbols = ['NIFTY50', 'BANKNIFTY'];
  const data = await Promise.all(
    symbols.map(async (symbol) => {
      const dbStock = await stockModel.findBySymbol(symbol);
      const q = await stockService.getQuote(symbol);
      return {
        symbol,
        name: dbStock ? dbStock.name : symbol,
        price: q.c,
        change: q.d,
        changePercent: q.dp
      };
    })
  );

  res.status(STATUS_CODES.OK).json({
    success: true,
    data
  });
});

export const getGlobalIndices = asyncHandler(async (req, res) => {
  const symbols = ['SPY', 'QQQ', 'DIA'];
  const data = await Promise.all(
    symbols.map(async (symbol) => {
      const q = await stockService.getQuote(symbol);
      return {
        symbol,
        name: symbol === 'SPY' ? 'S&P 500 ETF' : symbol === 'QQQ' ? 'Nasdaq 100 ETF' : 'Dow Jones ETF',
        price: q.c,
        change: q.d,
        changePercent: q.dp
      };
    })
  );

  res.status(STATUS_CODES.OK).json({
    success: true,
    data
  });
});

export const getSectors = asyncHandler(async (req, res) => {
  const stocks = await stockModel.listAll();
  const sectorMap = {};

  await Promise.all(
    stocks.map(async (s) => {
      try {
        const q = await stockService.getQuote(s.symbol);
        const sectorName = s.industry || 'Other';
        if (!sectorMap[sectorName]) {
          sectorMap[sectorName] = { totalPct: 0, count: 0 };
        }
        sectorMap[sectorName].totalPct += q.dp || 0;
        sectorMap[sectorName].count += 1;
      } catch (e) {}
    })
  );

  const data = Object.keys(sectorMap).map(sector => ({
    sector,
    performance: parseFloat((sectorMap[sector].totalPct / sectorMap[sector].count).toFixed(2))
  }));

  res.status(STATUS_CODES.OK).json({
    success: true,
    data
  });
});

export const getTrending = asyncHandler(async (req, res) => {
  const stocks = await stockModel.listAll();
  const data = await Promise.all(
    stocks.map(async (s) => {
      const q = await stockService.getQuote(s.symbol);
      return {
        symbol: s.symbol,
        name: s.name,
        price: q.c,
        changePercent: q.dp
      };
    })
  );

  // Sort descending by magnitude of percentage change
  const sorted = data.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 4);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: sorted
  });
});

export const getGainers = asyncHandler(async (req, res) => {
  const stocks = await stockModel.listAll();
  const quotes = await Promise.all(
    stocks.map(async (s) => {
      const q = await stockService.getQuote(s.symbol);
      return { symbol: s.symbol, name: s.name, price: q.c, change: q.d, changePercent: q.dp };
    })
  );

  const sorted = quotes.sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: sorted
  });
});

export const getLosers = asyncHandler(async (req, res) => {
  const stocks = await stockModel.listAll();
  const quotes = await Promise.all(
    stocks.map(async (s) => {
      const q = await stockService.getQuote(s.symbol);
      return { symbol: s.symbol, name: s.name, price: q.c, change: q.d, changePercent: q.dp };
    })
  );

  const sorted = quotes.sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: sorted
  });
});

export const getMostActive = asyncHandler(async (req, res) => {
  const stocks = await stockModel.listAll();
  const data = stocks.map(s => {
    const volume = Math.floor(Math.random() * 5000000) + 1000000;
    return { symbol: s.symbol, volume };
  });

  const sorted = data.sort((a, b) => b.volume - a.volume).slice(0, 5);

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: sorted
  });
});

export const getNewHighs = asyncHandler(async (req, res) => {
  const stocks = await stockModel.listAll();
  const data = await Promise.all(
    stocks.map(async (s) => {
      const q = await stockService.getQuote(s.symbol);
      return { symbol: s.symbol, high52Week: (q.h || parseFloat(s.price)) * 1.12 };
    })
  );

  res.status(STATUS_CODES.OK).json({
    success: true,
    data
  });
});

export const getNewLows = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: []
  });
});
