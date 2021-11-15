const multer = require("multer"); // permet de télécharger les images des sauces lors de leur création

const MIME_TYPES = {
  "images/jpg": "jpg",
  "images/jpeg": "jpeg",
  "images/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");
