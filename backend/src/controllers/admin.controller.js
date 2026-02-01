import { AdminService } from "../services/admin.service.js";
import { approveRequestSchema, blockUserSchema } from "../validators/admin.schemas.js";

export const AdminController = {
  async dashboard(req, res, next) {
    try {
      const data = await AdminService.dashboard();
      res.json(data);
    } catch (e) { next(e); }
  },

  async pendingRequests(req, res, next) {
    try {
      const rows = await AdminService.listPendingRequests();
      res.json(rows);
    } catch (e) { next(e); }
  },

  async approveRequest(req, res, next) {
    try {
      const { value, error } = approveRequestSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.message });
      const requestId = Number(req.params.id);
      const out = await AdminService.approveRequest({ requestId, adminId: req.user.id, ...value });
      res.json(out);
    } catch (e) { next(e); }
  },

  async blockUser(req, res, next) {
    try {
      const { value, error } = blockUserSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.message });
      const userId = Number(req.params.id);
      const out = await AdminService.blockUser(userId, value.blocked);
      res.json(out);
    } catch (e) { next(e); }
  }
};
