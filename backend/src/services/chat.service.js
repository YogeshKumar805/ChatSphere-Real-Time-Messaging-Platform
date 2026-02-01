import { ChatRepo, MessageRepo } from "../repos/chat.repo.js";

export const ChatService = {
  async getOrCreateDirectChat(userId, otherUserId) {
    let chatId = await ChatRepo.findDirectChat(userId, otherUserId);
    if (!chatId) chatId = await ChatRepo.createDirectChat(userId, otherUserId);
    return { chatId };
  },

  async listMyChats(userId) {
    return ChatRepo.listMyChats(userId);
  },

  async listMessages(chatId, limit, beforeId) {
    return MessageRepo.listMessages(chatId, limit, beforeId);
  },

  async sendMessage(chatId, senderId, body) {
    return MessageRepo.createMessage(chatId, senderId, body);
  }
};
