var express = require("express");
var router = express.Router();

const {
  getClipInfo,
  createClip,
  getAllClips,
  clipEditingStart,
  clipEditingEnd,
  addNewCommentToClip,
  updateClip,
  clipPublished,
} = require("../controllers/clipsController");
const { checkAuth } = require("../middlewares/checkAuth");

// GET /clips/:id => Récupérer les infos d’un clip
// Données entrées: token de l'app de l'utilisateur (en body) et l'ID du clip (en params)
// Données de sortie: données du clip (champ 'clipData' avec info id, url, embed_url, title, thumbnail_url, etc...) provenant de l'API Twitch
router.get("/:id", checkAuth, getClipInfo);

// POST /clips/new => Créer une proposition de clip
// Données entrées: token de l'app de l'utilisateur, link, subject, tags, editable, text (en body)
// Données de sortie: message "Clip successfully proposed" et données du clip provenant de la DB (champ 'clip')
router.post("/new", checkAuth, createClip);

// GET /clips/all => Récupérer tous les clips
// Données entrées: aucune
// Données de sortie: tableau de tous les clips (champ 'clips') provenant de la DB + leur nombre (champ 'count')
router.get("/all", getAllClips);

// PUT /clips/editstart => Prendre en charge l'édition d'un clip
// Données entrées: token de l'app de l'utilisateur et clipId (en body)
// Données de sortie: message "Clip editing started" + données éditée du clip provenant de la DB (champ 'clip')
router.put("/editstart", checkAuth, clipEditingStart);

// PUT /clips/editend => Marquer la fin l'édition d'un clip
// Données entrées: token de l'app de l'utilisateur et clipId (en body)
// Données de sortie: message "Clip editing ended" + données éditée du clip provenant de la DB (champ 'clip')
router.put("/editstart", checkAuth, clipEditingEnd);

// POST /clips/addcomment => Ajouter un commentaire à un clip
// Données entrées: token de l'app de l'utilisateur, clipId et content (en body)
// Données de sortie: message "Comment added" + données éditée du clip provenant de la DB (champ 'clip')
router.post("/addcomment", checkAuth, addNewCommentToClip);

// PUT /clips/modify => Modifier la proposition d'un clip
// Données entrées: token de l'app de l'utilisateur, link, subject, tags, editable, text (en body)
// Données de sortie: message "Clip successfully modify" et données éditée du clip provenant de la DB (champ 'clip')
router.post("/new", checkAuth, updateClip);

// PUT /clips/updatestatus => Mettre à jour le statut d'un clip après publication
// Données entrées: token de l'app de l'utilisateur, clipId (en body)
// Données de sortie: message "Clip published" + données éditée du clip provenant de la DB (champ 'clip')
router.put("/updatestatus", checkAuth, clipPublished);

module.exports = router;
