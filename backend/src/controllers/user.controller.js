import { UserService } from "../services/user.service.js";

export const UserController = {
  async listUsers(req, res, next) {
    try {
      const rows = await UserService.listUsers();
      res.json(rows);
    } catch (e) { next(e); }
  },

  async myInvitedCount(req, res, next) {
    try {
      const out = await UserService.myInvitedCount(req.user.id);
      res.json(out);
    } catch (e) { next(e); }
  }
};
