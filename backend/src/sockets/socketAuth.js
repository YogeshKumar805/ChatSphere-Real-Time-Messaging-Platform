import { verifyAccessToken } from "../utils/jwt.js";
import { UserRepo } from "../repos/user.repo.js";

export async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing token"));
    const payload = verifyAccessToken(token);
    const user = await UserRepo.getById(payload.sub);
    if (!user) return next(new Error("Invalid user"));
    socket.user = user;
    next();
  } catch (e) {
    next(new Error("Unauthorized"));
  }
}
