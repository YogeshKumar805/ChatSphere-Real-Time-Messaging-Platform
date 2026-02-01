export function requireActiveAccess(req, res, next) {
  const user = req.user;

  // Admin always allowed
  if (user?.role_name === "admin") return next();

  // Normal users must be active
  if (user?.status === "active") return next();

  // If expired -> redirect user to expired UI
  if (user?.status === "expired") {
    return res.status(402).json({ message: "Access expired" });
  }

  // pending/blocked/anything else
  return res.status(403).json({ message: "Unauthorized" });
}
