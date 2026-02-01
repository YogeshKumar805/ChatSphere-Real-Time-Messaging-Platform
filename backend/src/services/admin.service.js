import { UserRepo } from "../repos/user.repo.js";
import { RequestRepo } from "../repos/request.repo.js";
import { SubscriptionRepo } from "../repos/subscription.repo.js";
import { addDuration, toMysqlDateTime } from "../utils/time.js";

export const AdminService = {
  async dashboard() {
    const counts = await UserRepo.countByStatus();
    const pendingRequests = await RequestRepo.countPending();
    return {
      totalUsers: Number(counts.total || 0),
      activeUsers: Number(counts.active || 0),
      expiredUsers: Number(counts.expired || 0),
      pendingUsers: Number(counts.pending || 0),
      blockedUsers: Number(counts.blocked || 0),
      pendingRequests: Number(pendingRequests || 0)
    };
  },

  async listPendingRequests() {
    return RequestRepo.listPending();
  },

  async approveRequest({ requestId, adminId, duration, note }) {
    const req = await RequestRepo.getById(requestId);
    if (!req) throw Object.assign(new Error("Request not found"), { status: 404 });
    if (req.status !== "pending") throw Object.assign(new Error("Request already processed"), { status: 400 });

    await RequestRepo.approve(requestId, adminId, duration, note);

    const now = new Date();
    const ends = addDuration(now, duration);

    await SubscriptionRepo.create({
      userId: req.user_id,
      source: "admin_approval",
      startsAt: toMysqlDateTime(now),
      endsAt: toMysqlDateTime(ends),
      requestId
    });

    // Activate user until ends
    await UserRepo.setStatusAndAccessEnds(req.user_id, "active", toMysqlDateTime(ends));
    return { ok: true, endsAt: ends.toISOString() };
  },

  async blockUser(userId, blocked=true) {
    await UserRepo.setBlocked(userId, blocked);
    return { ok: true };
  }
};
