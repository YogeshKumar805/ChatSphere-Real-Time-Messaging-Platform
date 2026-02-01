import { verifyAccessToken } from "../utils/jwt.js";
import { UserRepo } from "../repos/user.repo.js";

export function requireAuth() {
  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ message: "Missing token" });
      const payload = verifyAccessToken(token);
      const user = await UserRepo.getById(payload.sub);
      if (!user) return res.status(401).json({ message: "Invalid token user" });
      req.user = user;
      next();
    } catch (e) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role_name)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

/**
 * Access gate: user must be active (trial or subscription valid), else blocked
 * Admin bypass.
 */
export function requireActiveAccess() {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role_name === "admin") return next();
    if (req.user.status !== "active") return res.status(402).json({ message: "Plan expired or access not active", status: req.user.status });
    next();
  };
}
