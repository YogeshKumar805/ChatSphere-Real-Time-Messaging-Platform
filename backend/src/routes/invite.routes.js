import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireActiveAccess } from "../middleware/requireActiveAccess.js";
import { generateInvite, myInvites } from "../controllers/invite.controller.js";

export const inviteRouter = Router();

// ✅ Users (active) + Admin can generate invite and view their own invites
inviteRouter.post("/generate", requireAuth, requireActiveAccess, generateInvite);
inviteRouter.get("/me", requireAuth, requireActiveAccess, myInvites);
