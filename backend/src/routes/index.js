import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { adminRouter } from "./admin.routes.js";
import { userRouter } from "./user.routes.js";
import { chatRouter } from "./chat.routes.js";
import { requestRouter } from "./request.routes.js";
import { inviteRouter } from "./invite.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/requests", requestRouter);
apiRouter.use("/invites", inviteRouter);
