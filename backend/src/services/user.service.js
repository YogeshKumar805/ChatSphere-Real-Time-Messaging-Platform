import { UserRepo } from "../repos/user.repo.js";

export const UserService = {
  async listUsers() {
    const rows = await UserRepo.listUsersBasic();
    return rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      trialEndsAt: u.trial_ends_at,
      accessEndsAt: u.access_ends_at,
      invitedByUserId: u.invited_by_user_id,
      createdAt: u.created_at
    }));
  },

  async myInvitedCount(userId) {
    const cnt = await UserRepo.countMyInvitedUsers(userId);
    return { count: Number(cnt) };
  }
};
