const User = require("../models/User");

// CONTROLLER - Récupérer tous les utilisateurs whitelistés
async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      where: { whitelist: true }, // Filtrer uniquement les whitelistés
      attributes: {
        exclude: [
          "token",
          "twitch_access_token",
          "twitch_refresh_token",
          "twitch_token_expires_at",
        ], // Exclure les champs sensibles
      },
    });

    if (!users || users.length === 0) {
      return res.status(404).json({
        result: false,
        error: "No users found",
      });
    }

    res.status(200).json({
      result: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({
      result: false,
      error: "Internal server error",
    });
  }
}

module.exports = { getAllUsers };
