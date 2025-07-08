var express = require("express");
var router = express.Router();

const { authWithTwitch } = require("../controllers/authController");
const { getAllUsers } = require("../controllers/usersController");

// POST users/authtwitch => Authentification avec Twitch
// Données entrées: code (en body) provenant de l'authentification Twitch
// Données de sortie: données du user (champ 'user' avec token (de l'app), username, avatar_url et status)
router.post("/authtwitch", authWithTwitch);

// GET users/all => Récupérer tous les utilisateurs whitelistés
// Données d'entrée: aucune
// Données de sortie: tableau d'objets (champs 'users') avec tous les users whitelistés dans la DB (sans les champs sensibles) + leur nombre (champ 'count')
router.get("/all", getAllUsers);

module.exports = router;
