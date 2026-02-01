import { Router } from "express";
import { requireAuth, requireActiveAccess } from "../middlewares/auth.middleware.js";
import { InviteController } from "../controllers/invite.controller.js";

export const inviteRouter = Router();

inviteRouter.post(
  "/generate",
  requireAuth(),
  requireActiveAccess(),
  InviteController.generate
);

inviteRouter.get(
  "/me",
  requireAuth(),
  requireActiveAccess(),
  InviteController.myInvites
);
