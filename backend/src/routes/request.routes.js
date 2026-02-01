import { Router } from "express";
import { RequestController } from "../controllers/request.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const requestRouter = Router();

// User can request even if expired (so only require auth)
requestRouter.use(requireAuth());

requestRouter.post("/", RequestController.create);
