import finnhub from 'finnhub';

const finnhubClient = new finnhub.DefaultApi(process.env.FINNHUB_API_KEY);


export const getQuote = (symbol) => {
  return new Promise((resolve, reject) => {
    finnhubClient.quote(symbol, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};


export const getStockCandles = (symbol, resolution, from, to) => {
  return new Promise((resolve, reject) => {
    finnhubClient.stockCandles(symbol, resolution, from, to, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};


export const getCompanyNews = (symbol, from, to) => {
  return new Promise((resolve, reject) => {
    finnhubClient.companyNews(symbol, from, to, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};


export const getCompanyProfile = (symbol) => {
  return new Promise((resolve, reject) => {
    finnhubClient.companyProfile2({ symbol }, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};

export const getGeneralNews = () => {
  return new Promise((resolve, reject) => {
    finnhubClient.marketNews('general', {}, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};
