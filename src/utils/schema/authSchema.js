const joi = require('joi');

exports.registerSchema = joi.object({
  fullname: joi.string().min(3).required(),
  username: joi.string().min(3).required(),
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  role_id: joi.number().required(),
  gender: joi.string().required(),
  phone_number: joi.string().max(20).required(),
  address: joi.string().required(),
});

exports.loginSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().min(8).required(),
});
