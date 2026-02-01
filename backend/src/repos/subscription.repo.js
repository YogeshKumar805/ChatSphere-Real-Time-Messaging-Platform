import { pool } from "../config/db.js";

export const SubscriptionRepo = {
  async create({ userId, source, startsAt, endsAt, requestId=null }) {
    const [res] = await pool.query(
      `INSERT INTO subscriptions (user_id, source, starts_at, ends_at, request_id)
       VALUES (?,?,?,?,?)`,
      [userId, source, startsAt, endsAt, requestId]
    );
    return res.insertId;
  },

  async latestForUser(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id=? ORDER BY ends_at DESC LIMIT 1`, [userId]
    );
    return rows[0] || null;
  }
};
