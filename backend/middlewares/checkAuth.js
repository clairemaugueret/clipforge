const User = require("../models/User");

// MIDDLEWARE: Vérification de l'authentification
const checkAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Vérifier dans les headers (priorité pour les requêtes GET)
    if (req.headers["authorization"]) {
      const authHeader = req.headers["authorization"];
      // Enlever le préfixe "Bearer " s'il existe
      token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader;
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
