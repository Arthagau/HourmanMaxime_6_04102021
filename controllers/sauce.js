const Sauce = require("../models/sauce");
const fs = require("fs");
const sauce = require("../models/sauce");

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
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
    .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const userId = req.body.userId;
  const sauceObject = req.file // TODO vérifier que la sauce appartienne à l'user
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  if (sauceObject.userId == userId) {
    Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    )
      .then(res.status(200).json({ message: "Sauce modifiée" }))
      .catch((error) => res.status(400).json({ error }));
  } else {
    res.status(400).json({ message: "Unauthorized !" });
  }
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(res.status(200).json({ message: "Sauce supprimée" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  const like = req.body.like;
  const userId = req.body.userId;
  const sauceId = req.params.id;

  switch (like) {
    case 1:
      Sauce.findOne({ _id: sauceId }).then((sauce) => {
        if (
          sauce.usersDisliked.includes(userId) ||
          sauce.usersLiked.includes(userId)
        ) {
          res.status(400).json({ message: "Déjà liké !" });
        } else {
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
          sauce.usersLiked.includes(userId) ||
          sauce.usersDisliked.includes(userId)
        ) {
          res.status(400).json({ message: "Déjà disliké !" });
        } else {
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
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauceId },
              { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
            )
              .then(() => res.status(200).json({ message: `Like retiré` }))
              .catch((error) => res.status(400).json({ error }));
          }
          if (sauce.usersDisliked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauceId },
              { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
            )
              .then(() => res.status(200).json({ message: `Dislike retiré` }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(404).json({ error }));
      break;

    default:
      res.status(400).json({ error: "Bad request" });
  }
};
