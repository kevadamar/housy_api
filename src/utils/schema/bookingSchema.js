const joi = require('joi');

exports.createBookingSchema = joi.object({
  checkin: joi.date().required(),
  checkout: joi.date().required(),
  total: joi.number().required(),
  status: joi.number().required(),
  house_id: joi.number().required(),
});

exports.editBookingSchema = joi.object({
  checkin: joi.date(),
  checkout: joi.date(),
  total: joi.number(),
  status: joi.number(),
  house_id: joi.number(),
});
