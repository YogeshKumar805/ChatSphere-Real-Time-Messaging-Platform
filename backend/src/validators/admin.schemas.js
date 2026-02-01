import Joi from "joi";

export const approveRequestSchema = Joi.object({
  duration: Joi.string().valid("1_day","7_days","1_month","3_months").required(),
  note: Joi.string().max(500).allow("", null)
});

export const blockUserSchema = Joi.object({
  blocked: Joi.boolean().required()
});
