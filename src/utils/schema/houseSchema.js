const joi = require('joi');

exports.houseSchema = joi.object({
  name: joi.string().required(),
  price: joi.required(),
  typeRent: joi.string().required(),
  description: joi.string().required(),
  amenities: joi.string().required(),
  address: joi.string().required(),
  bedroom: joi.number().required(),
  bathroom: joi.number().required(),
  area: joi.number().required(),
  city_id: joi.number(),
});

exports.editHouseSchema = joi.object({
  name: joi.string(),
  price: joi.number(),
  typeRent: joi.string(),
  description: joi.string(),
  amenities: joi.string(),
  address: joi.string(),
  bedroom: joi.number(),
  bathroom: joi.number(),
  area: joi.number(),
  city_id: joi.number(),
});
