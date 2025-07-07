var express = require("express");
var router = express.Router();

const { getClipInfo, createClip } = require("../controllers/clipsController");
const { checkAuth } = require("../middlewares/checkAuth");

// GET /clips/:id => Récupérer les infos d’un clip
router.get("/:id", checkAuth, getClipInfo);

// POST /clips/new => Créer une proposition de clip
router.post("/new", checkAuth, createClip);

module.exports = router;
