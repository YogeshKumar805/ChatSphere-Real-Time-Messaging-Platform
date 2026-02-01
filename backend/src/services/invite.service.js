import crypto from "crypto";
import { InviteRepo } from "../repos/invite.repo.js";

export const InviteService = {
  async generateInvite(generatedByUserId) {
    const code = crypto.randomBytes(16).toString("hex"); // 32 chars
    await InviteRepo.create(code, generatedByUserId, null);
    return code;
  },

  async myInvites(userId) {
    return InviteRepo.listGeneratedBy(userId);
  }
};
