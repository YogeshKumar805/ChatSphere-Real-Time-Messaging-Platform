import { pool } from "../config/db.js";

export const ChatRepo = {
  async findDirectChat(userA, userB) {
    const [rows] = await pool.query(
      `SELECT c.id
       FROM chats c
       JOIN chat_participants p1 ON p1.chat_id=c.id AND p1.user_id=?
       JOIN chat_participants p2 ON p2.chat_id=c.id AND p2.user_id=?
       WHERE c.type='direct'
       LIMIT 1`,
      [userA, userB]
    );
    return rows[0]?.id || null;
  },

  async createDirectChat(userA, userB) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [res] = await conn.query(`INSERT INTO chats (type) VALUES ('direct')`);
      const chatId = res.insertId;
      await conn.query(`INSERT INTO chat_participants (chat_id, user_id) VALUES (?,?), (?,?)`, [chatId, userA, chatId, userB]);
      await conn.commit();
      return chatId;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  async listMyChats(userId) {
    const [rows] = await pool.query(
      `SELECT c.id, c.type, c.created_at
       FROM chats c
       JOIN chat_participants cp ON cp.chat_id=c.id
       WHERE cp.user_id=?
       ORDER BY c.created_at DESC`, [userId]
    );
    return rows;
  }
};

export const MessageRepo = {
  async listMessages(chatId, limit=50, beforeId=null) {
    const params=[chatId];
    let where = "";
    if (beforeId) { where = "AND id < ?"; params.push(beforeId); }
    params.push(Number(limit));
    const [rows] = await pool.query(
      `SELECT id, chat_id, sender_id, body, type, created_at, delivered_at, read_at
       FROM messages
       WHERE chat_id=? ${where}
       ORDER BY id DESC
       LIMIT ?`, params
    );
    return rows.reverse();
  },

  async createMessage(chatId, senderId, body) {
    const [res] = await pool.query(
      `INSERT INTO messages (chat_id, sender_id, body, type) VALUES (?,?,?, 'text')`,
      [chatId, senderId, body]
    );
    const [rows] = await pool.query(`SELECT * FROM messages WHERE id=?`, [res.insertId]);
    return rows[0];
  }
};
