const { getValidTwitchToken } = require("../controllers/authController");

async function fetchTwitchClipData(clipId, appToken) {
  try {
    const twitchToken = await getValidTwitchToken(appToken);

    const response = await fetch(
      `https://api.twitch.tv/helix/clips?id=${clipId}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${twitchToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, status: response.status, error: errorData };
    }

    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      return {
        success: false,
        status: 404,
        error: { message: "Clip not found on Twitch" },
      };
    }

    return { success: true, clip: data.data[0] };
  } catch (err) {
    console.error("Error fetching Twitch clip:", err);
    return {
      success: false,
      status: 500,
      error: { message: "Failed to fetch clip data" },
    };
  }
}

async function fetchTwitchClipDownloadUrl(clipId, userAccessToken) {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/clips/download?id=${clipId}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${userAccessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Twitch API Error:", errorData);
      return {
        success: false,
        status: response.status,
        error: errorData,
      };
    }

    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      return {
        success: false,
        status: 404,
        error: { message: "Download URL not found" },
      };
    }

    return {
      success: true,
      downloadData: data.data[0],
    };
  } catch (err) {
    console.error("Error fetching Twitch clip download URL:", err);
    return {
      success: false,
      status: 500,
      error: { message: "Failed to fetch download URL" },
    };
  }
}

module.exports = {
  fetchTwitchClipData,
  fetchTwitchClipDownloadUrl,
};
