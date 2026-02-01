import { pool } from "../config/db.js";

export const UserRepo = {
  async getByEmail(email) {
    const [rows] = await pool.query(
      `SELECT u.*, r.name AS role_name
       FROM users u JOIN roles r ON r.id=u.role_id
       WHERE u.email=? LIMIT 1`, [email]
    );
    return rows[0] || null;
  },

  async getById(id) {
    const [rows] = await pool.query(
      `SELECT u.*, r.name AS role_name
       FROM users u JOIN roles r ON r.id=u.role_id
       WHERE u.id=? LIMIT 1`, [id]
    );
    return rows[0] || null;
  },

  async createUser({ roleId, email, passwordHash, name, invitedByUserId, trialEndsAt }) {
    const [res] = await pool.query(
      `INSERT INTO users (role_id,email,password_hash,name,status,invited_by_user_id,trial_ends_at,access_ends_at)
       VALUES (?,?,?,?, 'active', ?, ?, ?)`,
      [roleId, email, passwordHash, name, invitedByUserId || null, trialEndsAt, trialEndsAt]
    );
    return res.insertId;
  },

  async listUsersBasic() {
    const [rows] = await pool.query(
      `SELECT id, name, email, status, trial_ends_at, access_ends_at, invited_by_user_id, created_at
       FROM users WHERE 1=1 ORDER BY created_at DESC`
    );
    return rows;
  },

  async setStatusAndAccessEnds(userId, status, accessEndsAt) {
    await pool.query(
      `UPDATE users SET status=?, access_ends_at=? WHERE id=?`,
      [status, accessEndsAt, userId]
    );
  },

  async setBlocked(userId, blocked) {
    const status = blocked ? "blocked" : "expired";
    await pool.query(`UPDATE users SET status=? WHERE id=?`, [status, userId]);
  },

  async countByStatus() {
    const [rows] = await pool.query(
      `SELECT 
        SUM(1) AS total,
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status='expired' THEN 1 ELSE 0 END) AS expired,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status='blocked' THEN 1 ELSE 0 END) AS blocked
       FROM users`
    );
    return rows[0];
  },

  async countMyInvitedUsers(userId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM users WHERE invited_by_user_id=?`, [userId]
    );
    return rows[0]?.cnt || 0;
  },

  async setExpiredIfPastAccess(now) {
    // mark users (non-admin) as expired if access_ends_at < now and currently active
    await pool.query(
      `UPDATE users u
       JOIN roles r ON r.id=u.role_id
       SET u.status='expired'
       WHERE r.name='user'
         AND u.status='active'
         AND u.access_ends_at IS NOT NULL
         AND u.access_ends_at < ?`,
      [now]
    );
  }
};
