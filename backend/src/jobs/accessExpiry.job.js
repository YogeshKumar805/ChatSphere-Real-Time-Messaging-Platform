import { UserRepo } from "../repos/user.repo.js";

export function startAccessExpiryJob() {
  // every 60 seconds in this scaffold
  setInterval(async () => {
    try {
      const now = new Date();
      await UserRepo.setExpiredIfPastAccess(now);
    } catch (e) {
      console.error("Expiry job error:", e);
    }
  }, 60_000);
}
