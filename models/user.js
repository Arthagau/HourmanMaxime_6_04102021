const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
/* plugin mongoose pour vérifier qu'un élément est unique, ici on vérifie si l'email existe déjà*/

/* Utilisation de mongoose et de sa méthode Schema pour créer un schéma de données
que l'on exporte ensuite en tant que modèle pour l'utiliser dans notre application*/

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
