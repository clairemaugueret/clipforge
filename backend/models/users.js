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
  },
});

const Users = mongoose.model("users", usersSchema);

module.exports = Users;
