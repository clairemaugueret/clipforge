const User = require("../models/User");

// MIDDLEWARE: Vérification de l'authentification
// Utilisé pour protéger les routes nécessitant une authentification
const checkAuth = async (req, res, next) => {
  try {
    // Récupération du token depuis différentes sources
    // Gestion sécurisée pour éviter les erreurs si req.body est undefined
    let token = null;

    // 1. Vérifier dans les headers (priorité pour les requêtes GET)
    if (req.headers["authorization"]) {
      token = req.headers["authorization"];
    }
    // 2. Vérifier dans le body (pour POST/PUT)
    else if (req.body && req.body.token) {
      token = req.body.token;
    }
    // 3. Vérifier dans les query params
    else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ result: false, error: "Token missing" });
    }

    // Recherche de l'utilisateur avec Sequelize
    const user = await User.findOne({ where: { token } });

    if (!user) {
      return res.status(403).json({ result: false, error: "Invalid token" });
    }

    // Vérification whitelist
    if (!user.whitelist) {
      return res
        .status(403)
        .json({ result: false, error: "User not whitelisted" });
    }

    // On attache l'utilisateur et le token à la req
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ result: false, error: "Authentication failed" });
  }
};

module.exports = { checkAuth };
