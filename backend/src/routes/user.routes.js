import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireActiveAccess } from "../middleware/requireActiveAccess.js";
import {
  listUsers,
  invitedCount,
  // ...other controllers
} from "../controllers/user.controller.js";

export const userRouter = Router();

// ✅ allow active users
userRouter.get("/", requireAuth, requireActiveAccess, listUsers);

userRouter.get(
  "/me/invited-count",
  requireAuth,
  requireActiveAccess,
  invitedCount
);
