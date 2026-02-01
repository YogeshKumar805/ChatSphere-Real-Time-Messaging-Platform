import { ChatService } from "../services/chat.service.js";

export const ChatController = {
  async getOrCreateDirect(req, res, next) {
    try {
      const otherUserId = Number(req.params.userId);
      const out = await ChatService.getOrCreateDirectChat(req.user.id, otherUserId);
      res.json(out);
    } catch (e) { next(e); }
  },

  async listMyChats(req, res, next) {
    try {
      const rows = await ChatService.listMyChats(req.user.id);
      res.json(rows);
    } catch (e) { next(e); }
  },

  async listMessages(req, res, next) {
    try {
      const chatId = Number(req.params.chatId);
      const limit = Number(req.query.limit || 50);
      const beforeId = req.query.beforeId ? Number(req.query.beforeId) : null;
      const rows = await ChatService.listMessages(chatId, limit, beforeId);
      res.json(rows);
    } catch (e) { next(e); }
  }
};
