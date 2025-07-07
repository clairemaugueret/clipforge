const mongoose = require("mongoose");

const commentsSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  text: String,
  date: {
    type: Date,
    default: Date.now,
  },
  views: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // L'utilisateur qui a vu le commentaire
    },
  ],
});

const votesSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // L'utilisateur qui a voté
  },
  result: {
    type: String,
    enum: ["OK", "KO", "à revoir"],
  },
});

const clipsSchema = mongoose.Schema({
  link: String, // URL renseignée dans le formulaire
  clip_id: String, // ID du clip pour requêtes API Twitch
  embed_url: String, // URL pour l'intégration vidéo (si jamais un jour on veut avoir la prévisualisation du clip dans l'application)
  image: String, // URL de la miniature du clip
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subject: String,
  tags: [String],
  editable: {
    type: Boolean,
    default: false,
  },
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // L'utilisateur chargé de l'édition
    default: null,
  },
  editProgress: {
    type: String,
    enum: ["en cours", "terminé"],
    default: null,
  },
  status: {
    type: String,
    enum: ["proposé", "prêt à publier", "publié", "écarté"],
    default: "proposé",
  },
  comments: [commentsSchema],
  votes: [votesSchema],
});

const Clips = mongoose.model("clips", clipsSchema);

module.exports = Clips;
