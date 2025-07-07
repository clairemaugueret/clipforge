const User = require("../models/users");

const checkAuth = async (req, res, next) => {
  try {
    const token =
      req.body.token || req.headers["authorization"] || req.query.token || null;

    if (!token) {
      return res.status(401).json({ result: false, error: "Token missing" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(403).json({ result: false, error: "Invalid token" });
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
