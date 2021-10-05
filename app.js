const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userRoutes = require("./routes/user");

app.use("api/auth", userRoutes);

mongoose
  .connect(
    "mongodb+srv://admin:jJDDatrmZQrUWgYe@cluster0.rk7en.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

module.exports = app;
