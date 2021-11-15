const bcrypt = require("bcrypt"); // permet de chiffrer le mot de passe
const User = require("../models/user");
const jsonToken = require("jsonwebtoken"); // permet de créer un token d'authentification lié à l'utilisateur et de vérifier que la requête est authentifiée
const { userValidation } = require("../middleware/validation"); // permet de valider les données envoyés par l'utilsateur
require("dotenv").config();

exports.signup = async (req, res, next) => {
  const { error } = userValidation(req.body); // on vérifie ici que les éléments envoyés par l'utilisateur sont valides
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email: req.body.email }); // on vérifie dans la base de données si l'email existe déjà
  if (emailExist)
    return res.status(400).json({ message: "Email already used !" });

  // on utilise ici la méthode hash de bcrypt pour saler le mot de passe
  bcrypt.hash(req.body.password, 10).then((hash) => {
    // on crée ensuite l'utilisateur et on l'enregistre dans notre base de données
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then(() => res.status(201).json({ message: "User created !" }))
      .catch((error) => res.status(400).json({ error }));
  });
};

exports.login = async (req, res, next) => {
  const { error } = userValidation(req.body); // on vérifie ici que les éléments envoyés par l'utilisateur sont valides
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email }); // on vérifie dans la base de données si l'utilisateur existe déjà
  if (!user) return res.status(400).json({ message: "User not found !" });

  const validPassword = await bcrypt.compare(req.body.password, user.password); // on utilise la fonction compare de bcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données
  if (!validPassword)
    return res.status(400).json({ message: "Incorrect password !" });

  res.status(200).json({
    // si tous les éléments correspondent on renvoie en réponse l'id de l'utilisateur et le token
    userId: user._id,
    token: jsonToken.sign({ userId: user._id }, process.env.SECRET_TOKEN, {
      // on encode ici un nouveau token avec l'id de l'utilisateur et une chaine secrète
      expiresIn: "24h",
    }),
  });
};
