const mongoose = require("mongoose");

const usersSchema = mongoose.Schema({
  twitch_id: String,
  username: String,
  avatar_url: String,
  token: String, // Token interne à l'app
  twitch_access_token: String, // Token Twitch
  twitch_refresh_token: String, // Refresh token Twitch
  twitch_token_expires_at: Date, // Date d’expiration du token Twitch
  whitelist: {
    type: Boolean,
    default: true,
    // Indique si l'utilisateur est sur la whitelist (dans le cas où on souhaiterait écarter l'accès à certains anciens utilisateurs, sans les supprimer de la DB pour éviter de perdre de l'historique)
    // Un utilisateur non whitelisté ne peut pas accéder à l'application
  },
  status: {
    type: String,
    enum: ["user", "expert"],
    default: "user",
    // Statut de l'utilisateur dans l'application (les experts ont plus de poids pour les votes)
  },
});

const Users = mongoose.model("users", usersSchema);

module.exports = Users;
