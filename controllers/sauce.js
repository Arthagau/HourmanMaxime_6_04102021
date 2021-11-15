const Sauce = require("../models/sauce"); // on récupère le modèle Sauce précédemment crée
const fs = require("fs"); // permet de supprimer le fichier image lors du delete

/* Ici on expose les logiques métiers des routes sauce en tant que fonctions
cela permet de mieux comprendre la fonction pour chaque route */

exports.getAllSauces = (req, res, next) => {
  // permet de récupérer toutes les sauces dans notre base de données
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  // permet de récupérer une sauce spécifique dans notre base de données
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
  // permet de créer une sauce et de la sauvegarder dans notre base de données
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    // on crée une instance du modèle Sauce avec un objet Javascript contenant toutes les infos requises du corps de requête
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [" "],
    usersdisLiked: [" "],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce created !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  // permet de mettre à jour une sauce
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(res.status(200).json({ message: "Sauce modified" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  // permet de supprimer une sauce dans notre base de données
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(res.status(200).json({ message: "Sauce deleted" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  // permet d'ajouter les like et dislike d'une sauce dans la base de données
  const like = req.body.like;
  const userId = req.body.userId;
  const sauceId = req.params.id;

  switch (like) {
    case 1:
      Sauce.findOne({ _id: sauceId }).then((sauce) => {
        if (
          // si l'utilisateur a déjà liké la sauce il ne peut pas en rajouter
          sauce.usersDisliked.includes(userId) ||
          sauce.usersLiked.includes(userId)
        ) {
          res.status(400).json({ message: "Already liked !" });
        } else {
          // sinon on incrémente de un l'array des likes dans la base de données
          Sauce.updateOne(
            { _id: sauceId },
            { $push: { usersLiked: userId }, $inc: { likes: +1 } }
          )
            .then(() => res.status(200).json({ message: "Liked" }))
            .catch((error) => res.status(400).json({ error }));
        }
      });
      break;

    case -1:
      Sauce.findOne({ _id: sauceId }).then((sauce) => {
        if (
          // si l'utilisateur a déjà dislike la sauce il ne peut pas en rajouter
          sauce.usersLiked.includes(userId) ||
          sauce.usersDisliked.includes(userId)
        ) {
          res.status(400).json({ message: "Already disliked !" });
        } else {
          // sinon on incrémente de un l'array des dislikes dans la base de données
          Sauce.updateOne(
            { _id: sauceId },
            { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } }
          )
            .then(() => res.status(200).json({ message: "Disliked" }))
            .catch((error) => res.status(400).json({ error }));
        }
      });
      break;

    case 0:
      // permet à l'utilisateur de retirer son like ou son dislike
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauceId },
              { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
            )
              .then(() => res.status(200).json({ message: `Like removed` }))
              .catch((error) => res.status(400).json({ error }));
          }
          if (sauce.usersDisliked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauceId },
              { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
            )
              .then(() => res.status(200).json({ message: `Dislike removed` }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(404).json({ error }));
      break;

    default:
      res.status(400).json({ error: "Bad request" });
  }
};
