import { ChatService } from "../services/chat.service.js";

const onlineUsers = new Map(); // userId -> socketId

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    const userId = socket.user.id;

    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);

    io.emit("presence:online", { userId });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("presence:offline", { userId });
    });

    // typing indicator
    socket.on("typing:start", ({ chatId, toUserId }) => {
      io.to(`user:${toUserId}`).emit("typing:start", { chatId, fromUserId: userId });
    });
    socket.on("typing:stop", ({ chatId, toUserId }) => {
      io.to(`user:${toUserId}`).emit("typing:stop", { chatId, fromUserId: userId });
    });

    // messaging
    socket.on("message:send", async ({ chatId, toUserId, body }, cb) => {
      try {
        const msg = await ChatService.sendMessage(chatId, userId, body);
        io.to(`user:${toUserId}`).emit("message:new", msg);
        io.to(`user:${userId}`).emit("message:new", msg); // echo
        cb?.({ ok: true, message: msg });
      } catch (e) {
        cb?.({ ok: false, error: e.message });
      }
    });

    // WebRTC signaling (audio/video)
    socket.on("call:offer", ({ toUserId, chatId, sdp }, cb) => {
      io.to(`user:${toUserId}`).emit("call:offer", { fromUserId: userId, chatId, sdp });
      cb?.({ ok: true });
    });

    socket.on("call:answer", ({ toUserId, chatId, sdp }, cb) => {
      io.to(`user:${toUserId}`).emit("call:answer", { fromUserId: userId, chatId, sdp });
      cb?.({ ok: true });
    });

    socket.on("call:ice", ({ toUserId, chatId, candidate }, cb) => {
      io.to(`user:${toUserId}`).emit("call:ice", { fromUserId: userId, chatId, candidate });
      cb?.({ ok: true });
    });

    socket.on("call:end", ({ toUserId, chatId }, cb) => {
      io.to(`user:${toUserId}`).emit("call:end", { fromUserId: userId, chatId });
      cb?.({ ok: true });
    });
  });
}
