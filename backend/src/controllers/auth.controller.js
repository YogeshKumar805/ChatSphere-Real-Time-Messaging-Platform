import { AuthService } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../validators/auth.schemas.js";

export const AuthController = {
  async register(req, res, next) {
    try {
      const { value, error } = registerSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.message });
      const out = await AuthService.register(value);
      res.status(201).json(out);
    } catch (e) { next(e); }
  },

  async login(req, res, next) {
    try {
      const { value, error } = loginSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.message });
      const out = await AuthService.login(value.email, value.password);
      res.json(out);
    } catch (e) { next(e); }
  }
};
