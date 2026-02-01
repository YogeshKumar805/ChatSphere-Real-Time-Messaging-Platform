import { Router } from "express";
import { requireAuth, requireActiveAccess } from "../middlewares/auth.middleware.js";
import { UserController } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/", requireAuth(), requireActiveAccess(), UserController.listUsers);

userRouter.get(
  "/me/invited-count",
  requireAuth(),
  requireActiveAccess(),
  UserController.myInvitedCount
);
