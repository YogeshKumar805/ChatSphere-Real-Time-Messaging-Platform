import { pool } from "../config/db.js";

export const InviteRepo = {
  async create(code, generatedByUserId, expiresAt=null) {
    const [res] = await pool.query(
      `INSERT INTO invite_codes (code, generated_by_user_id, expires_at) VALUES (?,?,?)`,
      [code, generatedByUserId, expiresAt]
    );
    return res.insertId;
  },

  async getByCode(code) {
    const [rows] = await pool.query(
      `SELECT * FROM invite_codes WHERE code=? LIMIT 1`, [code]
    );
    return rows[0] || null;
  },

  async markUsed(inviteId, usedByUserId) {
    await pool.query(
      `UPDATE invite_codes SET is_used=TRUE, used_by_user_id=?, used_at=NOW() WHERE id=? AND is_used=FALSE`,
      [usedByUserId, inviteId]
    );
  },

  async listGeneratedBy(userId) {
    const [rows] = await pool.query(
      `SELECT id, code, is_used, used_by_user_id, created_at, used_at
       FROM invite_codes WHERE generated_by_user_id=? ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }
};
