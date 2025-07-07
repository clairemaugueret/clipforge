const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const redirectUri = process.env.TWITCH_REDIRECT_URI;

// Fonction pour récupérer un OAuth token
async function getTwitchOAuthToken(code) {
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Twitch configuration in environment variables");
  }

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.message || "Failed to exchange code for access token");
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in, // en secondes
  };
}

// Récupérer les infos du user Twitch
async function getTwitchUser(accessToken) {
  if (!clientId || !accessToken) {
    throw new Error("Missing Twitch client ID or access token");
  }

  const response = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": clientId,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.data || data.data.length === 0) {
    throw new Error(data.message || "Failed to fetch Twitch user data");
  }

  return data.data[0];
}

// Rafraîchir un token Twitch expiré
async function refreshTwitchToken(refreshToken) {
  if (!clientId || !clientSecret) {
    throw new Error("Missing Twitch configuration in environment variables");
  }

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.message || "Failed to refresh Twitch access token");
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
}

module.exports = {
  getTwitchOAuthToken,
  getTwitchUser,
  refreshTwitchToken,
};
