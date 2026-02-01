import { pool } from "../config/db.js";

export const RequestRepo = {
  async create(userId) {
    // prevent duplicates: if pending exists, return it
    const [existing] = await pool.query(
      `SELECT * FROM access_requests WHERE user_id=? AND status='pending' LIMIT 1`,
      [userId]
    );
    if (existing[0]) return existing[0].id;

    const [res] = await pool.query(
      `INSERT INTO access_requests (user_id,status) VALUES (?, 'pending')`,
      [userId]
    );
    return res.insertId;
  },

  async listPending() {
    const [rows] = await pool.query(
      `SELECT ar.*, u.email, u.name
       FROM access_requests ar
       JOIN users u ON u.id=ar.user_id
       WHERE ar.status='pending'
       ORDER BY ar.requested_at DESC`
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`SELECT * FROM access_requests WHERE id=? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async approve(id, adminId, duration, note) {
    await pool.query(
      `UPDATE access_requests
       SET status='approved', decided_at=NOW(), decided_by_admin_id=?, duration=?, note=?
       WHERE id=? AND status='pending'`,
      [adminId, duration, note || null, id]
    );
  },

  async countPending() {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM access_requests WHERE status='pending'`
    );
    return rows[0]?.cnt || 0;
  }
};
