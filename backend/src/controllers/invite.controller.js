import { InviteService } from "../services/invite.service.js";

export const InviteController = {
  async generate(req, res, next) {
    try {
      const code = await InviteService.generateInvite(req.user.id);
      res.status(201).json({ code });
    } catch (e) { next(e); }
  },

  async myInvites(req, res, next) {
    try {
      const rows = await InviteService.myInvites(req.user.id);
      res.json(rows);
    } catch (e) { next(e); }
  }
};
