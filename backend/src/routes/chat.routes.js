import { Router } from "express";
import { ChatController } from "../controllers/chat.controller.js";
import { requireAuth, requireActiveAccess } from "../middlewares/auth.middleware.js";

export const chatRouter = Router();

chatRouter.use(requireAuth(), requireActiveAccess());

chatRouter.post("/direct/:userId", ChatController.getOrCreateDirect);
chatRouter.get("/my", ChatController.listMyChats);
chatRouter.get("/:chatId/messages", ChatController.listMessages);
