import { RequestRepo } from "../repos/request.repo.js";

export const RequestService = {
  async createAccessRequest(userId) {
    const id = await RequestRepo.create(userId);
    return { requestId: id };
  }
};
