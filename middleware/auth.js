const jsonToken = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).send("Accès refusé !");

  try {
    const verified = jsonToken.verify(token, process.env.SECRET_TOKEN);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Unauthorized request" });
  }
};
