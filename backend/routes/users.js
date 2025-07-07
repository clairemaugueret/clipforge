var express = require("express");
var router = express.Router();

const { authWithTwitch } = require("../controllers/authController");
const { getAllUsers } = require("../controllers/usersController");

// POST users/authtwitch => Authentification avec Twitch
router.post("/authtwitch", authWithTwitch);

// GET users/all => Récupérer tous les utilisateurs whitelistés
router.get("/all", getAllUsers);

module.exports = router;
