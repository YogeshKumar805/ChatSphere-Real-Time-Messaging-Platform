import { RequestService } from "../services/request.service.js";

export const RequestController = {
  async create(req, res, next) {
    try {
      const out = await RequestService.createAccessRequest(req.user.id);
      res.status(201).json(out);
    } catch (e) { next(e); }
  }
};
