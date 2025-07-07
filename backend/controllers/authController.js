const Users = require("../models/users");
const uid2 = require("uid2");
const { checkBody } = require("../modules/checkBody");
const {
  getTwitchOAuthToken,
  getTwitchUser,
  refreshTwitchToken,
} = require("../services/twitchAuth");

// Authentification via Twitch
async function authWithTwitch(req, res) {
  if (!checkBody(req.body, ["code"])) {
    return res.status(400).json({ result: false, error: "Missing code" });
  }

  const { code } = req.body;

  try {
    // Échanger le code contre un access_token chez Twitch
    const tokenResponse = await getTwitchOAuthToken(code);

    const { access_token, refresh_token, expires_in } = tokenResponse;

    // Récupérer les infos de l’utilisateur Twitch
    const twitchUser = await getTwitchUser(access_token);

    // Vérifier si l’utilisateur existe déjà dans la DB
    let user = await Users.findOne({ twitch_id: twitchUser.id });
    let userJustCreated = false;

    if (!user) {
      // Nouveau user : création
      user = new Users({
        twitch_id: twitchUser.id,
        username: twitchUser.display_name,
        avatar_url: twitchUser.profile_image_url,
        token: uid2(32), // Génération d’un token unique
        twitch_access_token: access_token,
        twitch_refresh_token: refresh_token,
        twitch_token_expires_at: new Date(Date.now() + expires_in * 1000),
      });
      userJustCreated = true;
    } else {
      // User existant : MAJ (au cas où Twitch aurait changé les infos)
      user.username = twitchUser.display_name;
      user.avatar_url = twitchUser.profile_image_url;
      user.twitch_access_token = access_token;
      user.twitch_refresh_token = refresh_token;
      user.twitch_token_expires_at = new Date(Date.now() + expires_in * 1000);
    }

    // Sauvegarder en DB
    await user.save();

    // Réponse au frontend avec status 201 (creation) ou 200 (MAJ OK)
    const responsePayload = {
      result: true,
      user: {
        token: user.token,
        username: user.username,
        avatar_url: user.avatar_url,
      },
    };

    if (userJustCreated) {
      res.status(201).json(responsePayload);
    } else {
      res.status(200).json(responsePayload);
    }
  } catch (err) {
    console.error("Erreur auth Twitch:", err.response?.data || err.message);
    res.status(500).json({
      result: false,
      error: "Authentication failed: " + (err.response?.data || err.message),
    });
  }
}

// Vérifier si un token Twitch est valide
async function getValidTwitchToken(appToken) {
  const user = await Users.findOne({ token: appToken });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  if (user.twitch_token_expires_at > now) {
    // Token encore valide
    return user.twitch_access_token;
  }

  // Token expiré : tenter de le rafraîchir
  try {
    console.log("Refreshing Twitch token for user:", user.username);
    const tokenData = await refreshTwitchToken(user.twitch_refresh_token);

    // Mettre à jour les tokens en DB
    user.twitch_access_token = tokenData.access_token;
    user.twitch_refresh_token = tokenData.refresh_token;
    user.twitch_token_expires_at = new Date(
      Date.now() + tokenData.expires_in * 1000
    );
    await user.save();

    return user.twitch_access_token;
  } catch (err) {
    console.error("Failed to refresh Twitch token:", err.message);

    // Si refresh échoue, invalider les tokens Twitch en DB
    user.twitch_access_token = null;
    user.twitch_refresh_token = null;
    user.twitch_token_expires_at = null;
    await user.save();

    // Demander au frontend de refaire une connexion Twitch
    throw new Error(
      "Twitch session expired. Please reconnect your Twitch account."
    );
  }
}

module.exports = { authWithTwitch, getValidTwitchToken };
