import stockModel from '../models/stock.model.js';
import * as finnhubService from './finnhub.service.js';

class StockService {
  async search(queryStr) {
    const dbResults = await stockModel.search(queryStr);
    if (dbResults.length > 0) {
      return dbResults;
    }
    return [];
  }

  async list() {
    return await stockModel.listAll();
  }

  async getProfile(symbol) {
    const sym = symbol.toUpperCase();
        try {
      const profile = await finnhubService.getCompanyProfile(sym);
      if (profile && profile.name) {
        await stockModel.createOrUpdate({
          symbol: sym,
            name: profile.name,
            price: 150.00, 
          industry: profile.finnhubIndustry || 'Technology',
          exchange: profile.exchange || 'NASDAQ'
        });
        return profile;
      }
    } catch (e) {}

    const dbStock = await stockModel.findBySymbol(sym);
    if (dbStock) {
      return {
        name: dbStock.name,
        exchange: dbStock.exchange,
        finnhubIndustry: dbStock.industry,
        ipo: 'N/A',
        weburl: 'https://nseindia.com'
      };
    }

    return { name: sym, exchange: 'NASDAQ', finnhubIndustry: 'Technology', ipo: 'N/A' };
  }

  async getQuote(symbol) {
    const sym = symbol.toUpperCase();
    
    // 1. Try Yahoo Finance first (gets live real-time feeds for US/Indian indices & equities)
    try {
      let yfSymbol = sym;
      if (yfSymbol === "NIFTY50") yfSymbol = "%5ENSEI";
      else if (yfSymbol === "BANKNIFTY") yfSymbol = "%5ENSEBANK";
      else if (yfSymbol === "NIFTYIT") yfSymbol = "%5ECNXIT";
      else if (yfSymbol === "NIFTYPHARMA") yfSymbol = "%5ECNXPHARMA";
      else if (yfSymbol === "NIFTYFMCG") yfSymbol = "%5ECNXFMCG";
      else if (yfSymbol === "NIFTYAUTO") yfSymbol = "%5ECNXAUTO";
      
      if (!yfSymbol.includes(".") && !yfSymbol.startsWith("%5E")) {
        const indianEquities = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS"];
        if (indianEquities.includes(yfSymbol)) {
          yfSymbol = `${yfSymbol}.NS`;
        }
      }

      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?interval=1d&range=5d`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      if (res.ok) {
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        if (result) {
          const meta = result.meta;
          const c = parseFloat((meta.regularMarketPrice || 0).toFixed(2));
          const pc = parseFloat((meta.previousClose || meta.chartPreviousClose || c).toFixed(2));
          const d = parseFloat((c - pc).toFixed(2));
          const dp = parseFloat((pc !== 0 ? (d / pc) * 100 : 0).toFixed(2));

          const quotes = result.indicators?.quote?.[0];
          const h = parseFloat((meta.regularMarketDayHigh || (quotes?.high ? Math.max(...quotes.high.filter(Boolean)) : c)).toFixed(2));
          const l = parseFloat((meta.regularMarketDayLow || (quotes?.low ? Math.min(...quotes.low.filter(Boolean)) : c)).toFixed(2));
          const o = parseFloat((meta.regularMarketOpen || (quotes?.open ? quotes.open[0] : c)).toFixed(2));

          const quote = { c, h, l, o, pc, d, dp };

          const dbStock = await stockModel.findBySymbol(sym);
          if (dbStock) {
            await stockModel.createOrUpdate({
              ...dbStock,
              price: c
            });
          }
          return quote;
        }
      }
    } catch (err) {
      console.error("Yahoo Finance fetch failed for", sym, err);
    }

    // 2. Try fetching from Finnhub API second
    try {
      const quote = await finnhubService.getQuote(sym);
      if (quote && quote.c !== 0 && quote.c !== null && quote.c !== undefined) {
        const dbStock = await stockModel.findBySymbol(sym);
        if (dbStock) {
          await stockModel.createOrUpdate({
            ...dbStock,
            price: quote.c
          });
        }
        return quote;
      }
    } catch (error) {}

    // 3. PostgreSQL Simulated DB Fallback
    const dbStock = await stockModel.findBySymbol(sym);
    if (dbStock) {
      const dev = (Math.random() - 0.5) * 4; 
      const currentPrice = parseFloat(dbStock.price) + dev;
      const prevClose = parseFloat(dbStock.price);
      const change = currentPrice - prevClose;
      const pct = (change / prevClose) * 100;

      return {
        c: currentPrice,
        h: currentPrice + Math.abs(dev),
        l: currentPrice - Math.abs(dev),
        o: prevClose,
        pc: prevClose,
        d: change,
        dp: pct
      };
    }

    return { c: 100, h: 102, l: 98, o: 99, pc: 99, d: 1, dp: 1.01 };
  }

  async getChartPoints(symbol) {
    const sym = symbol.toUpperCase();
    try {
      let yfSymbol = sym;
      if (yfSymbol === "NIFTY50") yfSymbol = "%5ENSEI";
      else if (yfSymbol === "BANKNIFTY") yfSymbol = "%5ENSEBANK";
      else if (yfSymbol === "NIFTYIT") yfSymbol = "%5ECNXIT";
      else if (yfSymbol === "NIFTYPHARMA") yfSymbol = "%5ECNXPHARMA";
      else if (yfSymbol === "NIFTYFMCG") yfSymbol = "%5ECNXFMCG";
      else if (yfSymbol === "NIFTYAUTO") yfSymbol = "%5ECNXAUTO";
      
      if (!yfSymbol.includes(".") && !yfSymbol.startsWith("%5E")) {
        const indianEquities = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS"];
        if (indianEquities.includes(yfSymbol)) {
          yfSymbol = `${yfSymbol}.NS`;
        }
      }

      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?interval=1h&range=5d`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      if (res.ok) {
        const json = await res.json();
        const quotes = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
        if (quotes && quotes.length > 0) {
          const cleanPoints = quotes
            .filter((p) => p !== null && p !== undefined)
            .map((p) => parseFloat(p.toFixed(2)));
          if (cleanPoints.length > 0) {
            const step = Math.max(1, Math.floor(cleanPoints.length / 12));
            const points = [];
            for (let i = 0; i < cleanPoints.length; i += step) {
              points.push(cleanPoints[i]);
            }
            return points.slice(-12);
          }
        }
      }
    } catch (e) {
      console.error("Yahoo Chart fetch failed for", sym, e);
    }
    
    return [100, 102, 101, 105, 104, 108, 107, 112].map(x => x * (1 + (Math.random() - 0.5) * 0.02));
  }

  async getDetail(symbol) {
    const sym = symbol.toUpperCase();
    let detail = null;

    // 1. Try Yahoo Finance first (real-time metrics, day ranges & 52-week ranges)
    try {
      let yfSymbol = sym;
      if (yfSymbol === "NIFTY50") yfSymbol = "%5ENSEI";
      else if (yfSymbol === "BANKNIFTY") yfSymbol = "%5ENSEBANK";
      else if (yfSymbol === "NIFTYIT") yfSymbol = "%5ECNXIT";
      else if (yfSymbol === "NIFTYPHARMA") yfSymbol = "%5ECNXPHARMA";
      else if (yfSymbol === "NIFTYFMCG") yfSymbol = "%5ECNXFMCG";
      else if (yfSymbol === "NIFTYAUTO") yfSymbol = "%5ECNXAUTO";
      
      if (!yfSymbol.includes(".") && !yfSymbol.startsWith("%5E")) {
        const indianEquities = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS"];
        if (indianEquities.includes(yfSymbol)) {
          yfSymbol = `${yfSymbol}.NS`;
        }
      }

      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?interval=1d&range=5d`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      if (res.ok) {
        const json = await res.json();
        const meta = json?.chart?.result?.[0]?.meta;
        if (meta) {
          const price = parseFloat((meta.regularMarketPrice || 0).toFixed(2));
          const name = meta.longName || meta.shortName || sym;
          const high = parseFloat((meta.regularMarketDayHigh || price).toFixed(2));
          const low = parseFloat((meta.regularMarketDayLow || price).toFixed(2));
          const volume = meta.regularMarketVolume || 0;
          const high52 = parseFloat((meta.fiftyTwoWeekHigh || price).toFixed(2));
          const low52 = parseFloat((meta.fiftyTwoWeekLow || price).toFixed(2));

          let sharesOutstanding = 100000000;
          let industry = "Financial Markets Index";
          let exchange = "National Stock Exchange (NSE)";
          let peRatio = 22.4;
          let divYield = 1.15;

          if (sym.startsWith("RELIANCE")) {
            sharesOutstanding = 6760000000;
            industry = "Oil & Gas / Conglomerate";
            peRatio = 26.5;
            divYield = 0.35;
          } else if (sym.startsWith("TCS")) {
            sharesOutstanding = 3660000000;
            industry = "IT Services & Consulting";
            peRatio = 30.1;
            divYield = 1.45;
          } else if (sym.startsWith("INFY")) {
            sharesOutstanding = 4150000000;
            industry = "IT Services & Consulting";
            peRatio = 24.8;
            divYield = 2.10;
          } else if (sym.startsWith("HDFCBANK")) {
            sharesOutstanding = 7590000000;
            industry = "Banking & Financial Services";
            peRatio = 18.2;
            divYield = 1.05;
          } else if (sym.startsWith("TATAMOTORS")) {
            sharesOutstanding = 3320000000;
            industry = "Automotive / Manufacturing";
            peRatio = 14.5;
            divYield = 0.60;
          }

          const marketCap = price * sharesOutstanding;

          detail = {
            symbol: sym,
            name,
            price,
            industry,
            exchange,
            high,
            low,
            volume,
            high52,
            low52,
            marketCap,
            peRatio,
            dividendYield: divYield
          };
        }
      }
    } catch (err) {
      console.error("Yahoo Finance getDetail failed", sym, err);
    }

    if (detail) return detail;

    // 2. Try fetching from Finnhub API second
    try {
      const profile = await finnhubService.getCompanyProfile(sym);
      const quote = await finnhubService.getQuote(sym);
      if (profile && profile.name && quote && quote.c) {
        return {
          symbol: sym,
          name: profile.name,
          price: quote.c,
          industry: profile.finnhubIndustry || 'Technology',
          exchange: profile.exchange || 'NASDAQ',
          high: quote.h || quote.c,
          low: quote.l || quote.c,
          volume: 500000,
          high52: quote.h * 1.2 || quote.c * 1.2,
          low52: quote.l * 0.8 || quote.c * 0.8,
          marketCap: quote.c * 50000000,
          peRatio: 25.0,
          dividendYield: 1.5
        };
      }
    } catch (e) {}

    // 3. Fall back to PostgreSQL DB
    const dbStock = await stockModel.findBySymbol(sym);
    if (dbStock) {
      return {
        ...dbStock,
        price: parseFloat(dbStock.price),
        high: parseFloat(dbStock.price) * 1.02,
        low: parseFloat(dbStock.price) * 0.98,
        volume: 1200000,
        high52: parseFloat(dbStock.price) * 1.3,
        low52: parseFloat(dbStock.price) * 0.75,
        marketCap: parseFloat(dbStock.price) * 40000000,
        peRatio: 20.0,
        dividendYield: 1.2
      };
    }

    // 4. Ultimate generic fallback
    return {
      symbol: sym,
      name: sym,
      price: 100.00,
      industry: 'Technology',
      exchange: 'NASDAQ',
      high: 102.00,
      low: 98.00,
      volume: 100000,
      high52: 130.00,
      low52: 70.00,
      marketCap: 10000000,
      peRatio: 18.0,
      dividendYield: 2.0
    };
  }
}

export default new StockService();
