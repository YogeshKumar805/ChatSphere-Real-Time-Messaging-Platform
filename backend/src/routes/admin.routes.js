import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

export const adminRouter = Router();

adminRouter.use(requireAuth(), requireRole("admin"));

adminRouter.get("/dashboard", AdminController.dashboard);
adminRouter.get("/requests/pending", AdminController.pendingRequests);
adminRouter.post("/requests/:id/approve", AdminController.approveRequest);
adminRouter.patch("/users/:id/block", AdminController.blockUser);
