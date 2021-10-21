const Joi = require("@hapi/joi");

const userValidation = (data) => {
  const userValidationSchema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(4).required(),
  });
  return userValidationSchema.validate(data);
};

module.exports.userValidation = userValidation;
