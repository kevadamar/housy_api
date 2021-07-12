const joi = require('joi');

exports.passwordSchema = joi.object({
  password: joi.string().min(8).required(),
});
