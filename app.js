const express = require("express");
const mongoose = require("mongoose"); // permet d'intéragir plus facilement avec la base de données sur MongoDB
const helmet = require("helmet"); // permet de sécuriser l'application en mettant en place des headers HTTP
const path = require("path"); // permet de travailler avec des fichiers et répertoires
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
require("dotenv").config(); // permet de mettre en place des variables d'environnement, ici pour se connecter à mongoDB

mongoose
  .connect(process.env.MY_MONGO_DB, {
    // penser à bien remplacer la clé MY_MONGO_DB dans le fichier .env par votre lien de connexion
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

app.use(helmet());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

module.exports = app;
