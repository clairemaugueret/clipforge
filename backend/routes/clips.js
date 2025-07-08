var express = require("express");
var router = express.Router();

const {
  getClipInfo,
  createClip,
  getAllClips,
  updateClip,
  clipPublished,
  addVoteToClip,
} = require("../controllers/clipsController");
const {
  clipEditingStart,
  clipEditingEnd,
} = require("../controllers/editingController");
const {
  addNewCommentToClip,
  addNewViewToAllComments,
} = require("../controllers/commentsController");
const { checkAuth } = require("../middlewares/checkAuth");

// GET /clips/all => Récupérer tous les clips
router.get("/all", getAllClips);
// Données entrée: aucune
// Données de sortie: clips (tableau de tous les clips provenant de la DB) + count (nombre de clips dans la DB)

// GET /clips/:id => Récupérer les infos d’un clip
router.get("/:id", checkAuth, getClipInfo);
// Données entrée: req.body.token (token de l'app) req.params.id (id du clip Twitch)
// Données de sortie: clipData (données du clip avec info id, url, embed_url, title, thumbnail_url, etc. provenant de l'API Twitch)

// POST /clips/new => Créer une proposition de clip
router.post("/new", checkAuth, createClip);
// Données entrée: req.body.token (token de l'app), req.body.link, req.body.subject, req.body.tags, req.body.editable, req.body.text
// Données de sortie: clip (données du clip provenant de la DB) + message ("Clip successfully proposed")

// PUT /clips/editstart => Prendre en charge l'édition d'un clip
router.put("/editstart", checkAuth, clipEditingStart);
// Données entrée: req.body.token (token de l'app), req.body.clipId (id du clip Twitch)
// Données de sortie: clip (données éditées du clip provenant de la DB) + message ("Clip editing started")

// PUT /clips/editend => Marquer la fin l'édition d'un clip
router.put("/editend", checkAuth, clipEditingEnd);
// Données entrée: req.body.token (token de l'app), req.body.clipId (id du clip Twitch)
// Données de sortie: clip (données éditées du clip provenant de la DB) + message ("Clip editing ended")

// POST /clips/addcomment => Ajouter un commentaire à un clip
router.post("/addcomment", checkAuth, addNewCommentToClip);
// Données entrée: req.body.token (token de l'app), req.body.clipId (id du clip Twitch), req.body.text (commentaire)
// Données de sortie: clip (données éditées du clip provenant de la DB) + message ("Comment added")

// PUT /clips/update => Modifier la proposition d'un clip
router.put("/update", checkAuth, updateClip);
// Données entrée: req.body.token (token de l'app), req.body.link, req.body.subject, req.body.tags, req.body.editable, req.body.text
// Données de sortie: clip (données éditées du clip provenant de la DB) + message ("Clip successfully updated")

// PUT /clips/updatestatus => Mettre à jour le statut d'un clip après publication
router.put("/statusupdate", checkAuth, clipPublished);
// Données entrée: req.body.token (token de l'app), req.body.clipId (id du clip Twitch)
// Données de sortie: clip (données éditées du clip provenant de la DB) + message ("Clip pusblished")

// PUT clips/viewcomments => Mettre à jour le statut de vue des commentaires d'un clip
router.put("/viewcomments", checkAuth, addNewViewToAllComments);
// Données entrée: req.body.token (token de l'app), req.body.clipId (id du clip Twitch)
// Données de sortie: clip (données éditées du clip provenant de la DB) + message ("All comments from this clip viewed by the user")

// PUT clips/vote => Ajouter un vote à un clip et mise à jour du statut, si appicable
router.put("/vote", checkAuth, addVoteToClip);
// Données entrée: req.body.token (token de l'app), req.body.clipId (id du clip Twitch), req.body.vote (vote du user)
// Données de sortie: clip (données éditées du clip provenant de la DB) + message ("Vote successfully saved")

module.exports = router;
