import pool from '../config/database.js';

class StockModel {
  async search(queryStr) {
    const query = `
      SELECT symbol, name, price, industry, exchange
      FROM stocks
      WHERE symbol ILIKE $1 OR name ILIKE $1
    `;
    const { rows } = await pool.query(query, [`%${queryStr}%`]);
    return rows;
  }

  async listAll() {
    const query = `
      SELECT symbol, name, price, industry, exchange
      FROM stocks
      ORDER BY symbol ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async findBySymbol(symbol) {
    const query = `
      SELECT symbol, name, price, industry, exchange
      FROM stocks
      WHERE symbol = $1
    `;
    const { rows } = await pool.query(query, [symbol.toUpperCase()]);
    return rows[0] || null;
  }

  async createOrUpdate({ symbol, name, price, industry, exchange }) {
    const query = `
      INSERT INTO stocks (symbol, name, price, industry, exchange)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (symbol) DO UPDATE
      SET name = EXCLUDED.name,
          price = EXCLUDED.price,
          industry = EXCLUDED.industry,
          exchange = EXCLUDED.exchange
      RETURNING symbol, name, price, industry, exchange
    `;
    const { rows } = await pool.query(query, [symbol.toUpperCase(), name, price, industry, exchange]);
    return rows[0];
  }
}

export default new StockModel();
