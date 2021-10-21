const bcrypt = require("bcrypt");
const User = require("../models/user");
const jsonToken = require("jsonwebtoken");
const { userValidation } = require("../middleware/validation");
require("dotenv").config();

exports.signup = async (req, res, next) => {
  const { error } = userValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).json({ message: "Email déjà utilisée !" });

  const salt = await bcrypt.genSaltSync(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    user.save();
    res.status(201).json({ message: "Utilisateur crée !" });
  } catch (err) {
    res.status(400).json({ err: "Utilisateur déjà crée" });
  }
};

exports.login = async (req, res, next) => {
  const { error } = userValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ message: "Utilisateur non trouvé !" });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "Mot de passe incorrect !" });

  res.status(200).json({
    userId: user._id,
    token: jsonToken.sign({ userId: user._id }, process.env.SECRET_TOKEN, {
      expiresIn: "24h",
    }),
  });
};
