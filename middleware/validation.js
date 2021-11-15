const Joi = require("@hapi/joi"); // permet de valider les données envoyés par l'utilsateur

const userValidation = (data) => {
  const userValidationSchema = Joi.object({
    email: Joi.string().min(6).required().email(), // on vérifie ici que l'email rentré par l'utilisateur est bien une adresse email
    password: Joi.string().min(4).required(), // on vérifie que le mot de passe a au moins 4 caractères
  });
  return userValidationSchema.validate(data);
};

module.exports.userValidation = userValidation;
