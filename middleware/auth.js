const jsonToken = require("jsonwebtoken");
require("dotenv").config(); // permet de mettre en place des variables d'environnement, qui sert ici à utiliser une chaine secrète

module.exports = function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1]; // on extraie le token du header Authorization
    const verified = jsonToken.verify(token, process.env.SECRET_TOKEN); // on décode le token, si celui-ci n'est pas valide, on génère une erreur
    const userId = verified.userId; // on extraie l'userId du token
    if (req.body.userId && req.body.userId !== userId) {
      throw "Invalid user ID";
    } else {
      next();
    }
  } catch (err) {
    res.status(403).json({ error: "Unauthorized request" });
  }
};
