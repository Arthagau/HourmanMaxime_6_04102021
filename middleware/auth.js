const jsonToken = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jsonToken.verify(token, process.env.SECRET_TOKEN);
    const userId = decodedToken.userId;
    req.userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw "User ID non valable !";
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error("Requête non authentifiée !"),
    });
  }
};
