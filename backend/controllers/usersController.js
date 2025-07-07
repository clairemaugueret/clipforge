const Users = require("../models/users");

// CONTROLLER - Récupérer tous les utilisateurs whitelistés
async function getAllUsers(req, res) {
  try {
    const users = await Users.find(
      { whitelist: true }, // Filtrer uniquement les whitelistés
      {
        __v: 0,
        token: 0,
        twitch_id: 0,
        twitch_access_token: 0,
        twitch_refresh_token: 0,
        twitch_token_expires_at: 0,
      } // Exclure les champs sensibles (token, twitch_id, etc..) et version du doc
    );

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
